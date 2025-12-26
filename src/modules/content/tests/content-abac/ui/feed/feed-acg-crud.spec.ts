import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { tagTest } from '@/src/core/utils/testDecorator';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { ACG_EDIT_ASSETS } from '@/src/modules/platforms/constants/acg';
import { FEATURE_OWNERS_TABS_OPTIONS } from '@/src/modules/platforms/constants/featureOwners';
import { POPUP_BUTTONS } from '@/src/modules/platforms/constants/popupButtons';
import { AccessControlGroupsPage } from '@/src/modules/platforms/ui/pages/abacPage/acgPage/accessControlGroupsPage';
import { FeatureOwnersPage } from '@/src/modules/platforms/ui/pages/abacPage/featureOwnersPage/featureOwnersPage';

const POST_IN_HOME_FEED_FEATURE = 'Post in home feed';
const MANAGE_HOME_FEED_FEATURE = 'Manage home feed';

test.describe(
  'sU | Home Feed Post Creation via ACG Permission (ABAC)',
  {
    tag: [ContentSuiteTags.FEED_ABAC],
  },
  () => {
    let feedPage: FeedPage;
    let createdPostId: string = '';
    let standardUserFullName: string;
    let featureOwnersPage: FeatureOwnersPage;
    let acgPage: AccessControlGroupsPage;

    test.beforeEach('Setup: Get Standard User full name', async ({ appManagerApiFixture }) => {
      const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
      standardUserFullName = userInfo.fullName;
    });

    test.afterEach('Cleanup: Delete created post and remove FO if needed', async ({ appManagerApiFixture }) => {
      if (createdPostId) {
        try {
          await appManagerApiFixture.feedManagementHelper.deleteFeed(createdPostId);
        } catch (error) {
          console.log('Error during feed cleanup:', error);
        }
      }
    });

    test(
      'verify SU who is FO of "Post In Home Feed" ACG can view Feed form and create posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42178', '@feed-acg-crud'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Standard User who is Functional Owner of "Post In Home Feed" ACG can view and use the Feed Post creation form on Home Feed',
          zephyrTestId: 'CONT-42178',
          storyId: 'CONT-42178',
        });

        // ==================== Ensure SU is NOT a Manager/Admin of "Post In Home Feed" ACG ====================
        await test.step('Pre-requisite: Ensure SU is not a Manager/Admin of "Post In Home Feed" ACG', async () => {
          acgPage = new AccessControlGroupsPage(appManagerFixture.page);
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_FEATURE);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_FEATURE);
          await acgPage.confirmEditACGModal.clickContinueButton();
          let operationPerformed = false;

          // Remove user from Managers list if present
          const isManagerButtonEnabled = await acgPage.editACGModal.clickOnEditButtonIfEnabled(ACG_EDIT_ASSETS.MANAGER);
          if (isManagerButtonEnabled) {
            await acgPage.editACGModal.verifyTitleOfTheModal('Managers');
            const wasRemovedFromManagers = await acgPage.editACGModal.removeUserIfPresentInList(standardUserFullName);
            if (wasRemovedFromManagers) {
              await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
              operationPerformed = true;
            } else {
              await acgPage.editACGModal.clickOnBackButton();
            }
          }

          // Remove user from Admins list if present
          const isAdminButtonEnabled = await acgPage.editACGModal.clickOnEditButtonIfEnabled(ACG_EDIT_ASSETS.ADMIN);
          if (isAdminButtonEnabled) {
            await acgPage.editACGModal.verifyTitleOfTheModal('Admins');
            const wasRemovedFromAdmins = await acgPage.editACGModal.removeUserIfPresentInList(standardUserFullName);
            if (wasRemovedFromAdmins) {
              await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
              operationPerformed = true;
            } else {
              await acgPage.editACGModal.clickOnBackButton();
            }
          }

          if (operationPerformed) {
            await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
          } else {
            await acgPage.editACGModal.clickCloseButton();
          }
        });

        // ==================== STEP 1: App Manager adds SU as FO ====================
        await test.step('App Manager adds SU as FO of "Post In Home Feed" ACG', async () => {
          featureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          await featureOwnersPage.featureOwnerModal.addUserAsFeatureOnwer([standardUserFullName]);
        });

        // ==================== SU navigates to Home Feed and creates post ====================
        await test.step('SU navigates to Home Feed, verifies form is visible, and creates a Feed post', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.actions.verifyThePageIsLoaded();

          // Verify SU can view Feed Post creation form
          await feedPage.assertions.verifyFeedSectionIsVisible();

          // SU creates a Feed post
          const postText = TestDataGenerator.generateRandomText('ABAC FO Home Feed Post', 3, true);
          await feedPage.actions.clickShareThoughtsButton();
          const postResult = await feedPage.actions.createAndPost({
            text: postText,
          });

          createdPostId = postResult.postId || '';
          await feedPage.assertions.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== App Manager removes SU as FO ====================
        await test.step('App Manager removes SU as FO from "Post In Home Feed" ACG', async () => {
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.ASSIGNED);
          await featureOwnersPage.featureOwnerModal.removeUserFromFeatureOwnersList([standardUserFullName]);
        });

        // ==================== Verify SU cannot view Feed form after FO removal ====================
        await test.step('Verify SU cannot view Feed Post creation form after FO removal', async () => {
          await feedPage.actions.reloadPageWithTimelineMode();
          await feedPage.assertions.verifyFeedSectionIsNotVisible();
        });
      }
    );

    test(
      'verify SU who is Admin of "Post In Home Feed" ACG can view Feed form and create posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42179', '@feed-acg-crud'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Standard User who is Admin of "Post In Home Feed" ACG can view and use the Feed Post creation form on Home Feed',
          zephyrTestId: 'CONT-42179',
          storyId: 'CONT-42179',
        });
        let operationPerformed = false;

        // ====================Ensure SU is NOT a Manager/FO of "Post In Home Feed" ACG ====================
        await test.step('Pre-requisite: Ensure SU is not a Manager/FO of "Post In Home Feed" ACG', async () => {
          // Remove from Feature Owners if present
          featureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.ASSIGNED);
          try {
            await featureOwnersPage.featureOwnerModal.removeUserFromFeatureOwnersList([standardUserFullName]);
          } catch {
            // User not in FO list, close modal
            await featureOwnersPage.featureOwnerModal.clickOnCloseButton();
          }

          // Remove from Managers in ACG if present
          acgPage = new AccessControlGroupsPage(appManagerFixture.page);
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_FEATURE);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_FEATURE);
          await acgPage.confirmEditACGModal.clickContinueButton();

          const isManagerButtonEnabled = await acgPage.editACGModal.clickOnEditButtonIfEnabled(ACG_EDIT_ASSETS.MANAGER);
          if (isManagerButtonEnabled) {
            await acgPage.editACGModal.verifyTitleOfTheModal('Managers');
            const wasRemovedFromManagers = await acgPage.editACGModal.removeUserIfPresentInList(standardUserFullName);
            if (wasRemovedFromManagers) {
              await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
              operationPerformed = true;
            } else {
              await acgPage.editACGModal.clickOnBackButton();
            }
          }

          if (operationPerformed) {
            await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
          } else {
            await acgPage.editACGModal.clickCloseButton();
          }
        });

        // ==================== App Manager adds SU as Admin of ACG ====================
        await test.step('App Manager adds SU as Admin of "Post In Home Feed" ACG', async () => {
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_FEATURE);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_FEATURE);
          await acgPage.confirmEditACGModal.clickContinueButton();

          // Navigate to Admins section and add user
          const isAdminButtonEnabled = await acgPage.editACGModal.clickOnEditButtonIfEnabled(ACG_EDIT_ASSETS.ADMIN);
          if (isAdminButtonEnabled) {
            await acgPage.editACGModal.verifyTitleOfTheModal('Admins');
            operationPerformed = await acgPage.editACGModal.addUserToList(standardUserFullName);
            await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
          } else {
            await acgPage.editACGModal.clickCloseButton();
          }
          if (operationPerformed) {
            await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
          } else {
            await acgPage.editACGModal.clickCloseButton();
          }
        });

        // ==================== SU navigates to Home Feed and creates post ====================
        await test.step('SU navigates to Home Feed, verifies form is visible, and creates a Feed post', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.assertions.verifyThePageIsLoaded();

          // Verify SU can view Feed Post creation form
          await feedPage.assertions.verifyFeedSectionIsVisible();

          // SU creates a Feed post
          const postText = TestDataGenerator.generateRandomText('ABAC Admin Home Feed Post', 3, true);
          await feedPage.actions.clickShareThoughtsButton();
          const postResult = await feedPage.actions.createAndPost({
            text: postText,
          });

          createdPostId = postResult.postId || '';
          await feedPage.assertions.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== App Manager removes SU as Admin from ACG ====================
        await test.step('App Manager removes SU as Admin from "Post In Home Feed" ACG', async () => {
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_FEATURE);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_FEATURE);
          await acgPage.confirmEditACGModal.clickContinueButton();

          // Navigate to Admins section and remove user
          await acgPage.editACGModal.clickOnEditButtonOnSummaryScreen(ACG_EDIT_ASSETS.ADMIN);
          await acgPage.editACGModal.verifyTitleOfTheModal('Admins');
          await acgPage.editACGModal.removeUserIfPresentInList(standardUserFullName);
          await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);

          // Save the ACG changes
          await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
        });

        // ==================== Verify SU cannot view Feed form after Admin removal ====================
        await test.step('Verify SU cannot view Feed Post creation form after Admin removal', async () => {
          await feedPage.actions.reloadPageWithTimelineMode();
          await feedPage.assertions.verifyFeedSectionIsNotVisible();
        });
      }
    );

    test(
      'verify SU who is Manager of "Post In Home Feed" ACG can view Feed form and create posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42180', '@feed-acg-crud'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Standard User who is Manager of "Post In Home Feed" ACG can view and use the Feed Post creation form on Home Feed',
          zephyrTestId: 'CONT-42180',
          storyId: 'CONT-42180',
        });
        let operationPerformed = false;

        // ==================== Ensure SU is NOT an Admin/FO of "Post In Home Feed" ACG ====================
        await test.step('Pre-requisite: Ensure SU is not an Admin/FO of "Post In Home Feed" ACG', async () => {
          // Remove from Feature Owners if present
          featureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.ASSIGNED);
          try {
            await featureOwnersPage.featureOwnerModal.removeUserFromFeatureOwnersList([standardUserFullName]);
          } catch {
            // User not in FO list, close modal
            await featureOwnersPage.featureOwnerModal.clickOnCloseButton();
          }

          // Remove from Admins in ACG if present
          acgPage = new AccessControlGroupsPage(appManagerFixture.page);
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_FEATURE);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_FEATURE);
          await acgPage.confirmEditACGModal.clickContinueButton();

          const isAdminButtonEnabled = await acgPage.editACGModal.clickOnEditButtonIfEnabled(ACG_EDIT_ASSETS.ADMIN);
          if (isAdminButtonEnabled) {
            await acgPage.editACGModal.verifyTitleOfTheModal('Admins');
            const wasRemovedFromAdmins = await acgPage.editACGModal.removeUserIfPresentInList(standardUserFullName);
            if (wasRemovedFromAdmins) {
              await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
              operationPerformed = true;
            } else {
              await acgPage.editACGModal.clickOnBackButton();
            }
          }

          if (operationPerformed) {
            await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
          } else {
            await acgPage.editACGModal.clickCloseButton();
          }
        });

        // ==================== App Manager adds SU as Manager of ACG ====================
        await test.step('App Manager adds SU as Manager of "Post In Home Feed" ACG', async () => {
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_FEATURE);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_FEATURE);
          await acgPage.confirmEditACGModal.clickContinueButton();

          // Navigate to Managers section and add user
          operationPerformed = false;
          const isManagerButtonEnabled = await acgPage.editACGModal.clickOnEditButtonIfEnabled(ACG_EDIT_ASSETS.MANAGER);
          if (isManagerButtonEnabled) {
            await acgPage.editACGModal.verifyTitleOfTheModal('Managers');
            operationPerformed = await acgPage.editACGModal.addUserToList(standardUserFullName);
            await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
          } else {
            await acgPage.editACGModal.clickCloseButton();
          }
          if (operationPerformed) {
            await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
          } else {
            await acgPage.editACGModal.clickCloseButton();
          }
        });

        // ==================== SU navigates to Home Feed and creates post ====================
        await test.step('SU navigates to Home Feed, verifies form is visible, and creates a Feed post', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.assertions.verifyThePageIsLoaded();

          // Verify SU can view Feed Post creation form
          await feedPage.assertions.verifyFeedSectionIsVisible();

          // SU creates a Feed post
          const postText = TestDataGenerator.generateRandomText('ABAC Manager Home Feed Post', 3, true);
          await feedPage.actions.clickShareThoughtsButton();
          const postResult = await feedPage.actions.createAndPost({
            text: postText,
          });

          createdPostId = postResult.postId || '';
          await feedPage.assertions.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== App Manager removes SU as Manager from ACG ====================
        await test.step('App Manager removes SU as Manager from "Post In Home Feed" ACG', async () => {
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_FEATURE);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_FEATURE);
          await acgPage.confirmEditACGModal.clickContinueButton();

          // Navigate to Managers section and remove user
          await acgPage.editACGModal.clickOnEditButtonOnSummaryScreen(ACG_EDIT_ASSETS.MANAGER);
          await acgPage.editACGModal.verifyTitleOfTheModal('Managers');
          await acgPage.editACGModal.removeUserIfPresentInList(standardUserFullName);
          await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);

          // Save the ACG changes
          await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
        });

        // ==================== Verify SU cannot view Feed form after Manager removal ====================
        await test.step('Verify SU cannot view Feed Post creation form after Manager removal', async () => {
          await feedPage.actions.reloadPageWithTimelineMode();
          await feedPage.assertions.verifyFeedSectionIsNotVisible();
        });
      }
    );

    test(
      'verify SU who is only in Target Audience of "Post In Home Feed" ACG cannot create Feed Post',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42181', '@feed-acg-crud'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Standard User who is only in Target Audience (not Manager/Admin/FO) of "Post In Home Feed" ACG cannot view or create Feed posts on Home Feed',
          zephyrTestId: 'CONT-42181',
          storyId: 'CONT-42181',
        });

        // ==================== Ensure SU is NOT a Manager/Admin/FO of "Post In Home Feed" ACG ====================
        await test.step('Pre-requisite: Ensure SU is not a Manager/Admin/FO of "Post In Home Feed" ACG', async () => {
          let operationPerformed = false;

          // Remove from Feature Owners if present
          featureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.ASSIGNED);
          try {
            await featureOwnersPage.featureOwnerModal.removeUserFromFeatureOwnersList([standardUserFullName]);
          } catch {
            // User not in FO list, close modal
            await featureOwnersPage.featureOwnerModal.clickOnCloseButton();
          }

          // Remove from Managers and Admins in ACG if present
          acgPage = new AccessControlGroupsPage(appManagerFixture.page);
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_FEATURE);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_FEATURE);
          await acgPage.confirmEditACGModal.clickContinueButton();

          // Remove from Managers if present
          const isManagerButtonEnabled = await acgPage.editACGModal.clickOnEditButtonIfEnabled(ACG_EDIT_ASSETS.MANAGER);
          if (isManagerButtonEnabled) {
            await acgPage.editACGModal.verifyTitleOfTheModal('Managers');
            const wasRemovedFromManagers = await acgPage.editACGModal.removeUserIfPresentInList(standardUserFullName);
            if (wasRemovedFromManagers) {
              await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
              operationPerformed = true;
            } else {
              await acgPage.editACGModal.clickOnBackButton();
            }
          }

          // Remove from Admins if present
          const isAdminButtonEnabled = await acgPage.editACGModal.clickOnEditButtonIfEnabled(ACG_EDIT_ASSETS.ADMIN);
          if (isAdminButtonEnabled) {
            await acgPage.editACGModal.verifyTitleOfTheModal('Admins');
            const wasRemovedFromAdmins = await acgPage.editACGModal.removeUserIfPresentInList(standardUserFullName);
            if (wasRemovedFromAdmins) {
              await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
              operationPerformed = true;
            } else {
              await acgPage.editACGModal.clickOnBackButton();
            }
          }

          if (operationPerformed) {
            await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
          } else {
            await acgPage.editACGModal.clickCloseButton();
          }
        });

        // ==================== Verify SU cannot view Feed form when only in Target Audience ====================
        await test.step('Verify SU cannot view Feed Post creation form when only in Target Audience', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.actions.reloadPageWithTimelineMode();
          await feedPage.verifyThePageIsLoadedWithTimelineMode();

          // SU should NOT be able to view Feed Post creation form
          await feedPage.assertions.verifyFeedSectionIsNotVisible();
        });
      }
    );

    test(
      'verify FO can edit their own Home Feed Post',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42182', '@feed-acg-crud'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'ABAC: Verify Feature Owner of "Post In Home Feed" ACG can edit their own Home Feed post',
          zephyrTestId: 'CONT-42182',
          storyId: 'CONT-42182',
        });
        let postText: string;

        // ==================== App Manager adds SU as FO of "Post In Home Feed" ACG ====================
        await test.step('App Manager adds SU as FO of "Post In Home Feed" ACG', async () => {
          featureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          await featureOwnersPage.featureOwnerModal.addUserAsFeatureOnwer([standardUserFullName]);
        });

        // ==================== FO creates a Feed post ====================
        await test.step('FO navigates to Home Feed and creates a Feed post', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.assertions.verifyThePageIsLoaded();

          // Verify FO can view Feed Post creation form
          await feedPage.assertions.verifyFeedSectionIsVisible();

          // FO creates a Feed post
          postText = TestDataGenerator.generateRandomText('ABAC FO Own Post', 3, true);
          await feedPage.actions.clickShareThoughtsButton();
          const postResult = await feedPage.actions.createAndPost({
            text: postText,
          });

          createdPostId = postResult.postId || '';
          await feedPage.assertions.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== FO edits their own post ====================
        let updatedPostText: string;
        await test.step('FO edits their own Feed post successfully', async () => {
          updatedPostText = TestDataGenerator.generateRandomText('ABAC FO Edited Own Post', 3, true);

          // Open options menu on FO's own post
          await feedPage.actions.openPostOptionsMenu(postText);

          // Verify Edit option is visible for own post
          await feedPage.assertions.verifyEditOptionVisible(postText);

          await feedPage.actions.openPostOptionsMenu(postText);

          // Edit the post
          await feedPage.actions.editPost(postText, updatedPostText);

          // Verify the post was updated successfully
          await feedPage.assertions.waitForPostToBeVisible(updatedPostText);
        });

        // ==================== Cleanup: Remove SU as FO ====================
        await test.step('Cleanup: Remove SU as FO from "Post In Home Feed" ACG', async () => {
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.ASSIGNED);
          await featureOwnersPage.featureOwnerModal.removeUserFromFeatureOwnersList([standardUserFullName]);
        });
      }
    );
  }
);

test.describe(
  'sU | Home Feed Post Management via ACG Permission (ABAC)',
  {
    tag: [ContentSuiteTags.FEED_ABAC],
  },
  () => {
    let feedPage: FeedPage;
    let createdPostId: string = '';
    let createdPostText: string = '';
    let standardUserFullName: string;
    let featureOwnersPage: FeatureOwnersPage;
    let acgPage: AccessControlGroupsPage;

    test.beforeEach('Setup: Get Standard User full name', async ({ appManagerApiFixture }) => {
      const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
      standardUserFullName = userInfo.fullName;
    });

    test.afterEach('Cleanup: Delete created post if needed', async ({ appManagerApiFixture }) => {
      if (createdPostId) {
        try {
          await appManagerApiFixture.feedManagementHelper.deleteFeed(createdPostId);
        } catch (error) {
          console.log('Error during feed cleanup:', error);
        }
        createdPostId = '';
      }
    });

    test(
      'verify SU without "Manage Home Feed" ACG role cannot edit other users\' Feed posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42189', '@feed-acg-crud'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Standard User without any "Manage Home Feed" ACG role (not Admin, Manager, or FO) cannot see Edit option on other users\' Feed posts on Home Feed',
          zephyrTestId: 'CONT-42189',
          storyId: 'CONT-42189',
        });

        // ==================== Ensure SU is NOT a Manager/Admin/FO of "Manage Home Feed" ACG ====================
        await test.step('Pre-requisite: Ensure SU is not a Manager/Admin/FO of "Manage Home Feed" ACG', async () => {
          let operationPerformed = false;

          // Remove from Feature Owners if present
          featureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(MANAGE_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(MANAGE_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.ASSIGNED);
          try {
            await featureOwnersPage.featureOwnerModal.removeUserFromFeatureOwnersList([standardUserFullName]);
          } catch {
            // User not in FO list, close modal
            await featureOwnersPage.featureOwnerModal.clickOnCloseButton();
          }

          // Remove from Managers and Admins in ACG if present
          acgPage = new AccessControlGroupsPage(appManagerFixture.page);
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(MANAGE_HOME_FEED_FEATURE);
          await acgPage.actions.editACG(MANAGE_HOME_FEED_FEATURE);
          await acgPage.confirmEditACGModal.clickContinueButton();

          // Remove from Managers if present
          const isManagerButtonEnabled = await acgPage.editACGModal.clickOnEditButtonIfEnabled(ACG_EDIT_ASSETS.MANAGER);
          if (isManagerButtonEnabled) {
            await acgPage.editACGModal.verifyTitleOfTheModal('Managers');
            const wasRemovedFromManagers = await acgPage.editACGModal.removeUserIfPresentInList(standardUserFullName);
            if (wasRemovedFromManagers) {
              await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
              operationPerformed = true;
            } else {
              await acgPage.editACGModal.clickOnBackButton();
            }
          }

          // Remove from Admins if present
          const isAdminButtonEnabled = await acgPage.editACGModal.clickOnEditButtonIfEnabled(ACG_EDIT_ASSETS.ADMIN);
          if (isAdminButtonEnabled) {
            await acgPage.editACGModal.verifyTitleOfTheModal('Admins');
            const wasRemovedFromAdmins = await acgPage.editACGModal.removeUserIfPresentInList(standardUserFullName);
            if (wasRemovedFromAdmins) {
              await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
              operationPerformed = true;
            } else {
              await acgPage.editACGModal.clickOnBackButton();
            }
          }

          if (operationPerformed) {
            await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
          } else {
            await acgPage.editACGModal.clickCloseButton();
          }
        });

        // ==================== App Manager creates a Feed post (other user's post) ====================
        await test.step('App Manager creates a Feed post on Home Feed', async () => {
          await appManagerFixture.navigationHelper.clickOnHomeButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.assertions.verifyThePageIsLoaded();

          createdPostText = TestDataGenerator.generateRandomText('ABAC Baseline Edit Restriction Test Post', 3, true);
          await appManagerFeedPage.actions.clickShareThoughtsButton();
          const postResult = await appManagerFeedPage.actions.createAndPost({
            text: createdPostText,
          });

          createdPostId = postResult.postId || '';
          await appManagerFeedPage.assertions.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== SU verifies Edit option is NOT visible on other user's post ====================
        await test.step("SU navigates to Home Feed and verifies Edit option is NOT visible on App Manager's post", async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.assertions.verifyThePageIsLoaded();

          // Verify the post is visible
          await feedPage.assertions.waitForPostToBeVisible(createdPostText);

          // Open options menu on App Manager's post
          await feedPage.actions.openPostOptionsMenu(createdPostText);

          // Verify Edit option is NOT visible (SU has no ABAC permission to edit other users' posts)
          await feedPage.assertions.verifyEditOptionNotVisible(createdPostText);
        });
      }
    );

    test(
      'verify SU who is FO of "Manage Home Feed" ACG can edit other users\' Feed posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42190', '@feed-acg-crud'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Standard User who is Functional Owner of "Manage Home Feed" ACG can edit other users\' Feed posts on Home Feed',
          zephyrTestId: 'CONT-42190',
          storyId: 'CONT-42190',
        });

        // ==================== App Manager creates a Feed post (other user's post) ====================
        await test.step('App Manager creates a Feed post on Home Feed', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.assertions.verifyThePageIsLoaded();

          createdPostText = TestDataGenerator.generateRandomText('ABAC Manage Home Feed Test Post', 3, true);
          await appManagerFeedPage.actions.clickShareThoughtsButton();
          const postResult = await appManagerFeedPage.actions.createAndPost({
            text: createdPostText,
          });

          createdPostId = postResult.postId || '';
          await appManagerFeedPage.assertions.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== App Manager adds SU as FO of "Manage Home Feed" ACG ====================
        await test.step('App Manager adds SU as FO of "Manage Home Feed" ACG', async () => {
          featureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(MANAGE_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(MANAGE_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          await featureOwnersPage.featureOwnerModal.addUserAsFeatureOnwer([standardUserFullName]);
        });

        // ==================== SU verifies Edit option is visible on other user's post ====================
        let updatedPostText: string;
        await test.step("SU navigates to Home Feed and verifies Edit option is visible on App Manager's post", async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.assertions.verifyThePageIsLoaded();

          // Verify the post is visible
          await feedPage.assertions.waitForPostToBeVisible(createdPostText);

          // Open options menu on App Manager's post
          await feedPage.actions.openPostOptionsMenu(createdPostText);

          // Verify Edit option is visible (ABAC permission granted)
          await feedPage.assertions.verifyEditOptionVisible(createdPostText);

          await feedPage.actions.openPostOptionsMenu(createdPostText);
        });

        // ==================== SU edits the other user's post ====================
        await test.step("SU edits App Manager's Feed post successfully", async () => {
          updatedPostText = TestDataGenerator.generateRandomText('ABAC Edited Post by FO', 3, true);
          await feedPage.actions.editPost(createdPostText, updatedPostText);

          // Verify the post was updated
          await feedPage.assertions.waitForPostToBeVisible(updatedPostText);
        });

        // ==================== App Manager removes SU as FO ====================
        await test.step('App Manager removes SU as FO from "Manage Home Feed" ACG', async () => {
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(MANAGE_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(MANAGE_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.ASSIGNED);
          await featureOwnersPage.featureOwnerModal.removeUserFromFeatureOwnersList([standardUserFullName]);
        });

        // ==================== Verify SU cannot see Edit option after FO removal ====================
        await test.step('Verify SU cannot see Edit option on Home Feed after FO removal', async () => {
          await feedPage.actions.reloadPageWithTimelineMode();
          await feedPage.assertions.verifyThePageIsLoadedWithTimelineMode();

          // Verify the post is still visible
          await feedPage.assertions.waitForPostToBeVisible(updatedPostText);

          // Open options menu on the post
          await feedPage.actions.openPostOptionsMenu(updatedPostText);

          // Verify Edit option is NOT visible (ABAC permission revoked)
          await feedPage.assertions.verifyEditOptionNotVisible(updatedPostText);
        });
      }
    );

    test(
      'verify SU who is Manager of "Manage Home Feed" ACG can edit other users\' Feed posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42191', '@feed-acg-crud'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Standard User who is Manager of "Manage Home Feed" ACG can edit other users\' Feed posts on Home Feed',
          zephyrTestId: 'CONT-42191',
          storyId: 'CONT-42191',
        });

        let operationPerformed = false;

        // ==================== App Manager creates a Feed post (other user's post) ====================
        await test.step('App Manager creates a Feed post on Home Feed', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.assertions.verifyThePageIsLoaded();

          createdPostText = TestDataGenerator.generateRandomText('ABAC Manager Manage Home Feed Test Post', 3, true);
          await appManagerFeedPage.actions.clickShareThoughtsButton();
          const postResult = await appManagerFeedPage.actions.createAndPost({
            text: createdPostText,
          });

          createdPostId = postResult.postId || '';
          await appManagerFeedPage.assertions.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== App Manager adds SU as Manager of "Manage Home Feed" ACG ====================
        await test.step('App Manager adds SU as Manager of "Manage Home Feed" ACG', async () => {
          acgPage = new AccessControlGroupsPage(appManagerFixture.page);
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(MANAGE_HOME_FEED_FEATURE);
          await acgPage.actions.editACG(MANAGE_HOME_FEED_FEATURE);
          await acgPage.confirmEditACGModal.clickContinueButton();

          // Navigate to Managers section and add user
          const isManagerButtonEnabled = await acgPage.editACGModal.clickOnEditButtonIfEnabled(ACG_EDIT_ASSETS.MANAGER);
          if (isManagerButtonEnabled) {
            await acgPage.editACGModal.verifyTitleOfTheModal('Managers');
            operationPerformed = await acgPage.editACGModal.addUserToList(standardUserFullName);
            await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
          }
          if (operationPerformed) {
            await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
          } else {
            await acgPage.editACGModal.clickCloseButton();
          }
        });

        // ==================== SU verifies Edit option is visible on other user's post ====================
        let updatedPostText: string;
        await test.step("SU navigates to Home Feed and verifies Edit option is visible on App Manager's post", async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.assertions.verifyThePageIsLoaded();

          // Verify the post is visible
          await feedPage.assertions.waitForPostToBeVisible(createdPostText);

          // Open options menu on App Manager's post
          await feedPage.actions.openPostOptionsMenu(createdPostText);

          // Verify Edit option is visible (ABAC permission granted)
          await feedPage.assertions.verifyEditOptionVisible(createdPostText);

          await feedPage.actions.openPostOptionsMenu(createdPostText);
        });

        // ==================== SU edits the other user's post ====================
        await test.step("SU edits App Manager's Feed post successfully", async () => {
          updatedPostText = TestDataGenerator.generateRandomText('ABAC Edited Post by Manager', 3, true);
          await feedPage.actions.editPost(createdPostText, updatedPostText);

          // Verify the post was updated
          await feedPage.assertions.waitForPostToBeVisible(updatedPostText);
        });

        // ==================== App Manager removes SU as Manager from ACG ====================
        await test.step('App Manager removes SU as Manager from "Manage Home Feed" ACG', async () => {
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(MANAGE_HOME_FEED_FEATURE);
          await acgPage.actions.editACG(MANAGE_HOME_FEED_FEATURE);
          await acgPage.confirmEditACGModal.clickContinueButton();

          // Navigate to Managers section and remove user
          await acgPage.editACGModal.clickOnEditButtonOnSummaryScreen(ACG_EDIT_ASSETS.MANAGER);
          await acgPage.editACGModal.verifyTitleOfTheModal('Managers');
          await acgPage.editACGModal.removeUserIfPresentInList(standardUserFullName);
          await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);

          // Save the ACG changes
          await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
        });

        // ==================== Verify SU cannot see Edit option after Manager removal ====================
        await test.step('Verify SU cannot see Edit option on Home Feed after Manager removal', async () => {
          await feedPage.actions.reloadPageWithTimelineMode();
          await feedPage.assertions.verifyThePageIsLoadedWithTimelineMode();

          // Verify the post is still visible
          await feedPage.assertions.waitForPostToBeVisible(updatedPostText);

          // Open options menu on the post
          await feedPage.actions.openPostOptionsMenu(updatedPostText);

          // Verify Edit option is NOT visible (ABAC permission revoked)
          await feedPage.assertions.verifyEditOptionNotVisible(updatedPostText);
        });
      }
    );

    test(
      'verify SU who is Admin of "Manage Home Feed" ACG can edit other users\' Feed posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42192', '@feed-acg-crud'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Standard User who is Admin of "Manage Home Feed" ACG can edit other users\' Feed posts on Home Feed',
          zephyrTestId: 'CONT-42192',
          storyId: 'CONT-42192',
        });

        let operationPerformed = false;

        // ==================== App Manager creates a Feed post (other user's post) ====================
        await test.step('App Manager creates a Feed post on Home Feed', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.verifyThePageIsLoaded();

          createdPostText = TestDataGenerator.generateRandomText('ABAC Admin Manage Home Feed Test Post', 3, true);
          await appManagerFeedPage.actions.clickShareThoughtsButton();
          const postResult = await appManagerFeedPage.actions.createAndPost({
            text: createdPostText,
          });

          createdPostId = postResult.postId || '';
          await appManagerFeedPage.assertions.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== App Manager adds SU as Admin of "Manage Home Feed" ACG ====================
        await test.step('App Manager adds SU as Admin of "Manage Home Feed" ACG', async () => {
          acgPage = new AccessControlGroupsPage(appManagerFixture.page);
          await acgPage.loadPage();
          await acgPage.verifyThePageIsLoaded();

          await acgPage.searchForACG(MANAGE_HOME_FEED_FEATURE);
          await acgPage.editACG(MANAGE_HOME_FEED_FEATURE);
          await acgPage.confirmEditACGModal.clickContinueButton();

          // Navigate to Admins section and add user
          const isAdminButtonEnabled = await acgPage.editACGModal.clickOnEditButtonIfEnabled(ACG_EDIT_ASSETS.ADMIN);
          if (isAdminButtonEnabled) {
            await acgPage.editACGModal.verifyTitleOfTheModal('Admins');
            operationPerformed = await acgPage.editACGModal.addUserToList(standardUserFullName);
            await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
          }
          if (operationPerformed) {
            await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
          } else {
            await acgPage.editACGModal.clickCloseButton();
          }
        });

        // ==================== SU verifies Edit option is visible on other user's post ====================
        let updatedPostText: string;
        await test.step("SU navigates to Home Feed and verifies Edit option is visible on App Manager's post", async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          // Verify the post is visible
          await feedPage.assertions.waitForPostToBeVisible(createdPostText);

          // Open options menu on App Manager's post
          await feedPage.actions.openPostOptionsMenu(createdPostText);

          // Verify Edit option is visible (ABAC permission granted)
          await feedPage.assertions.verifyEditOptionVisible(createdPostText);

          await feedPage.actions.openPostOptionsMenu(createdPostText);
        });

        // ==================== SU edits the other user's post ====================
        await test.step("SU edits App Manager's Feed post successfully", async () => {
          updatedPostText = TestDataGenerator.generateRandomText('ABAC Edited Post by Admin', 3, true);
          await feedPage.actions.editPost(createdPostText, updatedPostText);

          // Verify the post was updated
          await feedPage.assertions.waitForPostToBeVisible(updatedPostText);
        });

        // ==================== App Manager removes SU as Admin from ACG ====================
        await test.step('App Manager removes SU as Admin from "Manage Home Feed" ACG', async () => {
          await acgPage.loadPage();
          await acgPage.verifyThePageIsLoaded();

          await acgPage.searchForACG(MANAGE_HOME_FEED_FEATURE);
          await acgPage.editACG(MANAGE_HOME_FEED_FEATURE);
          await acgPage.confirmEditACGModal.clickContinueButton();

          // Navigate to Admins section and remove user
          await acgPage.editACGModal.clickOnEditButtonOnSummaryScreen(ACG_EDIT_ASSETS.ADMIN);
          await acgPage.editACGModal.verifyTitleOfTheModal('Admins');
          await acgPage.editACGModal.removeUserIfPresentInList(standardUserFullName);
          await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);

          // Save the ACG changes
          await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
        });

        // ==================== Verify SU cannot see Edit option after Admin removal ====================
        await test.step('Verify SU cannot see Edit option on Home Feed after Admin removal', async () => {
          await feedPage.reloadPageWithTimelineMode();
          await feedPage.verifyThePageIsLoadedWithTimelineMode();

          // Verify the post is still visible
          await feedPage.assertions.waitForPostToBeVisible(updatedPostText);

          // Open options menu on the post
          await feedPage.actions.openPostOptionsMenu(updatedPostText);

          // Verify Edit option is NOT visible (ABAC permission revoked)
          await feedPage.assertions.verifyEditOptionNotVisible(updatedPostText);
        });
      }
    );

    test(
      "verify FO can edit and remove limit visibility of End User's restricted Home Feed post",
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42183', '@feed-acg-crud'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Feature Owner of "Manage Home Feed" ACG can edit End User\'s restricted Home Feed post and remove the limit visibility restriction',
          zephyrTestId: 'CONT-42183',
          storyId: 'CONT-42183',
        });

        let endUserPostText: string;
        let endUserPostId: string = '';

        // ==================== Add End User as FO of "Post In Home Feed" ACG ====================
        await test.step('App Manager adds End User as FO of "Post In Home Feed" ACG', async () => {
          featureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          await featureOwnersPage.featureOwnerModal.addUserAsFeatureOnwer([standardUserFullName]);
        });

        // ==================== End User creates Feed post with limit visibility ====================
        await test.step('End User creates Feed post with Limit visibility restricted to Engineering audience', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.assertions.verifyThePageIsLoaded();

          await feedPage.assertions.verifyFeedSectionIsVisible();

          endUserPostText = TestDataGenerator.generateRandomText('ABAC Restricted Visibility Post', 3, true);
          await feedPage.actions.clickShareThoughtsButton();

          const postResult = await feedPage.actions.createAndPostWithLimitVisibility({
            text: endUserPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          endUserPostId = postResult.postId || '';
          createdPostId = endUserPostId;
          await feedPage.assertions.waitForPostToBeVisible(postResult.postText);

          await feedPage.assertions.verifyPostHasLimitVisibility(endUserPostText);
        });

        // ==================== Remove End User as FO, Add SU as FO of "Manage Home Feed" ====================
        await test.step('Remove End User as FO of "Post In Home Feed" and add as FO of "Manage Home Feed"', async () => {
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.ASSIGNED);
          await featureOwnersPage.featureOwnerModal.removeUserFromFeatureOwnersList([standardUserFullName]);

          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(MANAGE_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(MANAGE_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          await featureOwnersPage.featureOwnerModal.addUserAsFeatureOnwer([standardUserFullName]);
        });

        // ==================== FO navigates to Home Feed and locates restricted post ====================
        await test.step('FO navigates to Home Feed and locates the restricted post', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();

          await feedPage.reloadPage();
          await feedPage.assertions.verifyThePageIsLoaded();

          await feedPage.assertions.waitForPostToBeVisible(endUserPostText);
        });

        // ==================== FO clicks more options menu and selects Edit ====================
        await test.step('FO clicks on more options menu and selects Edit - Edit Feed Post form opens successfully', async () => {
          await feedPage.actions.openPostOptionsMenu(endUserPostText);

          await feedPage.actions.clickEditOption();

          await feedPage.assertions.verifyEditorVisible();
        });

        // ==================== FO turns OFF limit visibility, updates content and clicks Update ====================
        let updatedPostText: string;
        await test.step('FO turns OFF Limit visibility toggle, updates post content and clicks Update', async () => {
          updatedPostText = TestDataGenerator.generateRandomText('ABAC Edited Unrestricted Post', 3, true);

          await feedPage.actions.toggleLimitVisibility();

          await feedPage.actions.updatePostText(updatedPostText);

          await feedPage.actions.clickUpdateButton();
        });

        // ==================== Verify post updated successfully with restriction removed ====================
        await test.step('Verify post is updated successfully, limit visibility removed, and visible to default audience', async () => {
          await feedPage.assertions.waitForPostToBeVisible(updatedPostText);

          await feedPage.assertions.verifyPostDoesNotHaveLimitVisibility(updatedPostText);
        });

        // ==================== Cleanup: Remove FO assignment ====================
        await test.step('Cleanup: Remove End User as FO from "Manage Home Feed" ACG', async () => {
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(MANAGE_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(MANAGE_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.ASSIGNED);
          await featureOwnersPage.featureOwnerModal.removeUserFromFeatureOwnersList([standardUserFullName]);
        });
      }
    );

    test(
      "verify FO can edit End User's restricted Home Feed post and change audience from Engineering to UX team",
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42184', '@feed-acg-crud'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Feature Owner of "Manage Home Feed" ACG can edit End User\'s restricted Home Feed post and change the audience from Engineering to UX team',
          zephyrTestId: 'CONT-42184',
          storyId: 'CONT-42184',
        });

        let suPostText: string;
        let suPostId: string = '';

        // ==================== Add SU as FO of "Post In Home Feed" ACG ====================
        await test.step('App Manager adds SU as FO of "Post In Home Feed" ACG', async () => {
          featureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          await featureOwnersPage.featureOwnerModal.addUserAsFeatureOnwer([standardUserFullName]);
        });

        // ==================== SU creates Feed post with limit visibility to Engineering ====================
        await test.step('SU creates Feed post with Limit visibility restricted to Engineering audience and verifies post is visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.assertions.verifyThePageIsLoaded();

          await feedPage.assertions.verifyFeedSectionIsVisible();

          suPostText = TestDataGenerator.generateRandomText('ABAC Restricted Engineering Post', 3, true);
          await feedPage.actions.clickShareThoughtsButton();

          const postResult = await feedPage.actions.createAndPostWithLimitVisibility({
            text: suPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          suPostId = postResult.postId || '';
          createdPostId = suPostId;
          await feedPage.assertions.waitForPostToBeVisible(postResult.postText);

          await feedPage.assertions.verifyPostHasLimitVisibility(suPostText);
        });

        // ==================== App Manager (FO of Manage Home Feed) edits post and changes audience to UX ====================
        await test.step('App Manager navigates to Home Feed and locates the restricted post', async () => {
          await appManagerFixture.navigationHelper.clickOnHomeButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.reloadPage();
          await appManagerFeedPage.assertions.verifyThePageIsLoaded();

          await appManagerFeedPage.assertions.waitForPostToBeVisible(suPostText);

          await appManagerFeedPage.actions.openPostOptionsMenu(suPostText);
          await appManagerFeedPage.actions.clickEditOption();
          await appManagerFeedPage.assertions.verifyEditorVisible();

          await appManagerFeedPage.actions.changeAudience('UX');
          await appManagerFeedPage.actions.clickUpdateButton();

          await appManagerFeedPage.assertions.waitForPostToBeVisible(suPostText);
          await appManagerFeedPage.assertions.verifyPostHasLimitVisibility(suPostText);
        });

        // ==================== Reload SU home page and verify post is NOT visible ====================
        await test.step('Reload SU Home Feed and verify post is NOT visible (audience changed to UX)', async () => {
          await feedPage.reloadPage();
          await feedPage.assertions.verifyThePageIsLoaded();

          await feedPage.assertions.verifyPostIsNotVisible(suPostText);
        });

        // ==================== Cleanup: Remove SU as FO from "Post In Home Feed" ACG ====================
        await test.step('Cleanup: Remove SU as FO from "Post In Home Feed" ACG', async () => {
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.ASSIGNED);
          await featureOwnersPage.featureOwnerModal.removeUserFromFeatureOwnersList([standardUserFullName]);
        });
      }
    );

    test(
      'verify favorited Home Feed post becomes invisible when FO changes audience from Engineering to UX',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42185', '@feed-acg-crud'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify favorited Home Feed post becomes invisible to End User and removed from Favorites when FO changes audience from Engineering to UX',
          zephyrTestId: 'CONT-42185',
          storyId: 'CONT-42185',
        });

        let suPostText: string;
        let suPostId: string = '';

        // ==================== Add SU as FO of "Post In Home Feed" ACG ====================
        await test.step('App Manager adds SU as FO of "Post In Home Feed" ACG', async () => {
          featureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          await featureOwnersPage.featureOwnerModal.addUserAsFeatureOnwer([standardUserFullName]);
        });

        // ==================== SU creates Feed post with limit visibility to Engineering ====================
        await test.step('SU creates Feed post with Limit visibility restricted to Engineering audience', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.assertions.verifyThePageIsLoaded();

          await feedPage.assertions.verifyFeedSectionIsVisible();

          suPostText = TestDataGenerator.generateRandomText('ABAC Favorited Engineering Post', 3, true);
          await feedPage.actions.clickShareThoughtsButton();

          const postResult = await feedPage.actions.createAndPostWithLimitVisibility({
            text: suPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          suPostId = postResult.postId || '';
          createdPostId = suPostId;
          await feedPage.assertions.waitForPostToBeVisible(postResult.postText);

          await feedPage.assertions.verifyPostHasLimitVisibility(suPostText);
        });

        // ==================== SU favorites the post ====================
        await test.step('SU favorites the post and verifies it is favorited', async () => {
          await feedPage.actions.markPostAsFavourite();
          await feedPage.assertions.verifyPostIsFavorited(suPostText);
        });

        // ==================== App Manager (FO of Manage Home Feed) edits post and changes audience to UX ====================
        await test.step('App Manager edits post and changes audience from Engineering to UX', async () => {
          await appManagerFixture.navigationHelper.clickOnHomeButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.reloadPage();
          await appManagerFeedPage.assertions.verifyThePageIsLoaded();

          await appManagerFeedPage.assertions.waitForPostToBeVisible(suPostText);

          await appManagerFeedPage.actions.openPostOptionsMenu(suPostText);
          await appManagerFeedPage.actions.clickEditOption();
          await appManagerFeedPage.assertions.verifyEditorVisible();

          await appManagerFeedPage.actions.changeAudience('UX');
          await appManagerFeedPage.actions.clickUpdateButton();

          await appManagerFeedPage.assertions.waitForPostToBeVisible(suPostText);
          await appManagerFeedPage.assertions.verifyPostHasLimitVisibility(suPostText);
        });

        // ==================== Reload SU home page and verify post is NOT visible ====================
        await test.step('Reload SU Home Feed and verify post is NOT visible (audience changed to UX)', async () => {
          await feedPage.reloadPage();
          await feedPage.assertions.verifyThePageIsLoaded();

          await feedPage.assertions.verifyPostIsNotVisible(suPostText);
        });

        // ==================== Filter by Favourited and verify post is NOT in list ====================
        await test.step('SU filters by Favourited posts and verifies post is NOT in Favorites list', async () => {
          await feedPage.actions.clickOnShowOption('favourited');

          await feedPage.assertions.verifyPostIsNotVisible(suPostText);

          await feedPage.actions.clickOnShowOption('all');
        });

        // ==================== Cleanup: Remove SU as FO from "Post In Home Feed" ACG ====================
        await test.step('Cleanup: Remove SU as FO from "Post In Home Feed" ACG', async () => {
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.ASSIGNED);
          await featureOwnersPage.featureOwnerModal.removeUserFromFeatureOwnersList([standardUserFullName]);
        });
      }
    );

    test(
      'verify SU can edit only their own Feed Posts (without Limited Visibility) on Home Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42187', '@feed-acg-crud'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            "ABAC: Verify Standard User can edit their own Feed post but cannot edit other users' Feed posts on Home Feed",
          zephyrTestId: 'CONT-42187',
          storyId: 'CONT-42187',
        });

        let appManagerPostText: string;
        let suPostText: string;
        // ==================== Add SU as FO of "Post In Home Feed" ACG ====================
        await test.step('App Manager adds SU as FO of "Post In Home Feed" ACG', async () => {
          featureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          await featureOwnersPage.featureOwnerModal.addUserAsFeatureOnwer([standardUserFullName]);
        });

        // ==================== App Manager creates a Feed post ====================
        await test.step('App Manager creates a Feed post on Home Feed', async () => {
          await appManagerFixture.navigationHelper.clickOnHomeButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.reloadPage();
          await appManagerFeedPage.assertions.verifyThePageIsLoaded();

          appManagerPostText = TestDataGenerator.generateRandomText('App Manager Post for Ownership Test', 3, true);
          await appManagerFeedPage.actions.clickShareThoughtsButton();

          const postResult = await appManagerFeedPage.actions.createAndPost({
            text: appManagerPostText,
          });

          createdPostId = postResult.postId || '';
          await appManagerFeedPage.assertions.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== SU creates their own Feed post (without Limited Visibility) ====================
        await test.step('SU creates their own Feed post without Limited Visibility', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.assertions.verifyThePageIsLoaded();

          suPostText = TestDataGenerator.generateRandomText('SU Own Post for Edit Test', 3, true);
          await feedPage.actions.clickShareThoughtsButton();

          const postResult = await feedPage.actions.createAndPost({
            text: suPostText,
          });

          await feedPage.assertions.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== SU verifies Edit option IS visible on own post ====================
        await test.step('SU verifies Edit option is visible on their own post', async () => {
          await feedPage.actions.openPostOptionsMenu(suPostText);
          await feedPage.assertions.verifyEditOptionVisible(suPostText);
        });

        // ==================== SU edits their own post successfully ====================
        let updatedSuPostText: string;
        await test.step('SU edits their own post successfully', async () => {
          updatedSuPostText = TestDataGenerator.generateRandomText('SU Edited Own Post', 3, true);

          await feedPage.actions.openPostOptionsMenu(suPostText);
          await feedPage.actions.editPost(suPostText, updatedSuPostText);

          await feedPage.assertions.waitForPostToBeVisible(updatedSuPostText);

          await feedPage.actions.deletePost(updatedSuPostText);
        });

        // ==================== SU verifies Edit option is NOT visible on App Manager's post ====================
        await test.step("SU verifies Edit option is NOT visible on App Manager's post", async () => {
          await feedPage.actions.reloadPage();
          await feedPage.assertions.waitForPostToBeVisible(appManagerPostText);

          await feedPage.actions.openPostOptionsMenu(appManagerPostText);

          await feedPage.assertions.verifyEditOptionNotVisible(appManagerPostText);
        });

        // ==================== Cleanup: Remove SU as FO from "Post In Home Feed" ACG ====================
        await test.step('Cleanup: Remove SU as FO from "Post In Home Feed" ACG', async () => {
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.ASSIGNED);
          await featureOwnersPage.featureOwnerModal.removeUserFromFeatureOwnersList([standardUserFullName]);
        });
      }
    );
  }
);
