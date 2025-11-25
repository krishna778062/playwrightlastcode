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
  CONTENT_NAME: {
    generateContentName: (contentType: string) => `Test ${contentType} Content ${faker.person.firstName()}`,
    generateUniqueName: (contentType: string) => `Test ${contentType} ${faker.person.firstName()}_${Date.now()}`,
  },
  MONTH_NAMES: {
    MONTH_NAMES: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    MONTH_NAMES_LOWER: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
  },
  DESCRIPTION: {
    DESCRIPTION: `Description ${faker.lorem.paragraph()}`,
  },
  FILE_DESCRIPTION: {
    DESCRIPTION: (characterLimit: number) => {
      const words = faker.lorem.words(100); // Generate enough words
      return words.substring(0, characterLimit).trim();
    },
  },
  UPDATED_SITE_NAME: `Updated Test Site ${faker.person.firstName()}`,
};
