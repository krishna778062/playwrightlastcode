import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { SideNavBarComponent } from '@/src/core/ui/components/sideNavBarComponent';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { UpdateSiteCategoryComponent } from '@/src/modules/content/ui/components/updateSiteCategoryComponent';

export interface IManageSiteActions {
  clickOnSite: () => Promise<void>;
  clickOnUpdateCategory: () => Promise<void>;
  clickOnCancelOption: () => Promise<void>;
  clickOnSites: () => Promise<void>;
  updatingCategoryToUncategorized: (categoryName: string) => Promise<void>;
  searchForSite: (siteName: string) => Promise<void>;
}

export interface IManageSiteAssertions {
  verifyNoSitesFound: (siteName: string) => Promise<void>;
  // Add assertions as needed
}

export class ManageSitePage extends BasePage implements IManageSiteActions, IManageSiteAssertions {
  // Locators
  readonly contentTab = this.page.locator(
    'a[href*="/content"], button:has-text("Content"), [data-testid="content-tab"]'
  );
  // Locator moved from ManageSitesComponent
  readonly siteCell: Locator;
  readonly ellipses = this.page.locator('[aria-label="Category option"]').first();
  readonly clickOnUpdateCategoryOption = this.page.getByRole('button', { name: 'Update category' });
  readonly clickOnSearchBar = this.page.getByRole('textbox', { name: 'Search sites…' });
  readonly clickingOnSearchButton = this.page.locator('[type="submit"][aria-label="Search"]');
  readonly siteList = this.page.locator('.type--title').first();

  private updateSiteCategoryComponent: UpdateSiteCategoryComponent;
  private sideNavBarComponent: SideNavBarComponent;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.MANAGE_SITE_PAGE(siteId));
    // Initialize locator from component
    this.siteCell = page.getByRole('cell', { name: 'Name' });
    this.updateSiteCategoryComponent = new UpdateSiteCategoryComponent(page);
    this.sideNavBarComponent = new SideNavBarComponent(page);
    this.clickOnSite = this.clickOnSite.bind(this);
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

  async clickOnUpdateCategory(): Promise<void> {
    await test.step('Clicking on update category', async () => {
      await this.hoverOverElementInJavaScript(this.ellipses);
      await this.clickOnElement(this.clickOnUpdateCategoryOption);
    });
  }

  async clickOnCancelOption(): Promise<void> {
    await this.updateSiteCategoryComponent.clickOnCancelOption();
  }

  async clickOnSites(): Promise<void> {
    await test.step('Clicking on sites', async () => {
      await this.clickOnElement(this.sideNavBarComponent.sitesButton);
    });
  }

  async updatingCategoryToUncategorized(categoryName: string): Promise<void> {
    await this.updateSiteCategoryComponent.updatingCategoryToUncategorized(categoryName);
  }

  async searchForSite(siteName: string): Promise<void> {
    await this.clickOnElement(this.clickOnSearchBar);
    await this.page.getByPlaceholder('Search').nth(1).fill(siteName);
    await this.clickOnElement(this.clickingOnSearchButton);
  }

  async verifyNoSitesFound(siteName: string): Promise<void> {
    const noSitesFound = this.siteList.filter({ hasText: siteName });
    console.log('noSitesFound', noSitesFound);
    await this.verifier.verifyTheElementIsNotVisible(noSitesFound, {
      assertionMessage: 'No sites found should be visible on manage site page',
    });
  }
}
