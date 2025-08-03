import { test } from '@playwright/test';
import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { LoginHelper } from '@core/helpers/loginHelper';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { PlatformsBasePage } from '../../../pages/platformsBasePage';
import { LoginPage } from '@/src/core/pages/loginPage';


test.describe(
  'ACG Testcases',
  {
    tag: [TestSuite.ABAC]
  },
   () => {
    test(
      'Verify that single ACG can be created without any issue',
      {
        tag: [TestPriority.P0, `@ABAC`],
      },
      async ({ page }) => {
        const platformsBasePage: PlatformsBasePage = new PlatformsBasePage(page);
        const loginPage: LoginPage = new LoginPage(page);
        const homePage = await LoginHelper.loginWithPassword(page, {
          email: getEnvConfig().appManagerEmail,
          password: getEnvConfig().appManagerPassword,
        });
        await homePage.verifyThePageIsLoaded();
        await homePage.goToUrl(getEnvConfig().frontendBaseUrl + '/manage/access-control/groups');
        await platformsBasePage.accessControlGroupsPage.verifyThePageIsLoaded();
        await platformsBasePage.accessControlGroupsPage.clickOnCreateButton('Single');
        await platformsBasePage.accessControlGroupsPage.clickFeatureButton('Alerts');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Next');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Browse');
        await platformsBasePage.accessControlGroupsPage.SearchForValues('Audience User12');
        await platformsBasePage.accessControlGroupsPage.waitForAudiencesToLoad();
        await platformsBasePage.accessControlGroupsPage.clickOnAudience('Audience User12');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Done');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Next');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Skip');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Skip');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Save and activate');
        await platformsBasePage.accessControlGroupsPage.verifyAcgToastMessage('Access control group was successfully updated',10);
        await platformsBasePage.accessControlGroupsPage.deleteFirstACG();
        await platformsBasePage.accessControlGroupsPage.verifyAcgToastMessage('Access control group was successfully deleted',10);
        await homePage.goToUrl(getEnvConfig().frontendBaseUrl + '/logout');
        await loginPage.verifyThePageIsLoaded();
      }
    );
  }
);