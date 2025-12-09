import path from 'path';

/**
 * Test data constants for audience CSV upload tests
 */
export const AUDIENCE_TEST_DATA = {
  CSV_FILES: {
    VALID_AUDIENCE: path.join(__dirname, 'validAudience.csv'),
    INVALID_SITES: path.join(__dirname, 'invalidSites.csv'),
    EMPTY_CSV: path.join(__dirname, 'emptyCsv.csv'),
  },

  EXPECTED_CSV_CONTENT: {
    VALID_AUDIENCE_HEADERS: ['first_name', 'last_name', 'email', 'company'],
    VALID_AUDIENCE_ROW_COUNT: 2,
  },
} as const;
