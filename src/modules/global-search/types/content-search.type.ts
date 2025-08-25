export interface IContentSearch {
  name: string;
  label: string;
  description: string;
  author: string;
  contentType: 'Page' | 'Album' | 'Event';
  contentId: string;
  siteId: string;
  siteName: string;
}
