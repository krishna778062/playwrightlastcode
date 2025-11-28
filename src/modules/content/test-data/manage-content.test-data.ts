import { faker } from '@faker-js/faker';

export const MANAGE_CONTENT_TEST_DATA = {
  TITLE: faker.string.alphanumeric(20) + faker.string.numeric(10),
  MONTH_NAMES: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  UPDATED_PAGE_NAME: `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Page Updated`,
  UPDATED_ONBOARDING_STATUS: 'Updated onboarding status',
};
