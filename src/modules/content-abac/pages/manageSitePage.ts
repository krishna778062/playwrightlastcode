import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';

export interface IManageSiteActions {
  clickOnAddSite: () => Promise<void>;
  selectSite: () => Promise<void>;
}

export interface IManageSiteAssertions {}

export class ManageSitePage extends BasePage {
  readonly addSite = this.page.getByRole('link', { name: 'Add site' });
  readonly contentTab = this.page.getByTestId('content-tab');
  readonly selectASite = this.page.getByRole('cell', { name: 'Name' });

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.MANAGE_SITE_PAGE(siteId));
  }

  get actions(): IManageSiteActions {
    return this;
  }
  get assertions(): IManageSiteAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.contentTab, {
      assertionMessage: 'Content tab should be visible on manage site page',
    });
  }

  async clickOnAddSite(): Promise<void> {
    await test.step('Clicking on add site', async () => {
      await this.clickOnElement(this.addSite);
    });
  }

  async selectSite(): Promise<void> {
    await test.step('Selecting the site', async () => {
      await this.clickOnElement(this.selectASite);
      await this.page.keyboard.press('Tab');
      await this.page.keyboard.press('Enter');
    });
  }
}
