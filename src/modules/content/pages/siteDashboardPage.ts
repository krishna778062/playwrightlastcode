import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { AddContentModalComponent } from '@/src/modules/content/components/addContentModal';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { AlbumCreationPage } from '@/src/modules/content/pages/albumCreationPage';
import { EventCreationPage } from '@/src/modules/content/pages/eventCreationPage';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';

export interface ISiteDashboardActions {
  navigateToPageCreationFromSiteDashboard: () => Promise<PageCreationPage>;
  navigateToAlbumCreationFromSiteDashboard: () => Promise<AlbumCreationPage>;
  navigateToEventCreationFromSiteDashboard: () => Promise<EventCreationPage>;
  navigateToManageSite: () => Promise<void>;
}

export interface ISiteDashboardAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifySiteName: (siteName: string, successMessage: string) => Promise<void>;
  verifyDashboardUrl: (siteId: string) => Promise<void>;
}

export class SiteDashboardPage extends BasePage implements ISiteDashboardActions, ISiteDashboardAssertions {
  readonly addContentButton = this.page.locator("button[title='Add content']");
  readonly manageSiteButton = this.page.locator("button[title='Manage site'], a[href*='/manage']");
  readonly siteNameHeading = (siteName: string) => this.page.locator('h1', { hasText: siteName });
  readonly successMessage = (message: string) =>
    this.page.locator('div[class*="Toast-module"] p', { hasText: message });
  readonly addContentModal: AddContentModalComponent;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.getSiteDashboardPage(siteId));
    this.addContentModal = new AddContentModalComponent(page);
  }

  // Actions
  get actions(): ISiteDashboardActions {
    return this;
  }

  // Assertions
  get assertions(): ISiteDashboardAssertions {
    return this;
  }

  /**
   * Clicks on the add content button
   */
  async clickOnAddContent(): Promise<void> {
    await test.step('Click on add content button', async () => {
      await this.clickOnElement(this.addContentButton);
    });
  }

  /**
   * Completes content creation from site dashboard
   * @param contentType - The content type to create
   */
  async completeContentCreationFromSiteDashboard(
    contentType: ContentType
  ): Promise<PageCreationPage | AlbumCreationPage | EventCreationPage> {
    return await this.addContentModal.completeContentCreationForm(contentType);
  }

  /**
   * Navigates from site dashboard to page creation by verifying page load, clicking add content, and selecting content type
   * @returns PageCreationPage instance
   */
  async navigateToPageCreationFromSiteDashboard(): Promise<PageCreationPage> {
    return await test.step('Navigate to page creation from site dashboard', async () => {
      // Click on add content button
      await this.clickOnAddContent();
      // Select content type and navigate to page creation
      const pageCreationPage = await this.completeContentCreationFromSiteDashboard(ContentType.PAGE);
      await pageCreationPage.verifyThePageIsLoaded();
      return pageCreationPage as PageCreationPage;
    });
  }

  async navigateToManageSite(): Promise<void> {
    await test.step('Navigate to manage site', async () => {
      await this.clickOnElement(this.manageSiteButton, {
        stepInfo: 'Click manage site button',
      });
    });
  }

  async navigateToAlbumCreationFromSiteDashboard(): Promise<AlbumCreationPage> {
    return await test.step('Navigate to album creation from site dashboard', async () => {
      // Click on add content button
      await this.clickOnAddContent();
      // Select content type and navigate to album creation
      const albumCreationPage = await this.completeContentCreationFromSiteDashboard(ContentType.ALBUM);
      await albumCreationPage.verifyThePageIsLoaded();
      return albumCreationPage as AlbumCreationPage;
    });
  }

  async navigateToEventCreationFromSiteDashboard(): Promise<EventCreationPage> {
    return await test.step('Navigate to event creation from site dashboard', async () => {
      // Click on add content button
      await this.clickOnAddContent();
      // Select content type and navigate to event creation
      const eventCreationPage = await this.completeContentCreationFromSiteDashboard(ContentType.EVENT);
      await eventCreationPage.verifyThePageIsLoaded();
      return eventCreationPage as EventCreationPage;
    });
  }

  /**
   * Verifies the site dashboard page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site dashboard page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      await this.verifier.verifyTheElementIsVisible(this.addContentButton);
    });
  }

  /**
   * Verifies the site name is displayed in the h1 heading
   * @param siteName - The expected site name
   */
  async verifySiteName(siteName: string, successMessage: string): Promise<void> {
    await test.step(`Verify site name "${siteName}" is displayed in heading`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteNameHeading(siteName), {
        assertionMessage: `Site name heading should contain "${siteName}"`,
      });

      // Verify success message is visible
      await this.verifier.verifyTheElementIsVisible(this.successMessage(successMessage), {
        assertionMessage: `Success message "${successMessage}" should be visible after publishing`,
      });
    });
  }

  /**
   * Verifies the current URL matches the expected site dashboard URL
   * @param siteId - The expected site ID in the URL
   */
  async verifyDashboardUrl(siteId: string): Promise<void> {
    await test.step(`Verify dashboard URL contains site ID: ${siteId}`, async () => {
      await this.page.waitForLoadState('domcontentloaded');
      const expectedUrl = PAGE_ENDPOINTS.getSiteDashboardPage(siteId);
      const currentUrl = this.page.url();

      if (!currentUrl.includes(expectedUrl)) {
        throw new Error(`Expected URL to contain "${expectedUrl}", but got "${currentUrl}"`);
      }
    });
  }
}
