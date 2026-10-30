import type { RequestHandler } from 'express';

/**
 * Permanently redirects www.<domain> to the canonical SITE_URL host. Best done at the host/DNS
 * level too (see README); this is the fallback so www never serves a duplicate site.
 */
export function redirectWww(siteUrl: string): RequestHandler {
  const canonical = new URL(siteUrl);
  const wwwHost = `www.${canonical.hostname}`;
  return (req, res, next) => {
    if (req.hostname !== wwwHost) return next();
    res.redirect(301, `${canonical.origin}${req.originalUrl}`);
  };
}
