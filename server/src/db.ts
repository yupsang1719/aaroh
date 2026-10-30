import mongoose from 'mongoose';

const RETRY_MS = 3000;

/** Hides credentials when printing a connection string (Atlas URIs contain a password). */
function redact(uri: string): string {
  return uri.replace(/\/\/([^@/]+)@/, '//***@');
}

/**
 * Connects to MongoDB. In development it keeps retrying with a short hint instead of crashing,
 * so starting the database later (or the dev database still booting) just works.
 * In production it fails fast and lets the host restart the service.
 */
export async function connectDatabase(uri: string, { retry }: { retry: boolean }) {
  let warned = false;
  for (;;) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      if (warned) console.log('[db] Connected to MongoDB.');
      return;
    } catch (err) {
      if (!retry) {
        console.error(`[db] Could not connect to MongoDB at ${redact(uri)}.`);
        throw err;
      }
      if (!warned) {
        console.warn(
          `[db] Waiting for MongoDB at ${redact(uri)}… ` +
            '(npm run dev starts one for you; or run `docker compose up -d mongo`, ' +
            'or set MONGODB_URI in server/.env). Retrying every few seconds.',
        );
        warned = true;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_MS));
    }
  }
}
