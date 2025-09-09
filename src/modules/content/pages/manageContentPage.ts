import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { ManageContentComponent } from '@/src/modules/content/components/manageContentComponent';

export class ManageContentPage extends BasePage {
  private manageContentComponent: ManageContentComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_CONTENT);
    this.manageContentComponent = new ManageContentComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    // Implement the required abstract method
    // You can add page verification logic here if needed
  }

  async clickOnContent(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.manageContentComponent.clickOnContent);
      await this.manageContentComponent.clickOnContent.press('Enter');
    });
  }
}
