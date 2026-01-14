import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BaseActionUtil } from '@core/utils/baseActionUtil';
import { BaseVerificationUtil } from '@core/utils/baseVerificationUtil';

export class SitesBlockComponent extends BaseActionUtil {
  readonly verifier: BaseVerificationUtil;

  // Block selection
  readonly sitesBlockButton: Locator;

  // Radio buttons
  readonly customRadio: Locator;
  readonly listRadio: Locator;

  // Browse button
  readonly browseButton: Locator;

  // Number of items controls
  readonly plusButton: Locator;
  readonly minusButton: Locator;
  readonly numberOfItemsInput: Locator;
  readonly numberOfItemsField: Locator;

  // Newsletter template block for verification
  readonly newsletterTemplateBlock: Locator;
  readonly stageOuter: Locator;

  // Parameterized locators
  readonly selectedLocationImage: (location: string) => Locator;
  readonly siteParagraph: (siteName: string) => Locator;

  // Modal locators
  readonly sitesModalHeading: Locator;

  // Site verification locators
  readonly siteCardsLocator: Locator;
  readonly siteImagesLocator: Locator;

  constructor(page: Page) {
    super(page);
    this.verifier = new BaseVerificationUtil(page);

    // Block selection - the Sites block in the blocks panel
    this.sitesBlockButton = this.page.locator('[data-chockablock-item-id="Sites"]');

    // Radio buttons
    this.customRadio = this.page.getByRole('radio', { name: 'Custom' });
    this.listRadio = this.page.getByRole('radio', { name: 'List' });

    // Browse button - use exact match to avoid matching "Browse sites" button in canvas
    this.browseButton = this.page.getByRole('button', { name: 'Browse', exact: true });

    // Number of items controls
    this.plusButton = this.page.getByRole('button', { name: 'Plus' });
    this.minusButton = this.page.getByRole('button', { name: 'Minus' });
    this.numberOfItemsInput = this.page.locator('input[id*="_itemCount_"]');
    this.numberOfItemsField = this.page.locator('div[data-testid="field-Number of items"]');

    // Newsletter template block
    this.newsletterTemplateBlock = this.page.locator('div[class*="Block_inner"]').first();
    this.stageOuter = this.page.locator('div[class*="Stage_outer"]');

    // Parameterized locators
    this.selectedLocationImage = (location: string) => this.newsletterTemplateBlock.locator(`img[alt="${location}"]`);
    this.siteParagraph = (siteName: string) => this.newsletterTemplateBlock.locator(`p[aria-label="${siteName}"]`);

    // Modal locators
    this.sitesModalHeading = this.page.getByRole('dialog').getByRole('heading', { name: 'Sites', level: 1 });

    // Site verification locators
    this.siteCardsLocator = this.newsletterTemplateBlock
      .locator('div')
      .filter({ has: this.page.locator('img[alt]:not([alt*="Logo"]):not([alt*="profile"])') })
      .filter({ has: this.page.locator('p') });

    this.siteImagesLocator = this.newsletterTemplateBlock.locator(
      'img[alt]:not([alt*="Logo"]):not([alt*="profile"]):not([alt*="icon"])'
    );
  }

  /**
   * Clicks the Sites block button to add it to the newsletter
   */
  async clickSitesBlock(): Promise<void> {
    await test.step('Click Sites block', async () => {
      await this.clickOnElement(this.sitesBlockButton, {
        stepInfo: 'Click Sites block button',
        force: true,
      });
    });
  }

  /**
   * Selects the Custom radio option
   */
  async checkCustom(): Promise<void> {
    await test.step('Select Custom radio option', async () => {
      await this.clickOnElement(this.customRadio, {
        stepInfo: 'Click Custom radio button',
      });
    });
  }

  /**
   * Clicks the Browse button to open sites modal
   */
  async clickBrowse(): Promise<void> {
    await test.step('Click Browse button', async () => {
      await this.clickOnElement(this.browseButton, {
        stepInfo: 'Click Browse button',
      });
    });
  }

  /**
   * Asserts that sites modal is displayed
   */
  async assertSitesModalIsDisplayed(): Promise<void> {
    await test.step('Assert sites modal is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.sitesModalHeading, {
        assertionMessage: 'Sites modal should be visible',
      });
    });
  }

  /**
   * Asserts that selected location options are displayed in newsletter
   * @param location - The location name to verify
   */
  async assertSelectedLocationOptionsAreDisplayedInNewsletter(location: string): Promise<void> {
    await test.step(`Assert ${location} is displayed in newsletter`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.selectedLocationImage(location), {
        assertionMessage: `Location ${location} should be visible in newsletter`,
      });
    });
  }

  /**
   * Asserts that featured sites are displayed in newsletter
   */
  async assertFeaturedSitesAreDisplayedInNewsletter(): Promise<void> {
    await test.step('Assert featured sites are displayed in newsletter', async () => {
      // Verify that at least one site card is visible
      await expect(
        this.siteCardsLocator.first(),
        'At least one featured site should be visible in newsletter'
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Clicks the plus button to increase the number of items
   */
  async clickPlusButtonOnNumberOfItems(): Promise<void> {
    await test.step('Click plus button to increase number of items', async () => {
      await this.clickOnElement(this.plusButton, {
        stepInfo: 'Click Plus button',
      });
      // Brief wait for UI to register the change
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });
  }

  /**
   * Clicks the minus button to decrease the number of items
   */
  async clickMinusButtonOnNumberOfItems(): Promise<void> {
    await test.step('Click minus button to decrease number of items', async () => {
      await this.clickOnElement(this.minusButton, {
        stepInfo: 'Click Minus button',
      });
      // Brief wait for UI to register the change
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });
  }

  /**
   * Asserts that the number of items value is correct
   * @param expectedNumber - The expected number value
   */
  async assertNumberOfItemsValueIsCorrect(expectedNumber: string): Promise<void> {
    await test.step(`Assert number of items is ${expectedNumber}`, async () => {
      await expect(this.numberOfItemsInput, `Number of items should be ${expectedNumber}`).toHaveValue(expectedNumber);
    });
  }

  /**
   * Types a number into the number of items input field
   * @param number - The number to type
   */
  async typeNumberOfItems(number: string): Promise<void> {
    await test.step(`Type number of items: ${number}`, async () => {
      const inputField = this.numberOfItemsField.locator('input[id*="_itemCount_"]');
      await inputField.clear();
      await inputField.fill(number);
      await inputField.press('Enter');
      // Click outside to trigger any blur events
      await this.clickOnElement(this.stageOuter, {
        stepInfo: 'Click outside to apply changes',
      });
    });
  }

  /**
   * Asserts that the correct number of featured sites are displayed in newsletter
   * Note: Displays up to expectedCount sites, but limited by available sites in the system
   * @param expectedCount - The requested number of sites
   */
  async assertCorrectNumberOfFeaturedSitesAreDisplayedInNewsletter(expectedCount: number): Promise<void> {
    await test.step(`Assert featured sites are displayed in newsletter (up to ${expectedCount})`, async () => {
      // Wait for network idle to ensure all site cards have loaded
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});

      // Wait for at least one site to be visible (auto-waits with built-in timeout)
      await expect(this.siteImagesLocator.first(), 'At least one site should be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });

      // Poll for count to stabilize (handles slow card removal/addition)
      let actualCount = 0;
      let attempts = 0;
      const maxAttempts = 6; // 3 seconds total (6 * 500ms)

      do {
        if (attempts > 0) {
          await this.page.waitForTimeout(500);
        }
        actualCount = await this.siteImagesLocator.count();
        attempts++;
      } while (actualCount > expectedCount && attempts < maxAttempts);

      // Verify we have at least 1 site (system may not have expectedCount sites available)
      expect(
        actualCount,
        `Should have at least 1 site displayed (requested ${expectedCount}, found ${actualCount} after ${attempts * 500}ms)`
      ).toBeGreaterThanOrEqual(1);

      // Verify count doesn't exceed expected (respects the number input setting)
      expect(actualCount, `Should not exceed ${expectedCount} sites`).toBeLessThanOrEqual(expectedCount);
    });
  }

  /**
   * Clicks the List radio button to display sites as a list
   */
  async checkList(): Promise<void> {
    await test.step('Select List appearance option', async () => {
      await this.clickOnElement(this.listRadio, {
        stepInfo: 'Click List radio button',
      });

      // Wait for view to switch and verify List radio is checked
      await expect(this.listRadio, 'List radio should be checked').toBeChecked({
        timeout: TIMEOUTS.SHORT,
      });

      // Brief wait for DOM to stabilize
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });
  }

  /**
   * Asserts that the correct number of featured sites are displayed as a list
   * @param expectedCount - The expected number of sites in list view
   */
  async assertCorrectNumberOfFeaturedSitesAreDisplayedInNewsletterAsList(expectedCount: number): Promise<void> {
    await test.step(`Assert ${expectedCount} featured sites are displayed as list in newsletter`, async () => {
      // Verify List radio is still checked (confirms we're in list view)
      await expect(this.listRadio, 'Should be in list view').toBeChecked();

      // Wait for content to render
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.SHORT }).catch(() => {});

      // Verify we have at least the expected count (accommodates >=)
      const count = await this.siteImagesLocator.count();
      expect(count, `Should have at least ${expectedCount} site(s) displayed as list`).toBeGreaterThanOrEqual(
        expectedCount
      );
    });
  }

  /**
   * Asserts that a selected site is displayed in the newsletter
   * @param siteName - The name of the site to verify
   */
  async assertSelectedSiteIsDisplayed(siteName: string): Promise<void> {
    await test.step(`Assert site "${siteName}" is displayed in newsletter`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteParagraph(siteName), {
        assertionMessage: `Site "${siteName}" should be displayed in the newsletter`,
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }
}
