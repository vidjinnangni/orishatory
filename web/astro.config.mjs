// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // À remplacer par le domaine personnalisé le jour où il est configuré.
  site: 'https://orishatory.vercel.app',
  integrations: [sitemap()],
});
