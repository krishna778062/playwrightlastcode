import { FileUtil } from '@core/utils/fileUtil';

/**
 * File test data with helper functions to get file paths
 * All functions require the spec file's __dirname to correctly resolve paths
 */
export const FILE_TEST_DATA = {
  /**
   * Image files
   */
  IMAGES: {
    IMAGE1: {
      fileName: 'image1.jpg',
      getPath: (specDir: string) => {
        return FileUtil.getFilePath(
          specDir,
          '..',
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          'image1.jpg'
        );
      },
    },
    IMAGE3: {
      fileName: 'image3.jpg',
      getPath: (specDir: string) => {
        return FileUtil.getFilePath(
          specDir,
          '..',
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          'image3.jpg'
        );
      },
    },
    IMAGE4: {
      fileName: 'image4.jpg',
      getPath: (specDir: string) => {
        return FileUtil.getFilePath(
          specDir,
          '..',
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          'image4.jpg'
        );
      },
    },
    IMAGE786: {
      fileName: 'image786.jpg',
      getPath: (specDir: string) => {
        return FileUtil.getFilePath(
          specDir,
          '..',
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          'image786.jpg'
        );
      },
    },
    FAVICON: {
      fileName: 'favicon.png',
      getPath: (specDir: string) => {
        return FileUtil.getFilePath(
          specDir,
          '..',
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          'favicon.png'
        );
      },
    },
    RATIO_TEXT: {
      fileName: '300x300 RATIO_Text.png',
      getPath: (specDir: string) => {
        return FileUtil.getFilePath(
          specDir,
          '..',
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          '300x300 RATIO_Text.png'
        );
      },
    },
    GIF1: {
      fileName: 'Gif1.gif',
      getPath: (specDir: string) => {
        return FileUtil.getFilePath(specDir, '..', '..', '..', '..', 'test-data', 'static-files', 'images', 'Gif1.gif');
      },
    },
  },

  /**
   * Document files
   */
  DOCUMENTS: {
    FILES_PREVIEW_BEHAVE_DOC_1_PDF: {
      fileName: 'FilesPreview_BEHAVE_DOC_1_PDF.pdf',
      getPath: (specDir: string) => {
        return FileUtil.getFilePath(
          specDir,
          '..',
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'documents',
          'FilesPreview_BEHAVE_DOC_1_PDF.pdf'
        );
      },
    },
    FILES_PREVIEW_DELETE_DOC_1_PDF: {
      fileName: 'FilesPreview_DELETE_DOC_1_PDF.pdf',
      getPath: (specDir: string) => {
        return FileUtil.getFilePath(
          specDir,
          '..',
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'documents',
          'FilesPreview_DELETE_DOC_1_PDF.pdf'
        );
      },
    },
  },

  /**
   * Excel/Document files
   */
  EXCEL: {
    SAMPLE_XLSX: {
      fileName: 'sample.xlsx',
      getPath: (specDir: string) => {
        return FileUtil.getFilePath(
          specDir,
          '..',
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'excel',
          'sample.xlsx'
        );
      },
    },
    SAMPLE_DOCX: {
      fileName: 'sample.docx',
      getPath: (specDir: string) => {
        return FileUtil.getFilePath(
          specDir,
          '..',
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'excel',
          'sample.docx'
        );
      },
    },
  },
} as const;
