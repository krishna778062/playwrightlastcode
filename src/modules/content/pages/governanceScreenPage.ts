import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { GovernanceComponent } from '../components/governanceComponent';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { ManageApplicationComponent } from '@/src/modules/content/components/manageApplicationComponent';

export class GovernanceScreenPage extends BasePage {
  private governanceComponent: GovernanceComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.GOVERNANCE_SCREEN);
    this.governanceComponent = new GovernanceComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    // Implement the required abstract method
    // You can add page verification logic here if needed
  }

  async clickOnTimeline(): Promise<void> {
    await test.step('Clicking on timeline', async () => {
      await this.governanceComponent.clickOnTimeline.click();
    });
  }

  async clickOnSave(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.governanceComponent.clickOnSave.click();
    });
  }
}
