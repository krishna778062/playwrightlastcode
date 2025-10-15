import { Locator, Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

export class GiveRecognitionDialogBox extends BasePage {
  readonly dialog: Locator;
  readonly dialogTitle: Locator;
  readonly dialogDescription: Locator;
  readonly dialogCancelButton: Locator;
  readonly dialogConfirmButton: Locator;
  readonly dialogCloseButton: Locator;
  readonly recipientInput: Locator;
  readonly pointsInput: Locator;
  readonly messageInput: Locator;

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
  readonly giftingToggle: Locator;
  readonly loadingIndicator: Locator;
  readonly insufficientPointErrorMessage: Locator;
  readonly minimumPointErrorMessage: Locator;
  readonly insufficientPointWithRecipientsErrorMessage: Locator;
  readonly giftingOptionsContainer: Locator;
  readonly giftingOptionsContainerPill: Locator;
  readonly giftingOptionsContainerPillText: Locator;
  readonly giftingPointsPrivacyText: Locator;
  readonly giftingPointsPrivacyTooltipText: Locator;
  readonly giftingPointsPrivacyInfoIcon: Locator;
  readonly companyValues: Locator;
  readonly clearButton: Locator;
  readonly awardDisabledWarning: Locator;
  readonly shareIcon: Locator;

  constructor(page: Page) {
    super(page);

    this.dialog = page.locator('[role="dialog"]');
    this.dialogTitle = this.dialog.locator('[data-testid="give-recognition-dialog-title"]');
    this.dialogDescription = this.dialog.locator('[data-testid="give-recognition-dialog-description"]');
    this.dialogCancelButton = this.dialog.locator('button[data-testid="give-recognition-cancel"]');
    this.dialogConfirmButton = this.dialog.locator('button[data-testid="give-recognition-confirm"]');
    this.dialogCloseButton = this.dialog.locator('button[data-testid="give-recognition-close"]');
    this.recipientInput = this.dialog.locator('input[data-testid="recipient-input"]');
    this.pointsInput = this.dialog.locator('input[data-testid="points-input"]');
    this.messageInput = this.dialog.locator('textarea[data-testid="message-input"]');

    // Additional locators for recognition functionality
    this.profilePicture = this.dialog.locator('[data-testid="profile-picture"]');
    this.peerRecognitionTab = this.dialog.locator('[data-testid="peer-recognition-tab"]');
    this.spotAwardTab = this.dialog.locator('[data-testid="spot-award-tab"]');
    this.recognitionRecipientsInput = this.dialog.locator('input[placeholder*="recipient"]');
    this.selectAwardInput = this.dialog.locator('input[placeholder*="award"]');
    this.selectPeerRecognitionInput = this.dialog.locator('input[placeholder*="recognition"]');
    this.selectOptions = this.dialog.locator('[role="option"]');
    this.suggesterContainer = this.dialog.locator('[data-testid="suggester-container"]');
    this.recipientsInput = this.dialog.locator('input[data-testid="recipients-input"]');
    this.descriptionTextArea = this.dialog.locator('textarea[data-testid="description-textarea"]');
    this.companyValuesInput = this.dialog.locator('input[data-testid="company-values-input"]');
    this.expertiseInput = this.dialog.locator('input[data-testid="expertise-input"]');
    this.selectedAwardInRecognition = this.dialog.locator('[data-testid="selected-award"]');
    this.recognizeButton = this.dialog.locator('button[data-testid="recognize-button"]');
    this.doneButton = this.dialog.locator('button[data-testid="done-button"]');
    this.giftingToggle = this.dialog.locator('[data-testid="gifting-toggle"]');
    this.loadingIndicator = this.dialog.locator('[data-testid="loading-indicator"]');
    this.insufficientPointErrorMessage = this.dialog.locator('[data-testid="insufficient-point-error"]');
    this.minimumPointErrorMessage = this.dialog.locator('[data-testid="minimum-point-error"]');
    this.insufficientPointWithRecipientsErrorMessage = this.dialog.locator(
      '[data-testid="insufficient-point-with-recipients-error"]'
    );
    this.giftingOptionsContainer = this.dialog.locator('[data-testid="gifting-options-container"]');
    this.giftingOptionsContainerPill = this.dialog.locator('[data-testid="gifting-options-pill"]');
    this.giftingOptionsContainerPillText = this.dialog.locator('[data-testid="gifting-options-pill-text"]');
    this.giftingPointsPrivacyText = this.dialog.locator('[data-testid="gifting-points-privacy-text"]');
    this.giftingPointsPrivacyTooltipText = this.dialog.locator('[data-testid="gifting-points-privacy-tooltip"]');
    this.giftingPointsPrivacyInfoIcon = this.dialog.locator('[data-testid="gifting-points-privacy-info-icon"]');
    this.companyValues = this.dialog.locator('[data-testid="company-values"]');
    this.clearButton = this.dialog.locator('button[data-testid="clear-button"]');
    this.awardDisabledWarning = this.dialog.locator('[data-testid="award-disabled-warning"]');
    this.shareIcon = this.dialog.locator('[data-testid="share-icon"]');
  }

  /**
   * This method returns a locator for the awardee name.
   * @returns {Locator} - The locator for the awardee text.
   */
  getAwardee(fullname: string): Locator {
    return this.dialog.getByText(fullname);
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

  async clickCancel(): Promise<void> {
    await this.dialogCancelButton.click();
  }

  async clickConfirm(): Promise<void> {
    await this.dialogConfirmButton.click();
  }

  async clickClose(): Promise<void> {
    await this.dialogCloseButton.click();
  }

  async verifyDialogIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.dialog);
  }

  async verifyDialogTitle(expectedTitle: string): Promise<void> {
    await this.verifier.verifyElementHasText(this.dialogTitle, expectedTitle);
  }

  async verifyDialogDescription(expectedDescription: string): Promise<void> {
    await this.verifier.verifyElementHasText(this.dialogDescription, expectedDescription);
  }

  async enterRecipient(recipient: string): Promise<void> {
    await this.recipientInput.fill(recipient);
  }

  async enterPoints(points: number): Promise<void> {
    await this.pointsInput.fill(points.toString());
  }

  async enterMessage(message: string): Promise<void> {
    await this.messageInput.fill(message);
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
    await this.suggesterContainer.waitFor();
    await this.getOption(award).click();
    await this.descriptionTextArea.fill(message);
    await this.recognizeButton.click();
    return true;
  }

  /**
   * This method recognizes peer recognition with reward points.
   * @param award Award name or index
   * @param recipient Recipient name or index
   * @param message Message to be sent with the award
   * @param rewardPoints Reward point pill index (1,2,3,4...8)
   */
  async recognizePeerRecognitionWithRewardPoints(
    award: string | number = 0,
    recipient: string | number = 0,
    message: string = 'Test Message',
    rewardPoints: number
  ): Promise<string> {
    await this.loadingIndicator.first().waitFor({ state: 'detached' });
    await this.recognitionRecipientsInput.waitFor({ state: 'visible' });
    await this.recognitionRecipientsInput.click();
    if (typeof recipient === 'string') {
      await this.recognitionRecipientsInput.fill(recipient);
    }
    await this.suggesterContainer.waitFor({ state: 'visible' });
    await this.getOption(recipient).click();
    await this.selectPeerRecognitionInput.click();
    await this.suggesterContainer.waitFor();
    await this.getOption(award).click();
    await this.descriptionTextArea.fill(message);
    await this.giftingToggle.waitFor({ state: 'visible' });
    await this.giftingToggle.scrollIntoViewIfNeeded();
    await this.giftingToggle.click();
    await this.giftingOptionsContainerPill.last().waitFor({ state: 'visible' });
    const rewardPointsText = await this.giftingOptionsContainerPillText.nth(rewardPoints - 1).textContent();
    if (!(await this.giftingOptionsContainerPill.nth(rewardPoints - 1).isChecked())) {
      await this.giftingOptionsContainerPill.nth(rewardPoints - 1).click({ force: true });
    }
    await this.recognizeButton.click();
    return rewardPointsText || '';
  }

  /**
   * This method gifts the points.
   * @param rewardPoints Reward point pill index
   */
  async giftThePoints(rewardPoints: number): Promise<string> {
    await this.giftingToggle.waitFor({ state: 'visible', timeout: 10000 });
    await this.giftingToggle.scrollIntoViewIfNeeded();
    await this.giftingToggle.click();
    await this.giftingOptionsContainerPill.last().waitFor({ state: 'visible' });
    const rewardPointsText = await this.giftingOptionsContainerPillText.nth(rewardPoints - 1).textContent();
    if (!(await this.giftingOptionsContainerPill.nth(rewardPoints - 1).isChecked())) {
      await this.giftingOptionsContainerPill.nth(rewardPoints - 1).click({ force: true });
    }
    await this.recognizeButton.click();
    return rewardPointsText || '';
  }

  /**
   * Select the user for recognition
   */
  async selectTheUserForRecognition(userName: string): Promise<void> {
    await this.recognitionRecipientsInput.click();
    await this.recognitionRecipientsInput.fill(userName);
    await this.suggesterContainer.waitFor({ state: 'visible' });
    await this.getOption(userName).click();
  }

  /**
   * Select the peer recognition award for recognition
   */
  async selectThePeerRecognitionAwardForRecognition(awardName: string): Promise<void> {
    await this.selectPeerRecognitionInput.click();
    await this.suggesterContainer.waitFor();
    await this.getOption(awardName).click();
  }

  /**
   * Enter the recognition message
   */
  async enterTheRecognitionMessage(message: string): Promise<void> {
    await this.descriptionTextArea.fill(message);
  }

  /**
   * Close button for the dialog
   */
  get closeButton(): Locator {
    return this.dialogCloseButton;
  }

  verifyThePageIsLoaded(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
