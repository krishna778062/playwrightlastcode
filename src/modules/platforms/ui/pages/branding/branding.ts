import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/ui/pages/basePage';

export class BrandingPage extends BasePage {
  readonly brandingLink: Locator;
  readonly manageBrandingHeading: Locator;
  readonly paletteOption: Locator;
  readonly addColor1Option: Locator;
  readonly nameInput: Locator;
  readonly colorLauncherButton: Locator;
  readonly doneButton: Locator;

  constructor(page: Page) {
    super(page);

    // Locators for branding navigation
    this.brandingLink = page.locator('p', { hasText: 'Branding' });
    this.manageBrandingHeading = page.locator('h3', { hasText: 'Manage branding' });

    // Locators for color palette section
    // Palette option under Manage branding section
    this.paletteOption = page
      .locator('p:has-text("palette"), button:has-text("palette"), [data-testid*="palette"]')
      .first();
    // Add color1 option under Color palette section
    this.addColor1Option = page.locator('//i[@data-testid="i-addOutlined"]').first();

    // Locators for add color form
    this.nameInput = page.locator('input[id="corporateLightColors_name"]');
    this.colorLauncherButton = page.locator('button[class*="InputButtonLauncher-module__launcher"]');
    this.doneButton = page.getByRole('button', { name: 'Done' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the branding page is loaded', async () => {
      await expect(this.manageBrandingHeading).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Navigates to the branding page from manage features
   */
  async navigateToBrandingPage(): Promise<void> {
    await test.step('Navigate to Branding page', async () => {
      await this.clickOnElement(this.brandingLink, {
        stepInfo: 'Click on Branding link',
      });
      await this.verifyThePageIsLoaded();
    });
  }

  /**
   * Clicks on the palette option under Manage branding
   */
  async clickOnPaletteOption(): Promise<void> {
    await test.step('Click on palette option', async () => {
      await this.clickOnElement(this.paletteOption, {
        stepInfo: 'Click on palette under Manage branding',
      });
    });
  }

  /**
   * Clicks on Add color1 option under Color palette
   */
  async clickOnAddColor1Option(): Promise<void> {
    await test.step('Click on Add color1 option', async () => {
      await this.clickOnElement(this.addColor1Option, {
        stepInfo: 'Click on Add color1 under Color palette',
      });
    });
  }

  /**
   * Verifies the presence of the name input field
   */
  async verifyNameInputIsVisible(): Promise<void> {
    await test.step('Verify name input field is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.nameInput, {
        assertionMessage: 'Name input field should be visible',
      });
    });
  }

  /**
   * Verifies the presence of the color launcher button
   */
  async verifyColorLauncherButtonIsVisible(): Promise<void> {
    await test.step('Verify color launcher button is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.colorLauncherButton, {
        assertionMessage: 'Color launcher button should be visible',
      });
    });
  }

  /**
   * Verifies that the Done button is disabled when no data is added to Name and Color fields
   */
  async verifyDoneButtonIsDisabled(): Promise<void> {
    await test.step('Verify Done button is disabled when no data is added', async () => {
      await expect(
        this.doneButton,
        'Done button should be disabled when no data is added to Name and Color fields'
      ).toBeDisabled({
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Navigates to the add color form by clicking palette and Add color1
   */
  async navigateToAddColorForm(): Promise<void> {
    await test.step('Navigate to Add Color form', async () => {
      await this.clickOnPaletteOption();
      await this.clickOnAddColor1Option();
    });
  }
}
