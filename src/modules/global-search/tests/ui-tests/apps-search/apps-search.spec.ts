import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { GlobalSearchTestSuite } from '@/src/modules/global-search/constants/testSuite';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { generateUniqueTestData } from '@/src/modules/global-search/test-data/apps-search.test-data';

test.describe(
  'Test Global Search - Apps Search functionality',
  {
    tag: [GlobalSearchTestSuite.GLOBAL_SEARCH, GlobalSearchTestSuite.APPS_SEARCH],
  },
  () => {
    let originalAppsSettings: any;
    let uniqueTestData: any;
    let uniqueTestApp: any;

    test.beforeEach('Setting up the test environment for apps search', async ({ appManagerApiClient }) => {
      try {
        // Generate unique test data to avoid conflicts in parallel execution
        const { testData, testApp } = generateUniqueTestData();
        uniqueTestData = testData;
        uniqueTestApp = testApp;

        console.log(`Generated unique test data: ${uniqueTestData.appName}`);

        // Store original apps settings
        const currentSettings = await appManagerApiClient.getAppsManagementService().getAppsSettings();
        originalAppsSettings = currentSettings.result;

        // Add unique test app to the apps settings
        await appManagerApiClient.getAppsManagementService().addApp(uniqueTestApp);
        console.log(`Added unique app: ${uniqueTestApp.name}`);

        // Wait until the app appears in the launchpad apps list
        await appManagerApiClient.getAppsManagementService().waitForAppToAppearInLaunchpadList(uniqueTestData.appName);

        await appManagerApiClient.getAppsManagementService().getAppsSettings();
        await appManagerApiClient.getAppsManagementService().getLaunchpadAppsList();
        console.log('Successfully set up test environment for apps search');
      } catch (error) {
        console.error('Failed to set up test environment:', error);
        throw error;
      }
    });

    test.afterEach('Tearing down the test environment for apps search', async ({ appManagerApiClient }) => {
      try {
        // Remove the specific test app we added
        if (uniqueTestApp) {
          await appManagerApiClient.getAppsManagementService().removeApp(uniqueTestApp.name);
          console.log(`Removed unique app: ${uniqueTestApp.name}`);
        }
      } catch (error) {
        console.warn('Failed to clean up test environment:', error);
      }
    });

    test(
      'Verify Apps Search results for a new app',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-10325',
          storyId: 'SEN-16500',
        });

        // Search for the unique app
        const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(uniqueTestData.searchTerm, {
          stepInfo: `Searching for unique app "${uniqueTestData.appName}"`,
        });

        // Get the app result item
        const appResultItem = await globalSearchResultPage.getAppResultItemExactlyMatchingTheSearchTerm(
          uniqueTestData.appName
        );

        // Comprehensive verification of all app attributes
        await appResultItem.verifyAllAppAttributes(
          uniqueTestData.appName,
          uniqueTestData.appUrl,
          uniqueTestData.appIcon
        );

        // Verify app link opens in new tab (URL doesn't need to be valid for our test case)
        await appResultItem.verifyAppLinkOpensInNewTab(uniqueTestData.appUrl);
      }
    );
  }
);
