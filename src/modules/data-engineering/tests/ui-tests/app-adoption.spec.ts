import { TestGroupType } from '@core/constants/testType';

import { test } from '../../fixtures/loginFixture';

import { TestPriority } from '@/src/core/constants/testPriority';
import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { tagTest } from '@/src/core/utils/testDecorator';
import { DataEngineeringTestSuite } from '@/src/modules/data-engineering/constants/testSuite';
import { AppAdoptionPage } from '@/src/modules/data-engineering/pages/appAdoptionPage';

test.describe(
  'App Adoption Dashboard',
  {
    tag: [DataEngineeringTestSuite.ADOPTION],
  },
  () => {
    test(
      'Verify Department, Location, Company name, People Category and Period filters',
      {
        tag: [TestPriority.P0, TestGroupType.REGRESSION],
      },
      async ({ page, loginAs }) => {
        tagTest(test.info(), {
          description: 'Verify common filters presence and that their dialogs open with expected controls',
          zephyrTestId: '',
        });

        await loginAs('appManager');

        const homepage = new NewUxHomePage(page);
        await homepage.getSideNavBarComponent().clickOnAnalyticsButton();

        const adoptionPage = new AppAdoptionPage(page);
        await adoptionPage.navigateToAppAdoption();

        await adoptionPage.verifyCommonFiltersVisible();

        await adoptionPage.verifyFilterDialogUI('Department');
        await adoptionPage.verifyFilterDialogUI('Location');
        await adoptionPage.verifyFilterDialogUI('Company name');
        await adoptionPage.verifyFilterDialogUI('People Category'); //condition needs to be added after discussion
        await adoptionPage.verifyFilterPeriodUI('Period');
      }
    );
  }
);
