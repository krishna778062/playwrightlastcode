import { faker } from '@faker-js/faker';

import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

export const MANAGE_SITE_TEST_DATA = {
  SITE_NAME: {
    NAME: `Test Site ${faker.person.firstName()}`,
    generateUniqueName: () => `Test Site ${faker.person.firstName()}_${Date.now()}`,
  },
  CATEGORY_NAME: {
    NAME: `Test Category ${faker.person.firstName()}`,
  },

  PAGE_SEARCH_TEST_DATA: {
    content: 'page',
    category: 'Uncategorized',
    label: 'Page',
    contentType: 'news',
    description: 'Test page content for global search verification and validation',
    accessType: SITE_TYPES.PUBLIC,
  },
  PAGE_NAME: {
    NAME: `Test Page ${faker.person.firstName()}`,
    generateUniqueName: () => `Test Page ${faker.person.firstName()}_${Date.now()}`,
  },
  ALBUM_NAME: {
    NAME: `Test Album ${faker.person.firstName()}`,
    generateUniqueName: () => `Test Album ${faker.person.firstName()}_${Date.now()}`,
  },
  EVENT_NAME: {
    NAME: `Test Event ${faker.person.firstName()}`,
    generateUniqueName: () => `Test Event ${faker.person.firstName()}_${Date.now()}`,
  },
  MONTH_NAMES: {
    MONTH_NAMES: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    MONTH_NAMES_LOWER: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
  },
};
