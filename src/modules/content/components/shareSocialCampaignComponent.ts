import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export interface IShareSocialCampaignComponentActions {
  clickShareToFeedButton: () => Promise<void>;
  enterShareDescription: (description: string) => Promise<void>;
  enterSiteName: (siteName: string) => Promise<void>;
  clickShareButton: () => Promise<void>;
}

export interface IShareSocialCampaignComponentAssertions {}

export class ShareSocialCampaignComponent
  extends BaseComponent
  implements IShareSocialCampaignComponentActions, IShareSocialCampaignComponentAssertions
{
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
    this.enterSiteNameInput = page.locator("div:has-text('Search site')").locator('.. input');
  }

  get actions(): IShareSocialCampaignComponentActions {
    return this;
  }

  get assertions(): IShareSocialCampaignComponentAssertions {
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
      // Click on the listbox option with the site name
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
}
