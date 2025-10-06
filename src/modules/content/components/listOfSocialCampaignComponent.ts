import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export interface IListOfSocialCampaignComponentActions {
  clickCampaignOptions: () => Promise<void>;
  clickExpireCampaignButton: () => Promise<void>;
  confirmExpireCampaign: () => Promise<void>;
  getSocialCampaignCount: () => Promise<number>;
}

export interface IListOfSocialCampaignComponentAssertions {
  verifyCampaignNotInLatest: (linkText: string) => Promise<void>;
  verifyCampaignInExpired: (linkText: string) => Promise<void>;
  verifyCampaignNotInExpired: (linkText: string) => Promise<void>;
}

export class ListOfSocialCampaignComponent
  extends BaseComponent
  implements IListOfSocialCampaignComponentActions, IListOfSocialCampaignComponentAssertions
{
  readonly linkByText: (linkText: string) => Locator;
  readonly campaignOptionsButton: Locator;
  readonly expireCampaignButton: Locator;
  readonly confirmExpireButton: Locator;
  readonly campaignCount: Locator;
  readonly deleteCampaignButton: Locator;
  readonly confirmDeleteButton: Locator;
  readonly shareToFeedButton: Locator;

  constructor(page: Page) {
    super(page);
    this.linkByText = (linkText: string) => page.locator('a', { hasText: linkText });
    this.campaignOptionsButton = page.locator('button.ImageOptions-button').first();
    this.expireCampaignButton = page.locator('button:has-text("Expire campaign")');
    this.shareToFeedButton = page.locator('button:has-text("Share to feed")');
    this.confirmExpireButton = page.locator('span:has-text("Expire")');
    this.campaignCount = page.locator('[data-testid="campaign-count"]');
    this.deleteCampaignButton = page.locator('button:has-text("Delete campaign")');
    this.confirmDeleteButton = page.locator('span:has-text("Delete")');
  }

  get actions(): IListOfSocialCampaignComponentActions {
    return this;
  }

  get assertions(): IListOfSocialCampaignComponentAssertions {
    return this;
  }

  async verifyCampaignLinkDisplayed(linkText: string): Promise<void> {
    await test.step(`Verify campaign link "${linkText}" is displayed`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.linkByText(linkText).first(), {
        assertionMessage: `Campaign link "${linkText}" should be displayed`,
      });
    });
  }

  async clickCampaignOptions(): Promise<void> {
    await test.step('Click options for campaign', async () => {
      await this.hoverOverElementInJavaScript(this.campaignOptionsButton);
      await this.clickOnElement(this.campaignOptionsButton);
    });
  }

  async clickExpireCampaignButton(): Promise<void> {
    await test.step('Click Expire campaign button', async () => {
      await this.clickOnElement(this.expireCampaignButton);
    });
  }

  async confirmExpireCampaign(): Promise<void> {
    await test.step('Confirm expire campaign', async () => {
      await this.clickOnElement(this.confirmExpireButton);
    });
  }

  async getSocialCampaignCount(): Promise<number> {
    return await test.step('Get social campaign count', async () => {
      const countText = await this.campaignCount.textContent();
      return parseInt(countText || '0', 10);
    });
  }

  async verifyCampaignNotInLatest(linkText: string): Promise<void> {
    await test.step(`Verify campaign "${linkText}" is not in latest`, async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.linkByText(linkText).first(), {
        assertionMessage: `Campaign "${linkText}" should not be visible in latest`,
      });
    });
  }

  async verifyCampaignInExpired(linkText: string): Promise<void> {
    await test.step(`Verify campaign "${linkText}" is in expired`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.linkByText(linkText).first(), {
        assertionMessage: `Campaign "${linkText}" should be visible in expired`,
      });
    });
  }

  async clickDeleteCampaignButton(): Promise<void> {
    await test.step('Click Delete campaign button', async () => {
      await this.clickOnElement(this.deleteCampaignButton);
    });
  }

  async confirmDeleteCampaign(): Promise<void> {
    await test.step('Confirm delete campaign', async () => {
      await this.clickOnElement(this.confirmDeleteButton);
    });
  }

  async verifyCampaignNotInExpired(linkText: string): Promise<void> {
    await test.step(`Verify campaign "${linkText}" is not in expired`, async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.linkByText(linkText).first(), {
        assertionMessage: `Campaign "${linkText}" should not be visible in expired`,
      });
    });
  }

  async clickShareToFeedButton(): Promise<void> {
    await test.step('Click Share to feed button', async () => {
      await this.clickOnElement(this.shareToFeedButton);
    });
  }
}
