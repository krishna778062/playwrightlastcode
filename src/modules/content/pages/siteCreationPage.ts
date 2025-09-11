import { Locator, Page, Response, test } from '@playwright/test';

import { PageCreationResponse } from '@content/apis/types/pageCreationResponse';
import { SiteDashboardPage } from '@content/pages/siteDashboardPage';
import { BasePage } from '@core/pages/basePage';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { SiteManagementHelper } from '@/src/core/helpers/siteManagementHelper';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';

interface SiteCreationResponse {
  status: string;
  result: {
    id: string;
    siteId: string;
    name: string;
    title: string;
    description: string | null;
    access: string;
    category: {
      name: string;
      id: string;
    };
  };
}

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
}

export interface ISiteCreationAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
}

export class SiteCreationPage extends BasePage implements ISiteCreationActions, ISiteCreationAssertions {
  // Essential locators for site creation
  readonly siteNameInput: Locator;
  readonly categoryDropdown: Locator;
  readonly selectCategory: (categoryName: string) => Locator;
  readonly accessType: (type: string) => Locator;
  readonly createSiteButton: Locator;
  readonly categoryListItem: (categoryName: string) => Locator;

  constructor(page: Page) {
    super(page);

    // Essential site creation locators
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
  }

  get actions(): ISiteCreationActions {
    return this;
  }

  get assertions(): ISiteCreationAssertions {
    return this;
  }

  /**
   * Verifies the site creation page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site creation page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteNameInput, {
        assertionMessage: 'Site name input should be visible on site creation page',
      });
    });
  }

  /**
   * Creates and publishes a site with the given options
   * @param options - The options for creating the site
   * @returns Object containing site dashboard page, site name, and site ID
   */
  async addSite(
    options: SiteCreationOptions,
    siteManagementHelper: SiteManagementHelper
  ): Promise<{
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
        siteDashboard: new SiteDashboardPage(this.page, siteId, siteManagementHelper),
        siteId: siteId,
      };
    });
  }

  /**
   * Fills in the site details
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
   * Creates the site and waits for API response
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
