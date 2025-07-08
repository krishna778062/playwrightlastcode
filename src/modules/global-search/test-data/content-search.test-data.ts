export interface ContentSearchTestCase {
  content: string;
  category: string;
  label: string;
  contentType: string;
}

export const PAGE_SEARCH_TEST_DATA: ContentSearchTestCase = {
  content: 'page',
  category: 'Uncategorized',
  label: 'Page',
  contentType: 'news',
};
