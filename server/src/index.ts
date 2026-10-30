import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './config/env';
import { createApp } from './app';
import { createContentProvider } from './content';
import { findPlaceholders } from './content/placeholders';
import { createMailer } from './services/mailer';

let env: ReturnType<typeof loadEnv>;
try {
  env = loadEnv();
} catch {
  process.exit(1); // loadEnv has already printed which variables are wrong
}
const production = env.NODE_ENV === 'production';

// Paths are relative to the server folder (works for src/index.ts and the built dist/index.js).
const serverDir = fileURLToPath(new URL('..', import.meta.url));
const contentDir = env.CONTENT_DIR
  ? path.resolve(env.CONTENT_DIR)
  : path.join(serverDir, 'content');

// Never go live with placeholder content.
const placeholders = await findPlaceholders(contentDir);
if (placeholders.length > 0) {
  const list = placeholders.map((p) => `  - ${p}`).join('\n');
  if (production) {
    console.error(
      `Refusing to start: content in ${contentDir} still has PLACEHOLDER values:\n${list}`,
    );
    process.exit(1);
  }
  console.warn(
    `[content] ${placeholders.length} PLACEHOLDER values to replace before going live:\n${list}`,
  );
}

const content = createContentProvider(env, contentDir);
// Fail at startup, not on the first visitor, if the content files are invalid.
await Promise.all([content.getSettings(), content.listReleases()]);

const app = createApp({
  env,
  content,
  mailer: createMailer(env),
  mediaDir: path.join(contentDir, 'media'),
  // In production this server also serves the built site. In development Vite does.
  clientDir: production
    ? (env.CLIENT_DIST_DIR ?? path.join(serverDir, '../client/dist'))
    : undefined,
});

const server = app.listen(env.PORT, () => {
  console.log(`Aaroh server listening on http://localhost:${env.PORT} (content: ${contentDir})`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
