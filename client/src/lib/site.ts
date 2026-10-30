import { absoluteUrl as toAbsolute } from '@aaroh/shared/seo';

/** Public site URL, used for canonical links and structured data. No trailing slash. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://aaroh.co.uk').replace(
  /\/+$/,
  '',
);

export { SITE_NAME } from '@aaroh/shared/seo';

/** Absolute URL on the public site for a path or an already-absolute URL. */
export const absoluteUrl = (pathOrUrl: string) => toAbsolute(SITE_URL, pathOrUrl);
