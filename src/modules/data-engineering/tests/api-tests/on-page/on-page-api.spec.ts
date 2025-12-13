import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SITE_ACCESS_TYPES } from '@/src/modules/content/constants/siteTypes';
import { DataEngineeringTestSuite } from '@/src/modules/data-engineering/constants/testSuite';
import { analyticsTestFixture as test } from '@/src/modules/data-engineering/fixtures/analyticsFixture';
import {
  validateBlogContentEngagement,
  validateContentEngagement,
} from '@/src/modules/data-engineering/helpers/contentEngagementTestHelper';

const siteTypes: SITE_ACCESS_TYPES[] = [
  SITE_ACCESS_TYPES.PUBLIC,
  SITE_ACCESS_TYPES.PRIVATE,
  SITE_ACCESS_TYPES.UNLISTED,
];

test.describe(
  'on-page analytics API tests',
  {
    tag: [DataEngineeringTestSuite.ON_PAGE_ANALYTICS, '@api-tests'],
  },
  () => {
    test(
      'validate content engagement API for Blog post content',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@content-engagement', '@blog-post'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate content engagement API response for Blog post content',
          zephyrTestId: 'DE-27162',
          storyId: 'DE-26267',
        });

        await validateBlogContentEngagement({
          appManagerApiFixture,
          testInfo: test.info(),
          skipFn: test.skip,
        });
      }
    );

    for (const siteType of siteTypes) {
      test(
        `validate content engagement API for ${siteType} site content`,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE, '@content-engagement', `@${siteType.toLowerCase()}-site`],
        },
        async ({ appManagerApiFixture }) => {
          tagTest(test.info(), {
            description: `Validate content engagement API response for ${siteType} site content`,
            zephyrTestId: 'DE-27065',
            storyId: 'DE-26267',
          });

          await validateContentEngagement({
            appManagerApiFixture,
            siteType,
            testInfo: test.info(),
            skipFn: test.skip,
          });
        }
      );
    }
  }
);
