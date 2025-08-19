import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { AccessControlGroupsPage, ACGFeature } from '@platforms/pages/abacPage/acgPage/accessControlGroupsPage';

import { TestSuite } from '@/src/core/constants/testSuite';

test.describe(
  'ACG Testcases',
  {
    tag: [TestSuite.ABAC],
  },
  () => {
    let audienceId: string | undefined;
    let acgName: string | undefined;
    let categoryToCreate: string | undefined;
    let audienceToCreate: string = '';
    let categoryId: string | undefined;

    test.beforeEach(async ({ appManagerApiClient }) => {
      categoryToCreate = `ABAC_Target_Category`;
      audienceToCreate = `ABAC_Target_Audience_${Date.now()}`;
      await appManagerApiClient.getIdentityService().createCategory(categoryToCreate);
      categoryId = await appManagerApiClient.getIdentityService().getCategoryId(categoryToCreate, 100);
      audienceId = await appManagerApiClient
        .getIdentityService()
        .createAudience(audienceToCreate, categoryId, 'first_name', 'CONTAINS', 'something');
    });

    test.afterEach(async ({ appManagerApiClient }) => {
      //delete the audience if it exists
      if (audienceId != undefined) {
        // Cleanup
        await appManagerApiClient.getIdentityService().deleteAudience(audienceId);
      }

      //delete the acg if it exists
      if (acgName != undefined) {
        await appManagerApiClient.getIdentityService().deleteACGByName(acgName);
      }
    });

    /**
     * We will not be setting up the acg name instead
     * based on selected audience , the name will be generated automatically
     * and we will be using that name to delete the acg
     */
    test(
      'Verify that single ACG can be created and deleted without any issue',
      {
        tag: [TestPriority.P0],
      },
      async ({ appManagerPage, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-29969', 'PS-29972'],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerPage);
        // Test Scenario(s)
        await accessControlGroupsPage.loadPage();
        //after these actions are done, we will wait for the api call to be completed
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
        acgName = await accessControlGroupsPage.getACGName();
        await accessControlGroupsPage.clickOnButtonWithName('Save and activate');
        await appManagerApiClient.getIdentityService().waitUntilACGIsSynced(acgName);
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.searchForACG(acgName);
        await accessControlGroupsPage.deleteFirstACG();
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully deleted');
        acgName = undefined; //reset the acg name back to undefined to avoid any future cleanup issues
      }
    );
  }
);
