import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SITE_ACCESS_TYPES } from '@/src/modules/content/constants/siteTypes';
import { DataEngineeringTestSuite } from '@/src/modules/data-engineering/constants/testSuite';
import { analyticsTestFixture as test } from '@/src/modules/data-engineering/fixtures/analyticsFixture';
import { validateContentEngagement } from '@/src/modules/data-engineering/helpers/contentEngagementTestHelper';

const abacSiteTypes: SITE_ACCESS_TYPES[] = [SITE_ACCESS_TYPES.PUBLIC, SITE_ACCESS_TYPES.PRIVATE];

test.describe(
  'on-page analytics API ABAC tests',
  {
    tag: [DataEngineeringTestSuite.ON_PAGE_ANALYTICS, '@api-tests', '@abac'],
  },
  () => {
    // ABAC tests: Public and Private sites with both restricted and unrestricted content
    for (const siteType of abacSiteTypes) {
      test(
        `validate content engagement API for unrestricted ${siteType} site content`,
        {
          tag: [
            TestPriority.P0,
            TestGroupType.SMOKE,
            '@content-engagement',
            '@unrestricted',
            `@${siteType.toLowerCase()}-site`,
          ],
        },
        async ({ appManagerApiFixture }) => {
          tagTest(test.info(), {
            description: `Validate content engagement API response for unrestricted ${siteType} site content (ABAC)`,
            zephyrTestId: 'DE-27207',
            storyId: 'DE-26267',
          });

          await validateContentEngagement({
            appManagerApiFixture,
            siteType,
            isRestricted: false,
            testInfo: test.info(),
            skipFn: test.skip,
          });
        }
      );

      test(
        `validate content engagement API for restricted ${siteType} site content`,
        {
          tag: [
            TestPriority.P0,
            TestGroupType.SMOKE,
            '@content-engagement',
            '@restricted',
            `@${siteType.toLowerCase()}-site`,
          ],
        },
        async ({ appManagerApiFixture }) => {
          tagTest(test.info(), {
            description: `Validate content engagement API response for restricted ${siteType} site content (ABAC)`,
            zephyrTestId: 'DE-27158',
            storyId: 'DE-26267',
          });

          await validateContentEngagement({
            appManagerApiFixture,
            siteType,
            isRestricted: true,
            testInfo: test.info(),
            skipFn: test.skip,
          });
        }
      );
    }
  }
);
