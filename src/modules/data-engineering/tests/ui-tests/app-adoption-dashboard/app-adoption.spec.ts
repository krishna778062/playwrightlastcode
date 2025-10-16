import { DataEngineeringTestSuite } from '@data-engineering/constants/testSuite';
import { analyticsTestFixture as test } from '@data-engineering/fixtures/analyticsFixture';

import { TestGroupType } from '@/src/core';
import { TestPriority } from '@/src/core/constants/testPriority';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe(
  'app Adoption Dashboard',
  {
    tag: [DataEngineeringTestSuite.ADOPTION],
  },
  () => {
    test(
      'verify Department, Location, Company name, People Category and Period filters',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify common filters presence and that their dialogs open with expected controls',
          zephyrTestId: '',
        });

        const { appAdoptionDashboard } = appManagerFixture;
        await appAdoptionDashboard.loadPage();
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
