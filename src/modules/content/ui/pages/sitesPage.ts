import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

export class SitesPage extends BasePage {
  readonly followingTab = this.page.getByRole('tab', { name: 'Following' });
  readonly memberTab = this.page.getByRole('tab', { name: 'Member' });
  readonly mySitesTab = this.page.getByRole('tab', { name: 'My sites' });
  readonly siteHeading = this.page.getByRole('heading', { name: 'Sites', exact: true });
  readonly categoryTab = this.page.getByRole('tab', { name: 'Categories' });
  readonly categoryDropDwon = this.page.getByRole('combobox', { name: 'Select category' });
  readonly siteNameLocator = (siteName: string) => this.page.getByRole('link', { name: siteName });
  readonly selectCategoryDropDownOptionLocator = (category: string) => this.page.getByText(category, { exact: true });

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(siteId));
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.siteHeading, {
      assertionMessage: 'Content tab should be visible on manage site page',
    });
  }
  async clickOnFollowingTab(): Promise<void> {
    await test.step('Clicking on following tab', async () => {
      await this.clickOnElement(this.followingTab);
    });
  }
  async clickOnCategoryTab(): Promise<void> {
    await test.step('Clicking on category tab', async () => {
      await this.clickOnElement(this.categoryTab);
    });
  }

  async clickOnMemberTab(): Promise<void> {
    await test.step('Clicking on member tab', async () => {
      await this.clickOnElement(this.memberTab);
    });
  }

  async clickOnMySitesTab(): Promise<void> {
    await test.step('Clicking on my sites tab', async () => {
      await this.clickOnElement(this.mySitesTab);
    });
  }

  async clickOnSiteName(siteName: string): Promise<void> {
    await test.step('Clicking on the site name', async () => {
      await this.clickOnElement(this.siteNameLocator(siteName));
    });
  }
  async openSiteFromFollowingTab(): Promise<void> {
    await test.step('Opening the site from following tab', async () => {
      await this.clickOnElement(this.followingTab);
      await this.page.keyboard.press('Tab');
      await this.page.keyboard.press('Enter');
    });
  }

  async openSiteFromMemberTab(): Promise<void> {
    await test.step('Opening the site from member tab', async () => {
      await this.clickOnElement(this.memberTab);
      await this.page.keyboard.press('Tab');
      await this.page.keyboard.press('Enter');
    });
  }
  async selectCategoryDropDown(): Promise<void> {
    await test.step('Selecting the category from the drop down', async () => {
      await this.clickOnElement(this.categoryDropDwon);
    });
  }
  async selectCategoryDropDownOption(category: string): Promise<void> {
    await test.step('Selecting the category from the drop down', async () => {
      await this.clickOnElement(this.selectCategoryDropDownOptionLocator(category));
      await this.page.keyboard.press('Enter');
    });
  }

  async verifySiteNameInSitesPage(siteName: string): Promise<void> {
    await test.step('Verifying the site name in sites page', async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteNameLocator(siteName), {
        assertionMessage: 'Site name should be visible in sites page',
      });
    });
  }
  async openSiteFromMySitesTab(): Promise<void> {
    await test.step('Opening the site from my sites tab', async () => {
      await this.clickOnElement(this.mySitesTab);
      await this.page.keyboard.press('Tab');
      await this.page.keyboard.press('Enter');
    });
  }
}
