import { readdirSync } from "node:fs";
import { resolve } from "node:path";

// Même résolution que lib/data.ts : depuis la racine du paquet `web/`, pas
// depuis import.meta.url (le bundling déplace le module).
const DATA_DIR = resolve(process.cwd(), "..", "data");

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

/**
 * Plugin mdast (Sätteri) : dans un dossier, `[Shango](fiche:shango)` devient un
 * lien vers la page de la fiche. Un id inconnu fait échouer le build plutôt que
 * de publier un lien cassé ; scripts/validate.py applique la même règle en CI.
 */
export function ficheLinks() {
  const hrefs = scanFiches();
  return {
    name: "orishatory-fiche-links",
    link(node, ctx) {
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
