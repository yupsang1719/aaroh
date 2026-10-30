import type { Env } from '../config/env';
import type { ContentProvider } from './ContentProvider';
import { MongoContentProvider } from './MongoContentProvider';

export type { ContentProvider } from './ContentProvider';

/**
 * Picks the content source from CONTENT_SOURCE. To add a CMS:
 *   1. write src/content/SanityContentProvider.ts implementing ContentProvider
 *   2. add 'sanity' to CONTENT_SOURCE in src/config/env.ts
 *   3. add a case below
 */
export function createContentProvider(env: Env): ContentProvider {
  switch (env.CONTENT_SOURCE) {
    case 'mongo':
      return new MongoContentProvider();
  }
}
