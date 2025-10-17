import { AwarenessCheckComponent } from '../../../components/awarenessCheckComponent';
import { MustReadComponent } from '../../../components/mustReadComponent';
import { test } from '../../../fixtures/loginFixture';
import { ContentPreviewPage } from '../../../pages/contentPreviewPage';
import { EMPLOYEE_LISTENING_TEST_DATA } from '../../../test-data/awarenessCheck';

import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';

test.describe('must Read and Awareness Check Content Functionality', () => {
  let createdContentId: string;
  let createdSiteId: string;
  let contentTitle: string;

  test.beforeEach('create test content for Awareness Check testing', async ({ appManagerApiFixture }) => {
    const siteId = process.env.SITE_ID;
    if (!siteId) {
      throw new Error('SITE_ID environment variable is not defined');
    }

    const pageDetails = await appManagerApiFixture.contentManagementHelper.createPage({
      siteId,
      contentInfo: {
        contentType: 'page',
        contentSubType: 'news',
      },
      options: {
        contentDescription: 'This content tests Must Read and Awareness Check functionality for admin and end users.',
      },
    });

    createdContentId = pageDetails.contentId;
    createdSiteId = siteId;
    contentTitle = pageDetails.pageName;

    console.log(`Created test content: ${contentTitle} (ID: ${createdContentId})`);
  });

  test.afterAll('Cleanup test content', async ({ appManagerApiFixture }) => {
    if (createdContentId && createdSiteId) {
      try {
        await appManagerApiFixture.contentManagementHelper.deleteContent(createdSiteId, createdContentId);
        console.log(`Cleaned up test content: ${createdContentId}`);
      } catch (error) {
        console.warn(`Failed to cleanup content:`, error);
      }
    }
  });
  test(
    'verify admin can create awareness check with single question',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@MUST_READ_ADMIN'],
    },
    async ({ appManagersPage }) => {
      tagTest(test.info(), {
        description: 'Verify admin can create awareness check with single question',
        zephyrTestId: 'LS-3582',
        storyId: 'Awareness Check Creation',
      });

      const contentPreviewPage = new ContentPreviewPage(appManagersPage, createdSiteId, createdContentId);
      await contentPreviewPage.navigateToContentDetail(createdContentId, createdSiteId);
      await contentPreviewPage.verifyThePageIsLoaded();

      const mustReadComponent = new MustReadComponent(appManagersPage);

      await mustReadComponent.clickOnContentThreeDotsMenu();

      await mustReadComponent.selectMustReadFromMenuOptions();

      const awarenessCheckComponent = new AwarenessCheckComponent(appManagersPage);

      await awarenessCheckComponent.enableAwarenessCheck();

      await awarenessCheckComponent.enterAwarenessQuestions([
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE,
      ]);

      await awarenessCheckComponent.clickOnMakeMustReadButton();

      await awarenessCheckComponent.verifyAwarenessCheckQuestionIsCreated(
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE.question
      );

      console.log('✓ Admin configuration completed successfully');
    }
  );

  test(
    'verify admin can create awareness check with multiple questions',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@MUST_READ_ADMIN'],
    },
    async ({ appManagersPage }) => {
      tagTest(test.info(), {
        description: 'Verify admin can create awareness check with multiple questions',
        zephyrTestId: 'LS-3249',
        storyId: 'Awareness Check Creation',
      });

      const contentPreviewPage = new ContentPreviewPage(appManagersPage, createdSiteId, createdContentId);
      await contentPreviewPage.navigateToContentDetail(createdContentId, createdSiteId);
      await contentPreviewPage.verifyThePageIsLoaded();

      const mustReadComponent = new MustReadComponent(appManagersPage);

      await mustReadComponent.clickOnContentThreeDotsMenu();

      await mustReadComponent.selectMustReadFromMenuOptions();

      const awarenessCheckComponent = new AwarenessCheckComponent(appManagersPage);

      await awarenessCheckComponent.enableAwarenessCheck();

      await awarenessCheckComponent.enterAwarenessQuestions(
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.MULTIPLE
      );

      await awarenessCheckComponent.clickOnMakeMustReadButton();

      await awarenessCheckComponent.verifyAwarenessCheckQuestionIsCreated(
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.MULTIPLE[0].question
      );

      console.log('✓ Admin configuration completed successfully');
    }
  );

  test(
    'verify admin can edit awareness check question',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@MUST_READ_ADMIN'],
    },
    async ({ appManagersPage }) => {
      tagTest(test.info(), {
        description: 'Verify admin can create awareness check with single question',
        zephyrTestId: 'LS-4951',
        storyId: 'Awareness Check Creation',
      });

      const contentPreviewPage = new ContentPreviewPage(appManagersPage, createdSiteId, createdContentId);
      await contentPreviewPage.navigateToContentDetail(createdContentId, createdSiteId);
      await contentPreviewPage.verifyThePageIsLoaded();

      const mustReadComponent = new MustReadComponent(appManagersPage);

      await mustReadComponent.clickOnContentThreeDotsMenu();

      await mustReadComponent.selectMustReadFromMenuOptions();

      const awarenessCheckComponent = new AwarenessCheckComponent(appManagersPage);

      await awarenessCheckComponent.enableAwarenessCheck();

      await awarenessCheckComponent.enterAwarenessQuestions([
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE,
      ]);

      await awarenessCheckComponent.clickOnMakeMustReadButton();

      await awarenessCheckComponent.verifyAwarenessCheckQuestionIsCreated(
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE.question
      );
      console.log('✓ Admin configuration completed successfully');

      await mustReadComponent.closeSurveyPrompt();

      await awarenessCheckComponent.clickOnAwarenessThreeDots();

      await awarenessCheckComponent.clickOnEditAwarenessCheck();

      await awarenessCheckComponent.editAwarenessQuestions([
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.UPDATED_QUESTIONS.SINGLE,
      ]);

      await awarenessCheckComponent.updateAwarenessCheckButton.click();

      await awarenessCheckComponent.verifyAwarenessCheckQuestionIsCreated(
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.UPDATED_QUESTIONS.SINGLE.question
      );
    }
  );

  test(
    'verify admin can remove awareness check question',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@MUST_READ_ADMIN'],
    },
    async ({ appManagersPage }) => {
      tagTest(test.info(), {
        description: 'Verify admin can create awareness check with single question',
        zephyrTestId: 'LS-4952',
        storyId: 'Awareness Check Creation',
      });

      const contentPreviewPage = new ContentPreviewPage(appManagersPage, createdSiteId, createdContentId);
      await contentPreviewPage.navigateToContentDetail(createdContentId, createdSiteId);
      await contentPreviewPage.verifyThePageIsLoaded();

      const mustReadComponent = new MustReadComponent(appManagersPage);

      await mustReadComponent.clickOnContentThreeDotsMenu();

      await mustReadComponent.selectMustReadFromMenuOptions();

      const awarenessCheckComponent = new AwarenessCheckComponent(appManagersPage);

      await awarenessCheckComponent.enableAwarenessCheck();

      await awarenessCheckComponent.enterAwarenessQuestions([
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE,
      ]);

      await awarenessCheckComponent.clickOnMakeMustReadButton();

      await awarenessCheckComponent.verifyAwarenessCheckQuestionIsCreated(
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE.question
      );
      console.log('✓ Admin configuration completed successfully');

      await mustReadComponent.closeSurveyPrompt();

      await awarenessCheckComponent.clickOnAwarenessThreeDots();

      await awarenessCheckComponent.clickOnRemoveAwarenessCheck();

      await awarenessCheckComponent.removeAwarenessCheck();

      await awarenessCheckComponent.verifyAwarenessCheckQuestionIsRemoved(
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE.question
      );

      console.log('✓ Admin configuration completed successfully');
    }
  );
});
