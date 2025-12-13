import { Locator, Page, test } from '@playwright/test';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { BaseComponent } from '@core/ui/components/baseComponent';

export interface IShareComponentActions {
  clickShareToFeedButton: () => Promise<void>;
  enterShareDescription: (description: string) => Promise<void>;
  enterSiteName: (siteName: string) => Promise<void>;
  clickShareButton: () => Promise<void>;
  clickShareButtonAndGetPostId: () => Promise<string>;
  attemptImagePaste: () => Promise<void>;
}

export interface IShareComponentAssertions {
  verifyNoAttachmentsInShareModal: () => Promise<void>;
  verifyShareModalIsFunctional: () => Promise<void>;
}

export class ShareComponent extends BaseComponent implements IShareComponentActions, IShareComponentAssertions {
  readonly shareToFeedButton!: Locator;
  readonly shareOptionDropdown!: Locator;
  readonly shareDescriptionInput!: Locator;
  readonly siteNameInput!: Locator;
  readonly shareButton!: Locator;
  readonly shareButtonOnFeed!: Locator;
  readonly enterSiteNameInput!: Locator;

  constructor(page: Page) {
    super(page);
    this.shareDescriptionInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: 'You are in the content editor' });
    this.siteNameInput = page.locator('div[id*="listbox"]');
    this.shareButton = page.getByRole('dialog').getByRole('button', { name: 'Share' });
    this.shareOptionDropdown = page.getByLabel('Post in');
    this.enterSiteNameInput = page.locator('div:has-text("Select site") + div >> input');
  }

  get actions(): IShareComponentActions {
    return this;
  }

  get assertions(): IShareComponentAssertions {
    return this;
  }

  async clickShareToFeedButton(): Promise<void> {
    await test.step('Click Share to feed button', async () => {
      await this.clickOnElement(this.shareToFeedButton);
    });
  }

  async enterShareDescription(description: string): Promise<void> {
    await test.step(`Enter share description: ${description}`, async () => {
      await this.fillInElement(this.shareDescriptionInput.first(), description);
    });
  }

  async enterSiteName(siteName: string): Promise<void> {
    await test.step(`Enter site name: ${siteName}`, async () => {
      await this.clickOnElement(this.enterSiteNameInput);
      await this.fillInElement(this.enterSiteNameInput, siteName);
      await this.clickOnElement(this.siteNameInput.locator(`text="${siteName}"`).first());
    });
  }

  async clickShareButton(): Promise<void> {
    await test.step('Click Share button', async () => {
      await this.clickOnElement(this.shareButton);
    });
  }

  /**
   * Clicks the Share button and intercepts the API response to get the shared post ID
   * @returns Promise<string> - The shared post ID
   */
  async clickShareButtonAndGetPostId(): Promise<string> {
    return await test.step('Click Share button and get shared post ID', async () => {
      const shareResponsePromise = this.page.waitForResponse(
        response =>
          response.url().includes(API_ENDPOINTS.feed.create) &&
          response.request().method() === 'POST' &&
          response.status() === 201
      );

      await this.clickOnElement(this.shareButton);

      const shareResponse = await shareResponsePromise;
      const responseBody = await shareResponse.json();
      const feedId = responseBody.result?.feedId || '';
      return feedId;
    });
  }

  async selectShareOptionAsSiteFeed(): Promise<void> {
    await test.step(`Select share option: site feed`, async () => {
      await this.shareOptionDropdown.selectOption('site');
    });
  }

  /**
   * Attempts to paste an image file into the tiptap editor in the share modal
   * Creates a simple test image blob and simulates paste event
   * Uses the shareDescriptionInput locator to ensure we're targeting the correct editor
   */
  async attemptImagePaste(): Promise<void> {
    await test.step(`Attempt to paste image file into share modal editor`, async () => {
      // Ensure the editor is visible and focused
      await this.verifier.verifyTheElementIsVisible(this.shareDescriptionInput, {
        assertionMessage: 'Share description input should be visible before attempting paste',
      });
      await this.shareDescriptionInput.focus();

      // Use evaluateHandle to get the actual DOM element from the locator
      const editorHandle = await this.shareDescriptionInput.elementHandle();
      if (!editorHandle) {
        throw new Error('Share description input element not found');
      }

      // Create and dispatch the paste event with image data
      await this.page.evaluate(editorElement => {
        return new Promise<void>((resolve, reject) => {
          try {
            // Create a simple 1x1 pixel PNG image blob
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#FF0000';
              ctx.fillRect(0, 0, 1, 1);
            }

            canvas.toBlob(
              blob => {
                try {
                  if (!blob) {
                    reject(new Error('Failed to create image blob'));
                    return;
                  }

                  // Create a File object from the blob
                  const file = new File([blob], 'test-image.png', { type: 'image/png' });

                  // Create DataTransfer object with the file
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(file);

                  // Create and dispatch paste event on the editor element
                  const pasteEvent = new ClipboardEvent('paste', {
                    bubbles: true,
                    cancelable: true,
                    clipboardData: dataTransfer as any,
                  });

                  // Focus the editor element before dispatching the event
                  if (editorElement instanceof HTMLElement) {
                    editorElement.focus();
                    editorElement.dispatchEvent(pasteEvent);
                  } else {
                    reject(new Error('Editor element is not an HTMLElement'));
                    return;
                  }

                  resolve();
                } catch (error) {
                  reject(error);
                }
              },
              'image/png',
              0.95
            );
          } catch (error) {
            reject(error);
          }
        });
      }, editorHandle);
    });
  }

  /**
   * Verifies that no attachment preview or media elements are visible in the share modal
   */
  async verifyNoAttachmentsInShareModal(): Promise<void> {
    await test.step('Verify no attachments are visible in share modal', async () => {
      // Check for file attachment indicators
      const fileItemLocator = this.page.locator("div[class='FileItem-name']");
      const uploadingIndicator = this.page.locator('[class*="uploading"], [data-uploading="true"]');
      const attachmentPreview = this.page.locator('[class*="attachment"], [class*="file-preview"]');

      // Verify no file items are visible
      await this.verifier.verifyTheElementIsNotVisible(fileItemLocator.first(), {
        assertionMessage: 'No file attachment items should be visible in share modal',
      });

      // Verify no uploading indicators
      await this.verifier.verifyTheElementIsNotVisible(uploadingIndicator.first(), {
        assertionMessage: 'No file upload indicators should be visible in share modal',
      });

      // Verify no attachment previews
      await this.verifier.verifyTheElementIsNotVisible(attachmentPreview.first(), {
        assertionMessage: 'No attachment previews should be visible in share modal',
      });
    });
  }

  /**
   * Verifies that the share modal remains functional after paste attempt
   */
  async verifyShareModalIsFunctional(): Promise<void> {
    await test.step('Verify share modal is still functional', async () => {
      // Verify the share button is still visible and enabled
      await this.verifier.verifyTheElementIsVisible(this.shareButton, {
        assertionMessage: 'Share button should be visible and functional',
      });

      // Verify the editor is still accessible
      await this.verifier.verifyTheElementIsVisible(this.shareDescriptionInput, {
        assertionMessage: 'Share description input should be visible and functional',
      });

      // Verify we can still type in the editor (tiptap editor is contenteditable, not a standard input)
      await this.shareDescriptionInput.fill('Test text');
      // For tiptap editor, we need to get text content instead of inputValue
      const editorText = await this.shareDescriptionInput.textContent();
      if (!editorText?.includes('Test text')) {
        throw new Error('Share modal editor is not functional - cannot enter text');
      }
      // Clear the test text
      await this.shareDescriptionInput.clear();
    });
  }

  readonly getViewPostLinkInShareDialog = (): Locator =>
    this.page.getByRole('dialog').getByRole('link', { name: 'View Post' });

  /**
   * Verifies that "View Post" link is visible in the share dialog
   */
  async verifyViewPostLinkInShareDialog(): Promise<void> {
    await test.step('Verify View Post link is visible in share dialog', async () => {
      const viewPostLink = this.getViewPostLinkInShareDialog();
      await this.verifier.verifyTheElementIsVisible(viewPostLink, {
        assertionMessage: 'View Post link should be visible in share dialog',
      });
    });
  }
}
