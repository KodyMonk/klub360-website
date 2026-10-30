// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Copies the photos downloaded during the build (see src/lib/data.ts)
// into dist/media so Cloudflare serves them.
const mirrorMedia = {
  name: 'klub360-mirror-media',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const src = path.join(process.cwd(), 'node_modules', '.klub360-media');
      const dest = path.join(fileURLToPath(dir), 'media');
      try {
        await fs.cp(src, dest, { recursive: true });
        const files = await fs.readdir(dest);
        console.log(`[klub360] Copied ${files.length} images into /media`);
      } catch (err) {
        if (err && err.code !== 'ENOENT') throw err;
      }
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://klub360bh.com',
  integrations: [react(), mirrorMedia],
  // Pages are built as folders (/about/index.html), so URLs end in a slash
  // exactly like the current WordPress site: /about/, /events/, /table/ …
  build: { format: 'directory' },
  trailingSlash: 'ignore',
});
