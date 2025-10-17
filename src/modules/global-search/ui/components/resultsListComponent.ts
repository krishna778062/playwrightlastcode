import { Locator, Page, test } from '@playwright/test';

import { ContentType } from '@/src/core/constants/contentTypes';
import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

export class ResultListingComponent extends BaseComponent {
  readonly name: Locator;
  readonly label: Locator;
  readonly thumbnail: Locator;
  readonly thumbnailLink: Locator;
  readonly description: Locator;
  //action button
  readonly copyLinkButton: Locator;
  readonly toolTipMsg: Locator;
  //header nav bar
  readonly headerNavBar: Locator;
  readonly headerNavBarHomePageLink: Locator;
  // Lock icon
  readonly lockIcon: Locator;
  // Autocomplete locators
  readonly autocompleteList: Locator;
  readonly autocompleteSiteName: Locator;
  readonly autocompleteSiteLabel: Locator;
  readonly autocompleteSiteThumbnail: Locator;
  readonly autocompleteLockIcon: Locator;
  readonly autocompleteDateEmblem: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.name = this.rootLocator.locator("h2[class*='Title_listTitle']");
    this.headerNavBar = this.rootLocator.locator("[class*='ListingItem_header']").locator('nav');
    this.headerNavBarHomePageLink = this.headerNavBar.getByRole('link', { name: 'home page', exact: false });
    this.label = this.rootLocator.locator('[class*="IconWithLabel_label"]');
    this.thumbnail = this.rootLocator
      .locator('div[class*="ListingItem_thumbnail"]')
      .or(this.rootLocator.locator("[class*='ListingItem_smallThumbnail']"));
    this.thumbnailLink = this.thumbnail.locator('a');
    this.description = this.rootLocator.locator("[class*='ListingItem_description--']");
    this.copyLinkButton = this.rootLocator.getByRole('button', { name: 'Copy link' });
    this.toolTipMsg = this.rootLocator.locator("[role='tooltip']");
    this.lockIcon = this.rootLocator.locator("i[data-testid='i-lock'][role='img']");

    // Autocomplete locators
    this.autocompleteList = this.page.locator('div[class*="AutocompleteListingItem_wrapper"]');
    this.autocompleteSiteName = this.rootLocator;
    this.autocompleteSiteLabel = this.autocompleteSiteName.locator('p[class*="Typography-module__paragraph"]');
    this.autocompleteSiteThumbnail = this.autocompleteSiteName.locator(
      '[class*="Emblem-module__autoIconContainer"], [class*="Emblem-module__iconContainer"]'
    );
    this.autocompleteLockIcon = this.autocompleteSiteName.locator('[data-testid="i-lock"]');
    this.autocompleteDateEmblem = this.autocompleteSiteName.locator('[class*="DateEmblem-module__date"]').first();
  }

  /**
   * Hover over the card, click the copy link button, and verify the copied URL
   */
  async hoverOverCardAndCopyLink() {
    await test.step(`Mouse over and click on copy link button`, async () => {
      await this.page.waitForLoadState('load');
      await this.rootLocator.hover({ timeout: 40000 });
      await this.verifier.verifyTheElementIsVisible(this.copyLinkButton, {
        timeout: 20000,
        assertionMessage: `Verifying copy link button is visible`,
      });
      await this.clickOnElement(this.copyLinkButton);
      await this.verifier.verifyElementHasText(this.toolTipMsg.last(), 'Copied', {
        timeout: 8000,
        assertionMessage: `Verifying tooltip Copied text is displayed`,
      });
    });
  }

  /**
   * Verify the copied URL
   * @param id - the id of the site
   */
  async verifyCopiedURL(id: string) {
    await test.step(`Verifying copied URL in the clipboard, navigates to the right site and verifies the site`, async () => {
      const copiedUrl = await this.page.evaluate(() => navigator.clipboard.readText());
      await this.page.goto(copiedUrl);
      if (!copiedUrl.includes(id)) {
        throw new Error(`Copied URL does not contain id: ${id}. URL: ${copiedUrl}`);
      }
      if (!copiedUrl.includes('utm_source=search_result')) {
        throw new Error(`Copied URL does not contain utm_source=search_result. URL: ${copiedUrl}`);
      }
    });
  }

  /**
   * Click on the site thumbnail link
   */
  async clickOnThumbnailLink() {
    await test.step(`Clicking on the thumbnail link`, async () => {
      await this.clickOnElement(this.thumbnailLink, { timeout: 50_000 });
    });
  }

  /**
   * Click on the home page link
   */
  async clickOnHomePageLink() {
    await test.step(`Clicking on the home page link`, async () => {
      await this.clickOnElement(this.headerNavBarHomePageLink, { timeout: 50_000 });
    });
  }

  /** ---------------------------- VERIFICATIONS ---------------------------- */
  /**
   * Verify the site name is displayed in the site result item
   * @param siteName - the site name
   */
  async verifyNameIsDisplayed(name: string) {
    await test.step(`Verifying name "${name}" is displayed in the result item`, async () => {
      await this.verifier.verifyElementHasText(this.name, name, {
        timeout: 20000,
        assertionMessage: `Verifying name "${name}" is displayed in the result item`,
      });
    });
  }

  /**
   * Verify the site label is displayed in the site result item
   * @param siteLabel - the site label
   */
  async verifyLabelIsDisplayed(label: string) {
    await test.step(`Verifying label "${label}" is displayed in the result item`, async () => {
      await this.verifier.verifyElementHasText(this.label, label, {
        timeout: 20000,
        assertionMessage: `Verifying label "${label}" is displayed in the result item`,
      });
    });
  }

  /**
   * Verify the site thumbnail is displayed in the site result item
   */
  async verifyThumbnailIsDisplayed() {
    await test.step(`Verifying thumbnail is displayed in the result item`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.thumbnailLink, {
        timeout: 20000,
        assertionMessage: `Verifying thumbnail is displayed in the result item`,
      });
    });
  }

  /**
   * Verify the site description is displayed in the site result item
   * @param expectedDescription - the expected description
   */
  async verifyDescriptionIsDisplayed(expectedDescription: string) {
    await test.step(`Verifying description "${expectedDescription}" is displayed in the result item`, async () => {
      await this.verifier.verifyElementHasText(this.description, expectedDescription, {
        timeout: 20000,
        assertionMessage: `Verifying description "${expectedDescription}" is displayed in the result item`,
      });
    });
  }

  /**
   * Verify the navigation with the thumbnail link
   * @param expectedUrl - the expected url
   */
  async verifyNavigationWithThumbnailLink(id: string) {
    await test.step(`Verifying navigation with thumbnail link to "${id}"`, async () => {
      await this.clickOnThumbnailLink();
      await this.verifier.waitUntilPageHasNavigatedTo(new RegExp(id), {
        timeout: 50_000,
        stepInfo: `Verifying navigation with thumbnail link to "${id}"`,
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
      timeout: 20_000,
      stepInfo: `Verifying navigation with home page link`,
    });
  }

  /**
   * Verify the lock icon visibility
   * @param siteType - the site type
   */
  async verifyLockIconVisibility(type: string) {
    if (type === 'private' || type === 'unlisted') {
      await test.step(`Verifying lock icon is visible for "${type}" result`, async () => {
        await this.verifier.verifyTheElementIsVisible(this.lockIcon, { timeout: 5000 });
      });
    } else {
      await test.step(`Verifying lock icon is NOT visible for "${type}" result`, async () => {
        await this.verifier.verifyTheElementIsNotVisible(this.lockIcon, { timeout: 5000 });
      });
    }
  }

  /**
   * Get the site result item exactly matching the search term
   * @param searchTerm - the search term
   * @returns the site result item
   */
  async getResultItemExactlyMatchingTheSearchTerm(searchTerm: string) {
    const resultToLocate = this.page.locator('li').filter({
      has: this.page.locator('h2', { hasText: searchTerm }),
    });
    await this.verifier.verifyTheElementIsVisible(resultToLocate, { timeout: 40_000 });
    return new ResultListingComponent(this.page, resultToLocate);
  }

  /**
   * Verify navigation to result items
   * @param contentId - The unique ID of the content (used to verify navigation URL)
   * @param name - The display name/title of the content (used to locate the link)
   */
  async verifyNavigationToTitleLink(contentId: string, name: string, _type: string) {
    await test.step(`Verifying navigation to title link for "${name}"`, async () => {
      // Click the title link
      await this.clickOnElement(this.name, { timeout: 40000 });
      const utmUrlPattern = new RegExp(
        `${contentId}.*\\?utm_source=search_result&utm_term=${encodeURIComponent(name)}`
      );
      const finalUrlPattern = new RegExp(contentId);

      try {
        await this.page.waitForURL(url => utmUrlPattern.test(url.toString()) || finalUrlPattern.test(url.toString()), {
          timeout: 20000,
        });
      } catch (error) {
        throw new Error(
          `Verifying navigation with title link for "${name}" failed. Neither UTM URL nor final URL was loaded in time.\n${error}`
        );
      }
    });
  }

  async goBackToPreviousPage() {
    await test.step('Navigating back to the previous page', async () => {
      await this.page.goBack();
    });
  }

  /** ---------------------------- AUTOCOMPLETE VERIFICATIONS ---------------------------- */
  /**
   * Wait for autocomplete list to appear and verify it's displayed
   * If autocomplete is not displayed, retries by deleting last character and retyping it
   */
  async waitForAndVerifyAutocompleteListIsDisplayed(searchInputLocator?: Locator, searchTerm?: string): Promise<void> {
    await test.step('Waiting for autocomplete list to appear and verifying it is displayed', async () => {
      try {
        // Wait for at least one autocomplete item to appear
        await this.verifier.verifyTheElementIsVisible(this.autocompleteList.first(), {
          timeout: 20000,
          assertionMessage: 'Verifying autocomplete list is visible',
        });
      } catch (error) {
        // If autocomplete is not displayed, retry by deleting last character and retyping
        if (searchInputLocator && searchTerm && searchTerm.length > 0) {
          await test.step('Autocomplete not displayed, retrying by deleting last character and retyping', async () => {
            // Delete the last character
            await searchInputLocator.press('Backspace');

            // Retype the last character
            const lastChar = searchTerm[searchTerm.length - 1];
            await searchInputLocator.fill(lastChar);

            // Try to verify autocomplete list again
            await this.verifier.verifyTheElementIsVisible(this.autocompleteList.first(), {
              timeout: 10000,
              assertionMessage: 'Verifying autocomplete list is visible after retry',
            });
          });
        } else {
          throw error; // Re-throw the original error if we can't retry
        }
      }
    });
  }

  /**
   * Get specific autocomplete item by name
   * @param itemName - The item name to find
   * @returns ResultListingComponent instance for the specific item
   */
  getAutocompleteItemByName(itemName: string): ResultListingComponent {
    const specificItemLocator = this.autocompleteList.filter({
      has: this.page.locator('p').filter({ hasText: itemName }).first(),
    });
    return new ResultListingComponent(this.page, specificItemLocator);
  }

  /**
   * Verify item name in autocomplete item
   * @param expectedName - The expected item name
   */
  async verifyAutocompleteItemName(expectedName: string): Promise<void> {
    await test.step(`Verifying item name "${expectedName}" in autocomplete item`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.autocompleteSiteName, {
        timeout: 20000,
        assertionMessage: `Verifying item name "${expectedName}" in autocomplete item`,
      });
    });
  }

  /**
   * Verify item label in autocomplete item
   * @param expectedLabel - The expected item label
   */
  async verifyAutocompleteItemLabel(expectedLabel: string): Promise<void> {
    await test.step(`Verifying item label "${expectedLabel}" in autocomplete item`, async () => {
      await this.verifier.verifyElementHasText(this.autocompleteSiteLabel.last(), expectedLabel, {
        timeout: 20000,
        assertionMessage: `Verifying item label "${expectedLabel}" in autocomplete item`,
      });
    });
  }

  /**
   * Verify item thumbnail in autocomplete item
   * @param itemLabel - The item label to determine verification type
   */
  async verifyAutocompleteItemThumbnail(itemLabel?: string): Promise<void> {
    await test.step('Verifying item thumbnail in autocomplete item', async () => {
      if (itemLabel === ContentType.Event) {
        // For events, verify the date emblem
        await this.verifier.verifyTheElementIsVisible(this.autocompleteDateEmblem, {
          timeout: 20000,
          assertionMessage: 'Verifying date emblem in event autocomplete item',
        });
      } else {
        // For other content types, verify the thumbnail
        await this.verifier.verifyTheElementIsVisible(this.autocompleteSiteThumbnail, {
          timeout: 20000,
          assertionMessage: 'Verifying item thumbnail in autocomplete item',
        });
      }
    });
  }

  /**
   * Click on autocomplete item
   * @param itemName - The item name to click on
   */
  async clickOnAutocompleteItem(itemName: string): Promise<void> {
    await test.step(`Clicking on autocomplete item for "${itemName}"`, async () => {
      await this.clickOnElement(this.autocompleteSiteName, { timeout: 20000 });
    });
  }

  /**
   * Verify navigation to autocomplete item
   * @param contentId - The unique ID of the content (used to verify navigation URL)
   * @param name - The display name/title of the content (used to locate the link)
   * @param _type - The type of content (unused parameter for consistency)
   */
  async verifyAutocompleteNavigationToTitleLink(contentId: string, name: string, _type: string) {
    await test.step(`Verifying navigation to autocomplete title link for "${name}"`, async () => {
      // Click the autocomplete title link
      await this.clickOnElement(this.autocompleteSiteName, { timeout: 40000 });
      const utmUrlPattern = new RegExp(
        `${contentId}.*\\?utm_source=search_result&utm_term=${encodeURIComponent(name)}`
      );
      const finalUrlPattern = new RegExp(contentId);

      try {
        await this.page.waitForURL(url => utmUrlPattern.test(url.toString()) || finalUrlPattern.test(url.toString()), {
          timeout: 20000,
        });
      } catch (error) {
        throw new Error(
          `Verifying navigation with autocomplete title link for "${name}" failed. Neither UTM URL nor final URL was loaded in time.\n${error}`
        );
      }
    });
  }

  /**
   * Comprehensive verification of autocomplete item
   * @param itemName - The item name
   * @param itemLabel - The item label
   * @param itemType - The item type (optional, only used for lock icon visibility)
   */
  async verifyAutocompleteItemData(itemName: string, itemLabel: string, itemType?: string): Promise<void> {
    await test.step(`Verifying autocomplete item data for "${itemName}"`, async () => {
      await this.verifyAutocompleteItemName(itemName);
      await this.verifyAutocompleteItemLabel(itemLabel);
      await this.verifyAutocompleteItemThumbnail(itemLabel);
      // Use existing lock icon verification method (only for sites with private/unlisted access)
      if (itemType === SITE_TYPES.PRIVATE || itemType === SITE_TYPES.UNLISTED) {
        await this.verifyLockIconVisibility(itemType);
      }
    });
  }
}
