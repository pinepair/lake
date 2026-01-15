import { feeds, getAllTags } from '$lib/feeds';
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
