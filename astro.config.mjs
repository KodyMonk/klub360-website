// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://klub360bh.com',
  integrations: [react()],
  // Pages are built as folders (/about/index.html), so URLs end in a slash
  // exactly like the current WordPress site: /about/, /events/, /table/ …
  build: { format: 'directory' },
  trailingSlash: 'ignore',
});
