import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Release } from '@aaroh/shared';
import type { ContentProvider } from '../src/content';
import { makeApp as makeBaseApp, makeContentDir, sampleReleases, sampleSettings } from './helpers';

/** A minimal stand-in for client/dist. */
function fakeClientDir() {
  const dir = mkdtempSync(path.join(tmpdir(), 'aaroh-client-'));
  mkdirSync(path.join(dir, 'assets'));
  writeFileSync(
    path.join(dir, 'index.html'),
    '<!doctype html><html lang="en-GB"><head><!--app-head--></head><body><div id="root"></div></body></html>',
  );
  writeFileSync(path.join(dir, 'assets', 'app-abc123.js'), 'console.log(1)');
  mkdirSync(path.join(dir, '.vite'));
  writeFileSync(
    path.join(dir, '.vite', 'manifest.json'),
    JSON.stringify({
      'index.html': { file: 'assets/index-1.js', isEntry: true },
      'src/pages/WorkDetail.tsx': {
        file: 'assets/WorkDetail-2.js',
        imports: ['_Seo.js', 'index.html'],
      },
      '_Seo.js': { file: 'assets/Seo-3.js', imports: ['index.html'] },
    }),
  );
  return dir;
}

const clientDir = fakeClientDir();
const base = sampleReleases[0]!;
const seedSettings = sampleSettings;
const contentDir = makeContentDir(sampleSettings, [
  { ...base, slug: 'first-light', published: true, order: 1 },
  { ...base, slug: 'secret', title: 'Secret', published: false },
]);
const makeApp = (deps: Parameters<typeof makeBaseApp>[0] = {}) =>
  makeBaseApp({ contentDir, ...deps });
const ldJson = (html: string) =>
  [...html.matchAll(/<script data-server-meta type="application\/ld\+json">(.*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1]!),
  );

describe('server-rendered meta for link previews', () => {
  it('writes release title, description, canonical, image and JSON-LD into the HTML', async () => {
    const res = await request(makeApp({ clientDir })).get('/work/first-light');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.headers['cache-control']).toBe('no-cache');

    const html = res.text;
    const title = `${base.title} — ${base.artist} — Aaroh`;
    expect(html).toContain(`<title data-server-meta>${title}</title>`);
    expect(html).toContain(`property="og:title" content="${title}"`);
    expect(html).toContain(`name="description" content="${base.summary}"`);
    expect(html).toContain('rel="canonical" href="https://aaroh.co.uk/work/first-light"');
    expect(html).toContain('property="og:url" content="https://aaroh.co.uk/work/first-light"');
    expect(html).toContain(
      `property="og:image" content="https://aaroh.co.uk${base.coverImage.url}"`,
    );
    expect(html).toContain('property="og:type" content="video.other"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).not.toContain('<!--app-head-->');

    const [org, release] = ldJson(html);
    expect(org['@type']).toBe('Organization');
    expect(org.url).toBe('https://aaroh.co.uk/');
    const types = release['@graph'].map((n: { '@type': string }) => n['@type']);
    expect(types).toEqual(['MusicRecording', 'VideoObject']);
    expect(release['@graph'][1].uploadDate).toBe(base.releaseDate);
  });

  it('embeds the page data so the client renders without fetching', async () => {
    const initialData = (html: string) =>
      JSON.parse(
        /<script data-server-meta type="application\/json" id="initial-data">(.*?)<\/script>/.exec(
          html,
        )![1]!,
      );

    const release = initialData(
      (await request(makeApp({ clientDir })).get('/work/first-light')).text,
    );
    expect(Object.keys(release).sort()).toEqual(['release:first-light', 'settings']);
    expect(release['release:first-light']).toMatchObject({
      slug: 'first-light',
      previous: null,
      next: null,
    });

    const home = initialData((await request(makeApp({ clientDir })).get('/')).text);
    expect(Object.keys(home).sort()).toEqual(['releases', 'settings']);
    expect(home.releases.map((r: { slug: string }) => r.slug)).toEqual(['first-light']);

    const missing = initialData((await request(makeApp({ clientDir })).get('/nope')).text);
    expect(Object.keys(missing)).toEqual(['settings']);
  });

  it("preloads the page's code and its hero image", async () => {
    const html = (await request(makeApp({ clientDir })).get('/work/first-light')).text;
    expect(html).toContain('<link rel="modulepreload" crossorigin href="/assets/WorkDetail-2.js">');
    expect(html).toContain('<link rel="modulepreload" crossorigin href="/assets/Seo-3.js">');
    expect(html).not.toContain('href="/assets/index-1.js"'); // the entry is loaded by index.html
    expect(html).toContain(
      `<link rel="preload" as="image" fetchpriority="high" href="${base.coverImage.url}">`,
    );
  });

  it('does not expose the build manifest', async () => {
    const res = await request(makeApp({ clientDir })).get('/.vite/manifest.json');
    expect(res.headers['content-type']).toMatch(/html/);
  });

  it('uses the tagline and default share image on the home page', async () => {
    const res = await request(makeApp({ clientDir })).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<title data-server-meta>Aaroh</title>');
    expect(res.text).toContain(`name="description" content="${seedSettings.tagline}"`);
    expect(res.text).toContain('content="https://aaroh.co.uk/brand/og-default.png"');
    expect(ldJson(res.text)).toHaveLength(1);
  });

  it('treats a trailing slash as the same page', async () => {
    const res = await request(makeApp({ clientDir })).get('/about/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<title data-server-meta>About — Aaroh</title>');
  });

  it('returns 404 + noindex (and no canonical) for unknown pages and unpublished releases', async () => {
    for (const url of ['/nope', '/work/secret', '/work/does-not-exist', '/work/%E0', '/work/a/b']) {
      const res = await request(makeApp({ clientDir })).get(url);
      expect(res.status, url).toBe(404);
      expect(res.text, url).toContain('name="robots" content="noindex"');
      expect(res.text, url).not.toContain('rel="canonical"');
    }
  });

  it('escapes content so it cannot break out of attributes or script tags', async () => {
    const nasty: Release = {
      ...base,
      slug: 'nasty',
      title: '"><script>alert(1)</script>',
      summary: 'A </script><script>alert(2)</script> summary & more',
    };
    const content: ContentProvider = {
      getSettings: async () => seedSettings,
      listReleases: async () => [nasty],
      getReleaseBySlug: async (slug) => (slug === 'nasty' ? nasty : null),
    };
    const res = await request(makeApp({ clientDir, content })).get('/work/nasty');
    expect(res.text).not.toContain('<script>alert');
    expect(res.text).toContain('&quot;&gt;&lt;script&gt;');
    expect(res.text).toContain('\\u003c/script>');
    // The JSON-LD is still valid JSON with the original text.
    expect(ldJson(res.text)[1]['@graph'][0].name).toBe(nasty.title);
  });

  it('serves hashed assets with a long immutable cache', async () => {
    const res = await request(makeApp({ clientDir })).get('/assets/app-abc123.js');
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toContain('immutable');
  });

  it('keeps unknown /api routes as JSON 404s, not the HTML page', async () => {
    const res = await request(makeApp({ clientDir })).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('does not serve the site when no client build is configured (development)', async () => {
    const res = await request(makeApp()).get('/work/first-light');
    expect(res.status).toBe(404);
  });
});

describe('sitemap.xml and robots.txt', () => {
  it('lists static pages and published releases only', async () => {
    const res = await request(makeApp()).get('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/xml/);
    for (const path of [
      '/',
      '/work',
      '/process',
      '/about',
      '/contact',
      '/privacy',
      '/legal',
      '/work/first-light',
    ]) {
      expect(res.text).toContain(`<loc>https://aaroh.co.uk${path}</loc>`);
    }
    expect(res.text).toContain(`<lastmod>${base.releaseDate}</lastmod>`);
    expect(res.text).not.toContain('secret');
  });

  it('robots.txt allows crawling and points to the sitemap', async () => {
    const res = await request(makeApp()).get('/robots.txt');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Allow: /');
    expect(res.text).toContain('Sitemap: https://aaroh.co.uk/sitemap.xml');
  });
});

describe('www redirect', () => {
  it('sends www.aaroh.co.uk permanently to the canonical host, keeping the path', async () => {
    const res = await request(makeApp())
      .get('/work/first-light?ref=x')
      .set('Host', 'www.aaroh.co.uk');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('https://aaroh.co.uk/work/first-light?ref=x');
  });

  it('leaves the canonical host alone', async () => {
    const res = await request(makeApp()).get('/api/health').set('Host', 'aaroh.co.uk');
    expect(res.status).toBe(200);
  });
});
