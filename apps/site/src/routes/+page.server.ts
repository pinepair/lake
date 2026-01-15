import { feeds, getAllTags } from '@lake/data';
import { slugifyDomain } from '$lib/utils/slugify';

export function load() {
  const feedsWithSlug = feeds.map((feed) => ({
    ...feed,
    slug: slugifyDomain(feed.htmlUrl)
  }));

  return {
    feeds: feedsWithSlug,
    tags: getAllTags()
  };
}
