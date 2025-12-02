// @/src imports
// @core imports
import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
// import { User } from '@core/types/user.type';
import { tagTest } from '@core/utils/testDecorator';
// @platforms imports
import { AUDIENCE_API_ATTRIBUTES, AUDIENCE_API_OPERATORS } from '@platforms/apis/payloads/createAudienceAPI';
import {
  ACG_ACCESS_CONTROL_TYPE,
  ACG_COLUMNS,
  ACG_EDIT_ASSETS,
  ACG_EDIT_ASSETS_SUMMARY_SCREEN,
  ACG_FEATURE_FOR_API,
  ACG_STATUS,
  ACG_TOOLTIPS,
} from '@platforms/constants/acg';
import { POPUP_BUTTONS } from '@platforms/constants/popupButtons';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { ACGCreationParams } from '@platforms/types/acgCreationTypes';
import { AccessControlGroupsPage, ACGFeature } from '@platforms/ui/pages/abacPage/acgPage/accessControlGroupsPage';
import { FeatureOwnersPage } from '@platforms/ui/pages/abacPage/featureOwnersPage/featureOwnersPage';

import { Roles } from '@/src/core/constants/roles';
import { TestSuite } from '@/src/core/constants/testSuite';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { audienceCreationParams } from '@/src/core/types/audience.type';
import { User } from '@/src/core/types/user.type';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ACGCreationAPI, ACGCreationResponse } from '@/src/modules/platforms/apis/types/acg';

test.describe(
  'access control groups testcases',
  {
    tag: [TestSuite.ABAC],
  },
  () => {
    const audienceId: string[] = [];
    const acgName: string[] = [];
    let categoryToCreate: string | undefined;
    const targetAudienceToCreate: string[] = [];
    const managersAudienceToCreate: string[] = [];
    const adminsAudienceToCreate: string[] = [];
    const categoryId: string[] = [];
    const createTargetAudienceParams: audienceCreationParams[] = [];
    const createManagersAudienceParams: audienceCreationParams[] = [];
    const createAdminsAudienceParams: audienceCreationParams[] = [];
    const targetAudienceUser: User[] = [];
    const managersAudienceUser: User[] = [];
    const adminsAudienceUser: User[] = [];
    const targetAudienceUserId: string[] = [];
    const managersAudienceUserId: string[] = [];
    const adminsAudienceUserId: string[] = [];

    test.beforeEach(async ({ appManagerApiFixture }) => {
      const { userManagementService, apiContext, identityManagementHelper } = appManagerApiFixture;
      categoryToCreate = TestDataGenerator.generateCategoryName('ABAC_Target_Category');
      targetAudienceToCreate.push(TestDataGenerator.generateCategoryName('ABAC_Target_Audience'));
      targetAudienceToCreate.push(TestDataGenerator.generateCategoryName('ABAC_Target_Audience_Secondary'));
      managersAudienceToCreate.push(TestDataGenerator.generateCategoryName('ABAC_Managers_Audience'));
      adminsAudienceToCreate.push(TestDataGenerator.generateCategoryName('ABAC_Admins_Audience'));

      targetAudienceUser[0] = TestDataGenerator.generateUserWithEmp({
        first_name: 'UserToBeAdded',
        last_name: `AsTargetAudience${Date.now()}`,
        username: 'UserToBeAdded' + ' ' + `AsTargetAudience${Date.now()}`,
        emp: `UTA00${Date.now()}`,
      });

      targetAudienceUser[1] = TestDataGenerator.generateUserWithEmp({
        first_name: 'UserToBeAdded',
        last_name: `AsTargetAudience${Date.now()}`,
        username: 'UserToBeAdded' + ' ' + `AsTargetAudience${Date.now()}`,
        emp: `UTA01${Date.now()}`,
      });

      managersAudienceUser[0] = TestDataGenerator.generateUserWithEmp({
        first_name: 'UserToBeAdded',
        last_name: `AsManagersAudience${Date.now()}`,
        username: 'UserToBeAdded' + ' ' + `AsManagersAudience${Date.now()}`,
        emp: `UMA00${Date.now()}`,
      });

      adminsAudienceUser[0] = TestDataGenerator.generateUserWithEmp({
        first_name: 'UserToBeAdded',
        last_name: `AsAdminsAudience${Date.now()}`,
        username: 'UserToBeAdded' + ' ' + `AsAdminsAudience${Date.now()}`,
        emp: `UAA00${Date.now()}`,
      });

      targetAudienceUserId[0] = await userManagementService.addUserIfNotAddedAlready(
        targetAudienceUser[0],
        Roles.END_USER
      );
      await userManagementService.waitForUserToBeAddedInIdentity(targetAudienceUser[0].emp);

      targetAudienceUserId[1] = await userManagementService.addUserIfNotAddedAlready(
        targetAudienceUser[1],
        Roles.END_USER
      );
      await userManagementService.waitForUserToBeAddedInIdentity(targetAudienceUser[1].emp);

      managersAudienceUserId[0] = await userManagementService.addUserIfNotAddedAlready(
        managersAudienceUser[0],
        Roles.END_USER
      );
      await userManagementService.waitForUserToBeAddedInIdentity(managersAudienceUser[0].emp);

      adminsAudienceUserId[0] = await userManagementService.addUserIfNotAddedAlready(
        adminsAudienceUser[0],
        Roles.END_USER
      );
      await userManagementService.waitForUserToBeAddedInIdentity(adminsAudienceUser[0].emp);

      categoryId.push(await identityManagementHelper.identityService.createCategory(categoryToCreate));

      createTargetAudienceParams[0] = {
        audienceName: targetAudienceToCreate[0],
        categoryId: categoryId[0],
        attribute: AUDIENCE_API_ATTRIBUTES.USER_ID,
        operator: AUDIENCE_API_OPERATORS.IS,
        value: targetAudienceUserId[0],
      };

      createTargetAudienceParams[1] = {
        audienceName: targetAudienceToCreate[1],
        categoryId: categoryId[0],
        attribute: AUDIENCE_API_ATTRIBUTES.USER_ID,
        operator: AUDIENCE_API_OPERATORS.IS,
        value: targetAudienceUserId[1],
      };

      createManagersAudienceParams[0] = {
        audienceName: managersAudienceToCreate[0],
        categoryId: categoryId[0],
        attribute: AUDIENCE_API_ATTRIBUTES.USER_ID,
        operator: AUDIENCE_API_OPERATORS.IS,
        value: managersAudienceUserId[0],
      };

      createAdminsAudienceParams[0] = {
        audienceName: adminsAudienceToCreate[0],
        categoryId: categoryId[0],
        attribute: AUDIENCE_API_ATTRIBUTES.USER_ID,
        operator: AUDIENCE_API_OPERATORS.IS,
        value: adminsAudienceUserId[0],
      };

      audienceId.push(await identityManagementHelper.identityService.createAudience(createTargetAudienceParams[0]));

      audienceId.push(await identityManagementHelper.identityService.createAudience(createTargetAudienceParams[1]));

      audienceId.push(await identityManagementHelper.identityService.createAudience(createManagersAudienceParams[0]));

      audienceId.push(await identityManagementHelper.identityService.createAudience(createAdminsAudienceParams[0]));
    });

    test.afterEach(async ({ appManagerApiFixture }) => {
      const { identityManagementHelper, userManagementService } = appManagerApiFixture;
      //delete the acg if it exists
      while (acgName.length > 0) {
        await identityManagementHelper.identityService.deleteACGByName(acgName.pop() as string);
      }
      //delete the audiences if it exists
      while (audienceId.length > 0) {
        await identityManagementHelper.identityService.deleteAudience(audienceId.pop() as string);
      }
      //delete the category if it exists
      while (categoryId.length > 0) {
        await identityManagementHelper.identityService.deleteCategoryById(categoryId.pop() as string);

        //deactivating the users
        await userManagementService.updateUserStatus(targetAudienceUserId[0], 'Inactive');
        await userManagementService.updateUserStatus(targetAudienceUserId[1], 'Inactive');
        await userManagementService.updateUserStatus(managersAudienceUserId[0], 'Inactive');
        await userManagementService.updateUserStatus(adminsAudienceUserId[0], 'Inactive');
      }
    });

    /**
     * We will not be setting up the acg name instead
     * based on selected audience , the name will be generated automatically
     * and we will be using that name to delete the acg
     */
    test(
      'verify that single ACG can be created and deleted without any issue',
      {
        tag: [TestPriority.P0, `@ABAC`, `@acg`, '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-29969', 'PS-29972', 'PS-32216', `PS-30522`],
        });
        const { identityManagementHelper, userManagementService } = appManagerFixture;
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerFixture.page);
        // Test Scenario(s)
        await accessControlGroupsPage.loadPage();
        const acgCreationParams: ACGCreationParams = {
          targetAudience: [targetAudienceToCreate[0]],
          managerUser: [],
          managerAudience: [managersAudienceToCreate[0]],
          adminUser: [],
          adminAudience: [adminsAudienceToCreate[0]],
          acgStatus: ACG_STATUS.ACTIVE,
          acgFeature: ACGFeature.ALERTS,
        };
        //after these actions are done, we will wait for the api call to be completed
        acgName.push(await accessControlGroupsPage.createACGWithAllParams(acgCreationParams));
        await accessControlGroupsPage.verifyACGStatus(acgName[0], ACG_STATUS.ACTIVE);
        await identityManagementHelper.identityService.waitUntilACGIsSynced(acgName[0]);
        await accessControlGroupsPage.verifyToastMessageIsVisibleWithText(
          'Access control group was successfully updated'
        );
        await accessControlGroupsPage.dismissTheToastMessage();
        await accessControlGroupsPage.searchForACG(acgName[0]);

        await accessControlGroupsPage.clickOnACGNameButton(acgName[0]);
        await accessControlGroupsPage.viewACGModal.verifyTitleOfTheModal(acgName[0]);
        await accessControlGroupsPage.viewACGModal.clickCloseButton();

        await accessControlGroupsPage.clickOnTargetAudienceCountButton(acgName[0]);
        await accessControlGroupsPage.viewACGModal.verifyTitleOfTheModal('Target audience');
        await accessControlGroupsPage.viewACGModal.clickCloseButton();

        await accessControlGroupsPage.clickOnManagersCountButton(acgName[0]);
        await accessControlGroupsPage.viewACGModal.verifyTitleOfTheModal('Managers');
        await accessControlGroupsPage.viewACGModal.clickCloseButton();

        await accessControlGroupsPage.clickOnAdminsCountButton(acgName.pop() as string);
        await accessControlGroupsPage.viewACGModal.verifyTitleOfTheModal('Admins');
        await accessControlGroupsPage.viewACGModal.clickCloseButton();

        await accessControlGroupsPage.deleteFirstACG();
        await accessControlGroupsPage.verifyToastMessageIsVisibleWithText(
          'Access control group was successfully deleted'
        );
        await accessControlGroupsPage.dismissTheToastMessage();
      }
    );

    test(
      'verify that status of the ACG should be displayed as Active or Inactive immediately after creation',
      {
        tag: [TestPriority.P0, `@ABAC`, `@acg`],
      },
      async ({ appManagerFixture }) => {
        const { identityManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['PS-32216', 'PS-30117', `PS-30522`],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerFixture.page);
        // Test Scenario - Verify that status of the ACG should be displayed as Inactive immediately after creation
        await accessControlGroupsPage.loadPage();
        const acgCreationParams: ACGCreationAPI = {
          acgName: ACG_FEATURE_FOR_API.ALERTS + ' | ' + targetAudienceToCreate[0],
          feature: ACG_FEATURE_FOR_API.ALERTS,
          targetAudience: [audienceId[0]],
          managerAudience: [audienceId[2]],
          adminAudience: [audienceId[3]],
          acgStatus: ACG_STATUS.INACTIVE,
        };
        const response: ACGCreationResponse =
          await identityManagementHelper.identityService.createACG(acgCreationParams);
        const acgId = response.result.listOfItems[0].data.id;
        acgName.push(acgCreationParams.acgName);
        await accessControlGroupsPage.searchForACG(acgName[0]);
        await accessControlGroupsPage.verifyACGStatus(acgName[0], ACG_STATUS.INACTIVE);
        await identityManagementHelper.identityService.waitUntilACGIsSynced(acgName[0]);

        await accessControlGroupsPage.clickOnACGNameButton(acgName[0]);
        await accessControlGroupsPage.viewACGModal.verifyTitleOfTheModal(acgName[0]);
        await accessControlGroupsPage.viewACGModal.clickCloseButton();

        await accessControlGroupsPage.clickOnTargetAudienceCountButton(acgName[0]);
        await accessControlGroupsPage.viewACGModal.verifyTitleOfTheModal('Target audience');
        await accessControlGroupsPage.viewACGModal.clickCloseButton();

        await accessControlGroupsPage.clickOnManagersCountButton(acgName[0]);
        await accessControlGroupsPage.viewACGModal.verifyTitleOfTheModal('Managers');
        await accessControlGroupsPage.viewACGModal.clickCloseButton();

        await accessControlGroupsPage.clickOnAdminsCountButton(acgName[0]);
        await accessControlGroupsPage.viewACGModal.verifyTitleOfTheModal('Admins');
        await accessControlGroupsPage.viewACGModal.clickCloseButton();

        await accessControlGroupsPage.searchForACG(acgName[0]);
        await accessControlGroupsPage.editACG(acgName.pop() as string);
        await accessControlGroupsPage.confirmEditACGModal.clickContinueButton();
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsDisabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_FEATURE
        );
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsEnabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_TARGET_AUDIENCE
        );
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsEnabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_MANAGER
        );
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsEnabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_ADMIN
        );
        await accessControlGroupsPage.editACGModal.verifyTooltipForButton(
          ACG_EDIT_ASSETS.FEATURE,
          ACG_TOOLTIPS.FEATURE_CANNOT_BE_EDITED
        );
        await accessControlGroupsPage.editACGModal.clickCloseButton();
        await identityManagementHelper.identityService.deleteACGById(acgId);
      }
    );

    test(
      'verify that user manager should have access for ACG creation',
      {
        tag: [TestPriority.P1, `@ABAC`, `@acg`],
      },
      async ({ userManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-33248', 'PS-33250'],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(userManagerFixture.page);
        // Test Scenario
        await accessControlGroupsPage.loadPage();
        //after these actions are done, we will wait for the api call to be completed
        acgName.push(await accessControlGroupsPage.createACGWithTargetAudienceOnly(targetAudienceToCreate[0]));
        await appManagerApiFixture.identityManagementHelper.identityService.waitUntilACGIsSynced(acgName[0]);
        await accessControlGroupsPage.verifyToastMessageIsVisibleWithText(
          'Access control group was successfully updated'
        );
        await accessControlGroupsPage.dismissTheToastMessage();
        await accessControlGroupsPage.deleteACG(acgName.pop() as string);
      }
    );

    test(
      `verify that Roles option should not be displayed under Manage section in menu option`,
      {
        tag: [TestPriority.P1, `@ABAC`, `@acg`, '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-31188'],
        });
        // Test Scenario
        await appManagerFixture.navigationHelper.openApplicationSettings();
        await appManagerFixture.navigationHelper.verifyRolesButtonVisibility(false);
      }
    );

    test(
      `verify that redirecting to "manage/roles" url should display page not found screen`,
      {
        tag: [TestPriority.P1, `@ABAC`, `@acg`, '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-31189'],
        });
        // Test Scenario
        await appManagerFixture.page.goto('manage/roles');
        await appManagerFixture.homePage.verifyPageNotFoundVisibility();
      }
    );

    test(
      'verify that the feature list displayed under Feature owners tab should be unique',
      {
        tag: [TestPriority.P0, `@ABAC`],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify that the feature list displayed under Feature owners tab should be unique',
          zephyrTestId: 'PS-32997',
        });
        const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);
        // Navigate to Feature owners page
        await featureOwnersPage.loadPage();
        // Click "Show more" button to load additional features for uniqueness testing
        await featureOwnersPage.clickShowMore();
        // Get all feature names displayed on the page
        const allFeatureNames: string[] = await featureOwnersPage.getAllFeatureNames();
        // Verify that all features are unique
        const uniqueFeatures: string[] = [...new Set(allFeatureNames)];
        // Check for duplicates by comparing string array lengths
        expect(
          uniqueFeatures.length,
          `Expected ${uniqueFeatures.length} unique features but found ${allFeatureNames.length} total features. Duplicate features detected.`
        ).toBe(allFeatureNames.length);
      }
    );

    test(
      'verify search functionality with invalid string shows no results found message',
      {
        tag: [TestPriority.P0, `@ABAC`],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify search functionality with invalid string shows no results found message',
          zephyrTestId: 'PS-32965',
        });
        const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);
        // Navigate to Feature owners page
        await featureOwnersPage.loadPage();
        // Test search functionality with invalid string
        await featureOwnersPage.searchForFeature('sdbkfjskdfn', false);
        await featureOwnersPage.verifyNoResultsFoundMessages();
      }
    );

    test(
      'verify that a warning popup is displayed before edit Access control group popup',
      {
        tag: [TestPriority.P1, `@ABAC`],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify that a warning popup is displayed before edit Access control group popup',
          zephyrTestId: 'PS-31321',
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerFixture.page);
        // Navigate to Access Control Groups page
        await accessControlGroupsPage.loadPage();
        // Click on menu for any ACG
        await accessControlGroupsPage.clickOnMenuOptionForACG();
        // Click on Edit option
        await accessControlGroupsPage.clickOnEditOption();
        // Verify all elements in the edit warning popup
        await accessControlGroupsPage.verifyEditWarningPopup();
      }
    );

    test(
      'verify that user should be able to change managers from managers screen while editing them during ACG creation flow',
      {
        tag: [TestPriority.P1, `@ABAC`],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify that user should be able to change managers from managers screen while editing them during ACG creation flow',
          zephyrTestId: 'PS-30956',
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerFixture.page);
        await accessControlGroupsPage.loadPage();
        await accessControlGroupsPage.clickOnCreateButtonToInitiateControlGroupCreationFlowFor('Single');
        await accessControlGroupsPage.selectSingleFeatureToAddToControlGroupForSingleACG(ACGFeature.ALERTS);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.NEXT);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.BROWSE);
        await accessControlGroupsPage.searchForAudiencesOnAudiencePickerPopup(targetAudienceToCreate[0]);
        await accessControlGroupsPage.clickOnAudience(targetAudienceToCreate[0]);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.DONE);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.NEXT);

        // Select Manager and Admin users for the ACG
        await accessControlGroupsPage.browseSelectUserAndProceed('Admin', 'Manager');
        await accessControlGroupsPage.browseSelectUserAndProceed('Admin', 'Admin');

        // Edit Manager flow - test the new functionality
        await accessControlGroupsPage.clickOnEditManagerButton();
        await accessControlGroupsPage.clickOnAddUsersButton();
        await accessControlGroupsPage.searchAndSelectUserWithEnter('Admin');
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.DONE);
        await accessControlGroupsPage.clickOnUpdateButton();

        // Click edit manager button again to verify the added users
        await accessControlGroupsPage.clickOnEditManagerButton();

        // Verify that admin users are displayed in the manager list (dynamic verification)
        await accessControlGroupsPage.verifyAdminUsersInManagerList();
      }
    );

    test(
      'verify that duplicate acg error is displayed on attempting to create ACG with same features and target audiences',
      {
        tag: [TestPriority.P0, `@ABAC`, `@acg`],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-32210'],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerFixture.page);
        // Pre-requisite
        // Create an ACG with target audiecne only
        const acgCreationParams: ACGCreationAPI = {
          acgName: ACG_FEATURE_FOR_API.ALERTS + ' | ' + targetAudienceToCreate[0],
          feature: ACG_FEATURE_FOR_API.ALERTS,
          targetAudience: [audienceId[0]],
        };
        acgName.push(acgCreationParams.acgName);
        const respsone: ACGCreationResponse =
          await appManagerFixture.identityManagementHelper.identityService.createACG(acgCreationParams);
        const acgId = respsone.result.listOfItems[0].data.id;
        await appManagerFixture.identityManagementHelper.identityService.waitUntilACGIsSynced(acgName[0]);
        await accessControlGroupsPage.loadPage();
        // Test Scenario
        await accessControlGroupsPage.clickOnCreateButtonToInitiateControlGroupCreationFlowFor('Single');
        await accessControlGroupsPage.selectSingleFeatureToAddToControlGroupForSingleACG(ACGFeature.ALERTS);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.NEXT);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.BROWSE);
        await accessControlGroupsPage.searchForAudiencesOnAudiencePickerPopup(targetAudienceToCreate[0]);
        await accessControlGroupsPage.clickOnAudience(targetAudienceToCreate[0]);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.DONE);
        await accessControlGroupsPage.createACGModal.verifyDuplicateTargetGroupsErrorMessage();
        await accessControlGroupsPage.createACGModal.clickCloseButton();
        // Clean up: Delete the above created ACG
        await appManagerFixture.identityManagementHelper.identityService.deleteACGById(acgId);
        acgName.pop();
      }
    );

    test(
      'verify that duplicate acg error is displayed on editing ACG to match anothers features and target audiences',
      {
        tag: [TestPriority.P0, `@ABAC`, `@acg`],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-32212', 'PS-30110', 'PS-30752'],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerFixture.page);
        await accessControlGroupsPage.loadPage();
        // Prerequisite
        // Create an ACG with target audience only
        acgName.push(await accessControlGroupsPage.createACGWithTargetAudienceOnly(targetAudienceToCreate[0]));
        await appManagerFixture.identityManagementHelper.identityService.waitUntilACGIsSynced(acgName[0]);
        await accessControlGroupsPage.verifyToastMessageIsVisibleWithText(
          'Access control group was successfully updated'
        );
        await accessControlGroupsPage.dismissTheToastMessage({
          toastText: 'Access control group was successfully updated',
        });
        acgName.push(await accessControlGroupsPage.createACGWithTargetAudienceOnly(targetAudienceToCreate[1]));
        await appManagerFixture.identityManagementHelper.identityService.waitUntilACGIsSynced(acgName[1]);
        await accessControlGroupsPage.verifyToastMessageIsVisibleWithText(
          'Access control group was successfully updated'
        );
        await accessControlGroupsPage.dismissTheToastMessage({
          toastText: 'Access control group was successfully updated',
        });
        // Test Scenario
        await accessControlGroupsPage.searchForACG(acgName[1]);
        await accessControlGroupsPage.editACG(acgName[1]);
        await accessControlGroupsPage.confirmEditACGModal.clickContinueButton();
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsDisabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_FEATURE
        );
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsEnabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_TARGET_AUDIENCE
        );
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsEnabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_MANAGER
        );
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsEnabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_ADMIN
        );
        await accessControlGroupsPage.editACGModal.verifyTooltipForButton(
          ACG_EDIT_ASSETS.FEATURE,
          ACG_TOOLTIPS.FEATURE_CANNOT_BE_EDITED
        );
        await accessControlGroupsPage.editACGModal.clickOnEditButtonOnSummaryScreen(ACG_EDIT_ASSETS.TARGET_AUDIENCE);
        await accessControlGroupsPage.editACGModal.clickOnRemoveButtonForAudience(targetAudienceToCreate[1]);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.BROWSE);
        await accessControlGroupsPage.searchForAudiencesOnAudiencePickerPopup(targetAudienceToCreate[0]);
        await accessControlGroupsPage.clickOnAudience(targetAudienceToCreate[0]);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.DONE);
        await accessControlGroupsPage.editACGModal.verifyDuplicateTargetGroupsErrorMessage();
        await accessControlGroupsPage.editACGModal.clickCloseButton();
        // Clean up: Delete the above created ACG
        await accessControlGroupsPage.deleteACG(acgName.pop() as string);
        await accessControlGroupsPage.deleteACG(acgName.pop() as string);
      }
    );

    test(
      `verify that Name column is displayed and is sortable at Access control groups page`,
      {
        tag: [TestPriority.P1, `@ABAC`, `@acg`],
      },
      async ({ appManagerFixture }) => {
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
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerFixture.page);
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
      `verify the sorting functionality of Name column in access control groups page`,
      {
        tag: [TestPriority.P1, `@ABAC`, `@acg`],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-35732', 'PS-35733', 'PS-35734', 'PS-35735', 'PS-35736'],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerFixture.page);
        // Test Scenario
        await accessControlGroupsPage.loadPage();
        await accessControlGroupsPage.verifyTheSortingFunctionalityOfColumn(ACG_COLUMNS.NAME);
        await accessControlGroupsPage.verifyTheSortingFunctionalityOfColumn(ACG_COLUMNS.FEATURE);
        await accessControlGroupsPage.verifyTheSortingFunctionalityOfColumn(ACG_COLUMNS.GROUP_TYPE);
        await accessControlGroupsPage.verifyTheSortingFunctionalityOfColumn(ACG_COLUMNS.STATUS);
        await accessControlGroupsPage.verifyTheSortingFunctionalityOfColumn(ACG_COLUMNS.MODIFIED);
      }
    );

    test(
      `verify the state of different edit buttons when Feature Owner is editing System RBAC ACG`,
      {
        tag: [TestPriority.P1, `@ABAC`, `@acg`],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-31255', `PS-31223`],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerFixture.page);
        // Test Scenario
        await accessControlGroupsPage.loadPage();
        await accessControlGroupsPage.searchForACG('Users | All org | System ACG');
        await accessControlGroupsPage.editACG('Users | All org | System ACG');
        await accessControlGroupsPage.confirmEditACGModal.clickContinueButton();
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsDisabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_FEATURE
        );
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsDisabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_TARGET_AUDIENCE
        );
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsEnabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_MANAGER
        );
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsDisabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_ADMIN
        );
        await accessControlGroupsPage.editACGModal.verifyDefaultControlGroupOnlyManagersAndAdminsCanBeModifiedErrorMessage(
          ACG_ACCESS_CONTROL_TYPE.RBAC
        );
        await accessControlGroupsPage.editACGModal.verifyDefaultControlGroupOnlyManagersAndAdminsCanBeModifiedTooltip(
          ACG_ACCESS_CONTROL_TYPE.RBAC
        );
      }
    );

    test(
      'verify that the user should be redirected to the feature selection screen on clicking edit icon for the same at summary screen during ACG creation',
      {
        tag: [TestPriority.P0, `@ABAC`, `@acg`],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-30969', 'PS-30970', 'PS-30960', 'PS-30962'],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerFixture.page);
        await accessControlGroupsPage.loadPage();
        // Prerequisite
        // Create an ACG with target audiecne only
        await accessControlGroupsPage.clickOnCreateButtonToInitiateControlGroupCreationFlowFor('Single');
        await accessControlGroupsPage.selectSingleFeatureToAddToControlGroupForSingleACG(ACGFeature.ALERTS);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.NEXT);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.BROWSE);
        await accessControlGroupsPage.searchForAudiencesOnAudiencePickerPopup(targetAudienceToCreate[0]);
        await accessControlGroupsPage.clickOnAudience(targetAudienceToCreate[0]);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.DONE);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.NEXT);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.SKIP);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.SKIP);
        const featureName: string = await accessControlGroupsPage.createACGModal.getFeatureNameFromSummaryScreen();
        const targetAudienceCount: number =
          await accessControlGroupsPage.createACGModal.getTargetAudienceCountFromSummaryScreen();
        await accessControlGroupsPage.createACGModal.clickOnEditButtonOnSummaryScreen(ACG_EDIT_ASSETS.FEATURE);
        await accessControlGroupsPage.createACGModal.verifyTitleOfTheModal('Feature');
        await accessControlGroupsPage.createACGModal.verifyFeatureIsSelectedAtFeatureSelectionScreen(featureName);
        await accessControlGroupsPage.createACGModal.clickOnBackButton();
        await accessControlGroupsPage.createACGModal.clickOnEditButtonOnSummaryScreen(ACG_EDIT_ASSETS.TARGET_AUDIENCE);
        await accessControlGroupsPage.createACGModal.verifyTitleOfTheModal('Target audience');
        await accessControlGroupsPage.createACGModal.verifyListCount('Target audience', targetAudienceCount);
        await accessControlGroupsPage.editACGModal.clickOnRemoveButtonForAudience(targetAudienceToCreate[0]);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.BROWSE);
        await accessControlGroupsPage.searchForAudiencesOnAudiencePickerPopup(targetAudienceToCreate[0]);
        await accessControlGroupsPage.clickOnAudience(targetAudienceToCreate[0]);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.DONE);
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.UPDATE);
        acgName.push(await accessControlGroupsPage.getACGName());
        await accessControlGroupsPage.clickOnButtonWithName(POPUP_BUTTONS.SAVE_AND_ACTIVATE);
        await accessControlGroupsPage.verifyToastMessageIsVisibleWithText(
          'Creating access control groups and audience relationships…'
        );
        await accessControlGroupsPage.dismissTheToastMessage();
        await accessControlGroupsPage.verifyToastMessageIsVisibleWithText(
          'Access control group was successfully updated'
        );
        await accessControlGroupsPage.dismissTheToastMessage();
        // Clean up: Delete the above created ACG
        await accessControlGroupsPage.deleteACG(acgName.pop() as string);
      }
    );

    test(
      `verify the state of different edit buttons when Admin is editing an Active Custom ACG`,
      {
        tag: [TestPriority.P1, `@ABAC`, `@acg`, `@this-one`],
      },
      async ({ appManagerFixture, browser }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-30119', `PS-30120`],
        });

        const activeACGCreationParams: ACGCreationParams = {
          targetAudience: [targetAudienceToCreate[0]],
          managerUser: [],
          managerAudience: [],
          adminUser: [adminsAudienceUser[0].username],
          adminAudience: [],
          acgStatus: ACG_STATUS.ACTIVE,
          acgFeature: ACGFeature.ALERTS,
        };
        const inactiveACGCreationParams: ACGCreationParams = {
          targetAudience: [targetAudienceToCreate[1]],
          managerUser: [],
          managerAudience: [],
          adminUser: [adminsAudienceUser[0].username],
          adminAudience: [],
          acgStatus: ACG_STATUS.INACTIVE,
          acgFeature: ACGFeature.ALERTS,
        };
        const accessControlGroupsPageAM: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerFixture.page);
        await accessControlGroupsPageAM.loadPage();
        acgName.push(await accessControlGroupsPageAM.createACGWithAllParams(activeACGCreationParams));
        acgName.push(await accessControlGroupsPageAM.createACGWithAllParams(inactiveACGCreationParams));
        await appManagerFixture.userManagementService.registerUser(adminsAudienceUser[0].emp);
        const newUserContext = await browser.newContext();
        const page = await newUserContext.newPage();
        await LoginHelper.loginWithPassword(page, {
          email: adminsAudienceUser[0].emp,
          password: 'Simp@1234',
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(page);
        await accessControlGroupsPage.loadPage();
        // Test Scenario
        await accessControlGroupsPage.searchForACG(acgName[0]);
        await accessControlGroupsPage.editACG(acgName[0]);
        await accessControlGroupsPage.confirmEditACGModal.clickContinueButton();
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsDisabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_FEATURE
        );
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsEnabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_TARGET_AUDIENCE
        );
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsEnabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_MANAGER
        );
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsDisabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_ADMIN
        );
        await accessControlGroupsPage.editACGModal.clickCloseButton();

        await accessControlGroupsPage.searchForACG(acgName[1]);
        await accessControlGroupsPage.editACG(acgName[1]);
        await accessControlGroupsPage.confirmEditACGModal.clickContinueButton();
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsDisabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_FEATURE
        );
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsEnabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_TARGET_AUDIENCE
        );
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsEnabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_MANAGER
        );
        await accessControlGroupsPage.editACGModal.verifySummaryScreenAssetButtonIsDisabled(
          ACG_EDIT_ASSETS_SUMMARY_SCREEN.EDIT_ADMIN
        );
        await accessControlGroupsPage.editACGModal.clickCloseButton();
        while (acgName.length > 0) {
          await accessControlGroupsPageAM.deleteACG(acgName.pop() as string);
        }
      }
    );
  }
);
