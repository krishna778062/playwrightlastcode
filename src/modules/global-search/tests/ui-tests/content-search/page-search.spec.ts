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
    let siteId: string;
    let siteName: string;
    let contentId: string;
    let pageName: string;
    let authorName: string;

    test.beforeEach(
      `Setting up the test environment for page search by creating site and page content`,
      async ({ contentManagementHelper }) => {
        const siteAndPageDetails = await contentManagementHelper.createSiteAndPage(
          testData.category,
          {
            contentType: testData.content,
            contentSubType: testData.contentType!,
          },
          {
            contentDescription: testData.description,
            accessType: testData.accessType,
          }
        );

        siteId = siteAndPageDetails.siteId;
        siteName = siteAndPageDetails.siteName;
        contentId = siteAndPageDetails.contentId;
        pageName = siteAndPageDetails.pageName;
        authorName = siteAndPageDetails.authorName;
        console.log(`Created page "${pageName}" in site "${siteName}" with ID: ${siteId}`);
      }
    );

    test(
      `Verify Content Search results for a new ${testData.content}`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-12432',
          storyId: 'SEN-12295',
        });

        // 4. UI Search for the page
        const globalSearchResultPage = await appManagerHomePage.actions.searchForTerm(pageName, {
          stepInfo: `Searching with term "${pageName}" and intent is to find the content`,
        });

        // 5. Verify the page result item's data points
        await globalSearchResultPage.verifyContentResultItemDataPoints(ContentType.Page, {
          name: pageName,
          label: testData.label,
          description: testData.description,
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
