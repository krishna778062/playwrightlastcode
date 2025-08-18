import { Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class FeatureSiteComponent extends BaseComponent {
  // Search and add functionality
  readonly searchSitesInput = this.page
    .locator("div:has-text('Select site')")
    .locator("xpath=following-sibling::div/input[not(@type='hidden')]");
  readonly addButton = this.page.getByRole('button', { name: 'Add' });
  readonly doneButton = this.page.getByRole('button', { name: 'Done' });
  readonly addUpdateFeaturedSiteButton = this.page.getByRole('button', { name: 'Add/update' });
  readonly getSiteFromDropdown = (siteName: string) => this.page.locator(`div[id*="listbox"] :text("${siteName}")`);

  constructor(page: Page) {
    super(page);
  }

  /**
   * Searches for sites and adds them to featured with Add and Done steps
   * @param siteName - Name of the site to search and add
   */
  async searchFeaturedSite(siteName: string): Promise<void> {
    await test.step(`Search and add "${siteName}" to featured sites`, async () => {
      await this.clickOnElement(this.addUpdateFeaturedSiteButton);

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
}
