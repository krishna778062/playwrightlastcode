import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { tagTest } from '@/src/core/utils/testDecorator';
import { FeedPostingPermission } from '@/src/modules/content/constants/feedPostingPermission';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { ShareComponent } from '@/src/modules/content/ui/components/shareComponent';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { ManageSitePage } from '@/src/modules/content/ui/pages/manageSitePage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';
import { ACG_EDIT_ASSETS } from '@/src/modules/platforms/constants/acg';
import { FEATURE_OWNERS_TABS_OPTIONS } from '@/src/modules/platforms/constants/featureOwners';
import { POPUP_BUTTONS } from '@/src/modules/platforms/constants/popupButtons';
import { AccessControlGroupsPage } from '@/src/modules/platforms/ui/pages/abacPage/acgPage/accessControlGroupsPage';
import { FeatureOwnersPage } from '@/src/modules/platforms/ui/pages/abacPage/featureOwnersPage/featureOwnersPage';

const POST_IN_HOME_FEED_SYSTEM_ACG = 'Post in home feed | All org';
const POST_IN_HOME_FEED_CUSTOM_ACG = 'Post in home feed | Engineering';
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42178', '@FO-feed'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Standard User who is Feature Owner of "Post In Home Feed" ACG can view and use the Feed Post creation form on Home Feed',
          zephyrTestId: 'CONT-42178',
          storyId: 'CONT-42178',
        });

        // ==================== Ensure SU is NOT a Manager/Admin of "Post In Home Feed" ACG ====================
        await test.step('Pre-requisite: Ensure SU is not a Manager/Admin of "Post In Home Feed" ACG', async () => {
          acgPage = new AccessControlGroupsPage(appManagerFixture.page);
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_SYSTEM_ACG);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_SYSTEM_ACG);
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
          await feedPage.verifyThePageIsLoaded();

          // Verify SU can view Feed Post creation form
          await feedPage.verifyFeedSectionIsVisible();

          // SU creates a Feed post
          const postText = TestDataGenerator.generateRandomText('ABAC FO Home Feed Post', 3, true);
          await feedPage.clickShareThoughtsButton();
          const postResult = await feedPage.postEditor.createAndPost({
            text: postText,
          });
          createdPostId = postResult.postId || '';
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);
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
          await feedPage.reloadPageWithTimelineMode();
          await feedPage.verifyFeedSectionIsNotVisible();
        });
      }
    );

    test(
      'verify SU who is Admin of "Post In Home Feed" ACG can view Feed form and create posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42179', '@FO-feed'],
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

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_SYSTEM_ACG);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_SYSTEM_ACG);
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

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_SYSTEM_ACG);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_SYSTEM_ACG);
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
          await feedPage.verifyThePageIsLoaded();

          // Verify SU can view Feed Post creation form
          await feedPage.verifyFeedSectionIsVisible();

          // SU creates a Feed post
          const postText = TestDataGenerator.generateRandomText('ABAC Admin Home Feed Post', 3, true);
          await feedPage.clickShareThoughtsButton();
          const postResult = await feedPage.postEditor.createAndPost({
            text: postText,
          });

          createdPostId = postResult.postId || '';
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== App Manager removes SU as Admin from ACG ====================
        await test.step('App Manager removes SU as Admin from "Post In Home Feed" ACG', async () => {
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_SYSTEM_ACG);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_SYSTEM_ACG);
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
          await feedPage.reloadPageWithTimelineMode();
          await feedPage.verifyFeedSectionIsNotVisible();
        });
      }
    );

    test(
      'verify SU who is Manager of "Post In Home Feed" ACG can view Feed form and create posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42180', '@FO-feed'],
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

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_SYSTEM_ACG);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_SYSTEM_ACG);
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

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_SYSTEM_ACG);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_SYSTEM_ACG);
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
          await feedPage.verifyThePageIsLoaded();

          // Verify SU can view Feed Post creation form
          await feedPage.verifyFeedSectionIsVisible();

          // SU creates a Feed post
          const postText = TestDataGenerator.generateRandomText('ABAC Manager Home Feed Post', 3, true);
          await feedPage.clickShareThoughtsButton();
          const postResult = await feedPage.postEditor.createAndPost({
            text: postText,
          });

          createdPostId = postResult.postId || '';
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== App Manager removes SU as Manager from ACG ====================
        await test.step('App Manager removes SU as Manager from "Post In Home Feed" ACG', async () => {
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_SYSTEM_ACG);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_SYSTEM_ACG);
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
          await feedPage.reloadPageWithTimelineMode();
          await feedPage.verifyFeedSectionIsNotVisible();
        });
      }
    );

    test(
      'verify SU who is only in Target Audience of "Post In Home Feed" ACG cannot create Feed Post',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42181', '@FO-feed'],
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

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_SYSTEM_ACG);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_SYSTEM_ACG);
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
          await feedPage.reloadPageWithTimelineMode();
          await feedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // SU should NOT be able to view Feed Post creation form
          await feedPage.verifyFeedSectionIsNotVisible();
        });
      }
    );

    test(
      'verify FO can edit their own Home Feed Post',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42182', '@FO-feed'],
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
          await feedPage.verifyThePageIsLoaded();

          // Verify FO can view Feed Post creation form
          await feedPage.verifyFeedSectionIsVisible();

          // FO creates a Feed post
          postText = TestDataGenerator.generateRandomText('ABAC FO Own Post', 3, true);
          await feedPage.clickShareThoughtsButton();
          const postResult = await feedPage.postEditor.createAndPost({
            text: postText,
          });

          createdPostId = postResult.postId || '';
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== FO edits their own post ====================
        let updatedPostText: string;
        await test.step('FO edits their own Feed post successfully', async () => {
          updatedPostText = TestDataGenerator.generateRandomText('ABAC FO Edited Own Post', 3, true);

          // Open options menu on FO's own post
          await feedPage.feedList.openPostOptionsMenu(postText);

          // Verify Edit option is visible for own post
          await feedPage.feedList.verifyEditOptionVisible(postText);

          await feedPage.feedList.openPostOptionsMenu(postText);

          // Edit the post
          await feedPage.postEditor.editPost(postText, updatedPostText);

          // Verify the post was updated successfully
          await feedPage.feedList.waitForPostToBeVisible(updatedPostText);
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42189', '@FO-feed'],
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
          await appManagerFixture.navigationHelper.clickOnHomeIconButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.verifyThePageIsLoaded();

          createdPostText = TestDataGenerator.generateRandomText('ABAC Baseline Edit Restriction Test Post', 3, true);
          await appManagerFeedPage.clickShareThoughtsButton();
          const postResult = await appManagerFeedPage.postEditor.createAndPost({
            text: createdPostText,
          });

          createdPostId = postResult.postId || '';
          await appManagerFeedPage.feedList.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== SU verifies Edit option is NOT visible on other user's post ====================
        await test.step("SU navigates to Home Feed and verifies Edit option is NOT visible on App Manager's post", async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPageWithTimelineMode();
          await feedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the post is visible
          await feedPage.feedList.waitForPostToBeVisible(createdPostText);

          // Open options menu on App Manager's post
          await feedPage.feedList.openPostOptionsMenu(createdPostText);

          // Verify Edit option is NOT visible (SU has no ABAC permission to edit other users' posts)
          await feedPage.feedList.verifyEditOptionNotVisible(createdPostText);
        });
      }
    );

    test(
      'verify SU who is FO of "Manage Home Feed" ACG can edit other users\' Feed posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42190', '@FO-feed'],
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
          await appManagerFeedPage.verifyThePageIsLoaded();

          createdPostText = TestDataGenerator.generateRandomText('ABAC Manage Home Feed Test Post', 3, true);
          await appManagerFeedPage.clickShareThoughtsButton();
          const postResult = await appManagerFeedPage.postEditor.createAndPost({
            text: createdPostText,
          });

          createdPostId = postResult.postId || '';
          await appManagerFeedPage.feedList.waitForPostToBeVisible(postResult.postText);
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
          await feedPage.verifyThePageIsLoaded();

          // Verify the post is visible
          await feedPage.feedList.waitForPostToBeVisible(createdPostText);

          // Open options menu on App Manager's post
          await feedPage.feedList.openPostOptionsMenu(createdPostText);

          // Verify Edit option is visible (ABAC permission granted)
          await feedPage.feedList.verifyEditOptionVisible(createdPostText);

          await feedPage.feedList.openPostOptionsMenu(createdPostText);
        });

        // ==================== SU edits the other user's post ====================
        await test.step("SU edits App Manager's Feed post successfully", async () => {
          updatedPostText = TestDataGenerator.generateRandomText('ABAC Edited Post by FO', 3, true);
          await feedPage.postEditor.editPost(createdPostText, updatedPostText);

          // Verify the post was updated
          await feedPage.feedList.waitForPostToBeVisible(updatedPostText);
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
          await feedPage.reloadPageWithTimelineMode();
          await feedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the post is still visible
          await feedPage.feedList.waitForPostToBeVisible(updatedPostText);

          // Open options menu on the post
          await feedPage.feedList.openPostOptionsMenu(updatedPostText);

          // Verify Edit option is NOT visible (ABAC permission revoked)
          await feedPage.feedList.verifyEditOptionNotVisible(updatedPostText);
        });
      }
    );

    test(
      'verify SU who is Manager of "Manage Home Feed" ACG can edit other users\' Feed posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42191', '@FO-feed'],
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
          await appManagerFeedPage.verifyThePageIsLoaded();

          createdPostText = TestDataGenerator.generateRandomText('ABAC Manager Manage Home Feed Test Post', 3, true);
          await appManagerFeedPage.clickShareThoughtsButton();
          const postResult = await appManagerFeedPage.postEditor.createAndPost({
            text: createdPostText,
          });

          createdPostId = postResult.postId || '';
          await appManagerFeedPage.feedList.waitForPostToBeVisible(postResult.postText);
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
          await feedPage.verifyThePageIsLoaded();

          // Verify the post is visible
          await feedPage.feedList.waitForPostToBeVisible(createdPostText);

          // Open options menu on App Manager's post
          await feedPage.feedList.openPostOptionsMenu(createdPostText);

          // Verify Edit option is visible (ABAC permission granted)
          await feedPage.feedList.verifyEditOptionVisible(createdPostText);

          await feedPage.feedList.openPostOptionsMenu(createdPostText);
        });

        // ==================== SU edits the other user's post ====================
        await test.step("SU edits App Manager's Feed post successfully", async () => {
          updatedPostText = TestDataGenerator.generateRandomText('ABAC Edited Post by Manager', 3, true);
          await feedPage.postEditor.editPost(createdPostText, updatedPostText);

          // Verify the post was updated
          await feedPage.feedList.waitForPostToBeVisible(updatedPostText);
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
          await feedPage.reloadPageWithTimelineMode();
          await feedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the post is still visible
          await feedPage.feedList.waitForPostToBeVisible(updatedPostText);

          // Open options menu on the post
          await feedPage.feedList.openPostOptionsMenu(updatedPostText);

          // Verify Edit option is NOT visible (ABAC permission revoked)
          await feedPage.feedList.verifyEditOptionNotVisible(updatedPostText);
        });
      }
    );

    test(
      'verify SU who is Admin of "Manage Home Feed" ACG can edit other users\' Feed posts',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42192', '@FO-feed'],
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
          await appManagerFeedPage.clickShareThoughtsButton();
          const postResult = await appManagerFeedPage.postEditor.createAndPost({
            text: createdPostText,
          });

          createdPostId = postResult.postId || '';
          await appManagerFeedPage.feedList.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== App Manager adds SU as Admin of "Manage Home Feed" ACG ====================
        await test.step('App Manager adds SU as Admin of "Manage Home Feed" ACG', async () => {
          acgPage = new AccessControlGroupsPage(appManagerFixture.page);
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(MANAGE_HOME_FEED_FEATURE);
          await acgPage.actions.editACG(MANAGE_HOME_FEED_FEATURE);
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
          await feedPage.feedList.waitForPostToBeVisible(createdPostText);

          // Open options menu on App Manager's post
          await feedPage.feedList.openPostOptionsMenu(createdPostText);

          // Verify Edit option is visible (ABAC permission granted)
          await feedPage.feedList.verifyEditOptionVisible(createdPostText);

          await feedPage.feedList.openPostOptionsMenu(createdPostText);
        });

        // ==================== SU edits the other user's post ====================
        await test.step("SU edits App Manager's Feed post successfully", async () => {
          updatedPostText = TestDataGenerator.generateRandomText('ABAC Edited Post by Admin', 3, true);
          await feedPage.postEditor.editPost(createdPostText, updatedPostText);

          // Verify the post was updated
          await feedPage.feedList.waitForPostToBeVisible(updatedPostText);
        });

        // ==================== App Manager removes SU as Admin from ACG ====================
        await test.step('App Manager removes SU as Admin from "Manage Home Feed" ACG', async () => {
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(MANAGE_HOME_FEED_FEATURE);
          await acgPage.actions.editACG(MANAGE_HOME_FEED_FEATURE);
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
          await feedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the post is still visible
          await feedPage.feedList.waitForPostToBeVisible(updatedPostText);

          // Open options menu on the post
          await feedPage.feedList.openPostOptionsMenu(updatedPostText);

          // Verify Edit option is NOT visible (ABAC permission revoked)
          await feedPage.feedList.verifyEditOptionNotVisible(updatedPostText);
        });
      }
    );

    test(
      "verify FO can edit and remove limit visibility of End User's restricted Home Feed post",
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42183', '@FO-feed'],
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
          await feedPage.verifyThePageIsLoaded();

          await feedPage.verifyFeedSectionIsVisible();

          endUserPostText = TestDataGenerator.generateRandomText('ABAC Restricted Visibility Post', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.createAndPostWithLimitVisibility({
            text: endUserPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          endUserPostId = postResult.postId || '';
          createdPostId = endUserPostId;
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);

          await feedPage.postEditor.verifyPostHasLimitVisibility(endUserPostText);
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
          await feedPage.verifyThePageIsLoaded();

          await feedPage.feedList.waitForPostToBeVisible(endUserPostText);
        });

        // ==================== FO clicks more options menu and selects Edit ====================
        await test.step('FO clicks on more options menu and selects Edit - Edit Feed Post form opens successfully', async () => {
          await feedPage.feedList.openPostOptionsMenu(endUserPostText);

          await feedPage.postEditor.clickEditOption();

          await feedPage.postEditor.verifyEditorVisible();
        });

        // ==================== FO turns OFF limit visibility, updates content and clicks Update ====================
        let updatedPostText: string;
        await test.step('FO turns OFF Limit visibility toggle, updates post content and clicks Update', async () => {
          updatedPostText = TestDataGenerator.generateRandomText('ABAC Edited Unrestricted Post', 3, true);

          await feedPage.toggleLimitVisibility();

          await feedPage.postEditor.updatePostText(updatedPostText);

          await feedPage.postEditor.clickUpdateButton();
        });

        // ==================== Verify post updated successfully with restriction removed ====================
        await test.step('Verify post is updated successfully, limit visibility removed, and visible to default audience', async () => {
          await feedPage.feedList.waitForPostToBeVisible(updatedPostText);

          await feedPage.postEditor.verifyPostDoesNotHaveLimitVisibility(updatedPostText);
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42184', '@FO-feed'],
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
          await feedPage.verifyThePageIsLoaded();

          await feedPage.verifyFeedSectionIsVisible();

          suPostText = TestDataGenerator.generateRandomText('ABAC Restricted Engineering Post', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.createAndPostWithLimitVisibility({
            text: suPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          suPostId = postResult.postId || '';
          createdPostId = suPostId;
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);

          await feedPage.postEditor.verifyPostHasLimitVisibility(suPostText);
        });

        // ==================== App Manager (FO of Manage Home Feed) edits post and changes audience to UX ====================
        await test.step('App Manager navigates to Home Feed and locates the restricted post', async () => {
          await appManagerFixture.navigationHelper.clickOnHomeIconButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.reloadPage();
          await appManagerFeedPage.verifyThePageIsLoaded();

          await appManagerFeedPage.feedList.waitForPostToBeVisible(suPostText);

          await appManagerFeedPage.feedList.openPostOptionsMenu(suPostText);
          await appManagerFeedPage.postEditor.clickEditOption();
          await appManagerFeedPage.postEditor.verifyEditorVisible();

          await appManagerFeedPage.postEditor.changeAudience('UX');
          await appManagerFeedPage.postEditor.clickUpdateButton();

          await appManagerFeedPage.feedList.waitForPostToBeVisible(suPostText);
          await appManagerFeedPage.postEditor.verifyPostHasLimitVisibility(suPostText);
        });

        // ==================== Reload SU home page and verify post is NOT visible ====================
        await test.step('Reload SU Home Feed and verify post is NOT visible (audience changed to UX)', async () => {
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          await feedPage.feedList.verifyPostIsNotVisible(suPostText);
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42185', '@FO-feed'],
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
          await feedPage.verifyThePageIsLoaded();

          await feedPage.verifyFeedSectionIsVisible();

          suPostText = TestDataGenerator.generateRandomText('ABAC Favorited Engineering Post', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.createAndPostWithLimitVisibility({
            text: suPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          suPostId = postResult.postId || '';
          createdPostId = suPostId;
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);

          await feedPage.postEditor.verifyPostHasLimitVisibility(suPostText);
        });

        // ==================== SU favorites the post ====================
        await test.step('SU favorites the post and verifies it is favorited', async () => {
          await feedPage.feedList.markPostAsFavourite();
          await feedPage.feedList.verifyPostIsFavorited(suPostText);
        });

        // ==================== App Manager (FO of Manage Home Feed) edits post and changes audience to UX ====================
        await test.step('App Manager edits post and changes audience from Engineering to UX', async () => {
          await appManagerFixture.navigationHelper.clickOnHomeIconButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.reloadPage();
          await appManagerFeedPage.verifyThePageIsLoaded();

          await appManagerFeedPage.feedList.waitForPostToBeVisible(suPostText);

          await appManagerFeedPage.feedList.openPostOptionsMenu(suPostText);
          await appManagerFeedPage.postEditor.clickEditOption();
          await appManagerFeedPage.postEditor.verifyEditorVisible();

          await appManagerFeedPage.postEditor.changeAudience('UX');
          await appManagerFeedPage.postEditor.clickUpdateButton();

          await appManagerFeedPage.feedList.waitForPostToBeVisible(suPostText);
          await appManagerFeedPage.postEditor.verifyPostHasLimitVisibility(suPostText);
        });

        // ==================== Reload SU home page and verify post is NOT visible ====================
        await test.step('Reload SU Home Feed and verify post is NOT visible (audience changed to UX)', async () => {
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          await feedPage.feedList.verifyPostIsNotVisible(suPostText);
        });

        // ==================== Filter by Favourited and verify post is NOT in list ====================
        await test.step('SU filters by Favourited posts and verifies post is NOT in Favorites list', async () => {
          await feedPage.clickOnShowOption('favourited');

          await feedPage.feedList.verifyPostIsNotVisible(suPostText);

          await feedPage.clickOnShowOption('all');
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
      'verify FO can mention user outside audience in restricted post - mention shows as plain text',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42186', '@FO-feed'],
      },
      async ({ appManagerFixture, appManagerApiFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify when FO mentions a user outside restricted audience, mention is rendered as plain text and mentioned user cannot see the post',
          zephyrTestId: 'CONT-42186',
          storyId: 'CONT-42186',
        });

        let suPostText: string;
        let socialCampaignManagerFullName: string;

        // ==================== Get Site Manager full name (user outside Engineering audience) ====================
        await test.step('Get Site Manager full name for mention', async () => {
          const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
            users.socialCampaignManager.email
          );
          socialCampaignManagerFullName = userInfo.fullName;
        });

        // ==================== App Manager creates Feed post with limit visibility to Engineering ====================
        await test.step('App Manager creates Feed post with Limit visibility restricted to Engineering audience', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          suPostText = TestDataGenerator.generateRandomText('ABAC Mention Outside Audience Post', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.createAndPostWithLimitVisibility({
            text: suPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          createdPostId = postResult.postId || '';
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);
          await feedPage.postEditor.verifyPostHasLimitVisibility(suPostText);
        });

        // ==================== App Manager (FO) edits post and mentions user outside audience ====================
        let updatedPostText: string;
        await test.step('App Manager edits post and mentions Social Campaign Manager(endUser2) (user outside Engineering audience)', async () => {
          await feedPage.feedList.openPostOptionsMenu(suPostText);
          await feedPage.postEditor.clickEditOption();
          await feedPage.postEditor.verifyEditorVisible();

          updatedPostText = TestDataGenerator.generateRandomText('ABAC Mention Outside Audience Updated', 3, true);
          await feedPage.postEditor.updatePostText(updatedPostText);
          await feedPage.postEditor.addUserNameMention(socialCampaignManagerFullName);
          await feedPage.postEditor.clickUpdateButton();

          await feedPage.feedList.waitForPostToBeVisible(updatedPostText);
        });

        // ==================== Verify mention is rendered as plain text (not clickable) ====================
        await test.step('Verify mention is rendered as plain text (not a clickable link)', async () => {
          await feedPage.feedList.verifyMentionIsPlainText(updatedPostText, socialCampaignManagerFullName);
        });

        // ==================== Social Campaign Manager(endUser2) navigates to Home Feed - verify post is NOT visible ====================
        await test.step('Social Campaign Manager(endUser2) navigates to Home Feed and verifies post is NOT visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();
          const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await socialCampaignManagerFeedPage.reloadPageWithTimelineMode();
          await socialCampaignManagerFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          await socialCampaignManagerFeedPage.feedList.verifyPostIsNotVisible(updatedPostText);
        });

        // ==================== Social Campaign Manager(endUser2) checks notifications - no mention notification ====================
        await test.step('Social Campaign Manager(endUser2) verifies NO notification received for mention', async () => {
          const notificationComponent = await socialCampaignManagerFixture.navigationHelper.clickOnBellIcon();
          const activityNotificationPage = await notificationComponent.clickOnViewAllNotifications();

          await activityNotificationPage.verifyNotificationDoesNotExist(updatedPostText);
        });
      }
    );

    test(
      'verify SU can edit only their own Feed Posts (without Limited Visibility) on Home Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42187', '@FO-feed'],
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
          await appManagerFixture.navigationHelper.clickOnHomeIconButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.reloadPage();
          await appManagerFeedPage.verifyThePageIsLoaded();

          appManagerPostText = TestDataGenerator.generateRandomText('App Manager Post for Ownership Test', 3, true);
          await appManagerFeedPage.clickShareThoughtsButton();

          const postResult = await appManagerFeedPage.postEditor.createAndPost({
            text: appManagerPostText,
          });

          createdPostId = postResult.postId || '';
          await appManagerFeedPage.feedList.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== SU creates their own Feed post (without Limited Visibility) ====================
        await test.step('SU creates their own Feed post without Limited Visibility', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          suPostText = TestDataGenerator.generateRandomText('SU Own Post for Edit Test', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.postEditor.createAndPost({
            text: suPostText,
          });

          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== SU verifies Edit option IS visible on own post ====================
        await test.step('SU verifies Edit option is visible on their own post', async () => {
          await feedPage.feedList.openPostOptionsMenu(suPostText);
          await feedPage.feedList.verifyEditOptionVisible(suPostText);
        });

        // ==================== SU edits their own post successfully ====================
        let updatedSuPostText: string;
        await test.step('SU edits their own post successfully', async () => {
          updatedSuPostText = TestDataGenerator.generateRandomText('SU Edited Own Post', 3, true);

          await feedPage.feedList.openPostOptionsMenu(suPostText);
          await feedPage.postEditor.editPost(suPostText, updatedSuPostText);

          await feedPage.feedList.waitForPostToBeVisible(updatedSuPostText);

          await feedPage.deletePost(updatedSuPostText);
        });

        // ==================== SU verifies Edit option is NOT visible on App Manager's post ====================
        await test.step("SU verifies Edit option is NOT visible on App Manager's post", async () => {
          await feedPage.reloadPage();
          await feedPage.feedList.waitForPostToBeVisible(appManagerPostText);

          await feedPage.feedList.openPostOptionsMenu(appManagerPostText);

          await feedPage.feedList.verifyEditOptionNotVisible(appManagerPostText);
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
      'verify SU can edit only their own Feed Posts (with Limited Visibility) on Home Feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42188', '@FO-feed'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            "ABAC: Verify Standard User can edit their own Feed post with Limited Visibility but cannot edit other users' restricted posts",
          zephyrTestId: 'CONT-42188',
          storyId: 'CONT-42188',
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

        // ==================== App Manager creates a Feed post WITH Limited Visibility ====================
        await test.step('App Manager creates a Feed post with Limited Visibility on Home Feed', async () => {
          await appManagerFixture.navigationHelper.clickOnHomeIconButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.reloadPage();
          await appManagerFeedPage.verifyThePageIsLoaded();

          appManagerPostText = TestDataGenerator.generateRandomText('App Manager Restricted Post', 3, true);
          await appManagerFeedPage.clickShareThoughtsButton();

          const postResult = await appManagerFeedPage.createAndPostWithLimitVisibility({
            text: appManagerPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          createdPostId = postResult.postId || '';
          await appManagerFeedPage.feedList.waitForPostToBeVisible(postResult.postText);
          await appManagerFeedPage.postEditor.verifyPostHasLimitVisibility(appManagerPostText);
        });

        // ==================== SU creates their own Feed post WITH Limited Visibility ====================
        await test.step('SU creates their own Feed post with Limited Visibility (Engineering audience)', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          suPostText = TestDataGenerator.generateRandomText('SU Own Restricted Post', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.createAndPostWithLimitVisibility({
            text: suPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);
          await feedPage.postEditor.verifyPostHasLimitVisibility(suPostText);
        });

        // ==================== SU verifies Edit option IS visible on own restricted post ====================
        await test.step('SU verifies Edit option is visible on their own restricted post', async () => {
          await feedPage.feedList.openPostOptionsMenu(suPostText);
          await feedPage.feedList.verifyEditOptionVisible(suPostText);
        });

        // ==================== SU edits their own restricted post successfully ====================
        let updatedSuPostText: string;
        await test.step('SU edits their own restricted post and verifies Limited Visibility preserved', async () => {
          updatedSuPostText = TestDataGenerator.generateRandomText('SU Edited Restricted Post', 3, true);

          await feedPage.feedList.openPostOptionsMenu(suPostText);
          await feedPage.postEditor.editPost(suPostText, updatedSuPostText);

          await feedPage.feedList.waitForPostToBeVisible(updatedSuPostText);
          await feedPage.postEditor.verifyPostHasLimitVisibility(updatedSuPostText);

          await feedPage.deletePost(updatedSuPostText);
        });

        // ==================== SU verifies Edit option is NOT visible on App Manager's restricted post ====================
        await test.step("SU verifies Edit option is NOT visible on App Manager's restricted post", async () => {
          await feedPage.reloadPage();
          await feedPage.feedList.waitForPostToBeVisible(appManagerPostText);

          await feedPage.feedList.openPostOptionsMenu(appManagerPostText);

          await feedPage.feedList.verifyEditOptionNotVisible(appManagerPostText);
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
      "verify FO's Feed post without Restricted Viewers is visible to all users",
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42171', '@FO-feed'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Feed post created by FO without Restricted Viewers / Limit Visibility is visible to all users and can be interacted with',
          zephyrTestId: 'CONT-42171',
          storyId: 'CONT-42171',
        });

        let foPostText: string;

        // ==================== FO creates Feed post WITHOUT Limit Visibility ====================
        await test.step('FO creates Feed post without Limit Visibility (default visibility to all)', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          foPostText = TestDataGenerator.generateRandomText('App Manager Unrestricted Post', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.postEditor.createAndPost({
            text: foPostText,
          });

          createdPostId = postResult.postId || '';
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);
        });

        // ==================== Verify post is visible to Standard User ====================
        await test.step("Standard User navigates to Home Feed and verifies FO's post is visible", async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPageWithTimelineMode();
          await feedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          await feedPage.feedList.waitForPostToBeVisible(foPostText);
        });

        // ==================== Verify Standard User can interact with the post (like/react) ====================
        await test.step("Standard User reacts to App Manager's unrestricted post", async () => {
          await feedPage.feedList.likeFeedPost(foPostText);

          await feedPage.feedList.verifyLikeCountOnPost(foPostText);
        });
      }
    );

    test(
      "verify FO's Feed post with Restricted Viewers is visible only to specified users",
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42172', '@FO-feed'],
      },
      async ({ appManagerFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Feed post created by FO with Restricted Viewers is visible only to specified users and blocked for unauthorized users including direct URL access',
          zephyrTestId: 'CONT-42172',
          storyId: 'CONT-42172',
        });

        let foPostText: string;
        let foPostId: string = '';

        // ==================== FO creates Feed post WITH Limit Visibility to Engineering ====================
        await test.step('FO creates Feed post with Limit Visibility restricted to Engineering audience', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          foPostText = TestDataGenerator.generateRandomText('ABAC Restricted Viewers Post', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.createAndPostWithLimitVisibility({
            text: foPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          foPostId = postResult.postId || '';
          createdPostId = foPostId;
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);

          await feedPage.postEditor.verifyPostHasLimitVisibility(foPostText);
        });

        // ==================== Authorized User (Standard User in Engineering) can see the post ====================
        await test.step('Standard User (authorized - in Engineering audience) navigates to Home Feed and verifies post is visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          const standardUserFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserFeedPage.reloadPageWithTimelineMode();
          await standardUserFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          await standardUserFeedPage.feedList.waitForPostToBeVisible(foPostText);
          await standardUserFeedPage.postEditor.verifyPostHasLimitVisibility(foPostText);
        });

        // ==================== Unauthorized User (Site Manager NOT in Engineering) cannot see the post ====================
        await test.step('Site Manager (unauthorized - NOT in Engineering audience) navigates to Home Feed and verifies post is NOT visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();
          const siteManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await siteManagerFeedPage.reloadPageWithTimelineMode();
          await siteManagerFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          await siteManagerFeedPage.feedList.verifyPostIsNotVisible(foPostText);
        });

        // ==================== Unauthorized User cannot access post via direct URL ====================
        await test.step('Site Manager attempts direct URL access to restricted post and verifies Page not found', async () => {
          const directAccessFeedPage = new FeedPage(socialCampaignManagerFixture.page, foPostId);
          await socialCampaignManagerFixture.page.goto(directAccessFeedPage.url);

          await directAccessFeedPage.verifyPageNotFoundVisibility({
            stepInfo: 'Verify unauthorized user sees Page not found when accessing restricted post via direct URL',
          });
        });
      }
    );

    test(
      "verify SU's Feed post with Restricted Viewers is visible only to specified users",
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42175', '@FO-feed'],
      },
      async ({ appManagerFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Feed post created by SU with Restricted Viewers is visible only to specified users and blocked for unauthorized users including direct URL access',
          zephyrTestId: 'CONT-42175',
          storyId: 'CONT-42175',
        });

        let suPostText: string;
        let suPostId: string = '';

        // ==================== Setup: Add SU as FO of "Post In Home Feed" ACG ====================
        await test.step('App Manager adds SU as FO of "Post In Home Feed" ACG', async () => {
          featureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          await featureOwnersPage.featureOwnerModal.addUserAsFeatureOnwer([standardUserFullName]);
        });

        // ==================== SU creates Feed post WITH Restricted Viewers (Engineering) ====================
        await test.step('SU creates Feed post with Restricted Viewers (Engineering audience)', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          suPostText = TestDataGenerator.generateRandomText('SU ABAC Restricted Viewers Post', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.createAndPostWithLimitVisibility({
            text: suPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          suPostId = postResult.postId || '';
          createdPostId = suPostId;
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);

          await feedPage.postEditor.verifyPostHasLimitVisibility(suPostText);
        });

        // ==================== Authorized User (App Manager in Engineering) can see the post ====================
        await test.step('App Manager (authorized - in Engineering audience) navigates to Home Feed and verifies post is visible', async () => {
          await appManagerFixture.navigationHelper.clickOnHomeIconButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.reloadPage();
          await appManagerFeedPage.verifyThePageIsLoaded();

          await appManagerFeedPage.feedList.waitForPostToBeVisible(suPostText);
          await appManagerFeedPage.postEditor.verifyPostHasLimitVisibility(suPostText);
        });

        // ==================== Unauthorized User (Social Campaign Manager NOT in Engineering) cannot see the post ====================
        await test.step('Social Campaign Manager (unauthorized - NOT in Engineering audience) navigates to Home Feed and verifies post is NOT visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();
          const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await socialCampaignManagerFeedPage.reloadPageWithTimelineMode();
          await socialCampaignManagerFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          await socialCampaignManagerFeedPage.feedList.verifyPostIsNotVisible(suPostText);
        });

        // ==================== Unauthorized User cannot access post via direct URL ====================
        await test.step('Social Campaign Manager attempts direct URL access to restricted post and verifies Page not found', async () => {
          const directAccessFeedPage = new FeedPage(socialCampaignManagerFixture.page, suPostId);
          await socialCampaignManagerFixture.page.goto(directAccessFeedPage.url);

          await directAccessFeedPage.verifyPageNotFoundVisibility({
            stepInfo: 'Verify unauthorized user sees Page not found when accessing restricted post via direct URL',
          });
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
      "verify SU's Feed post without Restricted Viewers is visible only to users in ACG Target Audience",
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42174', '@FO-feed', '@acg-target-audience'],
      },
      async ({ appManagerFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify Feed post created by SU (FO of Post in Home Feed ACG) without Restricted Viewers is visible only to users in ACG Target Audience and blocked for users outside the Target Audience',
          zephyrTestId: 'CONT-42174',
          storyId: 'CONT-42174',
        });

        let suPostText: string;
        let suPostId: string = '';
        // ==================== Setup: Add SU as Manager of "Custom - Post In Home Feed" ACG ====================
        await test.step('App Manager adds SU as Manager of "Custom - Post In Home Feed" ACG', async () => {
          let operationPerformed = false;
          acgPage = new AccessControlGroupsPage(appManagerFixture.page);
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_CUSTOM_ACG);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_CUSTOM_ACG);
          await acgPage.confirmEditACGModal.clickContinueButton();

          // Remove from Managers if present
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

        // ==================== SU creates Feed post WITHOUT Restricted Viewers ====================
        await test.step('SU creates Feed post without Restricted Viewers (visibility based on ACG Target Audience)', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          suPostText = TestDataGenerator.generateRandomText('SU ACG Target Audience Post', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.postEditor.createAndPost({
            text: suPostText,
          });

          suPostId = postResult.postId || '';
          createdPostId = suPostId;
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);

          // Verify post has limit visibility (ACG Target Audience)
          await feedPage.postEditor.verifyPostHasLimitVisibility(suPostText);
        });

        // ==================== SU (creator, in ACG Target Audience) can see the post ====================
        await test.step('Standard User (creator, in ACG Target Audience) verifies post is visible', async () => {
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          await feedPage.feedList.waitForPostToBeVisible(suPostText);
        });

        // ==================== Social Campaign Manager (NOT in ACG Target Audience) cannot see the post ====================
        await test.step('Social Campaign Manager (NOT in ACG Target Audience) navigates to Home Feed and verifies post is NOT visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();
          const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await socialCampaignManagerFeedPage.reloadPageWithTimelineMode();
          await socialCampaignManagerFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          await socialCampaignManagerFeedPage.feedList.verifyPostIsNotVisible(suPostText);
        });

        // ==================== Social Campaign Manager cannot access post via direct URL ====================
        await test.step('Social Campaign Manager attempts direct URL access and verifies Page not found', async () => {
          const directAccessFeedPage = new FeedPage(socialCampaignManagerFixture.page, suPostId);
          await socialCampaignManagerFixture.page.goto(directAccessFeedPage.url);

          await directAccessFeedPage.verifyPageNotFoundVisibility({
            stepInfo:
              'Verify unauthorized user (NOT in ACG Target Audience) sees Page not found when accessing post via direct URL',
          });
        });

        // ==================== Cleanup: Remove SU as Manager from "Custom - Post In Home Feed" ACG ====================
        await test.step('Cleanup: Remove SU as Manager from "Custom - Post In Home Feed" ACG', async () => {
          await acgPage.loadPage();
          await acgPage.assertions.verifyThePageIsLoaded();

          await acgPage.actions.searchForACG(POST_IN_HOME_FEED_CUSTOM_ACG);
          await acgPage.actions.editACG(POST_IN_HOME_FEED_CUSTOM_ACG);
          await acgPage.confirmEditACGModal.clickContinueButton();

          // Navigate to Admins section and remove user
          await acgPage.editACGModal.clickOnEditButtonOnSummaryScreen(ACG_EDIT_ASSETS.MANAGER);
          await acgPage.editACGModal.verifyTitleOfTheModal('Managers');
          await acgPage.editACGModal.removeUserIfPresentInList(standardUserFullName);
          await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);

          // Save the ACG changes
          await acgPage.editACGModal.clickOnButton(POPUP_BUTTONS.UPDATE);
        });
      }
    );

    test(
      "verify FO can view SU's restricted Home Feed post when FO is NOT in restricted audience",
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42177', '@FO-feed'],
      },
      async ({ appManagerFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO (App Manager) can view restricted Home Feed post created by SU even when FO is NOT included in the restricted viewers list (Engineering audience) - FO override visibility',
          zephyrTestId: 'CONT-42177',
          storyId: 'CONT-42177',
        });

        let suPostText: string;
        let suPostId: string = '';

        // ==================== Setup: Add SU as FO of "Post In Home Feed" ACG ====================
        await test.step('App Manager adds SU as FO of "Post In Home Feed" ACG', async () => {
          featureOwnersPage = new FeatureOwnersPage(appManagerFixture.page);
          await featureOwnersPage.loadPage();
          await featureOwnersPage.assertions.verifyThePageIsLoaded();

          await featureOwnersPage.actions.searchForFeature(POST_IN_HOME_FEED_FEATURE);
          await featureOwnersPage.actions.clickOnButtonForFeature(POST_IN_HOME_FEED_FEATURE, 'Edit');

          await featureOwnersPage.featureOwnerModal.ClickOnTab(FEATURE_OWNERS_TABS_OPTIONS.USERS);
          await featureOwnersPage.featureOwnerModal.addUserAsFeatureOnwer([standardUserFullName]);
        });

        // ==================== SU creates Feed post WITH Restricted Viewers (Engineering) ====================
        await test.step('SU creates Feed post with Restricted Viewers (Engineering audience)', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(standardUserFixture.page);
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          suPostText = TestDataGenerator.generateRandomText('SU ABAC FO Override Test Post', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.createAndPostWithLimitVisibility({
            text: suPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          suPostId = postResult.postId || '';
          createdPostId = suPostId;
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);

          await feedPage.postEditor.verifyPostHasLimitVisibility(suPostText);
        });

        // ==================== FO Override: App Manager (NOT in Engineering but is FO) can see the post ====================
        await test.step('App Manager (FO - NOT in Engineering audience) navigates to Home Feed and verifies post IS visible via FO override', async () => {
          await appManagerFixture.navigationHelper.clickOnHomeIconButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.reloadPage();
          await appManagerFeedPage.verifyThePageIsLoaded();

          // FO should see the restricted post even though NOT in Engineering audience
          await appManagerFeedPage.feedList.waitForPostToBeVisible(suPostText);
          await appManagerFeedPage.postEditor.verifyPostHasLimitVisibility(suPostText);
        });

        // ==================== Non-FO User (Social Campaign Manager NOT in Engineering) cannot see the post ====================
        await test.step('Social Campaign Manager (NOT FO, NOT in Engineering audience) navigates to Home Feed and verifies post is NOT visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();
          const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await socialCampaignManagerFeedPage.reloadPageWithTimelineMode();
          await socialCampaignManagerFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          await socialCampaignManagerFeedPage.feedList.verifyPostIsNotVisible(suPostText);
        });

        // ==================== Non-FO User cannot access post via direct URL ====================
        await test.step('Social Campaign Manager attempts direct URL access to restricted post and verifies Page not found', async () => {
          const directAccessFeedPage = new FeedPage(socialCampaignManagerFixture.page, suPostId);
          await socialCampaignManagerFixture.page.goto(directAccessFeedPage.url);

          await directAccessFeedPage.verifyPageNotFoundVisibility({
            stepInfo:
              'Verify non-FO unauthorized user sees Page not found when accessing restricted post via direct URL',
          });
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
      'verify FO can share unrestricted Home Feed post to Site Feed with Restricted Viewers (UX audience)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42194', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a Home Feed post (created without restrictions) to a Public Site Feed with Restricted Viewers enabled (UX audience). Post should be visible only to UX audience users.',
          zephyrTestId: 'CONT-42194',
          storyId: 'CONT-42194',
        });

        let foPostText: string;
        let sharedPostId: string = '';
        let publicSiteId: string = '';
        let publicSiteName: string = '';

        // ==================== Get or create Public Site ====================
        await test.step('Get or create a Public Site for sharing', async () => {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            waitForSearchIndex: true,
          });
          publicSiteId = publicSite.siteId;
          publicSiteName = publicSite.name;
        });

        // ==================== FO creates Home Feed post WITHOUT restrictions ====================
        await test.step('FO creates Home Feed post WITHOUT Restricted Viewers (unrestricted)', async () => {
          // Set feed posting permission to everyone
          const manageSitePage = new ManageSitePage(appManagerFixture.page);
          await manageSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(publicSiteId));
          await manageSitePage.setFeedPostingPermission(FeedPostingPermission.EVERYONE);

          await appManagerFixture.navigationHelper.clickOnHomeIconButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          foPostText = TestDataGenerator.generateRandomText('ABAC Share to Site Feed Test Post', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.postEditor.createAndPost({
            text: foPostText,
          });

          createdPostId = postResult.postId || '';
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);

          // Verify post does NOT have limit visibility (unrestricted)
          await feedPage.postEditor.verifyPostDoesNotHaveLimitVisibility(foPostText);
        });

        // ==================== FO shares to Site Feed WITH Restricted Viewers (UX audience) ====================
        await test.step('FO shares post to Public Site Feed with Restricted Viewers (UX audience)', async () => {
          await feedPage.feedList.clickShareIcon(foPostText);
          await feedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          const shareDescription = TestDataGenerator.generateRandomText('Shared with UX restriction', 2, true);

          sharedPostId = await shareComponent.shareToSiteFeedWithLimitVisibility({
            siteName: publicSiteName,
            description: shareDescription,
            audience: 'Engineering',
          });

          // Verify share was successful
          await feedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== Authorized User (Standard User in Engineering) can see shared post on Site Feed ====================
        await test.step('Standard User (authorized - in Engineering audience) navigates to Site Feed and verifies shared post is visible', async () => {
          const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          const standardUserFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserFeedPage.verifyThePageIsLoaded();

          // Verify the shared post is visible to authorized user
          await standardUserFeedPage.feedList.waitForPostToBeVisible(foPostText);
        });

        // ==================== Unauthorized User (Social Campaign Manager NOT in Engineering) cannot see shared post ====================
        await test.step('Social Campaign Manager (unauthorized - NOT in Engineering audience) navigates to Site Feed and verifies shared post is NOT visible', async () => {
          const siteDashboardPage = new SiteDashboardPage(socialCampaignManagerFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await socialCampaignManagerFeedPage.verifyThePageIsLoaded();

          // Verify the shared post is NOT visible to unauthorized user
          await socialCampaignManagerFeedPage.feedList.verifyPostIsNotVisible(foPostText);
        });

        // ==================== Unauthorized User cannot access shared post via direct URL ====================
        await test.step('Social Campaign Manager attempts direct URL access to shared post and verifies Page not found', async () => {
          const directAccessFeedPage = new FeedPage(socialCampaignManagerFixture.page, sharedPostId);
          await socialCampaignManagerFixture.page.goto(directAccessFeedPage.url);

          await directAccessFeedPage.verifyPageNotFoundVisibility({
            stepInfo:
              'Verify unauthorized user sees Page not found when accessing restricted shared post via direct URL',
          });
        });
      }
    );

    test(
      'verify FO can share restricted Home Feed post to Site Feed without restrictions - visible to all users',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42195', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a Home Feed post (created WITH restrictions - Engineering) to a Public Site Feed WITHOUT restrictions. Post should be visible to ALL users regardless of audience.',
          zephyrTestId: 'CONT-42195',
          storyId: 'CONT-42195',
        });

        let foPostText: string;
        let sharePostText: string;
        let sharedPostId: string = '';
        let publicSiteId: string = '';
        let publicSiteName: string = '';

        // ==================== Get or create Public Site ====================
        await test.step('Get or create a Public Site for sharing', async () => {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            waitForSearchIndex: true,
          });
          publicSiteId = publicSite.siteId;
          publicSiteName = publicSite.name;
        });

        // ==================== FO creates Home Feed post WITH restrictions (Engineering) ====================
        await test.step('FO creates Home Feed post WITH Restricted Viewers (Engineering audience)', async () => {
          await appManagerFixture.navigationHelper.clickOnHomeIconButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          foPostText = TestDataGenerator.generateRandomText('ABAC Restricted Share Test Post', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.createAndPostWithLimitVisibility({
            text: foPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          createdPostId = postResult.postId || '';
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);

          // Verify post HAS limit visibility (restricted to Engineering)
          await feedPage.postEditor.verifyPostHasLimitVisibility(foPostText);
        });

        // ==================== FO shares to Site Feed WITHOUT restrictions ====================
        await test.step('FO shares restricted post to Public Site Feed WITHOUT Restricted Viewers', async () => {
          await feedPage.feedList.clickShareIcon(foPostText);
          await feedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          sharePostText = TestDataGenerator.generateRandomText('Shared without restriction', 2, true);

          // Share to Site Feed WITHOUT enabling limit visibility
          await shareComponent.selectShareOptionAsSiteFeed();
          await shareComponent.enterSiteName(publicSiteName);
          await shareComponent.enterShareDescription(sharePostText);

          sharedPostId = await shareComponent.clickShareButtonAndGetPostId();

          // Verify share was successful
          await feedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== Engineering User can see shared post on Site Feed ====================
        await test.step('Standard User (in Engineering audience) navigates to Site Feed and verifies shared post is visible', async () => {
          const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          const standardUserFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserFeedPage.verifyThePageIsLoaded();

          // Verify the shared post IS visible to Engineering user
          await standardUserFeedPage.feedList.waitForPostToBeVisible(foPostText);

          await standardUserFeedPage.feedList.waitForPostToBeVisible(sharePostText);
        });

        // ==================== Non-Engineering User can ALSO see shared post on Site Feed ====================
        await test.step('Social Campaign Manager (NOT in Engineering audience) navigates to Site Feed and verifies shared post IS visible', async () => {
          const siteDashboardPage = new SiteDashboardPage(socialCampaignManagerFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await socialCampaignManagerFeedPage.verifyThePageIsLoaded();

          // Verify the shared post IS visible to non-Engineering user (no restriction on Site Feed)
          await socialCampaignManagerFeedPage.feedList.waitForPostToBeVisible(sharePostText);

          await socialCampaignManagerFeedPage.feedList.verifyDeletedPostMessage(sharePostText);
        });

        // ==================== Non-Engineering User can access shared post via direct URL ====================
        await test.step('Social Campaign Manager can access shared post via direct URL', async () => {
          const directAccessFeedPage = new FeedPage(socialCampaignManagerFixture.page, sharedPostId);
          await socialCampaignManagerFixture.page.goto(directAccessFeedPage.url);

          // Verify the shared post is accessible via direct URL (no Page not found)
          await directAccessFeedPage.feedList.waitForPostToBeVisible(sharePostText);

          await directAccessFeedPage.feedList.verifyDeletedPostMessage(sharePostText);
        });
      }
    );

    test(
      'verify FO can share restricted (Engineering) Home Feed post to Site Feed with different restrictions (UX Designs)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42196', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a Home Feed post (restricted to Engineering) to a Public Site Feed with different Restricted Viewers (UX Designs). Site Feed post should be visible only to UX Designs users, not Engineering users.',
          zephyrTestId: 'CONT-42196',
          storyId: 'CONT-42196',
        });

        let foPostText: string;
        let sharePostText: string;
        let sharedPostId: string = '';
        let publicSiteId: string = '';
        let publicSiteName: string = '';

        // ==================== Get or create Public Site ====================
        await test.step('Get or create a Public Site for sharing', async () => {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            waitForSearchIndex: true,
          });
          publicSiteId = publicSite.siteId;
          publicSiteName = publicSite.name;
        });

        // ==================== FO creates Home Feed post WITH restrictions (Engineering) ====================
        await test.step('FO creates Home Feed post WITH Restricted Viewers (Engineering audience)', async () => {
          const manageSitePage = new ManageSitePage(appManagerFixture.page);
          await manageSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(publicSiteId));
          await manageSitePage.setFeedPostingPermission(FeedPostingPermission.EVERYONE);

          await appManagerFixture.navigationHelper.clickOnHomeIconButton();
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();
          feedPage = new FeedPage(appManagerFixture.page);
          await feedPage.reloadPage();
          await feedPage.verifyThePageIsLoaded();

          foPostText = TestDataGenerator.generateRandomText('ABAC Different Audience Share Test', 3, true);
          await feedPage.clickShareThoughtsButton();

          const postResult = await feedPage.createAndPostWithLimitVisibility({
            text: foPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          createdPostId = postResult.postId || '';
          await feedPage.feedList.waitForPostToBeVisible(postResult.postText);

          // Verify post HAS limit visibility (restricted to Engineering)
          await feedPage.postEditor.verifyPostHasLimitVisibility(foPostText);
        });

        // ==================== FO shares to Site Feed WITH Restricted Viewers (UX Designs - different audience) ====================
        await test.step('FO shares restricted post to Public Site Feed WITH Restricted Viewers (UX Designs)', async () => {
          await feedPage.feedList.clickShareIcon(foPostText);
          await feedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          sharePostText = TestDataGenerator.generateRandomText('Shared with UX restriction', 2, true);

          // Share to Site Feed WITH limit visibility (UX audience - different from Home Feed)
          sharedPostId = await shareComponent.shareToSiteFeedWithLimitVisibility({
            siteName: publicSiteName,
            description: sharePostText,
            audience: 'UX',
          });

          // Verify share was successful
          await feedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== UX Designs User (socialCampaignManagerFixture) CAN see shared post on Site Feed ====================
        await test.step('Social Campaign Manager (UX Designs audience) navigates to Site Feed and verifies shared post IS visible', async () => {
          const siteDashboardPage = new SiteDashboardPage(socialCampaignManagerFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await socialCampaignManagerFeedPage.verifyThePageIsLoaded();

          // Verify the shared post IS visible to UX Designs user
          await socialCampaignManagerFeedPage.feedList.waitForPostToBeVisible(sharePostText);

          await socialCampaignManagerFeedPage.feedList.verifyDeletedPostMessage(sharePostText);
        });

        // ==================== Engineering User (standardUserFixture) CANNOT see shared post on Site Feed ====================
        await test.step('Standard User (Engineering audience) navigates to Site Feed and verifies shared post is NOT visible', async () => {
          const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          const standardUserFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserFeedPage.verifyThePageIsLoaded();

          // Verify the shared post is NOT visible to Engineering user (Site Feed restricted to UX)
          await standardUserFeedPage.feedList.verifyPostIsNotVisible(sharePostText);
        });

        // ==================== Engineering User cannot access shared post via direct URL ====================
        await test.step('Standard User (Engineering) attempts direct URL access to shared post and verifies Page not found', async () => {
          const directAccessFeedPage = new FeedPage(standardUserFixture.page, sharedPostId);
          await standardUserFixture.page.goto(directAccessFeedPage.url);

          await directAccessFeedPage.verifyPageNotFoundVisibility({
            stepInfo:
              'Verify Engineering user sees Page not found when accessing UX-restricted shared post via direct URL',
          });
        });
      }
    );

    test(
      'verify FO can share unrestricted Site Feed post to Home Feed with Restricted Viewers (UX Designs)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42197', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share an unrestricted Site Feed post to Home Feed with Restricted Viewers (UX Designs). Home Feed post should be visible only to UX Designs users and FO, not to Engineering users.',
          zephyrTestId: 'CONT-42197',
          storyId: 'CONT-42197',
        });

        let siteFeedPostText: string;
        let sharePostText: string;
        let sharedPostId: string = '';
        let publicSiteId: string = '';
        let siteDashboardPage: SiteDashboardPage;
        let siteFeedPage: FeedPage;

        // ==================== Get or create Public Site ====================
        await test.step('Get or create a Public Site', async () => {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            waitForSearchIndex: true,
          });
          publicSiteId = publicSite.siteId;
        });

        // ==================== FO creates Site Feed post WITHOUT restrictions ====================
        await test.step('FO creates Site Feed post WITHOUT Restricted Viewers (unrestricted)', async () => {
          siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          siteFeedPage = new FeedPage(appManagerFixture.page);
          await siteFeedPage.verifyThePageIsLoaded();

          siteFeedPostText = TestDataGenerator.generateRandomText('ABAC Site to Home Share Test', 3, true);
          await siteFeedPage.clickShareThoughtsButton();

          const postResult = await siteFeedPage.postEditor.createAndPost({
            text: siteFeedPostText,
          });

          await siteFeedPage.feedList.waitForPostToBeVisible(postResult.postText);

          // Verify post does NOT have limit visibility (unrestricted)
          await siteFeedPage.postEditor.verifyPostDoesNotHaveLimitVisibility(siteFeedPostText);
        });

        // ==================== FO shares Site Feed post to Home Feed WITH Restricted Viewers (UX Designs) ====================
        await test.step('FO shares Site Feed post to Home Feed WITH Restricted Viewers (UX Designs)', async () => {
          await siteFeedPage.feedList.waitForPostToBeVisible(siteFeedPostText);
          await siteFeedPage.feedList.clickShareIcon(siteFeedPostText);
          await siteFeedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          sharePostText = TestDataGenerator.generateRandomText('Shared to Home Feed with UX restriction', 2, true);

          // Share to Home Feed (default option) WITH limit visibility
          await shareComponent.enterShareDescription(sharePostText);
          await shareComponent.toggleLimitVisibility();
          await shareComponent.selectAudience('UX');

          sharedPostId = await shareComponent.clickShareButtonAndGetPostId();

          // Verify share was successful
          await siteFeedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== UX Designs User (socialCampaignManagerFixture) CAN see shared post on Home Feed ====================
        await test.step('Social Campaign Manager (UX Designs audience) navigates to Home Feed and verifies shared post IS visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();

          const socialCampaignManagerFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await socialCampaignManagerFeedPage.reloadPageWithTimelineMode();
          await socialCampaignManagerFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared post IS visible to UX Designs user
          await socialCampaignManagerFeedPage.feedList.waitForPostToBeVisible(sharePostText);
        });

        // ==================== Engineering User (standardUserFixture) CANNOT see shared post on Home Feed ====================
        await test.step('Standard User (Engineering audience) navigates to Home Feed and verifies shared post is NOT visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();

          const standardUserFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserFeedPage.reloadPageWithTimelineMode();
          await standardUserFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared post is NOT visible to Engineering user (Home Feed restricted to UX)
          await standardUserFeedPage.feedList.verifyPostIsNotVisible(sharePostText);
        });

        // ==================== Engineering User cannot access shared post via direct URL ====================
        await test.step('Standard User (Engineering) attempts direct URL access to shared post and verifies Page not found', async () => {
          const directAccessFeedPage = new FeedPage(standardUserFixture.page, sharedPostId);
          await standardUserFixture.page.goto(directAccessFeedPage.url);

          await directAccessFeedPage.verifyPageNotFoundVisibility({
            stepInfo:
              'Verify Engineering user sees Page not found when accessing UX-restricted Home Feed post via direct URL',
          });
        });

        // ==================== FO can see shared post on Home Feed ====================
        await test.step('FO navigates to Home Feed and verifies shared post IS visible', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const appManagerFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerFeedPage.reloadPageWithTimelineMode();
          await appManagerFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared post IS visible to FO (creator/sharer always sees their posts)
          await appManagerFeedPage.feedList.waitForPostToBeVisible(sharePostText);
        });
      }
    );

    test(
      'verify FO can share restricted (Engineering) Site Feed post to Home Feed with different restrictions (UX Designs)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42199', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a restricted Site Feed post (Engineering) to Home Feed with different Restricted Viewers (UX Designs). Validates inverse visibility - Engineering can see Site Feed but NOT Home Feed, UX can see Home Feed but NOT Site Feed.',
          zephyrTestId: 'CONT-42199',
          storyId: 'CONT-42199',
        });

        let siteFeedPostText: string;
        let sharePostText: string;
        let sharedPostId: string = '';
        let publicSiteId: string = '';
        let siteDashboardPage: SiteDashboardPage;
        let siteFeedPage: FeedPage;

        // ==================== Get or create Public Site ====================
        await test.step('Get or create a Public Site', async () => {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            waitForSearchIndex: true,
          });
          publicSiteId = publicSite.siteId;
        });

        // ==================== FO creates Site Feed post WITH restrictions (Engineering) ====================
        await test.step('FO creates Site Feed post WITH Restricted Viewers (Engineering audience)', async () => {
          siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          siteFeedPage = new FeedPage(appManagerFixture.page);
          await siteFeedPage.verifyThePageIsLoaded();

          siteFeedPostText = TestDataGenerator.generateRandomText('ABAC Restricted Site Feed Share Test', 3, true);
          await siteFeedPage.clickShareThoughtsButton();

          const postResult = await siteFeedPage.createAndPostWithLimitVisibility({
            text: siteFeedPostText,
            limitVisibility: {
              enabled: true,
              audience: 'Engineering',
            },
          });

          await siteFeedPage.feedList.waitForPostToBeVisible(postResult.postText);

          // Verify post HAS limit visibility (restricted to Engineering)
          await siteFeedPage.postEditor.verifyPostHasLimitVisibility(siteFeedPostText);
        });

        // ==================== Engineering User (standardUserFixture) CAN see Site Feed post ====================
        await test.step('Standard User (Engineering audience) navigates to Site Feed and verifies post IS visible', async () => {
          const standardUserSiteDashboard = new SiteDashboardPage(standardUserFixture.page, publicSiteId);
          await standardUserSiteDashboard.loadPage();
          await standardUserSiteDashboard.verifyThePageIsLoaded();

          await standardUserSiteDashboard.clickOnFeedLink();

          const standardUserSiteFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserSiteFeedPage.verifyThePageIsLoaded();

          // Verify the Site Feed post IS visible to Engineering user
          await standardUserSiteFeedPage.feedList.waitForPostToBeVisible(siteFeedPostText);
        });

        // ==================== UX User (socialCampaignManagerFixture) CANNOT see Site Feed post ====================
        await test.step('Social Campaign Manager (UX audience) navigates to Site Feed and verifies post is NOT visible', async () => {
          const uxUserSiteDashboard = new SiteDashboardPage(socialCampaignManagerFixture.page, publicSiteId);
          await uxUserSiteDashboard.loadPage();
          await uxUserSiteDashboard.verifyThePageIsLoaded();

          await uxUserSiteDashboard.clickOnFeedLink();

          const uxUserSiteFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await uxUserSiteFeedPage.verifyThePageIsLoaded();

          // Verify the Site Feed post is NOT visible to UX user (restricted to Engineering)
          await uxUserSiteFeedPage.feedList.verifyPostIsNotVisible(siteFeedPostText);
        });

        // ==================== FO shares Site Feed post to Home Feed WITH Restricted Viewers (UX Designs) ====================
        await test.step('FO shares restricted Site Feed post to Home Feed WITH Restricted Viewers (UX Designs)', async () => {
          await siteFeedPage.feedList.waitForPostToBeVisible(siteFeedPostText);
          await siteFeedPage.feedList.clickShareIcon(siteFeedPostText);
          await siteFeedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          sharePostText = TestDataGenerator.generateRandomText('Shared to Home Feed with UX restriction', 2, true);

          // Share to Home Feed (default option) WITH limit visibility (UX audience)
          await shareComponent.enterShareDescription(sharePostText);
          await shareComponent.toggleLimitVisibility();
          await shareComponent.selectAudience('UX');

          sharedPostId = await shareComponent.clickShareButtonAndGetPostId();

          // Verify share was successful
          await siteFeedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== UX User (socialCampaignManagerFixture) CAN see shared post on Home Feed ====================
        await test.step('Social Campaign Manager (UX audience) navigates to Home Feed and verifies shared post IS visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();

          const uxUserHomeFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await uxUserHomeFeedPage.reloadPageWithTimelineMode();
          await uxUserHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared post IS visible to UX user on Home Feed
          await uxUserHomeFeedPage.feedList.waitForPostToBeVisible(sharePostText);
        });

        // ==================== Engineering User (standardUserFixture) CANNOT see shared post on Home Feed ====================
        await test.step('Standard User (Engineering audience) navigates to Home Feed and verifies shared post is NOT visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();

          const standardUserHomeFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserHomeFeedPage.reloadPageWithTimelineMode();
          await standardUserHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared post is NOT visible to Engineering user (Home Feed restricted to UX)
          await standardUserHomeFeedPage.feedList.verifyPostIsNotVisible(sharePostText);
        });

        // ==================== Engineering User cannot access shared Home Feed post via direct URL ====================
        await test.step('Standard User (Engineering) attempts direct URL access to shared Home Feed post and verifies Page not found', async () => {
          const directAccessFeedPage = new FeedPage(standardUserFixture.page, sharedPostId);
          await standardUserFixture.page.goto(directAccessFeedPage.url);

          await directAccessFeedPage.verifyPageNotFoundVisibility({
            stepInfo:
              'Verify Engineering user sees Page not found when accessing UX-restricted Home Feed post via direct URL',
          });
        });

        // ==================== FO can see shared post on Home Feed ====================
        await test.step('FO navigates to Home Feed and verifies shared post IS visible', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const appManagerHomeFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerHomeFeedPage.reloadPageWithTimelineMode();
          await appManagerHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared post IS visible to FO (creator/sharer always sees their posts)
          await appManagerHomeFeedPage.feedList.waitForPostToBeVisible(sharePostText);
        });
      }
    );

    test(
      'verify FO can share a comment on non-restricted Public Site Feed post to Home Feed - visible to all users',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-42200', '@FO-feed', '@share-restriction'],
      },
      async ({ appManagerFixture, appManagerApiFixture, standardUserFixture, socialCampaignManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'ABAC: Verify FO can share a comment from a non-restricted Public Site Feed post to Home Feed without restrictions. The shared comment should be visible to all users.',
          zephyrTestId: 'CONT-42200',
          storyId: 'CONT-42200',
        });

        let siteFeedPostText: string;
        let commentText: string;
        let shareCommentText: string;
        let publicSiteId: string = '';
        let siteFeedPostId: string = '';
        let siteDashboardPage: SiteDashboardPage;
        let siteFeedPage: FeedPage;

        // ==================== Get or create Public Site ====================
        await test.step('Get or create a Public Site', async () => {
          const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
            waitForSearchIndex: true,
          });
          publicSiteId = publicSite.siteId;
        });

        // ==================== FO creates non-restricted Site Feed post ====================
        await test.step('FO creates non-restricted Site Feed post on Public Site', async () => {
          siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, publicSiteId);
          await siteDashboardPage.loadPage();
          await siteDashboardPage.verifyThePageIsLoaded();

          await siteDashboardPage.clickOnFeedLink();

          siteFeedPage = new FeedPage(appManagerFixture.page);
          await siteFeedPage.verifyThePageIsLoaded();

          siteFeedPostText = TestDataGenerator.generateRandomText('ABAC Comment Share Test Post', 3, true);
          await siteFeedPage.clickShareThoughtsButton();

          const postResult = await siteFeedPage.postEditor.createAndPost({ text: siteFeedPostText });
          siteFeedPostId = postResult.postId || '';

          await siteFeedPage.feedList.waitForPostToBeVisible(postResult.postText);

          // Verify post does NOT have limit visibility (unrestricted)
          await siteFeedPage.postEditor.verifyPostDoesNotHaveLimitVisibility(siteFeedPostText);
        });

        // ==================== FO adds a comment to the Site Feed post ====================
        await test.step('FO adds a comment/reply to the Site Feed post', async () => {
          commentText = TestDataGenerator.generateRandomText('ABAC Comment to share', 2, true);

          // Add reply to the post
          await siteFeedPage.feedList.addReplyToPost(commentText, siteFeedPostId);

          // Verify comment is visible
          await siteFeedPage.feedList.waitForPostToBeVisible(commentText);
        });

        // ==================== FO shares the comment to Home Feed (NO restrictions) ====================
        await test.step('FO shares the comment to Home Feed WITHOUT Restricted Viewers', async () => {
          // Click share on the comment
          await siteFeedPage.feedList.clickShareOnComment();
          await siteFeedPage.verifyShareModalIsOpen();

          const shareComponent = new ShareComponent(appManagerFixture.page);
          shareCommentText = TestDataGenerator.generateRandomText('Shared comment to Home Feed', 2, true);

          // Share to Home Feed (default option) WITHOUT limit visibility
          await shareComponent.enterShareDescription(shareCommentText);

          // Home Feed is the default - just click share
          await shareComponent.clickShareButtonAndGetPostId();

          // Verify share was successful
          await siteFeedPage.feedList.verifyShareModalIsClosed();
        });

        // ==================== FO navigates to Home Feed and verifies shared comment IS visible ====================
        await test.step('FO navigates to Home Feed and verifies shared comment IS visible', async () => {
          await appManagerFixture.navigationHelper.clickOnGlobalFeed();

          const appManagerHomeFeedPage = new FeedPage(appManagerFixture.page);
          await appManagerHomeFeedPage.reloadPageWithTimelineMode();
          await appManagerHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared comment IS visible to FO
          await appManagerHomeFeedPage.feedList.waitForPostToBeVisible(shareCommentText);
        });

        // ==================== Standard User navigates to Home Feed and verifies shared comment IS visible ====================
        await test.step('Standard User navigates to Home Feed and verifies shared comment IS visible', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();

          const standardUserHomeFeedPage = new FeedPage(standardUserFixture.page);
          await standardUserHomeFeedPage.reloadPageWithTimelineMode();
          await standardUserHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared comment IS visible to Standard User
          await standardUserHomeFeedPage.feedList.waitForPostToBeVisible(shareCommentText);
        });

        // ==================== Social Campaign Manager navigates to Home Feed and verifies shared comment IS visible ====================
        await test.step('Social Campaign Manager navigates to Home Feed and verifies shared comment IS visible', async () => {
          await socialCampaignManagerFixture.navigationHelper.clickOnGlobalFeed();

          const scmHomeFeedPage = new FeedPage(socialCampaignManagerFixture.page);
          await scmHomeFeedPage.reloadPageWithTimelineMode();
          await scmHomeFeedPage.feedList.verifyThePageIsLoadedWithTimelineMode();

          // Verify the shared comment IS visible to Social Campaign Manager
          await scmHomeFeedPage.feedList.waitForPostToBeVisible(shareCommentText);
        });
      }
    );
  }
);
