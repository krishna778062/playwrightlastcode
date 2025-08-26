import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { AddContentModalComponent } from '@/src/modules/content/components/addContentModal';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { AlbumCreationPage } from '@/src/modules/content/pages/albumCreationPage';
import { EventCreationPage } from '@/src/modules/content/pages/eventCreationPage';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';

export interface ISiteDashboardActions {
  navigateToPageCreationFromSiteDashboard: (
    contentType: ContentType
  ) => Promise<PageCreationPage | AlbumCreationPage | EventCreationPage>;
}

export interface ISiteDashboardAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
}

export class SiteDashboardPage extends BasePage implements ISiteDashboardActions, ISiteDashboardAssertions {
  readonly addContentButton = this.page.locator("button[title='Add content']");
  readonly addContentModal: AddContentModalComponent;

  constructor(page: Page, siteId?: string) {
    super(page, PAGE_ENDPOINTS.SITE_DASHBOARD_PAGE.replace(':siteId', siteId || ''));
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
  async completeContentCreationFromSiteDashboard(contentType: ContentType): Promise<any> {
    return await this.addContentModal.completeContentCreationForm(contentType);
  }

  /**
   * Navigates from site dashboard to page creation by verifying page load, clicking add content, and selecting content type
   * @param contentType - The content type to create
   * @returns PageCreationPage instance
   */
  async navigateToPageCreationFromSiteDashboard(
    contentType: ContentType
  ): Promise<PageCreationPage | AlbumCreationPage | EventCreationPage> {
    return await test.step('Navigate to page creation from site dashboard', async () => {
      // Verify site dashboard page is loaded
      await this.verifyThePageIsLoaded();

      // Click on add content button
      await this.clickOnAddContent();

      // Select content type and navigate to page creation
      return await this.completeContentCreationFromSiteDashboard(contentType);
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
