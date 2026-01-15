import { feeds } from '$lib/feeds';
import { slugifyDomain } from '$lib/utils/slugify';
import { generateOpml } from '$lib/utils/opml';

export function GET({ url }) {
  const slugsParam = url.searchParams.get('slugs');
  const tagsParam = url.searchParams.get('tags');

  let selected = feeds;

  if (slugsParam) {
    const slugs = slugsParam.split(',');
    selected = feeds.filter((f) => slugs.includes(slugifyDomain(f.htmlUrl)));
  }

  if (tagsParam) {
    const tags = tagsParam.split(',');
    selected = selected.filter((f) => tags.some((tag) => f.tags.includes(tag)));
  }

  const opml = generateOpml(selected, 'RSS Feeds');

  return new Response(opml, {
    headers: {
      'Content-Type': 'application/xml',
      'Content-Disposition': 'attachment; filename="feeds.opml"'
    }
  });
}
