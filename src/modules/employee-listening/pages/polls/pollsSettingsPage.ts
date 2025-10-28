import test, { Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';

export class PollsSettingsPage extends BasePage {
  readonly aiPollSetting: Locator;
  readonly enableDisablePollTitle: Locator;
  readonly enableDisablePollsMessage: Locator;
  readonly enablePollRadioButton: Locator;
  readonly disablePollRadioButton: Locator;
  readonly disablePollText: Locator;
  readonly enableAIPollToggle: Locator;
  readonly enableAIPollHeading: Locator;
  readonly enableAIPollMessage: Locator;
  readonly poweredByAIMessage: Locator;
  readonly saveButton: Locator;
  readonly pollSettingsSuccessMessage: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.POLLS_SETTINGS_PAGE);

    this.aiPollSetting = this.page.locator('[data-testid="polls-ai-settings"]');
    this.enableDisablePollTitle = this.page.getByRole('heading', { name: 'Enable/disable polls' });
    this.enableDisablePollsMessage = this.page.getByText('Enable or disable polls for');
    this.enablePollRadioButton = this.page.locator('[id="isPollsEnabledtrue"]');
    this.disablePollRadioButton = this.page.locator('[id="isPollsEnabledfalse"]');
    this.disablePollText = this.page.getByText('Disable polls', { exact: true });
    this.enableAIPollToggle = this.page.locator('button[role="switch"]');
    this.enableAIPollHeading = this.page.getByRole('heading', { name: 'Enable AI poll generation (' });
    this.enableAIPollMessage = this.page.getByText('This will quickly generate');
    this.poweredByAIMessage = this.page.getByText('Powered by OpenAI');
    this.saveButton = this.page.getByRole('button', { name: 'Save' });
    this.pollSettingsSuccessMessage = this.page.getByText('Saved changes successfully');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify poll AI settings is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.enableDisablePollTitle, {
        assertionMessage: 'Enable/disable polls',
        timeout: 6000,
      });
    });
  }

  async verifyEnablePollsIsVisible(): Promise<void> {
    await test.step('Verify enable polls settings are visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.enablePollRadioButton, { timeout: TIMEOUTS.MEDIUM });
      await this.verifier.verifyTheElementIsVisible(this.enableAIPollToggle, { timeout: TIMEOUTS.MEDIUM });
    });
  }

  async verifyAIPollHeadingIsVisible(): Promise<void> {
    await test.step('Verify AI poll heading is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.enableAIPollHeading, {
        assertionMessage: 'Enable AI poll generation (recommended)',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyDisablePollsIsVisible(): Promise<void> {
    await test.step('Verify disable polls settings are visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.disablePollRadioButton, {
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.verifier.verifyTheElementIsVisible(this.disablePollText, {
        assertionMessage: 'Disable polls',
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async togglePolls(state: 'enable' | 'disable', enableAI?: boolean): Promise<void> {
    const enableChecked = await this.enablePollRadioButton.isChecked();
    const disableChecked = await this.disablePollRadioButton.isChecked();
    const isEnable = state === 'enable';
    const targetButton = isEnable ? this.enablePollRadioButton : this.disablePollRadioButton;
    const currentlyChecked = isEnable ? enableChecked : disableChecked;

    if (!currentlyChecked) {
      await targetButton.click();
      await this.saveButton.click();
      await this.verifyToastMessageIsVisibleWithText('Saved changes successfully', { timeout: TIMEOUTS.LONG });
    }

    if (enableAI !== undefined && isEnable) {
      await this.aiPollSetting.waitFor({ state: 'visible' });
      const isCurrentlyEnabled = (await this.enableAIPollToggle.getAttribute('data-state')) === 'checked';

      if (enableAI !== isCurrentlyEnabled) {
        await this.enableAIPollToggle.click();
        await this.saveButton.click();
        await this.verifyToastMessageIsVisibleWithText('Saved changes successfully', { timeout: TIMEOUTS.LONG });
      }
    }
  }
}
