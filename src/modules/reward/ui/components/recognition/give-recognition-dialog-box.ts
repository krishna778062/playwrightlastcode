import { expect, Locator, Page } from '@playwright/test';
import { DialogBox } from '@rewards-components/common/dialog-box';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';

export class GiveRecognitionDialogBox extends DialogBox {
  readonly profilePicture: Locator;
  readonly peerRecognitionTab: Locator;
  readonly spotAwardTab: Locator;
  readonly recognitionRecipientsInput: Locator;
  readonly selectAwardInput: Locator;
  readonly selectPeerRecognitionInput: Locator;
  readonly selectOptions: Locator;
  readonly suggesterContainer: Locator;
  readonly recipientsInput: Locator;
  readonly messageInput: Locator;
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

  /**
   * This method returns a locator for the awardee name.
   * @returns {Locator} - The locator for the awardee text.
   */
  getAwardee(fullname: string): Locator {
    return this.container.getByText(fullname);
  }

  /**
   * This method returns a locator for the suggested item.
   * @param identifier - The identifier can be a string or a number.
   * @returns {Locator} - The locator for the option.
   */
  getOption(identifier: string | number): Locator {
    if (typeof identifier === 'string') {
      return this.selectOptions.getByText(identifier).first();
    } else if (typeof identifier === 'number') {
      return this.selectOptions.nth(identifier);
    }
    throw new Error(`Invalid identifier type: ${typeof identifier}`);
  }

  /**
   * This class represents the Give Recognition Dialog Box.
   * @param page - The Playwright page object
   */
  constructor(page: Page) {
    super(page);
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
   * This method recognize spot awards.
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
    await this.selectAwardInput.click();
    await this.suggesterContainer.waitFor();
    await this.getOption(award).click();
    await this.recipientsInput.click();
    await this.suggesterContainer.waitFor();
    await this.getOption(recipient).click();
    await this.messageInput.fill(message);
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
    const shareModal = new DialogBox(this.page);
    if (await shareModal.container.isVisible()) {
      await shareModal.skipButton.click();
      await expect(shareModal.container).not.toBeVisible();
    }
    const manageRewardsOverviewPage = new ManageRewardsOverviewPage(this.page);
    await manageRewardsOverviewPage.verifyToastMessageIsVisibleWithText('Recognition published');
    return rewardPointsText || '';
  }

  /**
   * Gift points to a recognition
   */
  async giftThePoints(rewardPoints: number): Promise<string> {
    await this.giftingToggle.waitFor({ state: 'visible', timeout: 10000 });
    await this.giftingToggle.click({ force: true });
    await this.giftingOptionsContainerPillText.last().waitFor({ state: 'visible' });
    let rewardPointsText = await this.giftingOptionsContainerPillText.nth(rewardPoints - 1).textContent();
    if (!(await this.giftingOptionsContainerPill.nth(rewardPoints - 1).isChecked())) {
      await this.giftingOptionsContainerPill.nth(rewardPoints - 1).click({ force: true });
      rewardPointsText = await this.giftingOptionsContainerPillText.nth(rewardPoints - 1).textContent();
    }
    return rewardPointsText || '';
  }

  /**
   * This method fills the recognition Message peer recognition.
   * @param message
   */
  async enterTheRecognitionMessage(message: string): Promise<void> {
    await this.descriptionTextArea.fill(message);
  }

  /**
   * This method selects the user in "Award to" peer recognition modal.
   * @param award - Award name or index
   */
  async selectThePeerRecognitionAwardForRecognition(award: string | number = 0): Promise<string> {
    if (typeof award === 'string') {
      await this.selectPeerRecognitionInput.waitFor({ state: 'visible' });
      await this.selectPeerRecognitionInput.fill(award);
      await this.suggesterContainer.waitFor({ state: 'visible', timeout: 15000 });
      await this.getOption(award).click();
    } else {
      await this.selectPeerRecognitionInput.waitFor({ state: 'visible' });
      await this.selectPeerRecognitionInput.click();
      await this.suggesterContainer.waitFor({ state: 'visible' });
      await this.getOption(award).click();
    }
    const awardText = await this.selectedAwardInRecognition.textContent();
    return awardText || '';
  }

  /**
   * This method selects the user in "Award to" peer recognition modal.
   * @param recipient Recipient name or index
   */
  async selectTheUserForRecognition(recipient: string | number = 0): Promise<void> {
    await this.loadingIndicator.first().waitFor({ state: 'detached' });
    if (typeof recipient === 'string') {
      await this.recognitionRecipientsInput.waitFor({ state: 'visible' });
      await this.recognitionRecipientsInput.fill(recipient);
      await this.suggesterContainer.waitFor({ state: 'visible', timeout: 15000 });
      await this.getOption(recipient).click();
    } else {
      await this.recognitionRecipientsInput.waitFor({ state: 'visible' });
      await this.recognitionRecipientsInput.click();
      await this.suggesterContainer.waitFor({ state: 'visible' });
      await this.getOption(recipient).click();
    }
  }
}
