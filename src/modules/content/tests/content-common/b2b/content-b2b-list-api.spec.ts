import { expect } from '@playwright/test';

import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentApiHelper } from '@/src/modules/content/apis/apiValidation/contentAPIHelper';

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
        const contentIds = contentDetails.map(item => item.contentId);

        const response = await appManagerApiFixture.b2bHelper.getContentList({
          contentIds: [contentIds[0], contentIds[1]],
          content_type: 'all',
          requestedLanguages: ['en'],
          size: 3,
        });

        console.log(`B2B content list response: ${JSON.stringify(response)}`);

        await contentApiHelper.validateB2BContentList(response);
        expect(response.result.listOfItems.length).toBeLessThanOrEqual(3);
      }
    );
  }
);
