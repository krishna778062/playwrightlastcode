import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { PeopleSql } from '@data-engineering/sqlQueries/people';
import { Page, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PeopleDashboardQueryHelper, SnowflakeHelper } from '../../../helpers';
import { PeopleDashboard } from '../../../ui/dashboards/people/peopleDashboard';

import {
  cleanupDashboardTesting,
  setupPeopleDashboardForTest,
  UserRole,
} from '@/src/modules/data-engineering/helpers/dashboardSetupHelper';

test.describe(
  'people dashboard - default state validation',
  {
    tag: [DataEngineeringTestSuite.PEOPLE, '@default-state'],
  },
  () => {
    let testEnvironment: {
      page: Page;
      peopleDashboard: PeopleDashboard;
      peopleQueryHelper: PeopleDashboardQueryHelper;
      snowflakeHelper: SnowflakeHelper;
    };

    test.beforeAll('Setup People Dashboard', async ({ browser }) => {
      // Setup dashboard using dedicated method
      testEnvironment = await setupPeopleDashboardForTest(browser, UserRole.APP_MANAGER);
    });

    test.afterAll('Cleanup People Dashboard', async () => {
      // Cleanup using helper
      await cleanupDashboardTesting(testEnvironment);
    });

    test(
      'verify Total Users metric displays correct count from database',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@total-users'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the Total Users metric in People dashboard matches database count',
          zephyrTestId: 'DE-XXXXX',
          storyId: 'DE-XXXXX',
        });

        // Get expected metric value from Snowflake
        const expectedMetricValue = await testEnvironment.peopleQueryHelper.getTotalUsersCount(
          PeopleSql.Total_Users_Count
        );

        // UI validation
        const totalUsersMetric = testEnvironment.peopleDashboard.totalUsers;
        await totalUsersMetric.verifyMetricUIDataPoints();
        await totalUsersMetric.verifyMetricValue(expectedMetricValue);
      }
    );

    test(
      'verify Departments metric displays correct count from database',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@departments'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the Departments metric in People dashboard matches database count',
          zephyrTestId: 'DE-XXXXX',
          storyId: 'DE-XXXXX',
        });

        // Get expected metric value from Snowflake
        const expectedMetricValue = await testEnvironment.peopleQueryHelper.getDepartmentsCount(
          PeopleSql.Departments_Count
        );

        // UI validation
        const departmentsMetric = testEnvironment.peopleDashboard.totalDepartments;
        await departmentsMetric.verifyMetricIsLoaded();
        await departmentsMetric.verifyMetricValueIsLoadedForHeroMetric(expectedMetricValue);
      }
    );

    test(
      'verify Locations metric displays correct count from database',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@locations'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the Locations metric in People dashboard matches database count',
          zephyrTestId: 'DE-XXXXX',
          storyId: 'DE-XXXXX',
        });

        // Get expected metric value from Snowflake
        const expectedMetricValue = await testEnvironment.peopleQueryHelper.getLocationsCount(
          PeopleSql.Locations_Count
        );

        // UI validation
        const locationsMetric = testEnvironment.peopleDashboard.totalLocations;
        await locationsMetric.verifyMetricIsLoaded();
        await locationsMetric.verifyMetricValueIsLoadedForHeroMetric(expectedMetricValue);
      }
    );

    test(
      'verify User Category metric displays correct count from database',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@user-category'],
      },
      async () => {
        tagTest(test.info(), {
          description: 'To verify the User Category metric in People dashboard matches database count',
          zephyrTestId: 'DE-XXXXX',
          storyId: 'DE-XXXXX',
        });

        // Get expected metric value from Snowflake
        const expectedMetricValue = await testEnvironment.peopleQueryHelper.getUserCategoryCount(
          PeopleSql.User_Category_Count
        );

        // UI validation
        const userCategoryMetric = testEnvironment.peopleDashboard.totalUserCategories;
        await userCategoryMetric.verifyMetricIsLoaded();
        await userCategoryMetric.verifyMetricValueIsLoadedForHeroMetric(expectedMetricValue);
      }
    );
  }
);
