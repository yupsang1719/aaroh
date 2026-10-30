import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * Lists every value in the content JSON that still contains "PLACEHOLDER", as
 * "settings.json › legal.companyNumber". Production refuses to start while any remain.
 */
export async function findPlaceholders(dir: string): Promise<string[]> {
  const found: string[] = [];
  const files = (await readdir(dir)).filter((f) => f.endsWith('.json'));

  const walk = (value: unknown, where: string, file: string) => {
    if (typeof value === 'string') {
      if (value.includes('PLACEHOLDER')) found.push(`${file} › ${where || '(root)'}`);
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, `${where}[${i}]`, file));
    } else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        // "_comment" keys are notes for editors, not content.
        if (!k.startsWith('_')) walk(v, where ? `${where}.${k}` : k, file);
      }
    }
  };

  for (const file of files) {
    walk(JSON.parse(await readFile(path.join(dir, file), 'utf8')), '', file);
  }
  return found;
}
