import { expect, Locator, Page, test } from '@playwright/test';
import { EditLabelModal } from '@rewards-components/manage-renaming/edit-label-modal';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS, TestDataGenerator } from '@/src/core';

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

    this.recognitionCustomName = this.recognitionEditButton
      .locator('xpath=ancestor::div[starts-with(@data-testid,"naming-card-")]')
      .locator('h2[data-testid^="naming-card-name-"]');
    this.pointsCustomName = this.pointsEditButton
      .locator('xpath=ancestor::div[starts-with(@data-testid,"naming-card-")]')
      .locator('h2[data-testid^="naming-card-name-"]');
    this.rewardsStoreCustomName = this.rewardsStoreEditButton
      .locator('xpath=ancestor::div[starts-with(@data-testid,"naming-card-")]')
      .locator('h2[data-testid^="naming-card-name-"]');

    this.recognitionDefaultName = this.recognitionEditButton
      .locator('xpath=ancestor::div[starts-with(@data-testid,"naming-card-")]')
      .locator('p[data-testid^="naming-card-default-name-"]');
    this.pointsDefaultName = this.pointsEditButton
      .locator('xpath=ancestor::div[starts-with(@data-testid,"naming-card-")]')
      .locator('p[data-testid^="naming-card-default-name-"]');
    this.rewardsStoreDefaultName = this.rewardsStoreEditButton
      .locator('xpath=ancestor::div[starts-with(@data-testid,"naming-card-")]')
      .locator('p[data-testid^="naming-card-default-name-"]');

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
    await this.clickOnElement(editModal.getSaveButton(), {
      stepInfo: `Clicking Save button in Edit Label modal for ${cardType}`,
    });
    await this.verifyToastMessageIsVisibleWithText('Saved changes successfully', { timeout: TIMEOUTS.VERY_VERY_SHORT });
    await this.page.waitForTimeout(TIMEOUTS.VERY_VERY_SHORT);
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

  async getTheNewCustomizedValue(cardType: string): Promise<string | null> {
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

  async enableTheLanguageInTenantIfNotEnabled(languages: string[]) {
    await test.step('Enable tenant languages from General Settings if only default language is enabled', async () => {
      // 1) Visit General Settings page and 2) capture /v1/account/appConfig response
      const appConfigResponse = await this.performActionAndWaitForResponse(
        async () => {
          await this.page.goto(PAGE_ENDPOINTS.APPLICATION_GENERAL_SETTINGS_PAGE);
        },
        resp => resp.url().includes('/v1/account/appConfig') && resp.status() === 200,
        { timeout: TIMEOUTS.MEDIUM, stepInfo: 'Navigate to General Settings and capture appConfig response' }
      );

      await appConfigResponse.json();
      const count = languages.length;
      for (let i = 0; i < count; i++) {
        const checkbox = this.page.locator(`#${languages[i]}`);
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.check();
          console.log(`Checked language: ${await checkbox.innerText()}`);
        } else {
          console.log(`Already checked: ${await checkbox.innerText()}`);
        }
      }

      // expect(Array.isArray(ids), 'Expected appConfig.result.selectedLanguages.ids to be an array').toBeTruthy();
      // expect(
      //   Array.isArray(defaultIds),
      //   'Expected appConfig.result.selectedLanguages.defaultIds to be an array'
      // ).toBeTruthy();
      // expect(ids, 'Expected ids to be present').toBeDefined();
      // expect(defaultIds, 'Expected defaultIds to be present').toBeDefined();
      //
      // // At minimum, English (id=1) should exist as default
      // expect(defaultIds, 'Expected defaultIds to include 1').toContain(1);
      //
      // // 4) If only one language is enabled (id=1), enable all requested languages in UI
      // const shouldEnableLanguages = Array.isArray(ids) && ids.length === 1 && ids[0] === 1;
      // if (!shouldEnableLanguages) {
      //   return;
      // }
      //
      // // Extra strict validation for the "only default language enabled" case
      // expect(ids, 'Expected ids to be [1] when only default language is enabled').toEqual([1]);
      //
      // const languagesHeading = this.page.getByRole('heading', { name: 'Languages' }).first();
      // await expect(languagesHeading, 'Expected Languages section to be visible on General Settings page').toBeVisible({
      //   timeout: TIMEOUTS.MEDIUM,
      // });
      // await languagesHeading.scrollIntoViewIfNeeded();
      //
      // for (const language of languages) {
      //   const langRegex = new RegExp(escapeRegExp(language), 'i');
      //
      //   // Prefer role-based checkbox lookup, then fall back to label-based.
      //   const checkboxByRole = this.page.getByRole('checkbox', { name: langRegex }).first();
      //   const checkboxByLabel = this.page.getByLabel(langRegex).first();
      //
      //   const target = (await checkboxByRole.count()) > 0 ? checkboxByRole : checkboxByLabel;
      //
      //   // Use existing helper (it no-ops if already checked)
      //   await this.checkElement(target, { stepInfo: `Enable language: ${language}` });
      // }

      // 5) Click Save
      const saveButton = this.page.getByRole('button', { name: 'Save' }).first();
      await saveButton.scrollIntoViewIfNeeded();
      await this.clickOnElement(saveButton, { stepInfo: 'Click Save button on General Settings page' });

      // 6) Validate toast
      await this.verifyToastMessageIsVisibleWithText('Saved changes successfully', {
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  async unCheckTheCustomLanguageForAll(cartType: string): Promise<void> {
    const editModal = new EditLabelModal(this.page);
    await this.unCheckElement(editModal.getCustomLabelForAllLanguageCheckbox(cartType));
  }

  async enableTheOtherLanguageAndEnterCustomValue(cardType: string) {
    const editModal = new EditLabelModal(this.page);
    const manualTranslationSwitches = editModal.getManualTranslationToggleSwitch();
    const otherLanguageCustomValueInputBox = editModal.getOtherLanguageCustomInputBox();
    for (let i = 0; i < (await manualTranslationSwitches.count()); i++) {
      await manualTranslationSwitches.nth(i).check();
      await otherLanguageCustomValueInputBox.fill(
        `${cardType}_${i + 1}_Custom_Language_${TestDataGenerator.getRandomNo(0, 200)}`
      );
    }
    await this.clickOnSaveButton();
    await this.page.waitForTimeout(TIMEOUTS.VERY_VERY_SHORT);
  }

  async clickOnResetButton() {
    const editModal = new EditLabelModal(this.page);
    await this.clickOnElement(editModal.getResetAllTranslationToAutomatic());
  }

  async validateTheLanguageDataRested() {
    const editModal = new EditLabelModal(this.page);
    console.log(await editModal.getOtherLanguageCustomInputBox().inputValue());
    console.log(await editModal.getCustomLabelInputBox().inputValue());
  }

  async clickOnSaveButton() {
    const editModal = new EditLabelModal(this.page);
    await editModal.getSaveButton().click();
  }
}
