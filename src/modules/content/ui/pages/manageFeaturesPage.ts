import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { SideNavBarComponent } from '@/src/core/ui/components/sideNavBarComponent';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { ManageFeatureComponent } from '@/src/modules/content/ui/components/manageFeatureComponent';

export interface IManageFeaturesPageActions {
  clickOnContentCard: () => Promise<void>;
  clickOnSitesCard: () => Promise<void>;
}

export interface IFeaturedSiteAssertions {}

export class ApplicationScreenPage extends BasePage {
  private sideNavBarComponent: SideNavBarComponent;
  private manageFeatureComponent: ManageFeatureComponent;
  actions: any;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_FEATURE);
    this.sideNavBarComponent = new SideNavBarComponent(page);
    this.manageFeatureComponent = new ManageFeatureComponent(page);
    this.actions = {
      clickOnContentCard: this.clickOnContentCard.bind(this),
      clickOnSitesCard: this.clickOnSitesCard.bind(this),
    };
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify manage feature page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageFeatureComponent.manageFeatureHeading, {
        assertionMessage: 'Manage feature page should be visible',
      });
    });
  }

  async clickOnContentCard(): Promise<void> {
    await test.step('Clicking on application', async () => {
      await this.clickOnElement(this.manageFeatureComponent.clickOnContentCard);
    });
  }

  async clickOnSitesCard(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.manageFeatureComponent.clickOnSitesCard);
    });
  }
}
