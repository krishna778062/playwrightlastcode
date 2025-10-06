import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';
import { ManageSitesComponent } from '@/src/modules/content-abac/components/manageSitesComponent';

export interface IManageSiteActions {
  clickOnAddSite: () => Promise<void>;
  selectSite: () => Promise<void>;
}

export interface IManageSiteAssertions {}

export class ManageSitePage extends BasePage {
  private manageSitesComponent: ManageSitesComponent;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.MANAGE_SITE_PAGE(siteId));
    this.manageSitesComponent = new ManageSitesComponent(page);
  }

  get actions(): IManageSiteActions {
    return this;
  }
  get assertions(): IManageSiteAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.manageSitesComponent.contentTab, {
      assertionMessage: 'Content tab should be visible on manage site page',
    });
  }

  async clickOnAddSite(): Promise<void> {
    await test.step('Clicking on add site', async () => {
      await this.clickOnElement(this.manageSitesComponent.addSite);
    });
  }

  async selectSite(): Promise<void> {
    await test.step('Selecting the site', async () => {
      await this.clickOnElement(this.manageSitesComponent.selectSite);
      await this.page.keyboard.press('Tab');
      await this.page.keyboard.press('Enter');
    });
  }
}
