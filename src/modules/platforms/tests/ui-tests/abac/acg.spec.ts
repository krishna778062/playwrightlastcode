import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { AccessControlGroupsPage, ACGFeature } from '@platforms/pages/abacPage/acgPage/accessControlGroupsPage';

import { TestSuite } from '@/src/core/constants/testSuite';
import { LoginHelper } from '@/src/core/helpers/loginHelper';

test.describe(
  'ACG Testcases',
  {
    tag: [TestSuite.ABAC],
  },
  () => {
    test.only(
      'Verify that single ACG can be created and deleted without any issue',
      {
        tag: [TestPriority.P0, `@ABAC`],
      },
      async ({ appManagerPage, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-29969', 'PS-29972'],
        });
        //TEST DATA
        const categoryToCreate = `ABAC_Target_Category`;
        const audienceToCreate = `ABAC_Target_Audience_${Date.now()}`;

        // Prerequisite
        await appManagerApiClient.getIdentityService().createCategory(categoryToCreate);
        const categoryId = await appManagerApiClient.getIdentityService().getCategoryId(categoryToCreate, 100);
        const audienceId: string = await appManagerApiClient
          .getIdentityService()
          .createAudience(audienceToCreate, categoryId, 'first_name', 'CONTAINS', 'something');
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerPage);

        // Test Scenario(s)
        await accessControlGroupsPage.loadPage();
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
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.deleteFirstACG();
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully deleted');

        // Cleanup
        await appManagerApiClient.getIdentityService().deleteAudience(audienceId);
      }
    );
  }
);
