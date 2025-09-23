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
};
