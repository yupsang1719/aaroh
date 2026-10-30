import { afterAll, beforeAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp, type AppDeps } from '../src/app';
import { loadEnv } from '../src/config/env';
import { MongoContentProvider } from '../src/content/MongoContentProvider';
import { mongoContactStore } from '../src/services/contactStore';
import type { Mailer } from '../src/services/mailer';

/** Starts a throwaway MongoDB for the current test file. */
export function useTestDatabase() {
  let mongo: MongoMemoryServer;
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
  });
}

export const testEnv = loadEnv({ NODE_ENV: 'test', IP_HASH_SALT: 'test-salt' });

export function makeApp(overrides: Partial<AppDeps> = {}) {
  const mailer: Mailer = { async notifyContact() {} };
  return createApp({
    env: testEnv,
    content: new MongoContentProvider(),
    contactStore: mongoContactStore,
    mailer,
    ...overrides,
  });
}
