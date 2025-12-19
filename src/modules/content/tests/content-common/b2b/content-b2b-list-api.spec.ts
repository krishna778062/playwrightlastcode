import { expect } from '@playwright/test';

import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentApiHelper } from '@/src/modules/content/apis/apiValidation/contentAPIHelper';
import { B2B_TEST_DATA } from '@/src/modules/content/test-data/b2b.test-data';

test.describe(
  '@Content B2B API',
  {
    tag: [ContentTestSuite.API],
  },
  () => {
    let contentApiHelper: ContentApiHelper;

    test.beforeEach(async () => {
      contentApiHelper = new ContentApiHelper();
    });

    test(
      'content API : Test Content B2B list API',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-43009', ContentTestSuite.CONTENT_APP_MANAGER],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Content API : Test Content B2B list API',
          zephyrTestId: 'CONT-43009',
          storyId: 'CONT-43009',
        });

        const contentDetails = await appManagerApiFixture.contentManagementHelper.getContentItems(2);

        // Extract content IDs from the content details
        const contentIds = contentDetails.map(item => item.contentId);

        // Get content list using B2B API
        const response = await appManagerApiFixture.b2bHelper.getContentList({
          contentIds: [contentIds[0], contentIds[1]],
          content_type: 'all',
          requestedLanguages: ['en'],
          size: 3,
        });

        console.log(`B2B content list response: ${JSON.stringify(response)}`);

        // Validate response structure and manualTranslationsFields
        await contentApiHelper.validateB2BContentList(response);
      }
    );

    test(
      'content API : Baseline flow for B2B list sanity',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, '@CONT-43525', ContentTestSuite.CONTENT_APP_MANAGER],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Baseline flow for B2B list (sanity) using extracted contentIds',
          zephyrTestId: 'CONT-43525',
          storyId: 'CONT-43525',
        });

        const contentDetails = await appManagerApiFixture.contentManagementHelper.getContentItems(2);
        const contentIds = contentDetails.map(item => item.contentId);

        const response = await appManagerApiFixture.b2bHelper.getContentList({
          contentIds: [contentIds[0], contentIds[1]],
          content_type: B2B_TEST_DATA.REQUEST_PARAMS.contentType,
          requestedLanguages: [...B2B_TEST_DATA.REQUEST_PARAMS.requestedLanguages],
          size: B2B_TEST_DATA.REQUEST_PARAMS.size,
        });

        console.log(`B2B content list response: ${JSON.stringify(response)}`);

        await contentApiHelper.validateB2BContentListResponse(response);
        expect(response.result.listOfItems.length).toBeLessThanOrEqual(B2B_TEST_DATA.REQUEST_PARAMS.size);
      }
    );
  }
);
