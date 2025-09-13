// @/src imports
// @core imports
import { POPUP_BUTTONS } from '@core/constants/popupButtons';
import { TestPriority } from '@core/constants/testPriority';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { tagTest } from '@core/utils/testDecorator';
// @platforms imports
import { ACG_COLUMNS, ACG_EDIT_ASSETS,ACG_STATUS } from '@platforms/constants/acg';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { AccessControlGroupsPage, ACGFeature } from '@platforms/pages/abacPage/acgPage/accessControlGroupsPage';

import { AUDIENCE_API_ATTRIBUTES, AUDIENCE_API_OPERATORS } from '@/src/core/constants/createAudienceAPI';
import { TestSuite } from '@/src/core/constants/testSuite';
import { audienceCreationParams } from '@/src/core/types/audience.type';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';

test.describe(
  'ACG Testcases',
  {
    tag: [TestSuite.ABAC],
  },
  () => {
    const audienceId: string[] = [];
    const acgName: string[] = [];
    let categoryToCreate: string | undefined;
    const audienceToCreate: string[] = [];
    const categoryId: string[] = [];
    let createAudienceParams: audienceCreationParams;

    test.beforeEach(async ({ appManagerApiClient }) => {
      categoryToCreate = TestDataGenerator.generateCategoryName('ABAC_Target_Category');
      audienceToCreate.push(TestDataGenerator.generateCategoryName('ABAC_Target_Audience'));
      audienceToCreate.push(TestDataGenerator.generateCategoryName('ABAC_Target_Audience_Secondary'));

      categoryId.push(await appManagerApiClient.getIdentityService().createCategory(categoryToCreate));
      createAudienceParams = {
        audienceName: audienceToCreate[0],
        categoryId: categoryId[0],
        attribute: AUDIENCE_API_ATTRIBUTES.FIRST_NAME,
        operator: AUDIENCE_API_OPERATORS.CONTAINS,
        value: 'something',
      };
      audienceId.push(await appManagerApiClient.getIdentityService().createAudience(createAudienceParams));
      createAudienceParams.audienceName = audienceToCreate[1];
      audienceId.push(await appManagerApiClient.getIdentityService().createAudience(createAudienceParams));
    });

    test.afterEach(async ({ appManagerApiClient }) => {
      //delete the acg if it exists
      while (acgName.length > 0) {
        await appManagerApiClient.getIdentityService().deleteACGByName(acgName.pop() as string);
      }
      //delete the audiences if it exists
      while (audienceId.length > 0) {
        await appManagerApiClient.getIdentityService().deleteAudience(audienceId.pop() as string);
      }
      //delete the category if it exists
      while (categoryId.length > 0) {
        await appManagerApiClient.getIdentityService().deleteCategoryById(categoryId.pop() as string);
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
        acgName.push(await accessControlGroupsPage.createACGWithTargetAudienceOnly(audienceToCreate[0]));
        await accessControlGroupsPage.verifyACGStatus(acgName[0], ACG_STATUS.ACTIVE);
        await appManagerApiClient.getIdentityService().waitUntilACGIsSynced(acgName[0]);
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.dismissTheToastMessage();
        await accessControlGroupsPage.deleteACG(acgName.pop() as string);
      }
    );

    test(
      'Verify that status of the ACG should be displayed as Active or Inactive immediately after creation',
      {
        tag: [TestPriority.P0, `@ABAC`, `@acg`],
      },
      async ({ appManagerPage, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: 'PS-32216',
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerPage);
        // Test Scenario - Verify that status of the ACG should be displayed as Inactive immediately after creation
        await accessControlGroupsPage.loadPage();
        acgName.push(
          await accessControlGroupsPage.createACGWithTargetAudienceOnly(audienceToCreate[0], {
            acgStatus: 'Inactive',
          })
        );
        await accessControlGroupsPage.verifyACGStatus(acgName[0], ACG_STATUS.INACTIVE);
        await appManagerApiClient.getIdentityService().waitUntilACGIsSynced(acgName[0]);
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.dismissTheToastMessage();
        await accessControlGroupsPage.deleteACG(acgName.pop() as string);
      }
    );

    test(
      'Verify that user manager should have access for ACG creation',
      {
        tag: [TestPriority.P1, `@ABAC`, `@acg`],
      },
      async ({ userManagerPage, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-33248', 'PS-33250'],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(userManagerPage);
        // Test Scenario
        await accessControlGroupsPage.loadPage();
        //after these actions are done, we will wait for the api call to be completed
        acgName.push(await accessControlGroupsPage.createACGWithTargetAudienceOnly(audienceToCreate[0]));
        await appManagerApiClient.getIdentityService().waitUntilACGIsSynced(acgName[0]);
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.dismissTheToastMessage();
        await accessControlGroupsPage.deleteACG(acgName.pop() as string);
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
        tag: [TestPriority.P0, `@ABAC`, `@acg`],
      },
      async ({ appManagerPage, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-32210'],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerPage);
        // Pre-requisite
        await accessControlGroupsPage.loadPage();
        // Create an ACG with target audiecne only
        acgName.push(await accessControlGroupsPage.createACGWithTargetAudienceOnly(audienceToCreate[0]));
        await appManagerApiClient.getIdentityService().waitUntilACGIsSynced(acgName[0]);
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.dismissTheToastMessage();
        // Test Scenario
        await accessControlGroupsPage.clickOnCreateButtonToInitiateControlGroupCreationFlowFor('Single');
        await accessControlGroupsPage.selectFeatureToAddToControlGroup(ACGFeature.ALERTS);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.NEXT);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.BROWSE);
        await accessControlGroupsPage.searchForValues(audienceToCreate[0]);
        await accessControlGroupsPage.clickOnAudience(audienceToCreate[0]);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.DONE);
        await accessControlGroupsPage.createACGModal.verifyDuplicateTargetGroupsErrorMessage();
        await accessControlGroupsPage.createACGModal.clickCloseButton();
        // Clean up: Delete the above created ACG
        await accessControlGroupsPage.deleteACG(acgName.pop() as string);
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
        acgName.push(await accessControlGroupsPage.createACGWithTargetAudienceOnly(audienceToCreate[0]));
        await appManagerApiClient.getIdentityService().waitUntilACGIsSynced(acgName[0]);
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.dismissTheToastMessage();
        acgName.push(await accessControlGroupsPage.createACGWithTargetAudienceOnly(audienceToCreate[1]));
        await appManagerApiClient.getIdentityService().waitUntilACGIsSynced(acgName[1]);
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.dismissTheToastMessage();
        // Test Scenario
        await accessControlGroupsPage.searchForACG(acgName[1]);
        await accessControlGroupsPage.editACG(acgName[1]);
        await accessControlGroupsPage.confirmEditACGModal.clickContinueButton();
        await accessControlGroupsPage.editACGModal.clickOnEditButtonOnSummaryScreen(ACG_EDIT_ASSETS.TARGET_AUDIENCE);
        await accessControlGroupsPage.editACGModal.clickOnRemoveButtonForAudience(audienceToCreate[1]);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.BROWSE);
        await accessControlGroupsPage.searchForValues(audienceToCreate[0]);
        await accessControlGroupsPage.clickOnAudience(audienceToCreate[0]);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.DONE);
        await accessControlGroupsPage.editACGModal.verifyDuplicateTargetGroupsErrorMessage();
        await accessControlGroupsPage.editACGModal.clickCloseButton();
        // Clean up: Delete the above created ACG
        await accessControlGroupsPage.deleteACG(acgName.pop() as string);
        await accessControlGroupsPage.deleteACG(acgName.pop() as string);
      }
    );

    test(
      `Verify that Name column is displayed and is sortable at Access control groups page`,
      {
        tag: [TestPriority.P1, `@ABAC`, `@acg`, `@this-one`],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: [
            'PS-31013',
            'PS-31032',
            'PS-31039',
            'PS-31028',
            'PS-31023',
            'PS-31018',
            'PS-31100',
            'PS-31007',
          ],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerPage);
        // Test Scenario
        await accessControlGroupsPage.loadPage();
        await accessControlGroupsPage.verifyColumnIsDisplayed(ACG_COLUMNS.NAME);
        await accessControlGroupsPage.verifyColumnSortable(ACG_COLUMNS.NAME, true);
        await accessControlGroupsPage.verifyColumnIsDisplayed(ACG_COLUMNS.FEATURE);
        await accessControlGroupsPage.verifyColumnSortable(ACG_COLUMNS.FEATURE, true);
        await accessControlGroupsPage.verifyColumnIsDisplayed(ACG_COLUMNS.GROUP_TYPE);
        await accessControlGroupsPage.verifyColumnSortable(ACG_COLUMNS.GROUP_TYPE, true);
        await accessControlGroupsPage.verifyColumnIsDisplayed(ACG_COLUMNS.TARGET_AUDIENCE);
        await accessControlGroupsPage.verifyColumnSortable(ACG_COLUMNS.TARGET_AUDIENCE, false);
        await accessControlGroupsPage.verifyColumnIsDisplayed(ACG_COLUMNS.MANAGERS);
        await accessControlGroupsPage.verifyColumnSortable(ACG_COLUMNS.MANAGERS, false);
        await accessControlGroupsPage.verifyColumnIsDisplayed(ACG_COLUMNS.ADMINS);
        await accessControlGroupsPage.verifyColumnSortable(ACG_COLUMNS.ADMINS, false);
        await accessControlGroupsPage.verifyColumnIsDisplayed(ACG_COLUMNS.STATUS);
        await accessControlGroupsPage.verifyColumnSortable(ACG_COLUMNS.STATUS, true);
        await accessControlGroupsPage.verifyColumnIsDisplayed(ACG_COLUMNS.MODIFIED);
        await accessControlGroupsPage.verifyColumnSortable(ACG_COLUMNS.MODIFIED, true);
      }
    );

    test(
      `Verify the sorting functionality of Name column in access control groups page`,
      {
        tag: [TestPriority.P1, `@ABAC`, `@acg`, `@this-one`],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-35732'],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerPage);
        // Test Scenario
        await accessControlGroupsPage.loadPage();
        await accessControlGroupsPage.verifyTheSortingFunctionalityOfColumn(ACG_COLUMNS.NAME);
      }
    );

    test(
      `Verify the sorting functionality of Feature column in access control groups page`,
      {
        tag: [TestPriority.P1, `@ABAC`, `@acg`, `@this-one`],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-35733', 'PS-35734', 'PS-35735', 'PS-35736'],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerPage);
        // Test Scenario
        await accessControlGroupsPage.loadPage();
        await accessControlGroupsPage.verifyTheSortingFunctionalityOfColumn(ACG_COLUMNS.FEATURE);
        await accessControlGroupsPage.verifyTheSortingFunctionalityOfColumn(ACG_COLUMNS.GROUP_TYPE);
        await accessControlGroupsPage.verifyTheSortingFunctionalityOfColumn(ACG_COLUMNS.STATUS);
        await accessControlGroupsPage.verifyTheSortingFunctionalityOfColumn(ACG_COLUMNS.MODIFIED);
      }
    );
  }
);
