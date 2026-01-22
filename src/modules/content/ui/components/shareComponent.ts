import { Locator, Page, test } from '@playwright/test';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { BaseComponent } from '@core/ui/components/baseComponent';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { SitePermission } from '@/src/core/types/siteManagement.types';

export interface ShareWithLimitVisibilityOptions {
  siteName: string;
  description?: string;
  audience: string;
}

export interface ShareWithRestrictedViewersOptions {
  siteName: string;
  description?: string;
  targetUsers: SitePermission[];
}

export class ShareComponent extends BaseComponent {
  readonly shareToFeedButton!: Locator;
  readonly shareOptionDropdown!: Locator;
  readonly shareDescriptionInput!: Locator;
  readonly siteNameInput!: Locator;
  readonly shareButton!: Locator;
  readonly shareButtonOnFeed!: Locator;
  readonly enterSiteNameInput!: Locator;

  // Limit visibility locators
  readonly limitVisibilityToggle: Locator;
  readonly audiencePickerDialog: Locator;
  readonly audiencePickerButton: Locator;
  readonly audienceSearchInput: Locator;
  readonly audienceDoneButton: Locator;
  readonly audienceConfirmButton: Locator;
  readonly audienceSearchButton: Locator;
  readonly siteDropdown: Locator;
  readonly siteSecondDropdown: Locator;
  readonly memberDropdown: Locator;
  readonly ownerAndManagerDropdown: Locator;
  readonly managerCheckbox: Locator;
  readonly ownerCheckbox: Locator;
  readonly memberCheckbox: Locator;
  readonly contentManagerCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    this.shareDescriptionInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: 'You are in the content editor' });
    this.siteNameInput = page.locator('div[id*="listbox"]');
    this.shareButton = page.getByRole('dialog').getByRole('button', { name: 'Share' });
    this.shareOptionDropdown = page.getByLabel('Post in');
    this.enterSiteNameInput = page.locator('div:has-text("Select site") + div >> input');

    // Limit visibility locators
    this.limitVisibilityToggle = page.getByRole('dialog').getByRole('switch').first();
    this.audiencePickerDialog = page.getByRole('dialog', { name: 'Audiences' });
    this.audiencePickerButton = page.getByRole('dialog').getByRole('button', { name: 'Browse' });
    this.audienceSearchInput = page.getByRole('textbox', { name: 'Search…' });
    this.audienceDoneButton = page.getByRole('button', { name: 'Done' });
    this.audienceConfirmButton = page.getByRole('button', { name: 'Confirm' });
    this.audienceSearchButton = page.getByRole('button', { name: 'Search' });
    this.siteDropdown = page.getByLabel('Site', { exact: true }).getByRole('button');
    this.siteSecondDropdown = page.locator('[data-testid="i-arrowRight"]').first();
    this.memberDropdown = page.getByLabel('Members').getByRole('button');
    this.ownerAndManagerDropdown = page.getByLabel('Owners & managers').getByRole('button');
    this.memberCheckbox = page.getByLabel('Non-managing members').getByRole('checkbox');
    this.ownerCheckbox = page.getByText('Owner', { exact: true });
    this.managerCheckbox = page.getByText('Managers', { exact: true });
    this.contentManagerCheckbox = page.getByLabel('Content managers').getByRole('checkbox');
  }

  getAudienceOption(audienceName: string): Locator {
    return this.page.getByLabel(audienceName, { exact: true }).getByRole('checkbox').first();
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

  /**
   * Gets the text of the currently selected option in the share dropdown
   * @returns Promise<string> - The text of the selected option (e.g., 'Home Feed', 'Site Feed')
   */
  async getSelectedShareOption(): Promise<string> {
    return await test.step('Get selected share option', async () => {
      const selectedOptionText = await this.shareOptionDropdown.evaluate((select: HTMLSelectElement) => {
        return select.options[select.selectedIndex].text;
      });
      return selectedOptionText;
    });
  }

  /**
   * Gets the value attribute of the currently selected option in the share dropdown
   * @returns Promise<string> - The value of the selected option (e.g., 'home', 'site')
   */
  async getSelectedShareOptionValue(): Promise<string> {
    return await test.step('Get selected share option value', async () => {
      return await this.shareOptionDropdown.inputValue();
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

  // ==================== Limit Visibility Methods ====================

  async toggleLimitVisibility(): Promise<void> {
    await test.step('Toggle limit visibility in share modal', async () => {
      await this.clickOnElement(this.limitVisibilityToggle);
    });
  }

  async selectAudience(audienceName: string): Promise<void> {
    await test.step(`Select audience: ${audienceName}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.audiencePickerDialog, {
        assertionMessage: 'Audience picker modal should be visible',
      });

      await this.clickOnElement(this.audiencePickerButton);

      const isSearchVisible = await this.verifier.isTheElementVisible(this.audienceSearchInput, {
        timeout: TIMEOUTS.VERY_SHORT,
      });

      if (isSearchVisible) {
        await this.fillInElement(this.audienceSearchInput, audienceName);
      }
      await this.clickOnElement(this.audienceSearchButton.first());
      await this.clickOnElement(this.getAudienceOption(audienceName));
      await this.clickOnElement(this.audienceDoneButton);
      await this.clickOnElement(this.audienceConfirmButton);
    });
  }

  async shareToSiteFeedWithLimitVisibility(options: ShareWithLimitVisibilityOptions): Promise<string> {
    return await test.step(`Share to site feed with limit visibility: ${options.siteName} -> ${options.audience}`, async () => {
      // Select site feed option
      await this.selectShareOptionAsSiteFeed();

      // Enter site name
      await this.enterSiteName(options.siteName);

      // Enter description if provided
      if (options.description) {
        await this.enterShareDescription(options.description);
      }

      // Enable limit visibility and select audience
      await this.toggleLimitVisibility();
      await this.selectAudience(options.audience);

      // Click share and get post ID
      const sharedPostId = await this.clickShareButtonAndGetPostId();
      return sharedPostId;
    });
  }
  async shareToSiteFeedWithRestrictedViewers(options: ShareWithRestrictedViewersOptions): Promise<string> {
    return await test.step(`Share to site feed with restricted viewers: ${options.siteName} -> ${options.targetUsers.join(', ')}`, async () => {
      // Select site feed option
      await this.selectShareOptionAsSiteFeed();

      // Enter site name
      await this.enterSiteName(options.siteName);

      // Enter description if provided
      if (options.description) {
        await this.enterShareDescription(options.description);
      }

      // Enable restricted viewers and select target users
      await this.toggleLimitVisibility();
      await this.selectTargetUsers(options.targetUsers);

      // Click share and get post ID
      const sharedPostId = await this.clickShareButtonAndGetPostId();
      return sharedPostId;
    });
  }
  async selectTargetUsers(targetUsers: SitePermission[]): Promise<void> {
    await test.step(`Select target users: ${targetUsers.join(', ')}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.audiencePickerDialog, {
        assertionMessage: 'Audience picker modal should be visible',
      });

      await this.clickOnElement(this.audiencePickerButton);

      await this.clickOnElement(this.siteDropdown.first());

      await this.clickOnElement(this.siteSecondDropdown);

      await this.clickOnElement(this.memberDropdown);

      await this.clickOnElement(this.ownerAndManagerDropdown);

      if (targetUsers.includes(SitePermission.MANAGER)) {
        await this.clickOnElement(this.managerCheckbox);
      }

      if (targetUsers.includes(SitePermission.OWNER)) {
        await this.clickOnElement(this.ownerCheckbox);
      }

      if (targetUsers.includes(SitePermission.MEMBER)) {
        await this.clickOnElement(this.memberCheckbox);
      }

      if (targetUsers.includes(SitePermission.CONTENT_MANAGER)) {
        await this.clickOnElement(this.contentManagerCheckbox);
      }

      await this.clickOnElement(this.audienceDoneButton);
      await this.clickOnElement(this.audienceConfirmButton);
    });
  }
}
