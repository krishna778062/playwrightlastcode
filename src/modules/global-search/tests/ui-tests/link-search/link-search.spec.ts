import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { generateUniqueLinkTestData } from '@/src/modules/global-search/test-data/link-search.test-data';
import { searchTestFixtures as test } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';
import { GlobalSearchResultPage } from '@/src/modules/global-search/ui/pages/globalSearchResultPage';

test.describe(
  'test Global Search - Link Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.LINK_SEARCH],
  },
  () => {
    let linkName: string;
    let linkUrl: string;

    test.beforeEach('Setting up the test environment for link search', async ({ appManagerFixture }) => {
      try {
        // Generate unique test data to avoid conflicts in parallel execution
        const linkDetails = generateUniqueLinkTestData();
        linkName = linkDetails.testLink.name;
        linkUrl = linkDetails.testLink.url;

        // Append unique link to existing settings using service
        await appManagerFixture.linkManagementService.addExternalLink(linkDetails.testLink);
        console.log(`Added unique link: ${linkName}`);

        console.log('Successfully added a link ');
      } catch (error) {
        console.error('Failed to set up test environment:', error);
        throw error;
      }
    });

    test.afterEach('Tearing down the test environment for link search', async ({ appManagerFixture }) => {
      try {
        await appManagerFixture.linkManagementService.removeExternalLink(linkName);
        console.log(`Removed unique external link: ${linkName}`);
      } catch (error) {
        console.warn('Failed to clean up test environment:', error);
      }
    });

    test(
      'verify Link Search results for a new external link',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-16516',
        });

        // Search for the unique link
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(linkName, {
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

    test(
      'verify link list in autocomplete suggestions dropdown',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-16517',
        });

        const topNavBarComponent = appManagerFixture.navigationHelper.topNavBarComponent;
        await topNavBarComponent.typeInSearchBarInput(linkName, {
          stepInfo: `Typing "${linkName}" in search input`,
        });

        const globalSearchResultPage = new GlobalSearchResultPage(appManagerFixture.page);
        const linkResult = await globalSearchResultPage.getAutocompleteAppItemByName(linkName, {
          stepInfo: `Getting link autocomplete item "${linkName}"`,
        });

        // Verify link name is visible in autocomplete
        await linkResult.verifyAppNameIsVisibleInAutocomplete(linkName, {
          stepInfo: `Verifying link name "${linkName}" is visible in autocomplete`,
        });
        await linkResult.verifyIconIsDisplayedInAutocomplete(linkUrl, {
          stepInfo: 'Verifying link icon is displayed in autocomplete',
        });

        // Verify navigation in new tab
        await linkResult.verifyAppLinkOpensInNewTab(linkUrl, {
          stepInfo: `Verifying link opens in new tab with URL "${linkUrl}"`,
        });
      }
    );
  }
);
