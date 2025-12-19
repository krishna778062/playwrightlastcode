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

        const languages = [
          'en-US',
          'en-GB',
          'fr-FR',
          'fr-CA',
          'es-ES',
          'de-DE',
          'it-IT',
          'ja-JP',
          'pt-BR',
          'zh-CN',
          'nl-NL',
          'ro-RO',
          'hy-AM',
          'bg-BG',
          'da-DA',
          'ms-MY',
          'th-TH',
          'el-GR',
          'ko-KR',
          'tl-PH',
          'sq-AL',
          'hi-IN',
          'fi-FI',
          'sv-SE',
          'es-419',
          'pt-PT',
          'no-NO',
          'vi-VN',
          'cs-CZ',
        ];

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
