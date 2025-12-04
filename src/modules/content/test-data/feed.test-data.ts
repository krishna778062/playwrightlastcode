import { faker } from '@faker-js/faker';

import { FeedMode } from '@core/types/feedManagement.types';

export const FEED_TEST_DATA = {
  TOAST_MESSAGES: {
    IMAGE_ADDED_TO_ATTACHMENTS: 'Image added to attachments',
    SHARED_POST_SUCCESSFULLY: 'Shared post successfully',
    CONTENT_UNPUBLISHED: 'Unpublished content successfully',
    REPORT_POST_SUCCESS: 'This post has been reported and will be reviewed shortly',
  },
  ATTACHMENTS: {
    IMAGE: 'image1.jpg',
    DOCUMENT: 'sample.xlsx',
    FAVICON: 'favicon.png',
  },
  POST_TEXT: {
    APPROPRIATE_POST_TEXT: `This is a test post with appropriate content`,
    RECOGNITION_MESSAGE: `Automated Test Recognition Message ${faker.company.name()} - ${faker.commerce.productName()}`,
    INITIAL: `Automated Test Post ${faker.company.name()} - ${faker.commerce.productName()}`,
    UPDATED: `Updated Test Post ${faker.company.name()} - ${faker.commerce.productName()}`,
    SHARED: `Shared Test Post ${faker.company.name()} - ${faker.commerce.productName()}`,
    SHARED_WITH_MENTION: `Shared App Manager's Post - ${faker.commerce.productName()} - @${faker.person.fullName()}`,
    REPLY: `Automated Test Reply ${faker.company.name()} - ${faker.commerce.productName()}`,
    VIDEO: `Automated Test Video Post ${faker.company.name()} - ${faker.commerce.productName()}`,
    COMMENT: `Automated Test Comment ${faker.company.name()} - ${faker.commerce.productName()}`,
    SHARE_MESSAGE: `Automated Test Share Message ${faker.company.name()} - ${faker.commerce.productName()}`,
    TOPIC: `Automated Test Topic ${faker.company.name()} - ${faker.commerce.productName()}`,
    UPDATED_REPLY: `Updated Test Reply ${faker.company.name()} - ${faker.commerce.productName()}`,
    INAPPROPRIATE_POST_TEXT: `This is a test post with stupid and idiot content ${faker.company.name()} - ${faker.commerce.productName()}`,
    EDITED_POST_TEXT: `This is a test post with appropriate content`,
    INITIAL_WITH_ATTACHMENT: `Automated Test Post with Attachment ${faker.company.name()} - ${faker.commerce.productName()}`,
    REPORT_REASON: 'This content violates community guidelines',
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
  URLS: {
    EMBED_YOUTUBE_URL: 'https://www.youtube.com/watch?v=F_77M3ZZ1z8',
    EMBED_VIMEO_URL: 'https://vimeo.com/76979871',
  },
  MAX_FILE_UPLOAD_LIMIT: 10,
  FILE_UPLOAD_WARNING_MESSAGE: "It's not possible to add more than 10 photos/files",
  TOPIC_NAME: faker.lorem.words(2),
  TOPIC_NAME_PAGE: faker.lorem.words(2),
  TOPIC_NAME_ALBUM: faker.lorem.words(2),
  TOPIC_NAME_EVENT: faker.lorem.words(2),
  RESTRICTION_MESSAGE: 'Feed posts are only available for site managers on this site',
  SEARCH: {
    RANDOM_TEXT: 'RandomTextThatDoesNotExist12345',
  },
  DELETED_POST_MESSAGE: 'THIS POST HAS BEEN DELETED',
  API_RESPONSE_MESSAGES: {
    FEED_POST_CREATED: 'Feed Post has been successfully created',
  },
  PLACEHOLDER_TEXT: {
    WITH_RECOGNITION: 'Share your thoughts, recognize your colleagues, or ask a question',
    WITHOUT_RECOGNITION: 'Share your thoughts or questions',
  },
} as const;
