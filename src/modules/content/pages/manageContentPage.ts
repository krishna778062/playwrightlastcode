import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { ManageContentComponent } from '@/src/modules/content/components/manageContentComponent';

export interface IManageContentPageActions {
  clickOnContent: () => Promise<void>;
  clickOnViewAllButton: () => Promise<void>;
  verifyingValidationRequiredBarState: () => Promise<void>;
  clickOnEditButton: () => Promise<void>;
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
      clickOnViewAllButton: this.clickOnViewAllButton.bind(this),
      verifyingValidationRequiredBarState: this.verifyingValidationRequiredBarState.bind(this),
      clickOnEditButton: this.clickOnEditButton.bind(this),
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
    await test.step('Clicking on content', async () => {
      await this.clickOnElement(this.manageContentComponent.clickOnContent);
      await this.manageContentComponent.clickOnContent.press('Enter');
    });
  }

  async clickOnViewAllButton(): Promise<void> {
    await test.step('Clicking on view all option', async () => {
      await this.clickOnElement(this.manageContentComponent.clickOnViewAll);
    });
  }

  async verifyingValidationRequiredBarState(): Promise<void> {
    await test.step('Verifying validation required bar state', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageContentComponent.validationRequiredBarState, {
        assertionMessage: 'Validation required bar state should be visible',
      });
    });
  }

  async clickOnEditButton(): Promise<void> {
    await test.step('Clicking on edit button', async () => {
      await this.clickOnElement(this.manageContentComponent.openingPanelMenu);
      await this.clickOnElement(this.manageContentComponent.clickOnEditButton);
    });
  }
}
