import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class AddTileComponent extends BaseComponent {
  readonly addTileButton: Locator;
  readonly socialCampaignsButton: Locator;
  readonly showcaseRadioButton: Locator;
  readonly standardRadioButton: Locator;
  readonly addToHomeButton: Locator;
  readonly customTab: Locator;
  readonly mentionNameFirst: Locator;

  constructor(page: Page) {
    super(page);

    this.addTileButton = page.getByRole('button', { name: 'Add tile' });
    this.socialCampaignsButton = page.getByRole('button', { name: 'Social campaigns' });
    this.showcaseRadioButton = page.getByRole('radio', { name: 'Showcase' });
    this.standardRadioButton = page.getByRole('radio', { name: 'Standard' });
    this.addToHomeButton = page.getByRole('button', { name: 'Add to home' });
    this.customTab = page.getByRole('tab', { name: 'Custom' });
    this.mentionNameFirst = page.locator('.Mention-name > .u-textTruncate').first();
  }

  async clickAddTileButton(): Promise<void> {
    await this.clickOnElement(this.addTileButton);
  }

  async clickSocialCampaignsButton(): Promise<void> {
    await this.clickOnElement(this.socialCampaignsButton);
  }

  async checkShowcaseRadioButton(): Promise<void> {
    await this.checkElement(this.showcaseRadioButton);
  }

  async checkStandardRadioButton(): Promise<void> {
    await this.checkElement(this.standardRadioButton);
  }

  async clickAddToHomeButton(): Promise<void> {
    await this.clickOnElement(this.addToHomeButton);
  }

  async clickCustomTab(): Promise<void> {
    await this.clickOnElement(this.customTab);
  }

  async clickMentionNameFirst(): Promise<void> {
    await this.clickOnElement(this.mentionNameFirst);
  }
}
