import { expect, Page, test } from '@playwright/test';

import { BaseSitePage } from '@content/pages/sitePages/baseSite';

import { SiteDashboardComponent } from '../../components/siteDashboardComponent';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export interface ISiteDashboardActions {
  verfiyFeedSection: () => Promise<void>;
}
export interface ISiteDashboardAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyDashboardUrl: (siteId: string) => Promise<void>;
  verifySiteCreatedSuccessfully: (siteName: string) => Promise<void>;
  verifyCategoryCreatedSuccessfully: (categoryName: string) => Promise<void>;
}

export class SiteDashboardPage extends BaseSitePage implements ISiteDashboardAssertions {
  // Locators for site and category verification
  readonly categoryLink = (categoryName: string) => this.page.getByRole('link', { name: categoryName });
  readonly categoryHeading = (categoryName: string) => this.page.getByRole('heading', { name: categoryName });
  readonly siteLink = (siteName: string) => this.page.getByRole('link', { name: siteName });
  readonly siteDashboardComponent: SiteDashboardComponent;

  // Actions
  get actions(): ISiteDashboardActions {
    return this;
  }

  constructor(page: Page, siteId: string) {
    super(page, siteId);
    this.siteDashboardComponent = new SiteDashboardComponent(page);
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
    });
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

  async verfiyFeedSection(): Promise<void> {
    await test.step('Verifying feed section', async () => {
      await expect(this.siteDashboardComponent.verfiyFeedSection, 'expecting feed section to be hidden').toBeHidden();
    });
  }
}
