import type { Release, SiteSettings } from './content';

/**
 * Page titles, descriptions, share images and structured data. Used by both the server
 * (meta written into the HTML for link previews) and the client (<Seo>), so they always match.
 */

export const SITE_NAME = 'Aaroh';

// PLACEHOLDER: default description, used when a page has nothing more specific.
export const DEFAULT_DESCRIPTION =
  'Aaroh is an independent music company making original songs and the films that go with them.';

/** Default share image: a 1200×630 PNG, the size link previews expect. */
export const DEFAULT_SHARE_IMAGE = '/brand/og-default.png';
export const LOGO_IMAGE = '/brand/icon-512.png';

export type StaticPage = 'home' | 'work' | 'process' | 'about' | 'contact' | 'privacy' | 'legal';

export interface PageMeta {
  /** Page name; rendered as "Title — Aaroh". Undefined on the home page. */
  title?: string;
  description: string;
  image?: string;
  imageAlt?: string;
  type: 'website' | 'video.other';
  noindex?: boolean;
}

export const STATIC_PAGE_PATHS: Record<StaticPage, string> = {
  home: '/',
  work: '/work',
  process: '/process',
  about: '/about',
  contact: '/contact',
  privacy: '/privacy',
  legal: '/legal',
};

export function staticPageMeta(page: StaticPage, settings?: SiteSettings | null): PageMeta {
  switch (page) {
    case 'home':
      return { description: settings?.tagline || DEFAULT_DESCRIPTION, type: 'website' };
    case 'work':
      return {
        title: 'Work',
        description: 'Every Aaroh release: an original song and the music video made for it.',
        type: 'website',
      };
    case 'process':
      return {
        title: 'Process',
        description:
          'How an Aaroh release comes together: idea, demo, studio, shoot, edit, release.',
        type: 'website',
      };
    case 'about':
      return {
        title: 'About',
        description: settings?.about.intro || DEFAULT_DESCRIPTION,
        type: 'website',
      };
    case 'contact':
      return {
        title: 'Contact',
        description:
          'Get in touch with Aaroh about collaborations, press, licensing or anything else.',
        type: 'website',
      };
    case 'privacy':
      return {
        title: 'Privacy and cookies',
        description: 'How Aaroh handles personal data and cookies on this website.',
        type: 'website',
      };
    case 'legal':
      return {
        title: 'Company information',
        description: 'Legal and company information for Aaroh.',
        type: 'website',
      };
  }
}

export function releaseMeta(release: Release): PageMeta {
  return {
    title: `${release.title} — ${release.artist}`,
    description: release.summary || DEFAULT_DESCRIPTION,
    image: release.coverImage.url,
    imageAlt: release.coverImage.alt,
    type: 'video.other',
  };
}

export const NOT_FOUND_META: PageMeta = {
  title: 'Not found',
  description: DEFAULT_DESCRIPTION,
  type: 'website',
  noindex: true,
};

export function pageTitle(title?: string): string {
  return title ? `${title} — ${SITE_NAME}` : SITE_NAME;
}

/** Absolute URL on the site for a path; absolute URLs pass through unchanged. */
export function absoluteUrl(siteUrl: string, pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl.replace(/\/+$/, '')}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** Link previews (Facebook, X, LinkedIn, iMessage…) do not render SVG, so fall back to the PNG. */
export function shareImageUrl(siteUrl: string, image?: string): string {
  const usable = image && !/\.svg(\?|#|$)/i.test(image) ? image : DEFAULT_SHARE_IMAGE;
  return absoluteUrl(siteUrl, usable);
}

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(siteUrl: string, settings?: SiteSettings | null): JsonLd {
  const sameAs = settings ? Object.values(settings.socials).filter(Boolean) : [];
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: settings?.companyName || SITE_NAME,
    url: `${siteUrl}/`,
    logo: absoluteUrl(siteUrl, LOGO_IMAGE),
    ...(settings?.contactEmail && { email: settings.contactEmail }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function releaseJsonLd(siteUrl: string, release: Release): JsonLd {
  const url = `${siteUrl}/work/${release.slug}`;
  const image = shareImageUrl(siteUrl, release.coverImage.url);
  const description = release.summary || undefined;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MusicRecording',
        '@id': `${url}#recording`,
        name: release.title,
        url,
        description,
        image,
        datePublished: release.releaseDate,
        byArtist: { '@type': 'MusicGroup', name: release.artist },
        publisher: { '@id': `${siteUrl}/#organization` },
        subjectOf: { '@id': `${url}#video` },
      },
      {
        '@type': 'VideoObject',
        '@id': `${url}#video`,
        name: `${release.title} — ${release.artist} (music video)`,
        description: description || `Music video for ${release.title} by ${release.artist}.`,
        thumbnailUrl: [image, `https://i.ytimg.com/vi/${release.youtubeId}/hqdefault.jpg`],
        uploadDate: release.releaseDate,
        embedUrl: `https://www.youtube.com/embed/${release.youtubeId}`,
        contentUrl: `https://www.youtube.com/watch?v=${release.youtubeId}`,
        publisher: { '@id': `${siteUrl}/#organization` },
      },
    ],
  };
}

/** Serialises JSON-LD for a <script> tag; escapes "<" so content cannot close the tag. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
