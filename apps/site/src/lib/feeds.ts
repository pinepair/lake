import type { Feed } from '@lake/data';

const feedModules = import.meta.glob<Feed>('../../../../packages/data/feeds/*.json', {
  eager: true,
  import: 'default'
});

export const feeds: Feed[] = Object.values(feedModules);

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const feed of feeds) {
    for (const tag of feed.tags) tags.add(tag);
  }
  return Array.from(tags).sort();
}
