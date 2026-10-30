import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Release, ReleaseSummary, SiteSettings } from '@aaroh/shared';
import type { ContentProvider } from './ContentProvider';
import { toRelease, toReleaseSummary, toSettings } from './validate';

interface Options {
  /** Keep content in memory after the first read (production). Off in development, so
   *  edits to the JSON files show up on the next page load without a restart. */
  cache: boolean;
}

interface Loaded {
  settings: SiteSettings;
  releases: Release[];
}

/**
 * Reads content from JSON files in one folder:
 *   settings.json   site settings (shape: siteSettingsSchema)
 *   releases.json   array of releases (shape: releaseSchema); [] until the first release
 *   media/          images and video referenced as /media/<file>
 */
export class JsonContentProvider implements ContentProvider {
  private loaded?: Promise<Loaded>;

  constructor(
    private readonly dir: string,
    private readonly options: Options,
  ) {}

  private async readJson(file: string): Promise<unknown> {
    const full = path.join(this.dir, file);
    try {
      return JSON.parse(await readFile(full, 'utf8'));
    } catch (err) {
      throw new Error(`Could not read ${full}: ${(err as Error).message}`);
    }
  }

  private async read(): Promise<Loaded> {
    const [settingsRaw, releasesRaw] = await Promise.all([
      this.readJson('settings.json'),
      this.readJson('releases.json'),
    ]);
    if (!Array.isArray(releasesRaw)) throw new Error('releases.json must be a JSON array');

    const releases = releasesRaw
      .map((raw, i) => toRelease(raw, `releases.json[${i}]`))
      .filter((r): r is Release => r !== null)
      .filter((r) => r.published)
      // Ordered by `order`, then newest first.
      .sort((a, b) => a.order - b.order || b.releaseDate.localeCompare(a.releaseDate));

    const slugs = new Set<string>();
    for (const r of releases) {
      if (slugs.has(r.slug)) throw new Error(`releases.json: duplicate slug "${r.slug}"`);
      slugs.add(r.slug);
    }

    return { settings: toSettings(settingsRaw), releases };
  }

  private load(): Promise<Loaded> {
    if (!this.options.cache) return this.read();
    this.loaded ??= this.read().catch((err) => {
      this.loaded = undefined;
      throw err;
    });
    return this.loaded;
  }

  async getSettings(): Promise<SiteSettings | null> {
    return (await this.load()).settings;
  }

  async listReleases(): Promise<ReleaseSummary[]> {
    return (await this.load()).releases.map(toReleaseSummary);
  }

  async getReleaseBySlug(slug: string): Promise<Release | null> {
    return (await this.load()).releases.find((r) => r.slug === slug) ?? null;
  }
}
