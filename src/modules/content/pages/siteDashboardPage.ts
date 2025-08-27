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
}

export interface ISiteDashboardAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
}

export class SiteDashboardPage extends BasePage implements ISiteDashboardActions, ISiteDashboardAssertions {
  readonly addContentButton = this.page.locator("button[title='Add content']");
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
}
