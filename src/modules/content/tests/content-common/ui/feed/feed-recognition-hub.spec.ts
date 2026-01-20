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
        tag: [TestGroupType.REGRESSION, TestPriority.P0, '@CONT-28585', ContentTestSuite.FEED],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify User is able to Create Recognition from Recognition Hub',
          zephyrTestId: 'CONT-28585',
          storyId: 'CONT-28585',
        });

        const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
        const feedPage = new FeedPage(appManagerFixture.page);

        await appManagerFixture.navigationHelper.sideNavBarComponent.clickRecognitionLinkUnderHomeNavMenu();

        await feedPage.clickOnGiveRecognition();

        const recognitionDialog = new RecognitionDialogComponent(appManagerFixture.page);

        await recognitionDialog.verifyRecognitionDialogIsLoaded();

        await recognitionDialog.selectPeerRecognitionAward(0);

        await recognitionDialog.selectUserForRecognition(0);

        const recognitionMessage = FEED_TEST_DATA.POST_TEXT.RECOGNITION_MESSAGE;
        await recognitionDialog.enterRecognitionMessage(recognitionMessage);

        await expect(recognitionDialog.recognizeButton).toBeEnabled();

        await recognitionDialog.clickRecognizeButtonAndWaitForShareDialog();

        await recognitionDialog.clickSkipButton();

        await recognitionHub.page.reload();

        await feedPage.verifyRecognitionPostVisible(recognitionMessage);
      }
    );

    test(
      'verify User is able to Share RECOGNITION from HUB CONT-28587',
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
        const feedPage = new FeedPage(appManagerFixture.page);
        const shareMessage = 'Sharing this recognition to feed';

        const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const publicSiteName = siteInfo.name;
        const publicSiteId = siteInfo.siteId;

        await appManagerFixture.navigationHelper.sideNavBarComponent.clickRecognitionLinkUnderHomeNavMenu();

        await feedPage.clickOnGiveRecognition();

        const recognitionDialog = new RecognitionDialogComponent(appManagerFixture.page);

        await recognitionDialog.verifyRecognitionDialogIsLoaded();

        await recognitionDialog.selectPeerRecognitionAward(0);

        await recognitionDialog.selectUserForRecognition(0);

        const recognitionMessage = FEED_TEST_DATA.POST_TEXT.RECOGNITION_MESSAGE;
        await recognitionDialog.enterRecognitionMessage(recognitionMessage);

        await recognitionDialog.clickRecognizeButtonAndWaitForShareDialog();

        await recognitionDialog.clickSkipButton();

        await recognitionHub.page.reload();
        await feedPage.verifyRecognitionPostVisible(recognitionMessage);

        await appManagerFixture.navigationHelper.sideNavBarComponent.clickRecognitionLinkUnderHomeNavMenu();
        await feedPage.verifyRecognitionPostVisible(recognitionMessage);

        await recognitionHub.clickShareButtonOnFirstRecognition();

        await recognitionDialog.verifier.verifyTheElementIsVisible(recognitionDialog.shareDialogForm, {
          assertionMessage: 'Share dialog form should be visible',
        });

        await recognitionDialog.selectPostInHomeFeedInShareDialogForm();

        await recognitionDialog.enterMessageInShareDialog(shareMessage);

        await recognitionDialog.shareDialogShareButton.click();

        await recognitionDialog.waitForShareDialogToClose();

        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();

        await feedPage.verifyThePageIsLoaded();

        await feedPage.reloadPage();

        await feedPage.feedList.waitForPostToBeVisible(recognitionMessage);

        await appManagerFixture.navigationHelper.sideNavBarComponent.clickRecognitionLinkUnderHomeNavMenu();
        await feedPage.verifyRecognitionPostVisible(recognitionMessage);

        await recognitionHub.clickShareButtonOnFirstRecognition();

        await recognitionDialog.verifier.verifyTheElementIsVisible(recognitionDialog.shareDialogForm, {
          assertionMessage: 'Share dialog form should be visible',
        });

        await recognitionDialog.selectPostInSiteFeedInShareDialogForm(publicSiteName);

        await recognitionDialog.enterMessageInShareDialog(shareMessage);

        await recognitionDialog.clickShareDialogShareButton();

        await recognitionDialog.waitForShareDialogToClose();

        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, publicSiteId);
        await siteDashboardPage.loadPage({ stepInfo: 'Load site dashboard page' });
        await siteDashboardPage.verifyThePageIsLoaded();

        await siteDashboardPage.listFeedComponent.waitForPostToBeVisible(recognitionMessage);
      }
    );
  }
);
