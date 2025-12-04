import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { FeedPostingPermission } from '@/src/modules/content/constants/feedPostingPermission';
import { BulkActionOptions } from '@/src/modules/content/constants/manageSiteOptions';
import { SitePageTab } from '@/src/modules/content/constants/sitePageEnums';
import { ManageSitesComponent } from '@/src/modules/content/ui/components/manageSitesComponent';
import { UpdateSiteCategoryComponent } from '@/src/modules/content/ui/components/updateSiteCategoryComponent';

export interface IManageSiteActions {
  clickDashboardAndFeedTab: () => Promise<void>;
  setFeedPostingPermission: (permission: FeedPostingPermission) => Promise<void>;
  clickOnOptionsDropdown: (siteName: string) => Promise<void>;
  clickOnSearchButton: () => Promise<void>;
  searchSite: (siteName: string) => Promise<void>;
  selectFilterOption: (optionName: string) => Promise<void>;
  clickOnFilterOptionsDropdownButton: () => Promise<void>;
  clickOnSiteTab: (tabName: SitePageTab) => Promise<void>;
  clickOnFileOption: (fileName: string) => Promise<void>;
  clickOnEditOption: () => Promise<void>;
  setExternalFilesProvider: (provider: string) => Promise<void>;
  clickOnShowMoreButtonAction: () => Promise<void>;
}

export interface IManageSiteAssertions {
  verifyNoSitesFound: (siteName: string) => Promise<void>;
  verifySiteIsDeactivated: (siteName: string, siteId: string, siteManagementHelper: any) => Promise<void>;
  verifySiteIsActivated: (siteName: string, siteId: string, siteManagementHelper: any) => Promise<void>;
  verifyThePageIsLoaded: () => Promise<void>;
  verifyOptionIsVisibleInOptionsDropdown: (optionName: string) => Promise<void>;
  verifyOptionIsNotVisibleInOptionsDropdown: (optionName: string) => Promise<void>;
  verifyFileIsPresentInTheSiteFilesList: (fileName: string) => Promise<void>;
}

export class ManageSitePage extends BasePage implements IManageSiteActions, IManageSiteAssertions {
  readonly searchSiteBar = this.page.getByRole('textbox', { name: 'Search sites…' });
  readonly searchButton = this.page.locator('button[name="submitbutton"]');
  readonly siteList = this.page.locator('.type--title').first();
  readonly showMoreButton = this.page.getByRole('button', { name: 'Show more' });
  readonly setupTab = this.page.getByRole('tab', { name: 'Setup' });
  readonly feedPostingPermissionRadio = (permission: FeedPostingPermission) => {
    // Based on HTML: name="isBroadcast", value="no" for everyone, value="yes" for managers only
    const value = permission === FeedPostingPermission.MANAGERS_ONLY ? 'yes' : 'no';
    return this.page.locator(`input[type="radio"][name="isBroadcast"][value="${value}"]`);
  };
  readonly optionsDropdown = (optionName: string) => this.page.getByRole('button', { name: optionName });
  readonly siteReferenceEllipses = (siteName: string) =>
    this.page.locator(`tr:has(h2:has-text("${siteName}"))`).getByRole('button', { name: 'Category option' }).first();
  readonly filterOptionsDropdown = (optionName: string) => this.page.getByText(optionName, { exact: true });
  readonly reactSelectInput = this.page.locator('div[class*="ReactSelectInput"]');
  readonly siteTab = (tabName: SitePageTab) => this.page.getByRole('tab', { name: tabName });
  readonly editOptionLocator = this.page.getByTestId('edit-button');

  private manageSitesComponent: ManageSitesComponent;
  // Locators for setExternalFilesProvider method
  readonly externalFilesSection = this.page.locator('h2').filter({ hasText: /External files/i });
  readonly storageProviderInput = this.page.getByRole('combobox', { name: 'Storage provider:' });
  readonly saveButton = this.page.getByRole('button', { name: /save|update|submit/i }).first();
  // Target the option in the dropdown list, not the selected value
  readonly boxFilesOption = this.page.locator('#storageProvider-list').getByText('Box files', { exact: true });
  // Locator for the currently selected value in the combobox
  readonly selectedProviderValue = this.page
    .locator('div[class*="css-15bnrdl-singleValue"]')
    .filter({ hasText: /Box files/i });

  private updateSiteCategoryComponent: UpdateSiteCategoryComponent;

  constructor(page: Page, siteId?: string) {
    const pageUrl = siteId ? PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(siteId) : PAGE_ENDPOINTS.MANAGE_SITE_PAGE;
    super(page, pageUrl);
    this.manageSitesComponent = new ManageSitesComponent(page);
    this.updateSiteCategoryComponent = new UpdateSiteCategoryComponent(page);
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

  async verifySiteIsDeactivated(siteName: string, siteId: string, siteManagementHelper: any): Promise<void> {
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
  fileOptionLocator = (fileName: string) => this.page.getByRole('link', { name: fileName }).first();
  async verifyFileIsPresentInTheSiteFilesList(fileName: string): Promise<void> {
    await this.verifier.isTheElementVisible(this.fileOptionLocator(fileName), {
      assertionMessage: `Verifying that the file: ${fileName} is present in the site files list`,
    });
  }
  async clickOnFileOption(fileName: string): Promise<void> {
    await this.clickOnElement(this.fileOptionLocator(fileName));
  }

  async clickOnEditOption(): Promise<void> {
    await this.clickOnElement(this.editOptionLocator);
  }
  async selectFilterOption(optionName: string): Promise<void> {
    await this.clickOnElement(this.filterOptionsDropdown(optionName));
  }

  getSiteNameLocator(siteName: string): Locator {
    return this.page.getByText(siteName, { exact: true });
  }
  async verifySitesNamesAreDisplayed(siteNames: string | string[]): Promise<void> {
    // Handle both single site name and array of site names
    const namesArray = Array.isArray(siteNames) ? siteNames : [siteNames];

    let index = 0;
    while (index < namesArray.length) {
      const siteName = namesArray[index];
      await this.verifier.verifyTheElementIsVisible(this.getSiteNameLocator(siteName), {
        assertionMessage: 'Site name should be displayed on manage site page',
      });
      index++;
    }
  }
  async verifyNoSitesFound(siteName: string): Promise<void> {
    await this.manageSitesComponent.verifyNoSitesFoundAction(siteName);
    const noSitesFound = this.siteList.filter({ hasText: siteName });
    await this.verifier.verifyTheElementIsNotVisible(noSitesFound, {
      assertionMessage: 'No sites found should be visible on manage site page',
    });
  }

  async clickOnSiteTab(tabName: SitePageTab): Promise<void> {
    await this.clickOnElement(this.siteTab(tabName));
  }

  async clickOnFilterOptionsDropdownButton(): Promise<void> {
    await this.clickOnElement(this.reactSelectInput);
  }
  async clickOnShowMoreButtonAction(): Promise<void> {
    await this.clickOnElement(this.showMoreButton);
  }

  /**
   * Sets the External Files provider (e.g., "Box files")
   * @param provider - The name of the storage provider (e.g., "Box files")
   */
  async setExternalFilesProvider(provider: string): Promise<void> {
    await test.step(`Set External Files provider to ${provider}`, async () => {
      // Wait for External Files section to be visible
      await this.verifier.verifyTheElementIsVisible(this.externalFilesSection, {
        assertionMessage: 'External Files section should be visible',
      });

      // Check if Box files is already selected
      const isBoxAlreadySelected = await this.selectedProviderValue.isVisible().catch(() => false);

      if (isBoxAlreadySelected && provider === 'Box files') {
        return; // Skip the update process
      }
      // Click on the React Select input or dropdown arrow to open dropdown
      await this.verifier.verifyTheElementIsVisible(this.storageProviderInput, {
        assertionMessage: 'Storage provider input should be visible',
      });

      await this.clickOnElement(this.storageProviderInput);

      const providerOption = this.boxFilesOption;
      await this.verifier.verifyTheElementIsVisible(providerOption, {
        assertionMessage: 'Box files option should be visible',
      });
      await this.clickOnElement(providerOption);

      await this.verifier.verifyTheElementIsVisible(this.saveButton, {
        assertionMessage: 'Save button should be visible',
      });
      await this.clickOnElement(this.saveButton);
    });
  }
  async clickDashboardAndFeedTab(): Promise<void> {
    await test.step('Ensure Setup tab is active (feed permissions are under Setup tab)', async () => {
      // Wait for tabs to be visible
      await this.page.waitForSelector('[role="tab"]', { state: 'visible' });
      // Feed permissions are on the Setup tab, ensure it's active
      await this.verifier.verifyTheElementIsVisible(this.setupTab, {
        assertionMessage: 'Setup tab should be visible',
      });
      // Click Setup tab if not already active
      const isSelected = await this.setupTab.getAttribute('aria-selected');
      if (isSelected !== 'true') {
        await this.clickOnElement(this.setupTab);
      }
      // Wait for feed permissions section to be visible (radio buttons)
      await this.page.waitForSelector('input[name="isBroadcast"]', { state: 'visible' });
    });
  }

  async setFeedPostingPermission(permission: FeedPostingPermission): Promise<void> {
    await test.step(`Set feed posting permission to ${permission}`, async () => {
      const radioButton = this.feedPostingPermissionRadio(permission);
      await this.verifier.verifyTheElementIsVisible(radioButton, {
        assertionMessage: `Feed posting permission radio button for "${permission}" should be visible`,
      });

      // Check if the permission is already set to the desired value
      const isAlreadyChecked = await radioButton.isChecked();
      if (isAlreadyChecked) {
        return;
      }

      // Permission needs to be changed, click the radio button
      await radioButton.click({ force: true });
      await this.expect(radioButton).toBeChecked();

      // Look for and click Save/Update button if it exists
      const saveButton = this.page.getByRole('button', { name: /save|update|submit/i }).first();
      await this.verifier.verifyTheElementIsVisible(saveButton, {
        assertionMessage: 'Save/Update button should be visible',
      });
      await saveButton.click();
    });
  }
}
