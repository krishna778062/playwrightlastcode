import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';

test.describe(
  '@Q&A - Question and Answer functionality',
  {
    tag: [ContentTestSuite.Q_AND_A],
  },
  () => {
    let feedPage: FeedPage;
    let createdPostId: string = '';
    test.beforeEach(async ({ appManagerFixture }) => {
      // // Configure app governance settings and enable timeline comment post(feed)
      // await appManagerFixture.feedManagementHelper.configureAppGovernance({
      //   feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
      // });
      await appManagerFixture.feedManagementHelper.enableQuestionAnswer();
    });

    test.afterEach(async ({ appManagerFixture }) => {
      // Cleanup: Delete post using API if test failed and post still exists
      if (createdPostId && appManagerFixture.feedManagementHelper) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(createdPostId);
        } catch (error) {
          console.log('Failed to cleanup feed via API:', error);
        }
      } else {
        console.log('No feed was published or feed already deleted, hence skipping the deletion');
      }
    });

    test(
      'aM | Home Q&A | Create, Edit with only Title of the question',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-38778', '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'AM | Home Q&A | Create, Edit with only Title of the question',
          zephyrTestId: 'CONT-38778',
          storyId: 'CONT-38778',
        });

        await appManagerFixture.navigationHelper.clickOnGlobalFeed();

        feedPage = new FeedPage(appManagerFixture.page);
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

    test(
      'verify User creates a question for sites',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33540'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify User creates a question for sites',
          zephyrTestId: 'CONT-33540',
          storyId: 'CONT-33540',
        });

        const siteName = 'All Employees';
        const siteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(siteName);
        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteId);
        await siteDashboardPage.loadPage();
        // And Click "Question"
        await siteDashboardPage.actions.clickShareThoughtsButton();
        await siteDashboardPage.actions.clickQuestionButton();
        const questionTitle = TestDataGenerator.generateRandomText();
        const questionResult = await siteDashboardPage.actions.createAndPostQuestion({ title: questionTitle });
        createdPostId = questionResult.questionId!;
        await siteDashboardPage.assertions.verifyQuestionCreatedSuccessfully(questionTitle);
      }
    );

    test(
      'verify User creates a question for content feed',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-34095'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify User creates a question for content feed',
          zephyrTestId: 'CONT-34095',
          storyId: 'CONT-34095',
        });

        const contentId = await appManagerFixture.contentManagementHelper.getContentId();
        const contentPreviewPage = new ContentPreviewPage(appManagerFixture.page, contentId.siteId);
        // And Click "Question"
        await contentPreviewPage.actions.clickShareThoughtsButton();
        await contentPreviewPage.actions.clickQuestionButton();
        const questionTitle = TestDataGenerator.generateRandomText();
        const questionResult = await contentPreviewPage.actions.createAndPostQuestion({ title: questionTitle });
        createdPostId = questionResult.questionId!;
        await contentPreviewPage.assertions.verifyQuestionCreatedSuccessfully(questionTitle);
      }
    );
  }
);
