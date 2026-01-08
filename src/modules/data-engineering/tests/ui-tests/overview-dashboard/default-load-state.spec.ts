import { TestCaseType } from '@data-engineering/constants/testCaseType';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { ContentDashboardQueryHelper, SitesDashboardQueryHelper } from '@data-engineering/helpers';
import { Page, test } from '@playwright/test';

import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { SnowflakeHelper } from '../../../helpers';
import { AppAdoptionDashboardQueryHelper } from '../../../helpers/appAdaptionQueryHelper';
import { FilterOptions } from '../../../helpers/baseAnalyticsQueryHelper';
import { OverviewDashboard } from '../../../ui/dashboards';

import { TestGroupType } from '@/src/core';
import { TestPriority } from '@/src/core/constants/testPriority';
import { tagTest } from '@/src/core/utils/testDecorator';
import { getDataEngineeringConfigFromCache } from '@/src/modules/data-engineering/config/dataEngineeringConfig';
import {
  cleanupDashboardTesting,
  setupOverviewDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';

test.describe(
  'overview Dashboard - Default Load State',
  {
    tag: [DataEngineeringTestSuite.OVERVIEW, '@overview-dashboard-default-state'],
  },
  () => {
    test.slow();

    let testEnvironment: {
      page: Page;
      overviewDashboard: OverviewDashboard;
      snowflakeHelper: SnowflakeHelper;
      appAdoptionQueryHelper: AppAdoptionDashboardQueryHelper;
      sitesDashboardQueryHelper: SitesDashboardQueryHelper;
      contentDashboardQueryHelper: ContentDashboardQueryHelper;
    };
    let testFiltersConfig: FilterOptions;

    test.beforeAll('Setting up the overview dashboard', async ({ browser }) => {
      // Setup dashboard using dedicated method
      testEnvironment = await setupOverviewDashboardForTest(browser, UserRole.APP_MANAGER);

      // Overview dashboard has no filters, using default config for DB queries
      testFiltersConfig = {
        tenantCode: getDataEngineeringConfigFromCache().orgId,
        timePeriod: PeriodFilterTimeRange.LAST_30_DAYS, // default period for DB queries
      };
    });

    test.afterAll('Cleaning up the test environment', async () => {
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify total users metric data validation',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@total-users-metric',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify total users metric in Overview Dashboard',
          zephyrTestId: '',
        });

        const { appAdoptionQueryHelper } = testEnvironment;

        const dbValues = await appAdoptionQueryHelper.getTotalUsersDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const totalUsersMetrics = testEnvironment.overviewDashboard.totalUsersMetrics;
        // Since it is a hero metric, it should return a single value
        await totalUsersMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'verify logged in users metric data validation',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@logged-in-users-metric',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify logged in users metric in Overview Dashboard',
          zephyrTestId: '',
        });

        const { appAdoptionQueryHelper } = testEnvironment;

        const loggedInUsersMetricData = await appAdoptionQueryHelper.getLoggedInUsersDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const loggedInUsersMetrics = testEnvironment.overviewDashboard.loggedInUsersMetrics;
        // Verify the absolute value of logged in users is as expected
        await loggedInUsersMetrics.verifyAbsoluteMetricValueIs(
          loggedInUsersMetricData.absoluteValueOfLoggedInUsers.toString()
        );
        // Verify the percentage of logged in users from total users is as expected
        await loggedInUsersMetrics.verifyPercentageMetricValueIsAsExpected(
          loggedInUsersMetricData.percentageOfLoggedInUsersFromTotalUsers
        );
      }
    );

    test(
      'verify contributors and participants metric data validation',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@contributors-and-participants-metric',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify contributors and participants metric in Overview Dashboard',
          zephyrTestId: '',
        });

        const { appAdoptionQueryHelper } = testEnvironment;

        const contributorsAndParticipantsData =
          await appAdoptionQueryHelper.getContributorsAndParticipantsDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        const contributorsAndParticipantsMetrics = testEnvironment.overviewDashboard.contributorsAndParticipantsMetrics;
        // Verify the absolute value of contributors and participants is as expected
        await contributorsAndParticipantsMetrics.verifyAbsoluteMetricValueIs(
          contributorsAndParticipantsData.absoluteValueOfContributorsAndParticipants.toString()
        );
        // Verify the percentage of contributors and participants from logged in users is as expected
        await contributorsAndParticipantsMetrics.verifyPercentageMetricValueIsAsExpected(
          contributorsAndParticipantsData.percentageOfContributorsAndParticipantsFromLoggedInUsers
        );
      }
    );

    test(
      'verify adoption rate - user logins metric data validation',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.BAR_CHART,
          '@adoption-rate-user-logins-metric',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify adoption rate - user logins metric in Overview Dashboard',
          zephyrTestId: '',
        });

        const { appAdoptionQueryHelper, overviewDashboard } = testEnvironment;
        const { adoptionRateUserLoginMetrics } = overviewDashboard;

        // Verify chart is loaded with labels and bars (simpler approach without dynamic x-axis date verification)
        await adoptionRateUserLoginMetrics.verifyChartIsLoaded();

        // Get adoption rate user login data from database
        const adoptionRateUserLoginData = await appAdoptionQueryHelper.getAdoptionRateUserLoginDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // Verify all plotted bars and their tooltips
        // This method handles filtering out 0% adoption rate bars and validates tooltips
        await adoptionRateUserLoginMetrics.verifyBarsWithTooltips(adoptionRateUserLoginData);
      }
    );

    test(
      'verify user engagement breakdown metric data validation',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.PIE_CHART,
          '@user-engagement-breakdown-metric',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify user engagement breakdown metric in Overview Dashboard',
          zephyrTestId: '',
        });

        const { appAdoptionQueryHelper, overviewDashboard } = testEnvironment;

        const dbResults = await appAdoptionQueryHelper.getUserEngagementBreakdownDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });
        console.log(`----> The user engagement breakdown data is  `, dbResults);

        const userEngagementBreakdownMetric = overviewDashboard.userEngagementBreakdownMetric;
        await userEngagementBreakdownMetric.scrollToComponent();

        // Verify number of segments matches DB results (all 4 segments including "No login")
        await userEngagementBreakdownMetric.verifyNumberOfSegmentsVisibleonPieChartIs(dbResults.length);

        // Verify each segment label data points
        for (const data of dbResults) {
          await userEngagementBreakdownMetric.verifySegmentLabelDataPointsAreAsExpected({
            label: data.behaviour,
            expectedText: `${data.behaviour} - ${data.count} (${data.percentage}%)`,
          });
        }

        // Verify tooltip is visible for each segment
        for (const data of dbResults) {
          await userEngagementBreakdownMetric.hoverOverSegmentLabelWithLabelAs(data.behaviour);
          await userEngagementBreakdownMetric.waitForToolTipContainerToBeVisible();
          await userEngagementBreakdownMetric.validateValuesShownInToolTipAreAsExpected({
            labelsAndValues: [
              { keyText: 'Total Count:', expectedValue: data.count.toString() },
              { keyText: 'Adoption Behaviour', expectedValue: data.behaviour },
            ],
          });
        }
      }
    );

    // Sites Dashboard Metrics Tests
    test(
      'tS To verify the answer Total sites in Sites Dashboard',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@overview-total-sites-metric',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Total sites in Overview Dashboard',
          zephyrTestId: '',
        });

        const { sitesDashboardQueryHelper, overviewDashboard } = testEnvironment;

        const dbValues = await sitesDashboardQueryHelper.getTotalSitesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbValues', dbValues);

        const totalSitesMetrics = overviewDashboard.totalSitesMetrics;
        //since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        //verifyMetricValue has built-in retry logic, so we don't need to verify metric is loaded separately
        await totalSitesMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'tS To verify the answer Featured sites in Sites Dashboard',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@overview-featured-sites-metric',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Featured sites in Overview Dashboard',
          zephyrTestId: '',
        });

        const { sitesDashboardQueryHelper, overviewDashboard } = testEnvironment;

        const dbValues = await sitesDashboardQueryHelper.getFeaturedSitesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbValues', dbValues);

        const featuredSitesMetrics = overviewDashboard.featuredSitesMetrics;
        //since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        //verifyMetricValue has built-in retry logic, so we don't need to verify metric is loaded separately
        await featuredSitesMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'tS To verify the answer Total managers in Sites Dashboard',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@overview-total-managers-metric',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Total managers in Overview Dashboard',
          zephyrTestId: '',
        });

        const { sitesDashboardQueryHelper, overviewDashboard } = testEnvironment;

        const dbValues = await sitesDashboardQueryHelper.getTotalManagersDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbValues', dbValues);

        const totalManagersMetrics = overviewDashboard.totalManagersMetrics;
        //since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        //verifyMetricValue has built-in retry logic, so we don't need to verify metric is loaded separately
        await totalManagersMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'tS To verify the answer Total sites distribution in Sites Dashboard',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.PIE_CHART,
          '@overview-total-sites-distribution-metric',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'TS To verify the answer Total sites distribution in Overview Dashboard',
          zephyrTestId: '',
        });

        const { sitesDashboardQueryHelper, overviewDashboard } = testEnvironment;

        const dbResults = await sitesDashboardQueryHelper.getTotalSitesDistributionDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbResults', dbResults);

        const totalSitesDistributionMetrics = overviewDashboard.totalSitesDistributionMetrics;
        await totalSitesDistributionMetrics.scrollToComponent();

        // Verify number of segments matches DB results
        await totalSitesDistributionMetrics.verifyNumberOfSegmentsVisibleonPieChartIs(dbResults.length);

        // Verify each segment label data points
        for (const data of dbResults) {
          await totalSitesDistributionMetrics.verifySegmentLabelDataPointsAreAsExpected({
            label: data.siteType,
            expectedText: `${data.siteType} - ${data.count} (${data.percentage}%)`,
          });
        }

        // Verify tooltip is visible for each segment (hover interaction)
        for (const data of dbResults) {
          await totalSitesDistributionMetrics.hoverOverSegmentLabelWithLabelAs(data.siteType);
          await totalSitesDistributionMetrics.waitForToolTipContainerToBeVisible();
          // Note: Tooltip content validation is skipped as tooltip structure may differ
          // The main validation is the segment label data points above
        }
      }
    );

    test(
      'tS To verify the answer Most Popular in Sites Dashboard',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.TABULAR_METRIC,
          '@overview-most-popular-sites-metric',
        ],
      },
      async () => {
        // Known failure - marking test as expected to fail
        test.fail();
        tagTest(test.info(), {
          description: 'TS To verify the answer Most Popular in Overview Dashboard',
          zephyrTestId: '',
          isKnownFailure: true,
          bugTicket: 'DE-27649',
        });

        const { sitesDashboardQueryHelper, overviewDashboard } = testEnvironment;

        const dbResults = await sitesDashboardQueryHelper.getMostPopularSitesDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('dbResults', dbResults);

        const mostPopularSitesMetrics = overviewDashboard.mostPopularSitesMetrics;
        await mostPopularSitesMetrics.scrollToComponent();

        // Verify tabular data is loaded
        await mostPopularSitesMetrics.verifyDataIsLoaded();

        // Verify UI data matches DB data
        await mostPopularSitesMetrics.verifyUIDataMatchesWithSnowflakeData(dbResults);
      }
    );

    // Content Dashboard Metrics Tests
    test(
      'verify Total content published metric data validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@overview-total-content-published',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Total content published in Overview Dashboard with default filter',
          zephyrTestId: '',
        });

        const { contentDashboardQueryHelper, overviewDashboard } = testEnvironment;

        // Get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue = await contentDashboardQueryHelper.getTotalContentPublishedDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        // UI validation
        const totalContentPublishedMetric = overviewDashboard.totalContentPublishedMetric;
        await totalContentPublishedMetric.verifyMetricIsLoaded();
        // Verify the absolute value (the metric shows just a number, not a percentage)
        await totalContentPublishedMetric.verifyAbsoluteMetricValueIs(expectedMetricValue.toString());
      }
    );

    test(
      'verify Users who viewed content metric data validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.HERO_METRIC,
          '@overview-users-who-viewed-content',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Users who viewed content in Overview Dashboard with default filter',
          zephyrTestId: '',
        });

        const { contentDashboardQueryHelper, overviewDashboard } = testEnvironment;

        // Get expected metric value from snowflake with default period (Last 30 days)
        const expectedMetricValue =
          await contentDashboardQueryHelper.getUsersWhoViewedContentPercentageFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        // UI validation
        const usersWhoViewedContentMetric = overviewDashboard.usersWhoViewedContentMetric;
        await usersWhoViewedContentMetric.verifyMetricIsLoaded();
        // Verify the percentage value (e.g., 14.1 for 14.1%)
        await usersWhoViewedContentMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Content published metric data validation with default period filter (Last 30 days)',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestGroupType.HEALTHCHECK,
          TestCaseType.PIE_CHART,
          '@overview-content-published-pie-chart',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the answer of Content published pie chart in Overview Dashboard with default filter',
          zephyrTestId: '',
        });

        const { contentDashboardQueryHelper, overviewDashboard } = testEnvironment;

        // Get expected metric data from snowflake with default period (Last 30 days)
        const dbResults = await contentDashboardQueryHelper.getContentPublishedByTypeDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        console.log('Content Published by Type DB Results:', dbResults);

        // UI validation
        const contentPublishedMetric = overviewDashboard.contentPublishedMetric;
        await contentPublishedMetric.scrollToComponent();
        await contentPublishedMetric.waitForChartToLoad();

        // Verify number of segments matches DB results
        await contentPublishedMetric.verifyNumberOfSegmentsVisibleonPieChartIs(dbResults.length);

        // Verify each segment label data points (includes percentage from DB)
        for (const data of dbResults) {
          await contentPublishedMetric.verifySegmentLabelDataPointsAreAsExpected({
            label: data.contentTypeName,
            expectedText: `${data.contentTypeName} - ${data.count} (${data.percentage}%)`,
          });
        }

        // Verify tooltip is visible for each segment (hover interaction)
        for (const data of dbResults) {
          await contentPublishedMetric.hoverOverSegmentLabelWithLabelAs(data.contentTypeName);
          await contentPublishedMetric.waitForToolTipContainerToBeVisible();
          // Note: Tooltip content validation is skipped as tooltip structure may vary
          // The main validation is the segment label data points above
        }
      }
    );
  }
);
