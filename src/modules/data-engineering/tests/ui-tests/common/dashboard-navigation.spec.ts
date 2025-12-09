import { analyticsTestFixture as test } from '@data-engineering/fixtures/analyticsFixture';

import { TestGroupType } from '@core/constants/testType';

import { TestPriority } from '@/src/core/constants/testPriority';
import { tagTest } from '@/src/core/utils/testDecorator';
import { DataEngineeringTestSuite } from '@/src/modules/data-engineering/constants/testSuite';

test.describe(
  'analytics landing page navigation',
  {
    tag: [DataEngineeringTestSuite.ANALYTICS],
  },
  () => {
    test(
      'verify that app manager is able to navigate to analytics landing page and see all analytics options',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'To verify that analytics button is visible in side navigation to App manager',
          zephyrTestId: 'DE-1235',
        });

        const analyticsLandingPage = await appManagerFixture.navigationHelper.navigateToAnalyticsLandingPage();
        await analyticsLandingPage.verifyAllAnalyticsOptionsAreVisible();
      }
    );

    test(
      'verify that standard user is not able to navigate to analytics landing page as the analytics button is not visible in side navigation',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'To verify that analytics button is not visible in side navigation to Standard User',
          zephyrTestId: 'DE-1391',
        });
        await standardUserFixture.navigationHelper.sideNavBarComponent.verifyAnalyticsButtonVisibility(false);
      }
    );
  }
);
