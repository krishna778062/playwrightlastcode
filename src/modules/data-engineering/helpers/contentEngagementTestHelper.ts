import { expect, TestInfo } from '@playwright/test';

import {
  assertEngagementMetricsMatch,
  assertResponseMetadata,
  skipIfNoData,
  withTiming,
} from '@/src/modules/data-engineering/api/helpers/responseValidationHelper';
import { expectValidSchema } from '@/src/modules/data-engineering/api/helpers/schemaValidationHelper';
import { GetContentEngagementResponseSchema } from '@/src/modules/data-engineering/api/schemas';
import { getDataEngineeringConfigFromCache } from '@/src/modules/data-engineering/config/dataEngineeringConfig';
import { AnalyticsApiFixture } from '@/src/modules/data-engineering/fixtures/analyticsFixture';
import { SiteType } from '@/src/modules/data-engineering/helpers/analyticsQueryHelper';
import { TestMetaDataHelper } from '@/src/modules/data-engineering/utils/testMetaDataHelper';

const API_RESPONSE_TIME_MS = 2000;

interface ValidateContentEngagementOptions {
  appManagerApiFixture: AnalyticsApiFixture;
  siteType: SiteType;
  isRestricted?: boolean;
  testInfo: TestInfo;
  skipFn: (condition: boolean, description?: string) => void;
}

// TODO: Uncomment when validateBlogContentEngagement is implemented
// interface ValidateBlogContentEngagementOptions {
//   appManagerApiFixture: AnalyticsApiFixture;
//   testInfo: TestInfo;
//   skipFn: (condition: boolean, description?: string) => void;
// }

/**
 * Validates content engagement API response for site-based content
 * Shared helper for both regular and ABAC tests
 */
export async function validateContentEngagement({
  appManagerApiFixture,
  siteType,
  isRestricted = false,
  testInfo,
  skipFn,
}: ValidateContentEngagementOptions) {
  const { analyticsApiService, analyticsQueryHelper } = appManagerApiFixture;
  const tenantCode = getDataEngineeringConfigFromCache().orgId;

  // Fetch content ID from database for the specific site type and restriction status
  const contentDataResults = await analyticsQueryHelper.getContentDataFromDB(isRestricted, siteType);
  const skipReason = `No ${isRestricted ? 'restricted' : 'unrestricted'} content for ${siteType} | Tenant: ${tenantCode}`;
  skipIfNoData(contentDataResults, skipReason, testInfo, skipFn);

  const contentData = contentDataResults[0];
  const contentId = contentData.CODE;

  // Add content details annotation
  TestMetaDataHelper.addTestMetaDataWithContentDetails(testInfo, { contentData, siteType, isRestricted });

  // Call API and measure response time
  const { data: apiResponse, responseTime } = await withTiming(() =>
    analyticsApiService.getContentEngagement(contentId, isRestricted)
  );

  // Assert response time
  expect.soft(responseTime, `API should respond within ${API_RESPONSE_TIME_MS}ms`).toBeLessThan(API_RESPONSE_TIME_MS);

  // Validate schema
  const validatedResponse = expectValidSchema(
    GetContentEngagementResponseSchema,
    apiResponse,
    'Verify API response matches expected schema'
  );

  // Assert response metadata
  assertResponseMetadata(validatedResponse, { tenantId: tenantCode, contentId, isRestricted });

  // Compare with Snowflake data
  const dbResults = await analyticsQueryHelper.getContentEngagementFromDB(contentId);
  if (dbResults.length > 0) {
    assertEngagementMetricsMatch(validatedResponse.data, dbResults[0]);
  }

  // Add API summary annotation
  TestMetaDataHelper.addApiSummary(testInfo, { responseTime, udlMatchStatus: dbResults.length > 0 ? 'OK' : 'Skipped' });

  // Validate soft assertions has no errors
  expect(testInfo.errors.length, 'No soft assertions errors').toBe(0);
}

// TODO: Incomplete implementation - getBlogDataFromDB and getBlogContentEngagement methods need to be implemented
// /**
//  * Validates content engagement API response for blog post content
//  * Uses Odin/Blog-specific API endpoint with tenant code header
//  */
// export async function validateBlogContentEngagement({
//   appManagerApiFixture,
//   testInfo,
//   skipFn,
// }: ValidateBlogContentEngagementOptions) {
//   const { analyticsApiService, analyticsQueryHelper } = appManagerApiFixture;
//   const tenantCode = getDataEngineeringConfigFromCache().odinOrgId!;
//   const isRestricted = false;

//   // Fetch blog post data from database
//   const blogDataResults = await analyticsQueryHelper.getBlogDataFromDB(tenantCode);
//   skipIfNoData(blogDataResults, `No Blog Post content | Tenant: ${tenantCode}`, testInfo, skipFn);

//   const blogData = blogDataResults[0];
//   const contentId = blogData.CODE;

//   // Add content details annotation
//   TestMetaDataHelper.addTestMetaDataWithContentDetails(testInfo, { contentData: blogData, tenantCode });

//   // Call API and measure response time
//   const { data: apiResponse, responseTime } = await withTiming(() =>
//     analyticsApiService.getBlogContentEngagement(contentId, tenantCode, isRestricted)
//   );

//   // Assert response time
//   expect.soft(responseTime, `API should respond within ${API_RESPONSE_TIME_MS}ms`).toBeLessThan(API_RESPONSE_TIME_MS);

//   // Validate schema
//   const validatedResponse = expectValidSchema(
//     GetContentEngagementResponseSchema,
//     apiResponse,
//     'Verify API response matches expected schema'
//   );

//   // Assert response metadata
//   assertResponseMetadata(validatedResponse, { tenantId: tenantCode, contentId, isRestricted });

//   // Compare with Snowflake data
//   const dbResults = await analyticsQueryHelper.getContentEngagementFromDB(contentId);
//   if (dbResults.length > 0) {
//     assertEngagementMetricsMatch(validatedResponse.data, dbResults[0]);
//   }

//   // Add API summary annotation
//   TestMetaDataHelper.addApiSummary(testInfo, { responseTime, udlMatchStatus: dbResults.length > 0 ? 'OK' : 'Skipped' });

//   // Validate soft assertions has no errors
//   expect(testInfo.errors.length, 'No soft assertions errors').toBe(0);
// }
