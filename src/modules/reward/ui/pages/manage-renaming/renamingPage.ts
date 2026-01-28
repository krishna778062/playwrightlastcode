import { expect, Locator, Page, test } from '@playwright/test';
import { LanguageApiService } from '@rewards/api/services/LanguageApiService';
import { getRewardTenantConfigFromCache } from '@rewards/config/rewardConfig';
import { EditLabelModal } from '@rewards-components/manage-renaming/edit-label-modal';
import { GiveRecognitionDialogBox } from '@rewards-components/recognition/give-recognition-dialog-box';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RecognitionHubPage } from '@rewards-pages/recognition-hub/recognition-hub-page';
import { RewardsStore } from '@rewards-pages/reward-store/reward-store';
import { RewardsDialogBox } from '@rewards-pages/reward-store/rewards-dialog-box';

import { HomeDashboardPage } from '@content/ui/pages/homeDashboardPage';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS, TestDataGenerator } from '@/src/core';
import { RewardSitesService } from '@/src/modules/reward/api/services/RewardSitesService';

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

  readonly recognitionCustomName: Locator;
  readonly pointsCustomName: Locator;
  readonly rewardsStoreCustomName: Locator;

  readonly recognitionCustomNameLabel: Locator;
  readonly pointsCustomNameLabel: Locator;
  readonly rewardsCustomNameLabel: Locator;

  readonly dialogContainer: Locator;
  readonly dialogTitle: Locator;
  readonly dialogNameInput: Locator;
  readonly defaultLanguageInput: Locator;
  readonly dialogSaveButton: Locator;
  readonly dialogCancelButton: Locator;
  readonly dialogCloseButton: Locator;
  readonly dialogErrorMessage: Locator;
  private recognitionDefaultName: Locator;
  private pointsDefaultName: Locator;
  private rewardsStoreDefaultName: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_RECOGNITION_RENAMING);
    this.container = page.locator('[data-testid*="pageContainer"]');
    this.pageHeading = page.getByRole('heading', { name: 'Make recognition truly yours' });
    this.searchInput = page.getByPlaceholder('Search Recognition custom label...');

    this.recognitionEditButton = page.getByRole('button', { name: 'Edit name for recognition' });
    this.pointsEditButton = page.getByRole('button', { name: 'Edit name for points' });
    this.rewardsStoreEditButton = page.getByRole('button', { name: 'Edit name for rewardsStore' });

    this.recognitionCustomName = this.page.locator('[data-testid="naming-card-name-recognition"]');
    this.pointsCustomName = this.page.locator('[data-testid="naming-card-name-points"]');
    this.rewardsStoreCustomName = this.page.locator('[data-testid="naming-card-name-rewardsStore"]');

    this.recognitionDefaultName = this.page.locator('[data-testid="naming-card-default-name-recognition"]');
    this.pointsDefaultName = this.page.locator('[data-testid="naming-card-default-name-points"]');
    this.rewardsStoreDefaultName = this.page.locator('[data-testid="naming-card-default-name-rewardsStore"]');

    this.recognitionCustomNameLabel = this.recognitionEditButton.locator('xpath=//parent::div//parent::div//span');
    this.pointsCustomNameLabel = this.pointsEditButton.locator('xpath=//parent::div//parent::div//span');
    this.rewardsCustomNameLabel = this.rewardsStoreEditButton.locator('xpath=//parent::div//parent::div//span');

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

  async visit() {
    await test.step('Visit to Manage Renaming page', async () => {
      await this.page.goto(PAGE_ENDPOINTS.MANAGE_RECOGNITION_RENAMING);
      await this.verifyThePageIsLoaded();
    });
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
      await this.clickOnElement(editButton, {
        timeout: TIMEOUTS.SHORT,
        stepInfo: `Clicking Edit button for ${cardType}`,
      });
      const dialog = new EditLabelModal(this.page);
      await this.verifier.waitUntilElementIsVisible(dialog.getSaveButton(), { timeout: TIMEOUTS.VERY_VERY_SHORT });
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

  async verifyDefaultLanguageInputIs(enabledOrDisabled: boolean): Promise<void> {
    await test.step('Verifying default language input is disabled', async () => {
      await expect(this.defaultLanguageInput, 'expecting default language input to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      if (enabledOrDisabled) {
        await expect(this.defaultLanguageInput, 'expecting default language input to be disabled').toBeEnabled();
      } else {
        await expect(this.defaultLanguageInput, 'expecting default language input to be disabled').toBeDisabled();
      }
    });
  }

  async validateTheCurrentPageURL(url: string): Promise<void> {
    await test.step(`Validating the current page is ${url}`, async () => {
      await expect(this.page, `expecting current page URL to be ${url}`).toHaveURL(url);
    });
  }

  async validateTheRenamingPageElements(headings: string[]): Promise<void> {
    for (const heading of headings) {
      const headingLocator = this.container.getByRole('heading', { name: heading, level: 2 });
      await expect(headingLocator, `expecting heading "${heading}" to be visible`).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    }
  }

  async verifyTheEditOptions(editButtonLabel: string) {
    const editButton = this.container.getByRole('button', { name: editButtonLabel });
    await expect(editButton, `expecting edit button "${editButtonLabel}" to be visible`).toBeVisible({
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async validateTheHarnessFlagValue(flagName: string, expectedValue: boolean) {
    await test.step(`Validating the harness flag ${flagName} is set to ${expectedValue}`, async () => {
      const flagValue = await this.getHarnessFlagValue(flagName);
      expect(flagValue, `Expected harness flag ${flagName} to be ${expectedValue}, but got ${flagValue}`).toBe(
        expectedValue
      );
    });
  }

  private async getHarnessFlagValue(flagName: string): Promise<boolean> {
    const apiUrlPattern = /\/api\/1\.0\/client\/env\/.*\/target\/.*\/evaluations\?cluster=2/;
    const [response] = await Promise.all([
      this.page.waitForResponse(resp => apiUrlPattern.test(resp.url()) && resp.status() === 200, {
        timeout: TIMEOUTS.SHORT,
      }),
      this.page.reload(),
      this.verifyThePageIsLoaded(),
    ]);
    const json = await response.json();
    const flag = json.find((item: any) => item.flag === flagName);
    if (!flag || typeof flag.value !== 'string') {
      throw new Error(`Harness flag "${flagName}" not found in response`);
    }
    return flag.value.toLowerCase() === 'true';
  }

  async isCardCustomized(cardType: 'recognition' | 'points' | 'rewardsStore'): Promise<boolean> {
    let locator: Locator;
    switch (cardType) {
      case 'recognition':
        locator = this.recognitionCustomNameLabel;
        break;
      case 'points':
        locator = this.pointsCustomNameLabel;
        break;
      case 'rewardsStore':
        locator = this.rewardsCustomNameLabel;
        break;
      default:
        throw new Error(`Invalid card type: ${cardType}`);
    }
    return this.verifier.isTheElementVisible(locator, { timeout: TIMEOUTS.VERY_VERY_SHORT });
  }

  async mockTheAppConfigAPIForTwoLanguages(numbers: number[]) {
    await this.page.route('**/account/appConfig', async route => {
      const originalResponse = await route.fetch();
      const body = await originalResponse.json();

      if (body?.result?.selectedLanguages.ids !== undefined) {
        body.result.selectedLanguages.ids = numbers;
      } else {
        console.warn('⚠️ Could not find result.language.selectedLanguages.ids in response, leaving unchanged');
      }
      await route.fulfill({
        response: originalResponse,
        body: JSON.stringify(body),
        headers: {
          ...originalResponse.headers(),
          'content-type': 'application/json',
        },
      });
    });
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  async validateTheEditModalElements(customized: boolean) {
    const editModal = new EditLabelModal(this.page);
    const modalTitle = await editModal.getTheTitleOfTheModal();
    expect(modalTitle).toContain('Edit program name & manage translations');
    await this.verifier.isTheElementVisible(editModal.getCloseButton(), { timeout: TIMEOUTS.VERY_VERY_SHORT });
    await this.verifier.isTheElementVisible(editModal.getSaveButton(), { timeout: TIMEOUTS.VERY_VERY_SHORT });
    await this.verifier.isTheElementVisible(editModal.getCancelButton(), { timeout: TIMEOUTS.VERY_VERY_SHORT });

    await this.verifier.isTheElementVisible(editModal.getCustomLabel(), { timeout: TIMEOUTS.VERY_VERY_SHORT });
    await this.verifier.isTheElementVisible(editModal.getCustomLabelToggleSwitch(), {
      timeout: TIMEOUTS.VERY_VERY_SHORT,
    });
    if (customized) {
      await expect(editModal.getCustomLabelToggleSwitch()).toBeChecked();
    } else {
      await expect(editModal.getCustomLabelToggleSwitch()).not.toBeChecked();
    }

    await this.verifier.verifyTheElementIsVisible(editModal.getCustomLabelInputBox(), {
      timeout: TIMEOUTS.VERY_VERY_SHORT,
    });
    const option = await editModal.getCustomLabelInputBox().inputValue();
    await this.verifier.verifyTheElementIsVisible(editModal.getCustomLabelForAllLanguageCheckbox(option), {
      timeout: TIMEOUTS.VERY_VERY_SHORT,
    });
    const isRecognitionForAllLanguagesChecked = await editModal
      .getCustomLabelForAllLanguageCheckbox(option)
      .isChecked();
    if (isRecognitionForAllLanguagesChecked) {
      await this.verifier.verifyTheElementIsVisible(editModal.getManualTranslationDisabledAlert(), {
        timeout: TIMEOUTS.VERY_VERY_SHORT,
      });
      await editModal.getCustomLabelForAllLanguageCheckbox(option).uncheck();
      await this.verifier.verifyTheElementIsNotVisible(editModal.getManualTranslationDisabledAlert(), {
        timeout: TIMEOUTS.VERY_VERY_SHORT,
      });
    } else {
      await this.verifier.verifyTheElementIsNotVisible(editModal.getManualTranslationDisabledAlert(), {
        timeout: TIMEOUTS.VERY_VERY_SHORT,
      });
      await editModal.getCustomLabelForAllLanguageCheckbox(option).check();
      await this.verifier.verifyTheElementIsVisible(editModal.getManualTranslationDisabledAlert(), {
        timeout: TIMEOUTS.VERY_VERY_SHORT,
      });
    }
    await this.clickOnElement(editModal.getCancelButton(), {
      stepInfo: 'Closing the Edit Label modal after validating elements',
    });
  }

  async validateTheEditModalWithMockedResult(): Promise<void> {
    const editModal = new EditLabelModal(this.page);
    const translationText = editModal.page.getByText('Translations (2 languages)', { exact: true });
    const language1 = editModal.page.getByLabel('English - English (UK)');
    const language2 = editModal.page.getByLabel('French - Français');
    const languageAutoTranslationLabel = editModal.page.getByText(
      'Automatic translations - powered by Google Translate'
    );
    await expect(translationText, 'expecting Translations text to be visible').toBeVisible({
      timeout: TIMEOUTS.VERY_SHORT,
    });
    await expect(language1, 'expecting Language 1 heading to be visible').toBeVisible({
      timeout: TIMEOUTS.VERY_SHORT,
    });
    await expect(language2, 'expecting Language 2 heading to be visible').toBeVisible({
      timeout: TIMEOUTS.VERY_SHORT,
    });
    await expect(languageAutoTranslationLabel, 'expecting Language 2 heading to be visible').toBeVisible({
      timeout: TIMEOUTS.VERY_SHORT,
    });
  }

  async changeSomeDataAndClickOnSave(cardType: 'Recognition' | 'Points' | 'Rewards Store'): Promise<string> {
    const editModal = new EditLabelModal(this.page);
    await editModal.getCustomLabelToggleSwitch().check();
    const customName = cardType + '_' + TestDataGenerator.getRandomNo(0, 1000);
    const isRecognitionForAllLanguagesChecked = await editModal.getCustomLabelToggleSwitch().isChecked();
    if (!isRecognitionForAllLanguagesChecked) {
      await editModal.getCustomLabelToggleSwitch().check();
    }
    switch (cardType) {
      case 'Recognition':
        await this.fillInElement(editModal.getCustomLabelInputBox(), customName, {
          stepInfo: `entering custom name ${customName} in Edit Label modal for recognition`,
        });
        break;
      case 'Points':
        await this.fillInElement(editModal.getCustomLabelInputBox(), customName, {
          stepInfo: `entering custom name ${customName} in Edit Label modal for recognition`,
        });
        break;
      case 'Rewards Store':
        await this.fillInElement(editModal.getCustomLabelInputBox(), customName, {
          stepInfo: `entering custom name ${customName} in Edit Label modal for recognition`,
        });
        break;
      default:
        throw new Error(`Invalid card type: ${cardType}`);
    }
    await this.verifier.verifyTheElementIsEnabled(editModal.getSaveButton());
    await this.clickOnElement(editModal.getSaveButton(), {
      stepInfo: `Clicking Save button in Edit Label modal for ${cardType}`,
    });
    await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    return customName;
  }

  async changeSomeDataAndClickOnCancel(cardType: 'Recognition' | 'Points' | 'Rewards Store'): Promise<string> {
    const editModal = new EditLabelModal(this.page);
    await editModal.getCustomLabelToggleSwitch().check();
    const customName = 'Reward Store_' + TestDataGenerator.getRandomNo(0, 10000);
    const isRecognitionForAllLanguagesChecked = await editModal.getCustomLabelToggleSwitch().isChecked();
    if (!isRecognitionForAllLanguagesChecked) {
      await editModal.getCustomLabelToggleSwitch().check();
    }
    switch (cardType) {
      case 'Recognition':
        await this.fillInElement(editModal.getCustomLabelInputBox(), customName, {
          stepInfo: `entering custom name ${customName} in Edit Label modal for recognition`,
        });
        break;
      case 'Points':
        await this.fillInElement(editModal.getCustomLabelInputBox(), customName, {
          stepInfo: `entering custom name ${customName} in Edit Label modal for recognition`,
        });
        break;
      case 'Rewards Store':
        await this.fillInElement(editModal.getCustomLabelInputBox(), customName, {
          stepInfo: `entering custom name ${customName} in Edit Label modal for recognition`,
        });
        break;
      default:
        throw new Error(`Invalid card type: ${cardType}`);
    }
    await this.clickOnElement(editModal.getCancelButton(), {
      stepInfo: `Clicking Cancel button in Edit Label modal for ${cardType}`,
    });
    return customName;
  }

  async releaseTheAppConfigAPIData(): Promise<void> {
    try {
      // Remove any route handler mocking the appConfig endpoint so real responses are returned
      await this.page.unroute('**/account/appConfig');
    } catch (err) {
      console.warn('Could not unroute appConfig (it may not be mocked):', err);
    }
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  async getTheNewCustomizedValue(cardType: 'recognition' | 'points' | 'rewardsStore'): Promise<string | null> {
    let locator: Locator;
    switch (cardType) {
      case 'rewardsStore':
        locator = this.rewardsStoreCustomName;
        break;
      case 'recognition':
        locator = this.recognitionCustomName;
        break;
      case 'points':
        locator = this.pointsCustomName;
        break;
      default:
        throw new Error(`Invalid card type: ${cardType}`);
    }
    await this.verifier.waitUntilElementIsVisible(locator);
    return await locator.textContent();
  }

  async getAllTheCustomValue(): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    const recognition = (await this.getTheNewCustomizedValue('recognition'))?.trim() ?? '';
    const points = (await this.getTheNewCustomizedValue('points'))?.trim() ?? '';
    const rewardsStore = (await this.getTheNewCustomizedValue('rewardsStore'))?.trim() ?? '';
    map.set('recognition', recognition);
    map.set('points', points);
    map.set('rewardsStore', rewardsStore);
    return map;
  }

  async enableTheLanguageInTenantIfNotEnabled(languages: string[]) {
    await test.step('Enable tenant languages from General Settings if only default language is enabled', async () => {
      const appConfigResponse = await this.performActionAndWaitForResponse(
        async () => {
          await this.page.goto(PAGE_ENDPOINTS.APPLICATION_GENERAL_SETTINGS_PAGE);
          const locator = this.page.locator('legend').getByRole('heading', { name: 'Languages' });
          await this.verifier.waitUntilElementIsVisible(locator, { timeout: TIMEOUTS.MEDIUM });
        },
        resp => resp.url().includes('/v1/account/appConfig') && resp.status() === 200,
        { timeout: TIMEOUTS.MEDIUM, stepInfo: 'Navigate to General Settings and capture appConfig response' }
      );

      await appConfigResponse.json();
      const count = languages.length;
      let changes: boolean = false;
      for (let i = 0; i < count; i++) {
        const checkbox = this.page.getByRole('checkbox', { name: `${languages[i]}`, exact: true });
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.check();
          changes = true;
        } else {
        }
      }
      if (changes) {
        const saveButton = this.page.getByRole('button', { name: 'Save' }).first();
        await saveButton.scrollIntoViewIfNeeded();
        await this.clickOnElement(saveButton, { stepInfo: 'Click Save button on General Settings page' });
        await this.verifyToastMessageIsVisibleWithText('Saved changes successfully', {
          timeout: TIMEOUTS.SHORT,
        });
      }
      await this.visit();
    });
  }

  async unCheckAndCheckTheCustomLanguageForAll(status: 'checked' | 'unchecked', cardType: string): Promise<void> {
    const editModal = new EditLabelModal(this.page);
    if (status === 'checked') {
      await this.checkElement(editModal.getCustomLabelForAllLanguageCheckbox(cardType));
    } else {
      await this.unCheckElement(editModal.getCustomLabelForAllLanguageCheckbox(cardType));
    }
  }

  async enableTheOtherLanguageAndEnterCustomValue(cardType: 'recognition' | 'points' | 'rewardsStore') {
    const editModal = new EditLabelModal(this.page);
    const manualTranslationSwitches = editModal.getManualTranslationToggleSwitch();
    const otherLanguageCustomValueInputBox = editModal.getOtherLanguageCustomInputBox();
    for (let i = 0; i < (await manualTranslationSwitches.count()); i++) {
      await manualTranslationSwitches.nth(i).check();
      await otherLanguageCustomValueInputBox
        .nth(i)
        .fill(`${cardType}_${i + 1}_Custom_Language_${TestDataGenerator.getRandomNo(0, 200)}`);
    }
    await this.clickOnSaveButton();
    await this.page.waitForTimeout(TIMEOUTS.VERY_VERY_SHORT);
  }

  async clickOnResetButton() {
    const editModal = new EditLabelModal(this.page);
    await this.clickOnElement(editModal.getResetAllTranslationToAutomatic());
  }

  async getTheDefaultTranslationValues(): Promise<string[]> {
    const editModal = new EditLabelModal(this.page);
    const stringArray: string[] = [];
    const manualTranslationSwitches = editModal.getManualTranslationToggleSwitch();
    for (let i = 0; i < (await manualTranslationSwitches.count()); i++) {
      const input = editModal.getOtherLanguageCustomInputBox(i);
      await expect(input, 'expecting other language input to finish loading and have a value').toHaveValue(
        /^(?!Loading).+/,
        { timeout: TIMEOUTS.MEDIUM }
      );
      stringArray.push(await input.inputValue());
    }
    return stringArray;
  }

  async getTheDefaultTranslationValuesByLanguages(): Promise<Map<string, string>> {
    const editModal = new EditLabelModal(this.page);
    const map = new Map<string, string>();
    await editModal.verifyThePageIsLoaded();
    await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    const manualTranslationSwitches = editModal.getManualTranslationToggleSwitch();
    const count = await manualTranslationSwitches.count();
    for (let i = 0; i < count; i++) {
      const input = editModal.getOtherLanguageCustomInputBox(i);
      await expect(input, 'expecting other language input to finish loading and have a value').toHaveValue(
        /^(?!Loading).+/,
        { timeout: TIMEOUTS.MEDIUM }
      );
      const value = await input.inputValue();
      expect(value, 'expecting other language input to have a non-empty value').not.toBe('');
      const languageLabel = (await editModal.getOtherLanguageCustomLabel(i).textContent())?.trim() ?? '';
      map.set(languageLabel, value);
    }
    return map;
  }

  async setTheManualTranslationValuesByLanguages(
    cardType: 'recognition' | 'points' | 'rewardStore'
  ): Promise<Map<string, string>> {
    const editModal = new EditLabelModal(this.page);
    const map = new Map<string, string>();
    await editModal.verifyThePageIsLoaded();
    await this.page.waitForTimeout(TIMEOUTS.VERY_VERY_SHORT);
    const manualTranslationSwitches = editModal.getManualTranslationToggleSwitch();
    const count = await manualTranslationSwitches.count();
    for (let i = 0; i < count; i++) {
      await this.checkElement(manualTranslationSwitches.nth(i));
      const input = editModal.getOtherLanguageCustomInputBox(i);
      await expect(input, 'expecting other language input to finish loading and have a value').toHaveValue(
        /^(?!Loading).+/,
        { timeout: TIMEOUTS.MEDIUM }
      );
      const languageLabel = (await editModal.getOtherLanguageCustomLabel(i).textContent())?.trim() ?? '';
      const value = languageLabel.split(' - ')[0] + `_${cardType}_` + TestDataGenerator.getRandomNo(10, 999);
      map.set(languageLabel.split(' - ')[0], value);
      await input.clear();
      await this.fillInElement(input, value, { stepInfo: `Entering manual translation value for ${languageLabel}` });
    }
    await this.verifier.verifyTheElementIsEnabled(editModal.getSaveButton());
    await this.clickOnElement(editModal.getSaveButton());
    await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    return map;
  }

  async validateTheLanguageDataRested(defaultOtherLanguageTranslationValue: string[]) {
    const editModal = new EditLabelModal(this.page);
    const manualTranslationSwitches = editModal.getManualTranslationToggleSwitch();
    for (let i = 0; i < (await manualTranslationSwitches.count()); i++) {
      const input = editModal.getOtherLanguageCustomInputBox(i);
      await expect(input, 'expecting other language input to finish loading and have a value').toHaveValue(
        /^(?!Loading).+/,
        { timeout: TIMEOUTS.MEDIUM }
      );
      expect(defaultOtherLanguageTranslationValue).toContain(await input.inputValue());
    }
  }

  async clickOnSaveButton(): Promise<void> {
    const editModal = new EditLabelModal(this.page);
    await this.verifier.verifyTheElementIsEnabled(editModal.getSaveButton());
    await editModal.getSaveButton().click();
  }

  async validateTheCustomizedValueOnHomePage(cardType: 'Recognition' | 'Points' | 'Reward Store', customValue: string) {
    await this.page.goto(PAGE_ENDPOINTS.HOME_PAGE);
    let navMenuLocator: Locator, recognitionCreationButtonInFeed: Locator;
    switch (cardType) {
      case 'Recognition':
        navMenuLocator = this.page.locator(`[data-testid="main-nav-item"] span:has-text("${customValue}")`);
        await this.verifier.verifyTheElementIsVisible(navMenuLocator, { timeout: TIMEOUTS.SHORT });
        await this.page.locator('[class*="PostForm"] button').click();
        recognitionCreationButtonInFeed = this.page
          .locator('[for="recognition"] button[id="recognition"]')
          .filter({ hasText: customValue });
        await this.verifier.verifyTheElementIsVisible(recognitionCreationButtonInFeed, { timeout: TIMEOUTS.SHORT });
        break;
      case 'Points':
        await this.verifier.waitUntilElementIsVisible(this.page.locator('[class*="PostForm"] button'), {
          timeout: TIMEOUTS.MEDIUM,
        });
        await this.page.locator('[class*="PostForm"] button').click();
        recognitionCreationButtonInFeed = this.page.locator('[for="recognition"] button[id="recognition"]');
        await this.clickOnElement(recognitionCreationButtonInFeed, { timeout: TIMEOUTS.SHORT });
        const pointLabel = this.page.locator('[name="peerGifting.peerGiftingEnabled"]+span');
        await this.verifier.verifyTheElementIsVisible(pointLabel, { timeout: TIMEOUTS.SHORT });
        expect(await pointLabel.textContent()).toContain(customValue);
        break;
      case 'Reward Store':
        const rewardStore = new RewardsStore(this.page);
        await rewardStore.visit();
        await rewardStore.verifyThePageIsLoaded();
        const rewardStoreHeading = this.page.locator(`[class*="PageContainerFullscreen_header"] h1`).filter({
          hasText: customValue,
        });
        await this.verifier.verifyTheElementIsVisible(rewardStoreHeading, { timeout: TIMEOUTS.SHORT });
        break;
      default:
        throw new Error(`Invalid card type: ${cardType}`);
    }
  }

  async validateTheCustomizedValueOnRecognitionHubPage(
    cardType: 'Recognition' | 'Points' | 'Reward Store',
    customValue: string
  ) {
    let recognitionHubHeading: Locator, giveRecognitionButton: Locator;
    const recognitionHub = new RecognitionHubPage(this.page);
    await recognitionHub.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
    await recognitionHub.verifyThePageIsLoaded();
    switch (cardType) {
      case 'Recognition':
        recognitionHubHeading = this.page
          .locator(`[class*="PageContainerFullscreen_header"] h1`)
          .filter({ hasText: customValue });
        await this.verifier.verifyTheElementIsVisible(recognitionHubHeading, { timeout: TIMEOUTS.SHORT });
        giveRecognitionButton = this.page
          .locator(`[class*="PageContainerFullscreen_header"] h1 + div > button`)
          .filter({ hasText: customValue });
        await this.verifier.verifyTheElementIsVisible(giveRecognitionButton, { timeout: TIMEOUTS.SHORT });
        break;
      case 'Points':
        const panelHeading = this.page
          .locator('a[href="/rewards-store/order-history"]')
          .locator('xpath=ancestor::div[contains(@style,"align-items")]')
          .locator('h2')
          .filter({ hasText: customValue });
        const pointsToGiveLabel = this.page
          .getByTestId('i-gift')
          .locator('xpath=ancestor::div[contains(@class,"RewardsWallet_item")]')
          .locator('p')
          .filter({ hasNotText: /^\d+$/ }) // exclude numeric value like 490
          .first();
        const pointsToSpendLabel = this.page
          .getByTestId('i-coinsStacked')
          .locator('xpath=ancestor::div[contains(@class,"RewardsWallet_item")]')
          .locator('p')
          .filter({ hasNotText: /^\d+$/ })
          .first();
        await this.verifier.verifyTheElementIsVisible(panelHeading);
        await expect(panelHeading).toContainText(customValue);
        await this.verifier.verifyTheElementIsVisible(pointsToGiveLabel);
        await expect(pointsToGiveLabel).toContainText(customValue);
        await this.verifier.verifyTheElementIsVisible(pointsToSpendLabel);
        await expect(pointsToSpendLabel).toContainText(customValue);
        break;
      case 'Reward Store':
        const rewardStore = new RewardsStore(this.page);
        await rewardStore.visit();
        await rewardStore.verifyThePageIsLoaded();
        const rewardStoreHeading = this.page.locator(`[class*="PageContainerFullscreen_header"] h1`).filter({
          hasText: customValue,
        });
        await this.verifier.verifyTheElementIsVisible(rewardStoreHeading, { timeout: TIMEOUTS.SHORT });
        break;
      default:
        throw new Error(`Invalid card type: ${cardType}`);
    }
  }

  async validateTheCustomizedValueOnSiteDashboardPage(
    cardType: 'Recognition' | 'Points' | 'Reward Store',
    customValue: string
  ) {
    await this.openOneSiteDashboard();
    let recognitionCreationButtonInFeed: Locator;
    switch (cardType) {
      case 'Recognition':
        await this.verifier.waitUntilElementIsVisible(this.page.locator('[class*="PostForm"] button'), {
          timeout: TIMEOUTS.MEDIUM,
          stepInfo: 'Waiting for recognition creation button to be visible on site dashboard page',
        });
        await this.page.locator('[class*="PostForm"] button').click();
        recognitionCreationButtonInFeed = this.page
          .locator('[for="recognition"] button[id="recognition"]')
          .filter({ hasText: customValue });
        await this.verifier.verifyTheElementIsVisible(recognitionCreationButtonInFeed, { timeout: TIMEOUTS.SHORT });
        break;
      case 'Points':
        await this.verifier.waitUntilElementIsVisible(this.page.locator('[class*="PostForm"] button'), {
          timeout: TIMEOUTS.MEDIUM,
          stepInfo: 'Waiting for recognition creation button to be visible on site dashboard page',
        });
        await this.clickOnElement(this.page.locator('[class*="PostForm"] button'));
        recognitionCreationButtonInFeed = this.page.locator('[for="recognition"] button[id="recognition"]');
        await this.verifier.verifyTheElementIsVisible(recognitionCreationButtonInFeed, { timeout: TIMEOUTS.SHORT });
        await this.clickOnElement(recognitionCreationButtonInFeed);
        const pointLabel = this.page.locator('[name="peerGifting.peerGiftingEnabled"]+span');
        await this.verifier.verifyTheElementIsVisible(pointLabel, { timeout: TIMEOUTS.SHORT });
        expect(await pointLabel.textContent()).toContain(customValue);
        break;
      case 'Reward Store':
        const rewardStore = new RewardsStore(this.page);
        await rewardStore.visit();
        await rewardStore.verifyThePageIsLoaded();
        const rewardStoreHeading = this.page.locator(`[class*="PageContainerFullscreen_header"] h1`).filter({
          hasText: customValue,
        });
        await this.verifier.verifyTheElementIsVisible(rewardStoreHeading, { timeout: TIMEOUTS.SHORT });
        break;
      default:
        throw new Error(`Invalid card type: ${cardType}`);
    }
  }

  /**
   * Reloads the current page, captures `/v1/account/appConfig` response,
   * and returns `result.selectedLanguages.ids` as number[].
   */
  async getSelectedLanguageIdsFromAppConfig(): Promise<number[]> {
    return await test.step('Capture appConfig and read selectedLanguages.ids', async () => {
      const [appConfigResponse] = await Promise.all([
        this.page.waitForResponse(resp => resp.url().includes('/v1/account/appConfig') && resp.status() === 200, {
          timeout: TIMEOUTS.MEDIUM,
        }),
        this.page.reload({ waitUntil: 'domcontentloaded' }),
      ]);

      const json = await appConfigResponse.json();
      const ids = json?.result?.selectedLanguages?.ids;
      if (!Array.isArray(ids)) {
        throw new Error(`selectedLanguages.ids not found in appConfig response: ${JSON.stringify(json)}`);
      }
      return ids.map((n: any) => Number(n)).filter((n: number) => Number.isFinite(n));
    });
  }

  /**
   * 1) Gets active sites via API
   * 2) If none exist, creates (or activates) a site named "renaming site validation"
   * 3) Opens the first site's dashboard
   */
  async openOneSiteDashboard(): Promise<{ siteId: string; siteName: string }> {
    return await test.step('Open one site dashboard (get/create via API)', async () => {
      const sitesService = new RewardSitesService();
      const site = await sitesService.getOrCreateFirstActiveSite(this.page, 'renaming site validation');
      await this.page.goto(PAGE_ENDPOINTS.getSiteDashboardPage(site.siteId));
      await expect(this.page, 'expecting to be on site dashboard page').toHaveURL(
        new RegExp(`/site/${site.siteId}/dashboard`)
      );
      return site;
    });
  }

  // ---------- Common Locators ----------
  private get postFormButton(): Locator {
    return this.page.locator('[class*="PostForm"] button');
  }

  private get recognitionCreationButton(): Locator {
    return this.page.locator('[for="recognition"] button[id="recognition"]');
  }

  private get pointsLabel(): Locator {
    return this.page.locator('[name="peerGifting.peerGiftingEnabled"]+span');
  }

  // ---------- Common Actions ----------
  private async openRecognitionComposer(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.postFormButton, {
      timeout: TIMEOUTS.MEDIUM,
      stepInfo: 'Post Form button is visible on the page',
    });
    await this.clickByInjectingJavaScript(this.postFormButton);
    await this.verifier.waitUntilElementIsVisible(this.recognitionCreationButton, {
      stepInfo: 'Recognition Button in Post Form button is visible',
    });
  }

  private walletTextLabel(testId: string): Locator {
    return this.page
      .getByTestId(testId)
      .locator('xpath=ancestor::div[contains(@class,"RewardsWallet_item")]')
      .locator('p')
      .filter({ hasNotText: /^\d+$/ })
      .first();
  }

  private async verifyPointsLabelText(locator: Locator, expected: string): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(locator, { timeout: TIMEOUTS.MEDIUM });
    await locator.scrollIntoViewIfNeeded();
    await this.verifier.verifyElementContainsText(locator, expected, {
      assertionMessage: `Verifying ${await locator.textContent()} label contains expected text: ${expected}`,
    });
  }

  private async validateRecognitionOnHome(customValue: any): Promise<void> {
    const recognition = customValue.get('recognition');
    const homePage = new HomeDashboardPage(this.page);
    await homePage.visit();
    const locator = this.page.locator(`[data-testid="main-nav-item"] span:has-text("${recognition}")`);
    await this.verifier.verifyTheElementIsVisible(locator, {
      assertionMessage: `Verifying recognition nav menu with label ${await locator.textContent()} is visible on home page`,
    });
    await this.openRecognitionComposer();
    await this.verifier.verifyTheElementIsVisible(this.recognitionCreationButton.filter({ hasText: recognition }));
  }

  private async validateRecognitionOnHub(customValue: any): Promise<void> {
    const hub = new RecognitionHubPage(this.page);
    await hub.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
    await hub.verifyThePageIsLoaded();
    const recognitionHubHeading = this.page.locator('[class*="PageContainerFullscreen_header"] h1');
    await this.verifier.verifyTheElementIsVisible(recognitionHubHeading, {
      assertionMessage: `Verifying recognition hub heading with label ${await recognitionHubHeading.filter({ hasText: customValue.get('recognition') }).textContent()} is visible on recognition hub page`,
    });
    await this.validateRecognitionButtonText(customValue.get('recognition'));
    await this.validateRecognitionButtonInGiveRecognitionModal(customValue);
    await this.validateTheRecognitionFiltersOnHub(customValue.get('recognition'));
  }
  private async validateTheRecognitionFiltersOnHub(recognition: string): Promise<void> {
    const filterDropdown = this.page.locator('select#filterBy option');
    const optionTexts = (await filterDropdown.allTextContents()).map(text => text.trim());
    expect(optionTexts.length).toBeGreaterThanOrEqual(2);
    const nonTargetOptions = optionTexts.slice(0, -2);
    const targetOptions = optionTexts.slice(-2);
    for (const option of targetOptions) {
      expect(option).toContain(recognition);
    }
    for (const option of nonTargetOptions) {
      expect(option, `Did not expect recognition "${recognition}" in option "${option}"`).not.toContain(recognition);
    }
  }

  private async validateRecognitionButtonInGiveRecognitionModal(customValue: any): Promise<void> {
    const recognitionHubButton = this.page.locator('[class*="PageContainerFullscreen_headerContent"] button');
    const recognitionModalHeading = this.page.locator('[class*="Dialog-module__header"] h2');
    const recognitionModalCloseButton = this.page.locator('[class*="Dialog-module__header"] button');
    await recognitionHubButton.click();
    await this.verifier.verifyTheElementIsVisible(recognitionModalHeading, {
      assertionMessage: `Verifying give recognition modal heading with label ${await recognitionModalHeading.filter({ hasText: customValue.get('recognition') }).textContent()} is visible on recognition hub page`,
    });
    const recognitionModal = new GiveRecognitionDialogBox(this.page);
    const text = await recognitionModal.giftingPointsValueLabel.textContent();
    expect(text).toContain(customValue.get('points'));
    await recognitionModalCloseButton.click();
    await this.verifier.verifyTheElementIsNotVisible(recognitionModalHeading, {
      assertionMessage: 'Verifying give recognition modal is closed',
    });
  }

  private async validateRecognitionButtonText(recognition: string): Promise<void> {
    const recognitionHubButton = this.page.locator('[class*="PageContainerFullscreen_headerRightContent"] button');
    await this.verifier.verifyTheElementIsVisible(recognitionHubButton, {
      assertionMessage: `Verifying recognition hub heading with label ${await recognitionHubButton.filter({ hasText: recognition }).textContent()} is visible on recognition hub page`,
    });
  }

  private async validateAcrossPages(steps: Array<() => Promise<void>>): Promise<void> {
    for (const step of steps) {
      await step();
    }
  }

  async validateTheRecognitionValueInApp(customValue: any): Promise<void> {
    await this.validateAcrossPages([
      () => this.validateRecognitionOnHome(customValue),
      () => this.validateRecognitionOnHub(customValue),
      async () => {
        await this.openOneSiteDashboard();
        await this.openRecognitionComposer();
        await this.verifier.verifyTheElementIsVisible(
          this.recognitionCreationButton.filter({ hasText: customValue.get('recognition') }),
          {
            assertionMessage: 'Verifying recognition button with custom value is visible on site dashboard page',
          }
        );
      },
    ]);
  }

  async validateThePointsValueInApp(customValue: any): Promise<void> {
    const points = customValue.get('points');
    const recognition = customValue.get('recognition');
    await this.validateAcrossPages([
      async () => {
        await this.page.goto(PAGE_ENDPOINTS.HOME_PAGE);
        await this.openRecognitionComposer();
        await this.clickOnElement(this.recognitionCreationButton, {
          stepInfo: 'Clicking on recognition creation button on home page',
        });
        await this.verifyPointsLabelText(this.pointsLabel, points);
      },
      async () => {
        const hub = new RecognitionHubPage(this.page);
        await hub.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
        await hub.verifyThePageIsLoaded();
        await expect(this.walletTextLabel('i-gift')).toContainText(points);
        await expect(this.walletTextLabel('i-coinsStacked')).toContainText(points);
        this.recognitionCreationButton.filter({ hasText: recognition });
      },
      async () => {
        await this.openOneSiteDashboard();
        await this.openRecognitionComposer();
        await this.clickOnElement(this.recognitionCreationButton, {
          stepInfo: 'Clicking on recognition creation button on home page',
        });
        await this.verifyPointsLabelText(this.pointsLabel, points);
        this.recognitionCreationButton.filter({ hasText: recognition });
      },
      async () => {
        const rewardStore = new RewardsStore(this.page);
        await rewardStore.loadPage();
        await this.verifyPointsLabelText(
          this.page
            .getByTestId('i-coinsStacked')
            .locator('xpath=ancestor::div[contains(@class,"PageHeader_container")]')
            .locator('p')
            .filter({ hasNotText: /^\d+$/ })
            .first(),
          points
        );
        const giftCard = this.page.locator('button[class*="UI_listItem"]').first();
        await this.verifyPointsLabelText(giftCard.locator('div>p').last().filter({ hasNotText: /^\d+$/ }), points);
        await rewardStore.openGiftCardModal(2);
        const giftCardPointLabel = this.page.locator(`[class*="RedemptionDialog_customPanel"]`);
        await this.verifier.verifyTheElementIsVisible(
          giftCardPointLabel.locator('p[class*="bold"]').filter({ hasNotText: /^\d+$/ }),
          { timeout: TIMEOUTS.SHORT }
        );
        expect(
          await giftCardPointLabel.locator('p[class*="bold"]').filter({ hasNotText: /^\d+$/ }).textContent()
        ).toContain(points);
      },
    ]);
  }

  async validateTheRewardStoreValueInApp(customValue: any): Promise<void> {
    const rewardStoreHeading = customValue.get('rewardsStore');
    const points = customValue.get('points');
    const rewardStore = new RewardsStore(this.page);
    await rewardStore.loadPage();
    await this.validateAcrossPages([
      async () => {
        await this.verifyPointsLabelText(
          this.page
            .getByTestId('i-coinsStacked')
            .locator('xpath=ancestor::div[contains(@class,"PageHeader_container")]')
            .locator('h1')
            .filter({ hasNotText: /^\d+$/ })
            .first(),
          rewardStoreHeading
        );
      },
      async () => {
        await this.verifyPointsLabelText(
          this.page
            .getByTestId('i-coinsStacked')
            .locator('xpath=ancestor::div[contains(@class,"PageHeader_container")]')
            .locator('p')
            .filter({ hasNotText: /^\d+$/ })
            .first(),
          points
        );
      },
      async () => {
        const rewardStore = new RewardsStore(this.page);
        await rewardStore.searchForGiftCard('Amazon');
        const giftCard = this.page.locator('button[class*="UI_listItem"]').first();
        await this.verifyPointsLabelText(giftCard.locator('div>p').last().filter({ hasNotText: /^\d+$/ }), points);
        await rewardStore.openGiftCardModal(0);
        const giftCardPointLabel = this.page.locator(`[class*="RedemptionDialog_customPanel"]`);
        await this.verifier.verifyTheElementIsVisible(
          giftCardPointLabel.locator('p[class*="bold"]').filter({ hasNotText: /^\d+$/ }),
          { timeout: TIMEOUTS.SHORT }
        );
        expect(
          await giftCardPointLabel.locator('p[class*="bold"]').filter({ hasNotText: /^\d+$/ }).textContent()
        ).toContain(points);

        //Input place holder validation
        const giftCardPointInputPlaceHolder = this.page.locator(`[id="reward_points"] +span`);
        await this.verifier.verifyTheElementIsVisible(giftCardPointInputPlaceHolder.filter({ hasNotText: /^\d+$/ }), {
          timeout: TIMEOUTS.SHORT,
        });
        expect(await giftCardPointInputPlaceHolder.filter({ hasNotText: /^\d+$/ }).textContent()).toContain(points);
        // Max points label
        const giftCardMaxPointLabel = this.page.locator(`[for="reward_variableRewardAmountTypeMAX"] div`);
        await this.verifier.verifyTheElementIsVisible(giftCardMaxPointLabel.filter({ hasNotText: /^\d+$/ }), {
          timeout: TIMEOUTS.SHORT,
        });
        expect(await giftCardMaxPointLabel.filter({ hasNotText: /^\d+$/ }).textContent()).toContain(points);

        // In Checkout page
        const checkoutButton = this.page.locator('[class*="Dialog-module__footer"] button');
        const rewardsDialogBox = new RewardsDialogBox(this.page);
        await this.clickOnElement(checkoutButton);
        await expect(rewardsDialogBox.confirmOrderModalRedeemValue).toContainText(points);
        await this.clickOnElement(rewardsDialogBox.closeButton);
      },

      async () => {
        const rewardStore = new RewardsStore(this.page);
        await rewardStore.searchForGiftCard('Callaway');
        const giftCard = this.page.locator('button[class*="UI_listItem"]').first();
        await this.verifyPointsLabelText(giftCard.locator('div>p').last().filter({ hasNotText: /^\d+$/ }), points);
        await rewardStore.openGiftCardModal(0);
        const giftCardPointLabel = this.page.locator(`[class*="RedemptionDialog_customPanel"]`);
        await this.verifier.verifyTheElementIsVisible(
          giftCardPointLabel.locator('p[class*="bold"]').filter({ hasNotText: /^\d+$/ }),
          { timeout: TIMEOUTS.SHORT }
        );
        expect(
          await giftCardPointLabel.locator('p[class*="bold"]').filter({ hasNotText: /^\d+$/ }).textContent()
        ).toContain(points);

        const selectYourRewardValueDropdownValues =
          await rewardStore.rewardsDialogBox.rewardValueOptions.allTextContents();
        for (const val of selectYourRewardValueDropdownValues) {
          expect(val, `Expected dropdown value "${val}" to contain points "${points}"`).toContain(points);
        }
        const checkoutButton = this.page.locator('[class*="Dialog-module__footer"] button');
        await this.clickOnElement(checkoutButton);
        await expect(rewardStore.rewardsDialogBox.confirmOrderModalRedeemValue).toContainText(points);
        await this.clickOnElement(rewardStore.rewardsDialogBox.closeButton);
      },
    ]);
  }

  private parseLanguageCandidates(languageLabel: string): string[] {
    const parts = languageLabel
      .split(' - ')
      .map(s => s.trim())
      .filter(Boolean);
    return Array.from(new Set([...parts.reverse(), ...parts, languageLabel].filter(Boolean)));
  }

  private resolveTranslationByLanguageLabel(
    translations: Map<string, string>,
    languageLabel: string
  ): string | undefined {
    const direct = translations.get(languageLabel);
    if (direct) return direct;

    const prefix = languageLabel.split(' - ')[0]?.trim();
    if (prefix) {
      for (const [key, value] of translations.entries()) {
        if (key.startsWith(prefix)) return value;
      }
    }
    return undefined;
  }

  private async captureTranslationsForCard(cardType: 'recognition' | 'points'): Promise<{
    defaultLabel: string;
    translations: Map<string, string>;
  }> {
    const defaultLabel =
      (await this.getTheNewCustomizedValue(cardType))?.trim() || (cardType === 'points' ? 'Points' : 'Recognition');
    await this.clickEditButtonByCardType(cardType);
    const translations = await this.getTheDefaultTranslationValuesByLanguages();
    await this.clickDialogCloseButton();
    return { defaultLabel, translations };
  }

  /**
   * For Reward Store validations we also need translated values for Recognition + Points on some pages.
   * This helper captures those translations up-front (before any language switching),
   * resolves languageId from the language label, switches language, validates UI, and resets to English(US).
   */
  async validateRewardStoreManualTranslationsAcrossLanguages(
    rewardStoreTranslationsByLanguage: Map<string, string>
  ): Promise<void> {
    const languageApi = new LanguageApiService();
    await this.clickDialogCloseButton().catch(() => {});

    const { defaultLabel: defaultPointsLabel, translations: pointsTranslationsByLanguage } =
      await this.captureTranslationsForCard('points');
    const { defaultLabel: defaultRecognitionLabel, translations: recognitionTranslationsByLanguage } =
      await this.captureTranslationsForCard('recognition');
    for (const [languageLabel, translatedRewardStoreValue] of rewardStoreTranslationsByLanguage.entries()) {
      const candidates = this.parseLanguageCandidates(languageLabel);
      let languageId: number | undefined;
      for (const candidate of candidates) {
        languageId = await languageApi.getLanguageIdByName(this.page, candidate);
        if (languageId !== undefined) break;
      }
      if (languageId === undefined) {
        throw new Error(`Could not resolve languageId for "${languageLabel}". Tried: ${candidates.join(', ')}`);
      }

      const expectedMap = new Map<string, string>();
      expectedMap.set('rewardsStore', translatedRewardStoreValue);
      expectedMap.set(
        'points',
        this.resolveTranslationByLanguageLabel(pointsTranslationsByLanguage, languageLabel) ?? defaultPointsLabel
      );
      expectedMap.set(
        'recognition',
        this.resolveTranslationByLanguageLabel(recognitionTranslationsByLanguage, languageLabel) ??
          defaultRecognitionLabel
      );
      await languageApi.languageChangeFunction(this.page, { supportedLanguageId: languageId });
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.validateTheRewardStoreValueInApp(expectedMap);
    }
  }

  /**
   * Changes user language (server-side), validates Recognition label across languages, then resets to default language.
   * This mirrors the RC-7125 approach (no basic-app-config mocking).
   */
  async validateRecognitionManualTranslationsAcrossLanguages(
    recognitionTranslationsByLanguage: Map<string, string>
  ): Promise<void> {
    const languageApi = new LanguageApiService();
    await this.clickDialogCloseButton().catch(() => {});

    const { defaultLabel: defaultPointsLabel, translations: pointsTranslationsByLanguage } =
      await this.captureTranslationsForCard('points');

    for (const [languageLabel, translatedRecognitionValue] of recognitionTranslationsByLanguage.entries()) {
      const candidates = this.parseLanguageCandidates(languageLabel);
      let languageId: number | undefined;
      for (const candidate of candidates) {
        languageId = await languageApi.getLanguageIdByName(this.page, candidate);
        if (languageId !== undefined) break;
      }
      if (languageId === undefined) {
        throw new Error(`Could not resolve languageId for "${languageLabel}". Tried: ${candidates.join(', ')}`);
      }

      const expectedMap = new Map<string, string>();
      expectedMap.set('recognition', translatedRecognitionValue);
      expectedMap.set(
        'points',
        this.resolveTranslationByLanguageLabel(pointsTranslationsByLanguage, languageLabel) ?? defaultPointsLabel
      );
      await languageApi.languageChangeFunction(this.page, { supportedLanguageId: languageId });
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.validateTheRecognitionValueInApp(expectedMap);
    }
  }

  /**
   * Changes user language (server-side), validates Points label across languages, then resets to default language.
   * Keeps Recognition label populated to avoid any locator filters receiving undefined.
   */
  async validatePointsManualTranslationsAcrossLanguages(
    pointsTranslationsByLanguage: Map<string, string>
  ): Promise<void> {
    const languageApi = new LanguageApiService();
    // If modal is open (caller just read translations), close it so we can safely navigate.
    await this.clickDialogCloseButton().catch(() => {});

    const { defaultLabel: defaultRecognitionLabel, translations: recognitionTranslationsByLanguage } =
      await this.captureTranslationsForCard('recognition');

    for (const [languageLabel, translatedPointsValue] of pointsTranslationsByLanguage.entries()) {
      const candidates = this.parseLanguageCandidates(languageLabel);
      let languageId: number | undefined;
      for (const candidate of candidates) {
        languageId = await languageApi.getLanguageIdByName(this.page, candidate);
        if (languageId !== undefined) break;
      }
      if (languageId === undefined) {
        throw new Error(`Could not resolve languageId for "${languageLabel}". Tried: ${candidates.join(', ')}`);
      }

      await languageApi.languageChangeFunction(this.page, { supportedLanguageId: languageId });
      await this.page.reload({ waitUntil: 'domcontentloaded' });

      const expectedMap = new Map<string, string>();
      expectedMap.set(
        'recognition',
        this.resolveTranslationByLanguageLabel(recognitionTranslationsByLanguage, languageLabel) ??
          defaultRecognitionLabel
      );
      expectedMap.set('points', translatedPointsValue);
      await this.validateThePointsValueInApp(expectedMap);
    }
  }

  /**
   * Changes user language (server-side), validates Recognition label across languages, then resets to default language.
   * This mirrors the RC-7125 approach (no basic-app-config mocking).
   */
  async validateRecognitionAndPointsLabelInDeleteRecognitionModal(
    recognitionTranslationsByLanguage: Map<string, string>
  ): Promise<void> {
    const languageApi = new LanguageApiService();
    await this.clickDialogCloseButton().catch(() => {});
    const { defaultLabel: defaultPointsLabel, translations: pointsTranslationsByLanguage } =
      await this.captureTranslationsForCard('points');

    for (const [languageLabel, translatedRecognitionValue] of recognitionTranslationsByLanguage.entries()) {
      const candidates = this.parseLanguageCandidates(languageLabel);
      let languageId: number | undefined;
      for (const candidate of candidates) {
        languageId = await languageApi.getLanguageIdByName(this.page, candidate);
        if (languageId !== undefined) break;
      }
      if (languageId === undefined) {
        throw new Error(`Could not resolve languageId for "${languageLabel}". Tried: ${candidates.join(', ')}`);
      }

      const expectedMap = new Map<string, string>();
      expectedMap.set('recognition', translatedRecognitionValue);
      expectedMap.set(
        'points',
        this.resolveTranslationByLanguageLabel(pointsTranslationsByLanguage, languageLabel) ?? defaultPointsLabel
      );
      await languageApi.languageChangeFunction(this.page, { supportedLanguageId: languageId });
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(this.page);
      const recognitionHub = new RecognitionHubPage(this.page);
      await manageRewardsOverviewPage.loadPage();
      await expect(manageRewardsOverviewPage.activityPanelTableViewRecognitionItems.last()).toBeVisible();
      const rewardData = await manageRewardsOverviewPage.openTheRecognitionPostCreatedBefore24Hrs(
        getRewardTenantConfigFromCache().appManagerName
      );
      await manageRewardsOverviewPage.page.goto(rewardData.resultAny?.URL!);
      await recognitionHub.clickOnTheFirstPostMoreOption(2);
      const expectedRecognition = expectedMap.get('recognition') ?? '';
      const expectedPoints = expectedMap.get('points') ?? '';
      await expect(recognitionHub.deleteRecognitionDialogBoxTitle).toContainText(expectedRecognition.toLowerCase());
      await expect(recognitionHub.deleteRecognitionWithRevokePoints).not.toBeVisible();
      await expect(recognitionHub.deleteRecognitionDialogBoxDescriptionText.first()).toContainText(
        expectedRecognition.toLocaleLowerCase()
      );
      await expect(recognitionHub.deleteRecognitionDialogBoxDescriptionText.last()).toContainText(
        // expectedRecognition.toLocaleLowerCase()
        expectedRecognition.toLowerCase()
      );
      await expect(recognitionHub.deleteRecognitionDialogBoxDescriptionText.last()).toContainText(expectedPoints);
    }
  }

  /**
   * Changes user language (server-side), validates Recognition label across languages, then resets to default language.
   * This mirrors the RC-7125 approach (no basic-app-config mocking).
   */
  async validateRecognitionAndPointsLabelInDeleteRecognitionModalWithin24hrs(
    recognitionPostUrl: string,
    recognitionTranslationsByLanguage: Map<string, string>
  ): Promise<void> {
    const languageApi = new LanguageApiService();
    const recognitionHub = new RecognitionHubPage(this.page);
    await this.clickDialogCloseButton().catch(() => {});
    const { defaultLabel: defaultPointsLabel, translations: pointsTranslationsByLanguage } =
      await this.captureTranslationsForCard('points');

    for (const [languageLabel, translatedRecognitionValue] of recognitionTranslationsByLanguage.entries()) {
      const candidates = this.parseLanguageCandidates(languageLabel);
      let languageId: number | undefined;
      for (const candidate of candidates) {
        languageId = await languageApi.getLanguageIdByName(this.page, candidate);
        if (languageId !== undefined) break;
      }
      if (languageId === undefined) {
        throw new Error(`Could not resolve languageId for "${languageLabel}". Tried: ${candidates.join(', ')}`);
      }

      const expectedMap = new Map<string, string>();
      expectedMap.set('recognition', translatedRecognitionValue);
      expectedMap.set(
        'points',
        this.resolveTranslationByLanguageLabel(pointsTranslationsByLanguage, languageLabel) ?? defaultPointsLabel
      );
      await languageApi.languageChangeFunction(this.page, { supportedLanguageId: languageId });
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      // Validate the Delete recognition and revoke points is enabled in the dialog box
      await recognitionHub.page.goto(`/recognition/recognition/${recognitionPostUrl}`);
      await recognitionHub.verifyThePageIsLoaded();
      await recognitionHub.clickOnTheFirstPostMoreOption(2);
      const expectedRecognition = expectedMap.get('recognition') ?? '';
      const expectedPoints = expectedMap.get('points') ?? '';
      await recognitionHub.deleteRecognitionDialogBoxContainer.waitFor({ state: 'visible' });
      await expect(recognitionHub.deleteRecognitionDialogBoxTitle).toContainText(expectedRecognition.toLowerCase());
      await expect(recognitionHub.deleteRecognitionDialogBoxDescriptionText.first()).toContainText(
        expectedRecognition.toLocaleLowerCase()
      );
      await expect(recognitionHub.deleteRecognitionDialogBoxDescriptionText.nth(1)).toContainText(
        // expectedRecognition.toLocaleLowerCase()
        expectedRecognition.toLowerCase()
      );
      await expect(recognitionHub.deleteRecognitionDialogBoxDescriptionText.nth(1)).toContainText(expectedPoints);
      // Delete recognition with revoke points validation;
      await expect(recognitionHub.deleteRecognitionDialogBoxDescriptionText.nth(3)).toContainText(
        expectedRecognition.toLowerCase()
      );
      await expect(recognitionHub.deleteRecognitionDialogBoxDescriptionText.nth(3)).toContainText(expectedPoints);
      await expect(recognitionHub.deleteRecognitionDialogBoxDescriptionText.nth(4)).toContainText(
        expectedRecognition.toLocaleLowerCase()
      );

      //Delete recognition note validation
      await expect(recognitionHub.deleteRecognitionNote.nth(0)).toContainText(expectedPoints);
      await expect(recognitionHub.deleteRecognitionNote.nth(1)).toContainText(expectedPoints);
      await expect(recognitionHub.deleteRecognitionNote.nth(2)).toContainText(expectedRecognition.toLocaleLowerCase());
      await expect(recognitionHub.deleteRecognitionNote.nth(2)).toContainText(expectedPoints);
    }
  }
}
