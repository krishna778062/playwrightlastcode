import { TestPriority } from '@core/constants/testPriority';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TestSuite } from '@/src/core/constants/testSuite';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { LoginPage } from '@/src/core/pages/loginPage';
import { platformTestFixture as test } from '@/src/modules/platforms/fixtures/platformFixture';
import {
  AccessControlGroupsPage,
  ACGFeature,
} from '@/src/modules/platforms/pages/abacPage/acgPage/accessControlGroupsPage';

test.describe(
  'ACG Testcases',
  {
    tag: [TestSuite.ABAC],
  },
  () => {
    test(
      'Verify that single ACG can be created without any issue',
      {
        tag: [TestPriority.P0, `@ABAC`],
      },
      async ({ appManagerHomePage, appManagerPage, appManagerApiClient }) => {
        //TEST DATA
        const categoryToCreate = `ABAC_Target_Category_${Date.now()}`;
        const audienceToCreate = `ABAC_Target_Audience_${Date.now()}`;

        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerPage);
        await appManagerApiClient.getIdentityService().createCategory(categoryToCreate);
        const categoryId = await appManagerApiClient.getIdentityService().getCategoryId(categoryToCreate, 100);
        await appManagerApiClient
          .getIdentityService()
          .createAudience(audienceToCreate, categoryId, 'first_name', 'CONTAINS', 'something');

        await appManagerHomePage.goToUrl(PAGE_ENDPOINTS.ACCESS_CONTROL_GROUPS_PAGE);

        await accessControlGroupsPage.verifyThePageIsLoaded();
        await accessControlGroupsPage.clickOnCreateButton('Single');
        await accessControlGroupsPage.clickFeatureButton(ACGFeature.ALERTS);
        await accessControlGroupsPage.clickOnButtonWithName('Next');
        await accessControlGroupsPage.clickOnButtonWithName('Browse');
        await accessControlGroupsPage.searchForValues(audienceToCreate);
        await accessControlGroupsPage.clickOnAudience(audienceToCreate);
        await accessControlGroupsPage.clickOnButtonWithName('Done');
        await accessControlGroupsPage.clickOnButtonWithName('Next');
        await accessControlGroupsPage.clickOnButtonWithName('Skip');
        await accessControlGroupsPage.clickOnButtonWithName('Skip');
        await accessControlGroupsPage.clickOnButtonWithName('Save and activate');
        await accessControlGroupsPage.verifyAcgToastMessage('Access control group was successfully updated', 10);
        await accessControlGroupsPage.deleteFirstACG();
        await accessControlGroupsPage.verifyAcgToastMessage('Access control group was successfully deleted', 10);
        await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      }
    );
  }
);
