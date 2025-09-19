import { test } from '@employee-listening/fixtures/loginFixture';
import { AwarenessCheckPage } from '@employee-listening/pages/awarenessCheckPage';
import { AwarenessQuestionData } from '@employee-listening/types/awareness-check.type';
import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';

// Import content creation related types
import { PageContentType } from '@/src/modules/content/constants/pageContentType';

test.describe('Awareness Check Functionality', { tag: ['@awarenessCheck'] }, () => {
  let awarenessCheckPage: AwarenessCheckPage;
  let createdPageInfo: { pageId: string; siteId: string; pageTitle: string };

  test.beforeEach(async ({ appManagerPage }) => {
    awarenessCheckPage = new AwarenessCheckPage(appManagerPage);
    await awarenessCheckPage.loadPage();
    createdPageInfo = await awarenessCheckPage.actions.createPageWithAwarenessCheck({
      pageTitle: `Test Page for Awareness Check - ${test.info().title}`,
      contentType: PageContentType.NEWS,
      stepInfo: 'Create test page for awareness check',
    });
  });
  test(
    'Verify admin can create a awareness check with question',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@createAwarenessCheck'],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'EL-1001',
        description: 'Verify admin can create awareness check with questions',
      });

      // Page creation is now handled in beforeEach using the reusable method
      // The page is created and published, and we're already on the content page
      // No need to navigate again since createPageWithAwarenessCheck ends on the content page

      // Click on option menu three dot to access "Make 'must read'" option
      await awarenessCheckPage.actions.clickThreeDotIcon({
        stepInfo: 'Click three dot menu to access must read options',
      });

      // TODO: Add "Make must read" action - this step needs to be implemented
      // And Click on "Make 'must read'"

      // Toggle "Enable Awareness check" checkbox "check"
      await awarenessCheckPage.actions.toggleCheckbox('Enable Awareness check', true, {
        stepInfo: 'Enable awareness check checkbox',
      });

      // Enter awareness check question and answers
      const questions: AwarenessQuestionData[] = [
        {
          question: 'First Question',
          answers: ['answer1', 'answer2'],
          correctness: ['correct', 'incorrect'],
        },
        {
          question: 'Second Question',
          answers: ['answer1', 'answer2', 'answer3'],
          correctness: ['correct', 'correct', 'incorrect'],
        },
        {
          question: 'Third Question',
          answers: ['answer1', 'answer3', 'answer4', 'answer5'],
          correctness: ['incorrect', 'correct', 'correct', 'incorrect'],
        },
      ];

      await awarenessCheckPage.actions.enterAwarenessQuestions(questions, {
        stepInfo: 'Enter awareness check questions with answers',
      });

      // TODO: Add "Make must read" action
      // And Click on "Make must read"

      // Verify first question is visible
      await awarenessCheckPage.assertions.verifyQuestionIsVisible('First Question', {
        stepInfo: 'Verify first question is visible on screen',
      });
    }
  );

  test(
    'Verify admin can edit the awareness check with single question',
    {
      tag: [TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'EL-1002',
        description: 'Verify admin can edit awareness check with single question',
      });

      // Page creation is now handled in beforeEach using the reusable method
      // We're already on the content page, no need to navigate again

      // Toggle "Enable Awareness check" checkbox "check"
      await awarenessCheckPage.actions.toggleCheckbox('Enable Awareness check', true, {
        stepInfo: 'Enable awareness check checkbox',
      });

      // Enter initial question
      const initialQuestions: AwarenessQuestionData[] = [
        {
          question: 'First Question',
          answers: ['answer1', 'answer2'],
          correctness: ['correct', 'incorrect'],
        },
      ];

      await awarenessCheckPage.actions.enterAwarenessQuestions(initialQuestions, {
        stepInfo: 'Enter initial awareness check question',
      });

      // TODO: Add "Make must read" action

      // Click three dot icon
      await awarenessCheckPage.actions.clickThreeDotIcon({
        stepInfo: 'Click three dot icon',
      });

      // TODO: Add "Click on Edit label" action
      // And Click on "Edit" label

      // Edit awareness check question and answers
      const updatedQuestions: AwarenessQuestionData[] = [
        {
          question: 'First Question Updated',
          answers: ['answer1Updated', 'answerUpdated'],
          correctness: ['incorrect', 'correct'],
        },
      ];

      await awarenessCheckPage.actions.editAwarenessQuestions(updatedQuestions, {
        stepInfo: 'Edit awareness check question and answers',
      });

      // TODO: Add "Click on Update button" action
      // Then Click on 'Update' button

      // Verify updated question is visible
      await awarenessCheckPage.assertions.verifyQuestionIsVisible('First Question Updated', {
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

      // Page creation is now handled in beforeEach using the reusable method
      // We're already on the content page, no need to navigate again

      // Toggle "Enable Awareness check" checkbox "check"
      await awarenessCheckPage.actions.toggleCheckbox('Enable Awareness check', true, {
        stepInfo: 'Enable awareness check checkbox',
      });

      // Enter initial questions
      const initialQuestions: AwarenessQuestionData[] = [
        {
          question: 'First Question',
          answers: ['answer1', 'answer2'],
          correctness: ['correct', 'incorrect'],
        },
        {
          question: 'Second Question',
          answers: ['answer1', 'answer2', 'answer3'],
          correctness: ['correct', 'correct', 'incorrect'],
        },
        {
          question: 'Third Question',
          answers: ['answer1', 'answer3', 'answer4', 'answer5'],
          correctness: ['incorrect', 'correct', 'correct', 'incorrect'],
        },
      ];

      await awarenessCheckPage.actions.enterAwarenessQuestions(initialQuestions, {
        stepInfo: 'Enter initial awareness check questions',
      });

      // TODO: Add "Make must read" action

      // Click three dot icon
      await awarenessCheckPage.actions.clickThreeDotIcon({
        stepInfo: 'Click three dot icon',
      });

      // TODO: Add "Click on Edit label" action

      // Edit awareness check questions
      const updatedQuestions: AwarenessQuestionData[] = [
        {
          question: 'First Question Updated',
          answers: ['answer1', 'answer2Updated'],
          correctness: ['correct', 'incorrect'],
        },
        {
          question: 'Second Question Updated',
          answers: ['answer1Updated', 'answer2Updated', 'answer3Updated'],
          correctness: ['correct', 'incorrect', 'incorrect'],
        },
        {
          question: 'Third Question Updated',
          answers: ['answer1Updated', 'answer3Updated', 'answer4Updated', 'answer5Updated'],
          correctness: ['incorrect', 'incorrect', 'correct', 'incorrect'],
        },
      ];

      await awarenessCheckPage.actions.editAwarenessQuestions(updatedQuestions, {
        stepInfo: 'Edit awareness check questions and answers',
      });

      // TODO: Add "Click on Update button" action

      // Verify updated question is visible
      await awarenessCheckPage.assertions.verifyQuestionIsVisible('First Question Updated', {
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

      // Page creation is now handled in beforeEach using the reusable method
      // We're already on the content page, no need to navigate again

      // Toggle "Enable Awareness check" checkbox "check"
      await awarenessCheckPage.actions.toggleCheckbox('Enable Awareness check', true, {
        stepInfo: 'Enable awareness check checkbox',
      });

      // Enter initial questions
      const initialQuestions: AwarenessQuestionData[] = [
        {
          question: 'First Question',
          answers: ['answer1', 'answer2'],
          correctness: ['correct', 'incorrect'],
        },
        {
          question: 'Second Question',
          answers: ['answer1', 'answer2', 'answer3'],
          correctness: ['correct', 'correct', 'incorrect'],
        },
        {
          question: 'Third Question',
          answers: ['answer1', 'answer3', 'answer4', 'answer5'],
          correctness: ['incorrect', 'correct', 'correct', 'incorrect'],
        },
      ];

      await awarenessCheckPage.actions.enterAwarenessQuestions(initialQuestions, {
        stepInfo: 'Enter initial awareness check questions',
      });

      // TODO: Add "Make must read" action

      // Click three dot icon
      await awarenessCheckPage.actions.clickThreeDotIcon({
        stepInfo: 'Click three dot icon',
      });

      // TODO: Add "Click on Edit label" action

      // Edit awareness check questions
      const updatedQuestions: AwarenessQuestionData[] = [
        {
          question: 'First Question Updated',
          answers: ['answer1', 'answer2Updated'],
          correctness: ['correct', 'incorrect'],
        },
        {
          question: 'Second Question Updated',
          answers: ['answer1Updated', 'answer2Updated', 'answer3Updated'],
          correctness: ['correct', 'incorrect', 'incorrect'],
        },
        {
          question: 'Third Question Updated',
          answers: ['answer1Updated', 'answer3Updated', 'answer4Updated', 'answer5Updated'],
          correctness: ['incorrect', 'incorrect', 'correct', 'incorrect'],
        },
      ];

      await awarenessCheckPage.actions.editAwarenessQuestions(updatedQuestions, {
        stepInfo: 'Edit awareness check questions and answers',
      });

      // TODO: Add "Click on Update button" action

      // Verify updated question is visible
      await awarenessCheckPage.assertions.verifyQuestionIsVisible('First Question Updated', {
        stepInfo: 'Verify updated question is visible on screen',
      });

      // Click three dot icon again
      await awarenessCheckPage.actions.clickThreeDotIcon({
        stepInfo: 'Click three dot icon for removal',
      });

      // TODO: Add "Click on Remove label" action
      // Then Click on "Remove" label

      // Click on the "Remove" button from the Remove awareness check popup window
      await awarenessCheckPage.actions.clickButtonInPopup('Remove', {
        stepInfo: 'Click Remove button from popup window',
      });

      // Verify question is not visible
      await awarenessCheckPage.assertions.verifyQuestionIsNotVisible('First Question Updated', {
        stepInfo: 'Verify question is not visible after removal',
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

      // Page creation is now handled in beforeEach using the reusable method
      // We're already on the content page, no need to navigate again

      // Toggle "Enable Awareness check" checkbox "check"
      await awarenessCheckPage.actions.toggleCheckbox('Enable Awareness check', true, {
        stepInfo: 'Enable awareness check checkbox',
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

      // Choose answer
      await awarenessCheckPage.actions.chooseAnswer('answer2', {
        stepInfo: 'Choose answer: answer2',
      });

      // TODO: Add "Click on Finish" action
      // And Click on "Finish"

      // Verify confirmation message
      await awarenessCheckPage.assertions.verifyConfirmationMessage(
        "You've confirmed that you read and understood the content.",
        {
          stepInfo: 'Verify confirmation message is visible',
        }
      );

      // TODO: Add "Click on View history" action
      // And Click on "View history"

      // Verify popup title
      await awarenessCheckPage.assertions.verifyPopupTitle('Must read report', {
        stepInfo: 'Verify popup window has correct title',
      });
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
      await awarenessCheckPage.actions.toggleCheckbox('Enable Awareness check', true, {
        stepInfo: 'Enable awareness check checkbox',
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
      await awarenessCheckPage.actions.toggleCheckbox('Enable Awareness check', true, {
        stepInfo: 'Enable awareness check checkbox',
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
