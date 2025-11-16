import { AIPollCreationPage } from '@/src/modules/employee-listening/pages/polls/pollCreation';
import { PollsListeningPage } from '@/src/modules/employee-listening/pages/polls/pollsListingPage';
import { PollsSettingsPage } from '@/src/modules/employee-listening/pages/polls/pollsSettingsPage';
import type { PollForm, PollOperationOptions } from '@/src/modules/employee-listening/types/poll.type';

export class PollsHelper {
  constructor(
    private pollsSettingsPage: PollsSettingsPage,
    private pollsListeningPage: PollsListeningPage,
    private aiPollCreationPage: AIPollCreationPage
  ) {}

  public async setupPollsConfiguration(pollState: 'enable' | 'disable', enableAI: boolean): Promise<void> {
    await this.pollsSettingsPage.loadPage({ stepInfo: 'Loading Polls Settings page' });
    await this.pollsSettingsPage.verifyThePageIsLoaded();
    await this.pollsSettingsPage.togglePolls(pollState, enableAI);
    await this.pollsListeningPage.loadPage({ stepInfo: 'Loading Polls page' });
    await this.pollsListeningPage.verifyThePageIsLoaded();
  }

  async addPoll(form: PollForm, options: PollOperationOptions = {}): Promise<void> {
    const { verifySteps = true } = options;

    if (form.userPrompt) {
      await this.aiPollCreationPage.enterManualPrompt(form.userPrompt);

      await this.aiPollCreationPage.clickGenerateButton();
    }

    if (form.quickPrompt !== undefined) {
      const selectedPrompt = await this.aiPollCreationPage.selectPrompt(form.quickPrompt);
      if (verifySteps) {
        await this.aiPollCreationPage.verifyPromptAutoFilled(selectedPrompt);
      }

      await this.aiPollCreationPage.clickGenerateButton();
    }

    if (form.regenerate) {
      await this.aiPollCreationPage.clickRegenerateButton();
    }

    if (
      verifySteps &&
      (form.userPrompt || form.quickPrompt !== undefined || form.regenerate) &&
      (form.generateButton || form.clickGenerateButton)
    ) {
      await this.aiPollCreationPage.verifyPollQuestionAndOptionsGenerated();
    }

    if (form.pollQuestion) {
      await this.aiPollCreationPage.editPollQuestion(form.pollQuestion);
    }

    if (form.pollOptions && form.pollOptions.length > 0) {
      const optionEdits: [number, string][] = [];
      const maxExistingOptions = Math.min(4, form.pollOptions.length);

      for (let i = 0; i < maxExistingOptions; i++) {
        optionEdits.push([i, form.pollOptions[i]]);
      }

      if (optionEdits.length > 0) {
        await this.aiPollCreationPage.editPollOption(...optionEdits);
      }

      if (form.pollOptions.length > 4) {
        const additionalOptions = form.pollOptions.slice(4);
        await this.aiPollCreationPage.addMorePollOption(...additionalOptions);
      }
    }

    if (form.nextButton) {
      await this.aiPollCreationPage.clickNextButton();
      if (verifySteps) {
        await this.aiPollCreationPage.verifyBrowseAudiencesButton();
      }
    }

    if (form.modalBackButton) {
      await this.aiPollCreationPage.page.getByRole('button', { name: 'Back' }).click();
    }

    if (form.selectTargetAudience && form.selectTargetAudience.length > 0) {
      await this.aiPollCreationPage.clickBrowseAudiencesButton();

      if (form.selectTargetAudience.includes('All Employees')) {
        await this.aiPollCreationPage.selectAudiences(form.selectTargetAudience);
      } else {
        await this.aiPollCreationPage.selectMultipleAudiences(form.selectTargetAudience);
      }
    }

    if (form.participationWindow) {
      await this.aiPollCreationPage.selectParticipationWindowOption(form.participationWindow.option);

      if (form.participationWindow.option === 'Select date' && form.participationWindow.customEndDate) {
        if (verifySteps) {
          await this.aiPollCreationPage.verifyCalendarIsDisplayed();
        }
        await this.aiPollCreationPage.selectSpecificDateFromCalendar(form.participationWindow.customEndDate);
      }
    }

    if (form.allowMultipleOptionsToggle !== undefined) {
      if (verifySteps) {
        await this.aiPollCreationPage.verifyAllowMultipleOptionsToggleIsVisible();
      }

      const currentState = await this.aiPollCreationPage.allowMultipleOptionsToggle.isChecked();
      if (currentState !== form.allowMultipleOptionsToggle) {
        await this.aiPollCreationPage.clickOnElement(this.aiPollCreationPage.allowMultipleOptionsToggle, {
          stepInfo: `Toggle Allow multiple options to ${form.allowMultipleOptionsToggle ? 'ON' : 'OFF'}`,
        });
      }
    }

    if (form.keepResponsesConfidentialToggle !== undefined) {
      if (verifySteps) {
        await this.aiPollCreationPage.verifyKeepResponsesConfidentialToggleIsVisible();
      }

      const currentState = await this.aiPollCreationPage.keepResponsesConfidentialToggle.isChecked();
      if (currentState !== form.keepResponsesConfidentialToggle) {
        await this.aiPollCreationPage.clickOnElement(this.aiPollCreationPage.keepResponsesConfidentialToggle, {
          stepInfo: `Toggle Keep responses confidential to ${form.keepResponsesConfidentialToggle ? 'ON' : 'OFF'}`,
        });
      }
    }

    if (form.showResultsAfterParticipationToggle !== undefined) {
      if (verifySteps) {
        await this.aiPollCreationPage.verifyShowResultsAfterParticipationToggleIsVisible();
      }

      const currentState = await this.aiPollCreationPage.showResultsAfterParticipationToggle.isChecked();
      if (currentState !== form.showResultsAfterParticipationToggle) {
        await this.aiPollCreationPage.enableShowResultsAfterParticipationToggle();
      }
    }

    if (form.showResultsBeforeParticipationToggle !== undefined) {
      if (form.showResultsAfterParticipationToggle === true) {
        if (verifySteps) {
          await this.aiPollCreationPage.verifyShareResultsBeforeVotingToggleIsVisible();
        }

        const currentState = await this.aiPollCreationPage.shareResultsBeforeVotingToggle.isChecked();
        if (currentState !== form.showResultsBeforeParticipationToggle) {
          await this.aiPollCreationPage.clickOnElement(this.aiPollCreationPage.shareResultsBeforeVotingToggle, {
            stepInfo: `Toggle Share results before voting to ${form.showResultsBeforeParticipationToggle ? 'ON' : 'OFF'}`,
          });
        }
      } else {
        console.warn(
          'Show results before participation toggle can only be enabled when Show results after participation is ON'
        );
      }
    }

    if (form.saveDraftButton) {
      console.log('Save draft functionality not yet implemented in page object');
    }

    if (form.postButton) {
      await this.aiPollCreationPage.clickPostButton();
      if (verifySteps) {
        await this.aiPollCreationPage.verifyPollCreationSuccess();
        await this.aiPollCreationPage.verifySendingPollTagIsDisplayed();
      }
    }
  }
}
