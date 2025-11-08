import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { BulkActionOptions } from '@/src/modules/content/constants/manageSiteOptions';
import { ManageSitesComponent } from '@/src/modules/content/ui/components/manageSitesComponent';
import { UpdateSiteCategoryComponent } from '@/src/modules/content/ui/components/updateSiteCategoryComponent';
import { Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IManageSiteActions {
  clickOnOptionsDropdown: (siteName: string) => Promise<void>;
  clickOnSearchButton: () => Promise<void>;
  searchSite: (siteName: string) => Promise<void>;
  selectFilterOption: (optionName: string) => Promise<void>;
  clickOnFilterOptionsDropdownButton: () => Promise<void>;
}

export interface IManageSiteAssertions {
  verifyNoSitesFound: (siteName: string) => Promise<void>;
  verifySiteIsDeactivated: (siteName: string, siteId: string, siteManagementHelper: any) => Promise<void>;
  verifySiteIsActivated: (siteName: string, siteId: string, siteManagementHelper: any) => Promise<void>;
  verifyThePageIsLoaded: () => Promise<void>;
  verifyOptionIsVisibleInOptionsDropdown: (optionName: string) => Promise<void>;
  verifyOptionIsNotVisibleInOptionsDropdown: (optionName: string) => Promise<void>;
}

export class ManageSitePage extends BasePage implements IManageSiteActions, IManageSiteAssertions {
  readonly searchSiteBar = this.page.getByRole('textbox', { name: 'Search sites…' });
  readonly searchButton = this.page.locator('button[name="submitbutton"]');
  readonly siteList = this.page.locator('.type--title').first();
  readonly optionsDropdown = (optionName: string) => this.page.getByRole('button', { name: optionName });
  readonly siteReferenceEllipses = (siteName: string) =>
    this.page.locator(`tr:has(h2:has-text("${siteName}"))`).getByRole('button', { name: 'Category option' }).first();
  readonly filterOptionsDropdown = (optionName: string) => this.page.getByText(optionName, { exact: true });
  readonly reactSelectInput = this.page.locator('div[class*="ReactSelectInput"]');

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_SITE_PAGE);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.searchSiteBar, {
      assertionMessage: 'Search site bar should be visible on manage site page',
    });
  }

  get actions(): IManageSiteActions {
    return this;
  }

  get assertions(): IManageSiteAssertions {
    return this;
  }

  async verifyNoSitesFound(siteName: string): Promise<void> {
    const noSitesFound = this.siteList.filter({ hasText: siteName });
    await this.verifier.verifyTheElementIsNotVisible(noSitesFound, {
      assertionMessage: 'No sites found should be visible on manage site page',
    });
  }

  async verifySiteIsDeactivated(siteName: string, siteId: string, siteManagementHelper: any): Promise<void> {
    const { test } = await import('@playwright/test');
    await test.step(`Verify site ${siteName} is deactivated`, async () => {
      const siteDetails = await siteManagementHelper.siteManagementService.getListOfSites({
        filter: 'deactivated',
        canManage: true,
      });
      const foundSite = siteDetails.result.listOfItems.find((s: any) => s.siteId === siteId);
      if (!foundSite) {
        throw new Error(`Site ${siteName} should be deactivated but was not found in deactivated sites list`);
      }
      if (foundSite.isActive !== false) {
        throw new Error(`Site ${siteName} should have isActive=false but got isActive=${foundSite.isActive}`);
      }
    });
  }

  async verifySiteIsActivated(siteName: string, siteId: string, siteManagementHelper: any): Promise<void> {
    const { test } = await import('@playwright/test');
    await test.step(`Verify site ${siteName} is activated`, async () => {
      const activatedSiteDetails = await siteManagementHelper.siteManagementService.getListOfSites({
        filter: 'active',
        canManage: true,
      });
      const activatedSite = activatedSiteDetails.result.listOfItems.find((s: any) => s.siteId === siteId);
      if (!activatedSite) {
        throw new Error(`Site ${siteName} should be activated but was not found in active sites list`);
      }
      if (activatedSite.isActive !== true) {
        throw new Error(`Site ${siteName} should have isActive=true but got isActive=${activatedSite.isActive}`);
      }
    });
  }

  async searchSite(siteName: string): Promise<void> {
    await this.clickOnElement(this.searchSiteBar);
    await this.searchSiteBar.clear();
    await this.fillInElement(this.searchSiteBar, siteName);
  }

  async clickOnSearchButton(): Promise<void> {
    await this.clickOnElement(this.searchButton);
  }

  async clickOnOptionsDropdown(siteName: string): Promise<void> {
    await this.clickOnElement(this.siteReferenceEllipses(siteName));
  }
  async selectSiteFilterByText(bulkActionOption: BulkActionOptions): Promise<void> {
    await this.manageSitesComponent.selectSiteFilterByText(bulkActionOption);
  }

  async verifyOptionIsVisibleInOptionsDropdown(optionName: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.optionsDropdown(optionName), {
      assertionMessage: `${optionName} option should be visible in options dropdown`,
    });
  }

  async verifyOptionIsNotVisibleInOptionsDropdown(optionName: string): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.optionsDropdown(optionName), {
      assertionMessage: `${optionName} option should not be visible in options dropdown`,
    });
  }

  async selectFilterOption(optionName: string): Promise<void> {
    await this.clickOnElement(this.filterOptionsDropdown(optionName));
  }

  async clickOnFilterOptionsDropdownButton(): Promise<void> {
    await this.clickOnElement(this.reactSelectInput);
  }
}
