import { BaseComponent } from '@/src/core/components/baseComponent';
import { Locator, Page, test } from '@playwright/test';

export class SiteResultItemComponent extends BaseComponent {
  readonly siteName: Locator;

  //   readonly siteCategory: Locator;  //TODO: not sure what this means
  readonly siteLabel: Locator;
  readonly siteThumbnail: Locator;
  readonly siteThumbnailLink: Locator;
  readonly siteDescription: Locator;

  //action buttton
  readonly copyLinkButton: Locator;

  //header nav bar
  readonly headerNavBar: Locator;
  readonly headerNavBarHomePageLink: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.siteName = this.rootLocator.locator("h2[class*='Title_listTitle']");

    //header
    this.headerNavBar = this.rootLocator.locator("[class*='ListingItem_header']").locator('nav');
    this.headerNavBarHomePageLink = this.headerNavBar.getByRole('link', { name: 'home page', exact: false });
    // this.siteCategory =
    this.siteLabel = this.rootLocator.locator('[class*="IconWithLabel_label"]');
    this.siteThumbnail = this.rootLocator
      .locator('div[class*="ListingItem_thumbnail"]')
      .or(this.rootLocator.locator("[class*='ListingItem_smallThumbnail']"));
    this.siteThumbnailLink = this.siteThumbnail.locator('a');
    this.siteDescription = this.rootLocator.locator("[class*='ListingItem_description--']");

    //ACTION BUTTONS
    this.copyLinkButton = this.rootLocator.getByRole('button', { name: 'Copy link' });
  }

  /** ---------------------------- ACTIONS ---------------------------- */
  /**
   * Hover over the card and click on the copy link button
   */
  async hoverOverCardAndCopySiteLink() {
    await this.rootLocator.hover();
    await this.verifier.verifyTheElementIsVisible(this.copyLinkButton, { timeout: 20000 });
    await this.copyLinkButton.click();
  }

  /**
   * Click on the site thumbnail link
   */
  async clickOnSiteThumbnailLink() {
    await test.step(`Clicking on the site thumbnail link`, async () => {
      await this.clickOnElement(this.siteThumbnailLink);
    });
  }

  /**
   * Click on the home page link
   */
  async clickOnHomePageLink() {
    await test.step(`Clicking on the home page link`, async () => {
      await this.clickOnElement(this.headerNavBarHomePageLink);
    });
  }

  /** ---------------------------- VERIFICATIONS ---------------------------- */
  /**
   * Verify the site name is displayed in the site result item
   * @param siteName - the site name
   */
  async verifySiteNameIsDisplayed(siteName: string) {
    await test.step(`Verifying site name "${siteName}" is displayed in the site result item`, async () => {
      await this.verifier.verifyElementHasText(this.siteName, siteName, {
        timeout: 20000,
        assertionMessage: `Verifying site name "${siteName}" is displayed in the site result item`,
      });
    });
  }

  /**
   * Verify the site label is displayed in the site result item
   * @param siteLabel - the site label
   */
  async verifySiteLabelIsDisplayed(siteLabel: string) {
    await test.step(`Verifying site label "${siteLabel}" is displayed in the site result item`, async () => {
      await this.verifier.verifyElementHasText(this.siteLabel, siteLabel, {
        timeout: 20000,
        assertionMessage: `Verifying site label "${siteLabel}" is displayed in the site result item`,
      });
    });
  }

  /**
   * Verify the site thumbnail is displayed in the site result item
   */
  async verifySiteThumbnailIsDisplayed() {
    await test.step(`Verifying site thumbnail is displayed in the site result item`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteThumbnailLink, {
        timeout: 20000,
        assertionMessage: `Verifying site thumbnail is displayed in the site result item`,
      });
    });
  }

  /**
   * Verify the site description is displayed in the site result item
   * @param expectedDescription - the expected description
   */
  async verifySiteDescriptionIsDisplayed(expectedDescription: string) {
    await test.step(`Verifying site description "${expectedDescription}" is displayed in the site result item`, async () => {
      await this.verifier.verifyElementHasText(this.siteDescription, expectedDescription, {
        timeout: 20000,
        assertionMessage: `Verifying site description "${expectedDescription}" is displayed in the site result item`,
      });
    });
  }

  /**
   * Verify the navigation with the thumbnail link
   * @param expectedUrl - the expected url
   */
  async verifyNavigationWithThumbnailLink(siteId: string) {
    await test.step(`Verifying navigation with thumbnail link to "${siteId}"`, async () => {
      await this.clickOnSiteThumbnailLink();
      await this.verifier.waitUntilPageHasNavigatedTo(new RegExp(siteId), {
        timeout: 20000,
        stepInfo: `Verifying navigation with thumbnail link to "${siteId}"`,
      });
    });
  }

  /**
   * Verify the navigation with the home page link
   * @param expectedUrl - the expected url
   */
  async verifyNavigationWithHomePageLink() {
    await this.clickOnHomePageLink();
    await this.verifier.waitUntilPageHasNavigatedTo(new RegExp('home'), {
      timeout: 20000,
      stepInfo: `Verifying navigation with home page link`,
    });
  }
}
