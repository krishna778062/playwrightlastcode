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
import { analyticsTestFixture as test } from '@/src/modules/data-engineering/fixtures/analyticsFixture';
import { SiteType } from '@/src/modules/data-engineering/helpers/analyticsQueryHelper';

const siteTypes: SiteType[] = ['Public', 'Private', 'Unlisted']; // Test file constants
const API_RESPONSE_TIME_MS = 2000; // Max allowed API response time for this test suite

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

        const { analyticsApiService, analyticsQueryHelper } = appManagerApiFixture;
        const tenantCode = getDataEngineeringConfigFromCache().odinOrgId;
        const isRestricted = false;

        // Fetch blog post data from database
        const blogDataResults = await analyticsQueryHelper.getBlogDataFromDB(tenantCode);
        if (
          skipIfNoData(blogDataResults, `No Blog Post content found | Tenant: ${tenantCode}`, test.info(), test.skip)
        ) {
          return;
        }

        const blogData = blogDataResults[0];
        const contentId = blogData.CODE; // Content ID for the blog post

        test.info().annotations.push({
          type: 'Content Details',
          description: `Title: ${blogData.TITLE} | ContentCode: ${contentId} | Tenant: ${tenantCode} | Type: ${blogData.CONTENT_TYPE} | URL: ${blogData.CONTENT_URL}`,
        });

        // Use backend API with tenant header for Odin/Blog content
        const { data: apiResponse, responseTime } = await withTiming(
          () => analyticsApiService.getBlogContentEngagement(contentId, tenantCode!, isRestricted),
          { maxResponseTime: API_RESPONSE_TIME_MS }
        );

        // Validate response schema using Zod
        const validatedResponse = expectValidSchema(
          GetContentEngagementResponseSchema,
          apiResponse,
          'Verify API response matches expected schema'
        );

        // Validate response metadata
        assertResponseMetadata(validatedResponse, { tenantId: tenantCode!, contentId, isRestricted });

        // Fetch data from Snowflake and compare
        const dbResults = await analyticsQueryHelper.getContentEngagementFromDB(contentId);
        if (dbResults.length > 0) {
          assertEngagementMetricsMatch(validatedResponse.data, dbResults[0]);
        }

        test.info().annotations.push({
          type: 'API Summary',
          description: `Response: ${responseTime}ms | Schema: Valid | UDL Match: ${dbResults.length > 0 ? 'OK' : 'Skipped'}`,
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

          const { analyticsApiService, analyticsQueryHelper } = appManagerApiFixture;
          const tenantCode = getDataEngineeringConfigFromCache().orgId;

          // Fetch content ID from database for the specific site type
          const contentDataResults = await analyticsQueryHelper.getContentDataFromDB(siteType);
          if (
            skipIfNoData(
              contentDataResults,
              `No content found for site type: ${siteType} | Tenant: ${tenantCode}`,
              test.info(),
              test.skip
            )
          ) {
            return;
          }

          const contentData = contentDataResults[0];
          const contentId = contentData.CODE; // Content ID for the page/event/album

          test.info().annotations.push({
            type: 'Content Details',
            description: `Title: ${contentData.TITLE} | ID: ${contentId} | Type: ${contentData.CONTENT_TYPE} | Site: ${siteType} | URL: ${contentData.CONTENT_URL}`,
          });

          const { data: apiResponse, responseTime } = await withTiming(
            () => analyticsApiService.getContentEngagement(contentId),
            { maxResponseTime: API_RESPONSE_TIME_MS }
          );

          // Validate response schema using Zod
          const validatedResponse = expectValidSchema(
            GetContentEngagementResponseSchema,
            apiResponse,
            'Verify API response matches expected schema'
          );

          // Validate response metadata
          assertResponseMetadata(validatedResponse, { tenantId: tenantCode, contentId, isRestricted: false });

          // Fetch data from Snowflake and compare
          const dbResults = await analyticsQueryHelper.getContentEngagementFromDB(contentId);
          if (dbResults.length > 0) {
            assertEngagementMetricsMatch(validatedResponse.data, dbResults[0]);
          }

          test.info().annotations.push({
            type: 'API Summary',
            description: `Response: ${responseTime}ms | Schema: Valid | UDL Match: ${dbResults.length > 0 ? 'OK' : 'Skipped'}`,
          });
        }
      );
    }
  }
);
