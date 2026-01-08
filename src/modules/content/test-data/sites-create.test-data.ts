import { SITE_TYPES } from '../constants/siteTypes';

export interface siteTestCase {
  siteType: SITE_TYPES;
  category: string;
}

export const SITE_TEST_DATA: siteTestCase[] = [
  {
    siteType: SITE_TYPES.PUBLIC,
    category: SITE_TYPES.CATEGORY,
  },
  {
    siteType: SITE_TYPES.PRIVATE,
    category: SITE_TYPES.CATEGORY,
  },
  {
    siteType: SITE_TYPES.UNLISTED,
    category: SITE_TYPES.CATEGORY,
  },
];

// Default public site name used across all tests
export const DEFAULT_PUBLIC_SITE_NAME = 'All Employees';
export const DEFAULT_PRIVATE_SITE_NAME = 'Finance';
