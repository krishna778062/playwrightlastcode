import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

import { PeriodFilterTimeRange } from '../../../constants/periodFilterTimeRange';
import { SnowflakeHelper } from '../../../helpers';
import { AppAdoptionDashboardQueryHelper } from '../../../helpers/appAdaptionQueryHelper';
import { AppAdoptionDashboard } from '../../../ui/dashboards';

import { TestGroupType } from '@/src/core';
import { TestPriority } from '@/src/core/constants/testPriority';
import { tagTest } from '@/src/core/utils/testDecorator';
import {
  cleanupDashboardTesting,
  setupAppAdoptionDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';

test.describe(
  'app Adoption Dashboard',
  {
    tag: [DataEngineeringTestSuite.ADOPTION],
  },
  () => {
    let testEnvironment: {
      page: Page;
      appAdoptionDashboard: AppAdoptionDashboard;
      snowflakeHelper: SnowflakeHelper;
      appAdoptionQueryHelper: AppAdoptionDashboardQueryHelper;
    };

    test.beforeAll(async ({ browser }) => {
      // Setup dashboard using dedicated method
      testEnvironment = await setupAppAdoptionDashboardForTest(browser, UserRole.APP_MANAGER);

      //apply period filter
      const { analyticsFiltersComponent } = testEnvironment.appAdoptionDashboard;
      await analyticsFiltersComponent.verifyFilterComponentIsVisible();
      //first apply period filter
      await analyticsFiltersComponent.applyPeriodFilter(PeriodFilterTimeRange.LAST_36_MONTHS);
      //now apply department filter
      // await analyticsFiltersComponent.applyDepartmentFilter(['Campaign']);
      // //now apply location filter
      // await analyticsFiltersComponent.applyLocationFilter(['Baran, Rajasthan, India', 'Gurugram, Haryana, India']);
      // //now apply user category filter
      // await analyticsFiltersComponent.applyPeopleCategoryFilter(['Adil Option1']);
      // //now apply company name filter
      // await analyticsFiltersComponent.applyCompanyNameFilter(['Simpplr']);
      await analyticsFiltersComponent.applyGroupByOnUserParameter('User Category');
    });

    test.afterAll(async () => {
      // Cleanup using helper
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Department, Location, Company name, People Category and Period filters',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify common filters presence and that their dialogs open with expected controls',
          zephyrTestId: '',
        });

        //execute temp query to check company names
        const { appAdoptionQueryHelper } = testEnvironment;

        //verify the db values , but first extract them
        const dbValues = await appAdoptionQueryHelper.getTotalUsersDataFromDBWithFilters({
          filterBy: {
            tenantCode: process.env.ORG_ID!,
            timePeriod: PeriodFilterTimeRange.LAST_7_DAYS,
            departments: ['Campaign', 'HR'],
            locations: ['Baran, Rajasthan, India', 'Gurugram, Haryana, India'],
            userCategories: ['Adil Option1'], // Back to original UI string to test mapping
            companyName: ['Simpplr'],
          },
        });
        console.log(`dbValues: ${dbValues}`);

        const { appAdoptionDashboard } = testEnvironment;
        const totalUsersMetrics = appAdoptionDashboard.totalUsersMetrics;
        // await contributorsAndParticipantsMetrics.verifyMetricIsLoaded();
        await totalUsersMetrics.verifyMetricValue(dbValues.toString());
      }
    );

    test(
      'test group by filter',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify common filters presence and that their dialogs open with expected controls',
          zephyrTestId: '',
        });

        //execute temp query to check company names
        const { appAdoptionQueryHelper } = testEnvironment;

        //verify the db values , but first extract them
        const dbValues = await appAdoptionQueryHelper.getAdoptionLeadersDataFromDB({
          filterBy: {
            tenantCode: process.env.ORG_ID!,
            timePeriod: PeriodFilterTimeRange.LAST_36_MONTHS,
            // departments: ['Campaign'],
          },
          groupByParam: 'user_category',
        });
        console.log(`dbValues: -`, dbValues);

        // const { appAdoptionDashboard } = testEnvironment;
        // const totalUsersMetrics = appAdoptionDashboard.totalUsersMetrics;
        // // await contributorsAndParticipantsMetrics.verifyMetricIsLoaded();
        // await totalUsersMetrics.verifyMetricValue(dbValues.toString());
      }
    );
  }
);
