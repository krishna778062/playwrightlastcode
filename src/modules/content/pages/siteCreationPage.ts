import { Locator, Page, Response, test } from '@playwright/test';

import { PageCreationResponse } from '@content/apis/types/pageCreationResponse';
import { SiteDashboardPage } from '@content/pages/siteDashboardPage';
import { BasePage } from '@core/pages/basePage';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { SiteManagementHelper } from '@/src/core/helpers/siteManagementHelper';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';

export interface SiteCreationOptions {
  name: string;
  description: string;
  siteCategory: string;
  access: string;
  coverImage?: {
    fileName: string;
    cropOptions?: {
      widescreen?: boolean;
      square?: boolean;
    };
  };
}

export interface ISiteCreationActions {
  addSite(
    options: SiteCreationOptions,
    siteManagementHelper: SiteManagementHelper
  ): Promise<{
    siteDashboard: SiteDashboardPage;
    siteId: string;
  }>;

  // UI-based methods (new)
  fillSiteName: (siteName: string) => Promise<void>;
  selectOrCreateCategory: (categoryName: string) => Promise<void>;
  clickAddSiteButton: () => Promise<void>;
  createSiteWithRandomCategory: (siteName: string, categoryName: string) => Promise<void>;
}

export interface ISiteCreationAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifySiteCreationPageLoaded: () => Promise<void>;
}

export class SiteCreationPage extends BasePage implements ISiteCreationActions, ISiteCreationAssertions {
  // API-based locators (existing)
  readonly siteNameInput: Locator;
  readonly categoryDropdown: Locator;
  readonly selectCategory: (categoryName: string) => Locator;
  readonly accessType: (type: string) => Locator;
  readonly createSiteButton: Locator;
  readonly categoryListItem: (categoryName: string) => Locator;

  // UI-based locators (new)
  readonly siteNameTextbox: Locator;
  readonly categorySection: Locator;
  readonly categoryCombobox: Locator;
  readonly addSiteButton: Locator;
  readonly addCategoryOption: (categoryName: string) => Locator;

  constructor(page: Page) {
    super(page);

    // API-based locators (existing)
    this.siteNameInput = page.locator('input[aria-label="Site name"]');
    this.categoryDropdown = page
      .locator('div')
      .filter({ hasText: 'Add or select existing category' })
      .locator('+ div input');
    this.selectCategory = (categoryName: string) =>
      page.locator("div[class*='createOption']").getByText(categoryName, { exact: true });

    this.categoryListItem = (categoryName: string) =>
      page
        .locator('#category-list')
        .locator('div')
        .filter({ hasText: new RegExp(`^${categoryName}$`) });

    this.accessType = (type: string) => page.locator('label').filter({ hasText: type });
    this.createSiteButton = page.locator('button:has-text("Add site")');

    // UI-based locators (new)
    this.siteNameTextbox = page.getByRole('textbox', { name: 'Site name' });
    this.categorySection = page
      .locator('div')
      .filter({ hasText: /^Add or select existing category$/ })
      .nth(2);
    this.categoryCombobox = page.getByRole('combobox', { name: 'Category: This is a required' });
    this.addSiteButton = page.getByRole('button', { name: 'Add site' });
    this.addCategoryOption = (categoryName: string) => page.getByText(`Add ${categoryName}…`);
  }

  get actions(): ISiteCreationActions {
    return this;
  }

  get assertions(): ISiteCreationAssertions {
    return this;
  }

  /**
   * Verifies the site creation page is loaded (UI-based approach)
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Site Creation page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteNameTextbox, {
        assertionMessage: 'Site name textbox should be visible',
        timeout: 10000,
      });
      await this.verifier.verifyTheElementIsVisible(this.addSiteButton, {
        assertionMessage: 'Add site button should be visible',
        timeout: 5000,
      });
    });
  }

  async verifySiteCreationPageLoaded(): Promise<void> {
    await this.verifyThePageIsLoaded();
  }

  /**
   * Fills the site name in the textbox
   * @param siteName - The site name to fill
   */
  async fillSiteName(siteName: string): Promise<void> {
    await test.step(`Fill site name: ${siteName}`, async () => {
      await this.fillInElement(this.siteNameTextbox, siteName);
    });
  }

  /**
   * Selects or creates a new category
   * @param categoryName - The category name to select or create
   */
  async selectOrCreateCategory(categoryName: string): Promise<void> {
    await test.step(`Select or create category: ${categoryName}`, async () => {
      // Click on category section
      await this.clickOnElement(this.categorySection);

      // Fill the category name in combobox
      await this.fillInElement(this.categoryCombobox, categoryName);

      // Click on "Add categoryName..." option to create new category
      const addCategoryOption = this.addCategoryOption(categoryName);
      await this.clickOnElement(addCategoryOption);
    });
  }

  /**
   * Clicks the Add Site button to submit the form
   */
  async clickAddSiteButton(): Promise<void> {
    await test.step('Click Add Site button', async () => {
      await this.clickOnElement(this.addSiteButton);
    });
  }

  /**
   * Complete flow to create a site with random category
   * @param siteName - The site name to create
   * @param categoryName - The category name to create/select
   */
  async createSiteWithRandomCategory(siteName: string, categoryName: string): Promise<void> {
    await test.step(`Create site "${siteName}" with category "${categoryName}"`, async () => {
      await this.fillSiteName(siteName);
      await this.selectOrCreateCategory(categoryName);
      await this.clickAddSiteButton();
    });
  }

  // ==================== API-BASED METHODS (EXISTING) ====================

  /**
   * Creates and publishes a site with the given options (API-based approach)
   * @param options - The options for creating the site
   * @returns Object containing site dashboard page, site name, and site ID
   */
  async addSite(options: SiteCreationOptions): Promise<{
    siteDashboard: SiteDashboardPage;
    siteId: string;
  }> {
    return await test.step(`Creating and publishing site with name: ${options.name}`, async () => {
      // Fill in site mandatory details
      await this.fillSiteDetails({
        name: options.name,
        category: options.siteCategory,
        access: options.access,
      });

      // Create the site
      const createResponse = await this.createSite();

      // Parse response body
      const createResponseBody = (await createResponse.json()) as PageCreationResponse;

      // Extract site ID and name from response
      const siteId = createResponseBody.result.id;

      // Return site dashboard page with site details
      return {
        siteDashboard: new SiteDashboardPage(this.page, siteId),
        siteId: siteId,
      };
    });
  }

  /**
   * Fills in the site details (API-based approach)
   * @param options - The options for filling in the site details
   */
  async fillSiteDetails(options: { name: string; category: string; access: string }) {
    await test.step(`Filling site details`, async () => {
      // Add site name
      await this.fillInElement(this.siteNameInput, options.name);

      // Handle category selection
      await this.clickOnElement(this.categoryDropdown);
      await this.fillInElement(this.categoryDropdown, options.category);
      if (await this.verifier.isTheElementVisible(this.categoryListItem(options.category))) {
        await this.clickOnElement(this.categoryListItem(options.category));
      } else {
        await this.clickOnElement(this.selectCategory(options.category));
      }
      // Handle access type selection
      await this.clickOnElement(this.accessType(options.access));
    });
  }

  /**
   * Creates the site and waits for API response (API-based approach)
   */
  async createSite(): Promise<Response> {
    return await test.step(`Creating site and wait for create api response`, async () => {
      const createResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.createSiteButton, { delay: 2_000 }),
        response =>
          response.request().url() === getEnvConfig().apiBaseUrl + API_ENDPOINTS.site.url &&
          response.request().method() === 'POST' &&
          response.status() === 200,
        {
          timeout: 20_000,
        }
      );
      return createResponse;
    });
  }
}
