import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export interface IRecognitionDialogActions {
  verifyRecognitionDialogIsLoaded: () => Promise<void>;
  selectUserForRecognition: (userName: string | number) => Promise<void>;
  selectPeerRecognitionAward: (awardName: string | number) => Promise<string>;
  enterRecognitionMessage: (message: string) => Promise<void>;
  addAttachment: (filePath: string) => Promise<void>;
  clickRecognizeButtonAndWaitForShareDialog: () => Promise<void>;
  selectPostInHomeFeedInShareDialog: () => Promise<void>;
  selectPostInSiteFeedInShareDialog: () => Promise<void>;
  selectSiteInShareDialog: (siteName: string) => Promise<void>;
  clickSharePostButton: () => Promise<void>;
  waitForShareDialogToClose: () => Promise<void>;
  clickSkipButton: () => Promise<void>;
  enterMessageInShareDialog: (message: string) => Promise<void>;
  selectPostInHomeFeedInShareDialogForm: () => Promise<void>;
  selectPostInSiteFeedInShareDialogForm: (siteName: string) => Promise<void>;
}

export class RecognitionDialogComponent extends BaseComponent implements IRecognitionDialogActions {
  // Dialog container - scoped to the recognition dialog
  readonly recognitionDialog: Locator;

  // Recognition form locators - scoped to the dialog
  readonly recognitionRecipientsInput: Locator;
  readonly selectPeerRecognitionInput: Locator;
  readonly descriptionTextArea: Locator;
  readonly suggesterContainer: Locator;
  readonly selectedAwardInRecognition: Locator;
  readonly recognizeButton: Locator;
  readonly loadingIndicator: Locator;
  readonly fileUploadInput: Locator;

  // Share dialog locators (for recognition creation flow)
  readonly shareDialog: Locator;
  readonly homeFeedRadioButton: Locator;
  readonly siteFeedRadioButton: Locator;
  readonly siteFeedTextBox: Locator;
  readonly sharePostButton: Locator;
  readonly skipButton: Locator;

  // Share dialog locators (for sharing existing recognition)
  readonly shareDialogForm: Locator;
  readonly shareDialogMessageBox: Locator;
  readonly shareDialogShareButton: Locator;

  constructor(page: Page) {
    super(page);

    // Recognition dialog container - use the same pattern as DialogBox
    this.recognitionDialog = this.page.getByRole('dialog', { name: 'Give a spot award' }).first();

    // Recognition form fields - scoped to the dialog
    this.recognitionRecipientsInput = this.recognitionDialog
      .locator('div')
      .filter({ hasText: /^Select…$/ })
      .first();
    this.selectPeerRecognitionInput = this.recognitionDialog
      .locator('div')
      .filter({ hasText: /^Select an award…$/ })
      .first();
    // Find the textarea that is within the recognition dialog - use contenteditable as it's a rich text editor
    this.descriptionTextArea = this.recognitionDialog.locator('.tiptap').first();
    this.suggesterContainer = this.page.getByRole('listbox');
    this.selectedAwardInRecognition = this.recognitionDialog.locator('div[class*="AwardSelect_singleValueWrapper"] p');
    this.recognizeButton = this.recognitionDialog.getByRole('button', { name: 'Recognize' });
    this.loadingIndicator = this.recognitionDialog.locator('div[class*="LoadingIndicator-module__wrapper"]');
    this.fileUploadInput = this.recognitionDialog.locator("input[type='file']");

    // Share dialog elements - scoped to the share dialog (appears after recognition is created)
    const shareDialogContainer = this.page.locator('[role="dialog"][data-state="open"]');
    this.shareDialog = shareDialogContainer;
    this.homeFeedRadioButton = shareDialogContainer.getByText('Post in home feed');
    this.siteFeedRadioButton = shareDialogContainer.getByText('Post in site feed');
    this.siteFeedTextBox = shareDialogContainer.locator('input[aria-autocomplete="list"]');
    this.sharePostButton = shareDialogContainer.getByRole('button', { name: 'Share' });
    this.skipButton = shareDialogContainer.getByRole('button', { name: 'Skip' });

    // Share dialog form and message box (for sharing existing recognition)
    this.shareDialogForm = this.page.locator('form');
    this.shareDialogMessageBox = this.page.getByRole('paragraph').filter({ hasText: /^$/ });
    this.shareDialogShareButton = this.page.getByRole('button', { name: 'Share', exact: true });
  }

  /**
   * Verifies that the recognition dialog is loaded and ready
   */
  async verifyRecognitionDialogIsLoaded(): Promise<void> {
    await test.step('Verify recognition dialog is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.recognitionDialog, {
        assertionMessage: 'Recognition dialog should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.selectPeerRecognitionInput, {
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
   * Add an attachment to the recognition
   * @param filePath - Path to the file to attach
   */
  async addAttachment(filePath: string): Promise<void> {
    await test.step(`Add attachment: ${filePath}`, async () => {
      // Wait for file upload input to be available
      await this.verifier.verifyTheElementIsVisible(this.fileUploadInput, {
        assertionMessage: 'File upload input should be visible',
      });
      await this.fileUploadInput.setInputFiles(filePath);
      // Wait for file to appear in the UI - check for file item or attached file indicator
      const attachedFileIndicator = this.recognitionDialog.locator("div[class='FileItem-name']");
      await this.verifier.verifyTheElementIsVisible(attachedFileIndicator.first(), {
        assertionMessage: 'File should be attached and visible',
        timeout: 10000,
      });
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
   * Select "Post in Home feed" option in the share dialog (for recognition creation)
   */
  async selectPostInHomeFeedInShareDialog(): Promise<void> {
    await test.step('Select Post in Home feed in share dialog', async () => {
      await this.verifier.verifyTheElementIsVisible(this.homeFeedRadioButton, {
        assertionMessage: 'Home feed radio button should be visible',
      });
      await this.homeFeedRadioButton.check();
    });
  }

  /**
   * Select "Post in Home feed" option in the share dialog (for sharing existing recognition)
   */
  async selectPostInHomeFeedInShareDialogForm(): Promise<void> {
    await test.step('Select Post in Home feed in share dialog form', async () => {
      await this.verifier.verifyTheElementIsVisible(this.shareDialogForm, {
        assertionMessage: 'Share dialog form should be visible',
      });
      const homeFeedRadio = this.shareDialogForm.getByRole('radio', { name: 'Post in home feed' });
      await this.verifier.verifyTheElementIsVisible(homeFeedRadio, {
        assertionMessage: 'Home feed radio button should be visible',
      });
      await homeFeedRadio.check();
    });
  }

  /**
   * Select "Post in Site feed" option in the share dialog (for recognition creation)
   */
  async selectPostInSiteFeedInShareDialog(): Promise<void> {
    await test.step('Select Post in Site feed in share dialog', async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteFeedRadioButton, {
        assertionMessage: 'Site feed radio button should be visible',
      });
      await this.siteFeedRadioButton.check();
    });
  }

  /**
   * Select a site from the dropdown in the share dialog
   * @param siteName - The name of the site to select
   */
  async selectSiteInShareDialog(siteName: string): Promise<void> {
    await test.step(`Select site "${siteName}" in share dialog`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteFeedTextBox, {
        assertionMessage: 'Site feed text box should be visible',
      });
      await this.clickOnElement(this.siteFeedTextBox);
      await this.siteFeedTextBox.fill(siteName);
      // Wait for suggester to appear
      await this.verifier.verifyTheElementIsVisible(this.suggesterContainer, {
        assertionMessage: 'Site suggester dropdown should be visible',
      });
      // Click on the site option
      await this.clickOnElement(this.suggesterContainer.getByText(siteName).first());
    });
  }

  /**
   * Select "Post in Site feed" option and site in the share dialog form (for sharing existing recognition)
   */
  async selectPostInSiteFeedInShareDialogForm(siteName: string): Promise<void> {
    await test.step(`Select Post in Site feed and site "${siteName}" in share dialog form`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.shareDialogForm, {
        assertionMessage: 'Share dialog form should be visible',
      });
      const siteFeedRadio = this.shareDialogForm.getByRole('radio', { name: 'Post in site feed' });
      await this.verifier.verifyTheElementIsVisible(siteFeedRadio, {
        assertionMessage: 'Site feed radio button should be visible',
      });
      await siteFeedRadio.check();

      // Wait for site input to appear after selecting site feed
      const siteInput = this.shareDialogForm.locator('input[aria-autocomplete="list"]');
      await this.verifier.verifyTheElementIsVisible(siteInput, {
        assertionMessage: 'Site feed text box should be visible',
      });
      await this.clickOnElement(siteInput);
      await siteInput.fill(siteName);

      // Wait for suggester to appear and select site
      await this.verifier.verifyTheElementIsVisible(this.suggesterContainer, {
        assertionMessage: 'Site suggester dropdown should be visible',
      });
      await this.clickOnElement(this.suggesterContainer.getByText(siteName).first());
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
   * Click "Skip" button in the share dialog
   */
  async clickSkipButton(): Promise<void> {
    await test.step('Click Skip button in share dialog', async () => {
      await this.verifier.verifyTheElementIsVisible(this.skipButton, {
        assertionMessage: 'Skip button should be visible',
      });
      await this.clickOnElement(this.skipButton);
    });
  }

  /**
   * Waits for the share dialog to close (handles both dialog types)
   */
  async waitForShareDialogToClose(): Promise<void> {
    await test.step('Wait for share dialog to close', async () => {
      const formVisible = await this.verifier.isTheElementVisible(this.shareDialogForm.first());
      if (formVisible) {
        await this.verifier.verifyTheElementIsNotVisible(this.shareDialogForm, {
          assertionMessage: 'Share dialog form should be closed',
        });
      } else {
        await this.verifier.verifyTheElementIsNotVisible(this.shareDialog, {
          assertionMessage: 'Share dialog should be closed',
        });
      }
    });
  }

  /**
   * Enter a message in the share dialog when sharing an existing recognition
   * @param message - The message text to enter
   */
  async enterMessageInShareDialog(message: string): Promise<void> {
    await test.step(`Enter message in share dialog: ${message.substring(0, 50)}...`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.shareDialogForm, {
        assertionMessage: 'Share dialog form should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.shareDialogMessageBox.first(), {
        assertionMessage: 'Share dialog message box should be visible',
      });
      await this.clickOnElement(this.shareDialogMessageBox.first());
      await this.shareDialogMessageBox.first().fill(message);
    });
  }
}
