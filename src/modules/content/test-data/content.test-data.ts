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

  TIMEOUTS: {
    DEFAULT: 30_000,
    UPLOAD: 60_000,
    NAVIGATION: 15_000,
    VIDEO_UPLOAD: 90_000,
  },
} as const;
