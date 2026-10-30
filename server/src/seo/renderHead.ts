import {
  INITIAL_DATA_ID,
  SITE_NAME,
  absoluteUrl,
  pageTitle,
  serializeJsonLd,
  shareImageUrl,
} from '@aaroh/shared';
import type { ResolvedPage } from './pageMeta';

export const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Head tags for crawlers and link previews that do not run JavaScript. Each tag carries
 * data-server-meta so the client can remove them before React renders its own (client/src/main.tsx).
 */
export function renderHead(page: ResolvedPage, pathname: string, siteUrl: string): string {
  const { meta } = page;
  const title = pageTitle(meta.title);
  const url = absoluteUrl(siteUrl, pathname);
  const image = shareImageUrl(siteUrl, meta.image);
  const attr = 'data-server-meta';

  const tags = [
    `<title ${attr}>${escapeHtml(title)}</title>`,
    `<meta ${attr} name="description" content="${escapeHtml(meta.description)}">`,
    meta.noindex
      ? `<meta ${attr} name="robots" content="noindex">`
      : `<link ${attr} rel="canonical" href="${escapeHtml(url)}">`,
    `<meta ${attr} property="og:site_name" content="${SITE_NAME}">`,
    `<meta ${attr} property="og:locale" content="en_GB">`,
    `<meta ${attr} property="og:type" content="${meta.type}">`,
    `<meta ${attr} property="og:title" content="${escapeHtml(title)}">`,
    `<meta ${attr} property="og:description" content="${escapeHtml(meta.description)}">`,
    `<meta ${attr} property="og:url" content="${escapeHtml(url)}">`,
    `<meta ${attr} property="og:image" content="${escapeHtml(image)}">`,
    meta.imageAlt &&
      `<meta ${attr} property="og:image:alt" content="${escapeHtml(meta.imageAlt)}">`,
    `<meta ${attr} name="twitter:card" content="summary_large_image">`,
    `<meta ${attr} name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta ${attr} name="twitter:description" content="${escapeHtml(meta.description)}">`,
    `<meta ${attr} name="twitter:image" content="${escapeHtml(image)}">`,
    ...page.jsonLd.map(
      (data) => `<script ${attr} type="application/ld+json">${serializeJsonLd(data)}</script>`,
    ),
    // Page data for the client. Not executed (type="application/json"); read once, then removed.
    `<script ${attr} type="application/json" id="${INITIAL_DATA_ID}">${serializeJsonLd(page.data)}</script>`,
  ];

  return tags.filter(Boolean).join('\n    ');
}
