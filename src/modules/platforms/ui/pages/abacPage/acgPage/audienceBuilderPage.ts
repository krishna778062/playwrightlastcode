import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

// Page Object Model for the Audience Builder page with filters functionality
export class AudienceBuilderPage extends BasePage {
  // Page elements
  labelAudienceBuilder: Locator;
  filtersButton: Locator;
  filterContainer: Locator;
  closeButton: Locator;
  public btnExactText: (buttonName: string) => Locator;
  public filterName: (filterName: string) => Locator;
  public filterOptionName: (filterOptionName: string) => Locator;
  public appliedFilterRailLabel: (label: string) => Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.AUDIENCE_RULE_PAGE) {
    super(page, pageUrl);
    const pageContainer = page.getByTestId('pageContainer-page');

    // Page title/heading
    this.labelAudienceBuilder = pageContainer.locator('header h1').filter({ hasText: 'Audiences' });

    // Filter elements
    this.filtersButton = pageContainer.getByRole('button', { name: 'filters' });
    this.filterContainer = page.locator('xpath=//div[contains(@class, "Dialog-module__children")]');
    this.closeButton = page.locator('button[aria-label="Close"]');
    // Any button by text using contains() - replace static text with provided value
    this.btnExactText = (btnName: string) => this.page.locator(`//button[text()="${btnName}"]`);
    this.filterName = (name: string) => this.filterContainer.locator('button h3', { hasText: name });
    this.filterOptionName = (name: string) =>
      this.filterContainer.locator('[role="region"][data-state="open"]').getByText(name, { exact: true });
    // Applied filter rail (visible on page after applying filters) - label appears inside a span
    this.appliedFilterRailLabel = (label: string) => pageContainer.locator('span', { hasText: label });
  }

  // Verify that the Audience Builder page is loaded by checking if 'Audiences' heading is visible
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the audience builder page is loaded', async () => {
      await expect(this.labelAudienceBuilder, 'expecting Audience label to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  // ========== FILTER VERIFICATION METHODS ==========

  /**
   * Generic method to verify element visibility
   * @param element - The locator to verify
   * @param assertionMessage - Custom assertion message
   * @param stepDescription - Optional custom step description
   */
  async verifyElementVisibility(element: Locator, assertionMessage: string, stepDescription?: string): Promise<void> {
    const stepInfo = stepDescription || `Verify element is visible: ${assertionMessage}`;
    await test.step(stepInfo, async () => {
      await this.verifier.verifyTheElementIsVisible(element, {
        assertionMessage,
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Verify the presence of Filters button under audience rule page
   */
  async verifyFiltersButtonPresence(): Promise<void> {
    await this.verifyElementVisibility(this.filtersButton, 'Verify Filters button is visible on audience rule page');
  }

  /**
   * Click on the Filters button
   */
  async clickFiltersButton(): Promise<void> {
    await test.step('Click on Filters button', async () => {
      await this.clickOnElement(this.filtersButton, {
        stepInfo: 'Click Filters button',
      });
    });
  }

  /**
   * Get a filter element by its text content
   * @param filterText - The text content of the filter element
   * @returns Locator for the filter element
   */

  /**
   * Verify the presence of a specific filter element
   * @param filterText - The text content of the filter element to verify
   */
  async verifyFilterElementPresence(filterText: string): Promise<void> {
    const filterElement = this.filterName(filterText);
    await this.verifyElementVisibility(
      filterElement,
      `Verify "${filterText}" filter element is visible after clicking filters`
    );
  }

  /**
   * Click on a specific filter element
   * @param filterText - The text content of the filter element to click
   */
  async clickFilterElement(filterText: string): Promise<void> {
    await test.step(`Click on "${filterText}" filter`, async () => {
      const filterElement = this.filterName(filterText);
      await this.clickOnElement(filterElement, {
        stepInfo: `Click ${filterText} filter`,
      });
    });
  }

  /**
   * Get a filter option element by its text content
   * @param optionText - The text content of the filter option element
   * @returns Locator for the filter option element
   */

  /**
   * Verify the presence of a specific filter option element
   * @param optionText - The text content of the filter option element to verify
   */
  async verifyFilterOptionPresence(optionText: string): Promise<void> {
    const optionElement = this.filterOptionName(optionText);
    await this.verifyElementVisibility(optionElement, `Verify "${optionText}" filter option is visible`);
  }

  /**
   * Click on a specific filter option within an opened filter group
   * @param optionText - The option text to select (e.g., City)
   */
  async clickFilterOption(optionText: string): Promise<void> {
    await test.step(`Click on "${optionText}" filter option`, async () => {
      const optionElement = this.filterOptionName(optionText);
      await this.clickOnElement(optionElement, {
        stepInfo: `Select "${optionText}" option`,
      });
    });
  }

  /**
   * Get the close/cross button locator in the filters dialog
   * @returns Locator for the close button
   */
  getCloseButton(): Locator {
    return this.closeButton;
  }

  /**
   * Verify the presence of the close button in filters dialog
   */
  async verifyCloseButtonPresence(): Promise<void> {
    const closeButton = this.getCloseButton();
    await this.verifyElementVisibility(closeButton, 'Verify close button is visible in filters dialog');
  }

  /**
   * Verify the presence of the View results button in filters dialog
   */
  // Verify a button with provided text is visible in the filters dialog
  async verifyButtonTextPresence(buttonName: string): Promise<void> {
    const button = this.btnExactText(buttonName);
    await this.verifyElementVisibility(button, `Verify "${buttonName}" button is visible in filters dialog`);
  }

  // Click a button (by partial name) within the filters dialog
  async clickButtonText(buttonName: string): Promise<void> {
    await test.step(`Click "${buttonName}" button in filters dialog`, async () => {
      const button = this.btnExactText(buttonName);
      await this.clickOnElement(button, { stepInfo: `Click "${buttonName}" button` });
    });
  }

  // Verify a button with provided text is NOT visible in the filters dialog
  async verifyButtonTextAbsence(buttonName: string): Promise<void> {
    const button = this.btnExactText(buttonName);
    await this.verifier.verifyTheElementIsNotVisible(button, {
      assertionMessage: `Verify "${buttonName}" button is not visible in filters dialog`,
      timeout: TIMEOUTS.SHORT,
    });
  }

  /**
   * Click on the close button to close the filters dialog
   */
  async clickCloseButton(): Promise<void> {
    await test.step('Click on close button to close filters dialog', async () => {
      const closeButton = this.getCloseButton();
      await this.clickOnElement(closeButton, {
        stepInfo: 'Click close button',
      });
    });
  }

  /**
   * Verify that the filters dialog is closed (filters button should be visible again)
   */
  async verifyFiltersDialogClosed(): Promise<void> {
    await test.step('Verify filters dialog is closed', async () => {
      await this.verifyElementVisibility(this.filtersButton, 'Verify filters button is visible after closing dialog');
      await expect(this.filterContainer, 'Verify filters dialog container is not visible').not.toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  async verifyAppliedFilterRailPresence(label: string): Promise<void> {
    await test.step(`Verify applied filter rail shows "${label}"`, async () => {
      const railLabel = this.appliedFilterRailLabel(label);
      await this.verifier.verifyTheElementIsVisible(railLabel, {
        assertionMessage: `Verify applied filter rail label "${label}" is visible`,
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  async verifyAppliedFilterRailAbsence(label: string): Promise<void> {
    await test.step(`Verify applied filter rail for "${label}" is not visible`, async () => {
      const railLabel = this.appliedFilterRailLabel(label);
      await this.verifier.verifyTheElementIsNotVisible(railLabel, {
        assertionMessage: `Verify applied filter rail label "${label}" is not visible`,
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  async clickAppliedFilterRail(label: string): Promise<void> {
    await test.step(`Click applied filter rail "${label}"`, async () => {
      const railLabel = this.appliedFilterRailLabel(label);
      await this.clickOnElement(railLabel, { stepInfo: `Click applied filter rail "${label}"` });
    });
  }
}
