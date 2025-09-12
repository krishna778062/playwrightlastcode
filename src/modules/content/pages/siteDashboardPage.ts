import { expect, Page, test } from '@playwright/test';

import { SiteManager } from '../managers/SiteManager';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';

export interface ISiteDashboardAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifySiteNameIs: (siteName: string) => Promise<void>;
  verifyDashboardUrl: (siteId: string) => Promise<void>;
  verifySiteCreatedSuccessfully: (siteName: string) => Promise<void>;
  verifyCategoryCreatedSuccessfully: (categoryName: string) => Promise<void>;
}

export class SiteDashboardPage extends BasePage implements ISiteDashboardAssertions {
  private readonly siteManager: SiteManager;

  // Locators for site and category verification
  readonly categoryLink = (categoryName: string) => this.page.getByRole('link', { name: categoryName });
  readonly categoryHeading = (categoryName: string) => this.page.getByRole('heading', { name: categoryName });
  readonly siteLink = (siteName: string) => this.page.getByRole('link', { name: siteName });

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.getSiteDashboardPage(siteId));
    this.siteManager = new SiteManager(page, siteId);
  }
  /**
   * Verifies that site was created successfully by checking if site link is visible
   * @param siteName - The site name to verify
   */
  async verifySiteCreatedSuccessfully(siteName: string): Promise<void> {
    await test.step(`Verify site "${siteName}" was created successfully`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteLink(siteName), {
        assertionMessage: `Site link "${siteName}" should be visible after creation`,
        timeout: 15000,
      });
    });
  }
  /**
   * Verifies that category was created successfully by checking if category link is visible
   * @param categoryName - The category name to verify
   */
  async verifyCategoryCreatedSuccessfully(categoryName: string): Promise<void> {
    await test.step(`Verify category "${categoryName}" was created successfully`, async () => {
      // First verify category link is visible (means category was created)
      const categoryLink = this.categoryLink(categoryName);
      await this.verifier.verifyTheElementIsVisible(categoryLink, {
        assertionMessage: `Category link "${categoryName}" should be visible`,
        timeout: 18000,
      });

      // Click on category link to navigate to category page
      await this.clickOnElement(categoryLink);

      // Then verify the heading is visible on category page
      const categoryHeading = this.categoryHeading(categoryName);
      await this.verifier.verifyTheElementIsVisible(categoryHeading, {
        assertionMessage: `Category heading "${categoryName}" should be visible`,
        timeout: 15000,
      });
    });
  }
  /**
   * Gets the site manager for accessing common site functionality
   */
  getSiteManager(): SiteManager {
    return this.siteManager;
  }

  // Assertions
  get assertions(): ISiteDashboardAssertions {
    return this;
  }

  /**
   * Verifies that the site dashboard page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site dashboard page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      await this.verifier.verifyTheElementIsVisible(this.siteManager.getNavigation().addContentButton);
    });
  }

  /**
   * Verifies the site name is displayed in the heading
   * @param siteName - The expected site name
   */
  async verifySiteNameIs(siteName: string): Promise<void> {
    await this.siteManager.verifySiteNameIs(siteName);
  }

  /**
   * Verifies that the current URL matches the expected site dashboard URL
   * @param siteId - The site ID to verify in the URL
   */
  async verifyDashboardUrl(siteId: string): Promise<void> {
    await test.step(`Verify dashboard URL matches expected URL for site ID: ${siteId}`, async () => {
      const expectedUrl = PAGE_ENDPOINTS.getSiteDashboardPage(siteId);
      await expect(this.page, `should match expected URL: ${expectedUrl}`).toHaveURL(expectedUrl);
    });
  }
}
