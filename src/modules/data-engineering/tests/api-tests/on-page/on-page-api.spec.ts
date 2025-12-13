import { expect } from '@playwright/test';

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
        const tenantCode = getDataEngineeringConfigFromCache().odinOrgId!;
        const isRestricted = false;

        // Fetch blog post data from database
        const blogDataResults = await analyticsQueryHelper.getBlogDataFromDB(tenantCode);
        skipIfNoData(blogDataResults, `No Blog Post content | Tenant: ${tenantCode}`, test.info(), test.skip);

        const blogData = blogDataResults[0];
        const contentId = blogData.CODE;

        // Add content details annotation
        test.info().annotations.push({
          type: 'Content Details',
          description: `Title: ${blogData.TITLE} | ContentCode: ${contentId} | Tenant: ${tenantCode} | Type: ${blogData.CONTENT_TYPE} | URL: ${blogData.CONTENT_URL}`,
        });

        // Call API and measure response time
        const { data: apiResponse, responseTime } = await withTiming(() =>
          analyticsApiService.getBlogContentEngagement(contentId, tenantCode, isRestricted)
        );

        // Assert response time
        expect
          .soft(responseTime, `API should respond within ${API_RESPONSE_TIME_MS}ms`)
          .toBeLessThan(API_RESPONSE_TIME_MS);

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
        test.info().annotations.push({
          type: 'API Summary',
          description: `Response: ${responseTime}ms | Schema: Valid | UDL Match: ${dbResults.length > 0 ? 'OK' : 'Skipped'}`,
        });

        //validate soft assertions has no errors
        expect(test.info().errors.length, 'No soft assertions errors').toBe(0);
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
          const isRestricted = false;

          // Fetch content ID from database for the specific site type
          const contentDataResults = await analyticsQueryHelper.getContentDataFromDB(siteType);
          skipIfNoData(
            contentDataResults,
            `No content for ${siteType} | Tenant: ${tenantCode}`,
            test.info(),
            test.skip
          );

          const contentData = contentDataResults[0];
          const contentId = contentData.CODE;

          // Add content details annotation
          test.info().annotations.push({
            type: 'Content Details',
            description: `Title: ${contentData.TITLE} | ID: ${contentId} | Type: ${contentData.CONTENT_TYPE} | Site: ${siteType} | URL: ${contentData.CONTENT_URL}`,
          });

          // Call API and measure response time
          const { data: apiResponse, responseTime } = await withTiming(() =>
            analyticsApiService.getContentEngagement(contentId)
          );

          // Assert response time
          expect
            .soft(responseTime, `API should respond within ${API_RESPONSE_TIME_MS}ms`)
            .toBeLessThan(API_RESPONSE_TIME_MS);

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
          test.info().annotations.push({
            type: 'API Summary',
            description: `Response: ${responseTime}ms | Schema: Valid | UDL Match: ${dbResults.length > 0 ? 'OK' : 'Skipped'}`,
          });

          //validate soft assertions has no errors
          expect(test.info().errors.length, 'No soft assertions errors').toBe(0);
        }
      );
    }
  }
);
