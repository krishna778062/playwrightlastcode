import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { SiteDetailsComponent } from '@/src/modules/content/ui/components/siteDetailsComponent';

export interface ISiteDetailsPageActions {
  ViewSite: () => Promise<void>;
}
export interface ISiteDetailsPageAssertions {
  validatingCategory: () => Promise<void>;
  validatingCategoryToUncategorized: () => Promise<void>;
}
export class SiteDetailsPage extends BasePage {
  private siteDetailsComponent: SiteDetailsComponent;
  readonly categoryName = this.page.locator('id="category":has-text("Uncategorized")');

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.SITE_DETAILS_PAGE(siteId));
    this.siteDetailsComponent = new SiteDetailsComponent(page);
  }

  get assertions(): ISiteDetailsPageAssertions {
    return this;
  }

  get actions(): ISiteDetailsPageActions {
    return this;
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

  async validatingCategory(): Promise<void> {
    await test.step('Validating category', async () => {
      await this.categoryName.isHidden();
    });
  }

  async validatingCategoryToUncategorized(): Promise<void> {
    await test.step('Validating category to Uncategorized', async () => {
      await this.verifier.verifyTheElementIsVisible(this.categoryName, {
        assertionMessage: 'Category name should be Uncategorized',
      });
    });
  }
}
