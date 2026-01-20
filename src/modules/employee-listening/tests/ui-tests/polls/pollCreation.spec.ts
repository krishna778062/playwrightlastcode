import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { test } from '@/src/modules/employee-listening/fixtures/loginFixture';
import { PollsHelper } from '@/src/modules/employee-listening/helpers/polls';
import { AIPollCreationPage } from '@/src/modules/employee-listening/pages/polls/pollCreation';
import { PollsListeningPage } from '@/src/modules/employee-listening/pages/polls/pollsListingPage';
import { PollsSettingsPage } from '@/src/modules/employee-listening/pages/polls/pollsSettingsPage';

test.describe('aI Poll Creation Tests', () => {
  let pollsSettingsPage: PollsSettingsPage;
  let pollsListeningPage: PollsListeningPage;
  let aiPollCreationPage: AIPollCreationPage;
  let pollsHelper: PollsHelper;

  test.beforeEach(async ({ appManagersPage }) => {
    pollsSettingsPage = new PollsSettingsPage(appManagersPage);
    pollsListeningPage = new PollsListeningPage(appManagersPage);
    aiPollCreationPage = new AIPollCreationPage(appManagersPage);
    pollsHelper = new PollsHelper(pollsSettingsPage, pollsListeningPage, aiPollCreationPage);

    await pollsHelper.setupPollsConfiguration('enable', true);
  });

  test(
    'verify create AI poll modal behaviour',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS', TestGroupType.HEALTHCHECK],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify AI poll creation page UI elements and create poll using manual prompt entry',
        zephyrTestId: 'LS-7337',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await aiPollCreationPage.verifyAIPollGenerationSectionIsVisible();
      await aiPollCreationPage.verifyAIPromptDescriptionText();
      await aiPollCreationPage.verifyAIPromptPlaceholder();
      await aiPollCreationPage.verifyQuickPromptsSection();
      await aiPollCreationPage.verifyManualCreationSection();
      await aiPollCreationPage.enterManualPrompt('best lunch place');
      await aiPollCreationPage.clickGenerateButton();
      await aiPollCreationPage.verifyPollQuestionFieldIsVisible();
      await aiPollCreationPage.verifyPollOptionsHeadingIsVisible();
      await aiPollCreationPage.verifyPollOptionsAreGenerated();
      await aiPollCreationPage.verifyAddOptionButtonIsVisible();
    }
  );

  test(
    'create a poll using AI suggestion Quick prompt',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@AI_POLLS', TestGroupType.HEALTHCHECK],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify user can create a poll using AI suggestion with any available quick prompt',
        zephyrTestId: 'LS-7336',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await pollsHelper.addPoll({
        quickPrompt: 0,
        generateButton: true,
        nextButton: true,
        selectTargetAudience: ['India'],
        postButton: true,
      });
    }
  );

  test(
    'verify Poll is Generated on Valid Prompt',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS', TestGroupType.HEALTHCHECK],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify user can create a poll using manual prompt entry and verify loading states during generation',
        zephyrTestId: 'LS-7400',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await aiPollCreationPage.enterManualPrompt('I want to ask my team what they want for team lunch');
      await aiPollCreationPage.generateButton.click();

      await aiPollCreationPage.verifyPollQuestionAndOptionsLoadingState();
      await aiPollCreationPage.verifyLoadingStateIsShown();
      await aiPollCreationPage.verifyGenerateButtonLoadingState();
      await aiPollCreationPage.verifyGeneratedPollLabelIsDisplayed();
      await aiPollCreationPage.verifyPollQuestionAndOptionsGenerated();
    }
  );

  test(
    'verify Poll Fields Are Editable After AI Poll Generation',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify user can generate a poll with AI, edit question and options, and add more options using Add option link',
        zephyrTestId: 'LS-7402',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await pollsHelper.addPoll({
        userPrompt: 'What is the best way to improve team productivity?',
        generateButton: true,
      });

      await aiPollCreationPage.verifyEditableOptionsMessage();
      await aiPollCreationPage.verifyAddOptionButtonIsVisible();
      await aiPollCreationPage.editPollQuestion('What are your preferred office hours?');
      await aiPollCreationPage.editPollOption([4, 'Flexible hours']);
      await aiPollCreationPage.clickNextButton();
    }
  );

  test(
    'verify X Button Discards AI generated Poll Creation',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS', TestGroupType.HEALTHCHECK],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify discard poll modal appears when user closes poll creation after generating a poll with AI',
        zephyrTestId: 'LS-7403',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await pollsHelper.addPoll({
        userPrompt: 'What should be our team building activity?',
        generateButton: true,
      });
      await aiPollCreationPage.clickCloseButton();
      await aiPollCreationPage.verifyDiscardChangesModalIsOpen();
      await aiPollCreationPage.verifyDiscardChangesNote();
      await aiPollCreationPage.verifyDiscardAndKeepEditingButtons();
    }
  );

  test(
    'verify Next Button of Poll creation page Navigates to Final Stage',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify Target audience section is visible and Create poll title remains after clicking Next button twice',
        zephyrTestId: 'LS-7404',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await pollsHelper.addPoll({
        quickPrompt: 0,
        generateButton: true,
        nextButton: true,
      });

      await aiPollCreationPage.verifyBrowseAudiencesButton();
      await aiPollCreationPage.verifyPostButtonIsDisabled();
    }
  );

  test(
    'verify default UI of Target Audience section',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify default UI of Target Audience section shows no audiences selected and Browse button is visible',
        zephyrTestId: 'LS-7406',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await pollsHelper.addPoll({
        userPrompt: 'What are your thoughts on remote work?',
        generateButton: true,
        nextButton: true,
      });

      await aiPollCreationPage.verifyTargetAudienceSectionIsVisible();
      await aiPollCreationPage.verifyAudienceHelpText();
      await aiPollCreationPage.verifyBrowseAudiencesButton();
      await aiPollCreationPage.verifyNoDefaultAudienceSelection();
      await aiPollCreationPage.verifyBrowseButtonIsVisible();
      await aiPollCreationPage.clickBrowseAudiencesButton();
      await aiPollCreationPage.selectAudiences(['India']);
    }
  );

  test(
    'verify default selection in Poll End Date dropdown',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify participation window default value, options, calendar display, and date restrictions (past dates disabled, future dates within 60 days selectable)',
        zephyrTestId: 'LS-7407',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await pollsHelper.addPoll({
        quickPrompt: 0,
        generateButton: true,
        nextButton: true,
      });

      await aiPollCreationPage.verifyParticipationWindowDefaultValue();
      await aiPollCreationPage.verifyParticipationWindowOptions();
      await aiPollCreationPage.selectParticipationWindowOption('Select date');
      await aiPollCreationPage.verifyCalendarIsDisplayed();
      await aiPollCreationPage.verifyPastDatesAreDisabled();
      await aiPollCreationPage.verifyFutureDatesWithin30DaysAreSelectable();
      await aiPollCreationPage.verifyDatesBeyond60DaysAreDisabled();
    }
  );

  test(
    'validate default toggle state of all the toggle button on the 2nd stage of the poll',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS', TestGroupType.HEALTHCHECK],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify poll settings toggles default states, visibility conditions, and help text verification. Keep responses confidential is OFF by default, allowing Share results before voting to be visible when Show results after participation is enabled.',
        zephyrTestId: 'LS-7411',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await pollsHelper.addPoll({
        quickPrompt: 0,
        generateButton: true,
        nextButton: true,
      });

      await aiPollCreationPage.verifyShareResultsBeforeVotingToggleIsHidden();
      await aiPollCreationPage.verifyAllowMultipleOptionsToggleIsVisible();
      await aiPollCreationPage.verifyAllowMultipleOptionsToggleIsDisabled();
      await aiPollCreationPage.verifyAllowMultipleOptionsHelpText();
      await aiPollCreationPage.verifyShowResultsAfterParticipationToggleIsVisible();
      await aiPollCreationPage.verifyShowResultsAfterParticipationToggleIsDisabled();
      await aiPollCreationPage.verifyShowResultsAfterParticipationHelpText();
      await aiPollCreationPage.verifyKeepResponsesConfidentialToggleIsVisible();
      await aiPollCreationPage.verifyKeepResponsesConfidentialToggleIsDisabled();
      await aiPollCreationPage.verifyKeepResponsesConfidentialHelpText();
      await aiPollCreationPage.enableShowResultsAfterParticipationToggle();
      await aiPollCreationPage.verifyShareResultsBeforeVotingToggleIsVisible();
      await aiPollCreationPage.verifyShareResultsBeforeVotingToggleIsDisabled();
      await aiPollCreationPage.verifyShareResultsBeforeVotingHelpText();
    }
  );

  test(
    'custom end date selection from calendar',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS', TestGroupType.HEALTHCHECK],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify user can select future date from calendar with validation - past dates disabled, dates beyond 60 days disabled, selected date appears in input field with proper formatting and caption display',
        zephyrTestId: 'LS-7413',
        storyId: 'EL-UI Automation',
      });

      // Use current date + 15 days for testing purposes
      const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // Current date + 15 days

      await pollsListeningPage.clickCreatePollButton();
      await pollsHelper.addPoll({
        quickPrompt: 0,
        generateButton: true,
        nextButton: true,
        participationWindow: {
          option: 'Select date',
          customEndDate: futureDate,
        },
      });

      const expectedCaptionDate = futureDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const expectedCaption = `This poll will end on ${expectedCaptionDate}`;
      await aiPollCreationPage.verifyDateCaptionIsDisplayed(expectedCaption);
    }
  );

  test(
    'verify Mandatory Fields on Create Poll Final Stage',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify mandatory fields validation on Create Poll final stage: Target Audience field marked with red asterisk, Poll End Date field is configurable, and Post button is disabled when mandatory fields are not filled to prevent user from proceeding or publishing the poll',
        zephyrTestId: 'LS-7449',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await pollsHelper.addPoll({
        quickPrompt: 0,
        generateButton: true,
        nextButton: true,
      });

      await aiPollCreationPage.verifyAudienceFieldAsterisk();
    }
  );

  test(
    'generate AI Poll without specifying option count',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@AI_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify that when user generates a poll without specifying number of options, the AI poll generator creates exactly 4 options by default',
        zephyrTestId: 'LS-7548',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await pollsHelper.addPoll({
        quickPrompt: 0,
        generateButton: true,
      });

      await aiPollCreationPage.verifyNumberOfGeneratedOptions(4);
    }
  );

  test(
    'verify Prompt Validation for Too Few Words',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify that when user enters insufficient details (single word "poll") in AI prompt input field, the Generate button remains disabled to prevent poll generation',
        zephyrTestId: 'LS-7550',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await aiPollCreationPage.enterManualPrompt('poll');
      await aiPollCreationPage.verifyPromptInputValue('poll');
      await aiPollCreationPage.verifyGenerateButtonIsDisabled();
    }
  );

  test(
    'discard AI-generated poll with unsaved changes',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify complete discard poll functionality: user can generate poll, open discard modal, close it, reopen it, and successfully discard the poll with all unsaved data being lost',
        zephyrTestId: 'LS-7618',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await pollsHelper.addPoll({
        userPrompt: 'Best way to improve team productivity?',
        generateButton: true,
        nextButton: true,
      });

      await aiPollCreationPage.clickCloseButton();
      await aiPollCreationPage.verifyDiscardChangesModalIsOpen();
      await aiPollCreationPage.verifyDiscardChangesNote();
      await aiPollCreationPage.verifyDiscardAndKeepEditingButtons();
      await aiPollCreationPage.clickDiscardModalCloseButton();
      await aiPollCreationPage.verifyDiscardChangesModalIsClosed();
      await aiPollCreationPage.clickCloseButton();
      await aiPollCreationPage.verifyDiscardChangesModalIsOpen();
      await aiPollCreationPage.clickDiscardButton();
      await pollsListeningPage.verifyThePageIsLoaded();
      await pollsListeningPage.verifyNoPollWithPromptExists('What is the best way to improve team productivity?');
    }
  );

  test(
    'keep editing AI-generated poll with unsaved changes',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify that when user generates a poll and clicks "Keep editing" in discard modal, they return to poll creation window with all previously entered poll data remaining visible and no data lost or reset',
        zephyrTestId: 'LS-7619',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await pollsHelper.addPoll({
        quickPrompt: 1,
        generateButton: true,
      });

      const originalQuestion = await aiPollCreationPage.getPollQuestionValue();
      const originalOptions = await aiPollCreationPage.getAllPollOptionsValues();

      await aiPollCreationPage.clickCloseButton();
      await aiPollCreationPage.verifyDiscardChangesModalIsOpen();
      await aiPollCreationPage.verifyDiscardAndKeepEditingButtons();
      await aiPollCreationPage.clickKeepEditingButton();
      await aiPollCreationPage.verifyDiscardChangesModalIsClosed();
      await aiPollCreationPage.verifyPollQuestionFieldIsVisible();
      await aiPollCreationPage.verifyPollQuestionValue(originalQuestion);
      await aiPollCreationPage.verifyAllPollOptionsValues(originalOptions);
      await aiPollCreationPage.verifyPollOptionsAreGenerated();
      await aiPollCreationPage.verifyGeneratedPollLabelIsDisplayed();
    }
  );

  test(
    'aI fails to generate poll due to invalid input',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS', TestGroupType.HEALTHCHECK],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify that when user enters invalid prompt "e tt yu", the system displays inline error message "Couldn\'t generate a poll. Try rephrasing." after clicking Generate button',
        zephyrTestId: 'LS-7845',
        storyId: 'EL-UI Automation',
      });
      await pollsListeningPage.clickCreatePollButton();
      await aiPollCreationPage.enterManualPrompt('e tt yu');
      await aiPollCreationPage.generateButton.click();
      await aiPollCreationPage.verifyInlineErrorMessage();
    }
  );

  test(
    'regenerate poll with AI',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS', TestGroupType.HEALTHCHECK],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify that when user generates a poll using AI and clicks "Re-generate poll with AI", the previous prompt is displayed in the AI input field and new AI-generated poll question and options replace the old ones',
        zephyrTestId: 'LS-7846',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();

      const firstPrompt = 'What is the best way to improve workplace communication?';
      const secondPrompt = 'How can we enhance team collaboration?';
      await aiPollCreationPage.enterManualPrompt(firstPrompt);
      await aiPollCreationPage.clickGenerateButton();

      await aiPollCreationPage.verifyPollQuestionFieldIsVisible();
      await aiPollCreationPage.verifyPollOptionsAreGenerated();
      await aiPollCreationPage.clickRegenerateButton();
      await aiPollCreationPage.verifyPromptValue(firstPrompt);
      await aiPollCreationPage.enterManualPrompt(secondPrompt);
      await aiPollCreationPage.verifyPromptValue(secondPrompt);
      await aiPollCreationPage.clickGenerateButton();
      await aiPollCreationPage.verifyPollQuestionFieldIsVisible();
      await aiPollCreationPage.verifyPollOptionsAreGenerated();
      await aiPollCreationPage.verifyGeneratedPollLabelIsDisplayed();
    }
  );

  test(
    'add and view selected audiences',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify that when user selects multiple audiences, they are listed with remove icons, total user count is displayed, and maximum 6 avatars are shown with others collapsed',
        zephyrTestId: 'LS-7412',
        storyId: 'EL-UI Automation',
      });
      const selectedAudiences = ['India', 'Finance-india'];

      await pollsListeningPage.clickCreatePollButton();
      await pollsHelper.addPoll({
        quickPrompt: 1,
        generateButton: true,
        nextButton: true,
        selectTargetAudience: ['India', 'Finance-india'],
      });
      await aiPollCreationPage.verifySelectedAudiencesWithRemoveIcons(selectedAudiences);
      await aiPollCreationPage.verifySelectedUserCount(String.raw`\d+\s+users`);
      await aiPollCreationPage.verifyMaximumSixAvatarsDisplayed();
    }
  );

  test(
    'verify Poll Question Field Behavior',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@polls', '@manual-poll', '@character-limit'],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify Poll Question Field Behavior',
        zephyrTestId: 'LS-7415',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await aiPollCreationPage.clickOrCreateManuallyButton();
      await aiPollCreationPage.verifyCharacterLimitCounter();
      await aiPollCreationPage.verifyCharacterCounterText('0/250');

      const testCases = [
        { length: 50, expected: '50/250' },
        { length: 250, expected: '250/250' },
      ];

      for (const testCase of testCases) {
        const text = await aiPollCreationPage.generateLongText(testCase.length);
        await aiPollCreationPage.fillPollQuestionWithText(text);
        await aiPollCreationPage.verifyCharacterCounterText(testCase.expected);
        await aiPollCreationPage.clearPollQuestionField();
      }

      const overLimitText = await aiPollCreationPage.generateLongText(251);
      await aiPollCreationPage.fillPollQuestionWithText(overLimitText);
      const actualValue = await aiPollCreationPage.getPollQuestionValue();
      const expectedCounter = actualValue.length === 250 ? '250/250' : '251/250';
      await aiPollCreationPage.verifyCharacterCounterText(expectedCounter);

      await aiPollCreationPage.clearPollQuestionField();
      await aiPollCreationPage.verifyNextButtonStateWithCharacterLimit(false);
    }
  );

  test(
    'display error for duplicate poll option entry',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Display error for duplicate poll option entry',
        zephyrTestId: 'LS-7417',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await aiPollCreationPage.clickOrCreateManuallyButton();
      await aiPollCreationPage.enterManualPollQuestion('What is your preferred work schedule?');
      await aiPollCreationPage.enterPollOption(0, 'Option A');

      const duplicateOptions = ['Option A', 'option a', ' Option A '];
      for (const option of duplicateOptions) {
        await aiPollCreationPage.enterPollOption(1, option);
        await aiPollCreationPage.verifyDuplicateOptionErrorMessage();
      }

      await aiPollCreationPage.enterPollOption(1, 'Option B');

      const longText = await aiPollCreationPage.generateLongText(101);
      await aiPollCreationPage.enterPollOption(0, longText);
      await aiPollCreationPage.verifyPollOptionInputBlocked(0, 100);
    }
  );

  test(
    'verify manual poll creation flow with ai enabled',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify complete manual poll creation flow: create poll with team event question, add options, select audience, post poll, verify confirmation toast, notification delivery, and poll visibility in polls list',
        zephyrTestId: 'LS-7421',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await aiPollCreationPage.clickOrCreateManuallyButton();
      await pollsHelper.addPoll({
        pollQuestion: 'What is your favorite team event activity?',
        pollOptions: ['Escape Room', 'Cooking Class', 'Outdoor Adventure'],
        nextButton: true,
        selectTargetAudience: ['All Employees'],
        postButton: true,
      });

      await pollsListeningPage.verifyPollExistsInList('What is your favorite team event activity?');
    }
  );

  test(
    'select Target Audience with ABAC Filters',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify complete audience selection workflow: create poll, verify audience modal, search and select Finance-india audience, and validate Post button behavior',
        zephyrTestId: 'LS-7422',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await aiPollCreationPage.clickOrCreateManuallyButton();
      await pollsHelper.addPoll({
        pollQuestion: 'What is your preferred development methodology?',
        pollOptions: ['Scrum', 'Kanban', 'Waterfall', 'Agile'],
        nextButton: true,
        selectTargetAudience: ['Finance-india'],
        postButton: true,
        allowMultipleOptionsToggle: true,
      });

      await pollsListeningPage.verifyPollExistsInList('What is your preferred development methodology?');
    }
  );

  test(
    'verify manual poll creation flow',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@MANUAL_POLL', TestGroupType.HEALTHCHECK],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify complete manual poll creation flow with AI disabled: create poll with team event question, add options, select audience, post poll, verify confirmation toast, notification delivery, and poll visibility in polls list',
        zephyrTestId: 'LS-7421',
        storyId: 'EL-UI Automation',
      });

      await pollsHelper.setupPollsConfiguration('enable', false);
      await pollsListeningPage.clickCreatePollButton();
      await pollsHelper.addPoll({
        pollQuestion: 'What is your favorite team event activity?',
        pollOptions: ['Escape Room', 'Cooking Class', 'Outdoor Adventure'],
        nextButton: true,
        selectTargetAudience: ['All Employees'],
        postButton: true,
      });

      await pollsListeningPage.verifyPollExistsInList('What is your favorite team event activity?');
    }
  );

  test(
    'verify "Undo votes" and tooltip for Public polls',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@POLL_VOTING'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Given Login as an End User, And User navigates to the Polls page via More in the side menu, And A poll with visibility set to Public is listed under Active polls, When User submits a vote on the public poll, Then The poll should display vote count/visibility label/expiry info/undo option, When User hovers over the tooltip icon next to the Public label, Then A tooltip should be shown with the message: Responses are public and visible to all, When User clicks on Undo vote, Then The selected vote should be cleared And The user should be allowed to submit a new vote',
        zephyrTestId: 'LS-7485',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.loadPage({ stepInfo: 'Navigate to Polls page for voting' });
      await pollsListeningPage.verifyThePageIsLoaded();
      await aiPollCreationPage.selectCreatorDropdownOption('canParticipate');
      await aiPollCreationPage.handlePollVotingWorkflow();
    }
  );

  test(
    'display poll in Present mode',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@POLL_PRESENT'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Given A poll is in "Active" state, Then The "Present" option should be visible, When User clicks the "Present" option from the 3-dot menu, Then A full-screen poll view should open, And A QR code should be displayed in a side panel to the left of the poll, And Below the QR code, the text "Scan and participate in this poll" should be shown',
        zephyrTestId: 'LS-7487',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.loadPage({ stepInfo: 'Navigate to Polls page' });
      await pollsListeningPage.verifyThePageIsLoaded();
      await aiPollCreationPage.selectCreatorDropdownOption('canParticipate');
      await aiPollCreationPage.verifyActivePollIsVisible();
      await aiPollCreationPage.clickThreeDotMenuForFirstPoll();
      await aiPollCreationPage.verifyPresentOptionIsVisible();
      await aiPollCreationPage.clickPresentOption();
      await aiPollCreationPage.verifyQRCodeIsDisplayedInSidePanel();
      await aiPollCreationPage.verifyQRCodeInstructionText();
    }
  );

  test(
    '“Present” option appears only for Active polls',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@POLL_PRESENT', '@DRAFT_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Given Login as "App Manager", And User navigates to the "Polls" page via "More" in the side menu, When User clicks the 3-dot menu on an "Active" poll, Then The "Present" option should be visible, When User clicks the 3-dot menu on "Draft" poll, Then The "Present" option should not be visible',
        zephyrTestId: 'LS-7479',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.loadPage({ stepInfo: 'Navigate to Polls page as App Manager' });
      await pollsListeningPage.verifyThePageIsLoaded();
      await aiPollCreationPage.verifyActivePollIsVisible();
      await aiPollCreationPage.clickThreeDotMenuForFirstPoll();
      await aiPollCreationPage.verifyPresentOptionIsVisible();
      await aiPollCreationPage.selectDraftPollsState();
      await aiPollCreationPage.verifyDraftPollIsVisible();
      await aiPollCreationPage.clickThreeDotMenuForFirstPoll();
      await aiPollCreationPage.verifyPresentOptionIsNotVisible();
    }
  );

  test(
    'verify "Active" and "Polls created by me" filters from the polls page',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@POLL_FILTERS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Given User navigates to the Polls page, Then Verify "Active" filter is visible on the polls page next to the search polls field, When User clicks on the "Active" filter, Then Verify Active filter should have "All polls", "Active polls", "Draft polls" and "Closed polls" options visible, When User clicks on the "Polls created by me" filter, Then Verify Creator filter should have "Polls I can manage", "Polls Created by me" and "Polls I can participate in" options visible',
        zephyrTestId: 'LS-7330',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.loadPage({ stepInfo: 'Navigate to Polls page' });
      await pollsListeningPage.verifyThePageIsLoaded();
      await aiPollCreationPage.verifyActiveFilterIsVisible();
      await aiPollCreationPage.verifyActiveFilterOptions();
      await aiPollCreationPage.testCreatorDropdownOptions();
    }
  );

  test(
    'verify user can filter polls by status: Active, Draft, Closed',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@POLL_FILTERS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Given User navigates to the Polls page, When User clicks on the "Active" filter dropdown, And selects "Active" from the filter, Then Verify that only Active polls are displayed, When User selects "Draft" from the filter, Then Verify that only Draft polls are displayed, When User selects "Closed" from the filter, Then Verify that only Closed polls are displayed',
        zephyrTestId: 'LS-7331',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.loadPage({ stepInfo: 'Navigate to Polls page' });
      await pollsListeningPage.verifyThePageIsLoaded();
      await aiPollCreationPage.clickActiveFilter();
      await aiPollCreationPage.selectActiveFilterOption('Active polls');
      await aiPollCreationPage.verifyOnlyActivePollsAreDisplayed();
      await aiPollCreationPage.selectActiveFilterOption('Draft polls');
      await aiPollCreationPage.verifyOnlyDraftPollsAreDisplayed();
      await aiPollCreationPage.selectActiveFilterOption('Closed polls');
      await aiPollCreationPage.verifyOnlyClosedPollsAreDisplayed();
    }
  );

  test(
    'validate generated AI poll title character limit',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Given Login as an "App Manager", And The AI poll generator is active, And User navigates to the "Polls" page via "More" in the side menu, And Click on the "Create" button, When A poll is generated, Then The poll title should be under 100 characters',
        zephyrTestId: 'LS-7555',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await pollsHelper.addPoll({
        quickPrompt: 0,
        generateButton: true,
      });

      await aiPollCreationPage.verifyPollTitleIsUnder100Characters();
    }
  );

  test(
    'validate the character limit for the AI poll description',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Given Login as an "App Manager", And The AI poll generator is active, And User navigates to the "Polls" page via "More" in the side menu, And Click on the "Create" button, Then The poll description character limit should be 1000 characters',
        zephyrTestId: 'LS-7556',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await aiPollCreationPage.verifyPollDescriptionCharacterLimit(1000);
    }
  );

  test(
    'verify poll creator details are visible on poll',
    {
      tag: [TestPriority.P1, TestGroupType.SMOKE, '@POLLS', '@POLL_METADATA'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Given Login as "App_Manager", Then Click on the "Employee listening" icon, And Click on the "More" option from the left navigation, Then Click on "Polls" under the "Employee Listening" dropdown, When User creates a poll with question "What are you thinking for lunch?" and options "Pizza", "Pasta", "Salad", "Biryani", And User publishes the poll, Then User navigates to the poll listing page, And User clicks on the created poll from the in app notification, Then Verify that at the top left of each poll displays Creator Name, Timestamp, and Poll Status as Active',
        zephyrTestId: 'LS-7431',
        storyId: 'EL-UI Automation',
      });
      await pollsListeningPage.clickCreatePollButton();
      await aiPollCreationPage.clickOrCreateManuallyButton();
      await pollsHelper.addPoll({
        pollQuestion: 'What are you thinking for lunch?',
        pollOptions: ['Pizza', 'Pasta', 'Salad', 'Biryani'],
        nextButton: true,
        selectTargetAudience: ['All Employees'],
        postButton: true,
      });
      await pollsListeningPage.loadPage({ stepInfo: 'Navigate back to Polls listing page' });
      await pollsListeningPage.verifyThePageIsLoaded();
      await aiPollCreationPage.verifyPollMetadataDisplay('What are you thinking for lunch?');
    }
  );

  test(
    'verify Tooltip on Hover Over Generate Button',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, '@POLLS', '@AI_POLLS'],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Verify that when user hovers over the Generate button, it shows proper visual feedback and maintains accessibility. Test validates button hover state, cursor changes, and any tooltip or visual indicators that appear on hover.',
        zephyrTestId: 'LS-7395',
        storyId: 'EL-UI Automation',
      });

      await pollsListeningPage.clickCreatePollButton();
      await aiPollCreationPage.enterManualPrompt('What are the best team collaboration tools?');
      await aiPollCreationPage.verifyGenerateButtonHoverBehavior();
    }
  );
});
