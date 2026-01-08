import { Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

export class NewsletterHomePagePage extends BasePage {
  // Page Header
  readonly pageTitle: Locator;

  // Search
  private readonly searchContainer: Locator;
  readonly searchInput: Locator;
  readonly searchClearButton: Locator;

  // Table
  readonly tableRows: Locator;
  readonly fromAddressHeaderButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_NEWSLETTER_PAGE);

    // Page Header
    this.pageTitle = this.page.locator('h1[class*="PageContainer-module__title"]');

    // Search
    this.searchContainer = this.page.locator('div[class*="TextInput-module__wrapper"]');
    this.searchInput = this.searchContainer.getByRole('textbox', { name: /search/i });
    this.searchClearButton = this.searchContainer.locator('button[aria-label="Clear"]');

    // Table
    const tableElement = this.page.locator('[class*="Table-module__table"]');
    const tableHeaders = tableElement.locator('thead');
    this.fromAddressHeaderButton = tableHeaders.getByRole('button', { name: 'From address' });
    this.tableRows = this.page.locator('[data-testid^="dataGridRow-"]');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.searchInput, {
      timeout: TIMEOUTS.SHORT,
      assertionMessage: 'Newsletter Home page is not loaded properly',
    });
  }

  async clearSearchInput(): Promise<void> {
    const currentValue = await this.searchInput.inputValue();
    if (currentValue) {
      await this.fillInElement(this.searchInput, '');
    }
    if (await this.searchClearButton.isVisible()) {
      await this.clickOnElement(this.searchClearButton, {
        stepInfo: 'Clear newsletter search input',
      });
    }
  }

  async assertFromAddressColumnVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.fromAddressHeaderButton, {
      assertionMessage: 'From address column header should be visible in newsletters table',
    });
  }

  async assertTableHasResults(): Promise<void> {
    await this.verifier.verifyCountOfElementsIsGreaterThanOrEqualTo(this.tableRows, 1, {
      assertionMessage: 'Expected at least one newsletter to be visible in the table',
    });
  }

  async assertPageTitleIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.pageTitle, {
      assertionMessage: 'Newsletter page title should be visible',
    });
  }
}
