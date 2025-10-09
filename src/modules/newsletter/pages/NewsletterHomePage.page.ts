import { Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS as newsletterEndpoints, PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';

export class NewsletterHomePagePage extends BasePage {
  readonly newsletterContainer: Locator;
  readonly newsletterHeaderContainer: Locator;
  readonly newsletterContainerBody: Locator;

  //Newsletter Header
  readonly newsletterHeaderTitle: Locator;
  readonly newsletterCreateButton: Locator;
  readonly newsletterCreateDropdown: Locator;
  readonly newsletterCreateDropdownItem: Locator;

  //Newsletter Container Body
  readonly searchContainer: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchClearButton: Locator;

  //newsletter template
  readonly newsletterBlankTemplate: Locator;
  readonly newsletterCreateActionButton: Locator;
  readonly newsletterNameInput: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_NEWSLETTER_PAGE);
    this.newsletterContainer = this.page.locator('[data-testid="pageContainer-page"]');
    this.newsletterHeaderContainer = this.newsletterContainer.locator('header');

    this.newsletterContainerBody = this.newsletterContainer.locator('[class*="PageContainer-module__content"]');
    this.newsletterHeaderTitle = this.newsletterHeaderContainer.locator('[class*="PageHeader-module__title"]');
    this.newsletterCreateButton = this.newsletterHeaderContainer.locator('[class*="PageHeader-module__button"]');
    this.newsletterCreateDropdown = this.newsletterCreateButton.locator('[class*="Dropdown-module__button"]');
    this.newsletterCreateDropdownItem = this.newsletterCreateDropdown.locator('[class*="Dropdown-module__item"]');
    this.searchContainer = this.page.locator('div[class*="TextInput-module__wrapper"]');
    this.searchInput = this.searchContainer.getByRole('textbox', { name: 'search' });
    this.searchClearButton = this.searchContainer.locator('button[aria-label="Clear"]');
    this.searchButton = this.searchContainer.getByRole('button', { name: 'Search' });

    this.newsletterBlankTemplate = this.page.locator(
      '[data-testid="thumbnail-item-wrapper"]:has-text("Blank Template")'
    );
    this.newsletterCreateActionButton = this.page.getByRole('group').getByText('Create', { exact: true });
    this.newsletterNameInput = this.page.locator('#name');
    this.nextButton = this.page.getByRole('button', { name: 'Next' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.searchInput, {
      timeout: 20000,
      assertionMessage: ' Newsletter Home page is not loaded properly ',
    });
    return Promise.resolve(undefined);
  }

  async createNewsletter(newsletterName: string): Promise<void> {
    await this.clickOnElement(this.newsletterCreateActionButton, {
      timeout: 45000,
      stepInfo: 'Clicking on the Next button',
    });
    await this.fillInElement(this.newsletterNameInput, newsletterName, {
      stepInfo: `Entering the ${newsletterName}`,
    });
    await this.clickOnElement(this.nextButton, {
      stepInfo: 'Clicking on the Next button',
    });
    await this.verifier.waitUntilElementIsVisible(this.newsletterBlankTemplate);
    await this.clickOnElement(this.newsletterBlankTemplate, {
      stepInfo: 'Clicking on the Template button',
    });
    await this.clickOnElement(this.nextButton, {
      stepInfo: 'Clicking on the Next button',
    });
  }

  async validateHeaders() {
    //Heading, Create Button, Create Button Dropdown, Dropdown options
    // all 4 Tabs
  }

  async validateSearchAndFilter() {
    // Search, input box, clear button, search button
  }

  async validateNewsletterTable() {
    // Table, table headers, sortable headers, table with data, table without data, hr line (seperator .DataGrid-module__emptyWrapper__ukW4t {
    //     border-top: 1px solid var(--color-border-light);)
  }
}
