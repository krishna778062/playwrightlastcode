import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { AwarenessCheckComponent } from '../../../components/awarenessCheckComponent';
import { MustReadComponent } from '../../../components/mustReadComponent';
import { ContentPreviewPage } from '../../../pages/contentPreviewPage';
import { EMPLOYEE_LISTENING_TEST_DATA } from '../../../test-data/awarenessCheck';

// Use the content fixture since it has the proper app manager and end user setup
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';

test.describe('Must Read and Awareness Check Content Functionality', () => {
  let createdContentId: string;
  let createdSiteId: string;
  let contentTitle: string;

  test.beforeAll('Create test content for Awareness Check testing', async ({ appManagerApiClient }) => {
    // Create test content using the content API
    const contentService = appManagerApiClient.getContentManagementService();
    const siteId = process.env.SITE_ID || 'default-site-id';

    // Get a valid category ID first
    const defaultCategory = await contentService.getPageCategoryID(siteId);

    const contentPayload = {
      title: `Must Read Awareness Test - ${Date.now()}`,
      body: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { Paragraphclass: '', textAlign: 'left', indent: null },
            content: [
              {
                type: 'text',
                text: 'This content tests Must Read and Awareness Check functionality for admin and end users.',
              },
            ],
          },
        ],
        hasInlineImages: true,
      }),
      bodyHtml: '<p>This content tests Must Read and Awareness Check functionality for admin and end users.</p>',
      contentType: 'page',
      contentSubType: 'news',
      language: 'en',
      isFeedEnabled: true,
      listOfTopics: [],
      listOfFiles: [],
      publishingStatus: 'immediate',
      publishAt: new Date().toISOString(),
      imgLayout: 'small',
      imgCaption: '',
      isNewTiptap: false,
      category: {
        id: defaultCategory.categoryId,
        name: defaultCategory.name,
      },
    };

    const response = await contentService.addNewPageContent(siteId, contentPayload);

    createdContentId = response.pageId;
    createdSiteId = siteId;
    contentTitle = contentPayload.title;

    console.log(`Created test content: ${contentTitle} (ID: ${createdContentId})`);
  });

  test.afterAll('Cleanup test content', async ({ appManagerApiClient }) => {
    // Cleanup created content using the content API
    if (createdContentId && createdSiteId) {
      try {
        const contentService = appManagerApiClient.getContentManagementService();
        await contentService.deleteContent(createdSiteId, createdContentId);
        console.log(`Cleaned up test content: ${createdContentId}`);
      } catch (error) {
        console.warn(`Failed to cleanup content:`, error);
      }
    }
  });
  test(
    'Verify admin can create awareness check with single question',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@MUST_READ_ADMIN'],
    },
    async ({ appManagersPage }) => {
      tagTest(test.info(), {
        description: 'Verify admin can create awareness check with single question',
        zephyrTestId: 'EL-MR-001',
        storyId: 'Awareness Check Creation',
      });

      // Navigate to content detail page
      const contentPreviewPage = new ContentPreviewPage(appManagersPage, createdSiteId, createdContentId);
      await contentPreviewPage.navigateToContentDetail(createdContentId, createdSiteId);
      await contentPreviewPage.verifyThePageIsLoaded();

      // Initialize Awareness Check component
      const mustReadComponent = new MustReadComponent(appManagersPage);

      // STEP 1: Configure Must Read settings
      // Select awareness check from menu options
      await mustReadComponent.contentThreeDotsMenu.click();

      // Select awareness check from menu options
      await mustReadComponent.selectMustReadFromMenuOptions();

      // Initialize Awareness Check component
      const awarenessCheckComponent = new AwarenessCheckComponent(appManagersPage);

      // STEP 2: Configure Awareness Check settings
      // Enable Awareness Check
      await awarenessCheckComponent.enableAwarenessCheck();

      // Add questions for awareness check
      await awarenessCheckComponent.enterAwarenessQuestions([
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE,
      ]);

      // Click on make must read button
      await awarenessCheckComponent.clickOnMakeMustReadButton();

      //Verify created awareness check question
      await awarenessCheckComponent.verifyAwarenessCheckQuestionIsCreated(
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE.question
      );

      // Verify awareness check is configured
      console.log('✓ Admin configuration completed successfully');
    }
  );

  test(
    'Verify admin can create awareness check with multiple questions',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@MUST_READ_ADMIN'],
    },
    async ({ appManagersPage }) => {
      tagTest(test.info(), {
        description: 'Verify admin can create awareness check with multiple questions',
        zephyrTestId: 'EL-MR-001',
        storyId: 'Awareness Check Creation',
      });

      // Navigate to content detail page
      const contentPreviewPage = new ContentPreviewPage(appManagersPage, createdSiteId, createdContentId);
      await contentPreviewPage.navigateToContentDetail(createdContentId, createdSiteId);
      await contentPreviewPage.verifyThePageIsLoaded();

      // Initialize Awareness Check component
      const mustReadComponent = new MustReadComponent(appManagersPage);

      // STEP 1: Configure Must Read settings
      // Select awareness check from menu options
      await mustReadComponent.contentThreeDotsMenu.click();

      // Select awareness check from menu options
      await mustReadComponent.selectMustReadFromMenuOptions();

      // Initialize Awareness Check component
      const awarenessCheckComponent = new AwarenessCheckComponent(appManagersPage);

      // STEP 2: Configure Awareness Check settings
      // Enable Awareness Check
      await awarenessCheckComponent.enableAwarenessCheck();

      // Add questions for awareness check
      await awarenessCheckComponent.enterAwarenessQuestions(
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.MULTIPLE
      );

      // Click on make must read button
      await awarenessCheckComponent.clickOnMakeMustReadButton();

      //Verify created awareness check question
      await awarenessCheckComponent.verifyAwarenessCheckQuestionIsCreated(
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.MULTIPLE[0].question
      );

      // Verify awareness check is configured
      console.log('✓ Admin configuration completed successfully');
    }
  );

  test(
    'Verify admin can edit awareness check question',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@MUST_READ_ADMIN'],
    },
    async ({ appManagersPage }) => {
      tagTest(test.info(), {
        description: 'Verify admin can create awareness check with single question',
        zephyrTestId: 'EL-MR-001',
        storyId: 'Awareness Check Creation',
      });

      // Navigate to content detail page
      const contentPreviewPage = new ContentPreviewPage(appManagersPage, createdSiteId, createdContentId);
      await contentPreviewPage.navigateToContentDetail(createdContentId, createdSiteId);
      await contentPreviewPage.verifyThePageIsLoaded();

      // Initialize Awareness Check component
      const mustReadComponent = new MustReadComponent(appManagersPage);

      // STEP 1: Configure Must Read settings
      // Select awareness check from menu options
      await mustReadComponent.contentThreeDotsMenu.click();

      // Select awareness check from menu options
      await mustReadComponent.selectMustReadFromMenuOptions();

      // Initialize Awareness Check component
      const awarenessCheckComponent = new AwarenessCheckComponent(appManagersPage);

      // STEP 2: Configure Awareness Check settings
      // Enable Awareness Check
      await awarenessCheckComponent.enableAwarenessCheck();

      // Add questions for awareness check
      await awarenessCheckComponent.enterAwarenessQuestions([
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE,
      ]);

      // Click on make must read button
      await awarenessCheckComponent.clickOnMakeMustReadButton();

      //Verify created awareness check question
      await awarenessCheckComponent.verifyAwarenessCheckQuestionIsCreated(
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE.question
      );
      // Verify awareness check is configured
      console.log('✓ Admin configuration completed successfully');

      // Click on edit awareness check three dots
      await awarenessCheckComponent.clickOnAwarenessThreeDots();

      // Click on edit awareness check
      await awarenessCheckComponent.clickOnEditAwarenessCheck();

      // Edit awareness check question
      await awarenessCheckComponent.editAwarenessQuestions([
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.UPDATED_QUESTIONS.SINGLE,
      ]);

      // Click on update awareness check button
      await awarenessCheckComponent.updateAwarenessCheckButton.click();

      // Verify updated awareness check question
      await awarenessCheckComponent.verifyAwarenessCheckQuestionIsCreated(
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.UPDATED_QUESTIONS.SINGLE.question
      );
    }
  );

  test(
    'Verify admin can remove awareness check question',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@MUST_READ_ADMIN'],
    },
    async ({ appManagersPage }) => {
      tagTest(test.info(), {
        description: 'Verify admin can create awareness check with single question',
        zephyrTestId: 'EL-MR-001',
        storyId: 'Awareness Check Creation',
      });

      // Navigate to content detail page
      const contentPreviewPage = new ContentPreviewPage(appManagersPage, createdSiteId, createdContentId);
      await contentPreviewPage.navigateToContentDetail(createdContentId, createdSiteId);
      await contentPreviewPage.verifyThePageIsLoaded();

      // Initialize Awareness Check component
      const mustReadComponent = new MustReadComponent(appManagersPage);

      // STEP 1: Configure Must Read settings
      // Select awareness check from menu options
      await mustReadComponent.contentThreeDotsMenu.click();

      // Select awareness check from menu options
      await mustReadComponent.selectMustReadFromMenuOptions();

      // Initialize Awareness Check component
      const awarenessCheckComponent = new AwarenessCheckComponent(appManagersPage);

      // STEP 2: Configure Awareness Check settings
      // Enable Awareness Check
      await awarenessCheckComponent.enableAwarenessCheck();

      // Add questions for awareness check
      await awarenessCheckComponent.enterAwarenessQuestions([
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE,
      ]);

      // Click on make must read button
      await awarenessCheckComponent.clickOnMakeMustReadButton();

      //Verify created awareness check question
      await awarenessCheckComponent.verifyAwarenessCheckQuestionIsCreated(
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE.question
      );
      // Verify awareness check is configured
      console.log('✓ Admin configuration completed successfully');

      // Click on edit awareness check three dots
      await awarenessCheckComponent.clickOnAwarenessThreeDots();

      // Click on edit awareness check
      await awarenessCheckComponent.clickOnRemoveAwarenessCheck();

      // Click on confirm remove awareness check button
      await awarenessCheckComponent.removeAwarenessCheck();

      // Verify awareness check question is removed
      await awarenessCheckComponent.verifyAwarenessCheckQuestionIsRemoved(
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE.question
      );

      // Verify awareness check is not configured
      console.log('✓ Admin configuration completed successfully');
    }
  );
});
