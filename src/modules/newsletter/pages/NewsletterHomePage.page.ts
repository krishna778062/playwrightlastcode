import { Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
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
  readonly headerDateModifiedButton: Locator;
  readonly tableRows: Locator;
  readonly rowActionShowMoreButtons: Locator;
  readonly loadMoreButton: Locator;
  readonly fromAddressHeaderButton: Locator;

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
    this.searchInput = this.searchContainer.getByRole('textbox', { name: /search/i });
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
    this.createDropdownToggle = this.newsletterHeaderContainer
      .getByRole('button', { name: /Open menu|Options|More actions|Create/i })
      .first();
    this.createMenuItemNewsletter = this.page
      .getByRole('menuitem')
      .filter({ hasText: /^Newsletter\b/i })
      .first();
    this.createMenuItemCategory = this.page
      .getByRole('menuitem')
      .filter({ hasText: /^Category\b/i })
      .first();

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
    this.headerDateModifiedButton = tableHeaders.getByRole('button', { name: 'Date modified' });
    this.fromAddressHeaderButton = tableHeaders.getByRole('button', { name: 'From address' });
    this.tableRows = this.page.locator('[data-testid^="dataGridRow-"]');
    this.rowActionShowMoreButtons = this.tableElement.locator('button[aria-label="Show more"]');
    this.loadMoreButton = this.page.getByRole('button', { name: 'Show more' });
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

  private async getCreateDropdownMenu(): Promise<Locator> {
    const menuCandidates: Locator[] = [];

    const ariaControls = await this.createDropdownToggle.getAttribute('aria-controls');
    if (ariaControls) {
      menuCandidates.push(this.page.locator(`#${ariaControls}`));
    }

    const dropdownContainers = [
      '[role="menu"]',
      '[role="listbox"]',
      '[data-testid*="dropdown"]',
      '[class*="Dropdown"][class*="list"]',
      '[class*="Menu"][class*="content"]',
      '[data-tippy-root] [role="menu"]',
      '[data-tippy-root] [role="listbox"]',
      '[data-tippy-root] [data-testid*="dropdown"]',
      '[data-tippy-root] [class*="Dropdown"]',
      '[data-tippy-root] [class*="Menu"]',
    ];

    for (const selector of dropdownContainers) {
      menuCandidates.push(
        this.page.locator(selector).filter({ has: this.createMenuItemNewsletter }).first(),
        this.page.locator(selector).filter({ has: this.createMenuItemCategory }).first()
      );
    }

    for (const candidate of menuCandidates) {
      try {
        await candidate.waitFor({ state: 'visible', timeout: 2000 });
        return candidate;
      } catch {
        // continue to next candidate
      }
    }

    const visibleMenuItem = this.page
      .getByRole('menuitem')
      .filter({ hasText: /^Newsletter\b|^Category\b/i })
      .or(this.page.locator('[role="menuitem"]').filter({ has: this.page.getByText(/^Newsletter\b|^Category\b/i) }))
      .first();

    try {
      await visibleMenuItem.waitFor({ state: 'visible', timeout: 2000 });
    } catch {
      const portalMenuItem = this.page
        .locator('[data-tippy-root]')
        .locator('[role="menuitem"]')
        .filter({ hasText: /^Newsletter|^Category/i })
        .first();
      await portalMenuItem.waitFor({ state: 'visible', timeout: 2000 });
      return portalMenuItem;
    }

    const ancestorSelectors = [
      'xpath=ancestor::*[@role="menu"]',
      'xpath=ancestor::*[@role="listbox"]',
      'xpath=ancestor::*[contains(@class,"Dropdown")]',
      'xpath=ancestor::*[contains(@class,"Menu")]',
      'xpath=ancestor::*[contains(@data-testid,"dropdown")]',
    ];

    for (const selector of ancestorSelectors) {
      const ancestor = visibleMenuItem.locator(selector).first();
      if ((await ancestor.count()) > 0) {
        return ancestor;
      }
    }

    return visibleMenuItem;
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

    // Create dropdown≥ toggle
    await this.verifier.verifyTheElementIsVisible(this.createDropdownToggle, {
      assertionMessage: 'Verify Create dropdown toggle is visible',
    });

    // Open dropdown
    await this.clickOnElement(this.createDropdownToggle, {
      stepInfo: 'Open Create dropdown menu',
    });

    //Dropdown menu and options
    const createDropdownMenu = await this.getCreateDropdownMenu();
    await this.verifier.verifyTheElementIsVisible(createDropdownMenu, {
      assertionMessage: 'Verify Create dropdown menu is visible',
    });

    await this.verifier.verifyTheElementIsVisible(this.createMenuItemNewsletter, {
      assertionMessage: 'Verify Newsletter option is visible in Create dropdown',
    });

    if ((await this.createMenuItemCategory.count()) > 0) {
      await this.verifier.verifyTheElementIsVisible(this.createMenuItemCategory, {
        assertionMessage: 'Verify Category option is visible in Create dropdown',
      });
    }
  }
}
