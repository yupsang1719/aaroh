import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import express, { Router } from 'express';
import type { ContentProvider } from '../content';
import { resolvePage, type PageView, type ResolvedPage } from './pageMeta';
import { escapeHtml, renderHead } from './renderHead';

const HEAD_MARKER = '<!--app-head-->';

// Source module of each client page (see client/src/App.tsx). Used with Vite's build manifest
// to preload the page's code alongside the main bundle instead of after it.
const VIEW_MODULES: Record<PageView, string> = {
  home: 'src/pages/Home.tsx',
  work: 'src/pages/Work.tsx',
  release: 'src/pages/WorkDetail.tsx',
  process: 'src/pages/Process.tsx',
  about: 'src/pages/About.tsx',
  contact: 'src/pages/Contact.tsx',
  notFound: 'src/pages/NotFound.tsx',
};

type Manifest = Record<string, { file: string; imports?: string[]; isEntry?: boolean }>;

function readManifest(clientDir: string): Manifest {
  const file = path.join(clientDir, '.vite', 'manifest.json');
  return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as Manifest) : {};
}

/** JS files a page needs beyond the main entry (which index.html already loads). */
function pageModules(manifest: Manifest, view: PageView): string[] {
  const files = new Set<string>();
  const visit = (key: string) => {
    const chunk = manifest[key];
    if (!chunk || chunk.isEntry || files.has(chunk.file)) return;
    files.add(chunk.file);
    chunk.imports?.forEach(visit);
  };
  visit(VIEW_MODULES[view]);
  return [...files];
}

function preloadLinks(manifest: Manifest, page: ResolvedPage, template: string): string {
  const links = pageModules(manifest, page.view)
    // Chunks shared with the main bundle are already preloaded by index.html.
    .filter((file) => !template.includes(`/${file}"`))
    .map((file) => `<link rel="modulepreload" crossorigin href="/${file}">`);
  if (page.preloadImage) {
    const href = escapeHtml(page.preloadImage);
    links.push(`<link rel="preload" as="image" fetchpriority="high" href="${href}">`);
  }
  return links.join('\n    ');
}

/**
 * Serves the built React app (client/dist). Every page request gets index.html with
 * real meta for that URL injected, so link previews and crawlers work without JavaScript.
 */
export function serveClient(clientDir: string, content: ContentProvider, siteUrl: string) {
  const indexPath = path.join(clientDir, 'index.html');
  if (!existsSync(indexPath)) {
    throw new Error(`Built client not found at ${indexPath}. Run "npm run build" first.`);
  }
  const template = readFileSync(indexPath, 'utf8');
  if (!template.includes(HEAD_MARKER)) {
    throw new Error(`${indexPath} is missing the ${HEAD_MARKER} marker.`);
  }

  const manifest = readManifest(clientDir);
  const router = Router();

  // Hashed build files never change: cache for a year. Everything else briefly.
  router.use(
    '/assets',
    express.static(path.join(clientDir, 'assets'), { immutable: true, maxAge: '1y', index: false }),
  );
  router.use(express.static(clientDir, { maxAge: '1h', index: false }));

  router.get(/.*/, async (req, res) => {
    const page = await resolvePage(req.path, content, siteUrl);
    const head = `${renderHead(page, req.path, siteUrl)}\n    ${preloadLinks(manifest, page, template)}`;
    const html = template.replace(HEAD_MARKER, head);
    res.status(page.status).set('Cache-Control', 'no-cache').type('html').send(html);
  });

  return router;
}
