/**
 * npm run check:content [-- <content dir>]
 * Validates settings.json and releases.json and lists PLACEHOLDER values still to replace.
 * Exits non-zero if the content would not be accepted in production.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JsonContentProvider } from '../src/content/JsonContentProvider';
import { findPlaceholders } from '../src/content/placeholders';

const dir = path.resolve(
  process.argv[2] ??
    process.env.CONTENT_DIR ??
    fileURLToPath(new URL('../content', import.meta.url)),
);
let ok = true;

const content = new JsonContentProvider(dir, { cache: false });
try {
  const [settings, releases] = await Promise.all([content.getSettings(), content.listReleases()]);
  console.log(`✓ ${dir}: settings valid, ${releases.length} published release(s)`);

  // Every /media/… file referenced by the content must exist.
  const refs =
    JSON.stringify({
      settings,
      releases: await Promise.all(releases.map((r) => content.getReleaseBySlug(r.slug))),
    }).match(/\/media\/[^"?#]+/g) ?? [];
  const missing = [...new Set(refs)].filter((ref) => !existsSync(path.join(dir, ref)));
  for (const ref of missing) console.error(`✗ missing file: ${ref}`);
  if (missing.length) ok = false;
} catch (err) {
  console.error(`✗ ${(err as Error).message}`);
  ok = false;
}

const placeholders = await findPlaceholders(dir);
if (placeholders.length) {
  console.error(`✗ ${placeholders.length} PLACEHOLDER value(s) to replace:`);
  for (const p of placeholders) console.error(`  - ${p}`);
  ok = false;
}

if (ok) console.log('✓ Ready for production.');
process.exit(ok ? 0 : 1);
