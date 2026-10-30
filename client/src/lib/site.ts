/** Public site URL, used for canonical links and structured data. No trailing slash. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://aaroh.co.uk').replace(
  /\/+$/,
  '',
);

export const SITE_NAME = 'Aaroh';

/** Absolute URL on the public site for a path or an already-absolute URL. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}
