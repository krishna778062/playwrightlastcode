import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { IdentityUserSearchResponse, User } from '@core/types/user.type';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';

import { FeatureOwnersPage } from '../../../../pages/abacPage/featureOwnersPage/featureOwnersPage';
import { ManageUsersPage } from '../../../../pages/managerUsersPage/manageUsersPage';

import { Roles, RolesId } from '@/src/core/constants/roles';
import { TestSuite } from '@/src/core/constants/testSuite';

test.describe(
  'ACG Testcases',
  {
    tag: [TestSuite.ABAC],
  },
  () => {
    let loginIdentifier1: string;
    let loginIdentifier2: string;
    let userNameForUser1: string;
    let userNameForUser2: string;
    const features: string[] = ['Application settings', 'Audiences', 'Branding', 'Users'];

    test.beforeEach(async ({ appManagerApiClient }) => {
      const user1: User = {
        first_name: 'Aaman Temp',
        last_name: `Standard User${Date.now()}`,
        emp: `TSU00${Date.now()}`,
      };

      const user2: User = {
        first_name: 'Aaman Temp',
        last_name: `App Manager${Date.now()}`,
        emp: `TAM00${Date.now()}`,
      };

      loginIdentifier1 = user1.emp;
      loginIdentifier2 = user2.emp;
      userNameForUser1 = `${user1.first_name} ${user1.last_name}`;
      userNameForUser2 = `${user2.first_name} ${user2.last_name}`;

      await appManagerApiClient.getUserManagementService().addUserIfNotAddedAlready(user1, Roles.END_USER);
      await appManagerApiClient.getUserManagementService().waitForUserToBeAddedInIdentity(loginIdentifier1);
      await appManagerApiClient.getUserManagementService().addUserIfNotAddedAlready(user2, Roles.APPLICATION_MANAGER);
      await appManagerApiClient.getUserManagementService().waitForUserToBeAddedInIdentity(loginIdentifier2);
      await appManagerApiClient
        .getUserManagementService()
        .updatePrimaryRole(loginIdentifier2, RolesId.APPLICATION_MANAGER, { abac: true });
    });

    test.afterEach(async ({ appManagerApiClient }) => {
      //deactivate user with the given login Identifiers if exists
      console.log(`loginIdentifier1: ${loginIdentifier1}`);
      if (loginIdentifier1 != undefined) {
        // Cleanup
        const userId = await appManagerApiClient.getUserManagementService().getUserId(loginIdentifier1);
        await appManagerApiClient.getUserManagementService().updateUserStatus(userId, 'Inactive');
      }

      console.log(`loginIdentifier2: ${loginIdentifier2}`);
      if (loginIdentifier2 != undefined) {
        // Cleanup
        const userId = await appManagerApiClient.getUserManagementService().getUserId(loginIdentifier2);
        await appManagerApiClient.getUserManagementService().updateUserStatus(userId, 'Inactive');
      }
    });

    // To run the followwing TCs with different features, we will be using a for loop
    // and we will be passing the feature name as a parameter to the test case
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
          usersWithAppManagerTag = await featureOwnersPage.getUsersWithAppManagerTag();

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

          await featureOwnersPage.loadPage();

          await featureOwnersPage.searchForFeature(feature);
          await featureOwnersPage.clickOnButtonForFeature(feature, 'Edit');
          await featureOwnersPage.addUserAsFeatureOnwer([userNameForUser1]);
          await featureOwnersPage.verifyToastMessage('Feature owners updated successfully');
          await featureOwnersPage.dismissTheToastMessage();
          await featureOwnersPage.clickOnButtonForFeature(feature, 'Edit');
          await featureOwnersPage.removeUserFromFeatureOwnersList(userNameForUser1);
          await featureOwnersPage.verifyToastMessage('Feature owners updated successfully');
          await featureOwnersPage.dismissTheToastMessage();
        }
      );

      test(
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
          // Verify that user is displayed with App manager tag
          await featureOwnersPage.verifyFeatureOwnerIsDisplayedWithAppManagerTag(userNameForUser2);
          await appManagerApiClient
            .getUserManagementService()
            .updatePrimaryRole(loginIdentifier2, RolesId.END_USER, { abac: true });
          await manageUsersPage.reloadPage();
          await featureOwnersPage.clickOnButtonForFeature(feature, 'Edit');
          // Check that user is not displayed in the feature onwer list
          await featureOwnersPage.verifyUserIsNotDisplayedAsFeatureOwner(userNameForUser2);
        }
      );
    }
  }
);
