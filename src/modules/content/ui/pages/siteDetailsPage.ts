import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { SiteDetailsComponent } from '@/src/modules/content/ui/components/siteDetailsComponent';

export interface IManageContentPageActions {
  ViewSite: () => Promise<void>;
}

export interface IFeaturedSiteAssertions {}
export class SiteDetailsPage extends BasePage {
  private siteDetailsComponent: SiteDetailsComponent;
  actions: any;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.SITE_DETAILS_PAGE(siteId));
    this.siteDetailsComponent = new SiteDetailsComponent(page);
    this.actions = {
      ViewSite: this.ViewSite.bind(this),
    };
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site details page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteDetailsComponent.dashboardAndFeedSection, {
        assertionMessage: 'Site details page should be visible',
      });
    });
  }

  async ViewSite(): Promise<void> {
    await test.step('Viewing site', async () => {
      await this.clickOnElement(this.siteDetailsComponent.ViewSite);
    });
  }
}
