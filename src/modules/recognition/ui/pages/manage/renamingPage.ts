import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

export class RenamingPage extends BasePage {
  readonly container: Locator;
  readonly pageHeading: Locator;
  readonly searchInput: Locator;
  readonly recognitionCard: Locator;
  readonly pointsCard: Locator;
  readonly rewardsStoreCard: Locator;
  readonly recognitionEditButton: Locator;
  readonly pointsEditButton: Locator;
  readonly rewardsStoreEditButton: Locator;

  readonly dialogContainer: Locator;
  readonly dialogTitle: Locator;
  readonly dialogNameInput: Locator;
  readonly defaultLanguageInput: Locator;
  readonly dialogSaveButton: Locator;
  readonly dialogCancelButton: Locator;
  readonly dialogCloseButton: Locator;
  readonly dialogErrorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.locator('[data-testid*="pageContainer"]');
    this.pageHeading = page.getByRole('heading', { name: 'Make recognition truly yours' });
    this.searchInput = page.getByPlaceholder('Search Recognition custom label...');

    this.recognitionEditButton = page.getByRole('button', { name: 'Edit name for recognition' });
    this.pointsEditButton = page.getByRole('button', { name: 'Edit name for points' });
    this.rewardsStoreEditButton = page.getByRole('button', { name: 'Edit name for rewardsStore' });

    this.recognitionCard = this.container.locator('div').filter({ has: this.recognitionEditButton }).first();
    this.pointsCard = this.container.locator('div').filter({ has: this.pointsEditButton }).first();
    this.rewardsStoreCard = this.container.locator('div').filter({ has: this.rewardsStoreEditButton }).first();

    this.dialogContainer = page.getByTestId('edit-form-dialog');
    this.dialogTitle = this.dialogContainer.getByRole('heading', {
      level: 2,
      name: 'Edit program name & manage translations',
    });
    this.dialogNameInput = this.dialogContainer
      .getByRole('textbox', { name: /name/i })
      .or(this.dialogContainer.locator('input[type="text"]').first());
    this.defaultLanguageInput = this.dialogContainer.locator('[name="default-language-name-input"]');
    this.dialogSaveButton = this.dialogContainer.getByRole('button', { name: 'Save' });
    this.dialogCancelButton = this.dialogContainer.getByRole('button', { name: 'Cancel' });
    this.dialogCloseButton = this.dialogContainer
      .getByRole('button', { name: 'Close' })
      .or(this.dialogContainer.locator('button[aria-label="Close"]'));
    this.dialogErrorMessage = this.dialogContainer
      .locator('[class*="error"], [class*="Error"]')
      .or(this.dialogContainer.getByText(/error|required|invalid/i));
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the renaming page is loaded', async () => {
      await expect(this.pageHeading, 'expecting page heading "Make recognition truly yours" to be visible').toBeVisible(
        {
          timeout: TIMEOUTS.MEDIUM,
        }
      );
    });
  }

  async clickRecognitionEditButton(): Promise<void> {
    await test.step('Clicking Edit button on Recognition card', async () => {
      await this.clickOnElement(this.recognitionEditButton, { stepInfo: 'Clicking Recognition Edit button' });
    });
  }

  async clickPointsEditButton(): Promise<void> {
    await test.step('Clicking Edit button on Points card', async () => {
      await this.clickOnElement(this.pointsEditButton, { stepInfo: 'Clicking Points Edit button' });
    });
  }

  async clickRewardsStoreEditButton(): Promise<void> {
    await test.step('Clicking Edit button on Rewards store card', async () => {
      await this.clickOnElement(this.rewardsStoreEditButton, { stepInfo: 'Clicking Rewards store Edit button' });
    });
  }

  async enterNameInDialog(newName: string): Promise<void> {
    await test.step(`Entering new name in dialog: ${newName}`, async () => {
      await expect(this.dialogNameInput, 'expecting dialog name input to be visible').toBeVisible();
      await this.fillInElement(this.dialogNameInput, newName);
    });
  }

  async clickDialogSaveButton(): Promise<void> {
    await test.step('Clicking Save button in dialog', async () => {
      await expect(this.dialogSaveButton, 'expecting dialog save button to be visible').toBeVisible();
      await this.clickOnElement(this.dialogSaveButton, { stepInfo: 'Clicking dialog save button' });
    });
  }

  async clickDialogCancelButton(): Promise<void> {
    await test.step('Clicking Cancel button in dialog', async () => {
      await expect(this.dialogCancelButton, 'expecting dialog cancel button to be visible').toBeVisible();
      await this.clickOnElement(this.dialogCancelButton, { stepInfo: 'Clicking dialog cancel button' });
    });
  }

  async clickDialogCloseButton(): Promise<void> {
    await test.step('Clicking Close button in dialog', async () => {
      await expect(this.dialogCloseButton, 'expecting dialog close button to be visible').toBeVisible();
      await this.clickOnElement(this.dialogCloseButton, { stepInfo: 'Clicking dialog close button' });
    });
  }

  async renameRecognition(newName: string): Promise<void> {
    await test.step(`Renaming Recognition to: ${newName}`, async () => {
      await this.clickRecognitionEditButton();
      await this.enterNameInDialog(newName);
      await this.clickDialogSaveButton();
    });
  }

  async renamePoints(newName: string): Promise<void> {
    await test.step(`Renaming Points to: ${newName}`, async () => {
      await this.clickPointsEditButton();
      await this.enterNameInDialog(newName);
      await this.clickDialogSaveButton();
    });
  }

  async renameRewardsStore(newName: string): Promise<void> {
    await test.step(`Renaming Rewards store to: ${newName}`, async () => {
      await this.clickRewardsStoreEditButton();
      await this.enterNameInDialog(newName);
      await this.clickDialogSaveButton();
    });
  }

  async verifyDialogErrorMessageIsVisible(errorText?: string): Promise<void> {
    await test.step('Verifying error message is visible in dialog', async () => {
      if (errorText) {
        const errorLocator = this.dialogContainer.getByText(errorText);
        await expect(errorLocator, `expecting error message "${errorText}" to be visible`).toBeVisible({
          timeout: TIMEOUTS.SHORT,
        });
      } else {
        await expect(this.dialogErrorMessage, 'expecting error message to be visible').toBeVisible({
          timeout: TIMEOUTS.SHORT,
        });
      }
    });
  }

  async verifyDialogNameInputValue(expectedValue: string): Promise<void> {
    await test.step(`Verifying dialog name input value is: ${expectedValue}`, async () => {
      await expect(this.dialogNameInput, `expecting dialog name input to have value "${expectedValue}"`).toHaveValue(
        expectedValue
      );
    });
  }

  getEditButtonByCardType(cardType: 'recognition' | 'points' | 'rewardsStore'): Locator {
    switch (cardType) {
      case 'recognition':
        return this.recognitionEditButton;
      case 'points':
        return this.pointsEditButton;
      case 'rewardsStore':
        return this.rewardsStoreEditButton;
      default:
        throw new Error(`Invalid card type: ${cardType}`);
    }
  }

  async clickEditButtonByCardType(cardType: 'recognition' | 'points' | 'rewardsStore'): Promise<void> {
    await test.step(`Clicking Edit button for ${cardType}`, async () => {
      const editButton = this.getEditButtonByCardType(cardType);
      await this.clickOnElement(editButton, { stepInfo: `Clicking Edit button for ${cardType}` });
    });
  }

  async verifyModalIsVisible(): Promise<void> {
    await test.step('Verifying modal is visible', async () => {
      await expect(this.dialogContainer, 'expecting dialog container to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(this.dialogTitle, 'expecting dialog title to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyDefaultLanguageInputIsDisabled(): Promise<void> {
    await test.step('Verifying default language input is disabled', async () => {
      await expect(this.defaultLanguageInput, 'expecting default language input to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(this.defaultLanguageInput, 'expecting default language input to be disabled').toBeDisabled();
    });
  }
}
