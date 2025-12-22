import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { DataEngineeringTestSuite } from '@/src/modules/data-engineering/constants/testSuite';
import { analyticsTestFixture as test } from '@/src/modules/data-engineering/fixtures/analyticsFixture';
import { AnalyticsQueryHelper } from '@/src/modules/data-engineering/helpers/analyticsQueryHelper';

test.describe(
  'on-page analytics API tests',
  {
    tag: [DataEngineeringTestSuite.ON_PAGE_ANALYTICS, '@api-tests'],
  },
  () => {
    test(
      'validate content engagement API response, performance, and snowflake data match',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@content-engagement'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate content engagement API response, performance, and snowflake data match',
          zephyrTestId: 'DE-26540',
        });

        const { analyticsApiService, analyticsQueryHelper } = appManagerApiFixture;
        const tenantCode = process.env.ORG_ID;

        // Fetch content ID from database with isRestricted=false, retry up to 3 times with random site type
        const maxRetries = 3;
        let contentId = '';

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          const siteType = AnalyticsQueryHelper.getRandomSiteType();
          const contentDataResults = await analyticsQueryHelper.getContentDataFromDB(false, siteType);
          if (contentDataResults.length > 0) {
            contentId = contentDataResults[0].CODE;
            console.log(`Content found: ${contentDataResults[0].TITLE} | ID: ${contentId} | SiteType: ${siteType}`);
            break;
          }
          console.log(`Attempt ${attempt}/${maxRetries}: No content found for siteType: ${siteType}`);
        }

        if (!contentId) {
          throw new Error(`No content found with isRestricted=false after ${maxRetries} attempts`);
        }

        const isRestricted = false;
        const startTime = Date.now();
        const apiResponse = await analyticsApiService.getContentEngagement(contentId, isRestricted);
        const responseTime = Date.now() - startTime;

        // Validate API response structure and performance
        expect(responseTime, 'API response time should be under 2 second').toBeLessThan(2000);
        expect(apiResponse.success, 'API should return success=true').toBe(true);
        expect(apiResponse.metadata.tenantId, 'Metadata tenantId should match request').toBe(tenantCode);
        expect(apiResponse.metadata.contentId, 'Metadata contentId should match request').toBe(contentId);
        expect(apiResponse.metadata.isRestricted, 'Metadata isRestricted should match request').toBe(isRestricted);

        // Validate data structure
        expect(typeof apiResponse.data.total_reactions, 'total_reactions should be a number').toBe('number');
        expect(typeof apiResponse.data.total_comments, 'total_comments should be a number').toBe('number');
        expect(typeof apiResponse.data.total_replies, 'total_replies should be a number').toBe('number');
        expect(typeof apiResponse.data.total_shares, 'total_shares should be a number').toBe('number');
        expect(typeof apiResponse.data.total_favorites, 'total_favorites should be a number').toBe('number');

        // Fetch data from Snowflake and compare
        const dbResults = await analyticsQueryHelper.getContentEngagementFromDB(contentId);

        if (dbResults.length > 0) {
          const dbData = dbResults[0];
          expect(apiResponse.data.total_reactions, 'total_reactions should match Snowflake UDL').toBe(
            dbData.REACTIONS_COUNT
          );
          expect(apiResponse.data.total_comments, 'total_comments should match Snowflake UDL').toBe(
            dbData.COMMENT_COUNT
          );
          expect(apiResponse.data.total_replies, 'total_replies should match Snowflake UDL').toBe(dbData.REPLIES_COUNT);
          expect(apiResponse.data.total_shares, 'total_shares should match Snowflake UDL').toBe(dbData.SHARES_COUNT);
          expect(apiResponse.data.total_favorites, 'total_favorites should match Snowflake UDL').toBe(
            dbData.FAVORITES_COUNT
          );
        }

        console.log(
          `Content Engagement verified | Reactions: ${apiResponse.data.total_reactions}, Comments: ${apiResponse.data.total_comments}, Replies: ${apiResponse.data.total_replies}, Shares: ${apiResponse.data.total_shares}, Favorites: ${apiResponse.data.total_favorites} | Response: ${responseTime}ms`
        );
      }
    );
  }
);
