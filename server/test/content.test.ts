import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Release, ReleaseSummary } from '@aaroh/shared';
import type { ContentProvider } from '../src/content';
import { JsonContentProvider } from '../src/content/JsonContentProvider';
import { findPlaceholders } from '../src/content/placeholders';
import { makeApp, makeContentDir, sampleReleases, sampleSettings } from './helpers';

const base = sampleReleases[0]!;
const fixtures = [
  { ...base, slug: 'second', title: 'Second', order: 2, published: true },
  { ...base, slug: 'hidden', title: 'Hidden', order: 0, published: false },
  { ...base, slug: 'first', title: 'First', order: 1, published: true },
  {
    ...base,
    slug: 'third-newer',
    title: 'Third newer',
    order: 3,
    releaseDate: '2026-10-01',
    published: true,
  },
  {
    ...base,
    slug: 'third-older',
    title: 'Third older',
    order: 3,
    releaseDate: '2026-01-01',
    published: true,
  },
];

describe('content API (JSON files)', () => {
  const contentDir = makeContentDir(sampleSettings, fixtures);

  it('GET /api/settings returns settings.json', async () => {
    const res = await request(makeApp({ contentDir })).get('/api/settings');
    expect(res.status).toBe(200);
    expect(res.body.companyName).toBe('Aaroh');
    expect(res.body.legal.registeredIn).toBe('England and Wales');
    expect(res.body).not.toHaveProperty('_comment');
  });

  it('GET /api/releases lists published releases only, in order', async () => {
    const res = await request(makeApp({ contentDir })).get('/api/releases');
    expect(res.status).toBe(200);
    expect(res.body.map((r: ReleaseSummary) => r.slug)).toEqual([
      'first',
      'second',
      'third-newer',
      'third-older',
    ]);
    expect(res.body[0]).not.toHaveProperty('story');
  });

  it('GET /api/releases is an empty list when nothing is released yet', async () => {
    const res = await request(makeApp({ contentDir: makeContentDir(sampleSettings, []) })).get(
      '/api/releases',
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('GET /api/releases/:slug returns the release with previous/next links', async () => {
    const res = await request(makeApp({ contentDir })).get('/api/releases/second');
    expect(res.status).toBe(200);
    expect(res.body.previous).toEqual({ slug: 'first', title: 'First' });
    expect(res.body.next).toEqual({ slug: 'third-newer', title: 'Third newer' });
  });

  it('GET /api/releases/:slug is 404 for unpublished, unknown and malformed slugs', async () => {
    for (const slug of ['hidden', 'does-not-exist', 'Bad_Slug', '..%2Fetc']) {
      const res = await request(makeApp({ contentDir })).get(`/api/releases/${slug}`);
      expect(res.status, slug).toBe(404);
    }
  });

  it('skips an invalid release instead of breaking the site', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const dir = makeContentDir(sampleSettings, [{ ...base, youtubeId: 'nope' }, fixtures[0]]);
    const res = await request(makeApp({ contentDir: dir })).get('/api/releases');
    expect(res.body.map((r: ReleaseSummary) => r.slug)).toEqual(['second']);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('rejects duplicate slugs and invalid settings with a clear error', async () => {
    const dupes = new JsonContentProvider(
      makeContentDir(sampleSettings, [fixtures[0], fixtures[0]]),
      {
        cache: false,
      },
    );
    await expect(dupes.listReleases()).rejects.toThrow(/duplicate slug "second"/);

    const badSettings = new JsonContentProvider(makeContentDir({ tagline: 'x' }, []), {
      cache: false,
    });
    await expect(badSettings.getSettings()).rejects.toThrow();
  });

  it('serves content media at /media', async () => {
    const ok = await request(makeApp({ contentDir })).get('/media/still.jpg');
    expect(ok.status).toBe(200);
    expect(ok.headers['cache-control']).toContain('max-age=86400');
    const missing = await request(makeApp({ contentDir })).get('/media/nope.jpg');
    expect(missing.status).toBe(404);
  });

  it('the shipped sample content validates', async () => {
    const res = await request(makeApp()).get('/api/releases');
    expect(res.body).toHaveLength(sampleReleases.length);
  });
});

describe('placeholder check', () => {
  it('finds PLACEHOLDER values but ignores _comment notes', async () => {
    const dir = makeContentDir(
      {
        _comment: 'PLACEHOLDER in a note is fine',
        tagline: 'PLACEHOLDER',
        legal: { companyNumber: 'PLACEHOLDER' },
      },
      [{ title: 'Real', credits: [{ name: 'PLACEHOLDER Name' }] }],
    );
    expect((await findPlaceholders(dir)).sort()).toEqual([
      'releases.json › [0].credits[0].name',
      'settings.json › legal.companyNumber',
      'settings.json › tagline',
    ]);
  });

  it('the live content folder has no invalid JSON (placeholders are expected until filled in)', async () => {
    const live = new JsonContentProvider(new URL('../content', import.meta.url).pathname, {
      cache: false,
    });
    // Launching email-only: the contact form stays off until email sending is set up.
    await expect(live.getSettings()).resolves.toMatchObject({ contactFormEnabled: false });
    await expect(live.listReleases()).resolves.toEqual([]);
  });
});

describe('content API with a different ContentProvider', () => {
  it('works with any implementation of the interface', async () => {
    const release: Release = { ...base, slug: 'from-cms', title: 'From CMS' };
    const fake: ContentProvider = {
      getSettings: async () => sampleSettings,
      listReleases: async () => [release],
      getReleaseBySlug: async (slug) => (slug === release.slug ? release : null),
    };
    const res = await request(makeApp({ content: fake })).get('/api/releases/from-cms');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('From CMS');
  });
});
