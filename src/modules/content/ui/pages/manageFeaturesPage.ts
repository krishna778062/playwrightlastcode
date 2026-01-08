import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { SideNavBarComponent } from '@/src/core/ui/components/sideNavBarComponent';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { ManageFeatureComponent } from '@/src/modules/content/ui/components/manageFeatureComponent';

export class ManageFeaturesPage extends BasePage {
  sideNavBarComponent: SideNavBarComponent;
  manageFeatureComponent: ManageFeatureComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_FEATURE);
    this.sideNavBarComponent = new SideNavBarComponent(page);
    this.manageFeatureComponent = new ManageFeatureComponent(page);
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
      await this.clickOnElement(this.manageFeatureComponent.contentCard);
    });
  }

  async clickOnInsideSiteCard(): Promise<void> {
    await test.step('Clicking on inside site card', async () => {
      await this.clickOnElement(this.manageFeatureComponent.insideSiteCard);
    });
  }
  async clickOnSitesCard(): Promise<void> {
    await test.step('Clicking on sites card', async () => {
      await this.clickOnElement(this.manageFeatureComponent.sitesCard);
    });
  }
}
