import express from 'express';
import type { Env } from './config/env';
import { healthRouter } from './routes/health';

export interface AppDeps {
  env: Env;
}

export function createApp({ env: _env }: AppDeps) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '50kb' }));

  app.use('/api/health', healthRouter);

  return app;
}
