import { SITE_TYPES } from '../constants/siteTypes';

export interface featuredSiteTestCase {
  siteType: SITE_TYPES;
  category: string;
}

export const FEATURED_SITE_TEST_DATA: featuredSiteTestCase[] = [
  {
    siteType: SITE_TYPES.PUBLIC,
    category: SITE_TYPES.CATEGORY,
  },
  {
    siteType: SITE_TYPES.PRIVATE,
    category: SITE_TYPES.CATEGORY,
  },
];
