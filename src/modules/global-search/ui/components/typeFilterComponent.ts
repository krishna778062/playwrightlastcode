import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { IntranetFileListComponent } from '@/src/modules/global-search/ui/components/intranetFileListComponent';

/**
 * Reusable type filter component for filtering files by type (Document, Presentation, Spreadsheet)
 * Can also be used for other filters like Author by passing the filter name dynamically
 */
export class TypeFilterComponent extends BaseComponent {
  private readonly filterName: string;
  private readonly typeFilterButton: Locator;
  private readonly typeFilterArrow: Locator;
  private readonly typeFilterTitle: Locator;
  private readonly typeFilterOption: (optionText: string) => Locator;
  private readonly typeFilterRadioButton: (optionText: string) => Locator;
  private readonly typeFilterCount: (optionText: string) => Locator;
  private readonly typeFilterGroupCount: Locator;
  private readonly typeFilterClearButton: Locator;
  private readonly searchResultListContainer: Locator;
  private readonly searchResultFirstListItem: Locator;
  private readonly fileResultLocator: (fileName: string) => Locator;
  private readonly peopleSearchInput: Locator;

  /**
   * @param page - Playwright page object
   * @param filterName - The name of the filter (e.g., "Type", "Author").
   */
  constructor(page: Page, filterName: string) {
    super(page);
    this.filterName = filterName;

    this.typeFilterButton = this.page.locator('[class*="FilterGroup-module"]').filter({
      has: this.page.locator('span').filter({ hasText: this.filterName }),
    });

    this.typeFilterArrow = this.typeFilterButton.locator('[data-testid="i-arrowDown"]');

    this.typeFilterTitle = this.page.locator('h3[class*="Typography-module__heading"]').filter({
      hasText: this.filterName,
    });

    this.typeFilterOption = (optionText: string) =>
      this.page.locator('[class*="RadioListInput-module__title"]').filter({ hasText: optionText });

    this.typeFilterRadioButton = (optionText: string) =>
      this.page
        .locator('[class*="RadioListInput-module"]')
        .filter({ has: this.typeFilterOption(optionText) })
        .locator('input[type="radio"]');

    this.typeFilterCount = (optionText: string) =>
      this.page
        .locator('[class*="RadioListInput-module"]')
        .filter({ has: this.typeFilterOption(optionText) })
        .locator('[class*="Typography-module__secondary"]');

    this.typeFilterGroupCount = this.typeFilterButton.locator('[class*="FilterGroup-module__count"]');

    this.typeFilterClearButton = this.page.locator('button[type="reset"]');

    this.searchResultListContainer = this.page.locator("div[class*='ResultListWithSidebar_container']");

    this.searchResultFirstListItem = this.searchResultListContainer.locator('li').first();

    this.fileResultLocator = (fileName: string) =>
      this.searchResultListContainer
        .locator('li')
        .filter({
          has: this.page.locator('h2').filter({ hasText: fileName }),
        })
        .first();

    this.peopleSearchInput = this.page.locator('#people-search');
  }

  /**
   * Verifies filter button is displayed
   * @param options - Options for the step
   */
  async verifyTypeFilterButtonDisplayed(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `Verify ${this.filterName} filter button is displayed`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.typeFilterButton, {
        timeout: 50000,
        assertionMessage: `Verifying ${this.filterName} filter button is visible`,
      });
    });
  }

  /**
   * Verifies filter arrow is displayed
   * @param options - Options for the step
   */
  async verifyTypeFilterArrowDisplayed(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `Verify ${this.filterName} filter arrow is displayed`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.typeFilterArrow, {
        timeout: 10000,
        assertionMessage: `Verifying ${this.filterName} filter arrow is visible`,
      });
    });
  }

  /**
   * Clicks on filter button
   * @param options - Options for the step
   */
  async clickTypeFilterButton(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `Click on ${this.filterName} filter button`, async () => {
      await this.clickOnElement(this.typeFilterButton);
    });
  }

  /**
   * Verifies filter title is displayed
   * @param options - Options for the step
   */
  async verifyTypeFilterTitleDisplayed(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(
      options?.stepInfo || `Verify ${this.filterName} filter title "${this.filterName}" is displayed`,
      async () => {
        await this.verifier.verifyTheElementIsVisible(this.typeFilterTitle, {
          timeout: 10000,
          assertionMessage: `Verifying ${this.filterName} filter title is visible`,
        });
      }
    );
  }

  /**
   * Verifies filter option is displayed (e.g., "Document File", "Presentation File", "Spreadsheet File", or author names)
   * If people-search input is displayed, types the option text in that field
   * @param optionText - The text of the filter option to verify
   * @param options - Options for the step
   */
  async verifyTypeFilterOptionDisplayed(optionText: string, options?: { stepInfo?: string }): Promise<void> {
    return await test.step(
      options?.stepInfo || `Verify ${this.filterName} filter option "${optionText}" is displayed`,
      async () => {
        const isPeopleSearchVisible = await this.verifier.isTheElementVisible(this.peopleSearchInput, {
          timeout: 2000,
        });
        if (isPeopleSearchVisible) {
          await this.fillInElement(this.peopleSearchInput, optionText);
        }
        await this.verifier.verifyTheElementIsVisible(this.typeFilterOption(optionText), {
          timeout: 10000,
          assertionMessage: `Verifying ${this.filterName} filter option "${optionText}" is visible`,
        });
      }
    );
  }

  /**
   * Verifies radio button is displayed beside filter option
   * @param optionText - The text of the filter option
   * @param options - Options for the step
   */
  async verifyTypeFilterRadioButtonDisplayed(optionText: string, options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `Verify radio button is displayed for "${optionText}"`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.typeFilterRadioButton(optionText), {
        timeout: 10000,
        assertionMessage: `Verifying radio button is visible for "${optionText}"`,
      });
    });
  }

  /**
   * Verifies count is displayed beside filter option
   * @param optionText - The text of the filter option
   * @param options - Options for the step
   */
  async verifyTypeFilterCountDisplayed(optionText: string, options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `Verify count is displayed for "${optionText}"`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.typeFilterCount(optionText), {
        timeout: 10000,
        assertionMessage: `Verifying count is visible for "${optionText}"`,
      });
    });
  }

  /**
   * Clicks on filter option radio button
   * @param optionText - The text of the filter option to select
   * @param options - Options for the step
   */
  async clickTypeFilterOption(optionText: string, options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || `Click on "${optionText}" radio button`, async () => {
      await this.clickOnElement(this.typeFilterRadioButton(optionText));
    });
  }

  /**
   * Verifies count displayed in filter box once selected
   * @param expectedCount - Expected count value
   * @param options - Options for the step
   */
  async verifyTypeFilterGroupCount(expectedCount: string, options?: { stepInfo?: string }): Promise<void> {
    return await test.step(
      options?.stepInfo || `Verify ${this.filterName} filter group count is "${expectedCount}"`,
      async () => {
        await this.verifier.verifyTheElementIsVisible(this.typeFilterGroupCount, {
          timeout: 10000,
          assertionMessage: `Verifying ${this.filterName} filter group count is visible`,
        });
        const countText = await this.typeFilterGroupCount.textContent();
        if (countText?.trim() !== expectedCount) {
          throw new Error(
            `Expected ${this.filterName} filter group count to be "${expectedCount}", but found: "${countText?.trim()}"`
          );
        }
      }
    );
  }

  /**
   * Verifies clear button is displayed
   * @param options - Options for the step
   */
  async verifyClearButtonDisplayed(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || 'Verify Clear button is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.typeFilterClearButton, {
        timeout: 10000,
        assertionMessage: 'Verifying Clear button is visible',
      });
      await this.verifier.verifyElementHasText(this.typeFilterClearButton, 'Clear');
    });
  }

  /**
   * Clicks on clear button
   * @param options - Options for the step
   */
  async clickClearButton(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || 'Click on Clear button', async () => {
      await this.clickOnElement(this.typeFilterClearButton);
    });
  }

  /**
   * Verifies count is not visible in filter box after clearing
   * @param options - Options for the step
   */
  async verifyTypeFilterGroupCountNotVisible(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(
      options?.stepInfo || `Verify ${this.filterName} filter group count is not visible`,
      async () => {
        await this.verifier.verifyTheElementIsNotVisible(this.typeFilterGroupCount, {
          timeout: 10000,
          assertionMessage: `Verifying ${this.filterName} filter group count is not visible after clearing`,
        });
      }
    );
  }

  /**
   * Verifies the file name is displayed in the filtered search results
   * @param fileName - The name of the file to verify
   * @param options - Options for the step
   */
  async verifyFileNameIsDisplayedInResults(fileName: string, options?: { stepInfo?: string }): Promise<void> {
    return await test.step(
      options?.stepInfo || `Verify name "${fileName}" is displayed in filtered results`,
      async () => {
        await this.verifier.waitUntilElementIsVisible(this.searchResultFirstListItem, {
          timeout: 10000,
          stepInfo: 'Waiting for search results to be displayed',
        });
        const fileResultItem = new IntranetFileListComponent(this.page, this.fileResultLocator(fileName));
        await fileResultItem.verifyNameIsDisplayed(fileName);
      }
    );
  }
}
