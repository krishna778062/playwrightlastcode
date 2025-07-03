import { SEARCH_RESULT_ITEM_LABELS } from '../constants/searchResultItemLabels';
import { DEFAULT_CATEGORY } from '../constants/siteCategoryDefaults';
import { SITE_TYPES } from '../constants/siteTypes';

export interface SiteSearchTestCase {
  siteType: SITE_TYPES;
  category: string;
  label: string;
}

export const SITE_SEARCH_TEST_DATA: SiteSearchTestCase[] = [
  {
    siteType: SITE_TYPES.PRIVATE,
    category: DEFAULT_CATEGORY,
    label: SEARCH_RESULT_ITEM_LABELS.SITE,
  },
  {
    siteType: SITE_TYPES.PUBLIC,
    category: DEFAULT_CATEGORY,
    label: SEARCH_RESULT_ITEM_LABELS.SITE,
  },
];
