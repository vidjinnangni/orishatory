import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

// Même résolution que lib/data.ts : depuis la racine du paquet `web/`, pas
// depuis import.meta.url (le bundling déplace le module).
const DATA_DIR = resolve(process.cwd(), "..", "data");
const DOSSIERS_DIR = resolve(process.cwd(), "..", "dossiers");

/** id de fiche -> URL de sa page, déduite de l'arborescence data/<region>/<categorie>/<id>.json. */
function scanFiches() {
  const hrefs = new Map();
  for (const region of readdirSync(DATA_DIR, { withFileTypes: true })) {
    if (!region.isDirectory()) continue;
    for (const categorie of readdirSync(resolve(DATA_DIR, region.name), { withFileTypes: true })) {
      if (!categorie.isDirectory()) continue;
      for (const file of readdirSync(resolve(DATA_DIR, region.name, categorie.name))) {
        if (!file.endsWith(".json")) continue;
        const id = file.slice(0, -".json".length);
        hrefs.set(id, `/${region.name}/${categorie.name}/${id}/`);
      }
    }
  }
  return hrefs;
}

/** slugs des dossiers existants (dossiers/<slug>.md). */
function scanDossiers() {
  if (!existsSync(DOSSIERS_DIR)) return new Set();
  return new Set(readdirSync(DOSSIERS_DIR).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -".md".length)));
}

/**
 * Plugin mdast (Sätteri) : dans un dossier, `[Shango](fiche:shango)` devient un
 * lien vers la page de la fiche, et `[le dossier Shango](dossier:<slug>)` un lien
 * vers un autre dossier. Un id ou un slug inconnu fait échouer le build plutôt que
 * de publier un lien cassé ; scripts/validate.py applique la même règle en CI.
 */
export function ficheLinks() {
  const hrefs = scanFiches();
  const dossiers = scanDossiers();
  return {
    name: "orishatory-fiche-links",
    link(node, ctx) {
      if (node.url.startsWith("dossier:")) {
        const slug = node.url.slice("dossier:".length);
        if (!dossiers.has(slug)) {
          throw new Error(`Lien dossier:${slug} dans ${ctx.fileURL ?? "un dossier"} : aucun dossier n'a ce nom.`);
        }
        ctx.setProperty(node, "url", `/dossiers/${slug}/`);
        return;
      }
      if (!node.url.startsWith("fiche:")) return;
      const id = node.url.slice("fiche:".length);
      const href = hrefs.get(id);
      if (!href) {
        throw new Error(`Lien fiche:${id} dans ${ctx.fileURL ?? "un dossier"} : aucune fiche n'a cet id.`);
      }
      ctx.setProperty(node, "url", href);
    },
  };
}
