import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { searchTestFixtures as test } from '@/src/modules/global-search/fixtures/searchTestFixture';
import { PAGE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/content-search.test-data';
import { ContentType } from '@/src/core/constants/contentTypes';

test.describe(
  'Global Search - Page Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.CONTENT_SEARCH],
  },
  () => {
    const testData = PAGE_SEARCH_TEST_DATA;

    test(
      `Verify Content Search results for a new ${testData.content}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerHomePage, contentManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-12432',
          storyId: 'SEN-12295',
        });

        const { siteId, siteName, contentId, pageName, authorName, contentDescription } =
          await contentManagementHelper.createSiteAndPage(testData.category, {
            contentType: testData.content,
            contentSubType: testData.contentType!,
          });

        // 4. UI Search for the page
        const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(pageName, {
          stepInfo: `Searching with term "${pageName}" and intent is to find the content`,
        });

        // 5. Verify the page result item's data points
        await globalSearchResultPage.verifyContentResultItemDataPoints(ContentType.Page, {
          name: pageName,
          label: testData.label,
          description: contentDescription,
          author: authorName,
          contentType: 'Page',
          contentId,
          siteId,
          siteName,
        });
      }
    );
  }
);
