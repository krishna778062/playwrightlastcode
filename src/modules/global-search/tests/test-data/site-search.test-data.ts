export const SITE_SEARCH_TEST_DATA = {
  CONFIG: {
    DEFAULT_TIMEOUT: 180_000,
  },
  SEARCH_TERMS: {
    SALES: 'Sales',
    FINANCE: 'Finance',
  },
  CATEGORIES: {
    DEPARTMENTS: 'Departments',
    PROJECTS: 'Projects',
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
    SITE_LABEL: 'site',
  },
} as const;

export type SiteSearchTestData = typeof SITE_SEARCH_TEST_DATA;
