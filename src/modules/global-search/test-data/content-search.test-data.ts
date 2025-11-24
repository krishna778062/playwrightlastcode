import { SITE_TYPES } from '@modules/global-search/constants/siteTypes';

export interface ContentSearchTestCase {
  content: string;
  category: string;
  label: string;
  contentType?: string;
  description: string;
  accessType: SITE_TYPES;
  typeFilter?: string;
}

export const PAGE_SEARCH_TEST_DATA: ContentSearchTestCase = {
  content: 'page',
  category: 'Uncategorized',
  label: 'Page',
  contentType: 'news',
  description: 'Test page content for global search verification and validation',
  accessType: SITE_TYPES.PUBLIC,
  typeFilter: 'Pages',
};

export const EVENT_SEARCH_TEST_DATA: ContentSearchTestCase = {
  content: 'event',
  category: 'Uncategorized',
  label: 'Event',
  description: 'Test event content for global search verification and validation',
  accessType: SITE_TYPES.PUBLIC,
};

export const ALBUM_SEARCH_TEST_DATA: ContentSearchTestCase = {
  label: 'Album',
  content: 'album',
  category: 'Uncategorized',
  description: 'Test album content for global search verification and validation',
  accessType: SITE_TYPES.PUBLIC,
};
