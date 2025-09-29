import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { generateUniqueLinkTestData } from '@/src/modules/global-search/test-data/link-search.test-data';
import { searchTestFixtures as test } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';

test.describe(
  'Test Global Search - Link Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.LINK_SEARCH],
  },
  () => {
    let linkName: string;
    let linkUrl: string;

    test.beforeEach('Setting up the test environment for link search', async ({ linkManagementService }) => {
      try {
        // Generate unique test data to avoid conflicts in parallel execution
        const linkDetails = generateUniqueLinkTestData();
        linkName = linkDetails.testLink.name;
        linkUrl = linkDetails.testLink.url;

        // Append unique link to existing settings using service
        await linkManagementService.addExternalLink(linkDetails.testLink);
        console.log(`Added unique link: ${linkName}`);

        console.log('Successfully added a link ');
      } catch (error) {
        console.error('Failed to set up test environment:', error);
        throw error;
      }
    });

    test.afterEach('Tearing down the test environment for link search', async ({ linkManagementService }) => {
      try {
        await linkManagementService.removeExternalLink(linkName);
        console.log(`Removed unique external link: ${linkName}`);
      } catch (error) {
        console.warn('Failed to clean up test environment:', error);
      }
    });

    test(
      'Verify Link Search results for a new external link',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerHomePage, appManagerUINavigationHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-16516',
        });

        await appManagerHomePage.verifyThePageIsLoaded();
        // Search for the unique link
        const globalSearchResultPage = await appManagerUINavigationHelper.searchForTerm(linkName, {
          stepInfo: `Searching for unique link "${linkName}"`,
        });

        // Get the link result item
        const linkResultItem = await globalSearchResultPage.getAppResultItemExactlyMatchingTheSearchTerm(linkName);

        // Comprehensive verification of all app attributes
        await linkResultItem.verifyAllAppAttributes({
          expectedName: linkName,
          expectedUrl: linkUrl,
          validateLinkIcon: true,
        });

        // Verify app link opens in new tab (URL doesn't need to be valid for our test case)
        await linkResultItem.verifyAppLinkOpensInNewTab(linkUrl);
      }
    );
  }
);
