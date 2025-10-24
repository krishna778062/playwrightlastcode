import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { GroupByOnUserParameter } from '../../../constants/filters';
import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { SnowflakeHelper } from '../../../helpers';
import { AppAdoptionDashboardQueryHelper } from '../../../helpers/appAdaptionQueryHelper';
import { FilterOptions } from '../../../helpers/baseAnalyticsQueryHelper';
import { AppAdoptionDashboard } from '../../../ui/dashboards';

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
  'app Adoption Dashboard - Default Load State',
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
      'Setting up the app adoption dashboard without making any changes to the filters',
      async ({ browser }) => {
        // Setup dashboard using dedicated method
        testEnvironment = await setupAppAdoptionDashboardForTest(browser, UserRole.APP_MANAGER);

        testFiltersConfig = {
          tenantCode: process.env.ORG_ID!,
          timePeriod: PeriodFilterTimeRange.LAST_30_DAYS, //default period filter
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
        console.log(`Fetched dbValues for given query : ${JSON.stringify(loggedInUsersMetricData)}`);

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
        console.log(`Fetched dbValues for given query : ${JSON.stringify(contributorsAndParticipantsData)}`);

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
        console.log(`Fetched dbValues for given query : ${JSON.stringify(totalAppWebPageViews)}`);

        const totalAppWebPageViewsMetrics = appAdoptionDashboard.appWebPageViewsMetrics;
        await totalAppWebPageViewsMetrics.scrollToComponent();
        await totalAppWebPageViewsMetrics.verifyUIDataMatchesWithSnowflakeData(totalAppWebPageViews);
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

        //validate the data on UI matches with the data from snowflake
        const leadersMetrics = appAdoptionDashboard.adoptionLeadersMetrics;

        //verify metric title is as per group by column name
        await leadersMetrics.verifyTableHeadingIsAsExpected(`Adoption leaders by ${testFiltersConfig.groupBy}`);

        await leadersMetrics.verifyUIDataMatchesWithSnowflakeData(
          adoptionLeadersDataFromSnowflake,
          GroupByOnUserParameter.DEPARTMENT
        );
      }
    );
  }
);
