import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import {
  assertEngagementMetricsMatch,
  assertResponseMetadata,
  skipIfNoData,
  withTiming,
} from '@/src/modules/data-engineering/api/helpers/responseValidationHelper';
import { expectValidSchema } from '@/src/modules/data-engineering/api/helpers/schemaValidationHelper';
import { GetContentEngagementResponseSchema } from '@/src/modules/data-engineering/api/schemas';
import { getDataEngineeringConfigFromCache } from '@/src/modules/data-engineering/config/dataEngineeringConfig';
import { DataEngineeringTestSuite } from '@/src/modules/data-engineering/constants/testSuite';
import {
  AnalyticsApiFixture,
  analyticsTestFixture as test,
} from '@/src/modules/data-engineering/fixtures/analyticsFixture';
import { SiteType } from '@/src/modules/data-engineering/helpers/analyticsQueryHelper';

const abacSiteTypes: SiteType[] = ['Public', 'Private']; // Test file constants
const API_RESPONSE_TIME_MS = 2000; // Max allowed API response time for this test suite

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

// helper function to validate content engagement API response
async function validateContentEngagement(
  appManagerApiFixture: AnalyticsApiFixture,
  siteType: SiteType,
  isRestricted: boolean,
  testInfo: ReturnType<typeof test.info>
) {
  const { analyticsApiService, analyticsQueryHelper } = appManagerApiFixture;
  const tenantCode = getDataEngineeringConfigFromCache().orgId;

  // Fetch content ID from database for the specific site type and restriction status
  const contentDataResults = await analyticsQueryHelper.getContentDataFromDB(siteType, isRestricted);
  const skipReason = `No ${isRestricted ? 'restricted' : 'unrestricted'} content for ${siteType} | Tenant: ${tenantCode}`;
  skipIfNoData(contentDataResults, skipReason, testInfo, test.skip);

  const contentData = contentDataResults[0];
  const contentId = contentData.CODE; // Content ID for the page/event/album

  // Log content details to Playwright report
  testInfo.annotations.push({
    type: 'Content Details',
    description: `Title: ${contentData.TITLE} | ID: ${contentId} | Type: ${contentData.CONTENT_TYPE} | Site: ${siteType} | Restricted: ${isRestricted} | URL: ${contentData.CONTENT_URL}`,
  });

  const { data: apiResponse, responseTime } = await withTiming(
    () => analyticsApiService.getContentEngagement(contentId, isRestricted),
    { maxResponseTime: API_RESPONSE_TIME_MS }
  );

  // Validate response schema using Zod
  const validatedResponse = expectValidSchema(
    GetContentEngagementResponseSchema,
    apiResponse,
    'Verify API response matches expected schema'
  );

  // Validate response metadata
  assertResponseMetadata(validatedResponse, { tenantId: tenantCode, contentId, isRestricted });

  // Fetch data from Snowflake and compare
  const dbResults = await analyticsQueryHelper.getContentEngagementFromDB(contentId);
  if (dbResults.length > 0) {
    assertEngagementMetricsMatch(validatedResponse.data, dbResults[0]);
  }

  testInfo.annotations.push({
    type: 'API Summary',
    description: `Response: ${responseTime}ms | Schema: Valid | UDL Match: ${dbResults.length > 0 ? 'OK' : 'Skipped'}`,
  });
}
