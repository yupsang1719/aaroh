import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import type { Env } from './config/env';
import type { ContentProvider } from './content';
import type { ContactStore } from './services/contactStore';
import type { Mailer } from './services/mailer';
import { healthRouter } from './routes/health';
import { settingsRouter } from './routes/settings';
import { releasesRouter } from './routes/releases';
import { contactRouter } from './routes/contact';
import { apiNotFound, errorHandler } from './middleware/errors';

export interface AppDeps {
  env: Env;
  content: ContentProvider;
  contactStore: ContactStore;
  mailer: Mailer;
}

export function createApp({ env, content, contactStore, mailer }: AppDeps) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'img-src': ["'self'", 'data:', 'https://i.ytimg.com'],
          'media-src': ["'self'", 'https:'],
          'frame-src': ['https://www.youtube-nocookie.com'],
          'style-src': ["'self'", "'unsafe-inline'"],
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
      store: contactStore,
      mailer,
      ipHashSalt: env.IP_HASH_SALT,
      rateLimit: {
        windowMs: env.CONTACT_RATE_WINDOW_MINUTES * 60_000,
        limit: env.CONTACT_RATE_LIMIT,
      },
    }),
  );
  app.use('/api', apiNotFound);

  app.use(errorHandler);
  return app;
}
