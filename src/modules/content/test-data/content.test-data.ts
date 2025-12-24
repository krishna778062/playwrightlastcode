import { faker } from '@faker-js/faker';

import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';

export const CONTENT_TEST_DATA = {
  COVER_IMAGES: {
    RATIO_300x300: {
      fileName: '300x300 RATIO_Text.png',
      cropForWidescreen: true,
      cropForSquare: true,
    },
  },

  DEFAULT_PAGE_CONTENT: {
    title: `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Page`,
    content: 'page',
    category: 'Uncategorized',
    label: 'Page',
    contentType: 'news',
    description: 'Test page content for global search verification and validation',
    accessType: SITE_TYPES.PUBLIC,
    coverImage: '300x300 RATIO_Text.png',
    cropSettings: {
      widescreen: true,
      square: true,
    },
  },

  DEFAULT_ALBUM_CONTENT: {
    title: 'Test Album Content',
    contentType: 'album',
    images: ['image1.jpg', 'image3.jpg'],
    videoUrls: [
      'https://youtu.be/4vLyqzOr14g',
      'https://youtu.be/QYHXJ_kRXbw?feature=shared',
      'https://youtu.be/-2RAq5o5pwc?si=JxHzuerkcqO8VTDf',
    ],
    attachments: ['image1.jpg', 'testData.txt'],
  },

  DEFAULT_EVENT_CONTENT: {
    title: `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Event`,
    contentType: 'event',
    description: 'Test event content for global search verification and validation',
    location: 'Delhi, India',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },

  TOAST_MESSAGES: {
    PAGE_PUBLISHED_SUCCESSFULLY: "Created page successfully - it's published",
    EVENT_PUBLISHED_SUCCESSFULLY: "Created event successfully - it's published",
    ALBUM_PUBLISHED_SUCCESSFULLY: "Created album successfully - it's published",
  },
  TIMEOUTS: {
    DEFAULT: 30_000,
    UPLOAD: 60_000,
    NAVIGATION: 15_000,
    VIDEO_UPLOAD: 90_000,
  },
  B2B_LANGUAGES: [
    'en-US',
    'en-GB',
    'fr-FR',
    'fr-CA',
    'es-ES',
    'de-DE',
    'it-IT',
    'ja-JP',
    'pt-BR',
    'zh-CN',
    'nl-NL',
    'ro-RO',
    'hy-AM',
    'bg-BG',
    'da-DA',
    'ms-MY',
    'th-TH',
    'el-GR',
    'ko-KR',
    'tl-PH',
    'sq-AL',
    'hi-IN',
    'fi-FI',
    'sv-SE',
    'es-419',
    'pt-PT',
    'no-NO',
    'vi-VN',
    'cs-CZ',
  ],
} as const;
