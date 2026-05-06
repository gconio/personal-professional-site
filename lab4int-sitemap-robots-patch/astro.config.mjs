import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://giovanni.conio.lab4int.com',
  integrations: [sitemap()]
});
