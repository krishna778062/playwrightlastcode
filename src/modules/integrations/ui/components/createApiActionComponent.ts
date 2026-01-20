import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

const TIMEOUTS = {
  SHORT: 10000,
  MEDIUM: 15000,
  LONG: 30000,
} as const;

export class CreateApiActionComponent extends BaseComponent {
  // Form input locators
  readonly customAppCombobox: Locator;
  readonly customAppOption: (appName: string) => Locator;
  readonly apiActionNameInput: Locator;

  // Button locators
  readonly cancelButton: Locator;
  readonly saveDraftButton: Locator;
  readonly nextButton: Locator;

  // Step indicator locators
  readonly detailsStepButton: Locator;
  readonly apiConfigurationStepButton: Locator;
  readonly previewConfirmStepButton: Locator;

  // Navigation link locators
  readonly addCustomAppLink: Locator;
  readonly backToApiActionsLink: Locator;

  // Page element locators
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);

    // Form inputs
    this.customAppCombobox = page.getByRole('combobox', { name: 'Custom app' });
    this.customAppOption = (appName: string) => page.getByRole('menuitem', { name: appName });
    this.apiActionNameInput = page.getByRole('textbox', { name: 'API action name' });

    // Buttons
    this.cancelButton = page.getByRole('link', { name: 'Cancel' });
    this.saveDraftButton = page.getByRole('button', { name: 'Save draft' });
    this.nextButton = page.getByRole('button', { name: 'Next' });

    // Step indicators
    this.detailsStepButton = page.getByRole('button', { name: 'Details' });
    this.apiConfigurationStepButton = page.getByRole('button', { name: 'API configuration' });
    this.previewConfirmStepButton = page.getByRole('button', { name: 'Preview & confirm' });

    // Navigation links
    this.addCustomAppLink = page.getByRole('link', { name: 'Add custom app' });
    this.backToApiActionsLink = page
      .getByRole('link', { name: 'API actions' })
      .or(page.locator('a[href*="/api-actions"]').filter({ hasNotText: 'Create' }).first());

    // Page elements
    this.pageHeading = page.getByRole('heading', { name: 'Create API action', level: 1 });
  }

  /**
   * Select a custom app from the combobox
   * @param appName - The name of the custom app to select
   */
  async selectCustomApp(appName: string): Promise<void> {
    await test.step(`Select custom app: ${appName}`, async () => {
      await expect(this.customAppCombobox, 'Expected Custom app combobox to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.clickOnElement(this.customAppCombobox, { timeout: TIMEOUTS.MEDIUM });
      await this.typeInElement(this.customAppCombobox, appName, { timeout: TIMEOUTS.MEDIUM });
      await this.page.waitForTimeout(1000);

      const option = this.customAppOption(appName);
      await option.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(option, { timeout: TIMEOUTS.SHORT });
      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Enter API action name
   * @param actionName - The name of the API action
   */
  async enterApiActionName(actionName: string): Promise<void> {
    await test.step(`Enter API action name: ${actionName}`, async () => {
      await this.typeInElement(this.apiActionNameInput, actionName, { timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Verify the page is loaded
   */
  async verifyPageIsLoaded(): Promise<void> {
    await test.step('Verify Create API action page is loaded', async () => {
      // Wait for network to be idle to ensure page is fully loaded
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.LONG }).catch(() => {});

      await expect(this.pageHeading, 'Expected Create API action heading to be visible').toBeVisible({
        timeout: TIMEOUTS.LONG,
      });
      await expect(this.customAppCombobox, 'Expected Custom app combobox to be visible').toBeVisible({
        timeout: TIMEOUTS.LONG,
      });
      await expect(this.apiActionNameInput, 'Expected API action name input to be visible').toBeVisible({
        timeout: TIMEOUTS.LONG,
      });
      // Also verify Cancel button and Save draft button are visible to ensure page is fully loaded
      await expect(this.cancelButton, 'Expected Cancel button to be visible').toBeVisible({
        timeout: TIMEOUTS.LONG,
      });
      await expect(this.saveDraftButton, 'Expected Save draft button to be visible').toBeVisible({
        timeout: TIMEOUTS.LONG,
      });
    });
  }

  /**
   * Verify buttons are disabled
   */
  async verifyButtonsAreDisabled(): Promise<void> {
    await test.step('Verify Save draft and Next buttons are disabled', async () => {
      await expect(this.saveDraftButton, 'Expected Save draft button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(this.saveDraftButton, 'Expected Save draft button to be disabled').toBeDisabled();
      await expect(this.nextButton, 'Expected Next button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(this.nextButton, 'Expected Next button to be disabled').toBeDisabled();
    });
  }

  /**
   * Verify buttons are enabled
   */
  async verifyButtonsAreEnabled(): Promise<void> {
    await test.step('Verify Save draft and Next buttons are enabled', async () => {
      await expect(this.saveDraftButton, 'Expected Save draft button to be enabled').toBeEnabled({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(this.nextButton, 'Expected Next button to be enabled').toBeEnabled({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Click Cancel button
   */
  async clickCancel(): Promise<void> {
    await test.step('Click Cancel button', async () => {
      await this.clickOnElement(this.cancelButton, { timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Click Save draft button
   */
  async clickSaveDraft(): Promise<void> {
    await test.step('Click Save draft button', async () => {
      await this.clickOnElement(this.saveDraftButton, { timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Click Next button
   */
  async clickNext(): Promise<void> {
    await test.step('Click Next button', async () => {
      await this.clickOnElement(this.nextButton, { timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Verify Cancel button navigation
   */
  async verifyCancelButtonNavigation(): Promise<void> {
    await test.step('Verify Cancel button navigation', async () => {
      await expect(this.cancelButton, 'Expected Cancel button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      const href = await this.cancelButton.getAttribute('href');
      expect(href).toContain('/api-actions');
    });
  }

  /**
   * Verify Add custom app link navigation
   */
  async verifyAddCustomAppLinkNavigation(): Promise<void> {
    await test.step('Verify Add custom app link navigation', async () => {
      await expect(this.addCustomAppLink, 'Expected Add custom app link to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      const href = await this.addCustomAppLink.getAttribute('href');
      expect(href).toContain('/custom/new');
    });
  }

  /**
   * Verify back to API actions link navigation
   */
  async verifyBackToApiActionsLinkNavigation(): Promise<void> {
    await test.step('Verify back to API actions link navigation', async () => {
      await expect(this.backToApiActionsLink, 'Expected back to API actions link to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      const href = await this.backToApiActionsLink.getAttribute('href');
      expect(href).toContain('/api-actions');
    });
  }

  /**
   * Verify step indicators are disabled initially
   */
  async verifyStepIndicatorsDisabled(): Promise<void> {
    await test.step('Verify step indicators are disabled', async () => {
      await expect(this.detailsStepButton, 'Expected Details step to be disabled').toBeDisabled();
      await expect(this.apiConfigurationStepButton, 'Expected API configuration step to be disabled').toBeDisabled();
      await expect(this.previewConfirmStepButton, 'Expected Preview & confirm step to be disabled').toBeDisabled();
    });
  }
}
