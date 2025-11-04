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

test.describe(
  'app Adoption Dashboard - All Filters Applied',
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
          departments: ['Campaign', 'HR'],
          locations: ['Baran, Rajasthan, India', 'Gurugram, Haryana, India'],
          userCategories: ['Adil Option1'],
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@total-users-metric'],
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

        const totalUsersMetrics = testEnvironment.appAdoptionDashboard.totalUsersMetrics;
        //since it is a hero metric, it should return a single value and we are directly passing the value to the verifyMetricValue method
        await totalUsersMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'verify impact of applied filters on the logged in users metric',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@logged-in-users-metric'],
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@logged-in-users-metric'],
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@app-web-page-views-metric'],
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@adoption-leaders-metric'],
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@user-engagement-breakdown-metric'],
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

        // Filter out "No logins" as it's not displayed in the UI
        const visibleSegments = dbResults.filter(data => data.behaviour !== 'No logins');

        const userEngagementBreakdownMetric = appAdoptionDashboard.userEngagementBreakdownMetric;
        await userEngagementBreakdownMetric.scrollToComponent();

        // Verify number of segments matches DB results (excluding "No logins")
        await userEngagementBreakdownMetric.verifyNumberOfSegmentsVisibleonPieChartIs(visibleSegments.length);

        // Verify each segment label data points
        for (const data of visibleSegments) {
          await userEngagementBreakdownMetric.verifySegmentLabelDataPointsAreAsExpected({
            label: data.behaviour,
            expectedText: `${data.behaviour} - ${data.count} (${data.percentage}%)`,
          });
        }

        //verify tooltip is visible for each segment
        for (const data of visibleSegments) {
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
