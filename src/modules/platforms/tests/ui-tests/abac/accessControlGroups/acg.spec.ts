import { TestPriority } from '@core/constants/testPriority';
import { User } from '@core/types/user.type';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { AccessControlGroupsPage, ACGFeature } from '@platforms/pages/abacPage/acgPage/accessControlGroupsPage';
import { FeatureOwnersPage } from '@platforms/pages/abacPage/featureOwnersPage/featureOwnersPage';

import { TestSuite } from '@/src/core/constants/testSuite';
import { User } from '@/src/core/types/user.type';

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

    test(
      `Verify that Roles option should not be displayed under Manage section in menu option`,
      {
        tag: [TestPriority.P1, `@ABAC`],
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
        tag: [TestPriority.P1, `@ABAC`],
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
      'Verify that the feature list displayed under Feature owners tab should be unique and verify search functionality with invalid string',
      {
        tag: [TestPriority.P0, `@ABAC`],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description:
            'Verify that the feature list displayed under Feature owners tab should be unique and verify search functionality with invalid string',
          zephyrTestId: ['PS-32997', 'PS-32965'],
        });
        const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(appManagerPage);
        // Navigate to Feature owners page
        await featureOwnersPage.loadPage();
        // Click "Show more" button until all features are loaded
        await featureOwnersPage.clickShowMoreUntilNotVisible();
        // Get all feature names displayed on the page
        const allFeatureNames: string[] = await featureOwnersPage.getAllFeatureNames();
        // Verify that all features are unique
        const uniqueFeatures: string[] = [...new Set(allFeatureNames)];
        // Check for duplicates by comparing string array lengths
        expect(
          uniqueFeatures.length,
          `Expected ${uniqueFeatures.length} unique features but found ${allFeatureNames.length} total features. Duplicate features detected.`
        ).toBe(allFeatureNames.length);

        // Test search functionality with invalid string
        await featureOwnersPage.performSearch('sdbkfjskdfn');
        await featureOwnersPage.verifyNoResultsFoundMessages();
      }
    );

    test(
      'Verify that clicking on owners count should trigger a popup displaying user info',
      {
        tag: [TestPriority.P1, `@ABAC`],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Verify that clicking on owners count should trigger a popup displaying user info',
          zephyrTestId: 'PS-32884',
        });
        const featureOwnersPage: FeatureOwnersPage = new FeatureOwnersPage(appManagerPage);
        // Navigate to Feature owners page
        await featureOwnersPage.loadPage();
        // Click on any owner count button and get the count value
        const clickedCount = await featureOwnersPage.clickOnAnyUserCountButton();
        // Verify that popup opens with the same count
        await featureOwnersPage.verifyUserCountPopupOpened(clickedCount);
      }
    );

    test(
      'Verify that a warning popup is displayed before edit Access control group popup',
      {
        tag: [TestPriority.P1, `@ABAC`],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Verify that a warning popup is displayed before edit Access control group popup',
          zephyrTestId: 'PS-31321',
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerPage);
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
      'Verify that user should be able to change managers from managers screen while editing them during ACG creation flow',
      {
        tag: [TestPriority.P1, `@ABAC`],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description:
            'Verify that user should be able to change managers from managers screen while editing them during ACG creation flow',
          zephyrTestId: 'PS-30956',
        });
        const accessControlGroupsPage: AccessControlGroupsPage = new AccessControlGroupsPage(appManagerPage);
        await accessControlGroupsPage.loadPage();
        await accessControlGroupsPage.clickOnCreateButtonToInitiateControlGroupCreationFlowFor('Single');
        await accessControlGroupsPage.selectFeatureToAddToControlGroup(ACGFeature.ALERTS);
        await accessControlGroupsPage.clickOnButtonWithName('Next');
        await accessControlGroupsPage.clickOnButtonWithName('Browse');
        await accessControlGroupsPage.searchForValues(audienceToCreate);
        await accessControlGroupsPage.clickOnAudience(audienceToCreate);
        await accessControlGroupsPage.clickOnButtonWithName('Done');
        await accessControlGroupsPage.clickOnButtonWithName('Next');

        // Browse Search Admin and select any available user from list for Managers
        await accessControlGroupsPage.clickOnButtonWithName('Browse');
        await accessControlGroupsPage.searchAndSelectUserWithEnter('Admin');
        await accessControlGroupsPage.clickOnButtonWithName('Done');
        await accessControlGroupsPage.clickOnButtonWithName('Next');

        // Browse Search Admin and select any available user from list for Admins
        await accessControlGroupsPage.clickOnButtonWithName('Browse');
        await accessControlGroupsPage.searchAndSelectUserWithEnter('Admin');
        await accessControlGroupsPage.clickOnButtonWithName('Done');
        await accessControlGroupsPage.clickOnButtonWithName('Next');

        // Edit Manager flow - test the new functionality
        await accessControlGroupsPage.clickOnEditManagerButton();
        await accessControlGroupsPage.clickOnAddUsersButton();
        await accessControlGroupsPage.searchAndSelectUserWithEnter('Admin');
        await accessControlGroupsPage.clickOnButtonWithName('Done');
        await accessControlGroupsPage.clickOnUpdateButton();

        // Click edit manager button again to verify the added users
        await accessControlGroupsPage.clickOnEditManagerButton();

        // Verify that admin users are displayed in the manager list (dynamic verification)
        await accessControlGroupsPage.verifyAdminUsersInManagerList();
      }
    );
  }
);
