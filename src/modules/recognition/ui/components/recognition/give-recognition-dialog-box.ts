import { Locator, Page, test } from '@playwright/test';
import { DialogBox } from '@rewards-components/common/dialog-box';

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
  readonly recipientToGiveAwardInput: Locator;
  readonly successMessage: Locator;

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
    this.recipientsInput = this.container.getByRole('combobox', { name: 'Select a spot award to recognize someone' });
    this.recipientToGiveAwardInput = this.container.getByRole('combobox', {
      name: 'To whom do you want to give this spot award?',
    });
    this.messageInput = this.container.getByTestId('tiptap-editor-v2').getByRole('paragraph');
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
    this.successMessage = this.container.getByText('Recognition published', { exact: true });
  }

  /**
   * Get option locator by identifier (string or number)
   * @param identifier - The identifier can be a string or a number
   * @returns Locator for the option
   */
  getOption(identifier: string | number): Locator {
    if (typeof identifier === 'string') {
      return this.selectOptions.getByText(identifier).first();
    } else {
      return this.selectOptions.nth(identifier);
    }
  }

  /**
   * Recognize spot award
   * @param award - Award name or index
   * @param recipient - Recipient name or index
   * @param message - Message to be sent with the award
   */
  async recognizeSpotAward(
    award: string | number = 0,
    recipient: string | number = 0,
    message: string = 'Test Message'
  ): Promise<boolean> {
    await test.step('Recognize spot award', async () => {
      await this.spotAwardTab.click();
      await this.recipientsInput.click();
      if (typeof recipient === 'string') {
        await this.recipientsInput.fill(recipient);
      }
      await this.suggesterContainer.waitFor({ state: 'visible' });
      await this.getOption(recipient).click();
      await this.selectAwardInput.click();
      await this.suggesterContainer.waitFor();
      await this.getOption(award).click();
      await this.messageInput.fill(message);
      await this.recognizeButton.click();
    });
    return true;
  }
}
