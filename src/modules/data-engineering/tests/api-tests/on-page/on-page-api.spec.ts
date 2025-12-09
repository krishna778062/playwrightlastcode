import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { DataEngineeringTestSuite } from '@/src/modules/data-engineering/constants/testSuite';
import { analyticsTestFixture as test } from '@/src/modules/data-engineering/fixtures/analyticsFixture';
import { SiteType } from '@/src/modules/data-engineering/helpers/analyticsQueryHelper';

// Test data for content engagement API - runs for each site type
const siteTypes: SiteType[] = ['Public', 'Private', 'Unlisted'];

test.describe(
  'on-page analytics API tests',
  {
    tag: [DataEngineeringTestSuite.ON_PAGE_ANALYTICS, '@api-tests'],
  },
  () => {
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
          const tenantCode = process.env.ORG_ID;
          const isRestricted = false;

          // Fetch content ID from database for the specific site type
          const contentDataResults = await analyticsQueryHelper.getContentDataFromDB(isRestricted, siteType);

          if (contentDataResults.length === 0) {
            // eslint-disable-next-line playwright/no-skipped-test -- Conditional skip when no test data exists
            test.skip(true, `No content found for site type: ${siteType}`);
            return;
          }

          const contentData = contentDataResults[0];
          const contentId = contentData.CODE;

          // Log content details to Playwright report
          test.info().annotations.push({
            type: 'Content Details',
            description: `Title: ${contentData.TITLE} | ID: ${contentId} | Type: ${contentData.CONTENT_TYPE} | Site: ${siteType} | URL: ${contentData.CONTENT_URL}`,
          });

          const startTime = Date.now();
          const apiResponse = await analyticsApiService.getContentEngagement(contentId, isRestricted);
          const responseTime = Date.now() - startTime;

          // Validate API response structure and performance
          expect(responseTime, 'Verify API responds within 2 seconds').toBeLessThan(2000);
          expect(apiResponse.success, 'Verify API returns successful response').toBe(true);
          expect(apiResponse.metadata.tenantId, 'Verify tenant identifier in response').toBe(tenantCode);
          expect(apiResponse.metadata.contentId, 'Verify content identifier in response').toBe(contentId);
          expect(apiResponse.metadata.isRestricted, 'Verify restricted flag in response').toBe(isRestricted);

          // Validate data structure
          expect(typeof apiResponse.data.total_reactions, 'Verify reactions count is numeric').toBe('number');
          expect(typeof apiResponse.data.total_comments, 'Verify comments count is numeric').toBe('number');
          expect(typeof apiResponse.data.total_replies, 'Verify replies count is numeric').toBe('number');
          expect(typeof apiResponse.data.total_shares, 'Verify shares count is numeric').toBe('number');
          expect(typeof apiResponse.data.total_favorites, 'Verify favorites count is numeric').toBe('number');

          // Fetch data from Snowflake and compare
          const dbResults = await analyticsQueryHelper.getContentEngagementFromDB(contentId);

          if (dbResults.length > 0) {
            const dbData = dbResults[0];
            expect(apiResponse.data.total_reactions, 'Verify reactions count matches data warehouse').toBe(
              dbData.REACTIONS_COUNT
            );
            expect(apiResponse.data.total_comments, 'Verify comments count matches data warehouse').toBe(
              dbData.COMMENT_COUNT
            );
            expect(apiResponse.data.total_replies, 'Verify replies count matches data warehouse').toBe(
              dbData.REPLIES_COUNT
            );
            expect(apiResponse.data.total_shares, 'Verify shares count matches data warehouse').toBe(
              dbData.SHARES_COUNT
            );
            expect(apiResponse.data.total_favorites, 'Verify favorites count matches data warehouse').toBe(
              dbData.FAVORITES_COUNT
            );
          }

          // Log engagement metrics to Playwright report
          test.info().annotations.push({
            type: 'Engagement Metrics',
            description: `Reactions: ${apiResponse.data.total_reactions} | Comments: ${apiResponse.data.total_comments} | Replies: ${apiResponse.data.total_replies} | Shares: ${apiResponse.data.total_shares} | Favorites: ${apiResponse.data.total_favorites} | Response: ${responseTime}ms`,
          });
        }
      );
    }
  }
);
