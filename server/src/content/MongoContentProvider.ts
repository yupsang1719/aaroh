import type { Release, ReleaseSummary, SiteSettings } from '@aaroh/shared';
import type { ContentProvider } from './ContentProvider';
import { ReleaseModel, type ReleaseDoc } from '../models/Release';
import { SETTINGS_KEY, SiteSettingsModel, type SiteSettingsDoc } from '../models/SiteSettings';
import { toIsoDate, toRelease, toReleaseSummary, toSettings } from './validate';

const ORDER = { order: 1, releaseDate: -1, _id: 1 } as const;

// The shared schemas strip Mongo-only fields (_id, key, timestamps) and blank optional values.
function mapRelease(doc: ReleaseDoc): Release | null {
  return toRelease({ ...doc, releaseDate: toIsoDate(doc.releaseDate) }, `mongo:${doc.slug}`);
}

function mapSettings(doc: SiteSettingsDoc): SiteSettings {
  return toSettings(doc);
}

export class MongoContentProvider implements ContentProvider {
  async getSettings(): Promise<SiteSettings | null> {
    const doc = await SiteSettingsModel.findOne({ key: SETTINGS_KEY }).lean<SiteSettingsDoc>();
    return doc ? mapSettings(doc) : null;
  }

  async listReleases(): Promise<ReleaseSummary[]> {
    const docs = await ReleaseModel.find({ published: true }).sort(ORDER).lean<ReleaseDoc[]>();
    return docs
      .map(mapRelease)
      .filter((r): r is Release => r !== null)
      .map(toReleaseSummary);
  }

  async getReleaseBySlug(slug: string): Promise<Release | null> {
    const doc = await ReleaseModel.findOne({ slug, published: true }).lean<ReleaseDoc>();
    return doc ? mapRelease(doc) : null;
  }
}
