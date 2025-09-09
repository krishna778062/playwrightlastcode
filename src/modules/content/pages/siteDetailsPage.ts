import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { SiteDetailsComponent } from '@/src/modules/content/components/siteDetailsComponent';

export class SiteDetailsPage extends BasePage {
  private siteDetailsComponent: SiteDetailsComponent;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.SITE_DETAILS_PAGE(siteId));
    this.siteDetailsComponent = new SiteDetailsComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    // Implement the required abstract method
    // You can add page verification logic here if needed
  }

  async ViewSite(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.siteDetailsComponent.ViewSite);
    });
  }
}
