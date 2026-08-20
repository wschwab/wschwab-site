import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://wschwab.xyz',
  // /next/ is the staged redesign: public but unadvertised until the flip.
  integrations: [sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/next/') })],
});
