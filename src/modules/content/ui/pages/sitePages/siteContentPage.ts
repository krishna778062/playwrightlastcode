import { Locator, Page, test } from '@playwright/test';

import { BaseSitePage } from '@content/ui/pages/sitePages/baseSite';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

export interface ISiteContentActions {
  clickPageCategory: (categoryName: string) => Promise<void>;
}

export interface ISiteContentAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyContentListLoaded: () => Promise<void>;
}

/**
 * A Site has many pages.
 * This class is for managing the Site Content page.
 */
export class SiteContentPage extends BaseSitePage implements ISiteContentAssertions {
  readonly pageCategoryLink: (categoryName: string) => Locator;
  readonly contentListContainer: Locator;

  constructor(page: Page, siteId: string) {
    super(page, siteId);
    // Override the pageUrl to use content page instead of dashboard
    (this as any).pageUrl = PAGE_ENDPOINTS.SITE_CONTENT_PAGE(siteId);
    // Locator for page category link/button
    this.pageCategoryLink = (categoryName: string) =>
      this.page.getByLabel('Content', { exact: true }).getByRole('link', { name: categoryName, exact: true });
    this.contentListContainer = this.page.locator('div.DraggableList > div > li').first();
  }

  get actions(): ISiteContentActions {
    return this;
  }

  get assertions(): ISiteContentAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site content page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      // Add specific content page verification logic here
    });
  }

  /**
   * Clicks on a page category to filter content
   * @param categoryName - The name of the page category to click
   */
  async clickPageCategory(categoryName: string): Promise<void> {
    await test.step(`Click on page category: ${categoryName}`, async () => {
      await this.clickOnElement(this.pageCategoryLink(categoryName));
    });
  }

  /**
   * Verifies that content list is loaded and visible
   */
  async verifyContentListLoaded(): Promise<void> {
    await test.step('Verify content list is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.contentListContainer, {
        assertionMessage: 'Content list should be visible',
      });
    });
  }
}
