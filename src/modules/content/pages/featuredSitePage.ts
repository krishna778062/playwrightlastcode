import { Locator, Page, test } from '@playwright/test';

import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { BaseActionUtil } from '@core/utils/baseActionUtil';
import { BaseVerificationUtil } from '@core/utils/baseVerificationUtil';

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

export class FeaturedSitePage implements IFeaturedSiteActions, IFeaturedSiteAssertions {
  private featureSiteComponent: FeatureSiteComponent;
  protected actionUtil: BaseActionUtil;
  protected verifier: BaseVerificationUtil;
  readonly featuredTab = this.page.locator('a:has-text("Featured")');
  readonly featuredSiteNames = this.page.locator('div#panel-featured div.SiteGridItem-info h2 a');
  readonly successToastMessage = (message: string) =>
    this.page.locator('div[class*="Toast-module"] p', { hasText: message });

  constructor(public page: Page) {
    this.featureSiteComponent = new FeatureSiteComponent(page);
    this.actionUtil = new BaseActionUtil(page);
    this.verifier = new BaseVerificationUtil(page);
  }

  protected async clickOnElement(element: Locator): Promise<void> {
    await this.actionUtil.clickOnElement(element);
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
      await homePage.actions.clickOnSitesFromSideBar();
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
      await homePage.actions.navigateToHomePage();
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
   * Gets the list of featured site names and verifies if the specified site is included
   * @param siteName - Name of the site to verify in the featured list
   */
  private async verifyFeaturedSiteInList(siteName: string): Promise<void> {
    await test.step(`Verify "${siteName}" is in featured sites list`, async () => {
      // Wait for featured site elements to be present
      await this.verifier.verifyTheElementIsVisible(this.featuredSiteNames.first());

      // Get all featured site elements
      const siteElements = await this.featuredSiteNames.all();

      // Extract text from each element
      const siteNameTexts: string[] = [];
      for (const element of siteElements) {
        const text = await element.textContent();
        if (text) {
          siteNameTexts.push(text.trim());
        }
      }
      await this.page.pause();
      // Assert that the site name is contained in the featured list
      if (!siteNameTexts.includes(siteName)) {
        throw new Error(`Expected site "${siteName}" to be in featured list, but found: ${siteNameTexts.join(', ')}`);
      }
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

      const currentUrl = this.page.url();

      if (!URL_PATTERNS.SITE_DASHBOARD.test(currentUrl)) {
        throw new Error(`Expected URL to match pattern 'baseURL/site/{siteId}/dashboard', but got: ${currentUrl}`);
      }
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
