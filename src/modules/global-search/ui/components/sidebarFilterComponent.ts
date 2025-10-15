import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

/**
 * Reusable sidebar filter component for different filter types (Sites, Pages, Albums, etc.)
 */
export class SidebarFilterComponent extends BaseComponent {
  private readonly filterText: string;
  private readonly siteName: string | undefined;
  private readonly filterIcon: Locator;
  private readonly filterButton: Locator;
  private readonly countSection: Locator;
  private originalCount: number;

  // Site subfilter locators
  private readonly siteSubFilterButton: Locator;
  private readonly siteSubFilterDownArrow: Locator;
  private readonly siteInput: Locator;
  private readonly autocompleteList: Locator;
  private readonly siteItem: Locator;
  private readonly siteThumbnail: Locator;
  private readonly clearButton: Locator;
  private readonly resultsCount: Locator;
  private readonly resetButton: Locator;

  // Department subfilter locators
  private readonly departmentSubFilterButton: Locator;
  private readonly departmentSubFilterDownArrow: Locator;
  private readonly departmentInput: Locator;

  // Location subfilter locators
  private readonly locationSubFilterButton: Locator;
  private readonly locationSubFilterDownArrow: Locator;
  private readonly locationInput: Locator;

  // Expertise subfilter locators
  private readonly expertiseSubFilterButton: Locator;
  private readonly expertiseSubFilterDownArrow: Locator;
  private readonly expertiseInput: Locator;

  constructor(page: Page, options: { filterText: string; iconType?: string; siteName?: string }) {
    super(page);
    this.filterText = options.filterText;
    this.siteName = options.siteName;
    this.originalCount = 0;

    this.filterButton = this.page.locator(`[class*="SourceButton_sourceButton"]`).filter({
      hasText: this.filterText,
    });
    this.filterIcon = this.filterButton.locator(
      `[data-testid="i-${options.iconType || options.filterText.toLowerCase()}"]`
    );
    this.countSection = this.filterButton.locator(`div[class*="SourceButton_countSection"] span`);

    // Initialize site subfilter locators
    this.siteSubFilterButton = this.page.getByRole('button', { name: 'Site' });
    this.siteSubFilterDownArrow = this.siteSubFilterButton.locator('[data-testid="i-arrowDown"]');
    this.siteInput = this.page.getByRole('textbox', { name: 'Select...' });
    this.autocompleteList = this.page.locator('[class*="CustomFilter_radioListContainer"]');
    this.siteItem = this.autocompleteList.locator('h4').filter({ hasText: this.siteName });
    this.siteThumbnail = this.page.locator(
      `//div[contains(@class,'CustomFilter_radioListContainer')]/descendant::h4[text()='${this.siteName}']/../../descendant::i[@data-testid='i-sites']`
    );
    this.clearButton = this.page.locator('[data-testid="i-crossThick"]');
    this.resultsCount = this.page
      .locator('h2')
      .locator('+ span')
      .filter({ hasText: /\(\d+\)/ });
    this.resetButton = this.page.getByRole('button', { name: 'Reset' });

    // Initialize department subfilter locators
    this.departmentSubFilterButton = this.page.getByRole('button', { name: 'Department' });
    this.departmentSubFilterDownArrow = this.departmentSubFilterButton.locator('[data-testid="i-arrowDown"]');
    this.departmentInput = this.page.locator('#department-search');

    // Initialize location subfilter locators
    this.locationSubFilterButton = this.page.getByRole('button', { name: 'Location' });
    this.locationSubFilterDownArrow = this.locationSubFilterButton.locator('[data-testid="i-arrowDown"]');
    this.locationInput = this.page.locator('#location-search');

    // Initialize expertise subfilter locators
    this.expertiseSubFilterButton = this.page.getByRole('button', { name: 'Expertise' });
    this.expertiseSubFilterDownArrow = this.expertiseSubFilterButton.locator('[data-testid="i-arrowDown"]');
    this.expertiseInput = this.page.locator('#expertise-search');
  }

  /**
   * Verifies the filter is displayed in the sidebar
   * @param options - Options for the step
   */
  async verifyFilterDisplayedInSidebar(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(
      options?.stepInfo || `Verify ${this.filterText} filter is displayed in sidebar`,
      async () => {
        await this.verifier.verifyTheElementIsVisible(this.filterButton, {
          timeout: 10000,
          assertionMessage: `Verifying ${this.filterText} filter button is visible in sidebar`,
        });
      }
    );
  }

  /**
   * Verifies the filter icon is displayed
   * @param options - Options for the step
   */
  async verifyFilterIconDisplayed(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `Verify ${this.filterText} filter icon is displayed`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.filterIcon, {
        timeout: 10000,
        assertionMessage: `Verifying ${this.filterText} filter icon is visible`,
      });
    });
  }

  /**
   * Verifies the count is displayed for the filter and is not 0
   * @param expectedCount - Expected count value (optional)
   * @param options - Options for the step
   */
  async verifyCountDisplayed(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `Verify count is displayed for ${this.filterText} filter`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.countSection, {
        timeout: 10000,
        assertionMessage: `Verifying count section is visible for ${this.filterText} filter`,
      });

      // Verify count is not 0
      const countText = await this.countSection.textContent();
      if (parseInt(countText || '0', 10) === 0) {
        throw new Error(`Expected count to be greater than 0, but found: ${countText}`);
      }
    });
  }

  /**
   * Clicks on the filter button
   * @param options - Options for the step
   */
  async clickOnFilter(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `Click on ${this.filterText} filter`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.filterButton, {
        timeout: 10000,
        assertionMessage: `Verifying ${this.filterText} filter button is visible before clicking`,
      });
      await this.clickOnElement(this.filterButton);
    });
  }

  /**
   * Complete filter verification and click workflow
   * @param options - Options for the step
   */
  async verifyAndClickFilter(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(
      options?.stepInfo || `Complete ${this.filterText} filter verification and click`,
      async () => {
        await this.verifyFilterDisplayedInSidebar();
        await this.verifyFilterIconDisplayed();
        await this.verifyCountDisplayed();
        await this.clickOnFilter();
      }
    );
  }

  /**
   * Verifies site subfilter button is displayed
   * @param options - Options for the step
   */
  async verifySiteSubFilterButtonDisplayed(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || 'Verify site subfilter button is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteSubFilterButton.last(), {
        timeout: 10000,
        assertionMessage: 'Verifying site subfilter button is visible',
      });
    });
  }

  /**
   * Verifies site subfilter down arrow is displayed
   * @param options - Options for the step
   */
  async verifySiteSubFilterDownArrowDisplayed(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || 'Verify site subfilter down arrow is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteSubFilterDownArrow, {
        timeout: 10000,
        assertionMessage: 'Verifying site subfilter down arrow is visible',
      });
    });
  }

  /**
   * Clicks on the down arrow to open the site subfilter
   * @param options - Options for the step
   */
  async clickSiteSubFilterButton(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || 'Click site subfilter down arrow', async () => {
      await this.clickOnElement(this.siteSubFilterButton.last());
    });
  }

  /**
   * Verifies site input field is displayed and fills it with site name
   * @param siteName - The name of the site to search for
   * @param options - Options for the step
   */
  async verifyAndFillSiteInput(siteName: string, options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `Verify and fill site input with "${siteName}"`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteInput, {
        timeout: 10000,
        assertionMessage: 'Verifying site input field is visible',
      });
      await this.siteInput.fill(siteName);
    });
  }

  /**
   * Verifies clear button is displayed after inputting site name
   * @param options - Options for the step
   */
  async verifyClearButtonDisplayed(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || 'Verify clear button is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.clearButton.last(), {
        timeout: 10000,
        assertionMessage: 'Verifying clear button is visible after inputting site name',
      });
    });
  }

  /**
   * Gets the current results count
   * @param options - Options for the step
   * @returns Promise<number> - The current results count
   */
  async getCurrentResultsCount(options?: { stepInfo?: string }): Promise<number> {
    return await test.step(options?.stepInfo || 'Get current results count', async () => {
      await this.verifier.verifyTheElementIsVisible(this.resultsCount, {
        timeout: 10000,
        assertionMessage: 'Verifying results count is visible',
      });

      const countText = await this.resultsCount.textContent();
      return parseInt(countText?.replace(/[()]/g, '') || '0', 10);
    });
  }

  /**
   * Verifies the results count is displayed and matches expected count
   * @param expectedCount - Expected number of results
   * @param options - Options for the step
   */
  async verifyResultsCount(expectedCount: number, options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `Verify results count is ${expectedCount}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.resultsCount, {
        timeout: 10000,
        assertionMessage: 'Verifying results count is visible',
      });

      const countText = await this.resultsCount.textContent();
      const actualCount = parseInt(countText?.replace(/[()]/g, '') || '0', 10);
      console.log('actualCount', actualCount);
      console.log('expectedCount', expectedCount);

      if (actualCount !== expectedCount) {
        throw new Error(`Expected results count to be ${expectedCount}, but found: ${actualCount} (${countText})`);
      }
    });
  }

  /**
   * Verifies autocomplete list is displayed
   * @param options - Options for the step
   */
  async verifyAutocompleteListDisplayed(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || 'Verify autocomplete list is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.autocompleteList.first(), {
        timeout: 10000,
        assertionMessage: 'Verifying autocomplete list is visible',
      });
    });
  }

  /**
   * Verifies specific site is displayed in autocomplete list
   * @param siteName - The name of the site to verify
   * @param options - Options for the step
   */
  async verifySiteInAutocompleteList(siteName: string, options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `Verify site "${siteName}" is in autocomplete list`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteItem, {
        timeout: 10000,
        assertionMessage: `Verifying site "${siteName}" is displayed in autocomplete list`,
      });
    });
  }

  /**
   * Verifies site thumbnail is displayed in autocomplete list
   * @param siteName - The name of the site to verify thumbnail for
   * @param options - Options for the step
   */
  async verifySiteThumbnailInAutocompleteList(siteName: string, options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `Verify site thumbnail for "${siteName}"`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteThumbnail, {
        timeout: 10000,
        assertionMessage: `Verifying site thumbnail is displayed for "${siteName}"`,
      });
    });
  }

  /**
   * Clicks on the specific site in autocomplete list
   * @param siteName - The name of the site to click
   * @param options - Options for the step
   */
  async clickSiteInAutocompleteList(siteName: string, options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `Click site "${siteName}" in autocomplete list`, async () => {
      await this.clickOnElement(this.siteItem);
    });
  }

  /**
   * Verifies reset button is displayed
   * @param options - Options for the step
   */
  async verifyResetButtonDisplayed(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || 'Verify reset button is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.resetButton, {
        timeout: 10000,
        assertionMessage: 'Verifying reset button is visible',
      });
    });
  }

  /**
   * Complete site subfilter workflow with all verifications
   * @param siteName - The name of the site to select
   * @param expectedResultsCount - Expected number of results after filtering
   */
  async verifyAndClickSiteSubFilter(): Promise<number> {
    return await test.step(`Complete site subfilter workflow for "${this.siteName}"`, async () => {
      // Store original count before filtering
      this.originalCount = await this.getCurrentResultsCount();
      console.log('originalCount', this.originalCount);
      await this.verifySiteSubFilterButtonDisplayed();
      await this.verifySiteSubFilterDownArrowDisplayed();
      await this.clickSiteSubFilterButton();
      await this.verifyAndFillSiteInput(this.siteName!);
      await this.verifyClearButtonDisplayed();
      await this.verifyAutocompleteListDisplayed();
      await this.verifySiteInAutocompleteList(this.siteName!);
      await this.verifySiteThumbnailInAutocompleteList(this.siteName!);
      await this.clickSiteInAutocompleteList(this.siteName!);
      await this.verifyResetButtonDisplayed();
      return this.originalCount;
    });
  }

  /**
   * Complete site subfilter workflow with count tracking and reset verification
   * @param siteName - The name of the site to select
   * @returns Promise<number> - The original count before filtering
   */
  async verifySiteSubFilterWithCountTracking(options: {
    stepInfo?: string;
    expectedCountAfterFilter: number;
    originalCount: number;
  }): Promise<void> {
    return await test.step(`verify count matching with expected count before and after resetting`, async () => {
      // Verify the current count matches the expected count after filtering
      await this.verifyResultsCount(options.expectedCountAfterFilter);
      if (await this.resetButton.isVisible()) {
        await this.clickResetButton();
        await this.verifyResultsCount(options.originalCount);
      }
    });
  }

  /**
   * Generic people subfilter workflow with count tracking and reset verification
   * @param options - Options including filter name, expected count after filter and original count
   */
  async verifyPeopleSubFilterWithCountTracking(options: {
    filterName: string;
    stepInfo?: string;
    expectedCountAfterFilter: number;
    originalCount: number;
  }): Promise<void> {
    return await test.step(
      options.stepInfo || `verify people filter count matching with expected count before and after resetting`,
      async () => {
        // Verify the current count matches the expected count after filtering
        await this.verifyResultsCount(options.expectedCountAfterFilter);
        if (await this.resetButton.isVisible()) {
          await this.clickSpecificResetButton(options.filterName);
          // Verify count is back to original
          await this.verifyResultsCount(options.originalCount);
        }
      }
    );
  }

  /**
   * Gets the specific reset button for a filter name
   * @param filterName - The name of the filter (Department, Location, Expertise)
   * @returns Locator - The specific reset button locator
   */
  private getSpecificResetButton(filterName: string): Locator {
    return this.page.locator(`div:has(div:has-text("${filterName}")) button:has-text("Reset")`);
  }

  /**
   * Clicks on the reset button
   * @param options - Options for the step
   */
  async clickResetButton(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || 'Click reset button', async () => {
      await this.clickOnElement(this.resetButton);
    });
  }

  /**
   * Clicks on the specific reset button for a filter name
   * @param filterName - The name of the filter (Department, Location, Expertise)
   * @param options - Options for the step
   */
  async clickSpecificResetButton(filterName: string, options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `Click reset button for ${filterName}`, async () => {
      const specificResetButton = this.getSpecificResetButton(filterName);
      await this.clickOnElement(specificResetButton);
    });
  }

  /**
   * Complete department subfilter workflow with all verifications
   * @param departmentName - The name of the department to select
   * @returns Promise<number> - The original count before filtering
   */
  async verifyAndClickDepartmentSubFilter(filterName: string, departmentName: string): Promise<number> {
    return await test.step(`Complete department subfilter workflow for "${departmentName}"`, async () => {
      // Store original count before filtering
      this.originalCount = await this.getCurrentResultsCount();
      console.log('originalCount', this.originalCount);

      await this.verifier.verifyTheElementIsVisible(this.departmentSubFilterButton.last(), {
        timeout: 10000,
        assertionMessage: 'Verifying department subfilter button is visible',
      });

      await this.verifier.verifyTheElementIsVisible(this.departmentSubFilterDownArrow, {
        timeout: 10000,
        assertionMessage: 'Verifying department subfilter down arrow is visible',
      });

      await this.clickOnElement(this.departmentSubFilterButton.last());

      // Check if input field is visible, if not, directly select from list
      const isInputVisible = await this.departmentInput.isVisible();

      if (isInputVisible) {
        await this.verifier.verifyTheElementIsVisible(this.departmentInput, {
          timeout: 10000,
          assertionMessage: 'Verifying department input field is visible',
        });
        await this.departmentInput.fill(departmentName);

        await this.verifier.verifyTheElementIsVisible(this.clearButton.last(), {
          timeout: 10000,
          assertionMessage: 'Verifying clear button is visible after inputting department name',
        });
      }

      await this.verifier.verifyTheElementIsVisible(this.autocompleteList.first(), {
        timeout: 10000,
        assertionMessage: 'Verifying autocomplete list is visible',
      });

      const departmentItem = this.autocompleteList.locator('h4').filter({ hasText: departmentName });
      await this.verifier.verifyTheElementIsVisible(departmentItem, {
        timeout: 10000,
        assertionMessage: `Verifying department "${departmentName}" is displayed in autocomplete list`,
      });

      await this.clickOnElement(departmentItem);

      await this.verifier.verifyTheElementIsVisible(this.getSpecificResetButton(filterName), {
        timeout: 10000,
        assertionMessage: 'Verifying reset button is visible',
      });

      return this.originalCount;
    });
  }

  /**
   * Complete location subfilter workflow with all verifications
   * @param locationName - The name of the location to select
   * @returns Promise<number> - The original count before filtering
   */
  async verifyAndClickLocationSubFilter(filterName: string, locationName: string): Promise<number> {
    return await test.step(`Complete location subfilter workflow for "${locationName}"`, async () => {
      // Store original count before filtering
      this.originalCount = await this.getCurrentResultsCount();
      console.log('originalCount', this.originalCount);

      await this.verifier.verifyTheElementIsVisible(this.locationSubFilterButton.last(), {
        timeout: 10000,
        assertionMessage: 'Verifying location subfilter button is visible',
      });

      await this.verifier.verifyTheElementIsVisible(this.locationSubFilterDownArrow, {
        timeout: 10000,
        assertionMessage: 'Verifying location subfilter down arrow is visible',
      });

      await this.clickOnElement(this.locationSubFilterButton.last());

      // Check if input field is visible, if not, directly select from list
      const isInputVisible = await this.locationInput.isVisible();

      if (isInputVisible) {
        await this.verifier.verifyTheElementIsVisible(this.locationInput, {
          timeout: 10000,
          assertionMessage: 'Verifying location input field is visible',
        });
        await this.locationInput.fill(locationName);

        await this.verifier.verifyTheElementIsVisible(this.clearButton.last(), {
          timeout: 10000,
          assertionMessage: 'Verifying clear button is visible after inputting location name',
        });
      }

      await this.verifier.verifyTheElementIsVisible(this.autocompleteList.first(), {
        timeout: 10000,
        assertionMessage: 'Verifying autocomplete list is visible',
      });

      const locationItem = this.autocompleteList.locator('h4').filter({ hasText: locationName });
      await this.verifier.verifyTheElementIsVisible(locationItem, {
        timeout: 10000,
        assertionMessage: `Verifying location "${locationName}" is displayed in autocomplete list`,
      });

      await this.clickOnElement(locationItem);

      await this.verifier.verifyTheElementIsVisible(this.getSpecificResetButton(filterName), {
        timeout: 10000,
        assertionMessage: 'Verifying reset button is visible',
      });

      return this.originalCount;
    });
  }

  /**
   * Complete expertise subfilter workflow with all verifications
   * @param expertiseName - The name of the expertise to select
   * @returns Promise<number> - The original count before filtering
   */
  async verifyAndClickExpertiseSubFilter(filterName: string, expertiseName: string): Promise<number> {
    return await test.step(`Complete expertise subfilter workflow for "${expertiseName}"`, async () => {
      // Store original count before filtering
      this.originalCount = await this.getCurrentResultsCount();
      console.log('originalCount', this.originalCount);

      await this.verifier.verifyTheElementIsVisible(this.expertiseSubFilterButton.last(), {
        timeout: 10000,
        assertionMessage: 'Verifying expertise subfilter button is visible',
      });

      await this.verifier.verifyTheElementIsVisible(this.expertiseSubFilterDownArrow, {
        timeout: 10000,
        assertionMessage: 'Verifying expertise subfilter down arrow is visible',
      });

      await this.clickOnElement(this.expertiseSubFilterButton.last());

      // Check if input field is visible, if not, directly select from list
      const isInputVisible = await this.expertiseInput.isVisible();

      if (isInputVisible) {
        await this.verifier.verifyTheElementIsVisible(this.expertiseInput, {
          timeout: 10000,
          assertionMessage: 'Verifying expertise input field is visible',
        });
        await this.expertiseInput.fill(expertiseName);

        await this.verifier.verifyTheElementIsVisible(this.clearButton.last(), {
          timeout: 10000,
          assertionMessage: 'Verifying clear button is visible after inputting expertise name',
        });
      }

      await this.verifier.verifyTheElementIsVisible(this.autocompleteList.first(), {
        timeout: 10000,
        assertionMessage: 'Verifying autocomplete list is visible',
      });

      const expertiseItem = this.autocompleteList.locator('h4').filter({ hasText: expertiseName });
      await this.verifier.verifyTheElementIsVisible(expertiseItem, {
        timeout: 10000,
        assertionMessage: `Verifying expertise "${expertiseName}" is displayed in autocomplete list`,
      });

      await this.clickOnElement(expertiseItem);

      await this.verifier.verifyTheElementIsVisible(this.getSpecificResetButton(filterName), {
        timeout: 10000,
        assertionMessage: 'Verifying reset button is visible',
      });

      return this.originalCount;
    });
  }
}
