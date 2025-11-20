/**
 * Test data for federated search functionality
 */
export interface FederatedSearchTestCase {
  searchTerm: string;
  integrationName: string;
  integrationDisplayName: string;
  fileName: string;
  author: string;
  date: string;
  fileType: string;
  fileTypeLabel: string;
}

export const FEDERATED_SEARCH_TEST_DATA: {
  boxIntegration: FederatedSearchTestCase;
} = {
  boxIntegration: {
    searchTerm: 'boxLife Services EAP.pdf',
    integrationName: 'Box',
    integrationDisplayName: 'Box',
    fileName: 'boxLife Services EAP.pdf',
    author: 'Joanna Smith',
    date: 'Nov 20, 2024',
    fileType: 'pdf',
    fileTypeLabel: 'PDF',
  },
};
