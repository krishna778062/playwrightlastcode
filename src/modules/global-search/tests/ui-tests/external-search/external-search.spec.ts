import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ExternalSearch } from '@/src/core/types/externalSearch.type';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { generateUniqueExternalSearchTestData } from '@/src/modules/global-search/test-data/external-search.test-data';
import { searchTestFixtures as test } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';

test.describe(
  'global Search - To verify External Search links',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.EXTERNAL_SEARCH],
  },
  () => {
    let expectedProviderOrder: ExternalSearch['provider'][];
    let searchTerm: string;

    test.beforeEach('Setup External Search Configuration', async ({ appManagerFixture }) => {
      // Generate unique test data to avoid conflicts in parallel execution
      const testData = generateUniqueExternalSearchTestData();
      expectedProviderOrder = testData.expectedProviderOrder;
      searchTerm = testData.searchTerm;

      // Setup external search configuration directly
      await test.step('Setup External Search Configuration', async () => {
        await test.step(`Configure ${testData.providers.length} unique external search providers`, async () => {
          await appManagerFixture.externalSearchManagementService.updateExternalSearchConfig(testData.providers);
        });
      });
    });

    test(
      'to verify that external search is displaying correctly and responsive in Workplace Search',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-15167',
          storyId: 'SEN-14964',
        });

        await appManagerFixture.homePage.verifyThePageIsLoaded();
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(searchTerm, {
          stepInfo: `Searching with term "${searchTerm}" to verify external search links`,
        });

        const externalSearchListComponent = await globalSearchResultPage.verifyExternalSearchLinksAreDisplayed();
        await externalSearchListComponent.verifyExternalSearchLinksOrder(expectedProviderOrder);
        await externalSearchListComponent.verifyNavigationToExternalSearchLinks(expectedProviderOrder);
      }
    );
  }
);
