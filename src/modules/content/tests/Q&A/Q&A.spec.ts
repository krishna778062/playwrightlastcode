import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { FEED_TEST_DATA } from '../../test-data/feed.test-data';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { FeedPage } from '@/src/modules/content/pages/feedPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';

test.describe(
  '@Q&A - Question and Answer functionality',
  {
    tag: [ContentTestSuite.Q_AND_A],
  },
  () => {
    let feedPage: FeedPage;
    let createdPostId: string = '';
    test.beforeEach(async ({ feedManagementHelper }) => {
      // Configure app governance settings and enable timeline comment post(feed)
      await feedManagementHelper.configureAppGovernance({ feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE });
      await feedManagementHelper.enableQuestionAnswer();
    });

    test.afterEach(async ({ feedManagementHelper }) => {
      // Cleanup: Delete post using API if test failed and post still exists
      if (createdPostId && feedManagementHelper) {
        try {
          await feedManagementHelper.deleteFeed(createdPostId);
        } catch (error) {
          console.log('Failed to cleanup feed via API:', error);
        }
      } else {
        console.log('No feed was published or feed already deleted, hence skipping the deletion');
      }
    });

    test(
      'AM | Home Q&A | Create, Edit with only Title of the question',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-38778'],
      },
      async ({ appManagerHomePage }) => {
        tagTest(test.info(), {
          description: 'AM | Home Q&A | Create, Edit with only Title of the question',
          zephyrTestId: 'CONT-38778',
          storyId: 'CONT-38778',
        });

        await appManagerHomePage.actions.clickOnGlobalFeed();

        feedPage = new FeedPage(appManagerHomePage.page);
        await feedPage.verifyThePageIsLoaded();
        // And Click "Question"
        await feedPage.actions.clickShareThoughtsButton();
        await feedPage.actions.clickQuestionButton();
        const questionTitle = TestDataGenerator.generateRandomText();
        const questionResult = await feedPage.actions.createAndPostQuestion({ title: questionTitle });
        createdPostId = questionResult.questionId!;
        await feedPage.assertions.verifyQuestionCreatedSuccessfully(questionTitle);
        const editTitle = TestDataGenerator.generateRandomText();
        await feedPage.actions.editQuestion(questionTitle, editTitle);
        await feedPage.assertions.verifyQuestionCreatedSuccessfully(editTitle);
      }
    );
  }
);
