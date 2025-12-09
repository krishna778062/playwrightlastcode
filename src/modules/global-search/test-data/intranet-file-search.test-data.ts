export interface IntranetFileSearchTestCase {
  content: string;
  category: string;
  label: string;
}

/**
 * Generates a unique filename with timestamp to avoid conflicts
 * @param baseName - The base name of the file
 * @param extension - The file extension
 * @returns Unique filename with timestamp
 */
function generateUniqueFileName(baseName: string, extension: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  return `${baseName}_${timestamp}_${randomSuffix}.${extension}`;
}

export const INTRANET_FILE_SEARCH_TEST_DATA = {
  category: 'Uncategorized',
  fileTypes: [
    {
      type: 'pptx',
      fileName: generateUniqueFileName('TestPresentation', 'pptx'),
      originalFileName: 'File.pptx',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      label: 'Microsoft PowerPoint',
      typeFilter: 'Presentation',
    },
    {
      type: 'pdf',
      fileName: generateUniqueFileName('TestDocument', 'pdf'),
      originalFileName: 'FilePdf.pdf',
      mimeType: 'application/pdf',
      label: 'PDF',
      typeFilter: 'Document File',
    },
    {
      type: 'docx',
      fileName: generateUniqueFileName('TestWordDoc', 'docx'),
      originalFileName: 'File.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      label: 'Word Document',
      typeFilter: 'Document File',
    },
    {
      type: 'csv',
      fileName: generateUniqueFileName('TestData', 'csv'),
      originalFileName: 'File.csv',
      mimeType: 'text/csv',
      label: 'CSV',
      typeFilter: 'Spreadsheet',
    },
  ],
};
