import { Locator, Page, test } from '@playwright/test';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class AddTileComponent extends BaseComponent {
  readonly addContentTileOption: Locator;
  readonly addTileButton: Locator;
  readonly socialCampaignsButton: Locator;
  readonly showcaseRadioButton: Locator;
  readonly standardRadioButton: Locator;
  readonly addToHomeButton: Locator;
  readonly addToSiteButton: Locator;
  readonly customTab: Locator;
  readonly mentionNameFirst: Locator;
  readonly tileTitleInput: Locator;
  readonly customSCButton: Locator;
  readonly customSCTitleInput: Locator;
  readonly customSCTitleInputOption: (text: string) => Locator;
  readonly sitesCategoriesTileOption: Locator;
  readonly sitesTab: Locator;
  readonly sitesTileTitleInput: Locator;
  readonly sitesSearchInput: Locator;
  readonly siteOption: (siteName: string) => Locator;
  readonly layoutListRadio: Locator;
  readonly layoutGridRadio: Locator;

  constructor(page: Page) {
    super(page);

    this.addTileButton = page.getByRole('button', { name: 'Add tile' });
    this.socialCampaignsButton = page.getByRole('button', { name: 'Social campaigns' });
    this.showcaseRadioButton = page.getByRole('radio', { name: 'Showcase' });
    this.standardRadioButton = page.getByRole('radio', { name: 'Standard' });
    this.addToHomeButton = page.getByRole('button', { name: 'Add to home' });
    this.addToSiteButton = page.getByRole('button', { name: 'Add to site dashboard' });
    this.customTab = page.getByRole('tab', { name: 'Custom' });
    this.mentionNameFirst = page.locator('.Mention-name > .u-textTruncate').first();
    this.tileTitleInput = page.getByRole('textbox', { name: 'Tile title' });
    this.customSCButton = page.getByRole('button', { name: 'Custom SC' });
    this.customSCTitleInput = page.locator('input.ReactSelectInput-inputField');
    this.customSCTitleInputOption = (text: string) => page.locator(`div.u-textTruncate:has-text("${text}")`).first();
    this.addContentTileOption = page.getByRole('button', { name: 'Add pages, events & albums' });
    this.sitesCategoriesTileOption = page.getByRole('button', { name: 'Sites & categories' });
    this.sitesTab = page.getByRole('tab', { name: 'Sites' });
    this.sitesTileTitleInput = page.getByRole('textbox', { name: 'Tile title' });
    this.sitesSearchInput = page
      .locator('div')
      .filter({ hasText: /^Select or search for a site$/ })
      .first();
    this.siteOption = (siteName: string) => page.locator(`div:has-text("${siteName}")`).first();
    this.layoutListRadio = page.getByRole('radio', { name: 'List' });
    this.layoutGridRadio = page.getByRole('radio', { name: 'Grid' });
  }

  async clickingOnAddContentTileOption(): Promise<void> {
    await this.clickOnElement(this.addContentTileOption);
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

  async clickAddToSiteButton(siteId: string): Promise<string> {
    return await test.step(`Submitting event and wait for submit api response`, async () => {
      const tileResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.addToSiteButton, { delay: 2_000 }),
        response =>
          response.url().includes(API_ENDPOINTS.tile.siteCreate(siteId)) &&
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

  async clickSitesCategoriesTileOption(): Promise<void> {
    await test.step('Click on Sites & Categories tile option', async () => {
      await this.clickOnElement(this.sitesCategoriesTileOption);
    });
  }

  async clickSitesTab(): Promise<void> {
    await test.step('Click on Sites tab', async () => {
      await this.clickOnElement(this.sitesTab);
    });
  }

  async setSitesTileTitle(tileTitle: string): Promise<void> {
    await test.step(`Set Sites tile title: ${tileTitle}`, async () => {
      await this.clickOnElement(this.sitesTileTitleInput);
      await this.sitesTileTitleInput.clear();
      await this.fillInElement(this.sitesTileTitleInput, tileTitle);
    });
  }

  async addSiteToTile(siteName: string): Promise<void> {
    await test.step(`Add site "${siteName}" to Sites tile`, async () => {
      // Click on the search input div to open the search dropdown
      await this.clickOnElement(this.sitesSearchInput);
      const searchInputField = this.page
        .locator('input[placeholder*="Search"], input[role="combobox"], input[type="text"]')
        .first();
      await searchInputField.clear();
      await this.fillInElement(searchInputField, siteName);
      const addSiteDialog = this.page.getByRole('dialog', { name: 'Add sites & categories tile' });
      const siteOption = addSiteDialog
        .locator('a')
        .filter({ hasText: `${siteName}` })
        .first();
      await siteOption.waitFor({ state: 'visible' });
      await this.clickOnElement(siteOption);
    });
  }

  async setLayout(layout: 'list' | 'grid'): Promise<void> {
    await test.step(`Set layout to ${layout}`, async () => {
      if (layout === 'list') {
        await this.clickOnElement(this.layoutListRadio);
      } else {
        await this.clickOnElement(this.layoutGridRadio);
      }
    });
  }
}
