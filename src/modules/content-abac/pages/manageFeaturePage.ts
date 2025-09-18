import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { ManageFeatureComponent } from '@/src/modules/content-abac/components/manageFeatureComponent';

export interface IManageFeaturesPageActions {
  clickOnSitesCard: () => Promise<void>;
}

export interface IFeaturedSiteAssertions {}

export class ManageFeaturesPage extends BasePage {
  private manageFeatureComponent: ManageFeatureComponent;
  // actions: any;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_FEATURE);
    this.manageFeatureComponent = new ManageFeatureComponent(page);
  }
  get actions(): IManageFeaturesPageActions {
    return this;
  }
  get assertions(): IFeaturedSiteAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify manage feature page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageFeatureComponent.manageFeatureHeading, {
        assertionMessage: 'Manage feature page should be visible',
      });
    });
  }

  async clickOnSitesCard(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.manageFeatureComponent.clickOnSitesCard);
    });
  }
}
