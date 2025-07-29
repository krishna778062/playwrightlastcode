import { App } from '../../../core/types/app.type';

export interface AppsSearchTestCase {
  appName: string;
  appUrl: string;
  appIcon: string;
  searchTerm: string;
}

export const APPS_SEARCH_TEST_DATA: AppsSearchTestCase = {
  appName: 'Office',
  appUrl: 'https://office.com',
  appIcon: 'https://www.gstatic.com/marketing-cms/assets/images/a1/dc/7a128978412e8104d1b399f38c33/admin.webp',
  searchTerm: 'Office',
};

export const TEST_APP: App = {
  name: APPS_SEARCH_TEST_DATA.appName,
  url: APPS_SEARCH_TEST_DATA.appUrl,
  img: APPS_SEARCH_TEST_DATA.appIcon,
};

/**
 * Generates unique test data for parallel test execution
 * @returns Unique test data to avoid state corruption
 */
export function generateUniqueTestData(): {
  testData: AppsSearchTestCase;
  testApp: App;
} {
  // Create a very short unique suffix using timestamp and random string
  const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
  const randomStr = Math.random().toString(36).substring(2, 4); // 2 random alphanumeric chars
  const uniqueSuffix = `${timestamp}${randomStr}`;

  const testData: AppsSearchTestCase = {
    appName: `App${uniqueSuffix}`,
    appUrl: 'https://example.com', // Use a real, accessible URL
    appIcon: 'https://www.gstatic.com/marketing-cms/assets/images/a1/dc/7a128978412e8104d1b399f38c33/admin.webp',
    searchTerm: `App${uniqueSuffix}`,
  };

  const testApp: App = {
    name: testData.appName,
    url: testData.appUrl,
    img: testData.appIcon,
  };

  return { testData, testApp };
}
