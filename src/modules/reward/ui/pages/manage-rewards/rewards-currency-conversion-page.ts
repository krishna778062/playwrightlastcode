import { expect, Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';

export class RewardsCurrencyConversionPage extends BasePage {
  // Currency conversion page locators
  readonly currencyConversionContainer: Locator;
  readonly currencyConversionHeadingH1: Locator;
  readonly currencyConversionDescriptionText: Locator;
  readonly currencyConversionDescriptionNote: Locator;
  readonly currencyConversionTable: Locator;
  readonly currencyConversionAddCurrency: Locator;
  readonly currencyConversionPendingPointsInfoIcon: Locator;
  readonly currencyConversionPendingPointsInfoTooltipText: Locator;
  readonly currencyConversionExchangeRateUpdatedText: Locator;
  readonly addCurrencyDialog: Locator;
  readonly dialogHeading: Locator;
  readonly dialogDescription: Locator;
  readonly dialogInput: Locator;
  readonly dialogCurrencySuggestion: Locator;
  readonly dialogAddButton: Locator;
  readonly dialogCancelButton: Locator;
  readonly csvDownloadButtonForUnsetCurrencyUsers: Locator;

  // Save button and toast messages
  readonly saveButton: Locator;
  readonly toastMessage: Locator;
  readonly toastCloseButton: Locator;

  // Currency table row locators
  readonly currencyTableRows: Locator;
  readonly currencyTableRemoveButtons: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.CURRENCY_CONVERSION_PAGE);
    this.currencyConversionContainer = page.locator('[class*="Rewards_content"]');
    this.currencyConversionHeadingH1 = this.currencyConversionContainer.getByRole('heading', {
      level: 2,
      name: 'Currency Conversions',
    });
    this.currencyConversionDescriptionText = this.currencyConversionContainer.locator('h2+div > p');
    this.currencyConversionDescriptionNote = this.currencyConversionContainer.locator('p').last();
    this.currencyConversionTable = this.currencyConversionContainer.locator(
      'div[class^="CurrencyConversions_container"]'
    );
    this.csvDownloadButtonForUnsetCurrencyUsers = this.currencyConversionTable.locator(
      'button[aria-label="Download unassigned payroll currency user email CSV"]'
    );
    this.currencyConversionAddCurrency = this.page.locator('//div[text()="Add currency"]//parent::button');
    this.currencyConversionPendingPointsInfoIcon = this.currencyConversionContainer.locator(
      '[aria-label="Pending points information"]'
    );
    this.currencyConversionPendingPointsInfoTooltipText = page.locator('[id*="tippy"] p');
    this.currencyConversionExchangeRateUpdatedText = this.currencyConversionContainer.locator(
      '//button[@aria-label="Pending points information"]/preceding-sibling::span'
    );

    // Add currency dialog locators
    this.addCurrencyDialog = this.page.locator('[role="dialog"]');
    this.dialogHeading = this.addCurrencyDialog.locator('h2[class*="Dialog-module__title"] > span');
    this.dialogDescription = this.addCurrencyDialog.locator('div[class*="Panel-module__panel_"]');
    this.dialogInput = this.addCurrencyDialog.locator('input[role="combobox"]');
    this.dialogCurrencySuggestion = this.addCurrencyDialog.locator('div[role="menuitem"] > div > div > p');
    this.dialogAddButton = this.addCurrencyDialog.getByRole('button', { name: 'Add' });
    this.dialogCancelButton = this.addCurrencyDialog.getByRole('button', { name: 'Cancel' });
    // Save button and toast messages
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.toastMessage = page.locator('div.Toastify__toast-body p');
    this.toastCloseButton = page.locator('div.Toastify__toast-body button');

    // Currency table row locators
    this.currencyTableRows = this.currencyConversionTable.locator('tbody tr');
    this.currencyTableRemoveButtons = this.currencyConversionTable.locator(
      'button[aria-label="Remove currency conversion"]'
    );
  }

  /**
   * Navigate to currency conversion page
   */
  async loadPage(): Promise<void> {
    await this.page.goto(PAGE_ENDPOINTS.CURRENCY_CONVERSION_PAGE);
    await this.verifyThePageIsLoaded();
  }

  /**
   * Verify the page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.currencyConversionContainer);
    await this.verifier.verifyTheElementIsVisible(this.currencyConversionHeadingH1);
  }

  /**
   * Validate all UI elements on the currency conversion page
   */
  async validateAllUIElements(apiData: any): Promise<void> {
    // Wait for the page and heading
    await this.currencyConversionContainer.waitFor({ state: 'visible' });
    await this.verifier.verifyTheElementIsVisible(this.currencyConversionHeadingH1);
    await expect(this.currencyConversionHeadingH1).toHaveText('Currency conversions');

    // --- DESCRIPTION PARAGRAPHS (by index, but robust) ---
    // Grab all paragraph text nodes for the description block (this.currencyConversionDescriptionText is 'h2+div > p')
    const paraElements = await this.currencyConversionDescriptionText.allTextContents();

    // Ensure we have expected paragraphs before checking by index
    if (paraElements.length < 2) {
      throw new Error(`Expected at least 2 description paragraphs, found ${paraElements.length}`);
    }

    // Normalize curly quotes, double quotes, collapse whitespace and trim
    const normalize = (s: string) => s.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();

    const normalized = paraElements.map(normalize);

    // Best-practice: partial contains (less brittle than full-sentence equality)
    expect(normalized[0]).toContain(
      'Define the value of reward points across locations to reflect the purchasing power of individual currencies'
    );

    expect(normalized[1]).toContain(
      "Reward points are gifted in USD, using any customized value for the recipient's payroll currency."
    );

    // Third note — use a tolerant check (in case whitespace/punctuation slightly differs)
    await expect(this.currencyConversionDescriptionNote).toHaveText(
      'Points are converted from USD to the reward currency at the time of redemption, using global exchange rates.'
    );

    // --- TABLE & CONTROLS ---
    await expect(this.currencyConversionTable).toBeVisible();
    await expect(this.currencyConversionAddCurrency).toBeVisible();
    await expect(this.currencyConversionPendingPointsInfoIcon).toBeVisible();

    // --- TOOLTIP ---
    await this.currencyConversionPendingPointsInfoIcon.click({ force: true });
    await expect(this.currencyConversionPendingPointsInfoTooltipText).toBeVisible();
    await expect(this.currencyConversionPendingPointsInfoTooltipText).toHaveText(
      'Foreign exchange rates are updated every 24 hours, based on multiple sources'
    );
    // toggle/close tooltip
    await this.currencyConversionPendingPointsInfoIcon.click({ force: true });

    // --- LAST UPDATED TEXT (from API) ---
    await expect(this.currencyConversionExchangeRateUpdatedText).toBeVisible();
    const lastUpdatedString = this.getTheLastUpdatedTimeString(apiData);
    await expect(this.currencyConversionExchangeRateUpdatedText).toHaveText(lastUpdatedString);
  }

  /**
   * Get the last updated time string from API data
   */
  getTheLastUpdatedTimeString(apiData: any): string {
    const lastUpdatedAt = apiData.results[0].exchangeRate.lastUpdatedAt;
    const lastUpdatedDate = new Date(lastUpdatedAt);
    const now = new Date();

    const diffInMs = now.getTime() - lastUpdatedDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);

    let expectedText: string;

    if (diffInHours >= 1) {
      expectedText = `Exchange rates last updated ${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 1) {
      expectedText = `Exchange rates last updated <${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      expectedText = 'Exchange rates last updated just now';
    }
    return expectedText;
  }

  /**
   * Add a currency to the conversion table
   */
  async addCurrency(currency: string): Promise<void> {
    await this.currencyConversionAddCurrency.waitFor({ state: 'visible' });
    await this.currencyConversionAddCurrency.click();
    await this.dialogHeading.waitFor({ state: 'visible' });
    await expect(this.dialogHeading).toHaveText('Add a currency');
    await expect(this.dialogDescription).toHaveText(
      'Only provisioned payroll currencies will be used for custom conversions of gifted points. Additional currencies may be added in preparation for their future inclusion.'
    );
    await this.dialogInput.fill(currency);
    await this.dialogCurrencySuggestion.waitFor({ state: 'visible', timeout: 5000 });
    await this.dialogCurrencySuggestion.click();
    await this.dialogAddButton.click();
  }

  /**
   * Remove all currency conversion buttons
   */
  async clickRemoveCurrencyConversionButtons(): Promise<void> {
    let deletable: boolean = false;
    const count = await this.currencyTableRemoveButtons.count();
    for (let i = 0; i < count; i++) {
      await this.currencyTableRemoveButtons.nth(i).click();
      deletable = true;
    }
    if (deletable) {
      await this.saveChanges();
    }
  }

  /**
   * Check if currency exists in table
   */
  async isCurrencyInTable(currency: string): Promise<boolean> {
    const currencyRow = this.page.locator(`//td[contains(text(),"${currency}")]`);
    return await this.verifier.isTheElementVisible(currencyRow);
  }

  /**
   * Wait for currency to be visible in table
   */
  async waitForCurrencyInTable(currency: string, timeout: number = 25000): Promise<void> {
    const currencyRow = this.page.locator(`//td[contains(text(),"${currency}")]`);
    await currencyRow.waitFor({ state: 'attached', timeout });
  }

  /**
   * Validate currency is visible in table
   */
  async validateCurrencyInTable(currency: string, shouldBeVisible: boolean): Promise<void> {
    const currencyRow = this.page.locator(`//td[contains(text(),"${currency}")]`);
    if (shouldBeVisible) {
      await expect(currencyRow).toBeVisible();
    } else {
      await expect(currencyRow).not.toBeVisible();
    }
  }

  /**
   * Save currency changes
   */
  async saveChanges(): Promise<void> {
    await this.clickOnElement(this.saveButton, {
      stepInfo: 'Saving currency changes',
    });
    await this.verifyToastMessageIsVisibleWithText('Saved changes successfully');
  }

  /**
   * Verify toast message is visible with specific text
   */
  async verifyToastMessageIsVisibleWithText(message: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.toastMessage, {
      assertionMessage: `Verify toast message "${message}" is visible`,
    });
    await this.verifier.verifyElementHasText(this.toastMessage, message);
    await this.toastCloseButton.click();
  }

  /**
   * Toggle custom conversion for a currency
   */
  async toggleCustomConversion(currency: string, enabled: boolean): Promise<void> {
    const toggleButton = this.page.locator(`//td[contains(text(),"${currency}")]/../td//button[@role="switch"]`);
    const isChecked = await toggleButton.isChecked();
    if (isChecked !== enabled) {
      await toggleButton.click();
    }
  }

  /**
   * Set custom conversion value for a currency
   */
  async setCustomConversionValue(currency: string, value: number): Promise<void> {
    const inputField = this.page.locator(`//td[contains(text(),"${currency}")]/../td//input[@id="${currency}_value"]`);
    await inputField.fill(String(value));
  }

  /**
   * Get conversion value for a currency
   */
  async getConversionValue(currency: string): Promise<string> {
    const valueElement = this.page.locator(
      `//td[contains(text(),"${currency}")]/../td//div[contains(@class,"CurrencyConversions_conversion")]/p`
    );
    return (await valueElement.textContent()) || '';
  }

  /**
   * Validate custom conversion toggle and input field states
   */
  async validateCustomConversionStates(
    currency: string,
    inputShouldBeDisabled: boolean,
    toggleShouldBeVisible: boolean
  ): Promise<void> {
    const inputField = this.page.locator(`//td[contains(text(),"${currency}")]/../td//input[@id="${currency}_value"]`);
    const toggleButton = this.page.locator(`//td[contains(text(),"${currency}")]/../td//button[@role="switch"]`);

    if (inputShouldBeDisabled) {
      await expect(inputField).toBeDisabled();
    } else {
      await expect(inputField).toBeEnabled();
    }

    if (toggleShouldBeVisible) {
      await expect(toggleButton).toBeVisible();
    }
  }

  /**
   * Enable custom conversion and set value
   */
  async enableCustomConversionAndSetValue(currency: string, value: number): Promise<string> {
    await this.validateCustomConversionStates(currency, true, true);
    await this.toggleCustomConversion(currency, true);
    await this.validateCustomConversionStates(currency, false, true);
    await this.setCustomConversionValue(currency, value);
    return await this.getConversionValue(currency);
  }

  /**
   * Disable custom conversion
   */
  async disableCustomConversion(currency: string): Promise<string> {
    await this.validateCustomConversionStates(currency, false, true);

    const toggleButton = this.page.locator(`//td[contains(text(),"${currency}")]/../td//button[@role="switch"]`);
    if (await toggleButton.isChecked()) {
      await this.toggleCustomConversion(currency, false);
      await this.validateCustomConversionStates(currency, true, true);
    }
    return await this.getConversionValue(currency);
  }

  /**
   * Compare integer parts of two values
   */
  compareIntegerParts(value1: string, value2: string): boolean {
    const getIntegerPart = (val: string): string => {
      const numeric = val.replace(/[^\d.]/g, '');
      return numeric.split('.')[0];
    };
    return getIntegerPart(value1) === getIntegerPart(value2);
  }

  /**
   * Download CSV for users without currency
   */
  async downloadCSVForUnsetCurrencyUsers(): Promise<string> {
    await this.csvDownloadButtonForUnsetCurrencyUsers.waitFor({ state: 'visible' });
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.csvDownloadButtonForUnsetCurrencyUsers.click(),
    ]);
    const latestCsvPath = require('path').resolve('./downloads', download.suggestedFilename());
    await download.saveAs(latestCsvPath);
    return latestCsvPath;
  }

  /**
   * Handle unsaved changes dialog
   */
  async handleUnsavedChangesDialog(accept: boolean): Promise<void> {
    this.page.once('dialog', async dialog => {
      if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Navigate to rewards overview to trigger unsaved changes dialog
   */
  async navigateToRewardsOverviewToTriggerDialog(): Promise<void> {
    const rewardsOverviewLink = this.page.locator('[href="/manage/recognition/rewards/overview"]');
    await rewardsOverviewLink.click();
  }

  /**
   * Complete currency management workflow
   */
  async completeCurrencyManagementWorkflow(currency: string): Promise<void> {
    // Remove the currency if it already exists
    await this.clickRemoveCurrencyConversionButtons();

    // Add currency
    await this.addCurrency(currency);
    await this.validateCurrencyInTable(currency, true);
    await this.saveChanges();

    // Wait for currency to be attached
    await this.waitForCurrencyInTable(currency);
    await this.validateCurrencyInTable(currency, true);

    // Remove currency
    await this.verifier.waitUntilElementIsVisible(this.currencyTableRemoveButtons.last());
    await this.clickRemoveCurrencyConversionButtons();
    await this.validateCurrencyInTable(currency, false);
  }

  /**
   * Complete custom conversion workflow
   */
  async completeCustomConversionWorkflow(currency: string, customValue: number): Promise<void> {
    // Add currency and save
    await this.clickRemoveCurrencyConversionButtons();
    await this.addCurrency(currency);
    await this.validateCurrencyInTable(currency, true);

    // Enable custom conversion
    const newValue1 = await this.enableCustomConversionAndSetValue(currency, customValue);
    const preValue1 = await this.getConversionValue(currency);
    expect(this.compareIntegerParts(preValue1, newValue1)).toBe(true);
    await this.saveChanges();

    // Disable custom conversion
    const newValue2 = await this.disableCustomConversion(currency);
    const preValue2 = await this.getConversionValue(currency);
    expect(this.compareIntegerParts(preValue2, newValue2)).toBe(true);
    await this.saveChanges();

    // Clean up
    await this.validateCurrencyInTable(currency, true);
    await this.clickRemoveCurrencyConversionButtons();
  }

  /**
   * Complete unsaved changes dialog workflow
   */
  async completeUnsavedChangesDialogWorkflow(currency: string): Promise<void> {
    // Add currency without saving
    await this.clickRemoveCurrencyConversionButtons();
    await this.addCurrency(currency);
    await this.validateCurrencyInTable(currency, true);

    // Test cancel scenario
    await this.handleUnsavedChangesDialog(false);
    await this.navigateToRewardsOverviewToTriggerDialog();
    await this.validateCurrencyInTable(currency, true);

    // Test accept scenario
    await this.handleUnsavedChangesDialog(true);
    await this.navigateToRewardsOverviewToTriggerDialog();
    await this.loadPage();
    await this.validateCurrencyInTable(currency, false);
  }
}
