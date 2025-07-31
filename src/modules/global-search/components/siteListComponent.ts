import { Locator, Page, test } from '@playwright/test';

import { ResultListingComponent } from './resultsListComponent';

export class SiteListComponent extends ResultListingComponent {
  readonly category: Locator;
  readonly siteIcon: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.category = this.rootLocator.locator("[aria-label*='Uncategorized'] span");
    this.siteIcon = this.rootLocator.locator("[data-testid='i-sites']");
  }

  /**
   * Clicks on the category link
   */
  async clickOnCategoryLink() {
    await test.step(`Clicking on the Category link`, async () => {
      await this.clickOnElement(this.category);
    });
  }

  /**
   * Verifies category is displayed in the result item
   * @param expectedCategory - the expected category
   */
  async verifyCategoryIsDisplayed(expectedCategory: string) {
    await test.step(`Verifying category "${expectedCategory}" is displayed in the result item`, async () => {
      await this.verifier.verifyElementHasText(this.category, expectedCategory, {
        timeout: 20000,
        assertionMessage: `Verifying category "${expectedCategory}" is displayed in the result item`,
      });
    });
  }

  /**
   * Verifies clicking on site category link takes me to url which has category id
   * @param categoryId - the id of the category
   */
  async verifyNavigationWithCategoryLink(categoryId: string) {
    await test.step(`Verifying clicking on site category link takes me to url which has category id "${categoryId}"`, async () => {
      await this.clickOnCategoryLink();
      await this.verifier.waitUntilPageHasNavigatedTo(new RegExp(categoryId), {
        timeout: 80000,
        stepInfo: `Verifying navigation to category link to "${categoryId}"`,
      });
    });
  }

  /**
   * verify site icon is displayed
   */
  async verifySiteIconIsDisplayed() {
    await test.step(`Verifying site icon is displayed`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteIcon.nth(1));
    });
  }
}
