import { faker } from '@faker-js/faker';

export const FEED_TEST_DATA = {
  ATTACHMENTS: {
    IMAGE: 'image1.jpg',
    DOCUMENT: 'sample.docx',
    FAVICON: 'favicon.png'
  },
  POST_TEXT: {
    INITIAL: `Automated Test Post ${faker.company.name()} - ${faker.commerce.productName()}`,
    UPDATED: `Updated Test Post ${faker.company.name()} - ${faker.commerce.productName()}`
  },
  TIMEOUTS: {
    DEFAULT: 30_000,
    UPLOAD: 60_000,
    NAVIGATION: 15_000,
  },
} as const; 