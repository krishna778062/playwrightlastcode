import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class AddContentTileComponent extends BaseComponent {
  readonly selectingPagesAsContentTypeOption: Locator;
  readonly tileName: Locator;
  readonly addToHomeButton: Locator;
  readonly siteRadioButton: Locator;
  readonly clickingOnSiteField: Locator;
  readonly showcaseRadioButton: Locator;
  readonly saveButton: Locator;
  constructor(readonly page: Page) {
    super(page);
    this.selectingPagesAsContentTypeOption = page.getByLabel('Add content tile').getByText('Pages', { exact: true });
    this.tileName = page.getByRole('textbox', { name: 'Tile title' });
    this.addToHomeButton = page.getByRole('button', { name: 'Add to home' });
    this.siteRadioButton = page.getByRole('radio', { name: 'Site', exact: true });
    this.clickingOnSiteField = page.locator('input.ReactSelectInput-inputField[role="combobox"]');
    this.showcaseRadioButton = page.getByRole('radio', { name: 'Showcase' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
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
}
