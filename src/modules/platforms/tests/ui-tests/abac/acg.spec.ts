import { TestPriority } from '@core/constants/testPriority';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { AccessControlGroupsPage, ACGFeature } from '@platforms/pages/abacPage/acgPage/accessControlGroupsPage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TestSuite } from '@/src/core/constants/testSuite';
import { LoginHelper } from '@/src/core/helpers/loginHelper';

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

        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerPage);
        await appManagerApiClient.getIdentityService().createCategory(categoryToCreate);
        const categoryId = await appManagerApiClient.getIdentityService().getCategoryId(categoryToCreate, 100);
        await appManagerApiClient
          .getIdentityService()
          .createAudience(audienceToCreate, categoryId, 'first_name', 'CONTAINS', 'something');

        await appManagerHomePage.goToUrl(PAGE_ENDPOINTS.ACCESS_CONTROL_GROUPS_PAGE);

        await accessControlGroupsPage.verifyThePageIsLoaded();
        await accessControlGroupsPage.clickOnCreateButtonToInitiateControlGroupCreationFlowFor('Single');
        await accessControlGroupsPage.selectFeatureToAddToControlGroup(ACGFeature.ALERTS);
        await accessControlGroupsPage.clickOnButtonWithName('Next');
        await accessControlGroupsPage.clickOnButtonWithName('Browse');
        await accessControlGroupsPage.searchForValues(audienceToCreate);
        await accessControlGroupsPage.clickOnAudience(audienceToCreate);
        await accessControlGroupsPage.clickOnButtonWithName('Done');
        await accessControlGroupsPage.clickOnButtonWithName('Next');
        await accessControlGroupsPage.clickOnButtonWithName('Skip');
        await accessControlGroupsPage.clickOnButtonWithName('Skip');
        await accessControlGroupsPage.clickOnButtonWithName('Save and activate');
        await accessControlGroupsPage.verifyAcgToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.deleteFirstACG();
        await accessControlGroupsPage.verifyAcgToastMessage('Access control group was successfully deleted');
        await LoginHelper.logoutByNavigatingToLogoutPage(appManagerPage);
      }
    );
  }
);
