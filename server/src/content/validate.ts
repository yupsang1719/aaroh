import { releaseSchema, releaseSummarySchema, siteSettingsSchema } from '@aaroh/shared';
import type { Release, ReleaseSummary, SiteSettings } from '@aaroh/shared';

// Providers pass raw CMS/database data through these before returning it. A single bad
// release is skipped (and logged) rather than taking the whole site down.

export function toSettings(raw: unknown): SiteSettings {
  return siteSettingsSchema.parse(raw);
}

export function toRelease(raw: unknown, source: string): Release | null {
  const parsed = releaseSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn(`[content] Skipping invalid release from ${source}:`, parsed.error.issues);
    return null;
  }
  return parsed.data;
}

export function toReleaseSummary(release: Release): ReleaseSummary {
  return releaseSummarySchema.parse(release);
}
