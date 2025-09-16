import { faker } from '@faker-js/faker';

import { FeedMode } from '@core/types/feedManagement.types';

export const FEED_TEST_DATA = {
  ATTACHMENTS: {
    IMAGE: 'image1.jpg',
    DOCUMENT: 'sample.xlsx',
    FAVICON: 'favicon.png',
  },
  POST_TEXT: {
    INITIAL: `Automated Test Post ${faker.company.name()} - ${faker.commerce.productName()}`,
    UPDATED: `Updated Test Post ${faker.company.name()} - ${faker.commerce.productName()}`,
  },
  TIMEOUTS: {
    DEFAULT: 30_000,
    UPLOAD: 60_000,
    NAVIGATION: 15_000,
  },

  DEFAULT_FEED_CONTENT: {
    fileName: '300x300 RATIO_Text.png',
    fileSize: 12125,
    mimeType: 'image/png',
  },

  DEFAULT_FEED_MODE: FeedMode.TIMELINE_COMMENT_POST,
} as const;
