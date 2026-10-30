import { Router } from 'express';
import { STATIC_PAGE_PATHS } from '@aaroh/shared';
import type { ContentProvider } from '../content';

/** sitemap.xml (static pages + published releases) and robots.txt. */
export function seoFilesRouter(content: ContentProvider, siteUrl: string) {
  const router = Router();

  router.get('/sitemap.xml', async (_req, res) => {
    const releases = await content.listReleases();
    const urls = [
      ...Object.values(STATIC_PAGE_PATHS).map((path) => ({
        loc: `${siteUrl}${path === '/' ? '/' : path}`,
      })),
      ...releases.map((r) => ({ loc: `${siteUrl}/work/${r.slug}`, lastmod: r.releaseDate })),
    ];
    const body = urls
      .map(
        (u) =>
          `  <url><loc>${u.loc}</loc>${'lastmod' in u ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
      )
      .join('\n');
    res
      .type('application/xml')
      .set('Cache-Control', 'public, max-age=3600')
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
      );
  });

  router.get('/robots.txt', (_req, res) => {
    res
      .type('text/plain')
      .set('Cache-Control', 'public, max-age=3600')
      .send(`User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
  });

  return router;
}
