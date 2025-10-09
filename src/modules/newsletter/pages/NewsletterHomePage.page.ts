import { Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS as newsletterEndpoints, PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';

export class NewsletterHomePagePage extends BasePage {
  private readonly searchInput: Locator;
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
  //readonly searchInput: Locator;
  readonly searchButton: Locator;

  //Newsletter Filter
  readonly searchFilter: Locator;
  //readonly searchInput: Locator;
  readonly searchFilterButton: Locator;
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
    this.searchInput = this.page.locator('input#search');
    this.searchButton = this.page.getByRole('button', { name: 'Search' });
    this.searchFilter = this.searchContainer.locator('div[class*="TextInput-module__adornments"]');
    this.searchFilterButton = this.searchFilter.locator('button[aria-label="Search"]');
    this.searchClearButton = this.searchFilter.locator('button[aria-label="Clear"]');
    this.newsletterBlankTemplate = this.page.locator(
      '[data-testid="thumbnail-item-wrapper"]:has-text("Blank Template")'
    );
    this.newsletterCreateActionButton = this.page.getByRole('group').getByText('Create', { exact: true });
    this.newsletterNameInput = this.page.locator('#name');
    this.nextButton = this.page.getByRole('button', { name: 'Next' });
  }

  async loadPage(): Promise<void> {
    await this.page.goto(newsletterEndpoints.MANAGE_NEWSLETTER_PAGE);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.searchInput, {
      timeout: 20000,
      assertionMessage: ' Newsletter Home page is not loaded properly ',
    });
    return Promise.resolve(undefined);
  }

  async createNewsletter(newsletterName: string): Promise<void> {
    await this.newsletterCreateActionButton.click({ force: true, timeout: 45000 });
    await this.newsletterNameInput.type(newsletterName);
    await this.nextButton.click();
    await this.verifier.waitUntilElementIsVisible(this.newsletterBlankTemplate);
    await this.newsletterBlankTemplate.click();
    await this.nextButton.click();
  }
}
