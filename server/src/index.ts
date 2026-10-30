import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { loadEnv } from './config/env';
import { connectDatabase } from './db';
import { createApp } from './app';
import { createContentProvider } from './content';
import { mongoContactStore } from './services/contactStore';
import { createMailer } from './services/mailer';

const env = loadEnv();

// MongoDB is always needed: it stores contact messages even when content comes from a CMS.
await connectDatabase(env.MONGODB_URI, { retry: env.NODE_ENV !== 'production' });

const app = createApp({
  env,
  content: createContentProvider(env),
  contactStore: mongoContactStore,
  mailer: createMailer(env),
  // In production this server also serves the built site. In development Vite does.
  clientDir:
    env.NODE_ENV === 'production'
      ? (env.CLIENT_DIST_DIR ?? fileURLToPath(new URL('../../client/dist', import.meta.url)))
      : undefined,
});

const server = app.listen(env.PORT, () => {
  console.log(
    `Aaroh server listening on http://localhost:${env.PORT} (content: ${env.CONTENT_SOURCE})`,
  );
});

async function shutdown() {
  server.close();
  await mongoose.disconnect();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
