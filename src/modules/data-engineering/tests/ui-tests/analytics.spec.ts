import { TestGroupType } from '@core/constants/testType';

import { test } from '../../fixtures/loginFixture';

import { TestPriority } from '@/src/core/constants/testPriority';
import { NewUxHomePage } from '@/src/core/ui/pages/homePage/newUxHomePage';
import { tagTest } from '@/src/core/utils/testDecorator';
import { DataEngineeringTestSuite } from '@/src/modules/data-engineering/constants/testSuite';

test.describe(
  'Analytics Dashboard Visibility',
  {
    tag: [DataEngineeringTestSuite.ANALYTICS],
  },
  () => {
    test(
      'To verify that analytics button is visible in side navigation to App manager',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ page, loginAs }) => {
        tagTest(test.info(), {
          description: 'To verify that analytics button is visible in side navigation to App manager',
          zephyrTestId: 'DE-1235',
        });

        await loginAs('appManager');

        const homepage = new NewUxHomePage(page);
        await homepage.verifyThePageIsLoaded();
        const analyticsLandingPage = await homepage.getSideNavBarComponent().clickOnAnalyticsButton();
        await analyticsLandingPage.verifyAllAnalyticsOptionsAreVisible();
      }
    );

    test(
      'To verify that analytics button is not visible in side navigation to Standard User',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ page, loginAs }) => {
        tagTest(test.info(), {
          description: 'To verify that analytics button is not visible in side navigation to Standard User',
          zephyrTestId: 'DE-1391',
        });

        await loginAs('standardUser');
        const homepage = new NewUxHomePage(page);
        await homepage.verifyThePageIsLoaded();
        await homepage.getSideNavBarComponent().verifyAnalyticsButtonVisibility(false);
      }
    );
  }
);
