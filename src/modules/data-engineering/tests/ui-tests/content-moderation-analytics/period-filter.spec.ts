import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentModerationAnalyticsDashboard } from '../../../ui/dashboards/content-moderation';

import { getDataEngineeringConfigFromCache } from '@/src/modules/data-engineering/config/dataEngineeringConfig';
import { TestCaseType } from '@/src/modules/data-engineering/constants/testCaseType';
import { DataEngineeringTestSuite } from '@/src/modules/data-engineering/constants/testSuite';
import { ContentModerationQueryHelper } from '@/src/modules/data-engineering/helpers/contentModerationQueryHelper';
import {
  cleanupDashboardTesting,
  setupContentModerationAnalyticsDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';
import { getRandomStaticPeriodFilter } from '@/src/modules/data-engineering/helpers/periodFilterHelper';
import { SnowflakeHelper } from '@/src/modules/data-engineering/helpers/snowflakeHelper';

/**
 * Content Moderation Analytics Dashboard - Static Period Filter Tests
 * Randomly selects a static period filter at runtime
 */

// Randomly select a period filter at runtime
const selectedFilter = getRandomStaticPeriodFilter();

test.describe(
  'Content Moderation Analytics Dashboard - Static Period Filter',
  {
    tag: [DataEngineeringTestSuite.CONTENT_MODERATION_ANALYTICS, '@period-filter', '@static-period'],
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
      timePeriod: selectedFilter,
    };

    test.beforeAll('Setup Content Moderation Analytics Dashboard with static period filter', async ({ browser }) => {
      // Setup dashboard with Snowflake connection
      testEnvironment = await setupContentModerationAnalyticsDashboardForTest(browser, UserRole.APP_MANAGER);

      // Set tenant code from config
      filterConfig.tenantCode = getDataEngineeringConfigFromCache().orgId;

      // Verify Analytics tab is loaded
      await testEnvironment.contentModerationAnalyticsDashboard.verifyAnalyticsTabIsLoaded();

      // Apply the randomly selected Period filter
      const { analyticsFiltersComponent } = testEnvironment.contentModerationAnalyticsDashboard;
      await analyticsFiltersComponent.applyPeriodFilter(selectedFilter);
    });

    test.afterAll('Cleanup Content Moderation Analytics Dashboard', async () => {
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Total Sources metric data validation with period filter',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, TestCaseType.HERO_METRIC, '@total-sources'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the Total Sources metric in Content Moderation Analytics dashboard with static period filter',
          zephyrTestId: 'DE-28137',
          storyId: 'DE-27431',
        });

        const { contentModerationAnalyticsDashboard, contentModerationQueryHelper } = testEnvironment;

        // Get expected value from database
        const expectedMetricValue = await contentModerationQueryHelper.getTotalSourcesDataFromDBWithFilters({
          filterBy: filterConfig,
        });

        // Verify metric value matches expected
        await contentModerationAnalyticsDashboard.totalSources.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Detected metric data validation with period filter',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, TestCaseType.HERO_METRIC, '@detected'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the Detected metric in Content Moderation Analytics dashboard with static period filter',
          zephyrTestId: 'DE-28140',
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
      'verify Reported metric data validation with period filter',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, TestCaseType.HERO_METRIC, '@reported'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the Reported metric in Content Moderation Analytics dashboard with static period filter',
          zephyrTestId: 'DE-28143',
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
      'verify Removed metric data validation with period filter',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, TestCaseType.HERO_METRIC, '@removed'],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the Removed metric in Content Moderation Analytics dashboard with static period filter',
          zephyrTestId: 'DE-28146',
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
