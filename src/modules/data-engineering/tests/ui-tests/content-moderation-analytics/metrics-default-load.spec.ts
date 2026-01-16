import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { getDataEngineeringConfigFromCache } from '@/src/modules/data-engineering/config/dataEngineeringConfig';
import { PeriodFilterTimeRange } from '@/src/modules/data-engineering/constants/periodFilterTimeRange';
import { TestCaseType } from '@/src/modules/data-engineering/constants/testCaseType';
import { DataEngineeringTestSuite } from '@/src/modules/data-engineering/constants/testSuite';
import { ContentModerationQueryHelper } from '@/src/modules/data-engineering/helpers/contentModerationQueryHelper';
import {
  cleanupDashboardTesting,
  setupContentModerationAnalyticsDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';
import { SnowflakeHelper } from '@/src/modules/data-engineering/helpers/snowflakeHelper';
import { ContentModerationAnalyticsDashboard } from '@/src/modules/data-engineering/ui/dashboards/content-moderation';

// Default period filter for Content Moderation Analytics
const DEFAULT_PERIOD_FILTER = PeriodFilterTimeRange.LAST_90_DAYS;

test.describe(
  'Content Moderation Analytics Dashboard - Metrics Default Load State',
  {
    tag: [DataEngineeringTestSuite.CONTENT_MODERATION_ANALYTICS, '@default-state'],
  },
  () => {
    let testEnvironment: {
      page: Page;
      contentModerationAnalyticsDashboard: ContentModerationAnalyticsDashboard;
      contentModerationQueryHelper: ContentModerationQueryHelper;
      snowflakeHelper: SnowflakeHelper;
    };

    // Filter configuration for DB queries
    const filterConfig = {
      tenantCode: '',
      timePeriod: DEFAULT_PERIOD_FILTER,
    };

    test.beforeAll('Setup Content Moderation Analytics Dashboard with default filters', async ({ browser }) => {
      // Setup dashboard with Snowflake connection
      testEnvironment = await setupContentModerationAnalyticsDashboardForTest(browser, UserRole.APP_MANAGER);

      // Set tenant code from config
      filterConfig.tenantCode = getDataEngineeringConfigFromCache().orgId;

      // Verify Analytics tab is loaded
      await testEnvironment.contentModerationAnalyticsDashboard.verifyAnalyticsTabIsLoaded();
    });

    test.afterAll('Cleanup Content Moderation Analytics Dashboard', async () => {
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Total Sources metric data validation with default period filter (Last 90 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@total-sources',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the Total Sources metric in Content Moderation Analytics dashboard with default filter',
          zephyrTestId: 'DE-28136',
          storyId: 'DE-27431',
        });

        const { contentModerationAnalyticsDashboard, contentModerationQueryHelper } = testEnvironment;

        // Get expected value from database
        const expectedMetricValue = await contentModerationQueryHelper.getTotalSourcesDataFromDBWithFilters({
          filterBy: filterConfig,
        });

        // UI validation - verify metric UI elements
        await contentModerationAnalyticsDashboard.totalSources.verifyMetricUIDataPoints();

        // Verify metric value matches expected
        await contentModerationAnalyticsDashboard.totalSources.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Detected metric data validation with default period filter (Last 90 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK, TestCaseType.HERO_METRIC, '@detected'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the Detected metric in Content Moderation Analytics dashboard with default filter',
          zephyrTestId: 'DE-28139',
          storyId: 'DE-27432',
        });

        const { contentModerationAnalyticsDashboard, contentModerationQueryHelper } = testEnvironment;

        // Get expected values from database
        const expectedTotalSourcesValue = await contentModerationQueryHelper.getTotalSourcesDataFromDBWithFilters({
          filterBy: filterConfig,
        });
        const expectedDetectedValue = await contentModerationQueryHelper.getDetectedDataFromDBWithFilters({
          filterBy: filterConfig,
        });

        // UI validation - verify metric UI elements (title, subtitle)
        await contentModerationAnalyticsDashboard.detected.verifyMetricUIDataPoints();

        // Verify metric value matches expected
        await contentModerationAnalyticsDashboard.detected.verifyMetricValue(expectedDetectedValue);

        // Verify kpiLabel with dynamically calculated percentage
        await contentModerationAnalyticsDashboard.detected.verifyKpiLabel(
          expectedTotalSourcesValue,
          expectedDetectedValue
        );
      }
    );

    test(
      'verify Reported metric data validation with default period filter (Last 90 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK, TestCaseType.HERO_METRIC, '@reported'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the Reported metric in Content Moderation Analytics dashboard with default filter',
          zephyrTestId: 'DE-28142',
          storyId: 'DE-27433',
        });

        const { contentModerationAnalyticsDashboard, contentModerationQueryHelper } = testEnvironment;

        // Get expected values from database
        const expectedTotalSourcesValue = await contentModerationQueryHelper.getTotalSourcesDataFromDBWithFilters({
          filterBy: filterConfig,
        });
        const expectedReportedValue = await contentModerationQueryHelper.getReportedDataFromDBWithFilters({
          filterBy: filterConfig,
        });

        // UI validation - verify metric UI elements (title, subtitle)
        await contentModerationAnalyticsDashboard.reported.verifyMetricUIDataPoints();

        // Verify metric value matches expected
        await contentModerationAnalyticsDashboard.reported.verifyMetricValue(expectedReportedValue);

        // Verify kpiLabel with dynamically calculated percentage
        await contentModerationAnalyticsDashboard.reported.verifyKpiLabel(
          expectedTotalSourcesValue,
          expectedReportedValue
        );
      }
    );

    test(
      'verify Removed metric data validation with default period filter (Last 90 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK, TestCaseType.HERO_METRIC, '@removed'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the Removed metric in Content Moderation Analytics dashboard with default filter',
          zephyrTestId: 'DE-28145',
          storyId: 'DE-27434',
        });

        const { contentModerationAnalyticsDashboard, contentModerationQueryHelper } = testEnvironment;

        // Get expected values from database
        const expectedTotalSourcesValue = await contentModerationQueryHelper.getTotalSourcesDataFromDBWithFilters({
          filterBy: filterConfig,
        });
        const expectedRemovedValue = await contentModerationQueryHelper.getRemovedDataFromDBWithFilters({
          filterBy: filterConfig,
        });

        // UI validation - verify metric UI elements (title, subtitle)
        await contentModerationAnalyticsDashboard.removed.verifyMetricUIDataPoints();

        // Verify metric value matches expected
        await contentModerationAnalyticsDashboard.removed.verifyMetricValue(expectedRemovedValue);

        // Verify kpiLabel with dynamically calculated percentage
        await contentModerationAnalyticsDashboard.removed.verifyKpiLabel(
          expectedTotalSourcesValue,
          expectedRemovedValue
        );
      }
    );
  }
);
