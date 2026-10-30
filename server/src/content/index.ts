import type { Env } from '../config/env';
import type { ContentProvider } from './ContentProvider';
import { JsonContentProvider } from './JsonContentProvider';

export type { ContentProvider } from './ContentProvider';

/**
 * Picks the content source from CONTENT_SOURCE. To add a headless CMS:
 *   1. write src/content/SanityContentProvider.ts implementing ContentProvider
 *   2. add 'sanity' to CONTENT_SOURCE in src/config/env.ts
 *   3. add a case below
 */
export function createContentProvider(env: Env, contentDir: string): ContentProvider {
  switch (env.CONTENT_SOURCE) {
    case 'json':
      return new JsonContentProvider(contentDir, { cache: env.NODE_ENV === 'production' });
  }
}
