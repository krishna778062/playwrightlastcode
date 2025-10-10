import { TestGroupType } from '@core/constants/testType';

import { test } from '../../fixtures/loginFixture';

import { TestPriority } from '@/src/core/constants/testPriority';
import { NavigationHelper } from '@/src/core/helpers/navigationHelper';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
import { tagTest } from '@/src/core/utils/testDecorator';
import { DataEngineeringTestSuite } from '@/src/modules/data-engineering/constants/testSuite';

test.describe(
  'analytics Dashboard Visibility',
  {
    tag: [DataEngineeringTestSuite.ANALYTICS],
  },
  () => {
    test(
      'to verify that analytics button is visible in side navigation to App manager',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ page, loginAs }) => {
        tagTest(test.info(), {
          description: 'To verify that analytics button is visible in side navigation to App manager',
          zephyrTestId: 'DE-1235',
        });

        await loginAs('appManager');

        const homepage = new NewHomePage(page);
        await homepage.verifyThePageIsLoaded();
        const appManagerUINavigationHelper = new NavigationHelper(page);
        const analyticsLandingPage = await appManagerUINavigationHelper.sideNavBarComponent.clickOnAnalyticsButton();
        await analyticsLandingPage.verifyAllAnalyticsOptionsAreVisible();
      }
    );

    test(
      'to verify that analytics button is not visible in side navigation to Standard User',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ page, loginAs }) => {
        tagTest(test.info(), {
          description: 'To verify that analytics button is not visible in side navigation to Standard User',
          zephyrTestId: 'DE-1391',
        });

        await loginAs('standardUser');
        const homepage = new NewHomePage(page);
        await homepage.verifyThePageIsLoaded();
        const appManagerUINavigationHelper = new NavigationHelper(page);
        await appManagerUINavigationHelper.sideNavBarComponent.verifyAnalyticsButtonVisibility(false);
      }
    );
  }
);
