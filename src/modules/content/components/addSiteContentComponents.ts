import { test } from '@playwright/test';
import { ContentCreationPage } from '../pages/contentCreationPage';

export class AddSiteContentComponents {
  constructor(private readonly page: ContentCreationPage) {}
  

  async clickPageOption() {
    await test.step('Click on Page option', async () => {
      await this.page.clickOnElement(this.page.pageOption);
    });
  }

  async selectRecentlyUsedSite() {
    await test.step('Click on recently used site', async () => {
      // Select the first recently used site
      const firstSite = this.page.recentlyUsedSitesList.first();
      await this.page.clickOnElement(firstSite);
    });
  }

  async clickAddButton() {
    await test.step('Click Add button', async () => {
      await this.page.clickOnElement(this.page.addSpan);
    });
  }
} 