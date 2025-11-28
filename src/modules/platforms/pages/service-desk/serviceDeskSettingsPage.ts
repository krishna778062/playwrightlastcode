import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

/**
 * Service Desk Settings Page Object Model
 *
 * Handles interactions with the Service Desk application settings page
 * where you can enable/disable the Service Desk feature
 * Path: /manage/app/setup/service-desk
 */
export class ServiceDeskSettingsPage extends BasePage {
  private readonly manageApplicationHeading: Locator;
  private readonly enableServiceDeskCheckbox: Locator;
  private readonly saveButton: Locator;
  private readonly serviceDeskSettingsHeading: Locator;
  private readonly serviceDeskDescription: Locator;
  private readonly serviceDeskHelpText: Locator;
  private readonly supportTeamsOnlyRadio: Locator;
  private readonly supportForEveryoneRadio: Locator;
  private readonly supportTeamsOnlyDescription: Locator;
  private readonly supportForEveryoneDescription: Locator;
  private readonly successToast: Locator;

  constructor(page: Page) {
    super(page, '/manage/app/setup/service-desk');

    this.manageApplicationHeading = page.getByRole('heading', { name: 'Manage application' });
    this.enableServiceDeskCheckbox = page.getByRole('checkbox', { name: 'Enable Service desk' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.serviceDeskSettingsHeading = page.getByRole('heading', { name: 'Enable/Disable Service desk' });
    this.serviceDeskDescription = page.getByText(
      'Service desk allows employees to raise requests and allow assigned agents to manage these tickets directly within Simpplr.'
    );
    this.serviceDeskHelpText = page.getByText(
      'Turn on Service desk to let support teams manage service requests, incidents, and approvals directly within Simpplr.'
    );
    this.supportTeamsOnlyRadio = page.getByRole('radio', {
      name: 'Enable Service desk (for support teams only)',
    });
    this.supportForEveryoneRadio = page.getByRole('radio', {
      name: 'Enable Service desk with Support (for everyone)',
    });
    this.supportTeamsOnlyDescription = page.getByText(
      'Only support teams and admins will have access to the Service desk feature to manage requests and incidents.'
    );
    this.supportForEveryoneDescription = page.getByText(
      'All employees will see the Support option to raise requests and track tickets, while support teams continue managing them through Service desk.'
    );
    this.successToast = page.getByText('Saved changes successfully');
  }

  private getServiceDeskUrl(): string {
    const serviceDeskUrl = process.env.SERVICE_DESK_URL;
    if (!serviceDeskUrl) {
      throw new Error('SERVICE_DESK_URL not configured in environment variables');
    }
    return serviceDeskUrl;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Service Desk Settings page is loaded', async () => {
      await expect(this.manageApplicationHeading).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await expect(this.serviceDeskSettingsHeading).toBeVisible({ timeout: TIMEOUTS.SHORT });
    });
  }

  async navigateToServiceDeskSettings(): Promise<void> {
    await test.step('Navigate to Service Desk Settings', async () => {
      await this.goToUrl(`${this.getServiceDeskUrl()}/manage/app/setup/service-desk`, {
        waitUntil: 'domcontentloaded',
      });
      await this.verifyThePageIsLoaded();
    });
  }

  /**
   * Set Service Desk state (enable/disable) and save
   * @param enabled - true to enable, false to disable
   */
  async setServiceDeskState(enabled: boolean): Promise<void> {
    await test.step(`${enabled ? 'Enable' : 'Disable'} Service Desk`, async () => {
      await expect(this.enableServiceDeskCheckbox).toBeVisible();
      const currentState = await this.enableServiceDeskCheckbox.isChecked();

      if (currentState !== enabled) {
        await this.enableServiceDeskCheckbox.setChecked(enabled);
        await this.saveButton.click();
        // Verify success toast message
        await expect(this.successToast).toBeVisible({ timeout: TIMEOUTS.SHORT });
      }
    });
  }

  /**
   * Disable Service Desk if it's enabled (skip if already disabled)
   */
  async disableServiceDeskIfEnabled(): Promise<void> {
    await test.step('Disable Service Desk if enabled', async () => {
      await expect(this.enableServiceDeskCheckbox).toBeVisible();
      const isEnabled = await this.enableServiceDeskCheckbox.isChecked();

      if (isEnabled) {
        await this.setServiceDeskState(false);
      }
    });
  }

  /**
   * Enable Service Desk if it's disabled (skip if already enabled)
   */
  async enableServiceDeskIfDisabled(): Promise<void> {
    await test.step('Enable Service Desk if disabled', async () => {
      await expect(this.enableServiceDeskCheckbox).toBeVisible();
      const isEnabled = await this.enableServiceDeskCheckbox.isChecked();

      if (!isEnabled) {
        await this.setServiceDeskState(true);
      }
    });
  }

  /**
   * Verify all elements on Service Desk settings page
   */
  async verifyServiceDeskSettingsPageElements(): Promise<void> {
    await test.step('Verify Service Desk settings page elements', async () => {
      await expect(this.serviceDeskSettingsHeading).toBeVisible();
      await expect(this.serviceDeskDescription).toBeVisible();
      await expect(this.enableServiceDeskCheckbox).toBeVisible();
      await expect(this.serviceDeskHelpText).toBeVisible();
    });
  }

  /**
   * Verify radio button options and descriptions are visible
   */
  async verifyRadioButtonOptions(): Promise<void> {
    await test.step('Verify radio button options are visible', async () => {
      await expect(this.supportTeamsOnlyRadio).toBeVisible();
      await expect(this.supportForEveryoneRadio).toBeVisible();
      await expect(this.supportTeamsOnlyDescription).toBeVisible();
      await expect(this.supportForEveryoneDescription).toBeVisible();
    });
  }

  /**
   * Verify radio button options are NOT visible
   */
  async verifyRadioButtonOptionsNotVisible(): Promise<void> {
    await test.step('Verify radio button options are not visible', async () => {
      await expect(this.supportTeamsOnlyRadio).not.toBeVisible();
      await expect(this.supportForEveryoneRadio).not.toBeVisible();
    });
  }

  /**
   * Select radio button option
   * @param option - 'support-teams' or 'everyone'
   */
  async selectRadioOption(option: 'support-teams' | 'everyone'): Promise<void> {
    await test.step(`Select ${option} radio option`, async () => {
      if (option === 'support-teams') {
        await this.supportTeamsOnlyRadio.check();
      } else {
        await this.supportForEveryoneRadio.check();
      }
    });
  }

  /**
   * Click Save and verify success toast (only if Save button is enabled)
   */
  async saveAndVerify(): Promise<void> {
    await test.step('Save and verify success', async () => {
      const isEnabled = await this.saveButton.isEnabled();
      if (isEnabled) {
        await this.saveButton.click();
        await expect(this.successToast).toBeVisible({ timeout: TIMEOUTS.SHORT });
        // Wait for page to be ready - fallback to waiting for save button to be disabled if networkidle times out
        await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(async () => {
          await expect(this.saveButton).toBeDisabled({ timeout: TIMEOUTS.VERY_SHORT });
        });
      }
    });
  }

  /**
   * Check/Enable the Service Desk checkbox (without saving)
   */
  async checkEnableServiceDesk(): Promise<void> {
    await test.step('Check Enable Service Desk checkbox', async () => {
      await expect(this.enableServiceDeskCheckbox).toBeVisible();
      const isChecked = await this.enableServiceDeskCheckbox.isChecked();
      if (!isChecked) {
        await this.enableServiceDeskCheckbox.check();
      }
    });
  }

  /**
   * Uncheck/Disable the Service Desk checkbox (without saving)
   */
  async uncheckDisableServiceDesk(): Promise<void> {
    await test.step('Uncheck Disable Service Desk checkbox', async () => {
      await expect(this.enableServiceDeskCheckbox).toBeVisible();
      const isChecked = await this.enableServiceDeskCheckbox.isChecked();
      if (isChecked) {
        await this.enableServiceDeskCheckbox.uncheck();
      }
    });
  }

  /**
   * Get current Service Desk state (enabled/disabled and selected option)
   * @returns Object with enabled status and selected option (if enabled)
   */
  async getServiceDeskState(): Promise<{ enabled: boolean; option?: 'support-teams' | 'everyone' }> {
    await test.step('Get current Service Desk state', async () => {
      await expect(this.enableServiceDeskCheckbox).toBeVisible();
    });

    const enabled = await this.enableServiceDeskCheckbox.isChecked();
    let option: 'support-teams' | 'everyone' | undefined;

    if (enabled) {
      // Check which radio option is selected
      const supportTeamsOnlyChecked = await this.supportTeamsOnlyRadio.isChecked();
      const supportForEveryoneChecked = await this.supportForEveryoneRadio.isChecked();

      if (supportTeamsOnlyChecked) {
        option = 'support-teams';
      } else if (supportForEveryoneChecked) {
        option = 'everyone';
      }
    }

    return { enabled, option };
  }

  async restoreServiceDeskState(state: { enabled: boolean; option?: 'support-teams' | 'everyone' }): Promise<void> {
    await test.step(`Restore Service Desk state: ${state.enabled ? 'enabled' : 'disabled'}`, async () => {
      const currentState = await this.getServiceDeskState();

      if (currentState.enabled === state.enabled && currentState.option === state.option) {
        console.log('Service Desk already in desired state, skipping restore');
        return;
      }

      if (state.enabled) {
        await this.checkEnableServiceDesk();
        if (state.option) {
          await this.selectRadioOption(state.option);
        }
      } else {
        await this.uncheckDisableServiceDesk();
      }

      // Save changes
      await this.saveAndVerify();
      console.log(`Restored Service Desk state: ${state.enabled ? 'enabled' : 'disabled'}`);
    });
  }
}
