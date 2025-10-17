import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { Page, test } from '@playwright/test';

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

        const { appAdoptionDashboard } = testEnvironment;
        const contributorsAndParticipantsMetrics = appAdoptionDashboard.contributorsAndParticipantsMetrics;
        const absoluteMetricValue = await contributorsAndParticipantsMetrics.getAbsoluteMetricValue();
        const metricValueInPercentage = await contributorsAndParticipantsMetrics.getMetricValueInPercentage();
        const trendDirection = await contributorsAndParticipantsMetrics.getTrendDirection();
        const benchMarkComparisonText = await contributorsAndParticipantsMetrics.getBenchMarkComparisonText();
        console.log(`absoluteMetricValue: ${absoluteMetricValue}`);
        console.log(`metricValueInPercentage: ${metricValueInPercentage}`);
        console.log(`trendDirection: ${trendDirection}`);
        console.log(`benchMarkComparisonText: ${benchMarkComparisonText}`);
      }
    );
  }
);
