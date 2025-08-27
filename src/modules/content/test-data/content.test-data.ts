export const CONTENT_TEST_DATA = {
  COVER_IMAGES: {
    RATIO_300x300: {
      fileName: '300x300 RATIO_Text.png',
      cropForWidescreen: true,
      cropForSquare: true,
    },
  },

  DEFAULT_PAGE_CONTENT: {
    title: 'Test Page Content',
    contentType: 'page',
    coverImage: '300x300 RATIO_Text.png',
    cropSettings: {
      widescreen: true,
      square: true,
    },
  },

  DEFAULT_ALBUM_CONTENT: {
    title: 'Test Album Content',
    contentType: 'album',
    images: ['300x300 RATIO_Text.png'],
    videoUrls: ['https://youtu.be/4vLyqzOr14g'],
    attachments: ['test-attachment.pdf'],
  },

  TIMEOUTS: {
    DEFAULT: 30_000,
    UPLOAD: 60_000,
    NAVIGATION: 15_000,
    VIDEO_UPLOAD: 90_000,
  },
} as const;
