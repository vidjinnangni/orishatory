import type { ImageMetadata } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { REPO_URL, getEntityById, type Entite } from "./data";

export type Dossier = CollectionEntry<"dossiers">;

// [texte](fiche:<id>) dans le corps Markdown ; même motif que scripts/validate.py.
const FICHE_LINK = /\]\(\s*fiche:([^)\s]*)\s*\)/g;

// ![alt](images/<slug>/x.jpg "Légende") dans le corps ; même motif que scripts/validate.py.
const IMAGE_REF = /!\[[^\]]*\]\(\s*<?([^)\s>]+)>?/g;

// Images des dossiers (dossiers/images/<slug>/<fichier>), optimisées par Astro.
const IMAGES = import.meta.glob<ImageMetadata>("../../../dossiers/images/*/*.{jpg,jpeg,png,webp,avif,svg}", {
  eager: true,
  import: "default",
});

function imageKey(slug: string, fichier: string): string {
  return `../../../dossiers/images/${slug}/${fichier}`;
}

let cache: Promise<Dossier[]> | undefined;

async function loadDossiers(): Promise<Dossier[]> {
  const dossiers = await getCollection("dossiers");
  for (const dossier of dossiers) {
    for (const id of dossier.data.fiches) {
      if (!getEntityById(id)) {
        throw new Error(`Dossier « ${dossier.id} » : la fiche '${id}' (champ 'fiches') n'existe pas.`);
      }
    }
    // Le plugin de liens ne fait que journaliser son erreur : ce contrôle-ci
    // garantit qu'un lien cassé fait échouer le build au lieu d'être publié.
    for (const [, id] of (dossier.body ?? "").matchAll(FICHE_LINK)) {
      if (!getEntityById(id)) {
        throw new Error(`Dossier « ${dossier.id} » : le lien fiche:${id} du texte ne correspond à aucune fiche.`);
      }
      if (!dossier.data.fiches.includes(id)) {
        throw new Error(`Dossier « ${dossier.id} » : le lien fiche:${id} du texte doit aussi figurer dans 'fiches'.`);
      }
    }
    // Images : déclarées dans 'images' (crédit, licence, source) et présentes sur le disque.
    const declared = new Set((dossier.data.images ?? []).map((image) => image.fichier));
    for (const fichier of declared) {
      if (!IMAGES[imageKey(dossier.id, fichier)]) {
        throw new Error(`Dossier « ${dossier.id} » : l'image '${fichier}' est introuvable dans dossiers/images/${dossier.id}/.`);
      }
    }
    const couverture = dossier.data.couverture?.fichier;
    if (couverture && !declared.has(couverture)) {
      throw new Error(`Dossier « ${dossier.id} » : la couverture '${couverture}' doit être déclarée dans 'images'.`);
    }
    const used = new Set(couverture ? [couverture] : []);
    for (const [, url] of (dossier.body ?? "").matchAll(IMAGE_REF)) {
      const prefix = `images/${dossier.id}/`;
      const path = url.replace(/^\.\//, "");
      const fichier = path.slice(prefix.length);
      used.add(fichier);
      if (!path.startsWith(prefix) || fichier.includes("/") || !declared.has(fichier)) {
        throw new Error(`Dossier « ${dossier.id} » : l'image ${url} doit être dans images/${dossier.id}/ et déclarée dans 'images'.`);
      }
    }
    for (const fichier of declared) {
      if (!used.has(fichier)) {
        throw new Error(`Dossier « ${dossier.id} » : l'image '${fichier}' est déclarée dans 'images' mais n'est utilisée ni dans le texte ni en couverture.`);
      }
    }
  }
  return dossiers.sort((a, b) => a.data.titre.localeCompare(b.data.titre, "fr"));
}

/** Tous les dossiers, triés par titre ; vérifiés une seule fois par build (ids de fiches existants). */
export function getAllDossiers(): Promise<Dossier[]> {
  cache ??= loadDossiers();
  return cache;
}

export function dossierHref(dossier: Pick<Dossier, "id">): string {
  return `/dossiers/${dossier.id}/`;
}

/** Lien vers l'éditeur GitHub du fichier Markdown du dossier. */
export function dossierEditUrl(dossier: Pick<Dossier, "id">): string {
  return `${REPO_URL}/edit/main/dossiers/${dossier.id}.md`;
}

/** Fiches d'un dossier, dans l'ordre du champ 'fiches'. */
export function getDossierEntities(dossier: Dossier): Entite[] {
  return dossier.data.fiches.map((id) => getEntityById(id)).filter((e): e is Entite => e !== undefined);
}

export async function getDossiersForEntity(entityId: string): Promise<Dossier[]> {
  return (await getAllDossiers()).filter((d) => d.data.fiches.includes(entityId));
}

/** Image de couverture d'un dossier (optimisable avec <Image />), ou undefined. */
export function getDossierCover(dossier: Dossier): { src: ImageMetadata; alt: string } | undefined {
  const couverture = dossier.data.couverture;
  if (!couverture) return undefined;
  const src = IMAGES[imageKey(dossier.id, couverture.fichier)];
  return src ? { src, alt: couverture.alt } : undefined;
}
