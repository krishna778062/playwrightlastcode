import { TestCaseType } from '@data-engineering/constants/testCaseType';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { SnowflakeHelper } from '../../../helpers';
import { AppAdoptionDashboardQueryHelper } from '../../../helpers/appAdaptionQueryHelper';
import { FilterOptions } from '../../../helpers/baseAnalyticsQueryHelper';
import { OverviewDashboard } from '../../../ui/dashboards';

import { TestGroupType } from '@/src/core';
import { TestPriority } from '@/src/core/constants/testPriority';
import { tagTest } from '@/src/core/utils/testDecorator';
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
    };
    let testFiltersConfig: FilterOptions;

    test.beforeAll('Setting up the overview dashboard', async ({ browser }) => {
      // Setup dashboard using dedicated method
      testEnvironment = await setupOverviewDashboardForTest(browser, UserRole.APP_MANAGER);

      // Overview dashboard has no filters, using default config for DB queries
      testFiltersConfig = {
        tenantCode: process.env.ORG_ID!,
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

        // Verify x-axis and y-axis labels based on filter (handles 7 days and 30 days)
        await adoptionRateUserLoginMetrics.verifyAxisLabelsForFilter(testFiltersConfig);

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
  }
);
