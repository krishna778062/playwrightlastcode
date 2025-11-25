import { TestCaseType } from '@data-engineering/constants/testCaseType';
import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { GroupByOnUserParameter } from '../../../constants/filters';
import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { SnowflakeHelper } from '../../../helpers';
import { AppAdoptionDashboardQueryHelper } from '../../../helpers/appAdaptionQueryHelper';
import { FilterOptions } from '../../../helpers/baseAnalyticsQueryHelper';
import { AppAdoptionDashboard } from '../../../ui/dashboards';
import { CSVValidationUtil } from '../../../utils/csvValidationUtil';

import { TestGroupType } from '@/src/core';
import { TestPriority } from '@/src/core/constants/testPriority';
import { tagTest } from '@/src/core/utils/testDecorator';
import {
  cleanupDashboardTesting,
  setupAppAdoptionDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';
/**
 * Currently I am picking static values for all the fitlers as
 * per the given tenant + env.
 * We will replace this with dynamic values in the future.
 * Where we should fetch the values from the DB for each filter
 * and decide which one to pick for the test.
 */

test.describe.fixme(
  'app Adoption Dashboard - All Filters Applied (FIXME: This test is failing because the data is not available in the DB for given filters)',
  {
    tag: [DataEngineeringTestSuite.ADOPTION],
  },
  () => {
    test.slow();

    let testEnvironment: {
      page: Page;
      appAdoptionDashboard: AppAdoptionDashboard;
      snowflakeHelper: SnowflakeHelper;
      appAdoptionQueryHelper: AppAdoptionDashboardQueryHelper;
    };
    let testFiltersConfig: FilterOptions;

    test.beforeAll(
      'Setting up the app adoption dashboard + applying all the filters (excluding group by)',
      async ({ browser }) => {
        // Setup dashboard using dedicated method
        testEnvironment = await setupAppAdoptionDashboardForTest(browser, UserRole.APP_MANAGER);

        testFiltersConfig = {
          tenantCode: process.env.ORG_ID!,
          timePeriod: PeriodFilterTimeRange.LAST_30_DAYS,
          departments: ['test', 'QA'],
          // locations: ['Baran, Rajasthan, India', 'Gurugram, Haryana, India'],
          locations: ['Gurugram, Haryana, India'],

          // userCategories: ['Adil Option1'],
          companyName: ['Simpplr'],
        };

        const { analyticsFiltersComponent } = testEnvironment.appAdoptionDashboard;
        await analyticsFiltersComponent.verifyFilterComponentIsVisible();

        // Apply filters using unified configuration
        await analyticsFiltersComponent.applyFiltersFromConfig(testFiltersConfig);
      }
    );

    test.afterAll('Cleaning up the test environment', async () => {
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify impact of applied filters on the total users metric',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@total-users-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify impact of applied filters on the total users metric',
          zephyrTestId: '',
        });

        const { appAdoptionQueryHelper, appAdoptionDashboard: _appAdoptionDashboard } = testEnvironment;

        const dbValues = await appAdoptionQueryHelper.getTotalUsersDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });
        console.log(`----> The total users data is  `, dbValues);

        const totalUsersMetrics = testEnvironment.appAdoptionDashboard.totalUsersMetrics;
        //since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        await totalUsersMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'verify impact of applied filters on the logged in users metric',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@logged-in-users-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify impact of applied filters on the logged in users metric',
          zephyrTestId: '',
        });

        const { appAdoptionQueryHelper, appAdoptionDashboard: _appAdoptionDashboard } = testEnvironment;

        const loggedInUsersMetricData = await appAdoptionQueryHelper.getLoggedInUsersDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const loggedInUsersMetrics = testEnvironment.appAdoptionDashboard.loggedInUsersMetrics;
        //verify the absolute value of logged in users is as expected
        await loggedInUsersMetrics.verifyAbsoluteMetricValueIs(
          loggedInUsersMetricData.absoluteValueOfLoggedInUsers.toString()
        );
        //verify the percentage of logged in users from total users is as expected
        await loggedInUsersMetrics.verifyPercentageMetricValueIsAsExpected(
          loggedInUsersMetricData.percentageOfLoggedInUsersFromTotalUsers
        );
      }
    );

    test(
      'verify impact of applied filters on the contributors and participants metric',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.HERO_METRIC, '@logged-in-users-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify impact of applied filters on the contributors and participants metric',
          zephyrTestId: '',
        });

        const { appAdoptionQueryHelper, appAdoptionDashboard: _appAdoptionDashboard } = testEnvironment;

        const contributorsAndParticipantsData =
          await appAdoptionQueryHelper.getContributorsAndParticipantsDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        const contributorsAndParticipantsMetrics =
          testEnvironment.appAdoptionDashboard.contributorsAndParticipantsMetrics;
        await contributorsAndParticipantsMetrics.verifyAbsoluteMetricValueIs(
          contributorsAndParticipantsData.absoluteValueOfContributorsAndParticipants.toString()
        );
        await contributorsAndParticipantsMetrics.verifyPercentageMetricValueIsAsExpected(
          contributorsAndParticipantsData.percentageOfContributorsAndParticipantsFromLoggedInUsers
        );
      }
    );

    test(
      'verify impact of applied filters on the app web page views metric',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.TABULAR_METRIC, '@app-web-page-views-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify impact of applied filters on the app web page views metric',
          zephyrTestId: '',
        });

        const { appAdoptionQueryHelper, appAdoptionDashboard } = testEnvironment;

        const totalAppWebPageViews = await appAdoptionQueryHelper.getAppWebPageViewsDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        await appAdoptionDashboard.appWebPageViewsMetrics.scrollToComponent();
        //UI Data Validation
        await appAdoptionDashboard.appWebPageViewsMetrics.verifyUIDataMatchesWithSnowflakeData(totalAppWebPageViews);

        //verify the downloaded file is not empty
        const { filePath } = await appAdoptionDashboard.appWebPageViewsMetrics.downloadDataAsCSV();

        // Use the new CSV validation utility with transformation-based approach
        await CSVValidationUtil.validateAndAssert({
          csvPath: filePath,
          expectedDBData: totalAppWebPageViews as any,
          metricName: 'App web page views',
          selectedPeriod: testFiltersConfig.timePeriod,
          expectedHeaders: [
            'Web page group',
            'Total people',
            'Page view count',
            'Percentage contribution to total page views',
          ],
          transformations: {
            headerMapping: {
              'Web page group': 'webPageGroup',
              'Total people': 'totalPeople',
              'Page view count': 'pageViewCount',
              'Percentage contribution to total page views': 'percentageContributionToTotalPageViews',
            },
            valueMappings: {
              webPageGroup: { 'N/A': 'Undefined' },
            },
            percentageField: {
              fieldName: 'percentageContributionToTotalPageViews',
              normalizeToPercentage: true,
            },
            tolerance: {
              percentage: 1,
            },
          },
        });
      }
    );

    test(
      'verify impact of applied filter on adoption leaders  metric',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.TABULAR_METRIC, '@adoption-leaders-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify impact of applied filter on adoption leaders metric',
          zephyrTestId: '',
        });

        const { appAdoptionQueryHelper, appAdoptionDashboard } = testEnvironment;

        //fetch data from snowflake for all the filters applied
        const adoptionLeadersDataFromSnowflake = await appAdoptionQueryHelper.getAdoptionLeadersData({
          filterBy: testFiltersConfig,
          groupBy: GroupByOnUserParameter.DEPARTMENT,
        });

        console.log(`Fetched data from snowflake: ${JSON.stringify(adoptionLeadersDataFromSnowflake, null, 2)}`);

        //validate the data on UI matches with the data from snowflake
        const leadersMetrics = appAdoptionDashboard.adoptionLeadersMetrics;

        await leadersMetrics.scrollToComponent();
        //verify metric title is as per group by column name
        await leadersMetrics.verifyTableHeadingIsAsExpected(
          `Adoption leaders by ${testFiltersConfig.groupBy || GroupByOnUserParameter.DEPARTMENT}`
        );

        //download the data from UI
        const { filePath } = await leadersMetrics.downloadDataAsCSV();
        console.log(`Downloaded data from UI should be saved at: ${filePath}`);

        //validate the data on UI matches with the data from snowflake
        await leadersMetrics.verifyUIDataMatchesWithSnowflakeData(
          adoptionLeadersDataFromSnowflake,
          GroupByOnUserParameter.DEPARTMENT
        );

        //validate the data in the CSV matches with the data from snowflake
        await CSVValidationUtil.validateAndAssert({
          csvPath: filePath,
          expectedDBData: adoptionLeadersDataFromSnowflake as any,
          metricName: `Adoption leaders by ${testFiltersConfig.groupBy || GroupByOnUserParameter.DEPARTMENT}`,
          selectedPeriod: testFiltersConfig.timePeriod,
          expectedHeaders: [
            `${testFiltersConfig.groupBy || GroupByOnUserParameter.DEPARTMENT}`,
            'Adoption rate',
            'User logged in',
            'Total user',
          ],
          transformations: {
            headerMapping: {
              [`${testFiltersConfig.groupBy || GroupByOnUserParameter.DEPARTMENT}`]: 'viewCategory',
              'User logged in': 'loggedInUsers',
              'Total user': 'totalUsers',
              'Adoption rate': 'adoptionRate',
            },
            valueMappings: {
              viewCategory: { 'N/A': 'Undefined' },
            },
            percentageField: {
              fieldName: 'adoptionRate',
              normalizeToPercentage: true,
            },
            tolerance: {
              percentage: 1,
            },
          },
        });
      }
    );

    test(
      'verify impact of applied filter on user engagement breakdown metric',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.PIE_CHART, '@user-engagement-breakdown-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify impact of applied filter on user engagement breakdown metric',
          zephyrTestId: '',
        });

        const { appAdoptionDashboard, appAdoptionQueryHelper } = testEnvironment;

        const dbResults = await appAdoptionQueryHelper.getUserEngagementBreakdownDataFromDBWithFilters({
          filterBy: testFiltersConfig,
        });

        const userEngagementBreakdownMetric = appAdoptionDashboard.userEngagementBreakdownMetric;
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

        //verify tooltip is visible for each segment
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

    test(
      'verify impact of applied filter on adoption rate - user logins metric',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, TestCaseType.BAR_CHART, '@adoption-rate-user-logins-metric'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify impact of applied filter on adoption rate - user logins metric',
          zephyrTestId: '',
        });

        const { appAdoptionDashboard, appAdoptionQueryHelper } = testEnvironment;
        const { adoptionRateUserLoginMetrics } = appAdoptionDashboard;

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
      'verify impact of applied filter on adoption rate - user login frequency distribution metric',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          TestCaseType.BAR_CHART,
          '@adoption-rate-user-login-frequency-distribution-metric',
        ],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify impact of applied filter on adoption rate - user login frequency distribution metric',
          zephyrTestId: '',
        });

        const { appAdoptionDashboard, appAdoptionQueryHelper } = testEnvironment;
        const { adoptionRateUserLoginFrequencyDistributionMetrics } = appAdoptionDashboard;

        //hover on each bar and verify the tooltip is visible
        await adoptionRateUserLoginFrequencyDistributionMetrics.scrollToComponent();

        // Verify x-axis and y-axis labels based on filter (handles 7 days and 30 days)
        await adoptionRateUserLoginFrequencyDistributionMetrics.verifyChartLegendsAreAsExpected({
          numberOfChartLegends: 5,
          chartLegends: ['No logins', '1-3 times', '4-7 times', '8-10 times', '10+ times'],
        });

        // Get adoption rate user login data from database
        const userLoginFrequencyDistributionData =
          await appAdoptionQueryHelper.getUserLoginFrequencyDistributionDataFromDBWithFilters({
            filterBy: testFiltersConfig,
          });

        console.log(`----> The user login frequency distribution data is  `, userLoginFrequencyDistributionData);

        //
        await adoptionRateUserLoginFrequencyDistributionMetrics.verifyBarsWithTooltips(
          userLoginFrequencyDistributionData
        );

        //veirfy i can click on legent to enable/disable
        await adoptionRateUserLoginFrequencyDistributionMetrics.clickOnLegendWithLabelAs('No logins');
        await adoptionRateUserLoginFrequencyDistributionMetrics.verifyLegendWithLabelIsDisabled('No logins');
        //verify the count of bars is reduced to 4
        await adoptionRateUserLoginFrequencyDistributionMetrics.verifyNumberOfBarsAreAsExpected({ numberOfBars: 4 });
        //re-enable the legend
        await adoptionRateUserLoginFrequencyDistributionMetrics.clickOnLegendWithLabelAs('No logins', { force: true });
        await adoptionRateUserLoginFrequencyDistributionMetrics.verifyLegendWithLabelIsEnabled('No logins');
        //verify the count of bars is restored to 5
        await adoptionRateUserLoginFrequencyDistributionMetrics.verifyNumberOfBarsAreAsExpected({ numberOfBars: 5 });
      }
    );
  }
);
