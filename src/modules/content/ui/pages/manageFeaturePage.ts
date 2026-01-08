import { Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export class ManageFeaturesPage extends BasePage {
  readonly clickOnSiteCard = this.page.getByRole('menuitem', { name: 'Sites Sites' });
  readonly manageFeatureHeading = this.page.getByRole('heading', { name: 'Manage features' });

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_FEATURE);
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
