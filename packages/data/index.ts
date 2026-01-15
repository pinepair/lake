import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Feed } from './types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const feedsDir = join(__dirname, 'feeds');

export const feeds: Feed[] = readdirSync(feedsDir)
  .filter((f) => f.endsWith('.json'))
  .map((file) => {
    const content = readFileSync(join(feedsDir, file), 'utf-8');
    return JSON.parse(content) as Feed;
  });

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const feed of feeds) {
    for (const tag of feed.tags) tags.add(tag);
  }
  return Array.from(tags).sort();
}

export type { Feed } from './types';
