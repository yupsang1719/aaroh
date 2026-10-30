/**
 * Local MongoDB for `npm run dev`, so development needs no Docker or Atlas.
 *
 * - If MONGODB_URI points somewhere other than localhost:27017, or something is already
 *   listening on 27017 (e.g. `docker compose up -d mongo`), it does nothing and uses that.
 * - Otherwise it starts MongoDB on 27017 with data kept in .data/mongo (git-ignored) and,
 *   the first time, loads the seed content.
 */
import { mkdirSync } from 'node:fs';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { loadEnv } from '../src/config/env';
import { loadSeed } from '../seed/load';
import { ReleaseModel } from '../src/models/Release';

const PORT = 27017;
const DEFAULT_URI = `mongodb://localhost:${PORT}/aaroh`;
const dataDir = fileURLToPath(new URL('../../.data/mongo', import.meta.url));

const env = loadEnv();
const log = (message: string) => console.log(message); // concurrently adds the [db] prefix
const idle = () => setInterval(() => {}, 1 << 30); // keep running alongside the other dev processes

function portInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect(port, '127.0.0.1');
    socket.once('connect', () => (socket.destroy(), resolve(true)));
    socket.once('error', () => resolve(false));
  });
}

const usesLocalDefault = /^mongodb:\/\/(localhost|127\.0\.0\.1):27017(\/|$)/.test(env.MONGODB_URI);

if (!usesLocalDefault) {
  log('MONGODB_URI points to another database; not starting a local one.');
  idle();
} else if (await portInUse(PORT)) {
  log(`Using the MongoDB already running on port ${PORT}.`);
  idle();
} else {
  mkdirSync(dataDir, { recursive: true });
  const server = await MongoMemoryServer.create({
    instance: { port: PORT, ip: '127.0.0.1', dbPath: dataDir, storageEngine: 'wiredTiger' },
  });
  log(`Local MongoDB running on port ${PORT} (data in .data/mongo).`);

  // First run: load the seed content so the site has something to show.
  await mongoose.connect(env.MONGODB_URI || DEFAULT_URI);
  if ((await ReleaseModel.estimatedDocumentCount()) === 0) {
    const { releases } = await loadSeed();
    log(`Empty database: loaded seed content (${releases} releases).`);
  }
  await mongoose.disconnect();

  const stop = async () => {
    await server.stop({ doCleanup: false }); // keep the data for next time
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  idle();
}
