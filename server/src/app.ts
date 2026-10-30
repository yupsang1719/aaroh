import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import type { Env } from './config/env';
import type { ContentProvider } from './content';
import type { Mailer } from './services/mailer';
import { healthRouter } from './routes/health';
import { settingsRouter } from './routes/settings';
import { releasesRouter } from './routes/releases';
import { contactRouter } from './routes/contact';
import { apiNotFound, errorHandler } from './middleware/errors';
import { redirectWww } from './middleware/redirectWww';
import { seoFilesRouter } from './seo/sitemap';
import { serveClient } from './seo/serveClient';

export interface AppDeps {
  env: Env;
  content: ContentProvider;
  mailer: Mailer;
  /** Content media folder (e.g. server/content/media), served at /media. */
  mediaDir?: string;
  /** Built client (client/dist). When set, the app serves the site itself (production). */
  clientDir?: string;
}

export function createApp({ env, content, mailer, mediaDir, clientDir }: AppDeps) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);

  app.use(redirectWww(env.SITE_URL));

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'img-src': ["'self'", 'data:', 'https://i.ytimg.com'],
          'media-src': ["'self'", 'https:'],
          'frame-src': ['https://www.youtube-nocookie.com'],
          'style-src': ["'self'", "'unsafe-inline'"],
          // HTTPS is enforced by the host and HSTS; this directive would break local http testing.
          'upgrade-insecure-requests': null,
        },
      },
    }),
  );
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN.split(',').map((o) => o.trim()),
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '20kb' }));

  app.use('/api/health', healthRouter);
  app.use('/api/settings', settingsRouter(content));
  app.use('/api/releases', releasesRouter(content));
  app.use(
    '/api/contact',
    contactRouter({
      content,
      mailer,
      rateLimit: {
        windowMs: env.CONTACT_RATE_WINDOW_MINUTES * 60_000,
        limit: env.CONTACT_RATE_LIMIT,
      },
    }),
  );
  app.use('/api', apiNotFound);

  app.use(seoFilesRouter(content, env.SITE_URL));
  if (mediaDir) {
    // Content images/video. File names are not hashed, so cache for a day, not forever.
    app.use('/media', express.static(mediaDir, { maxAge: '1d', index: false, fallthrough: false }));
  }
  if (clientDir) app.use(serveClient(clientDir, content, env.SITE_URL));

  app.use(errorHandler);
  return app;
}
