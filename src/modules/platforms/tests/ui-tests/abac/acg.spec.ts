import { platformTestFixture as test } from '@/src/modules/platforms/fixtures/platformFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { PlatformsBasePage } from '@/src/modules/platforms/pages/platformsBasePage';
import { LoginPage } from '@/src/core/pages/loginPage';
import { ACGFeature } from '@/src/modules/platforms/pages/abacPage/acgPage/accessControlGroupsPage';
import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';

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
      async ({ appManagerHomePage, appManagerPage, appManagerApiClient}) => {
        const platformsBasePage: PlatformsBasePage = new PlatformsBasePage(appManagerPage);
        const loginPage: LoginPage = new LoginPage(appManagerPage);

        await appManagerApiClient.getIdentityService().createCategory("ABAC_Target_Audiences");
        const categoryId = await appManagerApiClient.getIdentityService().getCategoryId("ABAC_Target_Audiences",100);
        await appManagerApiClient.getIdentityService().createAudience("ABAC_Target_Audience1",categoryId,"first_name","CONTAINS","something");
        
        await appManagerHomePage.goToUrl(PAGE_ENDPOINTS.ACCESS_CONTROL_GROUPS_PAGE);

        await platformsBasePage.accessControlGroupsPage.verifyThePageIsLoaded();
        await platformsBasePage.accessControlGroupsPage.clickOnCreateButton('Single');
        await platformsBasePage.accessControlGroupsPage.clickFeatureButton(ACGFeature.ALERTS);
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Next');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Browse');
        await platformsBasePage.accessControlGroupsPage.searchForValues('ABAC_Target_Audience1');
        await platformsBasePage.accessControlGroupsPage.clickOnAudience('ABAC_Target_Audience1');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Done');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Next');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Skip');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Skip');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Save and activate');
        await platformsBasePage.accessControlGroupsPage.verifyAcgToastMessage('Access control group was successfully updated',10);
        await platformsBasePage.accessControlGroupsPage.deleteFirstACG();
        await platformsBasePage.accessControlGroupsPage.verifyAcgToastMessage('Access control group was successfully deleted',10);

        await appManagerHomePage.goToUrl(PAGE_ENDPOINTS.LOGOUT);
        await loginPage.verifyThePageIsLoaded();
      }
    );
  }
);