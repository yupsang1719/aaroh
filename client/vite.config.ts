/// <reference types="vitest/config" />
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// <Logo /> uses the SVG when this file exists, otherwise the text wordmark.
// Checked at build time (and when the dev server starts), so adding a logo needs a rebuild.
const hasLogo = existsSync(fileURLToPath(new URL('./public/brand/logo.svg', import.meta.url)));

export default defineConfig({
  plugins: [react()],
  define: {
    __HAS_LOGO__: JSON.stringify(hasLogo),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/sitemap.xml': 'http://localhost:4000',
      '/robots.txt': 'http://localhost:4000',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // The server reads .vite/manifest.json to preload each page's code (server/src/seo).
    manifest: true,
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
