import test, { Locator, Page } from '@playwright/test';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';
import {
  getAlternativeAudienceCheckbox,
  getDayGridCell,
  getExactAudienceCheckbox,
  getPromptButton,
  getUserCountPattern,
} from '@/src/modules/employee-listening/utils/polls';

export class AIPollCreationPage extends BasePage {
  readonly aiPollGenerationHeading: Locator;
  readonly aiTextBox: Locator;
  readonly generateButton: Locator;
  readonly nextButton: Locator;
  readonly saveDraftButton: Locator;
  readonly browseAudiencesButton: Locator;
  readonly postButton: Locator;
  readonly sendingPollTag: Locator;
  readonly activeTag: Locator;
  readonly quickPromptButtons: Locator;
  readonly audiencesDiv: Locator;
  readonly allOrganizationSwitch: Locator;
  readonly doneButton: Locator;
  readonly audienceText: Locator;
  readonly aiTextBoxWithContent: Locator;
  readonly enabledPostButton: Locator;
  readonly searchTextbox: Locator;
  readonly quickPromptsText: Locator;
  readonly orCreateManuallyButton: Locator;
  readonly pollQuestionTextbox: Locator;
  readonly pollOptionsHeading: Locator;
  readonly addOptionButton: Locator;
  readonly generatedPollLabel: Locator;
  readonly generatedPollTooltip: Locator;
  readonly participationWindowDropdown: Locator;
  readonly selectDateButton: Locator;
  readonly nextMonthButton: Locator;
  readonly generateLoadingSpan: Locator;
  readonly generatingPollLoadingText: Locator;
  readonly pollQuestionAndOptionsLoadingState: Locator;
  readonly editableOptionsMessage: Locator;
  readonly closeButton: Locator;
  readonly discardChangesModal: Locator;
  readonly discardChangesHeading: Locator;
  readonly discardChangesNote: Locator;
  readonly discardButton: Locator;
  readonly keepEditingButton: Locator;
  readonly discardModalCloseButton: Locator;
  readonly targetAudienceSection: Locator;
  readonly createPollTitle: Locator;
  readonly audienceHelpText: Locator;
  readonly audienceFieldAsterisk: Locator;
  readonly audienceSelectedValue: Locator;
  readonly departmentFilter: Locator;
  readonly locationFilter: Locator;
  readonly noAudienceSelectedMessage: Locator;
  readonly participationWindowOptions: Locator;
  readonly oneDayOption: Locator;
  readonly twoDaysOption: Locator;
  readonly oneWeekOption: Locator;
  readonly twoWeeksOption: Locator;
  readonly selectDateOption: Locator;
  readonly calendar: Locator;
  readonly calendarDays: Locator;
  readonly disabledCalendarDays: Locator;
  readonly endDateInput: Locator;
  readonly endDateCaption: Locator;
  readonly shareResultsBeforeVotingToggle: Locator;
  readonly shareResultsBeforeVotingHelpText: Locator;
  readonly allowMultipleOptionsToggle: Locator;
  readonly allowMultipleOptionsHelpText: Locator;
  readonly showResultsAfterParticipationToggle: Locator;
  readonly showResultsAfterParticipationHelpText: Locator;
  readonly keepResponsesConfidentialToggle: Locator;
  readonly keepResponsesConfidentialHelpText: Locator;
  readonly monthDropdown: Locator;
  readonly pollEndDateCaption: Locator;
  readonly inlineErrorMessage: Locator;
  readonly regenerateButton: Locator;
  readonly selectedAudiencesList: Locator;
  readonly audienceRemoveButtons: Locator;
  readonly selectedUserCount: Locator;
  readonly audienceAvatars: Locator;
  readonly manualPollQuestionPlaceholder: Locator;
  readonly characterLimitCounter: Locator;
  readonly cancelButton: Locator;
  readonly nextButtonDisabled: Locator;
  readonly manualPollOption1: Locator;
  readonly manualPollOption2: Locator;
  readonly manualPollOptionPlaceholder: Locator;
  readonly pollOptionErrorMessage: Locator;
  readonly pollOptionCharacterLimit: Locator;
  readonly audienceModal: Locator;
  readonly audienceFiltersSection: Locator;
  readonly validationMessage: Locator;
  readonly checkboxInputs: Locator;
  readonly avatarImages: Locator;
  readonly avatarElements: Locator;
  readonly avatarTestIds: Locator;

  constructor(page: Page) {
    super(page, '/polls');

    this.aiPollGenerationHeading = this.page.getByRole('heading', { name: /AI.*generate.*poll/i });
    this.aiTextBox = this.page.getByRole('textbox', { name: 'Describe the poll you want to' });
    this.generateButton = this.page.locator('button[aria-label="Generate poll"]');
    this.nextButton = this.page.getByRole('button', { name: 'Next' });
    this.saveDraftButton = this.page.getByRole('button', { name: 'Save draft' });
    this.browseAudiencesButton = this.page.getByRole('button', { name: 'Browse' });
    this.postButton = this.page.getByRole('button', { name: 'Post' });
    this.activeTag = this.page.getByText('Active');
    this.sendingPollTag = this.page.getByText('Sending poll');
    this.quickPromptButtons = this.page.locator(
      'button[data-testid="suggestion-pill"].components_suggestionPill--s2Lbg'
    );
    this.audiencesDiv = this.page
      .locator('div')
      .filter({ hasText: /^Audiences$/ })
      .nth(2);
    this.allOrganizationSwitch = this.page.getByRole('switch', { name: 'All organization' });
    this.doneButton = this.page.getByRole('button', { name: 'Done' });
    this.audienceText = this.page.getByText('Audience', { exact: true });
    this.aiTextBoxWithContent = this.aiTextBox.filter({ hasText: /.{10,}/ });
    this.enabledPostButton = this.postButton.and(this.page.locator('button:not([disabled])'));
    this.searchTextbox = this.page.getByRole('textbox', { name: 'Search…' });
    this.quickPromptsText = this.page.getByText('Quick prompts to get started');
    this.orCreateManuallyButton = this.page.getByRole('button', { name: 'Or create it manually' });
    this.pollQuestionTextbox = this.page.getByRole('textbox', { name: 'Poll question*' });
    this.pollOptionsHeading = this.page.getByRole('heading', { name: 'Poll options' });
    this.addOptionButton = this.page.getByRole('button', { name: 'Add option' });
    this.generatedPollLabel = this.page.getByText(/Generated poll/i);
    this.generatedPollTooltip = this.page.getByRole('tooltip', { name: 'This content is generated by' });
    this.participationWindowDropdown = this.page.getByTestId('field-Participation window').getByTestId('SelectInput');
    this.selectDateButton = this.page.getByRole('button', { name: 'Select date…' });
    this.nextMonthButton = this.page.getByRole('button', { name: 'Next month' });
    this.generateLoadingSpan = this.page.locator('span').filter({ hasText: 'Generate' });
    this.generatingPollLoadingText = this.page.getByRole('heading', { name: 'Generating poll…' });
    this.pollQuestionAndOptionsLoadingState = this.page.getByTestId('skeleton');
    this.editableOptionsMessage = this.page.getByText('You can now edit the question');
    this.closeButton = this.page.getByRole('button', { name: 'Close' });
    this.discardChangesModal = this.page.getByRole('dialog', { name: 'Discard poll?' });
    this.discardChangesHeading = this.page.getByText('Discard poll?');
    this.discardChangesNote = this.page.getByText('You haven’t posted this poll');
    this.discardButton = this.page.getByRole('button', { name: 'Discard' });
    this.keepEditingButton = this.page.getByRole('button', { name: 'Keep editing' });
    this.discardModalCloseButton = this.page.getByRole('dialog', { name: 'Discard poll?' }).getByLabel('Close');
    this.targetAudienceSection = this.page.getByText('Target audience');
    this.createPollTitle = this.page
      .locator('[role="dialog"][data-state="open"]')
      .filter({ hasText: 'Create poll' })
      .first();
    this.audienceHelpText = this.page.getByText('Add recipients for this poll');
    this.audienceFieldAsterisk = this.page.getByText('Target audience*').first();
    this.audienceSelectedValue = this.page.getByText(/\d+\s+users?/);
    this.departmentFilter = this.page.getByText('Department');
    this.locationFilter = this.page.getByText('Location');
    this.noAudienceSelectedMessage = this.page.getByText('No audiences selected');
    this.participationWindowOptions = this.page.getByTestId('field-Participation window').locator('option');
    this.oneDayOption = this.page.getByRole('option', { name: '1 day' });
    this.twoDaysOption = this.page.getByRole('option', { name: '2 days' });
    this.oneWeekOption = this.page.getByRole('option', { name: '1 week' });
    this.twoWeeksOption = this.page.getByRole('option', { name: '2 weeks' });
    this.selectDateOption = this.page.getByRole('option', { name: 'Select date' });
    this.calendar = this.page.locator('.rdp');
    this.calendarDays = this.page.locator('.rdp-day');
    this.disabledCalendarDays = this.page.locator('.rdp-day_disabled');
    this.endDateInput = this.page
      .getByTestId('field-Participation window')
      .locator('input[type="text"]')
      .or(this.page.locator('input[placeholder*="Select date"], input[placeholder*="End date"]'));
    this.endDateCaption = this.page.locator('.components_caption-text--UdoTV');
    this.shareResultsBeforeVotingToggle = this.page.getByRole('switch').nth(3);
    this.shareResultsBeforeVotingHelpText = this.page.getByText('Participants can view results before responding');
    this.allowMultipleOptionsToggle = this.page
      .locator('div')
      .filter({ hasText: /^Allow multiple optionsParticipants can choose more than one option\.$/ })
      .getByRole('switch')
      .first();
    this.allowMultipleOptionsHelpText = this.page.getByText('Participants can choose more than one option.');
    this.showResultsAfterParticipationToggle = this.page.getByRole('switch').nth(2);
    this.showResultsAfterParticipationHelpText = this.page.getByText('Participants can view results after responding');
    this.keepResponsesConfidentialToggle = this.page
      .locator('div')
      .filter({ hasText: /Keep responses confidential.*Names are hidden from everyone, including poll managers/ })
      .getByRole('switch')
      .first();
    this.keepResponsesConfidentialHelpText = this.page
      .locator('p')
      .filter({ hasText: 'Names are hidden from everyone, including poll managers.' });
    this.monthDropdown = this.page.getByLabel('Select month');
    this.pollEndDateCaption = this.page.getByText('This poll will end on Dec 3,');
    this.inlineErrorMessage = this.page.getByText("Couldn't generate a poll. Try rephrasing.");
    this.regenerateButton = this.page.getByRole('button', { name: 'Re-generate poll with AI' });
    this.selectedAudiencesList = this.page.locator('[data-testid="selected-audiences-list"]');
    this.audienceRemoveButtons = this.page.locator('[data-testid="audience-remove-button"]');
    this.selectedUserCount = this.page.locator('[data-testid="selected-user-count"]');
    this.audienceAvatars = this.page.locator('[data-testid="audience-avatar"]');
    this.manualPollQuestionPlaceholder = this.page.getByRole('textbox', { name: 'Poll question*' });
    this.characterLimitCounter = this.page.getByText(/\d+\/250/);
    this.cancelButton = this.closeButton;
    this.nextButtonDisabled = this.nextButton.and(this.page.locator('button[disabled]'));
    this.manualPollOption1 = this.page.locator('input[placeholder="Poll option"]').first();
    this.manualPollOption2 = this.page.locator('input[placeholder="Poll option"]').nth(1);
    this.manualPollOptionPlaceholder = this.page.locator('input[placeholder="Poll option"]');
    this.pollOptionErrorMessage = this.page.getByText('The option already exists. Provide a different one.');
    this.pollOptionCharacterLimit = this.page.getByText(/\d+\/100/);
    this.audienceModal = this.page.getByRole('dialog').filter({ hasText: /audience/i });
    this.audienceFiltersSection = this.page
      .locator('[data-testid="audience-filters"]')
      .or(this.page.getByText('Filters'))
      .or(this.departmentFilter.locator('..').locator('..'));
    this.validationMessage = this.page
      .getByText(/select.*audience/i)
      .or(this.page.getByText(/audience.*required/i))
      .or(this.noAudienceSelectedMessage);
    this.checkboxInputs = this.page.locator('input[type="checkbox"]');
    this.avatarImages = this.page.locator('img[alt*="avatar"]');
    this.avatarElements = this.page.locator('[class*="avatar"]');
    this.avatarTestIds = this.page.locator('[data-testid*="avatar"]');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify AI Poll Creation page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.aiTextBox, {
        assertionMessage: 'AI text box should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifier.verifyTheElementIsVisible(this.generateButton, {
        assertionMessage: 'Generate button should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyAIPollGenerationSectionIsVisible(): Promise<void> {
    await test.step('Verify "Let AI generate your poll" section is visible at the top', async () => {
      await this.verifier.verifyTheElementIsVisible(this.aiPollGenerationHeading, {
        assertionMessage: 'Let AI generate your poll heading should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyQuickPromptsAreAvailable(): Promise<void> {
    await test.step('Verify that quick prompts are available', async () => {
      const availablePrompts = await this.getAvailableQuickPrompts();
      test.expect(availablePrompts.length).toBeGreaterThan(0);
    });
  }

  async verifyQuickPromptsSection(): Promise<void> {
    await test.step('Verify quick prompts section is displayed with visible options', async () => {
      await this.verifier.verifyTheElementIsVisible(this.quickPromptsText, {
        assertionMessage: 'Quick prompts to get started text should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifyQuickPromptsAreAvailable();
    });
  }

  async verifyNumberOfGeneratedOptions(expectedCount: number): Promise<void> {
    await test.step(`Verify number of generated poll options is ${expectedCount}`, async () => {
      let actualCount = 0;

      // Check up to 10 possible options (reasonable upper limit)
      for (let i = 0; i < 10; i++) {
        const pollOption = this.page.locator(`#options_${i}_title`);
        const isVisible = await pollOption.isVisible().catch(() => false);

        if (i < expectedCount) {
          if (isVisible) {
            await this.verifier.verifyTheElementIsVisible(pollOption, {
              assertionMessage: `Poll option ${i + 1} should be visible`,
            });
            actualCount++;
          }
        } else {
          test.expect(isVisible, `Poll option ${i + 1} should not be visible`).toBe(false);
        }
      }

      test.expect(actualCount, 'Number of visible poll options should match expected count').toBe(expectedCount);
    });
  }

  async getAvailableQuickPrompts(): Promise<string[]> {
    return await test.step('Discover available quick prompt buttons', async () => {
      await this.verifier.waitUntilElementIsVisible(this.quickPromptButtons.first(), {
        timeout: TIMEOUTS.MEDIUM,
      });

      const buttonCount = await this.quickPromptButtons.count();
      const prompts: string[] = [];

      for (let i = 0; i < buttonCount; i++) {
        const button = this.quickPromptButtons.nth(i);
        const pTag = button.locator('p');
        const buttonText = await pTag.textContent();
        if (buttonText && buttonText.trim().length > 0) {
          prompts.push(buttonText.trim());
        }
      }
      return prompts;
    });
  }

  async selectPrompt(index: number): Promise<string> {
    return await test.step(`Select quick prompt at index ${index}`, async () => {
      const availablePrompts = await this.getAvailableQuickPrompts();
      const selectedPrompt = availablePrompts[index];

      await this.clickOnElement(getPromptButton(this.page, selectedPrompt), {
        stepInfo: `Click on quick prompt: ${selectedPrompt}`,
      });
      await this.verifier.waitUntilElementIsVisible(this.aiTextBoxWithContent, {
        timeout: TIMEOUTS.MEDIUM,
      });

      return selectedPrompt;
    });
  }

  async verifyPromptAutoFilled(selectedPrompt: string): Promise<void> {
    await test.step(`Verify AI-generated content appears in text box after selecting "${selectedPrompt}"`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.aiTextBoxWithContent, {
        assertionMessage: 'AI text box should contain generated content from the selected prompt',
        timeout: TIMEOUTS.MEDIUM,
      });
      const textBoxValue = await this.aiTextBox.inputValue();
      test.expect(textBoxValue.length).toBeGreaterThan(10);
    });
  }

  async clickGenerateButton(): Promise<void> {
    await test.step('Click Generate button', async () => {
      const btn = this.generateButton;

      await btn.waitFor({ state: 'visible' });
      await btn.click();

      // Wait for loading (button disabled), ignore if too fast
      await btn.isDisabled().catch(() => null);

      // Wait for loading to finish: becomes enabled OR disappears
      await Promise.race([
        btn.waitFor({ state: 'hidden' }).catch(() => null),
        btn.waitFor({ state: 'visible' }).then(async () => {
          try {
            await this.expect(btn).toBeEnabled({ timeout: TIMEOUTS.LONG });
          } catch {
            /* ignore */
          }
        }),
      ]);

      // If visible & enabled again → click one more time
      if ((await btn.isVisible()) && !(await btn.isDisabled())) {
        await btn.click();
      }
    });
  }

  async verifyPollQuestionAndOptionsGenerated(): Promise<void> {
    await test.step('Verify a poll question and 4 editable options are generated and Next button appears', async () => {
      // Verify Next button is visible
      await this.verifier.verifyTheElementIsVisible(this.nextButton, {
        assertionMessage: 'Next button should be visible after poll generation',
        timeout: 45000,
      });

      // Verify poll question is not empty
      await this.verifier.verifyTheElementIsVisible(this.pollQuestionTextbox, {
        assertionMessage: 'Poll question field should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      const questionValue = await this.pollQuestionTextbox.inputValue();
      test.expect(questionValue.trim().length, 'Poll question should not be empty').toBeGreaterThan(0);

      // Verify all 4 poll options are generated, not empty, and editable
      for (let i = 0; i < 4; i++) {
        const pollOption = this.page.locator(`#options_${i}_title`);

        await this.verifier.verifyTheElementIsVisible(pollOption, {
          assertionMessage: `Poll option ${i + 1} should be visible`,
          timeout: TIMEOUTS.MEDIUM,
        });

        const isEnabled = await pollOption.isEnabled();
        test.expect(isEnabled, `Poll option ${i + 1} should be editable`).toBe(true);

        const optionValue = await pollOption.inputValue();
        test.expect(optionValue.trim().length, `Poll option ${i + 1} should not be empty`).toBeGreaterThan(0);
      }
    });
  }

  async verifyGeneratedPollLabelIsDisplayed(): Promise<void> {
    await test.step('Verify "Generated poll ⓘ" label is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.generatedPollLabel, {
        assertionMessage: 'Generated poll label should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.hoverOverElementInJavaScript(this.generatedPollLabel);

      await this.verifier.verifyElementContainsText(
        this.generatedPollTooltip,
        'This content is generated by AI and is prone to errors'
      );
    });
  }

  async clickNextButton(): Promise<void> {
    await test.step('Click the "Next" button', async () => {
      await this.clickOnElement(this.nextButton, {
        stepInfo: 'Click Next button to proceed to audience selection',
      });
    });
  }

  async verifyBrowseAudiencesButton(): Promise<void> {
    await test.step('Verify validations are met and user can proceed by clicking "Next"', async () => {
      await this.verifier.verifyTheElementIsVisible(this.browseAudiencesButton, {
        assertionMessage: 'Browse audiences button should be visible after clicking Next',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async clickBrowseAudiencesButton(): Promise<void> {
    await test.step('Click "Browse" to select audiences', async () => {
      await this.clickOnElement(this.browseAudiencesButton, {
        stepInfo: 'Click Browse button to open audience selection',
      });
    });
  }

  async selectAudiences(audienceNames: string[]): Promise<void> {
    await test.step(`Select desired audiences: ${audienceNames.join(', ')}`, async () => {
      if (audienceNames.includes('All Employees')) {
        await this.clickOnElement(this.audiencesDiv, {
          stepInfo: 'Click on audiences div to open audience selection',
        });
        await this.clickOnElement(this.allOrganizationSwitch, {
          stepInfo: 'Select all employees',
        });
      } else {
        for (const audienceName of audienceNames) {
          await this.searchTextbox.fill(audienceName);
          await this.searchTextbox.press('Enter');

          // Find audience checkbox with fallback
          let audienceCheckbox = getExactAudienceCheckbox(this.page, audienceName);
          if ((await audienceCheckbox.count()) !== 1) {
            audienceCheckbox = getAlternativeAudienceCheckbox(this.page, audienceName);
          }

          await this.clickOnElement(audienceCheckbox, {
            stepInfo: `Select audience: ${audienceName}`,
          });
        }
      }

      await this.clickOnElement(this.doneButton, {
        stepInfo: 'Confirm audience selection',
      });
      await this.clickOnElement(this.audienceText, {
        stepInfo: 'Finalize selection',
      });
    });
  }

  async clickPostButton(): Promise<void> {
    await test.step('Click "Post" button to submit the poll', async () => {
      await this.clickOnElement(this.postButton, {
        stepInfo: 'Click Post button to submit and create the poll',
      });
    });
  }

  async verifyPollCreationSuccess(): Promise<void> {
    await test.step('Verify poll creation success message or redirection', async () => {
      await this.verifyToastMessageIsVisibleWithText('Poll created', { timeout: TIMEOUTS.LONG });
    });
  }

  async verifySendingPollTagIsDisplayed(): Promise<void> {
    await test.step('Verify "Sending poll" tag is displayed for the created poll', async () => {
      await this.verifier.verifyTheElementIsVisible(this.sendingPollTag, {
        assertionMessage: '"Sending poll" tag should be visible for the created poll',
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.verifier.verifyTheElementIsNotVisible(this.sendingPollTag, {
        assertionMessage: '"Sending poll" tag should not be visible after poll is sent',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyAIPromptDescriptionText(): Promise<void> {
    await test.step('Verify AI prompt textbox is displayed below the heading', async () => {
      await this.verifier.verifyTheElementIsVisible(this.aiTextBox, {
        assertionMessage: 'AI textbox with name "Describe the poll you want to" should be visible below the heading',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyAIPromptPlaceholder(): Promise<void> {
    await test.step('Verify AI prompt placeholder text', async () => {
      const placeholderText = await this.aiTextBox.getAttribute('placeholder');
      test.expect(placeholderText).toContain('Describe the poll you want to');
    });
  }

  async verifyManualCreationSection(): Promise<void> {
    await test.step('Verify "Or create it manually" section is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.orCreateManuallyButton, {
        assertionMessage: '"Or create it manually" button should be visible',
      });
    });
  }

  async enterManualPrompt(promptText: string): Promise<void> {
    await test.step(`Enter manual prompt: ${promptText}`, async () => {
      await this.aiTextBox.fill(promptText);
      const textBoxValue = await this.aiTextBox.inputValue();
      test.expect(textBoxValue).toBe(promptText);
    });
  }

  async verifyPollQuestionFieldIsVisible(): Promise<void> {
    await test.step('Verify poll question field is visible after generation', async () => {
      await this.verifier.verifyTheElementIsVisible(this.pollQuestionTextbox, {
        assertionMessage: 'Poll question textbox should be visible after AI generation',
        timeout: TIMEOUTS.LONG,
      });
    });
  }

  async verifyPollOptionsHeadingIsVisible(): Promise<void> {
    await test.step('Verify "Poll options" heading is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.pollOptionsHeading, {
        assertionMessage: 'Poll options heading should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyPollOptionsAreGenerated(): Promise<void> {
    await test.step('Verify poll options are generated', async () => {
      const verificationPromises = [];
      for (let i = 0; i < 4; i++) {
        const pollOption = this.page.locator(`#options_${i}_title`);
        verificationPromises.push(
          this.verifier.verifyTheElementIsVisible(pollOption, {
            assertionMessage: `Poll option ${i + 1} should be visible`,
            timeout: TIMEOUTS.MEDIUM,
          })
        );
      }
      await Promise.all(verificationPromises);
    });
  }

  async verifyAddOptionButtonIsVisible(): Promise<void> {
    await test.step('Verify "Add option" button is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addOptionButton, {
        assertionMessage: 'Add option button should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async addMorePollOption(...optionTexts: string[]): Promise<void> {
    await test.step(`Add more poll options: ${optionTexts.join(', ')}`, async () => {
      // Find the next available option index by checking existing options
      const getNextAvailableOptionIndex = async (): Promise<number> => {
        // Check existing options to find the next available index
        for (let i = 0; i < 10; i++) {
          // Check up to 10 options (reasonable limit)
          const optionLocator = this.page.locator(`#options_${i}_title`);
          const exists = await optionLocator.isVisible().catch(() => false);

          if (!exists) {
            return i;
          }
        }
        return 4; // Default fallback to index 4 if all checks fail
      };

      let nextOptionIndex = await getNextAvailableOptionIndex();

      for (const optionText of optionTexts) {
        await this.clickOnElement(this.addOptionButton, {
          stepInfo: `Click Add option button to add poll option: ${optionText}`,
        });
        const newPollOption = this.page.locator(`#options_${nextOptionIndex}_title`);

        await this.verifier.verifyTheElementIsVisible(newPollOption, {
          assertionMessage: `New poll option ${nextOptionIndex + 1} should be visible`,
          timeout: TIMEOUTS.MEDIUM,
        });

        await newPollOption.fill(optionText);
        const optionValue = await newPollOption.inputValue();
        test.expect(optionValue).toBe(optionText);

        nextOptionIndex++; // Increment for next option
      }
    });
  }

  async verifyLoadingStateIsShown(): Promise<void> {
    await test.step('Verify loading state is shown with text "Generating poll…"', async () => {
      await this.verifier.verifyTheElementIsVisible(this.generatingPollLoadingText, {
        assertionMessage: 'Loading state with "Generating poll…" text should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyGenerateButtonLoadingState(): Promise<void> {
    await test.step('Verify Generate button shows loading state', async () => {
      await this.verifier.verifyTheElementIsVisible(this.generateLoadingSpan, {
        assertionMessage: 'Generate loading span should be visible after clicking generate button',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyPollQuestionAndOptionsLoadingState(): Promise<void> {
    await test.step('Verify poll question and options loading state is shown', async () => {
      // Verify loading state for multiple skeleton elements (0 to 3rd index)
      for (let i = 0; i <= 3; i++) {
        const skeletonElement = this.page.getByTestId('skeleton').nth(i);
        await this.verifier.verifyTheElementIsVisible(skeletonElement, {
          assertionMessage: `Poll question and options loading state ${i + 1} should be visible`,
          timeout: TIMEOUTS.MEDIUM,
        });
      }
    });
  }

  async editPollQuestion(newQuestion: string): Promise<void> {
    await test.step(`Edit poll question to: ${newQuestion}`, async () => {
      const isEnabled = await this.pollQuestionTextbox.isEnabled();
      test.expect(isEnabled, 'Poll question field should be editable').toBe(true);

      await this.pollQuestionTextbox.fill(newQuestion);
      const questionValue = await this.pollQuestionTextbox.inputValue();
      test.expect(questionValue).toBe(newQuestion);
    });
  }

  async editPollOption(...optionEdits: [number, string][]): Promise<void> {
    await test.step(`Edit poll options: ${optionEdits.map(([index, text]) => `option ${index + 1} to "${text}"`).join(', ')}`, async () => {
      // Helper function to find the highest existing option index
      const getHighestExistingOptionIndex = async (): Promise<number> => {
        for (let i = 10; i >= 0; i--) {
          // Check from 10 down to 0
          const optionLocator = this.page.locator(`#options_${i}_title`);
          const exists = await optionLocator.isVisible().catch(() => false);
          if (exists) {
            return i;
          }
        }
        return -1; // No options exist
      };

      for (const [optionIndex, newOptionText] of optionEdits) {
        const pollOption = this.page.locator(`#options_${optionIndex}_title`);

        // Check if the option exists, if not add new options until we reach the required index
        const isVisible = await pollOption.isVisible().catch(() => false);

        if (!isVisible) {
          // Add options until we have the required index
          const currentMaxIndex = await getHighestExistingOptionIndex();
          const optionsToAdd = optionIndex - currentMaxIndex;

          for (let i = 0; i < optionsToAdd; i++) {
            await this.clickOnElement(this.addOptionButton, {
              stepInfo: `Add new option to reach index ${optionIndex}`,
            });
          }
        }

        // Now the option should exist, proceed with editing
        await this.verifier.verifyTheElementIsVisible(pollOption, {
          assertionMessage: `Poll option ${optionIndex + 1} should be visible`,
          timeout: TIMEOUTS.MEDIUM,
        });
        const isEnabled = await pollOption.isEnabled();
        test.expect(isEnabled, `Poll option ${optionIndex + 1} should be editable`).toBe(true);

        await pollOption.fill(newOptionText);
        const optionValue = await pollOption.inputValue();
        test.expect(optionValue).toBe(newOptionText);
      }
    });
  }

  async verifyEditableOptionsMessage(): Promise<void> {
    await test.step('Verify "You can now edit the question and your options." message is displayed', async () => {
      await this.verifier.verifyElementContainsText(
        this.editableOptionsMessage,
        'You can now edit the question and your options'
      );
    });
  }

  async clickCloseButton(): Promise<void> {
    await test.step('Click the "X" (Close) button', async () => {
      await this.clickOnElement(this.closeButton, {
        stepInfo: 'Click Close button to exit poll creation',
      });
    });
  }

  async verifyDiscardChangesModalIsOpen(): Promise<void> {
    await test.step('Verify "Discard poll?" modal is open', async () => {
      await this.verifier.verifyTheElementIsVisible(this.discardChangesModal, {
        assertionMessage: 'Discard poll modal should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifier.verifyTheElementIsVisible(this.discardChangesHeading, {
        assertionMessage: 'Discard poll heading should be visible in modal',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyDiscardChangesNote(): Promise<void> {
    await test.step('Verify "You haven\'t posted this poll" note is visible', async () => {
      await this.verifier.verifyElementContainsText(
        this.discardChangesNote,
        'You haven’t posted this poll. All changes will be lost.'
      );
    });
  }

  async verifyDiscardAndKeepEditingButtons(): Promise<void> {
    await test.step('Verify "Discard" and "Keep editing" buttons are visible at bottom right corner', async () => {
      await this.verifier.verifyTheElementIsVisible(this.discardButton, {
        assertionMessage: 'Discard button should be visible at bottom right corner',
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifier.verifyTheElementIsVisible(this.keepEditingButton, {
        assertionMessage: 'Keep editing button should be visible at bottom right corner',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async clickDiscardButton(): Promise<void> {
    await test.step('Click "Discard" button', async () => {
      await this.clickOnElement(this.discardButton, {
        stepInfo: 'Click Discard button to confirm discarding changes',
      });
    });
  }

  async clickKeepEditingButton(): Promise<void> {
    await test.step('Click "Keep editing" button', async () => {
      await this.clickOnElement(this.keepEditingButton, {
        stepInfo: 'Click Keep editing button to continue editing the poll',
      });
    });
  }

  async verifyDiscardChangesModalIsClosed(): Promise<void> {
    await test.step('Verify discard changes modal is closed', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.discardChangesModal, {
        assertionMessage: 'Discard poll modal should not be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyTargetAudienceSectionIsVisible(): Promise<void> {
    await test.step('Verify "Target audience" section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.targetAudienceSection, {
        assertionMessage: 'Target audience section should be visible after clicking Next ',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyAudienceHelpText(): Promise<void> {
    await test.step('Verify "Target audience" help text is visible', async () => {
      await this.verifier.verifyElementContainsText(this.audienceHelpText, 'Add recipients for this poll');
    });
  }

  async verifyAudienceFieldAsterisk(): Promise<void> {
    await test.step('Verify audience field is marked as required with asterisk', async () => {
      await this.verifyTargetAudienceSectionIsVisible();
      await this.verifier.verifyTheElementIsVisible(this.audienceFieldAsterisk, {
        assertionMessage: 'Target audience field should be marked as required with asterisk',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyNoDefaultAudienceSelection(): Promise<void> {
    await test.step('Verify no audiences are selected by default', async () => {
      await this.verifier.verifyTheElementIsVisible(this.noAudienceSelectedMessage, {
        assertionMessage: 'No audiences should be selected by default',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyBrowseButtonIsVisible(): Promise<void> {
    await test.step('Verify Browse button is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.browseAudiencesButton, {
        assertionMessage: 'Browse audiences button should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyParticipationWindowDefaultValue(): Promise<void> {
    await test.step('Verify "Participation window" is set to "1 week" by default', async () => {
      await this.verifier.verifyTextOfInputElement(this.participationWindowDropdown, '1 week');
    });
  }

  async verifyParticipationWindowOptions(): Promise<void> {
    await test.step('Verify participation window options are available', async () => {
      await this.verifier.verifyTheElementIsVisible(this.participationWindowDropdown, {
        assertionMessage: 'Participation window dropdown should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });

      const optionTexts = await this.participationWindowDropdown.locator('option').allTextContents();
      const expectedOptions = ['1 day', '2 days', '1 week', '2 weeks', 'Custom'];

      for (const option of expectedOptions) {
        test.expect(optionTexts.includes(option), `${option} option should be available`).toBe(true);
      }
    });
  }

  async selectParticipationWindowOption(
    option: 'Select date' | '1 day' | '2 days' | '1 week' | '2 weeks'
  ): Promise<void> {
    await test.step(`Select "${option}" from participation window options`, async () => {
      if (option === 'Select date') {
        await this.participationWindowDropdown.selectOption('custom');
        await this.clickOnElement(this.selectDateButton, {
          stepInfo: 'Click on Select date button to open calendar',
        });
      } else {
        await this.participationWindowDropdown.selectOption({ label: option });
      }
    });
  }

  async verifyCalendarIsDisplayed(): Promise<void> {
    await test.step('Verify calendar is displayed after selecting "Select date"', async () => {
      await this.verifier.verifyTheElementIsVisible(this.calendar, {
        assertionMessage: 'Calendar should be displayed after selecting "Select date"',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyPastDatesAreDisabled(): Promise<void> {
    await test.step('Verify past dates in the calendar are disabled', async () => {
      const currentDate = new Date();
      const yesterday = new Date(currentDate);
      yesterday.setDate(currentDate.getDate() - 1);

      const yesterdayTile = this.page
        .getByRole('gridcell', {
          name: yesterday.getDate().toString(),
          exact: true,
        })
        .and(this.disabledCalendarDays);

      const disabledCount = await yesterdayTile.count();
      test.expect(disabledCount, 'Past dates should be disabled in the calendar').toBeGreaterThan(0);
    });
  }

  async verifyFutureDatesWithin30DaysAreSelectable(): Promise<void> {
    await test.step('Verify future dates within 60 days are selectable', async () => {
      const currentDate = new Date();
      const futureDate = new Date(currentDate);
      futureDate.setDate(currentDate.getDate() + 30);

      const futureTile = this.page
        .getByRole('gridcell', {
          name: futureDate.getDate().toString(),
          exact: true,
        })
        .and(this.calendarDays);

      const selectableCount = await futureTile.count();
      test.expect(selectableCount, 'Future dates within 60 days should be selectable').toBeGreaterThan(0);
    });
  }

  async verifyDatesBeyond60DaysAreDisabled(): Promise<void> {
    await test.step('Verify dates beyond 60 days are disabled', async () => {
      for (let i = 0; i < 3; i++) {
        await this.clickOnElement(this.nextMonthButton, {
          stepInfo: `Navigate to next month (${i + 1}/3)`,
        });
      }

      const disabledTilesCount = await this.disabledCalendarDays.count();
      test.expect(disabledTilesCount, 'Dates beyond 60 days should be disabled').toBeGreaterThan(0);
    });
  }

  async verifyShareResultsBeforeVotingToggleIsHidden(): Promise<void> {
    await test.step('Verify "Share results with respondents before voting" toggle is hidden by default', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.shareResultsBeforeVotingToggle, {
        assertionMessage: 'Share results before voting toggle should be hidden by default',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyShareResultsBeforeVotingToggleIsVisible(): Promise<void> {
    await test.step('Verify "Share results with respondents before voting" toggle is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.shareResultsBeforeVotingToggle, {
        assertionMessage: 'Share results before voting toggle should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyShareResultsBeforeVotingToggleIsDisabled(): Promise<void> {
    await test.step('Verify "Share results with respondents before voting" toggle is disabled by default', async () => {
      const isChecked = await this.shareResultsBeforeVotingToggle.isChecked();
      test.expect(isChecked, 'Share results before voting toggle should be disabled by default').toBe(false);
    });
  }

  async verifyShareResultsBeforeVotingHelpText(): Promise<void> {
    await test.step('Verify help text for "Share results with respondents before voting"', async () => {
      await this.verifier.verifyElementContainsText(
        this.shareResultsBeforeVotingHelpText,
        'Participants can view results before responding.'
      );
    });
  }

  async verifyAllowMultipleOptionsToggleIsVisible(): Promise<void> {
    await test.step('Verify "Allow multiple options" toggle is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.allowMultipleOptionsToggle, {
        assertionMessage: 'Allow multiple options toggle should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyAllowMultipleOptionsToggleIsDisabled(): Promise<void> {
    await test.step('Verify "Allow multiple options" toggle is OFF by default', async () => {
      const isChecked = await this.allowMultipleOptionsToggle.isChecked();
      test.expect(isChecked, 'Allow multiple options toggle should be OFF by default').toBe(false);
    });
  }

  async verifyAllowMultipleOptionsHelpText(): Promise<void> {
    await test.step('Verify help text for "Allow multiple options"', async () => {
      await this.verifier.verifyElementContainsText(
        this.allowMultipleOptionsHelpText,
        'Participants can choose more than one option.'
      );
    });
  }

  async verifyShowResultsAfterParticipationToggleIsVisible(): Promise<void> {
    await test.step('Verify "Show results after participation" toggle is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.showResultsAfterParticipationToggle, {
        assertionMessage: 'Show results after participation toggle should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyShowResultsAfterParticipationToggleIsDisabled(): Promise<void> {
    await test.step('Verify "Show results after participation" toggle is OFF by default', async () => {
      const isChecked = await this.showResultsAfterParticipationToggle.isChecked();
      test.expect(isChecked, 'Show results after participation toggle should be OFF by default').toBe(false);
    });
  }

  async verifyShowResultsAfterParticipationHelpText(): Promise<void> {
    await test.step('Verify help text for "Show results after participation"', async () => {
      await this.verifier.verifyElementContainsText(
        this.showResultsAfterParticipationHelpText,
        'Participants can view results after responding.'
      );
    });
  }

  async verifyKeepResponsesConfidentialToggleIsVisible(): Promise<void> {
    await test.step('Verify "Keep responses confidential" toggle is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.keepResponsesConfidentialToggle, {
        assertionMessage: 'Keep responses confidential toggle should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyKeepResponsesConfidentialToggleIsDisabled(): Promise<void> {
    await test.step('Verify "Keep responses confidential" toggle is OFF by default', async () => {
      const isChecked = await this.keepResponsesConfidentialToggle.isChecked();
      test.expect(isChecked, 'Keep responses confidential toggle should be OFF by default').toBe(false);
    });
  }

  async verifyKeepResponsesConfidentialHelpText(): Promise<void> {
    await test.step('Verify help text for "Keep responses confidential"', async () => {
      await this.verifier.verifyElementContainsText(
        this.keepResponsesConfidentialHelpText,
        'Names are hidden from everyone, including poll managers.'
      );
    });
  }

  async enableShowResultsAfterParticipationToggle(): Promise<void> {
    await test.step('Enable "Show results after participation" toggle', async () => {
      await this.clickOnElement(this.showResultsAfterParticipationToggle, {
        stepInfo: 'Click to enable Show results after participation toggle',
      });

      await this.verifier.verifyTheElementIsVisible(this.shareResultsBeforeVotingToggle, {
        assertionMessage: 'Share results before voting toggle should become visible after enabling prerequisite toggle',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async enterManualPollQuestion(question: string): Promise<void> {
    await test.step(`Enter manual poll question: ${question}`, async () => {
      await this.pollQuestionTextbox.fill(question);
      const questionValue = await this.pollQuestionTextbox.inputValue();
      test.expect(questionValue).toBe(question);
    });
  }

  async enterPollOption(optionNumber: 0 | 1 | 2 | 3, optionText: string): Promise<void> {
    await test.step(`Enter poll option ${optionNumber + 1}: ${optionText}`, async () => {
      const optionLocator = this.page.locator(`#options_${optionNumber}_title`);

      await optionLocator.fill(optionText);
      const optionValue = await optionLocator.inputValue();

      const expectedValue = optionText.length > 100 ? optionText.substring(0, 100) : optionText;
      test.expect(optionValue).toBe(expectedValue);
    });
  }

  async selectSpecificDateFromCalendar(date: Date): Promise<void> {
    await test.step(`Select specific date from calendar: ${date.toDateString()}`, async () => {
      const day = date.getDate();
      const month = date.getMonth();

      await this.monthDropdown.selectOption(month.toString());

      const dayCell = getDayGridCell(this.page, day);
      await this.clickOnElement(dayCell, {
        stepInfo: `Click on ${day} day to select the date`,
      });
    });
  }

  async verifyDateCaptionIsDisplayed(expectedCaption: string): Promise<void> {
    await test.step(`Verify date caption is displayed: "${expectedCaption}"`, async () => {
      const captionLocator = this.page.getByText(expectedCaption);
      await this.verifier.verifyTheElementIsVisible(captionLocator, {
        assertionMessage: `Date caption should be visible showing: "${expectedCaption}"`,
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyPromptInputValue(expectedValue: string): Promise<void> {
    await test.step(`Verify prompt input field contains expected value: "${expectedValue}"`, async () => {
      await test
        .expect(this.aiTextBox, `AI text box should contain the value: "${expectedValue}"`)
        .toHaveValue(expectedValue);
    });
  }

  async verifyGenerateButtonIsDisabled(): Promise<void> {
    await test.step('Verify Generate button is disabled', async () => {
      await this.verifier.verifyTheElementIsDisabled(this.generateButton);
    });
  }

  async verifyPostButtonIsDisabled(): Promise<void> {
    await test.step('Verify Post button is disabled', async () => {
      await this.verifier.verifyTheElementIsVisible(this.postButton, {
        assertionMessage: 'Post button should be visible on the current step',
        timeout: TIMEOUTS.MEDIUM,
      });

      await test
        .expect(this.postButton, 'Post button should be disabled when mandatory fields are not filled')
        .toBeDisabled();
    });
  }

  async clickDiscardModalCloseButton(): Promise<void> {
    await test.step('Click "X" (Close) button on discard modal', async () => {
      await this.clickOnElement(this.discardModalCloseButton, {
        stepInfo: 'Click Close button on discard changes modal',
      });
    });
  }

  async getPollQuestionValue(): Promise<string> {
    return await test.step('Get current poll question value', async () => {
      await this.verifier.verifyTheElementIsVisible(this.pollQuestionTextbox, {
        assertionMessage: 'Poll question textbox should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
      return await this.pollQuestionTextbox.inputValue();
    });
  }

  async getAllPollOptionsValues(): Promise<string[]> {
    return await test.step('Get all poll options values', async () => {
      const options: string[] = [];

      for (let i = 0; i < 4; i++) {
        const pollOption = this.page.locator(`#options_${i}_title`);
        const optionValue = await pollOption.inputValue();
        options.push(optionValue);
      }

      return options;
    });
  }

  async verifyPollQuestionValue(expectedQuestion: string): Promise<void> {
    await test.step(`Verify poll question contains expected value: "${expectedQuestion}"`, async () => {
      const currentQuestion = await this.getPollQuestionValue();
      test.expect(currentQuestion, 'Poll question should match the original generated question').toBe(expectedQuestion);
    });
  }

  async verifyAllPollOptionsValues(expectedOptions: string[]): Promise<void> {
    await test.step('Verify all poll options match expected values', async () => {
      const currentOptions = await this.getAllPollOptionsValues();

      test.expect(currentOptions.length, 'Should have 4 poll options').toBe(4);
      test.expect(expectedOptions.length, 'Expected options should have 4 items').toBe(4);

      for (let i = 0; i < 4; i++) {
        test.expect(currentOptions[i], `Poll option ${i + 1} should match original value`).toBe(expectedOptions[i]);
      }
    });
  }

  async verifyInlineErrorMessage(): Promise<void> {
    await test.step('Verify inline error message is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.inlineErrorMessage, {
        assertionMessage: 'Inline error message "Couldn\'t generate a poll. Try rephrasing." should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async clickRegenerateButton(): Promise<void> {
    await test.step('Click "Re-generate" button to regenerate the poll with AI', async () => {
      await this.clickOnElement(this.regenerateButton, {
        stepInfo: 'Click Re-generate button to regenerate poll with existing prompt',
      });
    });
  }

  async verifyPromptValue(expectedPrompt: string): Promise<void> {
    await test.step(`Verify prompt value is "${expectedPrompt}"`, async () => {
      const currentPrompt = await this.aiTextBox.inputValue();
      test.expect(currentPrompt, `Prompt should contain: "${expectedPrompt}"`).toBe(expectedPrompt);
    });
  }

  async verifySelectedAudiencesWithRemoveIcons(expectedAudiences: string[]): Promise<void> {
    await test.step(`Verify selected audiences are listed with remove icons: ${expectedAudiences.join(', ')}`, async () => {
      const noAudienceMessageVisible = await this.noAudienceSelectedMessage.isVisible();
      test
        .expect(noAudienceMessageVisible, 'Should not show "No audiences selected" when audiences are selected')
        .toBe(false);

      const audienceCount = expectedAudiences.length;
      test.expect(audienceCount, 'Should have selected some audiences').toBeGreaterThan(0);
    });
  }

  async verifySelectedUserCount(expectedPattern: string): Promise<void> {
    await test.step(`Verify selected user count is displayed: "${expectedPattern}"`, async () => {
      const userCountLocator = getUserCountPattern(this.page, expectedPattern);

      await this.verifier.verifyTheElementIsVisible(userCountLocator, {
        assertionMessage: `User count matching pattern "${expectedPattern}" should be visible`,
        timeout: TIMEOUTS.MEDIUM,
      });

      const userCountText = await userCountLocator.textContent();
      test
        .expect(userCountText, `User count should match pattern "${expectedPattern}"`)
        .toMatch(new RegExp(expectedPattern));
    });
  }

  async verifyMaximumSixAvatarsDisplayed(): Promise<void> {
    await test.step('Verify maximum of 6 avatars are displayed', async () => {
      const avatarLocators = [this.audienceAvatars, this.avatarImages, this.avatarElements, this.avatarTestIds];

      let avatarsCount = 0;

      for (const locator of avatarLocators) {
        const count = await locator.count();
        if (count > 0) {
          avatarsCount = count;
          break;
        }
      }

      if (avatarsCount > 0) {
        test.expect(avatarsCount, 'Should display maximum of 6 avatars').toBeLessThanOrEqual(6);
        test.expect(avatarsCount, 'Should display at least 1 avatar').toBeGreaterThan(0);
      }
    });
  }

  async selectMultipleAudiences(audienceNames: string[]): Promise<void> {
    await test.step(`Select multiple audiences: ${audienceNames.join(', ')}`, async () => {
      for (const audienceName of audienceNames) {
        await this.searchTextbox.clear();
        await this.searchTextbox.fill(audienceName);
        await this.searchTextbox.press('Enter');

        // Find audience checkbox with fallback strategies
        let audienceCheckbox = getExactAudienceCheckbox(this.page, audienceName);
        if ((await audienceCheckbox.count()) !== 1) {
          audienceCheckbox = getAlternativeAudienceCheckbox(this.page, audienceName);
          if ((await audienceCheckbox.count()) === 0) {
            audienceCheckbox = this.page.getByText(audienceName, { exact: true });
          }
        }

        await this.clickOnElement(audienceCheckbox, {
          stepInfo: `Select audience: ${audienceName}`,
        });
      }

      await this.clickOnElement(this.doneButton, {
        stepInfo: 'Confirm audience selection',
      });
      await this.clickOnElement(this.audienceText, {
        stepInfo: 'Finalize audience selection',
      });
    });
  }

  async verifyCharacterLimitCounter(): Promise<void> {
    await test.step('Verify character limit counter is displayed as "0/250"', async () => {
      await this.verifier.verifyTheElementIsVisible(this.characterLimitCounter, {
        assertionMessage: 'Character limit counter should be visible showing format "X/250"',
        timeout: TIMEOUTS.MEDIUM,
      });

      const counterText = await this.characterLimitCounter.textContent();
      test.expect(counterText, 'Character counter should show format "0/250" initially').toMatch(/\d+\/250/);
    });
  }

  async clickCancelButton(): Promise<void> {
    await test.step('Click "Close" button', async () => {
      await this.clickOnElement(this.cancelButton, {
        stepInfo: 'Click Close button to close modal without saving changes',
      });
    });
  }

  async clickOrCreateManuallyButton(): Promise<void> {
    await test.step('Click "Or create it manually" button', async () => {
      await this.clickOnElement(this.orCreateManuallyButton, {
        stepInfo: 'Click "Or create it manually" button to switch to manual poll creation',
      });
    });
  }

  async fillPollQuestionWithText(text: string): Promise<void> {
    await test.step(`Fill poll question field with text: "${text.substring(0, 50)}..."`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.pollQuestionTextbox, {
        assertionMessage: 'Poll question textbox should be visible before filling',
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.pollQuestionTextbox.fill(text);
    });
  }

  async verifyCharacterCounterText(expectedText: string): Promise<void> {
    await test.step(`Verify character counter shows: ${expectedText}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.characterLimitCounter, {
        assertionMessage: 'Character limit counter should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });

      const actualText = await this.characterLimitCounter.textContent();
      test.expect(actualText?.trim(), `Character counter should display "${expectedText}"`).toBe(expectedText);
    });
  }

  async verifyNextButtonStateWithCharacterLimit(shouldBeEnabled: boolean): Promise<void> {
    await test.step(`Verify Next button is ${shouldBeEnabled ? 'enabled' : 'disabled'} with character limit validation`, async () => {
      if (shouldBeEnabled) {
        await this.verifier.verifyTheElementIsVisible(this.nextButton, {
          assertionMessage: 'Next button should be visible and enabled',
          timeout: TIMEOUTS.MEDIUM,
        });
        const isEnabled = await this.nextButton.isEnabled();
        test.expect(isEnabled, 'Next button should be enabled when question is within character limit').toBe(true);
      } else {
        await this.verifier.verifyTheElementIsVisible(this.nextButtonDisabled, {
          assertionMessage: 'Next button should be visible but disabled',
          timeout: TIMEOUTS.MEDIUM,
        });
      }
    });
  }

  async generateLongText(length: number): Promise<string> {
    return 'a'.repeat(length);
  }

  async clearPollQuestionField(): Promise<void> {
    await test.step('Clear poll question field', async () => {
      await this.verifier.verifyTheElementIsVisible(this.pollQuestionTextbox, {
        assertionMessage: 'Poll question textbox should be visible before clearing',
        timeout: TIMEOUTS.MEDIUM,
      });

      await this.pollQuestionTextbox.clear();
    });
  }

  async verifyDuplicateOptionErrorMessage(): Promise<void> {
    await test.step('Verify duplicate option error message is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.pollOptionErrorMessage, {
        assertionMessage: 'Duplicate option error message should be visible',
        timeout: TIMEOUTS.MEDIUM,
      });

      const errorText = await this.pollOptionErrorMessage.textContent();
      test
        .expect(errorText?.trim(), 'Error message should match expected text')
        .toBe('The option already exists. Provide a different one.');
    });
  }

  async verifyPollOptionInputBlocked(optionNumber: 0 | 1 | 2 | 3, maxCharacters: number): Promise<void> {
    await test.step(`Verify poll option ${optionNumber + 1} input is blocked after ${maxCharacters} characters`, async () => {
      const optionLocator = this.page.locator(`#options_${optionNumber}_title`);

      const currentValue = await optionLocator.inputValue();
      test
        .expect(currentValue.length, `Option ${optionNumber + 1} should not exceed ${maxCharacters} characters`)
        .toBeLessThanOrEqual(maxCharacters);
    });
  }
}
