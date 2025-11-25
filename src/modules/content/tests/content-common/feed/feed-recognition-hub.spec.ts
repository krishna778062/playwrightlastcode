import { expect } from '@playwright/test';
import { RecognitionHubPage } from '@rewards-pages/recognition-hub/recognition-hub-page';

import { SITE_TYPES } from '@content/constants/siteTypes';
import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { RecognitionDialogComponent } from '@content/ui/components/recognitionDialogComponent';
import { FeedPage } from '@content/ui/pages/feedPage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe(
  'feed recognition hub',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER],
  },
  () => {
    test(
      'verify User is able to Create Recognition from HUB',
      {
        tag: [TestGroupType.REGRESSION, TestPriority.P0, '@CONT-28585'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify User is able to Create Recognition from Recognition Hub',
          zephyrTestId: 'CONT-28585',
          storyId: 'CONT-28585',
        });

        const recognitionHub = new RecognitionHubPage(appManagerFixture.page);

        // Navigate to Recognition Hub via side nav
        await appManagerFixture.navigationHelper.sideNavBarComponent.clickRecognitionLinkUnderHomeNavMenu();
        //await recognitionHub.verifyThePageIsLoaded();

        // Click "Give Recognition" button - this opens a dialog
        await recognitionHub.clickOnGiveRecognition();

        const recognitionDialog = new RecognitionDialogComponent(appManagerFixture.page);

        // Verify recognition dialog is loaded and ready
        await recognitionDialog.verifyRecognitionDialogIsLoaded();

        // Select peer recognition award
        await recognitionDialog.selectPeerRecognitionAward(0);

        // Select user for recognition
        await recognitionDialog.selectUserForRecognition(0);

        // Enter recognition message
        const recognitionMessage = FEED_TEST_DATA.POST_TEXT.RECOGNITION_MESSAGE;
        await recognitionDialog.enterRecognitionMessage(recognitionMessage);

        // Add attachment (commented out for now)
        // const imagePath = FileUtil.getFilePath(
        //   __dirname,
        //   '..',
        //   '..',
        //   '..',
        //   'test-data',
        //   'static-files',
        //   'images',
        //   FEED_TEST_DATA.ATTACHMENTS.IMAGE
        // );
        // await recognitionDialog.addAttachment(imagePath);

        // Verify Recognize button is enabled
        await expect(recognitionDialog.recognizeButton).toBeEnabled();

        // Click Recognize button and wait for share dialog
        await recognitionDialog.clickRecognizeButtonAndWaitForShareDialog();

        // Skip the share dialog (original test behavior)
        await recognitionDialog.clickSkipButton();

        // Reload the Recognition Hub page
        await recognitionHub.page.reload();

        // Verify the recognition post is visible on Recognition Hub
        await recognitionHub.verifyRecognitionPostVisible(recognitionMessage);
      }
    );

    test(
      'verify User is able to Share RECOGNITION from HUB',
      {
        tag: [TestGroupType.REGRESSION, TestPriority.P0, '@CONT-28587'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify User is able to Share Recognition from Recognition Hub',
          zephyrTestId: 'CONT-28587',
          storyId: 'CONT-28587',
        });

        const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
        const shareMessage = 'Sharing this recognition to feed';

        // Get public site info using content module helper
        const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const publicSiteName = siteInfo.name;
        const publicSiteId = siteInfo.siteId;

        // Step 1: Create a recognition first (without sharing it)
        // Navigate to Recognition Hub via side nav
        await appManagerFixture.navigationHelper.sideNavBarComponent.clickRecognitionLinkUnderHomeNavMenu();

        // Click "Give Recognition" button - this opens a dialog
        await recognitionHub.clickOnGiveRecognition();

        const recognitionDialog = new RecognitionDialogComponent(appManagerFixture.page);

        // Verify recognition dialog is loaded and ready
        await recognitionDialog.verifyRecognitionDialogIsLoaded();

        // Select peer recognition award
        await recognitionDialog.selectPeerRecognitionAward(0);

        // Select user for recognition
        await recognitionDialog.selectUserForRecognition(0);

        // Enter recognition message
        const recognitionMessage = FEED_TEST_DATA.POST_TEXT.RECOGNITION_MESSAGE;
        await recognitionDialog.enterRecognitionMessage(recognitionMessage);

        // Click Recognize button and wait for share dialog
        await recognitionDialog.clickRecognizeButtonAndWaitForShareDialog();

        // Skip the share dialog to create recognition without sharing
        await recognitionDialog.clickSkipButton();

        // Reload the Recognition Hub page to ensure recognition is visible
        await recognitionHub.page.reload();
        await recognitionHub.verifyRecognitionPostVisible(recognitionMessage);

        // ========== HOME FEED SECTION ==========
        // Click on "Recognition" - navigate to Recognition Hub
        await appManagerFixture.navigationHelper.sideNavBarComponent.clickRecognitionLinkUnderHomeNavMenu();
        await recognitionHub.verifyRecognitionPostVisible(recognitionMessage);

        // Click on "Share" button for the recognition which is already created on recognition hub
        await recognitionHub.clickShareButtonOnFirstRecognition();

        // Wait for share dialog to appear
        await recognitionDialog.verifier.verifyTheElementIsVisible(recognitionDialog.shareDialogForm, {
          assertionMessage: 'Share dialog form should be visible',
        });

        // Select "Post in Home Feed"
        await recognitionDialog.selectPostInHomeFeedInShareDialogForm();

        // Add a message
        await recognitionDialog.enterMessageInShareDialog(shareMessage);

        // Click on "Share" button
        await recognitionDialog.shareDialogShareButton.click();

        // Wait for share dialog to close
        await recognitionDialog.waitForShareDialogToClose();

        // Navigate to Home tab
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();

        const feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.verifyThePageIsLoaded();

        // Reload page to ensure the post appears
        await feedPage.reloadPage();

        // Verify the Recognition created on recognition hub is shared to home feed
        await feedPage.assertions.waitForPostToBeVisible(recognitionMessage);

        // ========== SITE FEED SECTION ==========
        // Click on "Recognition" - navigate to Recognition Hub
        await appManagerFixture.navigationHelper.sideNavBarComponent.clickRecognitionLinkUnderHomeNavMenu();
        await recognitionHub.verifyRecognitionPostVisible(recognitionMessage);

        // Click on "Share" button for the recognition which is already created on recognition hub
        await recognitionHub.clickShareButtonOnFirstRecognition();

        // Wait for share dialog to appear
        await recognitionDialog.verifier.verifyTheElementIsVisible(recognitionDialog.shareDialogForm, {
          assertionMessage: 'Share dialog form should be visible',
        });

        // Select "Post in Site Feed" and search a "Public Site"
        await recognitionDialog.selectPostInSiteFeedInShareDialogForm(publicSiteName);

        // Add a message
        await recognitionDialog.enterMessageInShareDialog(shareMessage);

        // Click on "Share" button
        await recognitionDialog.shareDialogShareButton.click();

        // Wait for share dialog to close
        await recognitionDialog.waitForShareDialogToClose();

        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, publicSiteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.verifyThePageIsLoaded();

        // Verify the Recognition created on recognition hub is shared to site feed
        await siteDashboardPage.listFeedComponent.waitForPostToBeVisible(recognitionMessage);
      }
    );
  }
);
