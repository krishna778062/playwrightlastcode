import { expect, Locator, Page, test } from '@playwright/test';
import { DialogBox } from '@rewards-components/common/dialog-box';

import { TIMEOUTS } from '@core/constants/timeouts';

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
  readonly skipButton: Locator;
  readonly shareModal: Locator;
  readonly shareToFeedCheckBox: Locator;
  readonly shareToSlackCheckBox: Locator;
  readonly homeFeedRadioButton: Locator;
  readonly siteFeedRadioButton: Locator;
  readonly shareButton: Locator;
  readonly shareButtonOnShareModal: Locator;
  readonly menuLoadingContainer: Locator;
  readonly selecteSiteInput: Locator;
  readonly shareModalListbox: Locator;
  readonly shareModalOption: Locator;

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
    this.skipButton = this.container.getByRole('button', { name: 'Skip' });
    // Share modal is a separate dialog, not within the give recognition dialog container
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
