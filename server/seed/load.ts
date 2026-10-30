import { z } from 'zod';
import { releaseSchema, siteSettingsSchema } from '@aaroh/shared';
import { ReleaseModel } from '../src/models/Release';
import { SETTINGS_KEY, SiteSettingsModel } from '../src/models/SiteSettings';
import releasesJson from './releases.json' with { type: 'json' };
import settingsJson from './settings.json' with { type: 'json' };

export const seedReleases = z.array(releaseSchema).parse(releasesJson);
export const seedSettings = siteSettingsSchema.parse(settingsJson);

/** Replaces all releases and the settings document with the seed data. */
export async function loadSeed(
  releases: z.input<typeof releaseSchema>[] = seedReleases,
  settings: z.input<typeof siteSettingsSchema> = seedSettings,
) {
  const parsedReleases = z.array(releaseSchema).parse(releases);
  const parsedSettings = siteSettingsSchema.parse(settings);

  await ReleaseModel.deleteMany({});
  await ReleaseModel.insertMany(
    parsedReleases.map((r) => ({ ...r, releaseDate: new Date(`${r.releaseDate}T00:00:00Z`) })),
  );
  await SiteSettingsModel.findOneAndReplace(
    { key: SETTINGS_KEY },
    { key: SETTINGS_KEY, ...parsedSettings },
    { upsert: true },
  );
  await ReleaseModel.syncIndexes();

  return { releases: parsedReleases.length };
}
