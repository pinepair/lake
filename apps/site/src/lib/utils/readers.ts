export function getFeedlyUrl(feedUrl: string): string {
  return `https://feedly.com/i/subscription/feed/${encodeURIComponent(feedUrl)}`;
}

export function getInoreaderUrl(feedUrl: string): string {
  return `https://www.inoreader.com/feed/${encodeURIComponent(feedUrl)}`;
}

export function getFeedProtocolUrl(feedUrl: string): string {
  return feedUrl.replace(/^https?:/, 'feed:');
}
