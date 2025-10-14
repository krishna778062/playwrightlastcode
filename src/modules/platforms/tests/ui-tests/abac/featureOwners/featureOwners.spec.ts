import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { Roles, RolesId } from '@/src/core/constants/roles';
import { USER_STATUS } from '@/src/core/constants/status';
import { TestSuite } from '@/src/core/constants/testSuite';
import { LoginHelper } from '@/src/core/helpers/loginHelper';
import { User } from '@/src/core/types/user.type';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import {
  FEATURE_OWNERS_MENU_OPTIONS,
  FEATURE_OWNERS_TABS_OPTIONS,
} from '@/src/modules/platforms/constants/featureOwners';
import { FeatureOwnersPage } from '@/src/modules/platforms/ui/pages/abacPage/featureOwnersPage/featureOwnersPage';

test.describe(
  'feature Owners Testcases',
  {
    tag: [TestSuite.ABAC],
  },
  () => {
    let loginIdentifier1: string;
    let loginIdentifier2: string;
    let loginIdentifier3: string;
    const features: string[] = [
      'Application settings',
      //  'Audiences', 'Branding', 'Users'
    ];
    let user1: User;
    let user2: User;
    let user3: User;

    test.beforeEach(async ({ appManagerApiFixture }) => {
      user1 = TestDataGenerator.generateUserWithEmp({
        first_name: 'Aaman Temp',
        last_name: `Standard User${Date.now()}`,
        username: 'Aaman Temp' + ' ' + `Standard User${Date.now()}`,
        emp: `TSU00${Date.now()}`,
      });

      user2 = TestDataGenerator.generateUserWithEmp({
        first_name: 'Aaman Temp',
        last_name: `App Manager First User${Date.now()}`,
        username: 'Aaman Temp' + ' ' + `App Manager First User${Date.now()}`,
        emp: `TAM00${Date.now()}`,
      });

      user3 = TestDataGenerator.generateUserWithEmp({
        first_name: 'Aaman Temp',
        last_name: `App Manager Second User${Date.now()}`,
        username: 'Aaman Temp' + ' ' + `App Manager Second User${Date.now()}`,
        emp: `TAM01${Date.now()}`,
      });

      loginIdentifier1 = user1.emp;
      loginIdentifier2 = user2.emp;
      loginIdentifier3 = user3.emp;
      await appManagerApiFixture.userManagementService.addUserIfNotAddedAlready(user1, Roles.END_USER);
      await appManagerApiFixture.userManagementService.waitForUserToBeAddedInIdentity(loginIdentifier1);
      await appManagerApiFixture.userManagementService.addUserIfNotAddedAlready(user2, Roles.APPLICATION_MANAGER);
      await appManagerApiFixture.userManagementService.waitForUserToBeAddedInIdentity(loginIdentifier2);
      await appManagerApiFixture.userManagementService.addUserIfNotAddedAlready(user3, Roles.APPLICATION_MANAGER);
      await appManagerApiFixture.userManagementService.waitForUserToBeAddedInIdentity(loginIdentifier3);
    });

    test.afterEach(async ({ appManagerApiFixture }) => {
      //deactivate user with the given login Identifiers if exists
      console.log(`loginIdentifier1: ${loginIdentifier1}`);
      if (loginIdentifier1 != undefined) {
        // Cleanup
        const userId = await appManagerApiFixture.userManagementService.getUserId(loginIdentifier1);
        await appManagerApiFixture.userManagementService.updateUserStatus(userId, USER_STATUS.INACTIVE);
      }

      console.log(`loginIdentifier2: ${loginIdentifier2}`);
      if (loginIdentifier2 != undefined) {
        // Cleanup
        const userId = await appManagerApiFixture.userManagementService.getUserId(loginIdentifier2);
        await appManagerApiFixture.userManagementService.updateUserStatus(userId, USER_STATUS.INACTIVE);
      }

      console.log(`loginIdentifier3: ${loginIdentifier3}`);
      if (loginIdentifier3 != undefined) {
        // Cleanup
        const userId = await appManagerApiFixture.userManagementService.getUserId(loginIdentifier3);
        await appManagerApiFixture.userManagementService.updateUserStatus(userId, USER_STATUS.INACTIVE);
      }
    });

    // To run the followwing TCs with different features, we will be using a for loop
    // and we will be passing the feature name as a parameter to the test case
    for (const feature of features) {
      // Commenting this test case until relevant implementation is done
      // test(
      //   `Verify that user manager should not be able to remove Feature owner access of any app manager from ${feature} feature under Feature owners tab`,
      //   {
      //     tag: [TestPriority.P1, `@ABAC`, `@feature-owners`],
      //   },
      //   async ({ userManagerFixture, appManagerApiFixture }) => {
      //     let usersWithAppManagerTag: string[] = [];
      //     tagTest(test.info(), {
      //       zephyrTestId: 'PS-33254',
      //     });
      //     const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(userManagerFixture.page);

      //     await featureOwnersPage.loadPage();
      //     await featureOwnersPage.searchForFeature(feature);
      //     await featureOwnersPage.clickOnButtonForFeature(feature, FEATURE_OWNERS_MENU_OPTIONS.EDIT);
      //     await featureOwnersPage.featureOwnerModal.ClickOnTab('Users');
      //     await featureOwnersPage.sleep(10000);

      //     // Get the list of all users with App manager tag
      //     usersWithAppManagerTag = await featureOwnersPage.getUsersWithAppManagerTag();

      //     // // Iterate the above list and check if the users are app manager through api
      //     // while (usersWithAppManagerTag.length > 0) {
      //     //   const userWithAppManagerTag: string = usersWithAppManagerTag.pop() as string;
      //     //   const userDetailsJson: IdentityUserSearchResponse =
      //     //     await appManagerApiFixture.userManagementService.getUserDetailsFromUserSearchList(userWithAppManagerTag);
      //     //   expect(userDetailsJson.result.listOfItems[0].roles).toEqual(Roles.APPLICATION_MANAGER);
      //     // }
      //   }
      // );

      test(
        `Verify that user manager should have access for editing ${feature} feature under feature owners tab`,
        {
          tag: [TestPriority.P1, `@ABAC`, `@feature-owners`, `@this-one`],
        },
        async ({ userManagerFixture }) => {
          tagTest(test.info(), {
            zephyrTestId: ['PS-33252', 'PS-33251', 'PS-33493'],
          });
          const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(userManagerFixture.page);

          await featureOwnersPage.loadPage();

          await featureOwnersPage.searchForFeature(feature);
          await featureOwnersPage.clickOnButtonForFeature(feature, FEATURE_OWNERS_MENU_OPTIONS.EDIT);
          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          await featureOwnersPage.featureOwnerModal.addUserAsFeatureOnwer([user1.username]);
          await featureOwnersPage.verifyToastMessageIsVisibleWithText('Feature owners updated successfully');
          await featureOwnersPage.dismissTheToastMessage();

          await featureOwnersPage.clickOnButtonForFeature(feature, FEATURE_OWNERS_MENU_OPTIONS.EDIT);
          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.ASSIGNED);
          await featureOwnersPage.featureOwnerModal.removeUserFromFeatureOwnersList([user1.username]);
          await featureOwnersPage.verifyToastMessageIsVisibleWithText('Feature owners updated successfully');
          await featureOwnersPage.dismissTheToastMessage();
        }
      );

      test(
        `Verify that user manager should be able to remove Feature onwer access of any app manager from manage users page for ${feature} feature`,
        {
          tag: [TestPriority.P1, `@ABAC`, `@feature-owners`, `@this-one`],
        },
        async ({ userManagerFixture, appManagerApiFixture }) => {
          tagTest(test.info(), {
            zephyrTestId: ['PS-33255', 'PS-33090', 'PS-33089', `PS-32972`, `PS-32973`],
          });
          const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(userManagerFixture.page);
          // Test Scenario
          await featureOwnersPage.loadPage();
          await featureOwnersPage.searchForFeature(feature);
          await featureOwnersPage.clickOnButtonForFeature(feature, FEATURE_OWNERS_MENU_OPTIONS.EDIT);
          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          await featureOwnersPage.featureOwnerModal.verifyUserIsNotDisplayedAsFeatureOwner(user1.username);
          await featureOwnersPage.reloadPage();
          await featureOwnersPage.clickOnButtonForFeature(feature, FEATURE_OWNERS_MENU_OPTIONS.EDIT);
          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          // Verify that user is displayed with App manager tag
          await featureOwnersPage.featureOwnerModal.verifyFeatureOwnerIsDisplayedWithAppManagerTag(user2.username);
          await appManagerApiFixture.userManagementService.updatePrimaryRole(loginIdentifier2, RolesId.END_USER, {
            abac: true,
          });
          await featureOwnersPage.reloadPage();
          await featureOwnersPage.clickOnButtonForFeature(feature, FEATURE_OWNERS_MENU_OPTIONS.EDIT);
          // Verify that user is not displayed in the feature owner list
          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          await featureOwnersPage.featureOwnerModal.verifyUserIsNotDisplayedAsFeatureOwner(user2.username);
        }
      );

      test(
        `Verify that ${feature} feature owners access should be removed when the status of the user with app manager role is changed to inactive from manage users page`,
        {
          tag: [TestPriority.P0, `@ABAC`, `@feature-owners`, `@this-one`],
        },
        async ({ appManagerFixture }) => {
          tagTest(test.info(), {
            zephyrTestId: ['PS-33069'],
          });
          const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);

          // Test Scenario
          await featureOwnersPage.loadPage();
          await featureOwnersPage.searchForFeature(feature);
          await featureOwnersPage.clickOnButtonForFeature(feature, FEATURE_OWNERS_MENU_OPTIONS.EDIT);
          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          // Verify that user is displayed with App manager tag
          await featureOwnersPage.featureOwnerModal.verifyFeatureOwnerIsDisplayedWithAppManagerTag(user2.username);
          // changing status of the App manager to Inactive
          const userId = await appManagerFixture.userManagementService.getUserId(loginIdentifier2);
          await appManagerFixture.userManagementService.updateUserStatus(userId, USER_STATUS.INACTIVE);
          await featureOwnersPage.reloadPage();
          await featureOwnersPage.clickOnButtonForFeature(feature, FEATURE_OWNERS_MENU_OPTIONS.EDIT);
          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          // Verify that user is not displayed in the feature owners list after changing the status to inactive
          await featureOwnersPage.featureOwnerModal.verifyNoUserFoundScreen(user2.username);
        }
      );

      test(
        `Verify that ${feature} feature owners access should be removed when the status of the user with app manager role is changed to frozen from manage users page`,
        {
          tag: [TestPriority.P0, `@ABAC`, `@feature-owners`, `@this-one`],
        },
        async ({ appManagerFixture }) => {
          tagTest(test.info(), {
            zephyrTestId: ['PS-35600'],
          });
          const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);

          // Test Scenario
          await featureOwnersPage.loadPage();
          await featureOwnersPage.searchForFeature(feature);
          await featureOwnersPage.clickOnButtonForFeature(feature, FEATURE_OWNERS_MENU_OPTIONS.EDIT);
          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          // Verify that user is displayed with App manager tag
          await featureOwnersPage.featureOwnerModal.verifyFeatureOwnerIsDisplayedWithAppManagerTag(user3.username);
          // changing status of the App manager to Frozen
          const userId = await appManagerFixture.userManagementService.getUserId(loginIdentifier3);
          await appManagerFixture.userManagementService.updateUserStatus(userId, USER_STATUS.FROZEN);
          await featureOwnersPage.reloadPage();
          await featureOwnersPage.clickOnButtonForFeature(feature, FEATURE_OWNERS_MENU_OPTIONS.EDIT);
          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          // Verify that user is not displayed in the feature owners list after changing the status to frozen
          await featureOwnersPage.featureOwnerModal.verifyNoUserFoundScreen(user3.username);
        }
      );

      test(
        `Verify that App manager should be able to add a user without app manager or user manager role as Feature owner for ${feature} feature`,
        {
          tag: [TestPriority.P1, `@ABAC`, `@featureOwners`, `@this-one`],
        },
        async ({ appManagerFixture }) => {
          tagTest(test.info(), {
            zephyrTestId: ['PS-32975'],
          });
          const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);
          await featureOwnersPage.loadPage();

          await featureOwnersPage.searchForFeature(feature);
          await featureOwnersPage.clickOnButtonForFeature(feature, FEATURE_OWNERS_MENU_OPTIONS.EDIT);
          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          await featureOwnersPage.featureOwnerModal.addUserAsFeatureOnwer([user1.username]);
          await featureOwnersPage.verifyToastMessageIsVisibleWithText('Feature owners updated successfully');
          await featureOwnersPage.dismissTheToastMessage();
          await featureOwnersPage.clickOnButtonForFeature(feature, FEATURE_OWNERS_MENU_OPTIONS.EDIT);
          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.ASSIGNED);
          await featureOwnersPage.featureOwnerModal.removeUserFromFeatureOwnersList([user1.username]);
          await featureOwnersPage.verifyToastMessageIsVisibleWithText('Feature owners updated successfully');
          await featureOwnersPage.dismissTheToastMessage();
        }
      );

      test(
        `Verify that when primary role of a user is changed from manage users page then the privileges should be lost or gained accordingly for ${feature} feature`,
        {
          tag: [TestPriority.P1, `@ABAC`, `@featureOwners`],
        },
        async ({ appManagerFixture, browser }) => {
          tagTest(test.info(), {
            zephyrTestId: ['PS-32482'],
          });
          await appManagerFixture.userManagementService.registerUser(loginIdentifier2, {
            verificationQuestionField: 'department',
            verificationQuestionValue: 'Product',
            password: 'Simp@1234',
          });
          const newUserContext = await browser.newContext();
          const page = await newUserContext.newPage();
          await LoginHelper.loginWithPassword(page, {
            email: loginIdentifier2,
            password: 'Simp@1234',
          });

          const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(page);
          await featureOwnersPage.loadPage();
          await featureOwnersPage.verifyThePageIsLoaded();
          await appManagerFixture.userManagementService.updatePrimaryRole(loginIdentifier2, RolesId.END_USER, {
            abac: true,
          });
          await appManagerFixture.userManagementService.waitForUserRoleToSync(loginIdentifier2, RolesId.END_USER);
          try {
            await featureOwnersPage.goToUrl(PAGE_ENDPOINTS.FEATURE_OWNERS);
            await featureOwnersPage.verifyAccessDeniedPageVisibility();
          } catch (e) {
            console.log(`Error in going to feature owners page: ${e}`);
            await featureOwnersPage.goToUrl(PAGE_ENDPOINTS.FEATURE_OWNERS);
          }
          await featureOwnersPage.verifyAccessDeniedPageVisibility();
          await newUserContext.close();
        }
      );
    }
  }
);
