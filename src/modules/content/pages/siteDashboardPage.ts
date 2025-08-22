import { Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { AddContentModalComponent } from '../components/addContentModal';
import { ContentType } from '../constants/contentType';

export interface ISiteDashboardActions {
  navigateToPageCreationFromSiteDashboard: (contentType: ContentType) => Promise<void>;
}

export interface ISiteDashboardAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
}

export class SiteDashboardPage extends BasePage implements ISiteDashboardActions, ISiteDashboardAssertions {
  readonly addContentButton = this.page.locator("button[title='Add content']");
  readonly addContentModal: AddContentModalComponent;

  constructor(page: Page) {
    super(page);
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
   */
  async navigateToPageCreationFromSiteDashboard(contentType: ContentType): Promise<void> {
    await test.step('Navigate to page creation from site dashboard', async () => {
      // Verify site dashboard page is loaded
      await this.verifyThePageIsLoaded();

      // Click on add content button
      await this.clickOnAddContent();

      // Select content type and navigate to page creation
      await this.completeContentCreationFromSiteDashboard(contentType);
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
