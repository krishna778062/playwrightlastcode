export const SITE_SEARCH_TEST_DATA = {
  CONFIG: {
    DEFAULT_TIMEOUT: 180_000,
  },
  CATEGORIES: {
    CATEGORYNAME: 'Uncategorized',
  },
  SITE_TYPES: {
    PUBLIC: 'public',
    PRIVATE: 'private',
  },
  LABELS: {
    SITE: 'site',
  },
  MESSAGES: {
    COPIED: 'Copied',
  },
} as const;

export type SiteSearchTestData = typeof SITE_SEARCH_TEST_DATA;
