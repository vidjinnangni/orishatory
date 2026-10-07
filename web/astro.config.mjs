// @ts-check
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { ficheLinks } from './src/lib/fiche-links.mjs';

// La page /dossiers/ est volontairement vide (noindex) tant qu'aucun dossier
// n'existe : on la garde aussi hors du sitemap.
const dossiersDir = fileURLToPath(new URL('../dossiers', import.meta.url));
const hasDossiers = existsSync(dossiersDir) && readdirSync(dossiersDir).some((f) => f.endsWith('.md'));

// https://astro.build/config
export default defineConfig({
  site: 'https://orishatory.com',
  markdown: {
    processor: satteri({
      // [texte](fiche:<id>) -> lien vers la fiche (voir src/lib/fiche-links.mjs).
      mdastPlugins: [ficheLinks()],
      features: {
        gfm: { footnotes: { label: 'Notes', backLabel: 'Retour au texte {reference}' } },
        // Les guillemets français « » et l'apostrophe ’ se tapent tels quels :
        // pas de conversion automatique à l'anglaise.
        smartPunctuation: false,
      },
    }),
  },
  integrations: [
    sitemap({
      // Redirecteur "fiche au hasard" : pas de contenu propre, exclu au
      // même titre que son <meta name="robots" content="noindex">.
      filter: (page) => !page.includes('/explorer/') && (hasDossiers || !page.endsWith('/dossiers/')),
    }),
  ],
});
