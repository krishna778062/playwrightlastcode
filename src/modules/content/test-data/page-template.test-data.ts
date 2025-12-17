import { faker } from '@faker-js/faker';

/**
 * Helper function to generate random long text content
 * @param length - Number of characters to generate
 * @returns String with specified length
 */
export function generateRandomLongText(length: number): string {
  const baseText = 'This is a test content for page template with large character count. ';
  const repeatCount = Math.ceil(length / baseText.length);
  return baseText.repeat(repeatCount).substring(0, length);
}

export const PAGE_TEMPLATE_TEST_DATA = {
  DEFAULT_TEMPLATE_NAME: `Template ${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}`,
  DEFAULT_TEMPLATE_TITLE: `Template-${faker.company.buzzAdjective()}-${faker.company.buzzNoun()}`,
  DEFAULT_SUB_TYPE: 'knowledge',
  DEFAULT_LANGUAGE: 'en-US',
  DEFAULT_IMG_LAYOUT: 'wide',
  BASE_TEXT: 'This is a test content for page template with large character count. ',
  TEMPLATE_NAMES: {
    DEFAULT: `Template ${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}`,
    WITH_FAKER: `Testing Template ${faker.company.name()} - ${faker.commerce.productName()}`,
  },
  TEMPLATE_TITLES: {
    DEFAULT: `Template-${faker.company.buzzAdjective()}-${faker.company.buzzNoun()}`,
    WITH_FAKER: `Testing-Template-${faker.company.name()}-${faker.commerce.productName()}`,
  },
  SUB_TYPES: {
    KNOWLEDGE: 'knowledge',
    PAGE: 'page',
  },
  LANGUAGES: {
    EN_US: 'en-US',
    EN: 'en',
  },
  IMG_LAYOUTS: {
    WIDE: 'wide',
    SMALL: 'small',
  },
  LARGE_CONTENT_SIZE: 300001,
} as const;
