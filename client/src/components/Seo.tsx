import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router';
import { SITE_NAME, absoluteUrl } from '../lib/site';

// PLACEHOLDER: default meta description, used when a page does not set its own.
export const DEFAULT_DESCRIPTION =
  'Aaroh is an independent music company making original songs and the films that go with them.';
export const DEFAULT_OG_IMAGE = '/brand/og-default.png';

interface SeoProps {
  /** Page name. Rendered as "Title — Aaroh"; omit on the home page for just "Aaroh". */
  title?: string;
  description?: string;
  /** Share image (site-relative or absolute). Defaults to the brand OG image. */
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'video.other' | 'music.song';
  noindex?: boolean;
}

/**
 * Per-page title, description, canonical URL and social sharing tags.
 * In production the server also writes these into the HTML for crawlers that do not run JS.
 */
export function Seo({ title, description, image, imageAlt, type = 'website', noindex }: SeoProps) {
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const desc = description || DEFAULT_DESCRIPTION;
  const url = absoluteUrl(pathname);
  const imageUrl = absoluteUrl(image || DEFAULT_OG_IMAGE);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex" />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_GB" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
}
