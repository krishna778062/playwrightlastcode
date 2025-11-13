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
    REPLY: `Automated Test Reply ${faker.company.name()} - ${faker.commerce.productName()}`,
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

  DEFAULT_FEED_CONTENT_JPEG: {
    fileName: 'image1.jpg',
    fileSize: 15518,
    mimeType: 'image/jpeg',
  },
  UPDATED_FEED_CONTENT: {
    fileName: 'image3.jpg',
    fileSize: 13116,
    mimeType: 'image/jpeg',
  },
  MAX_FILE_UPLOAD_LIMIT: 10,
  FILE_UPLOAD_WARNING_MESSAGE: "It's not possible to add more than 10 photos/files",
  RESTRICTION_MESSAGE: 'Feed posts are only available for site managers on this site',
} as const;
