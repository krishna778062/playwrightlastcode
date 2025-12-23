import { expect } from '@playwright/test';

import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentApiHelper } from '@/src/modules/content/apis/apiValidation/contentAPIHelper';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

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
      'content API : Test Content B2B list API CONT-43009',
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

        const languages = CONTENT_TEST_DATA.B2B_LANGUAGES;

        const responses = await Promise.all(
          languages.map(lang =>
            appManagerApiFixture.b2bHelper.getContentList({
              contentIds: [contentIds[0], contentIds[1]],
              content_type: 'all',
              requestedLanguages: [lang],
              size: 3,
            })
          )
        );

        for (let i = 0; i < responses.length; i++) {
          console.log(`B2B content list response for ${languages[i]}: ${JSON.stringify(responses[i])}`);
          await contentApiHelper.validateB2BContentList(responses[i]);
          expect(responses[i].result.listOfItems.length).toBeLessThanOrEqual(3);
        }
      }
    );
  }
);
