import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { ContentPreviewPage } from '@content/ui/pages/contentPreviewPage';
import { ManageSitePage } from '@content/ui/pages/manageSitePage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SitePermission } from '@core/types/siteManagement.types';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { FeedPostingPermission } from '@/src/modules/content/constants/feedPostingPermission';
import { CreateFeedPostComponent } from '@/src/modules/content/ui/components/createFeedPostComponent';

test.describe(
  '@FeedPost - Restrict feed posting permission on Content Detail Page to managers only',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER, '@feed-permission-restriction-content-detail'],
  },
  () => {
    test(
      'verify Site Owner and Site Manager can comment on Content Detail Page of a Public Site when feed permission is set to "Only site owners and site managers can make feed posts"',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@Public_Site_Permission_Restriction'],
      },
      async ({ appManagerApiFixture, appManagerFixture, siteManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Site Owner and Site Manager can comment on Content Detail Page when feed permission is restricted to managers only',
          zephyrTestId: 'CONT-37171',
          storyId: 'CONT-37171',
        });

        const postCommentAndVerify = async (
          siteId: string,
          contentId: string,
          contentType: string,
          page: any,
          commentText: string
        ) => {
          const contentPreviewPage = new ContentPreviewPage(page, siteId, contentId, contentType);
          await contentPreviewPage.loadPage();

          // Verify that comment option is visible on content detail page feed form
          await contentPreviewPage.assertions.verifyCommentOptionIsVisible();

          // Click "Share your thoughts" button to open comment editor
          await contentPreviewPage.actions.clickShareThoughtsButton();

          // Create CreateFeedPostComponent instance to post the comment
          const createFeedPostComponent = new CreateFeedPostComponent(page);
          await createFeedPostComponent.createPost(commentText);
          await createFeedPostComponent.actions.clickPostButton();

          // Verify the comment is visible after posting
          await contentPreviewPage.assertions.waitForPostToBeVisible(commentText);
        };

        // Create a Public Site
        const publicSite = await appManagerApiFixture.siteManagementHelper.createPublicSite({
          waitForSearchIndex: false,
        });
        const siteId = publicSite.siteId;

        // Set feed posting permission to managers only
        const manageSitePage = new ManageSitePage(appManagerFixture.page, siteId);
        await manageSitePage.goToUrl(manageSitePage.url);
        await manageSitePage.clickDashboardAndFeedTab();
        await manageSitePage.setFeedPostingPermission(FeedPostingPermission.MANAGERS_ONLY);

        // Create Page content
        const pageContent = await appManagerApiFixture.contentManagementHelper.createPage({
          siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
          options: { waitForSearchIndex: false },
        });

        // Get site manager user info
        const { userId: siteManagerUserId } = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.siteManager.email
        );

        // Assign site manager user as Site Manager role
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId,
          userId: siteManagerUserId,
          role: SitePermission.MANAGER,
        });

        // Generate unique comment texts for each user
        const siteOwnerCommentText = TestDataGenerator.generateRandomText('Site Owner Comment', 3, true);
        const siteManagerCommentText = TestDataGenerator.generateRandomText('Site Manager Comment', 3, true);

        // Test as Site Owner (appManager) - Post comment and verify
        await postCommentAndVerify(siteId, pageContent.contentId, 'page', appManagerFixture.page, siteOwnerCommentText);

        // Test as Site Manager - Post comment and verify
        await postCommentAndVerify(
          siteId,
          pageContent.contentId,
          'page',
          siteManagerFixture.page,
          siteManagerCommentText
        );
      }
    );
  }
);
