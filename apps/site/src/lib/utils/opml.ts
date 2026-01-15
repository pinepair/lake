import type { Feed } from '@lake/data';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateOpml(feeds: Feed[], title = 'RSS Feeds'): string {
  const outlines = feeds
    .map(
      (feed) =>
        `      <outline type="${escapeXml(feed.type)}" xmlUrl="${escapeXml(feed.xmlUrl)}" title="${escapeXml(feed.title)}" text="${escapeXml(feed.text)}" htmlUrl="${escapeXml(feed.htmlUrl)}"/>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>${escapeXml(title)}</title>
  </head>
  <body>
    <outline text="Feeds" title="Feeds">
${outlines}
    </outline>
  </body>
</opml>`;
}
