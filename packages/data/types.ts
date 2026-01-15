export interface Feed {
  title: string;
  text: string;
  xmlUrl: string;
  htmlUrl: string;
  type: 'rss' | 'atom';
  tags: string[];
}
