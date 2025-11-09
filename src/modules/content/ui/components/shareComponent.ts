import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/ui/components/baseComponent';

export interface IShareComponentActions {
  clickShareToFeedButton: () => Promise<void>;
  enterShareDescription: (description: string) => Promise<void>;
  enterSiteName: (siteName: string) => Promise<void>;
  clickShareButton: () => Promise<void>;
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
   * Gets a locator for the "View Post" link in the share dialog
   * @returns Locator for the View Post link in share dialog
   */
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
