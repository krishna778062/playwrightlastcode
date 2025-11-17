import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { ContentPreviewPage } from '@content/ui/pages/contentPreviewPage';
import { ManageSitePage } from '@content/ui/pages/manageSitePage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SitePermission } from '@core/types/siteManagement.types';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
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

        // Create a Public Site
        const publicSite = await appManagerApiFixture.siteManagementHelper.createPublicSite({
          waitForSearchIndex: false,
        });
        const siteId = publicSite.siteId;

        // Set feed posting permission to managers only
        const manageSitePage = new ManageSitePage(appManagerFixture.page, siteId);
        await manageSitePage.goToUrl(PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(siteId));
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

        // Test as Site Owner (appManager) - Post comment
        const siteOwnerContentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteId,
          pageContent.contentId,
          'page'
        );
        await siteOwnerContentPreviewPage.loadPage();

        // Verify that comment option is visible on content detail page feed form
        await siteOwnerContentPreviewPage.assertions.verifyCommentOptionIsVisible();

        // Click "Share your thoughts" button to open comment editor
        await siteOwnerContentPreviewPage.actions.clickShareThoughtsButton();

        // Create CreateFeedPostComponent instance to post the comment
        const siteOwnerCreateFeedPostComponent = new CreateFeedPostComponent(appManagerFixture.page);
        await siteOwnerCreateFeedPostComponent.actions.createPost(siteOwnerCommentText);
        await siteOwnerCreateFeedPostComponent.actions.clickPostButton();

        // Verify Site Owner comment
        await siteOwnerContentPreviewPage.assertions.waitForPostToBeVisible(siteOwnerCommentText);

        // Test as Site Manager - Post comment
        const siteManagerContentPreviewPage = new ContentPreviewPage(
          siteManagerFixture.page,
          siteId,
          pageContent.contentId,
          'page'
        );
        await siteManagerContentPreviewPage.loadPage();

        // Verify that comment option is visible on content detail page feed form
        await siteManagerContentPreviewPage.assertions.verifyCommentOptionIsVisible();

        // Click "Share your thoughts" button to open comment editor
        await siteManagerContentPreviewPage.actions.clickShareThoughtsButton();

        // Create CreateFeedPostComponent instance to post the comment
        const siteManagerCreateFeedPostComponent = new CreateFeedPostComponent(siteManagerFixture.page);
        await siteManagerCreateFeedPostComponent.actions.createPost(siteManagerCommentText);
        await siteManagerCreateFeedPostComponent.actions.clickPostButton();

        // Verify Site Manager comment
        await siteManagerContentPreviewPage.assertions.waitForPostToBeVisible(siteManagerCommentText);
      }
    );
  }
);
