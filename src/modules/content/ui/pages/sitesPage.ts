import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

export interface ISitesActions {
  clickOnFollowingTab: () => Promise<void>;
  openSiteFromFollowingTab: () => Promise<void>;
  openSiteFromMemberTab: () => Promise<void>;
  clickOnMemberTab: () => Promise<void>;
  clickOnMySitesTab: () => Promise<void>;
  openSiteFromMySitesTab: () => Promise<void>;
}

export interface ISitesAssertions {}

export class SitesPage extends BasePage implements ISitesActions, ISitesAssertions {
  readonly followingTab = this.page.getByRole('tab', { name: 'Following' });
  readonly memberTab = this.page.getByRole('tab', { name: 'Member' });
  readonly mySitesTab = this.page.getByRole('tab', { name: 'My sites' });
  readonly siteHeading = this.page.getByRole('heading', { name: 'Sites', exact: true });

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(siteId));
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.siteHeading, {
      assertionMessage: 'Content tab should be visible on manage site page',
    });
  }

  get actions(): ISitesActions {
    return this;
  }

  get assertions(): ISitesAssertions {
    return this;
  }

  async clickOnFollowingTab(): Promise<void> {
    await test.step('Clicking on following tab', async () => {
      await this.clickOnElement(this.followingTab);
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

  async openSiteFromMySitesTab(): Promise<void> {
    await test.step('Opening the site from my sites tab', async () => {
      await this.clickOnElement(this.mySitesTab);
      await this.page.keyboard.press('Tab');
      await this.page.keyboard.press('Enter');
    });
  }
}
