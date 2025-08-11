import { TestPriority } from '@core/constants/testPriority';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TestSuite } from '@/src/core/constants/testSuite';
import { LoginPage } from '@/src/core/pages/loginPage';
import { platformTestFixture as test } from '@/src/modules/platforms/fixtures/platformFixture';
import { ACGFeature } from '@/src/modules/platforms/pages/abacPage/acgPage/accessControlGroupsPage';
import { PlatformsBasePage } from '@/src/modules/platforms/pages/platformsBasePage';

test.describe(
  'ACG Testcases',
  {
    tag: [TestSuite.ABAC],
  },
  () => {
    test.only(
      'Verify that single ACG can be created without any issue',
      {
        tag: [TestPriority.P0, `@ABAC`],
      },
      async ({ appManagerHomePage, appManagerPage, appManagerApiClient }) => {
        //TEST DATA
        const categoryToCreate = `ABAC_Target_Category_${Date.now()}`;
        const audienceToCreate = `ABAC_Target_Audience_${Date.now()}`;

        const platformsBasePage: PlatformsBasePage = new PlatformsBasePage(appManagerPage);
        const loginPage: LoginPage = new LoginPage(appManagerPage);
        await appManagerApiClient.getIdentityService().createCategory(categoryToCreate);
        const categoryId = await appManagerApiClient.getIdentityService().getCategoryId(categoryToCreate, 100);
        await appManagerApiClient
          .getIdentityService()
          .createAudience(audienceToCreate, categoryId, 'first_name', 'CONTAINS', 'something');

        await appManagerHomePage.goToUrl(PAGE_ENDPOINTS.ACCESS_CONTROL_GROUPS_PAGE);

        await platformsBasePage.accessControlGroupsPage.verifyThePageIsLoaded();
        await platformsBasePage.accessControlGroupsPage.clickOnCreateButton('Single');
        await platformsBasePage.accessControlGroupsPage.clickFeatureButton(ACGFeature.ALERTS);
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Next');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Browse');
        await platformsBasePage.accessControlGroupsPage.searchForValues(audienceToCreate);
        await platformsBasePage.accessControlGroupsPage.clickOnAudience(audienceToCreate);
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Done');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Next');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Skip');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Skip');
        await platformsBasePage.accessControlGroupsPage.clickOnButtonWithName('Save and activate');
        await platformsBasePage.accessControlGroupsPage.verifyAcgToastMessage(
          'Access control group was successfully updated',
          10
        );
        await platformsBasePage.accessControlGroupsPage.deleteFirstACG();
        await platformsBasePage.accessControlGroupsPage.verifyAcgToastMessage(
          'Access control group was successfully deleted',
          10
        );

        await appManagerHomePage.goToUrl(PAGE_ENDPOINTS.LOGOUT);
        await loginPage.verifyThePageIsLoaded();
      }
    );
  }
);
