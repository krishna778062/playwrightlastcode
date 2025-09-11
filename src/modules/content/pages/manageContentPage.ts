import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { ManageContentComponent } from '@/src/modules/content/components/manageContentComponent';

export interface IManageContentPageActions {
  clickOnContent: () => Promise<void>;
}

export interface IFeaturedSiteAssertions {}
export class ManageContentPage extends BasePage {
  private manageContentComponent: ManageContentComponent;
  actions: any;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_CONTENT);
    this.manageContentComponent = new ManageContentComponent(page);
    this.actions = {
      clickOnContent: this.clickOnContent.bind(this),
    };
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify manage content page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageContentComponent.sendFeedback, {
        assertionMessage: 'Manage content page should be visible',
      });
    });
  }

  async clickOnContent(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.manageContentComponent.clickOnContent);
      await this.manageContentComponent.clickOnContent.press('Enter');
    });
  }
}
