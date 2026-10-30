import mongoose from 'mongoose';
import { loadEnv } from './config/env';
import { createApp } from './app';
import { createContentProvider } from './content';
import { mongoContactStore } from './services/contactStore';
import { createMailer } from './services/mailer';

const env = loadEnv();

// MongoDB is always needed: it stores contact messages even when content comes from a CMS.
await mongoose.connect(env.MONGODB_URI);

const app = createApp({
  env,
  content: createContentProvider(env),
  contactStore: mongoContactStore,
  mailer: createMailer(env),
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
