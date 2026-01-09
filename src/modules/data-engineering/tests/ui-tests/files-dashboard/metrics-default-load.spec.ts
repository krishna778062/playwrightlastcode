import { TestCaseType } from '@data-engineering/constants/testCaseType';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { getDataEngineeringConfigFromCache } from '../../../config/dataEngineeringConfig';
import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { FilesDashboardQueryHelper, FilterOptions, PeriodFilterOption, SnowflakeHelper } from '../../../helpers';
import { FilesDashboard } from '../../../ui/dashboards';

import {
  cleanupDashboardTesting,
  setupFilesDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';

test.describe(
  'Files Dashboard - Default State Validation',
  {
    tag: [DataEngineeringTestSuite.FILES, '@default-state'],
  },
  () => {
    let testEnvironment: {
      page: Page;
      filesDashboard: FilesDashboard;
      filesDashboardQueryHelper: FilesDashboardQueryHelper;
      snowflakeHelper: SnowflakeHelper;
    };

    const defaultPeriodFilter = PeriodFilterTimeRange.LAST_30_DAYS;

    // Helper function to create FilterOptions from period filter
    const createFilterOptions = (timePeriod: string): FilterOptions => {
      return {
        tenantCode: getDataEngineeringConfigFromCache().orgId,
        timePeriod: timePeriod as PeriodFilterOption,
      };
    };

    test.beforeAll('Setup Files Dashboard', async ({ browser }) => {
      // Setup dashboard using dedicated method
      // No filters applied - testing default state (Last 30 days)
      testEnvironment = await setupFilesDashboardForTest(browser, UserRole.APP_MANAGER);
    });

    test.afterAll('Cleanup Files Dashboard', async () => {
      // Cleanup using helper
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Total views metric data validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@total-views',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the Total views metric data in File app dashboard with default filter',
          zephyrTestId: 'DE-26403',
          storyId: 'DE-26314',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue = await testEnvironment.filesDashboardQueryHelper.getTotalViewsFromDBWithFilters({
          filterBy,
        });

        console.log('Expected Total Views Value:', expectedMetricValue);

        // UI validation
        const totalViewsMetric = testEnvironment.filesDashboard.totalViews;
        await totalViewsMetric.verifyMetricUIDataPoints();
        await totalViewsMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Downloads metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK, TestCaseType.HERO_METRIC, '@downloads'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the Downloads metric data in Files dashboard with default filter',
          zephyrTestId: 'DE-26316',
          storyId: 'DE-26407',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue = await testEnvironment.filesDashboardQueryHelper.getDownloadsFromDBWithFilters({
          filterBy,
        });

        console.log('Expected Downloads Value:', expectedMetricValue);

        // UI validation
        const downloadsMetric = testEnvironment.filesDashboard.downloads;
        await downloadsMetric.verifyMetricUIDataPoints();
        await downloadsMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Favourites metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK, TestCaseType.HERO_METRIC, '@favourites'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the Favourites metric data in Files dashboard with default filter',
          zephyrTestId: 'DE-26409',
          storyId: 'DE-26317',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue = await testEnvironment.filesDashboardQueryHelper.getFavouritesFromDBWithFilters({
          filterBy,
        });

        console.log('Expected Favourites Value:', expectedMetricValue);

        // UI validation
        const favouritesMetric = testEnvironment.filesDashboard.favourites;
        await favouritesMetric.verifyMetricUIDataPoints();
        await favouritesMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Reactions metric data validation with default period filter (Last 30 days)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK, TestCaseType.HERO_METRIC, '@reactions'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the Reactions metric data in Files dashboard with default filter',
          zephyrTestId: 'DE-26411',
          storyId: 'DE-26318',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue = await testEnvironment.filesDashboardQueryHelper.getReactionsFromDBWithFilters({
          filterBy,
        });

        console.log('Expected Reactions Value:', expectedMetricValue);

        // UI validation
        const reactionsMetric = testEnvironment.filesDashboard.reactions;
        await reactionsMetric.verifyMetricUIDataPoints();
        await reactionsMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test.fail(
      'verify Unique views metric data validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@unique-views',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the Unique views metric data in Files dashboard with default filter',
          zephyrTestId: 'DE-26405',
          isKnownFailure: true,
          storyId: 'DE-26315',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue = await testEnvironment.filesDashboardQueryHelper.getUniqueViewsFromDBWithFilters({
          filterBy,
        });

        console.log('Expected Unique Views Value:', expectedMetricValue);

        // UI validation
        const uniqueViewsMetric = testEnvironment.filesDashboard.uniqueViews;
        await uniqueViewsMetric.verifyMetricUIDataPoints();
        await uniqueViewsMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Distribution of views by file category metric data validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@distribution-of-views-by-file-category',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the Distribution of views by file category metric data in Files dashboard with default filter',
          zephyrTestId: 'DE-26408',
          storyId: 'DE-26314',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue =
          await testEnvironment.filesDashboardQueryHelper.getDistributionOfViewsByFileCategoryFromDBWithFilters({
            filterBy,
          });

        console.log('Expected Distribution of Views by File Category Data:', expectedMetricValue);

        // UI validation
        const distributionOfViewsByFileCategoryMetric =
          testEnvironment.filesDashboard.distributionOfViewsByFileCategory;
        await distributionOfViewsByFileCategoryMetric.verifyDataIsLoaded();
        await distributionOfViewsByFileCategoryMetric.verifyUIDataMatchesWithSnowflakeData(expectedMetricValue);
      }
    );

    test(
      'verify Distrubution of downloads by file category metric data validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@distribution-of-downloads-by-file-category',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'To verify the Distrubution of downloads by file category metric data in Files dashboard with default filter',
          zephyrTestId: 'DE-26409',
          storyId: 'DE-26314',
        });

        // Get expected metric value from snowflake with default period (Last 30 days)
        const filterBy = createFilterOptions(defaultPeriodFilter);
        const expectedMetricValue =
          await testEnvironment.filesDashboardQueryHelper.getDistributionOfDownloadsByFileCategoryFromDBWithFilters({
            filterBy,
          });

        console.log('Expected Distribution of Downloads by File Category Data:', expectedMetricValue);

        // UI validation
        const distributionOfDownloadsByFileCategoryMetric =
          testEnvironment.filesDashboard.distributionOfDownloadsByFileCategory;
        await distributionOfDownloadsByFileCategoryMetric.verifyDataIsLoaded();
        await distributionOfDownloadsByFileCategoryMetric.verifyUIDataMatchesWithSnowflakeData(expectedMetricValue);
      }
    );
  }
);
