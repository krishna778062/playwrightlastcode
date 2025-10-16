import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { SideNavBarComponent } from '@/src/core/ui/components/sideNavBarComponent';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { ManageSitesComponent } from '@/src/modules/content/ui/components/manageSitesComponent';
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
  readonly ellipses = this.page.locator('[aria-label="Category option"]').first();
  readonly clickOnUpdateCategoryOption = this.page.getByRole('button', { name: 'Update category' });
  readonly clickOnSearchBar = this.page.getByRole('textbox', { name: 'Search sites…' });
  readonly clickingOnSearchButton = this.page.locator('[type="submit"][aria-label="Search"]');
  readonly siteList = this.page.locator('.type--title').first();

  private manageSitesComponent: ManageSitesComponent;
  private updateSiteCategoryComponent: UpdateSiteCategoryComponent;
  private sideNavBarComponent: SideNavBarComponent;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.MANAGE_SITE_PAGE(siteId));
    this.manageSitesComponent = new ManageSitesComponent(page);
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
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.manageSitesComponent.clickOnSite);
      await this.manageSitesComponent.clickOnSite.press('Tab');
      await this.manageSitesComponent.clickOnSite.press('Enter');
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
