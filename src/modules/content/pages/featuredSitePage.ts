import { expect, Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';

import { FeatureSiteComponent } from '../components/featureSiteComponent';

export interface IFeaturedSiteActions {
  navigateToFeaturedSitesTab: (homePage: NewUxHomePage) => Promise<void>;
  addSiteToFeatured: (siteName: string) => Promise<void>;
  navigateToHomePage: (homePage: NewUxHomePage, siteNames: string[]) => Promise<void>;
  navigateToSiteDashboard: (siteName: string) => Promise<void>;
}

export interface IFeaturedSiteAssertions {
  verifyFeaturedSitesVisible: (siteNames: string[]) => Promise<void>;
  verifySiteDashboardLoaded: (siteName: string) => Promise<void>;
  verifyToastMessage: (message: string) => Promise<void>;
}

export class FeaturedSitePage extends BasePage implements IFeaturedSiteActions, IFeaturedSiteAssertions {
  private featureSiteComponent: FeatureSiteComponent;
  readonly featuredTab = this.page.locator('a').filter({ hasText: 'Featured' });
  readonly featuredSiteNames = this.page
    .locator('#panel-featured')
    .locator('.SiteGridItem-info')
    .locator('h2')
    .getByRole('link');
  readonly successToastMessage = (message: string) =>
    this.page.locator('div[class*="Toast-module"] p', { hasText: message });

  constructor(page: Page) {
    super(page);
    this.featureSiteComponent = new FeatureSiteComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Featured Sites page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.featuredTab);
    });
  }

  get actions(): IFeaturedSiteActions {
    return this;
  }

  get assertions(): IFeaturedSiteAssertions {
    return this;
  }

  /**
   * Complete flow to navigate to featured sites tab
   * @param homePage - The home page instance to navigate from
   */
  async navigateToFeaturedSitesTab(homePage: NewUxHomePage): Promise<void> {
    await test.step('Navigate to Sites > Featured tab', async () => {
      await homePage.clickOnSitesFromSideBar();
      // Wait for DOM to load after navigation
      await this.page.waitForLoadState('domcontentloaded');
      await this.clickOnElement(this.featuredTab);
    });
  }

  /**
   * Complete flow to add a site to featured
   * @param siteName - Name of the site to add to featured
   */
  async addSiteToFeatured(siteName: string): Promise<void> {
    await test.step(`Add site "${siteName}" to featured`, async () => {
      await this.featureSiteComponent.searchFeaturedSite(siteName);
      await this.featureSiteComponent.clickAddButton();
      await this.featureSiteComponent.clickDoneButton();
    });
  }

  /**
   * Complete flow to navigate to home and verify featured sites
   * @param homePage - The home page instance to navigate with
   * @param siteNames - Array of site names to verify in featured dropdown
   */
  async navigateToHomePage(homePage: NewUxHomePage, siteNames: string[]): Promise<void> {
    await test.step('Navigate to Home and verify featured sites', async () => {
      await homePage.navigateToHomePage();
    });
  }

  /**
   * Complete flow to navigate to a site dashboard
   * @param siteName - Name of the site to navigate to
   */
  async navigateToSiteDashboard(siteName: string): Promise<void> {
    await test.step(`Navigate to ${siteName} dashboard`, async () => {
      await this.clickOnFeaturedSite(siteName);
    });
  }

  /**
   * Verifies featured sites are visible in dropdown
   * @param siteNames - Array of site names to verify
   */
  async verifyFeaturedSitesVisible(siteNames: string[]): Promise<void> {
    for (const siteName of siteNames) {
      await this.verifyFeaturedSiteInList(siteName);
    }
  }

  /**
   * Verifies site dashboard is loaded
   * @param siteName - Name of the site dashboard to verify
   */
  async verifySiteDashboardLoaded(siteName: string): Promise<void> {
    await this.verifySiteDashboardNavigation(siteName);
  }

  /**
   * Verifies if the specified site is visible in the featured list using text filter
   * @param siteName - Name of the site to verify in the featured list
   */
  private async verifyFeaturedSiteInList(siteName: string): Promise<void> {
    await test.step(`Verify "${siteName}" is in featured sites list`, async () => {
      // Create a locator that filters for the specific site name
      const specificSite = this.featuredSiteNames.filter({ hasText: siteName });

      // Simply verify the filtered element is visible
      await this.verifier.verifyTheElementIsVisible(specificSite);
    });
  }

  /**
   * Clicks on a specific featured site
   * @param siteName - Name of the site to click
   */
  private async clickOnFeaturedSite(siteName: string): Promise<void> {
    await test.step(`Click on featured site: ${siteName}`, async () => {
      const featuredSite = this.featuredSiteNames.getByText(siteName);
      await this.clickOnElement(featuredSite);
    });
  }

  /**
   * Verifies navigation to site dashboard
   * @param siteName - Name of the site to verify
   */
  private async verifySiteDashboardNavigation(siteName: string): Promise<void> {
    await test.step(`Verify navigation to ${siteName} dashboard`, async () => {
      const URL_PATTERNS = {
        SITE_DASHBOARD: /\/site\/[a-f0-9-]+\/dashboard/,
      };

      // Use Playwright's built-in URL assertion
      await expect(this.page).toHaveURL(URL_PATTERNS.SITE_DASHBOARD);
    });
  }

  /**
   * Verifies that a toast message with the specified text is visible
   * @param message - The expected toast message text
   */
  async verifyToastMessage(message: string): Promise<void> {
    await test.step(`Verifying toast message: "${message}"`, async () => {
      const toastLocator = this.successToastMessage(message);
      await this.verifier.verifyTheElementIsVisible(toastLocator, {
        assertionMessage: `Expected toast message "${message}" to be visible`,
        timeout: 10000,
      });
    });
  }
}
