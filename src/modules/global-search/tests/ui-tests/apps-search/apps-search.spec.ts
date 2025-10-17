import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { generateUniqueTestData } from '@/src/modules/global-search/test-data/apps-search.test-data';
import { searchTestFixtures as test } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';

test.describe(
  'test Global Search - Apps Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.APPS_SEARCH],
  },
  () => {
    let originalAppsSettings: any;
    let uniqueTestData: any;
    let uniqueTestApp: any;

    test.beforeEach('Setting up the test environment for apps search', async ({ appManagerFixture }) => {
      try {
        // Generate unique test data to avoid conflicts in parallel execution
        const { testData, testApp } = generateUniqueTestData();
        uniqueTestData = testData;
        uniqueTestApp = testApp;

        console.log(`Generated unique test data: ${uniqueTestData.appName}`);

        // Store original apps settings
        const currentSettings = await appManagerFixture.appManagementService.getAppsSettings();
        originalAppsSettings = currentSettings.result;

        // Add unique test app to the apps settings
        await appManagerFixture.appManagementService.addApp(uniqueTestApp);
        console.log(`Added unique app: ${uniqueTestApp.name}`);

        // Wait until the app appears in the launchpad apps list
        await appManagerFixture.appManagementService.waitForAppToAppearInLaunchpadList(uniqueTestData.appName);

        await appManagerFixture.appManagementService.getAppsSettings();
        await appManagerFixture.appManagementService.getLaunchpadAppsList();
        console.log('Successfully set up test environment for apps search');
      } catch (error) {
        console.error('Failed to set up test environment:', error);
        throw error;
      }
    });

    test.afterEach('Tearing down the test environment for apps search', async ({ appManagerFixture }) => {
      try {
        // Remove the specific test app we added
        if (uniqueTestApp) {
          await appManagerFixture.appManagementService.removeApp(uniqueTestApp.name);
          console.log(`Removed unique app: ${uniqueTestApp.name}`);
        }
      } catch (error) {
        console.warn('Failed to clean up test environment:', error);
      }
    });

    test(
      'verify Apps Search results for a new app',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-10325',
          storyId: 'SEN-16500',
        });

        // Search for the unique app
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(
          uniqueTestData.searchTerm,
          {
            stepInfo: `Searching for unique app "${uniqueTestData.appName}"`,
          }
        );

        // Get the app result item
        const appResultItem = await globalSearchResultPage.getAppResultItemExactlyMatchingTheSearchTerm(
          uniqueTestData.appName
        );

        // Comprehensive verification of all app attributes
        await appResultItem.verifyAllAppAttributes({
          expectedName: uniqueTestData.appName,
          expectedUrl: uniqueTestData.appUrl,
          expectedIconSrc: uniqueTestData.appIcon,
        });

        // Verify app link opens in new tab (URL doesn't need to be valid for our test case)
        await appResultItem.verifyAppLinkOpensInNewTab(uniqueTestData.appUrl);
      }
    );
  }
);
