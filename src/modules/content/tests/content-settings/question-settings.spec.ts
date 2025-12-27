import { ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { FeedPage } from '../../ui/pages/feedPage';
import { GovernanceScreenPage } from '../../ui/pages/governanceScreenPage';
import { ManageApplicationPage } from '../../ui/pages/manageApplicationPage';

import { SETTINGS_TEST_DATA } from '@/src/modules/content/test-data/settings.test-data';

test.describe(
  `question and Answer settings verification`,
  {
    tag: [ContentSuiteTags.QUESTION_SETTINGS],
  },
  () => {
    let manageApplicationPage: ManageApplicationPage;
    let feedPage: FeedPage;
    let governanceScreenPage: GovernanceScreenPage;

    test.beforeEach(async ({ appManagerFixture }) => {
      manageApplicationPage = new ManageApplicationPage(appManagerFixture.page);
      governanceScreenPage = new GovernanceScreenPage(appManagerFixture.page);
      feedPage = new FeedPage(appManagerFixture.page);
    });

    test(
      'aM | Question Settings | Verify Behaviour of the Application Based Q&A Settings are enabled (Feature Flag Always ON)',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33434'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'AM | Question Settings | Verify Behaviour of the Application Based Q&A Settings are enabled (Feature Flag Always ON)',
          zephyrTestId: 'CONT-33434',
          storyId: 'CONT-33434',
        });

        await governanceScreenPage.loadPage();
        await governanceScreenPage.clickOnTimelineFeedEnabled();
        await manageApplicationPage.loadPage();
        await manageApplicationPage.disableQuestionAndAnswerFeature();
        await manageApplicationPage.clickOnSave();
        await manageApplicationPage.verifyToastMessageIsVisibleWithText(
          SETTINGS_TEST_DATA.TOAST_MESSAGES.SAVED_CHANGES_SUCCESSFULLY
        );
        await appManagerFixture.navigationHelper.clickOnHomeButton();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.verifyThePageIsLoaded();
        await feedPage.clickShareThoughtsButton();
        await feedPage.verifyQuestionButtonIsNotVisible();
        await manageApplicationPage.loadPage();
        await manageApplicationPage.enableQuestionAndAnswerFeature();
        await manageApplicationPage.clickOnSave();
        await manageApplicationPage.verifyToastMessageIsVisibleWithText(
          SETTINGS_TEST_DATA.TOAST_MESSAGES.SAVED_CHANGES_SUCCESSFULLY
        );
        await appManagerFixture.homePage.loadPage();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.verifyThePageIsLoaded();
        await feedPage.clickShareThoughtsButton();
        await feedPage.postEditor.verifyQuestionButtonIsVisible();
      }
    );
  }
);
