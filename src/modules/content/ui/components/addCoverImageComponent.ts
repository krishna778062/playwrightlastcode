import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class AddCoverImageComponent extends BaseComponent {
  readonly tabsOptions: (tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash' | 'Select color') => Locator;
  readonly openMediaManagerDialog: Locator;
  readonly selectColorTab: Locator;
  readonly brandColorsSection: Locator;
  readonly brandColorButtons: Locator;
  readonly colorSwatches: Locator;
  readonly colorSwatch: (index: number) => Locator;

  constructor(page: Page) {
    super(page);
    this.tabsOptions = (tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash' | 'Select color') =>
      page.getByRole('tab', { name: tab });
    this.openMediaManagerDialog = page.getByRole('button', { name: 'Open media manager dialog' });
    this.selectColorTab = page.getByRole('tab', { name: 'Select color' });
    this.brandColorsSection = page
      .locator('div')
      .filter({ hasText: /^Brand$/ })
      .nth(3);
    this.brandColorButtons = this.brandColorsSection.locator(
      '.relative.inline-flex.items-center.justify-center.border-border-strong.hover\\:border-brand-default.focus-visible\\:border-brand-default.size-6'
    );
    this.colorSwatches = page.locator('.px-3.pb-3 > .flex');
    this.colorSwatch = (index: number) => this.colorSwatches.locator(`button:nth-child(${index})`);
  }

  /**
   * Verifies that the specified tab is visible in the cover image modal
   * @param tab - The tab name to verify ('Upload', 'Browse', 'URL', 'Unsplash', or 'Select color')
   */
  async verifyCoverImageModalTabIsVisible(
    tab: 'Upload' | 'Browse' | 'URL' | 'Unsplash' | 'Select color'
  ): Promise<void> {
    await test.step(`Verify ${tab} tab is visible in cover image modal`, async () => {
      const tabLocator = this.tabsOptions(tab);
      await this.verifier.verifyTheElementIsVisible(tabLocator, {
        assertionMessage: `${tab} tab should be visible`,
      });
    });
  }

  /**
   * Clicks on the "Select color" tab
   * Note: This tab is only visible when "Background overlay" layout is selected
   */
  async clickSelectColorTab(): Promise<void> {
    await test.step('Click on Select color tab', async () => {
      await this.verifier.verifyTheElementIsVisible(this.selectColorTab, {
        assertionMessage: 'Select color tab should be visible',
      });
      await this.clickOnElement(this.selectColorTab);
    });
  }

  /**
   * Verifies that the color palette is visible
   */
  async verifyColorPaletteIsVisible(): Promise<void> {
    await test.step('Verify color palette is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.colorSwatches, {
        assertionMessage: 'Color palette should be visible',
      });
    });
  }

  /**
   * Selects a color from the color palette
   * @param colorIndex - The index of the color to select (default: 1 for first color)
   */
  async selectColorFromPalette(colorIndex: number = 1): Promise<void> {
    await test.step(`Select color from palette at index ${colorIndex}`, async () => {
      const swatch = this.colorSwatch(colorIndex);
      await this.verifier.verifyTheElementIsVisible(swatch, {
        assertionMessage: `Color swatch at index ${colorIndex} should be visible`,
      });
      await this.clickOnElement(swatch);
    });
  }

  /**
   * Selects a brand color from the brand colors section
   * @param brandColorIndex - The index of the brand color to select (default: 0 for first brand color)
   */
  async selectBrandColor(brandColorIndex: number = 0): Promise<void> {
    await test.step(`Select brand color at index ${brandColorIndex}`, async () => {
      const brandColor = this.brandColorButtons.nth(brandColorIndex);
      await this.verifier.verifyTheElementIsVisible(brandColor, {
        assertionMessage: `Brand color at index ${brandColorIndex} should be visible`,
      });
      await this.clickOnElement(brandColor);
    });
  }
}
