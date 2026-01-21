import { expect, Locator, Page, test } from '@playwright/test';
import { RecognitionHubPage } from '@recognition/ui/pages';
import { EditLabelModal } from '@rewards-components/manage-renaming/edit-label-modal';
import { RewardsStore } from '@rewards-pages/reward-store/reward-store';

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
    console.log(`Harness flag ${flagName} value:`, flag.value.toLowerCase());
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
    const customName = cardType + '_' + TestDataGenerator.getRandomNo(0, 10000);
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
      await expect(
        editModal.getOtherLanguageCustomInputBox(i),
        'expecting other language input to have a non-empty value'
      ).not.toHaveValue('', { timeout: TIMEOUTS.VERY_SHORT });
      await expect(
        editModal.getOtherLanguageCustomInputBox(i),
        'expecting other language input to have a non-empty value'
      ).not.toHaveValue('Loading...', { timeout: TIMEOUTS.VERY_SHORT });
      stringArray.push(await editModal.getOtherLanguageCustomInputBox(i).inputValue());
    }
    return stringArray;
  }

  async validateTheLanguageDataRested(defaultOtherLanguageTranslationValue: string[]) {
    const editModal = new EditLabelModal(this.page);
    const manualTranslationSwitches = editModal.getManualTranslationToggleSwitch();
    for (let i = 0; i < (await manualTranslationSwitches.count()); i++) {
      await expect(
        editModal.getOtherLanguageCustomInputBox(i),
        'expecting other language input to have a non-empty value'
      ).not.toHaveValue('', { timeout: TIMEOUTS.VERY_SHORT });
      await expect(
        editModal.getOtherLanguageCustomInputBox(i),
        'expecting other language input to have a non-empty value'
      ).not.toHaveValue('Loading...', { timeout: TIMEOUTS.VERY_SHORT });
      expect(defaultOtherLanguageTranslationValue).toContain(
        await editModal.getOtherLanguageCustomInputBox(i).inputValue()
      );
    }
  }

  async clickOnSaveButton() {
    const editModal = new EditLabelModal(this.page);
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
        const panel = this.page
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
    });
    await this.postFormButton.click();
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
    await locator.scrollIntoViewIfNeeded();
    await this.verifier.verifyTheElementIsVisible(locator, { timeout: TIMEOUTS.SHORT });
    expect(await locator.textContent()).toContain(expected);
  }

  private async validateRecognitionOnHome(recognition: string): Promise<void> {
    await this.page.goto(PAGE_ENDPOINTS.HOME_PAGE);
    await this.verifier.verifyTheElementIsVisible(
      this.page.locator(`[data-testid="main-nav-item"] span:has-text("${recognition}")`)
    );
    await this.openRecognitionComposer();
    await this.verifier.verifyTheElementIsVisible(this.recognitionCreationButton.filter({ hasText: recognition }));
  }

  private async validateRecognitionOnHub(recognition: string): Promise<void> {
    const hub = new RecognitionHubPage(this.page);
    await hub.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
    await hub.verifyThePageIsLoaded();

    await this.verifier.verifyTheElementIsVisible(
      this.page.locator('[class*="PageContainerFullscreen_header"] h1').filter({ hasText: recognition })
    );
  }

  private async validateAcrossPages(steps: Array<() => Promise<void>>): Promise<void> {
    for (const step of steps) {
      await step();
    }
  }

  async validateTheRecognitionValueInApp(customValue: any): Promise<void> {
    const recognition = customValue.get('recognition');
    await this.validateAcrossPages([
      () => this.validateRecognitionOnHome(recognition),
      () => this.validateRecognitionOnHub(recognition),
      async () => {
        await this.openOneSiteDashboard();
        await this.openRecognitionComposer();
        await this.verifier.verifyTheElementIsVisible(this.recognitionCreationButton.filter({ hasText: recognition }));
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
        await this.clickOnElement(this.recognitionCreationButton);
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
        await this.clickOnElement(this.recognitionCreationButton);
        await this.verifyPointsLabelText(this.pointsLabel, points);
        this.recognitionCreationButton.filter({ hasText: recognition });
      },
    ]);
  }

  async validateTheRewardStoreValueInApp(customValue: any): Promise<void> {
    const rewardStoreHeading = customValue.get('rewardsStore');
    const points = customValue.get('points');
    const rewardStore = new RewardsStore(this.page);
    await this.validateAcrossPages([
      async () => {
        await rewardStore.visit();
        await rewardStore.verifyThePageIsLoaded();
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
        ).toContain(customValue.get('points'));
      },
    ]);
  }
}
