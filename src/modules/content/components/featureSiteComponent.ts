import { Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class FeatureSiteComponent extends BaseComponent {
  // Search and add functionality
  readonly searchSitesInput = this.page
    .locator("div:has-text('Select site')")
    .locator("xpath=following-sibling::div/input[not(@type='hidden')]");
  readonly addButton = this.page.getByRole('button', { name: 'Add' });
  readonly doneButton = this.page.getByRole('button', { name: 'Done' });
  readonly getSiteFromDropdown = (siteName: string) => this.page.locator(`div[id*="listbox"] :text("${siteName}")`);
  readonly siteListingItem = (siteName: string) =>
    this.page.locator(`div[class*="ListingItem-module"] p:text("${siteName}")`);
  readonly siteListingItemByIndex = (index: number) =>
    this.page.locator(`div[class*="ListingItem-module"] p`).nth(index);
  readonly faetureListItems = this.page.locator(`[class*="FeaturedSiteList"] li`);

  constructor(page: Page) {
    super(page);
  }

  /**
   * Searches for sites and adds them to featured with Add and Done steps
   * @param siteName - Name of the site to search and add
   */
  async searchFeaturedSite(siteName: string): Promise<void> {
    await test.step(`Search and add "${siteName}" to featured sites`, async () => {
      // Click on "Select site" to open the search dropdown
      await this.clickOnElement(this.searchSitesInput);

      // Type the site name in the search input
      await this.fillInElement(this.searchSitesInput, siteName);

      // Wait for the site to appear in dropdown results
      const siteDropdownOption = this.getSiteFromDropdown(siteName);
      await this.verifier.verifyTheElementIsVisible(siteDropdownOption);

      // Click on the specific site from dropdown
      await this.clickOnElement(siteDropdownOption);
    });
  }

  /**
   * Clicks on the Add button
   */
  async clickAddButton(): Promise<void> {
    await test.step('Click on Add button', async () => {
      await this.clickOnElement(this.addButton);
    });
  }

  /**
   * Clicks on the Done button
   */
  async clickDoneButton(): Promise<void> {
    await test.step('Click on Done button', async () => {
      await this.clickOnElement(this.doneButton);
    });
  }

  async verifyFeaturedSitesVisibleInModal(siteNames: string): Promise<void> {
    await test.step('Verify featured sites are visible in modal', async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteListingItem(siteNames));
    });
  }

  /**
   * Verifies the order of featured sites by index
   * @param sites - Array of sites in the expected UI order (index 0, index 1, etc.)
   */
  async verifyFeaturedSitesIndex(sites: { siteId: string; name: string }[]): Promise<void> {
    await test.step('Verify featured sites are in correct order by index', async () => {
      for (let i = 0; i < sites.length; i++) {
        const siteName = sites[i]?.name;
        if (siteName) {
          const siteLocator = this.siteListingItem(siteName).nth(i);
          await this.verifier.verifyTheElementIsVisible(siteLocator, {
            assertionMessage: `Site "${siteName}" should be at index ${i}`,
          });
          console.log(`Verified site "${siteName}" is at index ${i}`);
        }
      }
    });
  }

  /**
   * Shuffles the featured sites order
   */
  async shuffleSites(): Promise<void> {
    await test.step('Shuffle featured sites', async () => {
      console.log('Shuffling featured sites...');
      // Locate first draggable item
      const firstItem = this.faetureListItems.first();
      const secondItem = this.faetureListItems.nth(1);
      // Drag first item onto second
      await firstItem.dragTo(secondItem);
    });
  }
}
