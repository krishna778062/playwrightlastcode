import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class FeatureSiteComponent extends BaseComponent {
  // Search and add functionality
  readonly searchSitesInput: Locator;
  readonly addButton: Locator;
  readonly doneButton: Locator;
  readonly getSiteFromDropdown: (siteName: string) => Locator;
  readonly siteListingItemByName: (siteName: string) => Locator;
  readonly siteListingItemByIndex: (index: number) => Locator;
  readonly faetureListItems: Locator;

  constructor(page: Page) {
    super(page);
    this.searchSitesInput = this.page
      .locator("div:has-text('Select site')")
      .locator("xpath=following-sibling::div/input[not(@type='hidden')]");
    this.addButton = this.page.getByRole('button', { name: 'Add', exact: true });
    this.doneButton = this.page.getByRole('button', { name: 'Done' });
    this.getSiteFromDropdown = (siteName: string) =>
      this.page.getByRole('menuitem').getByLabel(siteName, { exact: true });
    this.siteListingItemByName = (siteName: string) =>
      this.page.locator(`div[class*="ListingItem-module__details"] p:text("${siteName}")`);
    this.siteListingItemByIndex = (index: number) =>
      this.page
        .locator('[class*="DraggableListItem-module-siteListingRow"]')
        .nth(index)
        .locator('[class*="ListingItem-module__details"] p')
        .first();
    this.faetureListItems = this.page.locator(`[class*="FeaturedSiteList"] li`);
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

      await this.page.waitForTimeout(1000);

      // Wait for the site to appear in dropdown results
      const siteDropdownOption = this.getSiteFromDropdown(siteName);
      try {
        await this.verifier.verifyTheElementIsVisible(siteDropdownOption);
      } catch (error) {
        console.log(`Error verifying site dropdown option: ${error}`);
        await this.searchSitesInput.clear();
        await this.fillInElement(this.searchSitesInput, siteName);
        await this.verifier.verifyTheElementIsVisible(siteDropdownOption);
      }

      // Click on the specific site from dropdown
      await this.clickOnElement(siteDropdownOption);
    });
  }

  /**
   * Clicks on the Add button
   */
  async clickAddButton(): Promise<void> {
    await test.step('Click on Add button', async () => {
      const addButtonResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.addButton, { delay: 5_000 }),
        response =>
          response.url().includes('featured?action=feature') &&
          response.request().method() === 'PUT' &&
          response.status() === 200,
        {
          timeout: 50_000,
        }
      );
      return addButtonResponse;
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
      await this.verifier.verifyTheElementIsVisible(this.siteListingItemByName(siteNames));
    });
  }

  /**
   * Verifies the order of featured sites by index
   * @param sites - Array of sites in the order they were added (first added = index 1, second added = index 0)
   */
  async verifyFeaturedSitesIndex(sites: { siteId: string; name: string }[]): Promise<void> {
    await test.step('Verify featured sites are in correct order by index', async () => {
      const expectedSiteFirst = sites[1]?.name;
      const expectedSiteSecond = sites[0]?.name;
      const firstSiteText = await this.siteListingItemByIndex(0).textContent();
      const secondSiteText = await this.siteListingItemByIndex(1).textContent();
      await test.step('Verify featured sites are in correct order by index', async () => {
        expect(firstSiteText).toEqual(expectedSiteFirst);
        expect(secondSiteText).toEqual(expectedSiteSecond);
      });
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
