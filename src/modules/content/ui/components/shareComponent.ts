import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/ui/components/baseComponent';

export interface IShareComponentActions {
  clickShareToFeedButton: () => Promise<void>;
  enterShareDescription: (description: string) => Promise<void>;
  enterSiteName: (siteName: string) => Promise<void>;
  clickShareButton: () => Promise<void>;
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
    this.shareDescriptionInput = page.getByRole('textbox', { name: 'You are in the content editor' });
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
      await this.fillInElement(this.shareDescriptionInput, description);
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

  async selectShareOptionAsSiteFeed(): Promise<void> {
    await test.step(`Select share option: site feed`, async () => {
      await this.shareOptionDropdown.selectOption('site');
    });
  }

  /**
   * Attempts to paste an image file into the tiptap editor in the share modal
   * Creates a simple test image blob and simulates paste event
   */
  async attemptImagePaste(): Promise<void> {
    await test.step(`Attempt to paste image file into share modal editor`, async () => {
      await this.shareDescriptionInput.focus();
      await this.page.evaluate(() => {
        return new Promise<void>(resolve => {
          // Create a simple 1x1 pixel PNG image blob
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(0, 0, 1, 1);
          }
          canvas.toBlob(blob => {
            if (blob) {
              const file = new File([blob], 'test-image.png', { type: 'image/png' });
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              const editor = document.querySelector('[role="textbox"][aria-label*="content editor"]') as HTMLElement;
              editor.dispatchEvent(
                new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dataTransfer as any })
              );
            }
            resolve();
          }, 'image/png');
        });
      });
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
}
