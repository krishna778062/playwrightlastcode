import { SITE_TYPES } from '../constants/siteTypes';
import { SEARCH_RESULT_ITEM } from '../constants/siteTypes';

export interface SiteSearchTestCase {
  siteType: SITE_TYPES;
  category: string;
  label: string;
}

export const SITE_SEARCH_TEST_DATA: SiteSearchTestCase[] = [
  {
    siteType: SITE_TYPES.PUBLIC,
    category: SEARCH_RESULT_ITEM.CATEGORY,
    label: SEARCH_RESULT_ITEM.SITE,
  },
  {
    siteType: SITE_TYPES.PRIVATE,
    category: SEARCH_RESULT_ITEM.CATEGORY,
    label: SEARCH_RESULT_ITEM.SITE,
  },
];
