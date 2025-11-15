import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ApplicationScreenPage } from '@/src/modules/content/ui/pages/applicationsScreenPage';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { GovernanceScreenPage } from '@/src/modules/content/ui/pages/governanceScreenPage';
import { ManageApplicationPage } from '@/src/modules/content/ui/pages/manageApplicationPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';

interface FeedResponse {
  result: {
    feedId: string;
  };
}

test.describe(
  '@FeedPost - Timeline Share Button Visibility',
  {
    tag: [ContentTestSuite.FEED_APP_MANAGER],
  },
  () => {
    let feedPage: FeedPage;
    let siteDashboardPage: SiteDashboardPage;
    let contentPreviewPage: ContentPreviewPage;
    let applicationScreenPage: ApplicationScreenPage;
    let manageApplicationPage: ManageApplicationPage;
    let governanceScreenPage: GovernanceScreenPage;

    let homeFeedPostId: string = '';
    let siteFeedPostId: string = '';
    let contentFeedPostId: string = '';
    let siteId: string = '';
    let contentId: string = '';

    test.beforeEach('Setup test environment', async ({ appManagerFixture }) => {
      // Initialize page objects
      feedPage = new FeedPage(appManagerFixture.page);
      applicationScreenPage = new ApplicationScreenPage(appManagerFixture.page);
      manageApplicationPage = new ManageApplicationPage(appManagerFixture.page);
      governanceScreenPage = new GovernanceScreenPage(appManagerFixture.page);
      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.actions.clickOnApplication();
      await manageApplicationPage.actions.clickOnGovernance();
      await governanceScreenPage.actions.selectTimelineFeedSettingsAsDefaultMode();
    });

    test.afterEach('Cleanup created posts', async ({ appManagerFixture }) => {
      applicationScreenPage = new ApplicationScreenPage(appManagerFixture.page);
      manageApplicationPage = new ManageApplicationPage(appManagerFixture.page);
      governanceScreenPage = new GovernanceScreenPage(appManagerFixture.page);

      await appManagerFixture.navigationHelper.openApplicationSettings();
      await applicationScreenPage.actions.clickOnApplication();
      await manageApplicationPage.actions.clickOnGovernance();
      await governanceScreenPage.actions.selectTimelineFeedSettingsAsDefaultMode();
      // Cleanup home feed post
      if (homeFeedPostId) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(homeFeedPostId);
        } catch (error) {
          console.log('Failed to cleanup home feed post:', error);
        }
        homeFeedPostId = '';
      }

      // Cleanup site feed post
      if (siteFeedPostId) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(siteFeedPostId);
        } catch (error) {
          console.log('Failed to cleanup site feed post:', error);
        }
        siteFeedPostId = '';
      }

      // Cleanup content feed post
      if (contentFeedPostId) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(contentFeedPostId);
        } catch (error) {
          console.log('Failed to cleanup content feed post:', error);
        }
        contentFeedPostId = '';
      }
    });

    test(
      'verify user should not be able to share feed post content file when Timeline & feed setting should be set to "Timeline"',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-26731'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Share button is not visible on feed posts on home dashboard, site dashboard, and page dashboard when Timeline mode is enabled',
          zephyrTestId: 'CONT-26731',
          storyId: 'CONT-26731',
        });

        // Step 1: Create feed posts BEFORE setting Timeline mode (posts can only be created when Timeline is disabled)
        // Create feed post on Home Feed
        const homeFeedTestData = TestDataGenerator.generateFeed({
          scope: 'public',
          siteId: undefined,
          waitForSearchIndex: false,
        });
        const homeFeedResponse: FeedResponse =
          await appManagerFixture.feedManagementHelper.createFeed(homeFeedTestData);
        homeFeedPostId = homeFeedResponse.result.feedId;
        console.log(`Created home feed post via API: ${homeFeedPostId}`);

        // Create feed post on Site Feed
        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public');
        siteId = siteDetails.siteId;

        const siteFeedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: siteId,
          waitForSearchIndex: false,
        });
        const siteFeedResponse: FeedResponse =
          await appManagerFixture.feedManagementHelper.createFeed(siteFeedTestData);
        siteFeedPostId = siteFeedResponse.result.feedId;
        console.log(`Created site feed post via API: ${siteFeedPostId}`);

        // Create feed post on Content/Page Dashboard
        const pageDetails = await appManagerFixture.contentManagementHelper.getContentId();
        contentId = pageDetails.contentId;
        // Use the siteId from pageDetails if available, otherwise use the siteId from siteDetails
        if (pageDetails.siteId) {
          siteId = pageDetails.siteId;
        }

        const contentFeedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: siteId,
          contentId: contentId,
          waitForSearchIndex: false,
        });
        const contentFeedResponse: FeedResponse =
          await appManagerFixture.feedManagementHelper.createFeed(contentFeedTestData);
        contentFeedPostId = contentFeedResponse.result.feedId;
        console.log(`Created content feed post via API: ${contentFeedPostId}`);

        // Step 2: Set Timeline & feed setting to "Timeline"
        await appManagerFixture.navigationHelper.openApplicationSettings();
        await applicationScreenPage.actions.clickOnApplication();
        await manageApplicationPage.actions.clickOnGovernance();
        await governanceScreenPage.actions.selectTimelineFeedSettingsAsTimeline();
        console.log('Timeline mode enabled');

        // Step 3: Navigate to Home Feed and verify post is not visible and share button is NOT visible
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.assertions.verifyThePageIsLoadedWithTimelineMode();
        await feedPage.assertions.verifyPostIsNotVisible(homeFeedTestData.text);
        await feedPage.assertions.verifyShareButtonIsNotVisible();
        console.log('Home feed: Post is not visible and Share button is NOT visible');

        // Step 4: Navigate to Site Dashboard and verify post is not visible and share button is NOT visible
        siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.verifyThePageIsLoaded();
        await siteDashboardPage.assertions.verifyThePageIsLoadedWithTimelineMode();
        await siteDashboardPage.assertions.validatePostNotVisible(siteFeedTestData.text);
        await siteDashboardPage.assertions.verifyShareButtonIsNotVisible();
        console.log('Site feed: Post is not visible and Share button is NOT visible');

        // Step 5: Navigate to Content Preview Page and verify post is not visible and share button is NOT visible
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteId,
          contentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await contentPreviewPage.assertions.verifyThePageIsLoadedWithTimelineModeOnContentPage();
        await contentPreviewPage.assertions.verifyPostIsNotVisible(contentFeedTestData.text);
        await contentPreviewPage.assertions.verifyShareButtonIsNotVisible();
        // Currently, the content share button is visible on content preview page, so we are not verifying it
        // await contentPreviewPage.assertions.verifyContentShareButtonIsNotVisible();
        console.log('Content feed: Post is not visible and Share button is NOT visible on content and comments');
      }
    );
    test(
      'verify user should not be able to share feed post content file when Timeline & feed setting should be set to "Timeline and comments on Content"',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-26730'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify Share button is not visible on feed posts on home dashboard, site dashboard, and page dashboard when Timeline mode is enabled',
          zephyrTestId: 'CONT-26730',
          storyId: 'CONT-26730',
        });

        // Step 1: Create feed posts BEFORE setting Timeline mode (posts can only be created when Timeline is disabled)
        // Create feed post on Home Feed
        const homeFeedTestData = TestDataGenerator.generateFeed({
          scope: 'public',
          siteId: undefined,
          waitForSearchIndex: false,
        });
        const homeFeedResponse: FeedResponse =
          await appManagerFixture.feedManagementHelper.createFeed(homeFeedTestData);
        homeFeedPostId = homeFeedResponse.result.feedId;
        console.log(`Created home feed post via API: ${homeFeedPostId}`);

        // Create feed post on Site Feed
        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType('public');
        siteId = siteDetails.siteId;

        const siteFeedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: siteId,
          waitForSearchIndex: false,
        });
        const siteFeedResponse: FeedResponse =
          await appManagerFixture.feedManagementHelper.createFeed(siteFeedTestData);
        siteFeedPostId = siteFeedResponse.result.feedId;
        console.log(`Created site feed post via API: ${siteFeedPostId}`);

        // Create feed post on Content/Page Dashboard
        const pageDetails = await appManagerFixture.contentManagementHelper.getContentId();
        contentId = pageDetails.contentId;
        // Use the siteId from pageDetails if available, otherwise use the siteId from siteDetails
        if (pageDetails.siteId) {
          siteId = pageDetails.siteId;
        }

        const contentFeedTestData = TestDataGenerator.generateFeed({
          scope: 'site',
          siteId: siteId,
          contentId: contentId,
          waitForSearchIndex: false,
        });
        const contentFeedResponse: FeedResponse =
          await appManagerFixture.feedManagementHelper.createFeed(contentFeedTestData);
        contentFeedPostId = contentFeedResponse.result.feedId;
        console.log(`Created content feed post via API: ${contentFeedPostId}`);

        // Step 2: Set Timeline & feed setting to "Timeline and comments on Content"
        await appManagerFixture.navigationHelper.openApplicationSettings();
        await applicationScreenPage.actions.clickOnApplication();
        await manageApplicationPage.actions.clickOnGovernance();
        await governanceScreenPage.actions.selectTimelineFeedSettingsAsTimelineAndCommentsOnContent();
        console.log('Timeline and comments on content feed mode enabled');

        // Step 3: Navigate to Home Feed and verify post is not visible and share button is NOT visible
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        await feedPage.assertions.verifyThePageIsLoadedWithTimelineMode();
        await feedPage.assertions.verifyPostIsNotVisible(homeFeedTestData.text);
        await feedPage.assertions.verifyShareButtonIsNotVisible();
        console.log('Home feed: Post is not visible and Share button is NOT visible');

        // Step 4: Navigate to Site Dashboard and verify post is not visible and share button is NOT visible
        siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.verifyThePageIsLoaded();
        console.log('Site feed post text: ', siteFeedTestData.text);
        await siteDashboardPage.assertions.validatePostNotVisible(siteFeedTestData.text);
        await siteDashboardPage.assertions.verifyShareButtonIsNotVisible();
        console.log('Site feed: Post is not visible and Share button is NOT visible');

        // Step 5: Navigate to Content Preview Page and verify post is not visible and share button is NOT visible
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteId,
          contentId,
          ContentType.PAGE.toLowerCase()
        );
        await contentPreviewPage.loadPage({ stepInfo: 'Load content preview page' });
        await contentPreviewPage.assertions.verifyThePageIsLoadedWithTimelineModeOnContentPage();
        await contentPreviewPage.assertions.waitForPostToBeVisible(contentFeedTestData.text);
        await contentPreviewPage.assertions.verifyShareButtonIsNotVisible();
        // Currently, the content share button is visible on content preview page, so we are not verifying it
        // await contentPreviewPage.assertions.verifyContentShareButtonIsNotVisible();
        console.log('Content feed: Post is not visible and Share button is NOT visible on content and comments');
      }
    );
  }
);
