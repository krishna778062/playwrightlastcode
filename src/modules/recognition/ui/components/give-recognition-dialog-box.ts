import { expect, Locator, Page, test } from '@playwright/test';
import { DialogBox } from '@rewards-components/common/dialog-box';

import { TIMEOUTS } from '@/src/core/constants/timeouts';

export class GiveRecognitionDialogBox extends DialogBox {
  readonly dialog: Locator;
  readonly dialogTitle: Locator;
  readonly dialogDescription: Locator;
  readonly dialogCancelButton: Locator;
  readonly dialogConfirmButton: Locator;
  readonly dialogCloseButton: Locator;
  readonly recipientInput: Locator;

  // Additional properties for recognition functionality
  readonly profilePicture: Locator;
  readonly peerRecognitionTab: Locator;
  readonly spotAwardTab: Locator;
  readonly recognitionRecipientsInput: Locator;
  readonly selectAwardInput: Locator;
  readonly selectPeerRecognitionInput: Locator;
  readonly selectOptions: Locator;
  readonly suggesterContainer: Locator;
  readonly recipientsInput: Locator;
  readonly descriptionTextArea: Locator;
  readonly companyValuesInput: Locator;
  readonly expertiseInput: Locator;
  readonly selectedAwardInRecognition: Locator;
  readonly recognizeButton: Locator;
  readonly doneButton: Locator;
  readonly loadingIndicator: Locator;
  readonly companyValues: Locator;
  readonly clearButton: Locator;
  readonly awardDisabledWarning: Locator;
  readonly shareIcon: Locator;
  readonly recipientToGiveAwardInput: Locator;
  readonly messageInput: Locator;
  readonly shareModal: Locator;
  readonly shareToFeedCheckBox: Locator;
  readonly shareToSlackCheckBox: Locator;
  readonly homeFeedRadioButton: Locator;
  readonly siteFeedRadioButton: Locator;
  readonly selecteSiteInput: Locator;
  readonly shareButton: Locator;
  readonly shareButtonOnShareModal: Locator;
  readonly menuLoadingContainer: Locator;
  readonly shareModalListbox: Locator;
  readonly shareModalOption: Locator;
  constructor(page: Page) {
    super(page);
    this.dialog = page.locator('[role="dialog"][data-state="open"]');
    this.dialogTitle = this.dialog.locator('h2 span');
    this.dialogDescription = this.dialog.locator('[data-testid="give-recognition-dialog-description"]');
    this.dialogCancelButton = this.dialog.locator('button[aria-label="Close"]');
    this.dialogConfirmButton = this.dialog.locator('button[data-testid="give-recognition-confirm"]');
    this.dialogCloseButton = this.dialog.locator('button[aria-label="Close"]');
    this.recipientInput = this.dialog.locator('input[data-testid="recipient-input"]');

    // Additional locators for recognition functionality
    this.profilePicture = this.container.locator('[src*="data:image"]');
    this.peerRecognitionTab = this.container.getByRole('tab', { name: 'Peer recognition' });
    this.spotAwardTab = this.container.getByRole('tab', { name: 'Spot award' });
    this.recognitionRecipientsInput = this.container.locator('[aria-label="Who do you want to recognize?"]');
    this.selectAwardInput = this.container.getByTestId('field-Select award').locator('input[type="text"]');
    this.selectPeerRecognitionInput = this.container.locator('input[aria-label="Select an award for the recognition"]');
    this.selectedAwardInRecognition = this.container.locator('div[class*="AwardSelect_singleValueWrapper"] p');
    this.suggesterContainer = this.container.getByRole('listbox');
    this.selectOptions = this.container.getByRole('menuitem');
    this.recipientsInput = this.container.getByRole('combobox', { name: 'Select a spot award to recognize someone' });
    this.descriptionTextArea = this.container.locator('[class*="tiptap ProseMirror"]');
    this.companyValues = this.container.getByTestId('field-Company values');
    this.companyValuesInput = this.container.getByTestId('field-Company values').locator('input[type="text"]');
    this.expertiseInput = this.container.getByTestId('field-Expertise').locator('input[type="text"]');
    this.recognizeButton = this.container.getByRole('button', { name: 'Recognize' });
    this.doneButton = this.container.getByRole('button', { name: 'Done' });
    this.loadingIndicator = page.locator('div[class*="LoadingIndicator-module__wrapper"]');
    this.clearButton = this.container.getByRole('button', { name: 'Clear' });
    this.awardDisabledWarning = this.container.locator('[class*="SpotAwardGuidanceAndWarningPanel"]');
    this.shareIcon = page.locator('i[data-testid="i-share"]');
    this.recipientToGiveAwardInput = this.container.getByRole('combobox', {
      name: 'To whom do you want to give this spot award?',
    });
    this.messageInput = this.container.getByTestId('tiptap-editor-v2').getByRole('paragraph');
    this.shareModal = this.page.getByRole('dialog').filter({ hasText: 'Share recognition' });
    this.shareToFeedCheckBox = this.shareModal.getByRole('checkbox', { name: 'Share to feed' });
    this.shareToSlackCheckBox = this.shareModal.getByRole('checkbox', { name: 'Share to Slack' });
    this.homeFeedRadioButton = this.shareModal.getByRole('radio', { name: 'Post in home feed' });
    this.siteFeedRadioButton = this.shareModal.getByRole('radio', { name: 'Post in site feed' });
    this.selecteSiteInput = this.shareModal.getByTestId('field-Select site').locator('input[type="text"]');
    this.shareButton = this.shareModal.getByRole('button', { name: 'Share' });
    this.shareButtonOnShareModal = this.shareModal.getByRole('button', { name: 'Share' });
    this.menuLoadingContainer = this.container.locator('[class*="LoadingIndicator"]');
    this.shareModalListbox = this.shareModal.getByRole('listbox');
    this.shareModalOption = this.shareModalListbox.getByRole('menuitem').first();
  }

  /**
   * This method returns a locator for the suggested item.
   * @param identifier - The identifier can be a string or a number.
   * @returns {Locator} - The locator for the option.
   */
  getOption(identifier: string | number): Locator {
    if (typeof identifier === 'string') {
      return this.suggesterContainer.getByText(identifier);
    } else {
      return this.suggesterContainer.locator('[role="option"]').nth(identifier);
    }
  }

  /**
   * This method recognizes a spot award.
   * @param award Award name or index
   * @param recipient Recipient name or index
   * @param message Message to be sent with the award
   */
  async recognizeSpotAward(
    award: string | number = 0,
    recipient: string | number = 0,
    message: string = 'Test Message'
  ): Promise<boolean> {
    await this.spotAwardTab.click();
    await this.recognitionRecipientsInput.click();
    if (typeof recipient === 'string') {
      await this.recognitionRecipientsInput.fill(recipient);
    }
    await this.suggesterContainer.waitFor({ state: 'visible' });
    await this.getOption(recipient).click();
    await this.selectAwardInput.click();
    await this.suggesterContainer.waitFor({ state: 'visible' });
    await this.getOption(award).click();
    await this.descriptionTextArea.fill(message);
    await this.recognizeButton.click();
    return true;
  }

  /**
   * Select the user for recognition
   */
  async selectTheUserForRecognition(userName: string | number): Promise<void> {
    await this.recognitionRecipientsInput.click();
    await this.page.waitForTimeout(500);
    await this.recognitionRecipientsInput.waitFor({ state: 'visible' });
    await this.recognitionRecipientsInput.scrollIntoViewIfNeeded();
    if (typeof userName === 'string') {
      await this.recognitionRecipientsInput.fill(userName);
      await this.suggesterContainer.waitFor({ state: 'visible' });
      await this.getOption(userName).click();
    } else {
      const requiredFieldWarning = this.page.getByText('Please fill out this field');
      const warningVisible = await requiredFieldWarning
        .waitFor({ state: 'visible', timeout: 500 })
        .then(() => true)
        .catch(() => false);
      if (warningVisible) {
        await this.recognitionRecipientsInput.click();
      }
      await this.suggesterContainer.waitFor({ state: 'visible' });
      await this.getOption(userName).first().click();
    }
  }

  /**
   * Select the peer recognition award for recognition
   */
  async selectThePeerRecognitionAwardForRecognition(awardName: string | number): Promise<string> {
    if (typeof awardName === 'string') {
      await this.selectPeerRecognitionInput.click();
      await this.recognitionRecipientsInput.fill(awardName);
      await this.suggesterContainer.waitFor({ state: 'visible' });
      await this.getOption(awardName).click();
    } else {
      await this.selectPeerRecognitionInput.click();
      await this.suggesterContainer.waitFor({ state: 'visible' });
      await this.getOption(awardName).first().click();
    }
    const text = await this.selectedAwardInRecognition.textContent();
    return text || '';
  }

  /**
   * Enter the recognition message
   */
  async enterTheRecognitionMessage(message: string): Promise<string | void> {
    await this.descriptionTextArea.fill(message);
    return message;
  }
  /**
   * Verify company value is not present in the field
   * @param companyValue - Company value to check
   */
  async verifyCompanyValueNotPresent(companyValue: string): Promise<void> {
    await test.step(`Verify company value "${companyValue}" is not present`, async () => {
      const textContent = await this.companyValues.textContent();
      expect(textContent).not.toContain(companyValue);
    });
  }

  /**
   * Select award and verify company value appears
   * @param awardName - Name of the award to select
   * @param companyValue - Expected company value
   */
  async selectAwardAndVerifyCompanyValue(awardName: string, companyValue: string): Promise<void> {
    await test.step('Select award and verify company value', async () => {
      await this.descriptionTextArea.waitFor({ state: 'visible' });
      await this.selectAwardInput.fill(awardName);
      await this.page.waitForTimeout(2000);
      await this.selectOptions.first().click();
      await this.verifyCompanyValuePresent(companyValue);
    });
  }
  /**
   * Verify company value is present in the field
   * @param companyValue - Company value to check
   */
  async verifyCompanyValuePresent(companyValue: string): Promise<void> {
    await test.step(`Verify company value "${companyValue}" is present`, async () => {
      const textContent = await this.companyValues.textContent();
      expect(textContent).toContain(companyValue);
    });
  }

  /**
   * Clear award selection and verify company value is removed
   * @param companyValue - Company value that should be removed
   */
  async clearAwardAndVerifyCompanyValueRemoved(companyValue: string): Promise<void> {
    await test.step('Clear award and verify company value removed', async () => {
      await this.clearButton.first().click();
      await this.verifyCompanyValueNotPresent(companyValue);
    });
  }

  /**
   * Verify award disabled warning messages
   */
  async verifyAwardDisabledWarning(): Promise<void> {
    await test.step('Verify award disabled warning', async () => {
      await expect(this.awardDisabledWarning).toContainText('This award is currently disabled');
      await expect(this.awardDisabledWarning).toContainText(
        'You have reached the maximum number of times you can give this spot award'
      );
      await expect(this.recognizeButton).toBeDisabled();
    });
  }

  /**
   * Publish spot award recognition
   * @param awardName - Name of the award
   * @param message - Message to send
   */
  async publishSpotAward(awardName: string, message: string = 'Test Message'): Promise<void> {
    await test.step('Publish the spot award', async () => {
      await this.descriptionTextArea.waitFor({ state: 'visible' });
      await this.recipientsInput.click();
      await this.page.waitForTimeout(1000);
      await this.recipientsInput.fill(awardName);
      await this.page.waitForTimeout(1000);
      await this.suggesterContainer.waitFor({ state: 'visible' });
      await this.getOption(0).click();
      await this.page.waitForTimeout(1000);
      await this.recipientToGiveAwardInput.click();
      await this.page.waitForTimeout(1000);
      await this.suggesterContainer.waitFor({ state: 'visible' });
      await this.getOption(0).click();
      await this.descriptionTextArea.fill(message);
      await this.recognizeButton.click();
    });
  }

  /**
   * Share published recognition to feed via share modal
   */
  async shareToFeedViaModal(): Promise<void> {
    await test.step('Share published spot award to Feed via share modal', async () => {
      await expect(this.shareModal, 'expecting share modal to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(this.shareToFeedCheckBox).toBeVisible();
      await expect(this.shareToSlackCheckBox).toBeVisible();
      await this.shareToFeedCheckBox.click();
      await expect(this.homeFeedRadioButton).toBeVisible();
      await expect(this.siteFeedRadioButton).toBeVisible();
      await expect(this.shareButton).toBeEnabled();
      await this.shareButton.click();
    });
  }

  /**
   * Share published recognition to feed via share icon
   */
  async shareToFeedViaShareIcon(): Promise<void> {
    await test.step('Share published spot award to Feed via Share icon', async () => {
      await this.shareIcon.first().click();
      await expect(this.shareModal, 'expecting share modal to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(this.shareToFeedCheckBox).toBeVisible();
      await expect(this.shareToSlackCheckBox).toBeVisible();
      await this.shareToFeedCheckBox.click();
      await this.siteFeedRadioButton.click();
      await this.page.waitForTimeout(1000);
      await expect(this.selecteSiteInput).toBeVisible();
      await this.selecteSiteInput.click();
      // Wait for the listbox in the share modal to be visible

      await expect(this.shareModalListbox, 'expecting share modal listbox to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      // Get the option from the share modal's listbox
      await this.shareModalOption.click();
      await this.homeFeedRadioButton.click();
      await expect(this.shareButtonOnShareModal).toBeEnabled();
      await this.shareButtonOnShareModal.click();
    });
  }

  /**
   * Verify pagination in award listing
   */
  async verifyPagination(): Promise<void> {
    await test.step('Check pagination for award listing by scrolling', async () => {
      await this.descriptionTextArea.waitFor({ state: 'visible' });
      await this.page.waitForTimeout(1000);
      await this.selectAwardInput.click();
      await this.suggesterContainer.waitFor({ state: 'visible' });
      const beforePagination = await this.selectOptions.count();
      await this.page.waitForTimeout(2000);
      await this.suggesterContainer.evaluate(el => {
        el.scrollTop = el.scrollHeight;
      });
      await this.menuLoadingContainer.waitFor({ state: 'visible' });
      await expect(this.menuLoadingContainer).toBeVisible();
      await this.page.waitForTimeout(3000);
      const afterPagination = await this.selectOptions.count();
      expect(afterPagination).toBeGreaterThan(beforePagination);
    });
  }

  /**
   * Verify no results for invalid search
   * @param searchText - Invalid search text
   */
  async verifyNoResultsForInvalidSearch(searchText: string): Promise<void> {
    await test.step('Check results when searching invalid spot award', async () => {
      await this.selectAwardInput.fill(searchText);
      await this.page.waitForTimeout(5000);
      await this.suggesterContainer.waitFor({ state: 'visible' });
      const textContent = await this.suggesterContainer.textContent();
      expect(textContent).toContain('No results');
    });
  }
}
