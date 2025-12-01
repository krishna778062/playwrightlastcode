import { Locator, Page } from '@playwright/test';
import { DialogBox } from '@rewards-components/common/dialog-box';

export class GiveRecognitionDialogBox extends DialogBox {
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
    this.messageInput = this.container.getByRole('textbox');
    this.descriptionTextArea = this.container.locator('[class*="tiptap ProseMirror"]');
    this.companyValues = this.container.getByTestId('field-Company values');
    this.companyValuesInput = this.container.getByTestId('field-Company values').locator('input[type="text"]');
    this.expertiseInput = this.container.getByTestId('field-Expertise').locator('input[type="text"]');
    this.recognizeButton = this.container.getByRole('button', { name: 'Recognize' });
    this.doneButton = this.container.getByRole('button', { name: 'Done' });
    this.giftingToggle = page.locator('button[role="switch"]');
    this.loadingIndicator = page.locator('div[class*="LoadingIndicator-module__wrapper"]');
    this.insufficientPointErrorMessage = this.container.locator('[role="alert"][id="gifting-points"]');
    this.minimumPointErrorMessage = this.container.locator('//p[text()="Minimum 1 points required"]');
    this.insufficientPointWithRecipientsErrorMessage = this.container.locator('div[style*="egative);"]');
    this.giftingOptionsContainer = this.container.locator('div[class*="GiftingPointsToggle_giftingOptionsList"]');
    this.giftingOptionsContainerPillText = this.giftingOptionsContainer.locator('label > div');
    this.giftingOptionsContainerPill = this.giftingOptionsContainer.locator('label > input');
    this.giftingPointsPrivacyText = this.container.locator(
      '//button[@aria-label="Points privacy information"]//preceding-sibling::p'
    );
    this.giftingPointsPrivacyInfoIcon = this.container.locator('[aria-label="Points privacy information"]');
    this.giftingPointsPrivacyTooltipText = this.container.locator('[id*="tippy"] p');
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
    let rewardPointsText: string | null = '';
    if (!(await this.giftingOptionsContainerPill.nth(rewardPoints - 1).isChecked())) {
      await this.giftingOptionsContainerPill.nth(rewardPoints - 1).click();
      rewardPointsText = await this.giftingOptionsContainerPillText.nth(rewardPoints - 1).textContent();
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
    return rewardPointsText || '';
  }

  /**
   * Select the user for recognition
   */
  async selectTheUserForRecognition(userName: string | number): Promise<void> {
    await this.recognitionRecipientsInput.click();
    if (typeof userName === 'string') {
      await this.recognitionRecipientsInput.fill(userName);
    } else {
      await this.recognitionRecipientsInput.click();
    }
    await this.suggesterContainer.waitFor({ state: 'visible' });
    await this.getOption(userName).click();
  }

  /**
   * Select the peer recognition award for recognition
   */
  async selectThePeerRecognitionAwardForRecognition(awardName: string | number): Promise<string> {
    await this.selectPeerRecognitionInput.click();
    await this.suggesterContainer.waitFor();
    await this.getOption(awardName).click();
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
}
