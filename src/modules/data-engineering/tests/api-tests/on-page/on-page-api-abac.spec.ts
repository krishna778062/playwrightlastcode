import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { expectValidSchema } from '@/src/modules/data-engineering/api/helpers/schemaValidationHelper';
import { GetContentEngagementResponseSchema } from '@/src/modules/data-engineering/api/schemas';
import { DataEngineeringTestSuite } from '@/src/modules/data-engineering/constants/testSuite';
import {
  AnalyticsApiFixture,
  analyticsTestFixture as test,
} from '@/src/modules/data-engineering/fixtures/analyticsFixture';
import { SiteType } from '@/src/modules/data-engineering/helpers/analyticsQueryHelper';

// ABAC site types - only Public and Private (no Unlisted)
const abacSiteTypes: SiteType[] = ['Public', 'Private'];

// Reusable test logic for content engagement validation
async function validateContentEngagement(
  appManagerApiFixture: AnalyticsApiFixture,
  siteType: SiteType,
  isRestricted: boolean,
  testInfo: ReturnType<typeof test.info>
) {
  const { analyticsApiService, analyticsQueryHelper } = appManagerApiFixture;
  const tenantCode = process.env.ORG_ID;

  // Fetch content ID from database for the specific site type and restriction status
  const contentDataResults = await analyticsQueryHelper.getContentDataFromDB(isRestricted, siteType);

  if (contentDataResults.length === 0) {
    const skipReason = `No ${isRestricted ? 'restricted' : 'unrestricted'} content found for site type: ${siteType}`;
    testInfo.annotations.push({
      type: 'Skip Reason',
      description: `${skipReason} | Tenant: ${tenantCode}`,
    });

    test.skip(true, skipReason);
    return;
  }

  const contentData = contentDataResults[0];
  const contentId = contentData.CODE;

  // Log content details to Playwright report
  testInfo.annotations.push({
    type: 'Content Details',
    description: `Title: ${contentData.TITLE} | ID: ${contentId} | Type: ${contentData.CONTENT_TYPE} | Site: ${siteType} | Restricted: ${isRestricted} | URL: ${contentData.CONTENT_URL}`,
  });

  const startTime = Date.now();
  const apiResponse = await analyticsApiService.getContentEngagement(contentId, isRestricted);
  const responseTime = Date.now() - startTime;

  expect.soft(responseTime, 'Verify API responds within 2 seconds').toBeLessThan(2000);

  // Validate response schema using Zod
  const validatedResponse = expectValidSchema(
    GetContentEngagementResponseSchema,
    apiResponse,
    'Verify API response matches expected schema'
  );

  // Validate business logic with parsed response
  expect(validatedResponse.success, 'Verify API returns successful response').toBe(true);
  expect(validatedResponse.metadata.tenantId, 'Verify tenant identifier in response').toBe(tenantCode);
  expect(validatedResponse.metadata.contentId, 'Verify content identifier in response').toBe(contentId);
  expect(validatedResponse.metadata.isRestricted, 'Verify restricted flag in response').toBe(isRestricted);

  // Fetch data from Snowflake and compare
  const dbResults = await analyticsQueryHelper.getContentEngagementFromDB(contentId);

  if (dbResults.length > 0) {
    const dbData = dbResults[0];
    expect(validatedResponse.data.total_reactions, 'Verify reactions count matches data warehouse').toBe(
      dbData.REACTIONS_COUNT
    );
    expect(validatedResponse.data.total_comments, 'Verify comments count matches data warehouse').toBe(
      dbData.COMMENT_COUNT
    );
    expect(validatedResponse.data.total_replies, 'Verify replies count matches data warehouse').toBe(
      dbData.REPLIES_COUNT
    );
    expect(validatedResponse.data.total_shares, 'Verify shares count matches data warehouse').toBe(dbData.SHARES_COUNT);
    expect(validatedResponse.data.total_favorites, 'Verify favorites count matches data warehouse').toBe(
      dbData.FAVORITES_COUNT
    );
  }

  testInfo.annotations.push({
    type: 'API Summary',
    description: `Response: ${responseTime}ms | Schema: Valid | UDL Match: ${dbResults.length > 0 ? 'OK' : 'Skipped'}`,
  });

  testInfo.annotations.push({
    type: 'Engagement Metrics',
    description: `Reactions: ${validatedResponse.data.total_reactions} | Comments: ${validatedResponse.data.total_comments} | Replies: ${validatedResponse.data.total_replies} | Shares: ${validatedResponse.data.total_shares} | Favorites: ${validatedResponse.data.total_favorites}`,
  });
}

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

          await validateContentEngagement(appManagerApiFixture, siteType, false, test.info());
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

          await validateContentEngagement(appManagerApiFixture, siteType, true, test.info());
        }
      );
    }
  }
);
