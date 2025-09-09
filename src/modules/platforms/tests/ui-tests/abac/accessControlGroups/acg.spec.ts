import { TestPriority } from '@core/constants/testPriority';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { AccessControlGroupsPage, ACGFeature } from '@platforms/pages/abacPage/acgPage/accessControlGroupsPage';
import { ACG_EDIT_ASSETS } from '@platforms/constants/acgEditAssets';
import { ACG_STATUS } from '@platforms/constants/acgStatus';
import { POPUP_BUTTONS } from '@core/constants/popupButtons';
import { TestSuite } from '@/src/core/constants/testSuite';

test.describe(
  'ACG Testcases',
  {
    tag: [TestSuite.ABAC],
  },
  () => {
    let audienceId1: string | undefined;
    let audienceId2: string | undefined;
    let acgName1: string | undefined;
    let acgName2: string | undefined;
    let categoryToCreate: string | undefined;
    let audienceToCreate1: string = '';
    let audienceToCreate2: string = '';
    let categoryId: string | undefined;

    test.beforeEach(async ({ appManagerApiClient }) => {
      categoryToCreate = `ABAC_Target_Category`;
      audienceToCreate1 = `ABAC_Target_Audience_${Date.now()}`;
      audienceToCreate2 = `ABAC_Target_Audience_Secondary_${Date.now()}`;

      await appManagerApiClient.getIdentityService().createCategory(categoryToCreate);
      categoryId = await appManagerApiClient.getIdentityService().getCategoryId(categoryToCreate, 100);
      audienceId1 = await appManagerApiClient
        .getIdentityService()
        .createAudience(audienceToCreate1, categoryId, 'first_name', 'CONTAINS', 'something');
      audienceId2 = await appManagerApiClient
        .getIdentityService()
        .createAudience(audienceToCreate2, categoryId, 'first_name', 'CONTAINS', 'something');
    });

    test.afterEach(async ({ appManagerApiClient }) => {
      //delete the audiences if it exists
      if (audienceId1 != undefined) {
        // Cleanup
        await appManagerApiClient.getIdentityService().deleteAudience(audienceId1);
      }
      if (audienceId2 != undefined) {
        // Cleanup
        await appManagerApiClient.getIdentityService().deleteAudience(audienceId2);
      }

      //delete the acg if it exists
      if (acgName1 != undefined) {
        await appManagerApiClient.getIdentityService().deleteACGByName(acgName1);
      }
      if (acgName2 != undefined) {
        await appManagerApiClient.getIdentityService().deleteACGByName(acgName2);
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
        tag: [TestPriority.P0, `@ABAC`, `@acg`, `@this-one`],
      },
      async ({ appManagerPage, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-29969', 'PS-29972', 'PS-32216'],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerPage);
        // Test Scenario(s)
        await accessControlGroupsPage.loadPage();
        //after these actions are done, we will wait for the api call to be completed
        acgName1 = await accessControlGroupsPage.createACGWithTargetAudienceOnly(audienceToCreate1);
        await accessControlGroupsPage.verifyACGStatus(acgName1, ACG_STATUS.ACTIVE);
        await appManagerApiClient.getIdentityService().waitUntilACGIsSynced(acgName1);
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.dismissTheToastMessage();
        await accessControlGroupsPage.deleteACG(acgName1);
        acgName1 = undefined; //reset the acg name back to undefined to avoid any future cleanup issues
      }
    );

    test(
      'Verify that status of the ACG should be displayed as Active or Inactive immediately after creation',
      {
        tag: [TestPriority.P0, `@ABAC`, `@acg`, `@this-one`],
      },
      async ({ appManagerPage, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: 'PS-32216',
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerPage);
        // Test Scenario - Verify that status of the ACG should be displayed as Inactive immediately after creation
        await accessControlGroupsPage.loadPage();
        acgName1 = await accessControlGroupsPage.createACGWithTargetAudienceOnly(audienceToCreate1, {
          acgStatus: 'Inactive',
        });
        await accessControlGroupsPage.verifyACGStatus(acgName1, ACG_STATUS.INACTIVE);
        await appManagerApiClient.getIdentityService().waitUntilACGIsSynced(acgName1);
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.dismissTheToastMessage();
        await accessControlGroupsPage.deleteACG(acgName1);
        acgName1 = undefined; //reset the acg name back to undefined to avoid any future cleanup issues
      }
    );

    test(
      'Verify that user manager should have access for ACG creation',
      {
        tag: [TestPriority.P1, `@ABAC`, `@acg`, `@this-one`],
      },
      async ({ userManagerPage, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-33248', 'PS-33250'],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(userManagerPage);
        // Test Scenario
        await accessControlGroupsPage.loadPage();
        //after these actions are done, we will wait for the api call to be completed
        acgName1 = await accessControlGroupsPage.createACGWithTargetAudienceOnly(audienceToCreate1);
        await appManagerApiClient.getIdentityService().waitUntilACGIsSynced(acgName1);
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.dismissTheToastMessage();
        await accessControlGroupsPage.deleteACG(acgName1);
        acgName1 = undefined; //reset the acg name back to undefined to avoid any future cleanup issues
      }
    );

    test(
      `Verify that Roles option should not be displayed under Manage section in menu option`,
      {
        tag: [TestPriority.P1, `@ABAC`, `@acg`],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-31188'],
        });
        const homePage = new NewUxHomePage(appManagerPage);
        // Test Scenario
        await homePage.actions.clickOnApplicationSettings();
        await homePage.actions.verifyRolesButtonVisibility(false);
      }
    );

    test(
      `Verify that redirecting to "manage/roles" url should display page not found screen`,
      {
        tag: [TestPriority.P1, `@ABAC`, `@acg`],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-31189'],
        });
        const homePage = new NewUxHomePage(appManagerPage);
        // Test Scenario
        await homePage.goToUrl('manage/roles');
        await homePage.verifyPageNotFoundVisibility();
      }
    );

    test(
      'Verify that duplicate acg error is displayed on attempting to create ACG with same features and target audiences',
      {
        tag: [TestPriority.P0, `@ABAC`, `@acg`, `@this-one`],
      },
      async ({ appManagerPage, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-32210'],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerPage);
        // Pre-requisite
        await accessControlGroupsPage.loadPage();
        // Create an ACG with target audiecne only
        acgName1 = await accessControlGroupsPage.createACGWithTargetAudienceOnly(audienceToCreate1);
        await appManagerApiClient.getIdentityService().waitUntilACGIsSynced(acgName1);
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.dismissTheToastMessage();
        // Test Scenario
        await accessControlGroupsPage.clickOnCreateButtonToInitiateControlGroupCreationFlowFor('Single');
        await accessControlGroupsPage.selectFeatureToAddToControlGroup(ACGFeature.ALERTS);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.NEXT);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.BROWSE);
        await accessControlGroupsPage.searchForValues(audienceToCreate1);
        await accessControlGroupsPage.clickOnAudience(audienceToCreate1);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.DONE);
        await accessControlGroupsPage.createACGModal.verifyDuplicateTargetGroupsErrorMessage();
        await accessControlGroupsPage.clickOnCloseButtonForCreateACGModal();
        // Clean up: Delete the above created ACG
        await accessControlGroupsPage.deleteACG(acgName1);
        acgName1 = undefined; //reset the acg name back to undefined to avoid any future cleanup issues
      }
    );

    test(
      'Verify that duplicate acg error is displayed on editing ACG to match anothers features and target audiences',
      {
        tag: [TestPriority.P0, `@ABAC`, `@acg`, `@this-one`],
      },
      async ({ appManagerPage, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-32212'],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerPage);
        await accessControlGroupsPage.loadPage();
        // Prerequisite
        // Create an ACG with target audiecne only
        acgName1 = await accessControlGroupsPage.createACGWithTargetAudienceOnly(audienceToCreate1);
        await appManagerApiClient.getIdentityService().waitUntilACGIsSynced(acgName1);
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.dismissTheToastMessage();
        acgName2 = await accessControlGroupsPage.createACGWithTargetAudienceOnly(audienceToCreate2);
        await appManagerApiClient.getIdentityService().waitUntilACGIsSynced(acgName2);
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.dismissTheToastMessage();
        // Test Scenario
        await accessControlGroupsPage.searchForACG(acgName2);
        await accessControlGroupsPage.editACG();
        await accessControlGroupsPage.confirmEditACGModal.clickContinueButton();
        await accessControlGroupsPage.editACGModal.clickOnEditButtonOnSummaryScreen(ACG_EDIT_ASSETS.TARGET_AUDIENCE);
        await accessControlGroupsPage.editACGModal.clickOnRemoveButtonForAudience(audienceToCreate2);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.BROWSE);
        await accessControlGroupsPage.searchForValues(audienceToCreate1);
        await accessControlGroupsPage.clickOnAudience(audienceToCreate1);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.DONE);
        await accessControlGroupsPage.editACGModal.verifyDuplicateTargetGroupsErrorMessage();
        await accessControlGroupsPage.clickOnCloseButtonForEditACGModal();

        // Clean up: Delete the above created ACG
        await accessControlGroupsPage.deleteACG(acgName2);
        acgName2 = undefined; //reset the acg name back to undefined to avoid any future cleanup issues
        await accessControlGroupsPage.deleteACG(acgName1);
        acgName1 = undefined; //reset the acg name back to undefined to avoid any future cleanup issues
      }
    );
  }
);
