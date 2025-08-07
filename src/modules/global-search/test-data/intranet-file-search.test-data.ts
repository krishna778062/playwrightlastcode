export interface IntranetFileSearchTestCase {
  content: string;
  category: string;
  label: string;
}

export const INTRANET_FILE_SEARCH_TEST_DATA = {
  category: 'Uncategorized',
  fileTypes: [
    {
      type: 'pdf',
      fileName: 'FilePdf.pdf',
      mimeType: 'application/pdf',
      label: 'PDF',
    },
    {
      type: 'docx',
      fileName: 'File.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      label: 'Word Document',
    },
    {
      type: 'pptx',
      fileName: 'File.pptx',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      label: 'Microsoft PowerPoint',
    },
    {
      type: 'csv',
      fileName: 'File.csv',
      mimeType: 'text/csv',
      label: 'CSV',
    },
  ],
};
