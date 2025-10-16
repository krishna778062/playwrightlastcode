import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';

export class AddTileComponent extends BaseComponent {
  readonly addTileButton: Locator;
  readonly socialCampaignsButton: Locator;
  readonly showcaseRadioButton: Locator;
  readonly standardRadioButton: Locator;
  readonly addToHomeButton: Locator;
  readonly customTab: Locator;
  readonly mentionNameFirst: Locator;
  readonly tileTitleInput: Locator;
  readonly customSCButton: Locator;
  readonly customSCTitleInput: Locator;
  readonly customSCTitleInputOption: (text: string) => Locator;

  constructor(page: Page) {
    super(page);

    this.addTileButton = page.getByRole('button', { name: 'Add tile' });
    this.socialCampaignsButton = page.getByRole('button', { name: 'Social campaigns' });
    this.showcaseRadioButton = page.getByRole('radio', { name: 'Showcase' });
    this.standardRadioButton = page.getByRole('radio', { name: 'Standard' });
    this.addToHomeButton = page.getByRole('button', { name: 'Add to home' });
    this.customTab = page.getByRole('tab', { name: 'Custom' });
    this.mentionNameFirst = page.locator('.Mention-name > .u-textTruncate').first();
    this.tileTitleInput = page.getByRole('textbox', { name: 'Tile title' });
    this.customSCButton = page.getByRole('button', { name: 'Custom SC' });
    this.customSCTitleInput = page.locator('input.ReactSelectInput-inputField');
    this.customSCTitleInputOption = (text: string) => page.locator(`div.u-textTruncate:has-text("${text}")`).first();
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

  async clickAddToHomeButton(): Promise<string> {
    return await test.step(`Submitting event and wait for submit api response`, async () => {
      const tileResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.addToHomeButton, { delay: 2_000 }),
        response =>
          response.url().includes(API_ENDPOINTS.tile.create) &&
          response.request().method() === 'POST' &&
          response.status() === 201,
        {
          timeout: 20_000,
        }
      );
      const responseBody = await tileResponse.json();
      return responseBody.result.id;
    });
  }

  async clickCustomTab(): Promise<void> {
    await this.clickOnElement(this.customTab);
  }

  async clickMentionNameFirst(): Promise<void> {
    await this.clickOnElement(this.mentionNameFirst);
  }

  async setTileTitle(tileTitle: string): Promise<void> {
    await this.clickOnElement(this.tileTitleInput);
    await this.tileTitleInput.clear();
    await this.fillInElement(this.tileTitleInput, tileTitle);
  }

  async clickCustomSCButton(): Promise<void> {
    await this.clickOnElement(this.customSCButton);
  }

  async setCustomSCTitle(title: string): Promise<void> {
    await this.clickOnElement(this.customSCTitleInput);
    await this.customSCTitleInput.clear();

    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      await this.fillInElement(this.customSCTitleInput, 'Look');

      try {
        await this.verifier.verifyTheElementIsVisible(this.customSCTitleInputOption(title));
        await this.clickOnElement(this.customSCTitleInputOption(title));
        break; // Success, exit the loop
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to find custom SC title option "${title}" after ${maxAttempts} attempts`);
        }
      }
    }
  }
}
