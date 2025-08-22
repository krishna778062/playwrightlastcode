import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { AccessControlGroupsPage, ACGFeature } from '@platforms/pages/abacPage/acgPage/accessControlGroupsPage';

import { FeatureOwnersPage } from '../../../pages/abacPage/featureOwnersPage/featureOwnersPage';
import { ManageUsersPage, MUOptions } from '../../../pages/managerUsersPage/manageUsersPage';
import { IdentityUserSearchResponse } from '@core/types/user.type';

import { Roles, RolesId } from '@/src/core/constants/roles';
import { TestSuite } from '@/src/core/constants/testSuite';
import { User } from '@/src/core/types/user.type/User';

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
    const features: string[] = [
      // 'Add sites',
      // 'Add topics',
      // 'Alerts',
      // 'Analytics',
      // 'Application settings',
      // 'Audiences',
      // 'Branding',
      'Campaigns',
      'Content moderation',
      // 'Content onboarding',
      // 'Enterprise search',
      // 'Forms',
      // 'Home dashboard',
      // 'Manage sites',
      // 'Manage topics',
      // 'Newsletters',
      // 'Promotions',
      // 'Recognition',
      // 'Sentiment check',
      // 'Social campaigns',
      // 'Surveys',
      // 'Users',
    ];

    test.beforeEach(async ({ appManagerApiClient }) => {
      categoryToCreate = `ABAC_Target_Category`;
      audienceToCreate = `ABAC_Target_Audience_${Date.now()}`;
      const user1: User = {
        first_name: 'Aaman Temp',
        last_name: 'Standard User',
        emp: 'TSU001',
      };

      const user2: User = {
        first_name: 'Aaman Temp',
        last_name: 'App Manager',
        emp: 'TAM001',
      };
      await appManagerApiClient.getIdentityService().createCategory(categoryToCreate);
      categoryId = await appManagerApiClient.getIdentityService().getCategoryId(categoryToCreate, 100);
      audienceId = await appManagerApiClient
        .getIdentityService()
        .createAudience(audienceToCreate, categoryId, 'first_name', 'CONTAINS', 'something');
      await appManagerApiClient.getUserManagementService().addUserIfNotAddedAlready(user1, Roles.END_USER);
      await appManagerApiClient.getUserManagementService().addUserIfNotAddedAlready(user2, Roles.APPLICATION_MANAGER);
      await appManagerApiClient
        .getUserManagementService()
        .updatePrimaryRole(user2.emp, RolesId.APPLICATION_MANAGER, { abac: true });
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
        console.log(`ACG name is ${acgName}`);
        await accessControlGroupsPage.clickOnButtonWithName('Save and activate');
        await appManagerApiClient.getIdentityService().waitUntilACGIsSynced(acgName);
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.searchForACG(acgName);
        await accessControlGroupsPage.deleteFirstACG();
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully deleted');
        acgName = undefined; //reset the acg name back to undefined to avoid any future cleanup issues
      }
    );

    test(
      'Verify that user manager should have access for ACG creation',
      {
        tag: [TestPriority.P1, `@ABAC`],
      },
      async ({ userManagerPage, appManagerApiClient }) => {
        tagTest(test.info(), {
          zephyrTestId: ['PS-33248', 'PS-33250'],
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(userManagerPage);
        // Test Scenario
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
        console.log(`ACG name is ${acgName}`);
        await accessControlGroupsPage.clickOnButtonWithName('Save and activate');
        await appManagerApiClient.getIdentityService().waitUntilACGIsSynced(acgName);
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully updated');
        await accessControlGroupsPage.searchForACG(acgName);
        await accessControlGroupsPage.deleteFirstACG();
        await accessControlGroupsPage.verifyToastMessage('Access control group was successfully deleted');
        acgName = undefined; //reset the acg name back to undefined to avoid any future cleanup issues
      }
    );

    for (const feature of features) {
      test(
        `Verify that user manager should not be able to remove Feature owner access of any app manager from ${feature} feature under Feature owners tab`,
        {
          tag: [TestPriority.P1, `@ABAC`],
        },
        async ({ userManagerPage, userManagerApiClient }) => {
          let usersWithAppManagerTag: string[] = [];
          tagTest(test.info(), {
            zephyrTestId: 'PS-33254',
          });
          const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(userManagerPage);

          await featureOwnersPage.loadPage();
          await featureOwnersPage.searchForFeature(feature);
          await featureOwnersPage.clickOnButtonForFeature(feature, 'Edit');

          // Get the list of all users with App manager tag
          usersWithAppManagerTag = await featureOwnersPage.getUsersWithOutCrossButton();

          // Iterate the above list and check if the users are app manager through api
          while (usersWithAppManagerTag.length > 0) {
            const userWithAppManagerTag: string = usersWithAppManagerTag.pop();
            const userDetailsJson: IdentityUserSearchResponse = await userManagerApiClient
              .getUserManagementService()
              .getUserDetailsFromUserSearchList(userWithAppManagerTag);
            expect(userDetailsJson.result.listOfItems[0].roles).toEqual(Roles.APPLICATION_MANAGER);
          }
        }
      );

      test(
        `Verify that user manager should have access for editing ${feature} feature under feature owners tab`,
        {
          tag: [TestPriority.P1, `@ABAC`],
        },
        async ({ userManagerPage }) => {
          tagTest(test.info(), {
            zephyrTestId: ['PS-33252', 'PS-33251'],
          });
          const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(userManagerPage);

          featureOwnersPage.loadPage();

          await featureOwnersPage.searchForFeature(feature);
          await featureOwnersPage.clickOnButtonForFeature(feature, 'Edit');
          await featureOwnersPage.addUserAsFeatureOnwer(['Aaman Temp Standard User']);
          await featureOwnersPage.verifyToastMessage('Feature owners updated successfully');
          await featureOwnersPage.clickOnButtonForFeature(feature, 'Edit');
          await featureOwnersPage.removeUserAsFeatureOnwer(['Aaman Temp Standard User']);
          await featureOwnersPage.verifyToastMessage('Feature owners updated successfully');
        }
      );

      test.only(
        `Verify that user manager should be able to remove Feature onwer access of any app manager from manage users page for ${feature} feature`,
        {
          tag: [TestPriority.P1, `@ABAC`],
        },
        async ({ userManagerPage, appManagerApiClient }) => {
          tagTest(test.info(), {
            zephyrTestId: ['PS-33255'],
          });
          const manageUsersPage: ManageUsersPage = new ManageUsersPage(userManagerPage);
          const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(userManagerPage);
          // Test Scenario
          await featureOwnersPage.loadPage();
          await featureOwnersPage.searchForFeature(feature);
          await featureOwnersPage.clickOnButtonForFeature(feature, 'Edit');
          // Check that user is displayed with App manager tag
          expect(await featureOwnersPage.verifyFODisplayedAsAppManager(['Aaman Temp App Manager'])).toBeTruthy();
          // Check that user is displayed in the feature onwer list
          expect(await featureOwnersPage.verifyUserAsFeatureOnwerForFeature(['Aaman Temp App Manager'])).toBeTruthy();
          // Updatting the primary role of the user to standard user
          await appManagerApiClient
            .getUserManagementService()
            .updatePrimaryRole('TAM001', RolesId.END_USER, { abac: true });
          // Reloading the page to reflect the changes
          await manageUsersPage.reloadPage();
          await featureOwnersPage.clickOnButtonForFeature(feature, 'Edit');
          // Check that user is not displayed in the feature onwer list
          expect(await featureOwnersPage.verifyUserAsFeatureOnwerForFeature(['Aaman Temp App Manager'])).toBeFalsy();
          // Cleanup - Updating the primary role of the user back to app manager
          await appManagerApiClient
            .getUserManagementService()
            .updatePrimaryRole('TAM001', RolesId.APPLICATION_MANAGER, { abac: true });
        }
      );
    }
  }
);
