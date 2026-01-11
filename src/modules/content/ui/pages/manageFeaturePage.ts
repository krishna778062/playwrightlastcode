import { Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export class ManageFeaturesPage extends BasePage {
  readonly clickOnSiteCard: Locator;
  readonly manageFeatureHeading: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_FEATURE);

    // Initialize locators
    this.clickOnSiteCard = this.page.getByRole('menuitem', { name: 'Sites Sites' });
    this.manageFeatureHeading = this.page.getByRole('heading', { name: 'Manage features' });
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
