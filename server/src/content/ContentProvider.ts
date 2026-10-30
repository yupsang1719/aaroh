import type { Release, ReleaseSummary, SiteSettings } from '@aaroh/shared';

/**
 * Everything the site reads goes through this interface. To move content to a headless CMS,
 * implement it (e.g. SanityContentProvider), register it in ./index.ts and set CONTENT_SOURCE.
 *
 * Implementations must:
 * - return only published releases,
 * - order releases by `order` ascending, then newest releaseDate first,
 * - return data that passes the shared zod schemas (use the helpers in ./validate.ts).
 */
export interface ContentProvider {
  getSettings(): Promise<SiteSettings | null>;
  listReleases(): Promise<ReleaseSummary[]>;
  getReleaseBySlug(slug: string): Promise<Release | null>;
}
