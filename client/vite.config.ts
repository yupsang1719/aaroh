/// <reference types="vitest/config" />
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Preloads the Latin body and display fonts so they arrive alongside the JavaScript. Without
 * this, text first renders in the fallback font and reflows when the web font loads (layout shift).
 */
function preloadFonts(): Plugin {
  return {
    name: 'aaroh-preload-fonts',
    apply: 'build',
    transformIndexHtml(_html, ctx) {
      const fonts = Object.keys(ctx.bundle ?? {}).filter((file) =>
        /\/inter(-tight)?-latin-wght-normal-[\w-]+\.woff2$/.test(file),
      );
      return fonts.map((file) => ({
        tag: 'link',
        attrs: {
          rel: 'preload',
          href: `/${file}`,
          as: 'font',
          type: 'font/woff2',
          crossorigin: '',
        },
        injectTo: 'head-prepend',
      }));
    },
  };
}

// <Logo /> uses the SVG when this file exists, otherwise the text wordmark.
// Checked at build time (and when the dev server starts), so adding a logo needs a rebuild.
const hasLogo = existsSync(fileURLToPath(new URL('./public/brand/logo.svg', import.meta.url)));

export default defineConfig({
  plugins: [react(), preloadFonts()],
  define: {
    __HAS_LOGO__: JSON.stringify(hasLogo),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/media': 'http://localhost:4000',
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
