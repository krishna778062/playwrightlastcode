import { expect, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class FeatureSiteComponent extends BaseComponent {
  // Search and add functionality
  readonly searchSitesInput = this.page
    .locator("div:has-text('Select site')")
    .locator("xpath=following-sibling::div/input[not(@type='hidden')]");
  readonly addButton = this.page.getByRole('button', { name: 'Add', exact: true });
  readonly doneButton = this.page.getByRole('button', { name: 'Done' });
  readonly getSiteFromDropdown = (siteName: string) =>
    this.page.getByRole('menuitem').getByLabel(siteName, { exact: true });
  readonly siteListingItemByName = (siteName: string) =>
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
      try {
        await this.verifier.verifyTheElementIsVisible(siteDropdownOption);
      } catch (error) {
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
        () => this.clickOnElement(this.addButton, { delay: 2_000 }),
        response =>
          response.url().includes('featured?action=feature') &&
          response.request().method() === 'POST' &&
          response.status() === 201,
        {
          timeout: 20_000,
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
