export const FILES_SEARCH_TEST_DATA = {
  CONFIG: {
    DEFAULT_TIMEOUT: 150_000,
  },
  FILE_TYPES: {
    PDF: 'pdf',
    DOCX: 'docx',
    XLSX: 'xlsx',
    PPTX: 'pptx',
    IMAGE: 'image',
    VIDEO: 'video',
  },
  SEARCH_TERMS: {
    REPORT: 'report',
    PRESENTATION: 'presentation',
    SPREADSHEET: 'spreadsheet',
    MANUAL: 'manual',
  },
  FILE_CATEGORIES: {
    DOCUMENTS: 'Documents',
    SPREADSHEETS: 'Spreadsheets',
    PRESENTATIONS: 'Presentations',
    IMAGES: 'Images',
    VIDEOS: 'Videos',
  },
  FILE_STATUS: {
    PUBLISHED: 'published',
    DRAFT: 'draft',
    ARCHIVED: 'archived',
  },
  PERMISSIONS: {
    READ: 'read',
    WRITE: 'write',
    ADMIN: 'admin',
    NONE: 'none',
  },
  MESSAGES: {
    FILE_UPLOADED: 'File uploaded successfully',
    FILE_DOWNLOADED: 'File downloaded',
    FILE_SHARED: 'File shared',
    FILE_DELETED: 'File deleted',
  },
} as const;

export type FilesSearchTestData = typeof FILES_SEARCH_TEST_DATA;
