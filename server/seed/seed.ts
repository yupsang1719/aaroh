import mongoose from 'mongoose';
import { loadEnv } from '../src/config/env';
import { loadSeed } from './load';

const env = loadEnv();

if (env.NODE_ENV === 'production' && process.env.SEED_FORCE !== '1') {
  console.error('Refusing to seed in production: this replaces all releases and settings.');
  console.error('Run with SEED_FORCE=1 if you really mean it.');
  process.exit(1);
}

await mongoose.connect(env.MONGODB_URI);
const { releases } = await loadSeed();
console.log(`Seeded ${releases} releases and site settings into ${mongoose.connection.name}.`);
await mongoose.disconnect();
