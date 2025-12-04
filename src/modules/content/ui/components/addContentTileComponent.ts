import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class AddContentTileComponent extends BaseComponent {
  readonly selectingPagesAsContentTypeOption: Locator;
  readonly tileName: Locator;
  readonly addToHomeButton: Locator;
  readonly siteRadioButton: Locator;
  readonly clickingOnSiteField: Locator;
  readonly showcaseRadioButton: Locator;
  readonly saveButton: Locator;
  readonly textHtmlLinksTab: Locator;
  readonly sitesCategoryTab: Locator;
  readonly textTileDescriptionInput: Locator;
  readonly siteSearchInput: Locator;
  readonly siteOption: (siteName: string) => Locator;
  constructor(readonly page: Page) {
    super(page);
    this.selectingPagesAsContentTypeOption = page.getByLabel('Add content tile').getByText('Pages', { exact: true });
    this.tileName = page.getByRole('textbox', { name: 'Tile title' });
    this.addToHomeButton = page.getByRole('button', { name: 'Add to home' });
    this.siteRadioButton = page.getByRole('radio', { name: 'Site', exact: true });
    this.clickingOnSiteField = page.locator('input.ReactSelectInput-inputField[role="combobox"]');
    this.showcaseRadioButton = page.getByRole('radio', { name: 'Showcase' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.textHtmlLinksTab = page.getByRole('button', { name: 'Text, HTML & links' });
    this.sitesCategoryTab = page.getByRole('button', { name: 'Sites & categories' });
    this.textTileDescriptionInput = page
      .getByRole('textbox', { name: /description/i })
      .or(page.locator('[contenteditable="true"]').first());
    this.siteSearchInput = page.locator('input.ReactSelectInput-inputField[role="combobox"]');
    this.siteOption = (siteName: string) =>
      page
        .locator('div[class*="option"], div[class*="Option"]')
        .filter({ hasText: new RegExp(siteName, 'i') })
        .first();
  }

  async selectingPagesAsContentType(): Promise<void> {
    await this.clickOnElement(this.selectingPagesAsContentTypeOption);
  }

  async namingTheTile(tileName: string): Promise<void> {
    await this.fillInElement(this.tileName, tileName);
  }

  async clickingOnAddToHomeButton(): Promise<void> {
    await this.clickOnElement(this.addToHomeButton);
  }
  async selectingSiteRadioButton(siteName: string): Promise<void> {
    await this.clickOnElement(this.siteRadioButton);
    await this.clickOnElement(this.clickingOnSiteField, { delay: 2000 });
    // await this.fillInElement(this.clickingOnSiteField, siteName);
    await this.page.keyboard.type(siteName);
    await this.page.waitForTimeout(2000);
    await this.page.keyboard.press('Enter');
  }
  async selectingShowcaseRadioButton(): Promise<void> {
    await this.clickOnElement(this.showcaseRadioButton);
  }
  async clickingOnSaveButton(): Promise<void> {
    await this.clickOnElement(this.saveButton);
  }

  async clickTextHtmlLinksTab(): Promise<void> {
    await test.step('Click on Text/HTML & Links tab', async () => {
      await this.clickOnElement(this.textHtmlLinksTab);
    });
  }

  async clickSitesCategoryTab(): Promise<void> {
    await test.step('Click on Sites & Category tab', async () => {
      await this.clickOnElement(this.sitesCategoryTab);
    });
  }

  async enterTextTileDescription(description: string): Promise<void> {
    await test.step(`Enter description for text tile: ${description}`, async () => {
      await this.clickOnElement(this.textTileDescriptionInput);
      await this.fillInElement(this.textTileDescriptionInput, description);
    });
  }

  async searchAndSelectSite(siteName: string): Promise<void> {
    await test.step(`Search and select site: ${siteName}`, async () => {
      await this.clickOnElement(this.siteSearchInput);
      await this.fillInElement(this.siteSearchInput, siteName);
      const siteOptionLocator = this.siteOption(siteName);
      await this.verifier.verifyTheElementIsVisible(siteOptionLocator, {
        assertionMessage: `Site option "${siteName}" should be visible`,
      });
      await this.clickOnElement(siteOptionLocator);
    });
  }
}
