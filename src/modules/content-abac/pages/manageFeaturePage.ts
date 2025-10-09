import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export interface IManageFeaturesPageActions {
  clickOnSitesCard: () => Promise<void>;
}

export interface IFeaturedSiteAssertions {}

export class ManageFeaturesPage extends BasePage {
  readonly clickOnSiteCard = this.page.getByRole('menuitem', { name: 'Sites Sites' });
  readonly manageFeatureHeading = this.page.getByRole('heading', { name: 'Manage features' });

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_FEATURE);
  }
  get actions(): IManageFeaturesPageActions {
    return this;
  }
  get assertions(): IFeaturedSiteAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify manage feature page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageFeatureHeading, {
        assertionMessage: 'Manage feature page should be visible',
      });
    });
  }

  async clickOnSitesCard(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.clickOnSiteCard);
    });
  }
}
