import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export interface IRecognitionFormActions {
  verifyRecognitionFormIsLoaded: () => Promise<void>;
  selectUserForRecognition: (userName: string | number) => Promise<void>;
  selectPeerRecognitionAward: (awardName: string | number) => Promise<string>;
  enterRecognitionMessage: (message: string) => Promise<void>;
  clickRecognizeButtonAndWaitForShareDialog: () => Promise<void>;
  selectPostInHomeFeedInShareDialog: () => Promise<void>;
  clickSharePostButton: () => Promise<void>;
  waitForShareDialogToClose: () => Promise<void>;
  clickRecognizeButton: () => Promise<void>;
}

export class RecognitionFormComponent extends BaseComponent implements IRecognitionFormActions {
  // Recognition form locators - scoped to inline form in feed composer
  readonly recognitionRecipientsInput: Locator;
  readonly selectPeerRecognitionInput: Locator;
  readonly descriptionTextArea: Locator;
  readonly suggesterContainer: Locator;
  readonly selectedAwardInRecognition: Locator;
  readonly recognizeButton: Locator;
  readonly loadingIndicator: Locator;

  // Share dialog locators
  readonly shareDialog: Locator;
  readonly shareDialogHeading: Locator;
  readonly homeFeedRadioButton: Locator;
  readonly sharePostButton: Locator;

  constructor(page: Page) {
    super(page);

    // Recognition form fields - these are inline in the feed composer
    this.recognitionRecipientsInput = this.page.locator('[aria-label="Who do you want to recognize?"]');
    this.selectPeerRecognitionInput = this.page.locator('input[aria-label="Select an award for the recognition"]');
    // Find the textarea that is within the recognition form - use contenteditable as it's a rich text editor
    // Scope it to the recognition form by finding it near the recognition recipients input
    this.descriptionTextArea = this.page.getByRole('paragraph').filter({ hasText: /^$/ }).first();
    this.suggesterContainer = this.page.getByRole('listbox');
    this.selectedAwardInRecognition = this.page.locator('div[class*="AwardSelect_singleValueWrapper"] p');
    this.recognizeButton = this.page.getByRole('button', { name: 'Recognize' });
    this.loadingIndicator = this.page.locator('div[class*="LoadingIndicator-module__wrapper"]');

    // Share dialog elements - scoped to the dialog
    this.shareDialog = this.page.getByRole('dialog', { name: 'Share recognition' });
    this.shareDialogHeading = this.shareDialog.getByRole('heading', { name: 'Share recognition' });
    this.homeFeedRadioButton = this.shareDialog.getByText('Post in home feed');
    this.sharePostButton = this.shareDialog.getByRole('button', { name: 'Share' });
  }

  /**
   * Verifies that the recognition form is loaded and ready
   */
  async verifyRecognitionFormIsLoaded(): Promise<void> {
    await test.step('Verify recognition form is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.recognitionRecipientsInput, {
        assertionMessage: 'Recognition recipients input should be visible',
      });
      // Wait for any loading indicators to disappear
      const loadingVisible = await this.verifier.isTheElementVisible(this.loadingIndicator.first());
      if (loadingVisible) {
        await this.loadingIndicator.first().waitFor({ state: 'detached', timeout: 10000 });
      }
    });
  }

  /**
   * Returns a locator for the suggested item in dropdowns
   * @param identifier - The identifier can be a string or a number
   * @returns {Locator} - The locator for the option
   */
  getOption(identifier: string | number): Locator {
    if (typeof identifier === 'string') {
      return this.suggesterContainer.getByText(identifier);
    } else {
      return this.suggesterContainer.locator('[role="option"]').nth(identifier);
    }
  }

  /**
   * Select the user for recognition
   * @param userName - User name (string) or index (number)
   */
  async selectUserForRecognition(userName: string | number): Promise<void> {
    await test.step(`Select user for recognition: ${userName}`, async () => {
      await this.clickOnElement(this.recognitionRecipientsInput);
      if (typeof userName === 'string') {
        await this.recognitionRecipientsInput.fill(userName);
      }
      await this.verifier.verifyTheElementIsVisible(this.suggesterContainer, {
        assertionMessage: 'User suggester dropdown should be visible',
      });
      await this.clickOnElement(this.getOption(userName));
    });
  }

  /**
   * Select the peer recognition award for recognition
   * @param awardName - Award name (string) or index (number)
   * @returns The selected award text
   */
  async selectPeerRecognitionAward(awardName: string | number): Promise<string> {
    return await test.step(`Select peer recognition award: ${awardName}`, async () => {
      await this.clickOnElement(this.selectPeerRecognitionInput);
      await this.verifier.verifyTheElementIsVisible(this.suggesterContainer, {
        assertionMessage: 'Award suggester dropdown should be visible',
      });
      await this.clickOnElement(this.getOption(awardName));
      const text = await this.selectedAwardInRecognition.textContent();
      return text || '';
    });
  }

  /**
   * Enter the recognition message
   * @param message - The message text to enter
   */
  async enterRecognitionMessage(message: string): Promise<void> {
    await test.step(`Enter recognition message: ${message.substring(0, 50)}...`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.descriptionTextArea, {
        assertionMessage: 'Recognition message text area should be visible',
      });
      await this.clickOnElement(this.descriptionTextArea);
      await this.descriptionTextArea.fill(message);
    });
  }

  /**
   * Clicks the Recognize button and waits for the share dialog to appear
   */
  async clickRecognizeButtonAndWaitForShareDialog(): Promise<void> {
    await test.step('Click Recognize button and wait for share dialog', async () => {
      await this.clickOnElement(this.recognizeButton);
      await this.verifier.verifyTheElementIsVisible(this.shareDialog, {
        assertionMessage: 'Share recognition dialog should be visible',
      });
    });
  }

  /**
   * Select "Post in Home feed" option in the share dialog
   */
  async selectPostInHomeFeedInShareDialog(): Promise<void> {
    await test.step('Select Post in Home feed in share dialog', async () => {
      await this.verifier.verifyTheElementIsVisible(this.shareDialogHeading, {
        assertionMessage: 'Share dialog heading should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.homeFeedRadioButton, {
        assertionMessage: 'Home feed radio button should be visible',
      });
      await this.homeFeedRadioButton.check();
    });
  }

  /**
   * Click "Share post" button in the share dialog
   */
  async clickSharePostButton(): Promise<void> {
    await test.step('Click Share post button', async () => {
      await this.clickOnElement(this.sharePostButton);
    });
  }

  /**
   * Waits for the share dialog to close
   */
  async waitForShareDialogToClose(): Promise<void> {
    await test.step('Wait for share dialog to close', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.shareDialog, {
        assertionMessage: 'Share dialog should be closed',
      });
    });
  }

  /**
   * Clicks the Recognize button to submit the recognition
   */
  async clickRecognizeButton(): Promise<void> {
    await test.step('Click Recognize button', async () => {
      await this.clickOnElement(this.recognizeButton);
    });
  }
}
