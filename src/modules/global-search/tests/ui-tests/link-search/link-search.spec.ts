import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { AppsSettingsPayload, ExternalLink } from '@/src/core/types/app.type';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { generateUniqueLinkTestData } from '@/src/modules/global-search/test-data/link-search.test-data';

test.describe(
  'Test Global Search - Link Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.LINK_SEARCH],
  },
  () => {
    let linkName: string;
    let linkUrl: string;

    test.beforeEach('Setting up the test environment for link search', async ({ appManagerApiClient }) => {
      try {
        // Generate unique test data to avoid conflicts in parallel execution
        const linkDetails = generateUniqueLinkTestData();
        linkName = linkDetails.testLink.name;
        linkUrl = linkDetails.testLink.url;

        // Append unique link to existing settings using service
        await appManagerApiClient.getLinkManagementService().addExternalLink(linkDetails.testLink);
        console.log(`Added unique link: ${linkName}`);

        console.log('Successfully added a link ');
      } catch (error) {
        console.error('Failed to set up test environment:', error);
        throw error;
      }
    });

    test.afterEach('Tearing down the test environment for link search', async ({ appManagerApiClient }) => {
      try {
        await appManagerApiClient.getLinkManagementService().removeExternalLink(linkName);
        console.log(`Removed unique external link: ${linkName}`);
      } catch (error) {
        console.warn('Failed to clean up test environment:', error);
      }
    });

    test(
      'Verify Link Search results for a new external link',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-16516',
        });

        // Search for the unique link
        const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(linkName, {
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
