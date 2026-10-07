import { getCollection, type CollectionEntry } from "astro:content";
import { REPO_URL, getEntityById, type Entite } from "./data";

export type Dossier = CollectionEntry<"dossiers">;

// [texte](fiche:<id>) dans le corps Markdown ; même motif que scripts/validate.py.
const FICHE_LINK = /\]\(\s*fiche:([^)\s]*)\s*\)/g;

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
