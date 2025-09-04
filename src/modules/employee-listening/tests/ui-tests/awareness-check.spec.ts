import { AwarenessCheckPage } from '@employee-listening/pages/awarenessCheckPage';
import { AwarenessQuestionData } from '@employee-listening/types/awareness-check.type';
import { expect, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('Awareness Check Functionality', { tag: ['@awarenessCheck'] }, () => {
  let awarenessCheckPage: AwarenessCheckPage;

  test.beforeEach(async ({ page }) => {
    // TODO: Add proper login fixture and page navigation
    awarenessCheckPage = new AwarenessCheckPage(page);

    // TODO: Navigate to the awareness check page
    // await awarenessCheckPage.loadPage();
  });

  test(
    'Verify admin can create a awareness check with question',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE],
    },
    async () => {
      tagTest(test.info(), {
        zephyrTestId: 'EL-1001',
        description: 'Verify admin can create awareness check with questions',
      });

      // TODO: Add page creation steps
      // Given Login as "App_Manager"
      // Given Load `EL-UI-AUTOMATION` site
      // And Click on Add Content icon
      // And select the Add content label as "Page"
      // And Click on `Add`
      // And Enter "Page" content name
      // And Enter "Page Content" page content
      // And Select "News" content type
      // And Select "Uncategorized" category
      // And Click on Publish button at the bottom
      // And Click on "Skip this step"
      // And Click on option menu three dot
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

      // TODO: Add page creation and initial setup steps

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

      // TODO: Add page creation and initial setup steps

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

      // TODO: Add page creation and initial setup steps

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

      // TODO: Add page creation and initial setup steps

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

      // TODO: Add page creation and initial setup steps as App_Manager

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

      // TODO: Add page creation and initial setup steps as App_Manager

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
