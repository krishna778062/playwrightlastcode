import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IManageSiteActions {
  clickOnSite: () => Promise<void>;
}

export interface IManageSiteAssertions {
  // Add assertions as needed
}

export class ManageSitePage extends BasePage implements IManageSiteActions, IManageSiteAssertions {
  // Locators
  readonly contentTab = this.page.locator(
    'a[href*="/content"], button:has-text("Content"), [data-testid="content-tab"]'
  );
  // Locator moved from ManageSitesComponent
  readonly siteCell: Locator;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.MANAGE_SITE_PAGE(siteId));
    // Initialize locator from component
    this.siteCell = page.getByRole('cell', { name: 'Name' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.contentTab, {
      assertionMessage: 'Content tab should be visible on manage site page',
    });
  }

  get actions(): IManageSiteActions {
    return this;
  }

  get assertions(): IManageSiteAssertions {
    return this;
  }

  async clickOnSite(): Promise<void> {
    await test.step('Clicking on site', async () => {
      await this.clickOnElement(this.siteCell);
      await this.siteCell.press('Tab');
      await this.siteCell.press('Enter');
    });
  }
}
