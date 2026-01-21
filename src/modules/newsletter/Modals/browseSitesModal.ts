import { Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BaseActionUtil } from '@core/utils/baseActionUtil';
import { BaseVerificationUtil } from '@core/utils/baseVerificationUtil';

export class BrowseSitesModal extends BaseActionUtil {
  readonly verifier: BaseVerificationUtil;

  readonly modalDialog: Locator;
  readonly categorySelect: Locator;
  readonly searchInput: Locator;
  readonly addButton: Locator;

  // Parameterized locator
  readonly siteOption: (siteName: string) => Locator;

  constructor(page: Page) {
    super(page);
    this.verifier = new BaseVerificationUtil(page);

    this.modalDialog = this.page.getByRole('dialog');
    this.categorySelect = this.modalDialog.locator('#category');
    this.searchInput = this.modalDialog.locator('#term');
    this.addButton = this.modalDialog.getByRole('button', { name: /^Add/ });

    // Parameterized locator
    this.siteOption = (siteName: string) => this.modalDialog.getByText(siteName, { exact: true });
  }

  /**
   * Filters sites by category option
   * @param option - The category option to filter by (e.g., 'Location')
   */
  async filterSitesByOptions(option: string): Promise<void> {
    await test.step(`Filter sites by ${option}`, async () => {
      await this.categorySelect.selectOption(option);
    });
  }

  /**
   * Selects a site by name from the modal
   * @param siteName - The name of the site to select
   */
  async selectSiteByName(siteName: string): Promise<void> {
    await test.step(`Select site: ${siteName}`, async () => {
      await this.clickOnElement(this.siteOption(siteName), {
        stepInfo: `Click site: ${siteName}`,
      });
    });
  }

  /**
   * Searches for a site in the modal
   * @param siteName - The name of the site to search for
   */
  async searchForSiteInSiteModal(siteName: string): Promise<void> {
    await test.step(`Search for site: ${siteName}`, async () => {
      await this.fillInElement(this.searchInput, siteName, {
        stepInfo: `Type site name in search: ${siteName}`,
      });
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Wait for search results to filter
    });
  }

  /**
   * Searches for a site and selects it
   * @param siteName - The name of the site to search and select
   */
  async searchAndSelectSiteByName(siteName: string): Promise<void> {
    await test.step(`Search and select site: ${siteName}`, async () => {
      await this.fillInElement(this.searchInput, siteName, {
        stepInfo: `Search for site: ${siteName}`,
      });
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Wait for search results
      await this.clickOnElement(this.siteOption(siteName), {
        stepInfo: `Click site: ${siteName}`,
      });
    });
  }

  /**
   * Asserts that all expected options are selected
   * Checks that the Add button shows the correct count
   * @param expectedCount - The expected number of selected sites (defaults to 3)
   */
  async assertThatAllOptionsAreSelected(expectedCount: number = 3): Promise<void> {
    await test.step(`Assert ${expectedCount} options are selected`, async () => {
      await this.verifier.verifyElementContainsText(this.addButton, `Add (${expectedCount})`, {
        assertionMessage: `Add button should show "Add (${expectedCount})" indicating ${expectedCount} sites selected`,
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Clicks the Add button to add selected sites to the newsletter
   */
  async clickAdd(): Promise<void> {
    await test.step('Click Add button', async () => {
      await this.clickOnElement(this.addButton, {
        stepInfo: 'Click Add button',
      });
    });
  }
}
