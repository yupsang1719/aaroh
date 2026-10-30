import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { siteSettingsSchema, type ReleaseSummary, type Release } from '@aaroh/shared';
import { loadSeed, seedReleases, seedSettings } from '../seed/load';
import { SiteSettingsModel } from '../src/models/SiteSettings';
import type { ContentProvider } from '../src/content';
import { makeApp, useTestDatabase } from './helpers';

useTestDatabase();

const base = seedReleases[0]!;
const fixtures = [
  { ...base, slug: 'second', title: 'Second', order: 2, published: true },
  { ...base, slug: 'hidden', title: 'Hidden', order: 0, published: false },
  { ...base, slug: 'first', title: 'First', order: 1, published: true },
  { ...base, slug: 'third-newer', title: 'Third newer', order: 3, releaseDate: '2026-10-01' },
  { ...base, slug: 'third-older', title: 'Third older', order: 3, releaseDate: '2026-01-01' },
];

describe('content API (Mongo provider)', () => {
  beforeEach(async () => {
    await loadSeed(fixtures, seedSettings);
  });

  it('GET /api/settings returns the settings document', async () => {
    const res = await request(makeApp()).get('/api/settings');
    expect(res.status).toBe(200);
    expect(siteSettingsSchema.parse(res.body)).toEqual(seedSettings);
    expect(res.body.companyName).toBe('Aaroh');
  });

  it('GET /api/settings is 404 before seeding', async () => {
    await SiteSettingsModel.deleteMany({});
    const res = await request(makeApp()).get('/api/settings');
    expect(res.status).toBe(404);
  });

  it('GET /api/releases lists published releases only, in order', async () => {
    const res = await request(makeApp()).get('/api/releases');
    expect(res.status).toBe(200);
    expect(res.body.map((r: ReleaseSummary) => r.slug)).toEqual([
      'first',
      'second',
      'third-newer',
      'third-older',
    ]);
    // Summaries leave out the heavy fields.
    expect(res.body[0]).not.toHaveProperty('story');
    expect(res.body[0]).not.toHaveProperty('published');
  });

  it('GET /api/releases/:slug returns the release with previous/next links', async () => {
    const res = await request(makeApp()).get('/api/releases/second');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Second');
    expect(res.body.releaseDate).toBe(base.releaseDate);
    expect(res.body.previous).toEqual({ slug: 'first', title: 'First' });
    expect(res.body.next).toEqual({ slug: 'third-newer', title: 'Third newer' });
  });

  it('first and last releases have no previous/next respectively', async () => {
    const first = await request(makeApp()).get('/api/releases/first');
    const last = await request(makeApp()).get('/api/releases/third-older');
    expect(first.body.previous).toBeNull();
    expect(last.body.next).toBeNull();
  });

  it('GET /api/releases/:slug is 404 for unpublished, unknown and malformed slugs', async () => {
    for (const slug of ['hidden', 'does-not-exist', 'Bad_Slug', '..%2Fetc']) {
      const res = await request(makeApp()).get(`/api/releases/${slug}`);
      expect(res.status, slug).toBe(404);
    }
  });

  it('the shipped seed data loads and validates', async () => {
    await loadSeed();
    const res = await request(makeApp()).get('/api/releases');
    expect(res.body).toHaveLength(seedReleases.length);
    expect(JSON.stringify(seedReleases)).toContain('PLACEHOLDER');
  });
});

describe('content API with a different ContentProvider', () => {
  it('works with any implementation of the interface', async () => {
    const release: Release = { ...base, slug: 'from-cms', title: 'From CMS' };
    const fake: ContentProvider = {
      getSettings: async () => seedSettings,
      listReleases: async () => [release],
      getReleaseBySlug: async (slug) => (slug === release.slug ? release : null),
    };
    const app = makeApp({ content: fake });
    const res = await request(app).get('/api/releases/from-cms');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('From CMS');
    expect(res.body.previous).toBeNull();
  });
});
