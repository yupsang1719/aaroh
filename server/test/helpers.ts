import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { releaseSchema, siteSettingsSchema, type Release, type SiteSettings } from '@aaroh/shared';
import { z } from 'zod';
import { createApp, type AppDeps } from '../src/app';
import { loadEnv } from '../src/config/env';
import { JsonContentProvider } from '../src/content/JsonContentProvider';
import type { Mailer } from '../src/services/mailer';

const sampleDir = fileURLToPath(new URL('../content-sample', import.meta.url));
const readSample = (file: string) => JSON.parse(readFileSync(path.join(sampleDir, file), 'utf8'));

/** The sample content (server/content-sample), parsed, as a base for test fixtures. */
export const sampleSettings: SiteSettings = siteSettingsSchema.parse(readSample('settings.json'));
export const sampleReleases: Release[] = z.array(releaseSchema).parse(readSample('releases.json'));

/** Writes a throwaway content folder and returns its path. */
export function makeContentDir(
  settings: unknown = readSample('settings.json'),
  releases: unknown = readSample('releases.json'),
): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'aaroh-content-'));
  writeFileSync(path.join(dir, 'settings.json'), JSON.stringify(settings));
  writeFileSync(path.join(dir, 'releases.json'), JSON.stringify(releases));
  mkdirSync(path.join(dir, 'media'));
  writeFileSync(path.join(dir, 'media', 'still.jpg'), 'fake jpeg');
  return dir;
}

export const testEnv = loadEnv({ NODE_ENV: 'test' });

export const okMailer = (): Mailer => ({ async sendContact() {} });

export function makeApp(overrides: Partial<AppDeps> & { contentDir?: string } = {}) {
  const { contentDir = makeContentDir(), ...deps } = overrides;
  return createApp({
    env: testEnv,
    content: new JsonContentProvider(contentDir, { cache: false }),
    mailer: okMailer(),
    mediaDir: path.join(contentDir, 'media'),
    ...deps,
  });
}
