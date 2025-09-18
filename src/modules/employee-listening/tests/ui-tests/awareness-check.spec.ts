import { EmployeeListeningFeatureTags, EmployeeListeningSuiteTags } from '@employee-listening/constants/testTags';
import { test } from '@employee-listening/fixtures/loginFixture';
import { AwarenessCheckPage, AwarenessQuestionData } from '@employee-listening/pages/awarenessCheckPage';
import { EMPLOYEE_LISTENING_TEST_DATA } from '@employee-listening/test-data/module.test-data';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';

import { PageContentType } from '@/src/modules/content/constants/pageContentType';

test.describe('Awareness Check Functionality', { tag: [EmployeeListeningSuiteTags.AWARENESS_CHECK] }, () => {
  let awarenessCheckPage: AwarenessCheckPage;
  let createdPageInfo: { pageTitle: string };

  test.beforeEach(async ({ page, loginAs }) => {
    // Step 1: Navigate to the base URL
    const baseUrl = getEnvConfig().frontendBaseUrl.replace(/\/$/, '');
    await page.goto(baseUrl);

    // Step 2: Login using the login fixture
    await loginAs('appManager');

    // Step 3: Initialize awareness check page (without loading specific site yet)
    // We'll create page content dynamically using the reusable method
    awarenessCheckPage = new AwarenessCheckPage(page);

    // Step 4: Create page form and fill details (without publishing)
    // This replaces the manual TODO steps for page creation
    const { pageTitle } = await awarenessCheckPage.actions.createPage({
      pageTitle: `Test Page for Awareness Check - ${test.info().title}`,
      contentType: PageContentType.NEWS,
      stepInfo: 'Setup page creation form for awareness check',
    });

    createdPageInfo = { pageTitle };
  });
  test(
    'Verify admin can create a awareness check with question',
    {
      tag: [
        TestPriority.P0,
        TestGroupType.SMOKE,
        EmployeeListeningSuiteTags.CREATE_AWARENESS_CHECK,
        EmployeeListeningFeatureTags.QUESTION_MANAGEMENT,
      ],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'EL-1001',
        description: 'Verify admin can create awareness check with questions',
      });

      // Click three dot icon
      await awarenessCheckPage.actions.hoverOverThreeDotIcon({
        stepInfo: 'Click More button (three dots)',
      });

      // Click must read button
      await awarenessCheckPage.actions.selectMustReadOption({
        stepInfo: 'Click must read button',
      });

      // Toggle "Enable Awareness check" checkbox "check"
      await awarenessCheckPage.actions.enableAwarenessCheck({
        stepInfo: 'Enable Awareness check',
      });

      // Enter awareness check question and answers using test data
      const questions = EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.MULTIPLE;

      await awarenessCheckPage.actions.enterAwarenessQuestions(questions, {
        stepInfo: 'Enter awareness check questions with answers',
      });

      // TODO: Add "Make must read" action
      await awarenessCheckPage.actions.clickMakeMustReadButton({
        stepInfo: 'Make must read',
      });

      // Verify first question is visible
      await awarenessCheckPage.assertions.verifyQuestionIsVisible(questions[0].question, {
        stepInfo: 'Verify first question is visible on screen',
      });
    }
  );

  test(
    'Verify admin can edit the awareness check with single question',
    {
      tag: [
        TestPriority.P1,
        TestGroupType.REGRESSION,
        EmployeeListeningSuiteTags.EDIT_AWARENESS_CHECK,
        EmployeeListeningFeatureTags.QUESTION_MANAGEMENT,
      ],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'EL-1002',
        description: 'Verify admin can edit awareness check with single question',
      });

      // Click three dot icon
      await awarenessCheckPage.actions.hoverOverThreeDotIcon({
        stepInfo: 'Click More button (three dots)',
      });

      // Click must read button
      await awarenessCheckPage.actions.selectMustReadOption({
        stepInfo: 'Click must read button',
      });

      // Toggle "Enable Awareness check" checkbox "check"
      await awarenessCheckPage.actions.enableAwarenessCheck({
        stepInfo: 'Enable Awareness check',
      });

      // Enter initial question using test data
      const initialQuestions: AwarenessQuestionData[] = [EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE];

      await awarenessCheckPage.actions.enterAwarenessQuestions(initialQuestions, {
        stepInfo: 'Enter initial awareness check question',
      });

      await awarenessCheckPage.actions.clickMakeMustReadButton({
        stepInfo: 'Make must read',
      });

      // Click three dot icon (More button)
      await awarenessCheckPage.actions.clickMoreButton({
        stepInfo: 'Click three dot icon (More button)',
      });

      // Click Edit button
      await awarenessCheckPage.actions.clickEditButton({
        stepInfo: 'Click Edit button',
      });

      // Edit awareness check question and answers using test data
      const updatedQuestions: AwarenessQuestionData[] = [
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.UPDATED_QUESTIONS.SINGLE,
      ];

      await awarenessCheckPage.actions.editAwarenessQuestions(updatedQuestions, {
        stepInfo: 'Edit awareness check question and answers',
      });

      await awarenessCheckPage.actions.clickUpdateButton({
        stepInfo: 'Click Update button',
      });

      // Verify updated question is visible
      await awarenessCheckPage.assertions.verifyQuestionIsVisible(updatedQuestions[0].question, {
        stepInfo: 'Verify updated question is visible on screen',
      });
    }
  );

  test(
    'Verify admin can edit the awareness check with multiple questions',
    {
      tag: [TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'EL-1003',
        description: 'Verify admin can edit awareness check with multiple questions',
      });
      // Click three dot icon
      await awarenessCheckPage.actions.hoverOverThreeDotIcon({
        stepInfo: 'Click More button (three dots)',
      });

      // Click must read button
      await awarenessCheckPage.actions.selectMustReadOption({
        stepInfo: 'Click must read button',
      });

      // Toggle "Enable Awareness check" checkbox "check"
      await awarenessCheckPage.actions.enableAwarenessCheck({
        stepInfo: 'Enable Awareness check',
      });

      // Enter initial questions
      const initialQuestions: AwarenessQuestionData[] = EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.MULTIPLE;

      await awarenessCheckPage.actions.enterAwarenessQuestions(initialQuestions, {
        stepInfo: 'Enter initial awareness check questions',
      });

      await awarenessCheckPage.actions.clickMakeMustReadButton({
        stepInfo: 'Make must read',
      });

      // Click three dot icon (More button)
      await awarenessCheckPage.actions.clickMoreButton({
        stepInfo: 'Click three dot icon (More button)',
      });

      // Click Edit button
      await awarenessCheckPage.actions.clickEditButton({
        stepInfo: 'Click Edit button',
      });

      const updatedQuestions: AwarenessQuestionData[] =
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.UPDATED_QUESTIONS.MULTIPLE;

      await awarenessCheckPage.actions.clickUpdateButton({
        stepInfo: 'Click Update button',
      });

      // Verify updated question is visible
      await awarenessCheckPage.assertions.verifyQuestionIsVisible(updatedQuestions[0].question, {
        stepInfo: 'Verify updated question is visible on screen',
      });
    }
  );

  test(
    'Verify admin can edit and remove the awareness check',
    {
      tag: [TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'EL-1004',
        description: 'Verify admin can edit and remove awareness check',
      });

      // Click three dot icon
      await awarenessCheckPage.actions.hoverOverThreeDotIcon({
        stepInfo: 'Click More button (three dots)',
      });

      // Click must read button
      await awarenessCheckPage.actions.selectMustReadOption({
        stepInfo: 'Click must read button',
      });

      // Toggle "Enable Awareness check" checkbox "check"
      await awarenessCheckPage.actions.enableAwarenessCheck({
        stepInfo: 'Enable Awareness check',
      });

      // Enter initial question using test data
      const initialQuestions: AwarenessQuestionData[] = [EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE];

      await awarenessCheckPage.actions.enterAwarenessQuestions(initialQuestions, {
        stepInfo: 'Enter initial awareness check question',
      });

      await awarenessCheckPage.actions.clickMakeMustReadButton({
        stepInfo: 'Make must read',
      });

      // Click three dot icon (More button)
      await awarenessCheckPage.actions.clickMoreButton({
        stepInfo: 'Click three dot icon (More button)',
      });

      // Click Edit button
      await awarenessCheckPage.actions.clickEditButton({
        stepInfo: 'Click Edit button',
      });

      // Edit awareness check question and answers using test data
      const updatedQuestions: AwarenessQuestionData[] = [
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.UPDATED_QUESTIONS.SINGLE,
      ];

      await awarenessCheckPage.actions.editAwarenessQuestions(updatedQuestions, {
        stepInfo: 'Edit awareness check question and answers',
      });

      await awarenessCheckPage.actions.clickUpdateButton({
        stepInfo: 'Click Update button',
      });

      // Verify updated question is visible
      await awarenessCheckPage.assertions.verifyQuestionIsVisible(updatedQuestions[0].question, {
        stepInfo: 'Verify updated question is visible on screen',
      });

      // Click three dot icon (More button)
      await awarenessCheckPage.actions.clickMoreButton({
        stepInfo: 'Click three dot icon (More button)',
      });

      await awarenessCheckPage.actions.removeAwarenessCheck({
        stepInfo: 'Remove awareness check',
      });
    }
  );

  test(
    'Verify admin can participate in the awareness check and view the report',
    {
      tag: [TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'EL-1005',
        description: 'Verify admin can participate in awareness check and view report',
      });

      // Click three dot icon
      await awarenessCheckPage.actions.hoverOverThreeDotIcon({
        stepInfo: 'Click More button (three dots)',
      });

      // Click must read button
      await awarenessCheckPage.actions.selectMustReadOption({
        stepInfo: 'Click must read button',
      });

      // Toggle "Enable Awareness check" checkbox "check"
      await awarenessCheckPage.actions.enableAwarenessCheck({
        stepInfo: 'Enable Awareness check',
      });

      // Enter awareness check question and answers using test data
      const questions = EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.QUESTIONS.SINGLE;

      await awarenessCheckPage.actions.enterAwarenessQuestions([questions], {
        stepInfo: 'Enter awareness check questions with answers',
      });

      // TODO: Add "Make must read" action
      await awarenessCheckPage.actions.clickMakeMustReadButton({
        stepInfo: 'Make must read',
      });

      // Verify first question is visible
      await awarenessCheckPage.assertions.verifyQuestionIsVisible(questions.question, {
        stepInfo: 'Verify first question is visible on screen',
      });

      // Select answer
      await awarenessCheckPage.actions.chooseAnswer(questions.answers[0], {
        stepInfo: 'Participate in awareness check',
      });

      //Click Finish button
      await awarenessCheckPage.actions.clickFinishButton({
        stepInfo: 'Click Finish button',
      });

      //Verify confirmation message is visible
      await awarenessCheckPage.assertions.verifyConfirmationMessage(
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.MESSAGES.PARTICIPATED,
        {
          stepInfo: 'Verify confirmation message is visible',
        }
      );

      // Click three dot icon
      await awarenessCheckPage.actions.hoverOverThreeDotIcon({
        stepInfo: 'Click More button (three dots)',
      });

      // Click Must read history button
      await awarenessCheckPage.actions.clickMustReadHistoryButton({
        stepInfo: 'Click Must read history button',
      });

      // Verify Must read report title is visible
      await awarenessCheckPage.assertions.verifyPopupTitle(
        EMPLOYEE_LISTENING_TEST_DATA.AWARENESS_CHECK.POPUP_TITLES.MUST_READ_REPORT,
        {
          stepInfo: 'Verify Must read report title is visible',
        }
      );
    }
  );

  test(
    'Verify that follower should not see Awareness check if created only for members',
    {
      tag: [TestPriority.P2, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'EL-1006',
        description: 'Verify follower cannot see awareness check created for members only',
      });

      // Page creation is now handled in beforeEach using the reusable method
      // We're already on the content page, no need to navigate again

      // Toggle "Enable Awareness check" checkbox "check"
      await awarenessCheckPage.actions.selectMustReadOption({
        stepInfo: 'Click must read button',
      });

      // Enter awareness check question
      const questions: AwarenessQuestionData[] = [
        {
          question: 'First Question',
          answers: ['answer1', 'answer2'],
          correctness: ['incorrect', 'correct'],
        },
      ];

      await awarenessCheckPage.actions.enterAwarenessQuestions(questions, {
        stepInfo: 'Enter awareness check question',
      });

      // TODO: Add "Make must read" action

      // TODO: Add "Get the current url" action
      // And Get the current url

      // TODO: Add logout and login as End_User
      // And Click on "Profile settings" icon
      // Then Logout
      // Given Login as "End_User"

      // Load recently created Awareness check site
      await awarenessCheckPage.actions.loadRecentlyCreatedSite({
        stepInfo: 'Load recently created awareness check site',
      });

      // Verify question is not visible
      await awarenessCheckPage.assertions.verifyQuestionIsNotVisible('First Question', {
        stepInfo: 'Verify question is not visible for follower',
      });
    }
  );

  test(
    'Verify end user not able to edit awareness check',
    {
      tag: [TestPriority.P2, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'EL-1007',
        description: 'Verify end user cannot edit awareness check',
      });

      // Page creation is now handled in beforeEach using the reusable method
      // We're already on the content page, no need to navigate again

      // Toggle "Enable Awareness check" checkbox "check"
      await awarenessCheckPage.actions.selectMustReadOption({
        stepInfo: 'Click must read button',
      });

      // Enter awareness check question
      const questions: AwarenessQuestionData[] = [
        {
          question: 'First Question',
          answers: ['answer1', 'answer2'],
          correctness: ['incorrect', 'correct'],
        },
      ];

      await awarenessCheckPage.actions.enterAwarenessQuestions(questions, {
        stepInfo: 'Enter awareness check question',
      });

      // TODO: Add "Make must read" action

      // TODO: Add "Get the current url" action

      // TODO: Add logout and login as End_User
      // And Click on "Profile settings" icon
      // Then Logout
      // Given Login as "End_User"

      // Load recently created Awareness check site
      await awarenessCheckPage.actions.loadRecentlyCreatedSite({
        stepInfo: 'Load recently created awareness check site',
      });

      // Verify three dot icon is not visible
      await awarenessCheckPage.assertions.verifyThreeDotIconIsNotVisible({
        stepInfo: 'Verify three dot icon is not visible for end user',
      });

      // Verify edit button is not visible
      await awarenessCheckPage.assertions.verifyEditButtonIsNotVisible({
        stepInfo: 'Verify edit button is not visible for end user',
      });
    }
  );
});
