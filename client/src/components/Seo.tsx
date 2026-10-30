import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router';
import {
  SITE_NAME,
  pageTitle,
  serializeJsonLd,
  shareImageUrl,
  type PageMeta,
} from '@aaroh/shared/seo';
import { SITE_URL, absoluteUrl } from '../lib/site';

interface SeoProps {
  meta: PageMeta;
  /** Structured data for this page (the site-wide Organization is added by <Layout>). */
  jsonLd?: Record<string, unknown>;
}

/**
 * Per-page title, description, canonical URL, share tags and JSON-LD. The same meta comes from
 * the server in the initial HTML (server/src/seo), built from the same shared helpers.
 */
export function Seo({ meta, jsonLd }: SeoProps) {
  const { pathname } = useLocation();
  const title = pageTitle(meta.title);
  const url = absoluteUrl(pathname);
  const image = shareImageUrl(SITE_URL, meta.image);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={meta.description} />
      {meta.noindex ? (
        <meta name="robots" content="noindex" />
      ) : (
        <link rel="canonical" href={url} />
      )}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_GB" />
      <meta property="og:type" content={meta.type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      {meta.imageAlt && <meta property="og:image:alt" content={meta.imageAlt} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && <script type="application/ld+json">{serializeJsonLd(jsonLd)}</script>}
    </Helmet>
  );
}
