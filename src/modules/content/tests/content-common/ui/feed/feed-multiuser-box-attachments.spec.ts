import { SitePageTab } from '@content/constants/sitePageEnums';
import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { ManageSitePage } from '@content/ui/pages/manageSitePage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages/siteDashboardPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SitePermission } from '@core/types/siteManagement.types';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

test.describe(
  '@FeedPost - Site Roles Box File Attachments',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER, '@box-attachments'],
  },
  () => {
    let siteId: string;

    // Setup test runs first (serial) - configures Box files only
    test.describe.serial('setup', () => {
      test('setup: Configure Box files', async ({ appManagerApiFixture, appManagerFixture }) => {
        // Get "All Employees" site ID
        siteId = await appManagerApiFixture.siteManagementHelper.getSiteIdWithName('All Employees');

        // Configure External Files to use Box via UI (done once for all tests)
        const manageSitePage = new ManageSitePage(appManagerFixture.page, siteId);
        await manageSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(siteId));
        await manageSitePage.actions.setExternalFilesProvider('Box files');
      });
    });

    // Role tests - run serially to avoid conflicts when creating multiple feeds
    test.describe.serial('role tests', () => {
      /**
       * Helper function to test Box file attachments functionality for a specific role
       */
      const siteName: string = 'All Employees';
      const testBoxAttachmentsForRole = async (
        role: SitePermission,
        roleName: string,
        appManagerApiFixture: any,
        userFixture: any
      ) => {
        // Get siteId independently (always "All Employees")
        const testSiteId = await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(siteName);

        // Assign role to user
        const isSiteManager = role === SitePermission.MANAGER;
        const { userId } = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          isSiteManager ? users.siteManager.email : users.endUser.email
        );

        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: testSiteId,
          userId,
          role,
        });

        // Navigate to site Feed page
        const siteDashboard = new SiteDashboardPage(userFixture.page, testSiteId);
        await siteDashboard.navigateToTab(SitePageTab.DashboardTab);
        await siteDashboard.actions.clickOnFeedLink();

        // Create a new feed post for this role test (each role gets its own post)
        const basePostText = FEED_TEST_DATA.POST_TEXT.INITIAL;
        await siteDashboard.actions.clickShareThoughtsButton();
        const createFeedPostComponent = siteDashboard['createFeedPostComponent'];
        const postResult = await createFeedPostComponent.createAndPost({
          text: basePostText,
        });
        const basePostId = postResult.postId || '';

        // Wait for the newly created post to be visible
        const listFeedComponent = siteDashboard['listFeedComponent'];
        await listFeedComponent.waitForPostToBeVisible(basePostText);

        // Generate unique reply text for this role
        const roleReplyText = FEED_TEST_DATA.POST_TEXT.REPLY;
        const roleUpdatedReplyText = FEED_TEST_DATA.POST_TEXT.UPDATED;

        // ==================== ADD REPLY WITH BOX ATTACHMENT ====================
        // Open reply editor for the post
        await listFeedComponent.openReplyEditorForPost(basePostText);
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        const userName = userInfo?.fullName || '';

        // Create reply text with mention and topic
        await createFeedPostComponent.createPost(roleReplyText);
        await createFeedPostComponent.addUserNameMention(userName);
        await createFeedPostComponent.addTopicMention('Simpplr');

        // Click Browse files button
        await createFeedPostComponent.clickBrowseFilesButton();

        // Verify Intranet files and Box files tabs are displayed
        await createFeedPostComponent.verifyIntranetAndBoxTabsVisible();

        // Click Box files tab
        await createFeedPostComponent.clickBoxFilesTab();

        // Click "SmokeTesting" folder
        await createFeedPostComponent.clickBoxFolder('SmokeTesting');

        // Select file(s) from folder
        await createFeedPostComponent.selectBoxFile('');

        // Click Attach button
        await createFeedPostComponent.clickAttachButton();

        // Verify attachments are added
        await createFeedPostComponent.assertions.verifyAttachedFileCount(1);

        // Post reply
        const replyResponse = await listFeedComponent.submitReplyAndGetResponse();
        const roleReplyPostId = replyResponse.feedId;

        // Verify reply is created with timestamp
        await listFeedComponent.verifyReplyIsVisible(roleReplyText);
        await listFeedComponent.verifyReplyTimestamp(roleReplyText);

        // Verify attachment details (name, type, size, Box logo)
        await listFeedComponent.verifyBoxLogoOnReplyAttachment(roleReplyText);

        // ==================== EDIT REPLY ====================
        // Click options menu on reply
        await listFeedComponent.openReplyOptionsMenu(roleReplyText);

        // Click Edit
        await listFeedComponent.clickReplyEditOption();

        // Verify text editor is visible
        await createFeedPostComponent.assertions.verifyEditorVisible();

        // Update reply text
        await createFeedPostComponent.updatePostText(roleUpdatedReplyText);

        // Remove one file attachment
        await createFeedPostComponent.removeAttachedFile(0);

        // Click Update button and wait for reply to update
        await createFeedPostComponent.clickUpdateButton();
        await listFeedComponent.verifyReplyIsVisible(roleUpdatedReplyText);

        // ==================== DELETE REPLY ====================
        // Use listFeedComponent methods directly for more specific targeting
        await listFeedComponent.openReplyOptionsMenu(roleUpdatedReplyText);
        await listFeedComponent.clickReplyDeleteOption();
        await listFeedComponent.confirmDelete();

        // Verify reply is deleted
        await listFeedComponent.verifyReplyIsNotVisible(roleUpdatedReplyText);

        // Cleanup: Delete both the reply post and the base post
        try {
          await appManagerApiFixture.feedManagementHelper.deleteFeed(roleReplyPostId);
        } catch (error) {
          console.log(`Failed to cleanup reply feed ${roleReplyPostId} via API:`, error);
        }
        try {
          await appManagerApiFixture.feedManagementHelper.deleteFeed(basePostId);
        } catch (error) {
          console.log(`Failed to cleanup base feed ${basePostId} via API:`, error);
        }
      };

      test(
        'verify Site Manager can add, edit, and delete Feed reply with Box file attachments',
        {
          tag: [TestPriority.P1, TestGroupType.REGRESSION, '@box-attachments'],
        },
        async ({ appManagerApiFixture, siteManagerFixture }) => {
          tagTest(test.info(), {
            description: 'Verify Site Manager can add, edit, and delete Feed reply with Box file attachments',
            zephyrTestId: 'CONT-24903',
            storyId: 'CONT-24903',
          });

          await testBoxAttachmentsForRole(SitePermission.MANAGER, 'Manager', appManagerApiFixture, siteManagerFixture);
        }
      );

      test(
        'verify Site Content Manager can add, edit, and delete Feed reply with Box file attachments',
        {
          tag: [TestPriority.P1, TestGroupType.REGRESSION, '@box-attachments'],
        },
        async ({ appManagerApiFixture, standardUserFixture }) => {
          tagTest(test.info(), {
            description: 'Verify Site Content Manager can add, edit, and delete Feed reply with Box file attachments',
            zephyrTestId: 'CONT-24904',
            storyId: 'CONT-24904',
          });

          await testBoxAttachmentsForRole(
            SitePermission.CONTENT_MANAGER,
            'Content Manager',
            appManagerApiFixture,
            standardUserFixture
          );
        }
      );

      test(
        'verify Site Member can add, edit, and delete Feed reply with Box file attachments',
        {
          tag: [TestPriority.P1, TestGroupType.REGRESSION, '@box-attachments'],
        },
        async ({ appManagerApiFixture, standardUserFixture }) => {
          tagTest(test.info(), {
            description: 'Verify Site Member can add, edit, and delete Feed reply with Box file attachments',
            zephyrTestId: 'CONT-24905',
            storyId: 'CONT-24905',
          });

          await testBoxAttachmentsForRole(SitePermission.MEMBER, 'Member', appManagerApiFixture, standardUserFixture);
        }
      );
    });
  }
);
