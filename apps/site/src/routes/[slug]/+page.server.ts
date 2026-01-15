import { feeds } from '@lake/data';
import { slugifyDomain } from '$lib/utils/slugify';
import { error } from '@sveltejs/kit';

export function load({ params }) {
  const feed = feeds.find((f) => slugifyDomain(f.htmlUrl) === params.slug);

  if (!feed) {
    throw error(404, 'Feed not found');
  }

  return {
    feed: {
      ...feed,
      slug: params.slug
    }
  };
}
