import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { IdentityUserSearchResponse, User } from '@core/types/user.type';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { FeatureOwnersPage } from '@platforms/pages/abacPage/featureOwnersPage/featureOwnersPage';
import { ManageUsersPage } from '@platforms/pages/managerUsersPage/manageUsersPage';
import { Statuses } from '@/src/core/constants/status';
import { Roles, RolesId } from '@/src/core/constants/roles';
import { TestSuite } from '@/src/core/constants/testSuite';
import { FeatureMenuOptions } from '@/src/modules/platforms/constants/featureMenuOptions';

test.describe(
  'ACG Testcases',
  {
    tag: [TestSuite.ABAC],
  },
  () => {
    let loginIdentifier1: string;
    let loginIdentifier2: string;
    let loginIdentifier3: string;
    const features: string[] = ['Application settings', 'Audiences', 'Branding', 'Users'];
    let user1: User;
    let user2: User;
    let user3: User;

    test.beforeEach(async ({ appManagerApiClient }) => {
      user1 = {
        first_name: 'Aaman Temp',
        last_name: `Standard User${Date.now()}`,
        username: 'Aaman Temp' + ' ' + `Standard User${Date.now()}`,
        emp: `TSU00${Date.now()}`,
      };

      user2 = {
        first_name: 'Aaman Temp',
        last_name: `App Manager First User${Date.now()}`,
        username: 'Aaman Temp' + ' ' + `App Manager First User${Date.now()}`,
        emp: `TAM00${Date.now()}`,
      };

      user3 = {
        first_name: 'Aaman Temp',
        last_name: `App Manager Second User${Date.now()}`,
        username: 'Aaman Temp' + ' ' + `App Manager Second User${Date.now()}`,
        emp: `TAM01${Date.now()}`,
      };

      loginIdentifier1 = user1.emp;
      loginIdentifier2 = user2.emp;
      loginIdentifier3 = user3.emp;
      await appManagerApiClient.getUserManagementService().addUserIfNotAddedAlready(user1, Roles.END_USER);
      await appManagerApiClient.getUserManagementService().waitForUserToBeAddedInIdentity(loginIdentifier1);
      await appManagerApiClient.getUserManagementService().addUserIfNotAddedAlready(user2, Roles.APPLICATION_MANAGER);
      await appManagerApiClient.getUserManagementService().waitForUserToBeAddedInIdentity(loginIdentifier2);
      await appManagerApiClient.getUserManagementService().addUserIfNotAddedAlready(user3, Roles.APPLICATION_MANAGER);
      await appManagerApiClient.getUserManagementService().waitForUserToBeAddedInIdentity(loginIdentifier3);
    });

    test.afterEach(async ({ appManagerApiClient }) => {
      //deactivate user with the given login Identifiers if exists
      console.log(`loginIdentifier1: ${loginIdentifier1}`);
      if (loginIdentifier1 != undefined) {
        // Cleanup
        const userId = await appManagerApiClient.getUserManagementService().getUserId(loginIdentifier1);
        await appManagerApiClient.getUserManagementService().updateUserStatus(userId, Statuses.INACTIVE);
      }

      console.log(`loginIdentifier2: ${loginIdentifier2}`);
      if (loginIdentifier2 != undefined) {
        // Cleanup
        const userId = await appManagerApiClient.getUserManagementService().getUserId(loginIdentifier2);
        await appManagerApiClient.getUserManagementService().updateUserStatus(userId, Statuses.INACTIVE);
      }

      console.log(`loginIdentifier3: ${loginIdentifier3}`);
      if (loginIdentifier3 != undefined) {
        // Cleanup
        const userId = await appManagerApiClient.getUserManagementService().getUserId(loginIdentifier3);
        await appManagerApiClient.getUserManagementService().updateUserStatus(userId, Statuses.INACTIVE);
      }
    });

    // To run the followwing TCs with different features, we will be using a for loop
    // and we will be passing the feature name as a parameter to the test case
    for (const feature of features) {
      test(
        `Verify that user manager should not be able to remove Feature owner access of any app manager from ${feature} feature under Feature owners tab`,
        {
          tag: [TestPriority.P1, `@ABAC`, `@feature-owners`],
        },
        async ({ userManagerPage, userManagerApiClient }) => {
          let usersWithAppManagerTag: string[] = [];
          tagTest(test.info(), {
            zephyrTestId: 'PS-33254',
          });
          const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(userManagerPage);

          await featureOwnersPage.loadPage();
          await featureOwnersPage.searchForFeature(feature);
          await featureOwnersPage.clickOnButtonForFeature(feature, FeatureMenuOptions.EDIT);

          // Get the list of all users with App manager tag
          usersWithAppManagerTag = await featureOwnersPage.getUsersWithAppManagerTag();

          // Iterate the above list and check if the users are app manager through api
          while (usersWithAppManagerTag.length > 0) {
            const userWithAppManagerTag: string = usersWithAppManagerTag.pop() as string;
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
          tag: [TestPriority.P1, `@ABAC`, `@feature-owners`],
        },
        async ({ userManagerPage }) => {
          tagTest(test.info(), {
            zephyrTestId: ['PS-33252', 'PS-33251'],
          });
          const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(userManagerPage);

          await featureOwnersPage.loadPage();

          await featureOwnersPage.searchForFeature(feature);
          await featureOwnersPage.clickOnButtonForFeature(feature, FeatureMenuOptions.EDIT);
          await featureOwnersPage.addUserAsFeatureOnwer([user1.username]);
          await featureOwnersPage.verifyToastMessage('Feature owners updated successfully');
          await featureOwnersPage.dismissTheToastMessage();
          await featureOwnersPage.clickOnButtonForFeature(feature, FeatureMenuOptions.EDIT);
          await featureOwnersPage.removeUserFromFeatureOwnersList(user1.username);
          await featureOwnersPage.verifyToastMessage('Feature owners updated successfully');
          await featureOwnersPage.dismissTheToastMessage();
        }
      );

      test(
        `Verify that user manager should be able to remove Feature onwer access of any app manager from manage users page for ${feature} feature`,
        {
          tag: [TestPriority.P1, `@ABAC`, `@feature-owners`],
        },
        async ({ userManagerPage, appManagerApiClient }) => {
          tagTest(test.info(), {
            zephyrTestId: ['PS-33255', 'PS-33090', 'PS-33089'],
          });
          const manageUsersPage: ManageUsersPage = new ManageUsersPage(userManagerPage);
          const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(userManagerPage);
          // Test Scenario
          await featureOwnersPage.loadPage();
          await featureOwnersPage.searchForFeature(feature);
          await featureOwnersPage.clickOnButtonForFeature(feature, FeatureMenuOptions.EDIT);
          await featureOwnersPage.verifyUserIsNotDisplayedAsFeatureOwner(user1.username);
          await featureOwnersPage.reloadPage();
          await featureOwnersPage.clickOnButtonForFeature(feature, FeatureMenuOptions.EDIT);
          // Verify that user is displayed with App manager tag
          await featureOwnersPage.verifyFeatureOwnerIsDisplayedWithAppManagerTag(user2.username);
          await appManagerApiClient
            .getUserManagementService()
            .updatePrimaryRole(loginIdentifier2, RolesId.END_USER, { abac: true });
          await featureOwnersPage.reloadPage();
          await featureOwnersPage.clickOnButtonForFeature(feature, FeatureMenuOptions.EDIT);
          // Verify that user is not displayed in the feature owner list
          await featureOwnersPage.verifyUserIsNotDisplayedAsFeatureOwner(user2.username);
        }
      );

      test(
        `Verify that ${feature} feature owners access should be removed when the status of the user with app manager role is changed to inactive from manage users page`,
        {
          tag: [TestPriority.P0, `@ABAC`, `@feature-owners`],
        },
        async ({ appManagerPage, appManagerApiClient }) => {
          tagTest(test.info(), {
            zephyrTestId: ['PS-33069'],
          });
          const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(appManagerPage);

          // Test Scenario
          await featureOwnersPage.loadPage();
          await featureOwnersPage.searchForFeature(feature);
          await featureOwnersPage.clickOnButtonForFeature(feature, FeatureMenuOptions.EDIT);
          // Verify that user is displayed with App manager tag
          await featureOwnersPage.verifyFeatureOwnerIsDisplayedWithAppManagerTag(user2.username);
          // changing status of the App manager to Inactive
          let userId = await appManagerApiClient.getUserManagementService().getUserId(loginIdentifier2);
          await appManagerApiClient.getUserManagementService().updateUserStatus(userId, Statuses.INACTIVE);
          await featureOwnersPage.reloadPage();
          await featureOwnersPage.clickOnButtonForFeature(feature, FeatureMenuOptions.EDIT);
          // Verify that user is not displayed in the feature owners list after changing the status to inactive
          await featureOwnersPage.verifyUserIsNotDisplayedAsFeatureOwner(user2.username);
        }
      );

      test(
        `Verify that ${feature} feature owners access should be removed when the status of the user with app manager role is changed to frozen from manage users page`,
        {
          tag: [TestPriority.P0, `@ABAC`, `@feature-owners`],
        },
        async ({ appManagerPage, appManagerApiClient }) => {
          tagTest(test.info(), {
            zephyrTestId: ['PS-35600'],
          });
          const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(appManagerPage);

          // Test Scenario
          await featureOwnersPage.loadPage();
          await featureOwnersPage.searchForFeature(feature);
          await featureOwnersPage.clickOnButtonForFeature(feature, FeatureMenuOptions.EDIT);
          // Verify that user is displayed with App manager tag
          await featureOwnersPage.verifyFeatureOwnerIsDisplayedWithAppManagerTag(user3.username);
          // changing status of the App manager to Frozen
          let userId = await appManagerApiClient.getUserManagementService().getUserId(loginIdentifier3);
          await appManagerApiClient.getUserManagementService().updateUserStatus(userId, Statuses.FROZEN);
          await featureOwnersPage.reloadPage();
          await featureOwnersPage.clickOnButtonForFeature(feature, FeatureMenuOptions.EDIT);
          // Verify that user is not displayed in the feature owners list after changing the status to frozen
          await featureOwnersPage.verifyUserIsNotDisplayedAsFeatureOwner(user3.username);
        }
      );
    }
  }
);
