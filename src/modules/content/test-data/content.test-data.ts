import { ContentCreationData, CoverImageUpload } from '../types/content.type';

export const CONTENT_TEST_DATA = {
  COVER_IMAGES: {
    RATIO_300x300: {
      fileName: '300x300 RATIO_Text.png',
      cropForWidescreen: true,
      cropForSquare: true,
    } as CoverImageUpload,
  },
  
  DEFAULT_PAGE_CONTENT: {
    title: 'Test Page Content',
    contentType: 'page',
    coverImage: '300x300 RATIO_Text.png',
    cropSettings: {
      widescreen: true,
      square: true,
    },
  } as ContentCreationData,
  
  TIMEOUTS: {
    DEFAULT: 30_000,
    UPLOAD: 60_000,
    NAVIGATION: 15_000,
  },
} as const; 