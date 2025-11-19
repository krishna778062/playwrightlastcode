import { Locator, Page, test } from '@playwright/test';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { BaseComponent } from '@core/ui/components/baseComponent';

export interface IShareComponentActions {
  clickShareToFeedButton: () => Promise<void>;
  enterShareDescription: (description: string) => Promise<void>;
  enterSiteName: (siteName: string) => Promise<void>;
  clickShareButton: () => Promise<void>;
  clickShareButtonAndGetPostId: () => Promise<string>;
}

export interface IShareComponentAssertions {}

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
}
