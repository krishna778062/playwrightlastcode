import { Locator, Page } from '@playwright/test';
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
  readonly companyValuesField: Locator;
  readonly expertiseField: Locator;
  readonly selectedAwardInRecognition: Locator;
  readonly recognizeButton: Locator;
  readonly doneButton: Locator;
  readonly loadingIndicator: Locator;
  readonly companyValues: Locator;
  readonly clearButton: Locator;
  readonly awardDisabledWarning: Locator;
  readonly shareIcon: Locator;

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
    this.recipientsInput = this.container.locator('[data-testid*="awarding this"] input[type="text"]');
    this.descriptionTextArea = this.container.locator('[class*="tiptap ProseMirror"]');
    this.companyValues = this.container.getByTestId('field-Company values');
    this.companyValuesField = this.container.getByTestId('field-Company values');
    this.companyValuesInput = this.companyValuesField.locator('input[type="text"]');
    this.expertiseField = this.container.getByTestId('field-Expertise');
    this.expertiseInput = this.expertiseField.locator('input[type="text"]');
    this.recognizeButton = this.container.getByRole('button', { name: 'Recognize' });
    this.doneButton = this.container.getByRole('button', { name: 'Done' });
    this.loadingIndicator = page.locator('div[class*="LoadingIndicator-module__wrapper"]');
    this.clearButton = this.container.getByRole('button', { name: 'Clear' });
    this.awardDisabledWarning = this.container.locator('[class*="SpotAwardGuidanceAndWarningPanel"]');
    this.shareIcon = page.locator('i[data-testid="i-share"]');
  }

  /**
   * This method returns a locator for the suggested item.
   * @param identifier - The identifier can be a string or a number.
   * @returns {Locator} - The locator for the option.
   */
  getOption(identifier: string | number): Locator {
    void this.page.waitForTimeout(500);
    if (typeof identifier === 'string') {
      return this.suggesterContainer.getByText(identifier).first();
    } else {
      return this.suggesterContainer.locator('[role="option"]').nth(identifier).first();
    }
  }

  /**
   * Verify visibility of optional fields on give recognition dialog.
   */
  async verifyFieldVisibility(field: 'companyValues' | 'expertise', shouldBeVisible: boolean): Promise<void> {
    const target = field === 'companyValues' ? this.companyValuesField : this.expertiseField;
    if (shouldBeVisible) {
      await this.verifier.verifyTheElementIsVisible(target, {
        assertionMessage: `${field} field should be visible`,
      });
    } else {
      await this.verifier.verifyTheElementIsNotVisible(target, {
        assertionMessage: `${field} field should not be visible`,
      });
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
    await this.loadingIndicator.first().waitFor({ state: 'detached' });
    if (typeof userName === 'string') {
      await this.recognitionRecipientsInput.click();
      await this.suggesterContainer.last().waitFor({ state: 'visible' });
      await this.page.waitForTimeout(200);
      await this.recognitionRecipientsInput.fill(userName);
      await this.suggesterContainer.last().waitFor({ state: 'visible' });
      await this.getOption(userName).first().click();
    } else {
      await this.recognitionRecipientsInput.click();
      await this.suggesterContainer.last().waitFor({ state: 'visible' });
      await this.getOption(userName).first().click();
    }
  }

  /**
   * Select the peer recognition award for recognition
   */
  async selectThePeerRecognitionAwardForRecognition(awardName: string | number): Promise<string> {
    if (typeof awardName === 'string') {
      await this.selectPeerRecognitionInput.isEnabled();
      await this.selectPeerRecognitionInput.click();
      await this.selectPeerRecognitionInput.fill(awardName);
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
    await this.descriptionTextArea.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
    await this.descriptionTextArea.isEnabled();
    await this.descriptionTextArea.fill(message);
    return message;
  }
}
