import {
  DATA_KEYS,
  NOT_FOUND_META,
  STATIC_PAGE_PATHS,
  organizationJsonLd,
  releaseJsonLd,
  releaseMeta,
  slugSchema,
  staticPageMeta,
  type PageMeta,
  type StaticPage,
} from '@aaroh/shared';
import type { ContentProvider } from '../content';
import { getReleaseDetail } from '../content/releases';

export type PageView = StaticPage | 'release' | 'notFound';

export interface ResolvedPage {
  status: 200 | 404;
  /** Which client page renders this URL (used to preload its code). */
  view: PageView;
  /** The page's largest above-the-fold image, preloaded so it is not discovered late. */
  preloadImage?: string;
  meta: PageMeta;
  jsonLd: Record<string, unknown>[];
  /** API data the page needs, embedded in the HTML so the client renders without fetching. */
  data: Record<string, unknown>;
}

// Pages that show the release list.
const NEEDS_RELEASES: StaticPage[] = ['home', 'work'];

const STATIC_BY_PATH = new Map(
  (Object.entries(STATIC_PAGE_PATHS) as [StaticPage, string][]).map(([page, path]) => [path, page]),
);

/** Malformed escapes (e.g. "%E0") are simply not a valid slug, not a server error. */
function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return '';
  }
}

/** Works out the meta and data for any site URL. Mirrors the client routes in client/src/App.tsx. */
export async function resolvePage(
  pathname: string,
  content: ContentProvider,
  siteUrl: string,
): Promise<ResolvedPage> {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const settings = await content.getSettings().catch(() => null);
  const organization = organizationJsonLd(siteUrl, settings);
  const data: Record<string, unknown> = settings ? { [DATA_KEYS.settings]: settings } : {};

  const page = STATIC_BY_PATH.get(path);
  if (page) {
    let preloadImage: string | undefined;
    if (NEEDS_RELEASES.includes(page)) {
      const releases = await content.listReleases();
      data[DATA_KEYS.releases] = releases;
      // The Work list opens with the first cover; the home page opens with the collage.
      if (page === 'work') preloadImage = releases[0]?.coverImage.url;
    }
    return {
      status: 200,
      view: page,
      preloadImage,
      meta: staticPageMeta(page, settings),
      jsonLd: [organization],
      data,
    };
  }

  const match = /^\/work\/([^/]+)$/.exec(path);
  const slug = match && slugSchema.safeParse(safeDecode(match[1]!));
  if (slug?.success) {
    const release = await getReleaseDetail(content, slug.data);
    if (release) {
      data[DATA_KEYS.release(release.slug)] = release;
      return {
        status: 200,
        view: 'release',
        preloadImage: release.coverImage.url,
        meta: releaseMeta(release),
        jsonLd: [organization, releaseJsonLd(siteUrl, release)],
        data,
      };
    }
  }

  return { status: 404, view: 'notFound', meta: NOT_FOUND_META, jsonLd: [organization], data };
}
