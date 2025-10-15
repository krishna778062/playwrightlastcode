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

  // Header and Create controls
  readonly headerTitleHeading: Locator;
  readonly createPrimaryButton: Locator;
  readonly createDropdownToggle: Locator;
  readonly createDropdownMenu: Locator;
  readonly createMenuItemNewsletter: Locator;
  readonly createMenuItemCategory: Locator;

  // Search and Filters
  readonly searchIcon: Locator;
  readonly filtersButton: Locator;
  readonly searchResultsEmptyWrapper: Locator;

  // Table and listing
  readonly tableElement: Locator;
  readonly headerNameButton: Locator;
  readonly headerCreatorButton: Locator;
  readonly headerStatusButton: Locator;
  readonly headerRecipientsButton: Locator;
  readonly headerFromAddressButton: Locator;
  readonly headerDateModifiedButton: Locator;
  readonly tableRows: Locator;
  readonly rowActionShowMoreButtons: Locator;
  readonly loadMoreButton: Locator;

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

    // Header and Create controls
    this.headerTitleHeading = this.page.getByRole('heading', { name: 'Newsletter' });
    this.createPrimaryButton = this.page.getByRole('link', { name: 'Create' });
    this.createDropdownToggle = this.page.getByRole('button', { name: 'Open menu' });
    this.createDropdownMenu = this.page.getByRole('menu');
    this.createMenuItemNewsletter = this.createDropdownMenu.getByRole('menuitem').filter({ hasText: 'Newsletter' });
    this.createMenuItemCategory = this.createDropdownMenu.getByRole('menuitem').filter({ hasText: 'Category' });

    // Search and Filters based on provided DOM
    this.searchIcon = this.page.locator('i[data-testid="i-searchThick"]');
    this.filtersButton = this.page.getByRole('button', { name: 'Filters' });
    this.searchResultsEmptyWrapper = this.page.locator('[class*="DataGrid-module__emptyWrapper"]');

    // Table and listing
    this.tableElement = this.page.locator('[class*="Table-module__table"]');
    const tableHeaders = this.tableElement.locator('thead');
    this.headerNameButton = tableHeaders.getByRole('button', { name: 'Name' });
    this.headerCreatorButton = tableHeaders.getByRole('button', { name: 'Creator' });
    this.headerStatusButton = tableHeaders.getByRole('button', { name: 'Status' });
    this.headerRecipientsButton = tableHeaders.getByRole('button', { name: 'Recipients' });
    this.headerFromAddressButton = tableHeaders.getByRole('button', { name: 'From address' });
    this.headerDateModifiedButton = tableHeaders.getByRole('button', { name: 'Date modified' });
    this.tableRows = this.page.locator('[data-testid^="dataGridRow-"]');
    this.rowActionShowMoreButtons = this.tableElement.locator('button[aria-label="Show more"]');
    this.loadMoreButton = this.page.getByRole('button', { name: 'Show more' });
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
    // Heading
    await this.verifier.verifyTheElementIsVisible(this.headerTitleHeading, {
      assertionMessage: 'Verify Newsletter heading is visible',
    });

    // Create primary button
    await this.verifier.verifyTheElementIsVisible(this.createPrimaryButton, {
      assertionMessage: 'Verify Create primary button is visible',
    });

    // Create dropdown toggle
    await this.verifier.verifyTheElementIsVisible(this.createDropdownToggle, {
      assertionMessage: 'Verify Create dropdown toggle is visible',
    });

    // Open dropdown
    await this.clickOnElement(this.createDropdownToggle, {
      stepInfo: 'Open Create dropdown menu',
    });

    // Dropdown menu and options
    await this.verifier.verifyTheElementIsVisible(this.createDropdownMenu, {
      assertionMessage: 'Verify Create dropdown menu is visible',
    });
    await this.verifier.verifyTheElementIsVisible(this.createMenuItemCategory, {
      assertionMessage: 'Verify Category option is visible',
    });
  }

  async validateSearchAndFilter() {
    // Verify search input
    await this.verifier.verifyTheElementIsVisible(this.searchInput, {
      assertionMessage: 'Verify search input is visible',
    });

    // Verify search icon inside adornments
    await this.verifier.verifyTheElementIsVisible(this.searchIcon, {
      assertionMessage: 'Verify search icon is visible',
    });

    // Verify Filters button
    await this.verifier.verifyTheElementIsVisible(this.filtersButton, {
      assertionMessage: 'Verify Filters button is visible',
    });
  }

  async searchNewslettersAndVerifyResults(searchText: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.searchInput, {
      assertionMessage: 'Search input should be visible before typing',
    });

    // Clear existing text if clear button is visible
    const isClearVisible = await this.verifier.isTheElementVisible(this.searchClearButton, { timeout: 1000 });
    if (isClearVisible) {
      await this.clickOnElement(this.searchClearButton, {
        stepInfo: 'Clear existing search text',
      });
    }

    await this.fillInElement(this.searchInput, searchText, {
      stepInfo: `Enter search text: ${searchText}`,
    });

    // Trigger search: prefer button if present, else press Enter
    const isSearchButtonVisible = await this.verifier.isTheElementVisible(this.searchButton, { timeout: 1000 });
    if (isSearchButtonVisible) {
      await this.clickOnElement(this.searchButton, {
        stepInfo: 'Click Search button',
      });
    } else {
      await this.searchInput.press('Enter');
    }

    // Verify either results matching text or empty state
    const possibleMatch = this.newsletterContainer.getByText(searchText, { exact: false }).first();
    const hasMatch = await this.verifier.isTheElementVisible(possibleMatch, { timeout: 10000 });

    if (hasMatch) {
      await this.verifier.verifyTheElementIsVisible(possibleMatch, {
        assertionMessage: `Verify at least one result contains: ${searchText}`,
      });
    } else {
      await this.verifier.verifyTheElementIsVisible(this.searchResultsEmptyWrapper, {
        assertionMessage: 'Verify empty results state is shown when no match found',
      });
    }
  }

  async validateNewsletterTable() {
    // Verify table exists
    await this.verifier.verifyTheElementIsVisible(this.tableElement, {
      assertionMessage: 'Verify newsletter table is visible',
    });

    // Verify headers (sortable buttons)
    await this.verifier.verifyTheElementIsVisible(this.headerNameButton, { assertionMessage: 'Verify Name header' });
    await this.verifier.verifyTheElementIsVisible(this.headerCreatorButton, {
      assertionMessage: 'Verify Creator header',
    });
    await this.verifier.verifyTheElementIsVisible(this.headerStatusButton, {
      assertionMessage: 'Verify Status header',
    });
    await this.verifier.verifyTheElementIsVisible(this.headerRecipientsButton, {
      assertionMessage: 'Verify Recipients header',
    });
    await this.verifier.verifyTheElementIsVisible(this.headerFromAddressButton, {
      assertionMessage: 'Verify From address header',
    });
    await this.verifier.verifyTheElementIsVisible(this.headerDateModifiedButton, {
      assertionMessage: 'Verify Date modified header',
    });

    // Verify rows or empty state
    const hasAnyRow = await this.verifier.isTheElementVisible(this.tableRows.first(), { timeout: 5000 });
    if (hasAnyRow) {
      await this.verifier.verifyTheElementIsVisible(this.tableRows.first(), {
        assertionMessage: 'Verify at least one table row is visible',
      });
      // Row action button (Show more)
      const hasRowActions = await this.verifier.isTheElementVisible(this.rowActionShowMoreButtons.first(), {
        timeout: 1000,
      });
      if (hasRowActions) {
        await this.verifier.verifyTheElementIsVisible(this.rowActionShowMoreButtons.first(), {
          assertionMessage: 'Verify row action Show more button is visible',
        });
      }
    } else {
      await this.verifier.verifyTheElementIsVisible(this.searchResultsEmptyWrapper, {
        assertionMessage: 'Verify empty results state when no rows are present',
      });
    }

    //Load more button if present
    const hasLoadMore = await this.verifier.isTheElementVisible(this.loadMoreButton, { timeout: 1000 });
    if (hasLoadMore) {
      await this.verifier.verifyTheElementIsVisible(this.loadMoreButton, {
        assertionMessage: 'Verify Show more button is visible at the bottom',
      });
    }
  }
}
