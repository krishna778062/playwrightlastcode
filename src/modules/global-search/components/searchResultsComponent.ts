import { BaseComponent } from '@/src/core/components/baseComponent';
import { th } from '@faker-js/faker/.';
import { $ } from '@faker-js/faker/dist/airline-BUL6NtOJ';
import { expect, Locator, Page, test } from '@playwright/test';
import { console } from 'inspector';
import { text } from 'stream/consumers';

export class SearchResultsComponent extends BaseComponent {
  // readonly searchResultsContainer!: Locator;
  // readonly resultTitle!: Locator;
  // readonly resultCategory!: Locator;
  // readonly resultThumbnail!: Locator;
  // readonly siteLabel!: Locator;
  // readonly siteIcon!: Locator;
  // readonly lockIcon: Locator;
  readonly copiedText: Locator;
  readonly categoryText: Locator;
  readonly copyLinkButton: Locator;
  readonly h1Text: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.copiedText = this.page.getByText('Copied');
    this.categoryText = this.page.locator('h2[class*="ist-headi"]');
    this.copyLinkButton = this.page.locator('[data-testid="copy-link-button"]');
    this.h1Text = this.page.locator('h1[class*="Header-title-headi"]');
  }

  getElementNearTitle(term: string, options?: { selector?: string; text?: string }): Locator {
    const listItem = this.page.getByRole('listitem').filter({
      has: this.page.locator('h2', { hasText: term }),
    });
    if (options?.selector) {
      return listItem.locator(options.selector);
    } else if (options?.text) {
      return listItem.getByText(options.text);
    }
    // Default: return the h2 heading itself if no options provided
    return listItem;
  }

  async verifyResultIsDisplayed(term: string, options?: { stepInfo?: string; maxRetries?: number }): Promise<boolean> {
    return await test.step(options?.stepInfo || `Verifying result "${term}" is displayed`, async () => {
      const maxRetries = options?.maxRetries || 3;
      for (let i = 0; i < maxRetries; i++) {
        try {
          const searchResults = this.getElementNearTitle(term);
          await searchResults.waitFor({ state: 'attached', timeout: 50000 });
          await searchResults.scrollIntoViewIfNeeded({ timeout: 50000 });
          return await this.verifier.verifyTheElementIsVisible(searchResults, { timeout: 50000 });
        } catch (error) {
          if (i === maxRetries - 1) {
            throw error;
          }
          await this.page.reload();
        }
      }
      return false;
    });
  }

  async verifyCategoryIsDisplayed(term: string, category: string, options?: { stepInfo?: string }) {
    const element = this.getElementNearTitle(term, { text: category });
    await test.step(options?.stepInfo || `Verifying category "${category}" is displayed for "${term}"`, async () => {
      await this.verifier.verifyTheElementIsVisible(element, { timeout: 20000 });
    });
  }

  async clickOnCategory(term: string, category: string, options?: { stepInfo?: string }) {
    const element = this.getElementNearTitle(term, { text: category });
    await this.verifier.waitUntilElementIsVisible(element, { timeout: 50000 });
    await test.step(options?.stepInfo || `Clicking category "${category}" for "${term}"`, async () => {
      await this.performActionAndWaitForPageNavigation(() => this.clickOnElement(element), /category/);
      await element.waitFor({ state: 'attached', timeout: 50000 });
      await this.verifier.waitUntilElementIsVisible(this.categoryText, { timeout: 900000 });
    });
  }

  async verifySiteLabelIsDisplayed(term: string, label: string, options?: { stepInfo?: string }) {
    const element = this.getElementNearTitle(term, { text: label });
    await test.step(options?.stepInfo || `Verifying label "${label}" is displayed for "${term}"`, async () => {
      await this.verifier.verifyTheElementIsVisible(element, { timeout: 20000 });
    });
  }

  async verifyFallBackIconIsDisplayed(term: string, options?: { stepInfo?: string }) {
    const element = this.getElementNearTitle(term, { selector: 'div[class*="Emblem-module__icon__"]' });
    await test.step(options?.stepInfo || `Verifying thumbnail is displayed for "${term}"`, async () => {
      await this.verifier.verifyTheElementIsVisible(element, { timeout: 20000 });
    });
  }

  async verifySiteIconIsDisplayed(term: string, options?: { stepInfo?: string }) {
    const element = this.getElementNearTitle(term, { selector: 'span i[data-testid="i-sites"]' });
    await test.step(options?.stepInfo || `Verifying site icon is displayed for "${term}"`, async () => {
      await this.verifier.verifyTheElementIsVisible(element, { timeout: 20000 });
    });
  }

  async verifyLockIconIsDisplayed(term: string, siteType: string, options?: { stepInfo?: string }) {
    await test.step(
      options?.stepInfo || `Verifying lock icon for "${term}" based on site type "${siteType}"`,
      async () => {
        const lockIcon = this.getElementNearTitle(term, { selector: '[data-testid="i-lock"]' });
        if (siteType !== 'public') {
          await this.verifier.verifyTheElementIsVisible(lockIcon);
        } else {
          await this.verifier.verifyTheElementIsNotVisible(lockIcon);
        }
      }
    );
  }

  async mouseOverOnResult(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Mouse over on "${term}"`, async () => {
      const element = this.getElementNearTitle(term);
      await element.waitFor({ state: 'visible', timeout: 50000 });
      await element.scrollIntoViewIfNeeded({ timeout: 50000 });
      await element.hover();
    });
  }

  async verifyCopyLinkButtonIsDisplayed(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Verifying copy link button for "${term}" is displayed`, async () => {
      const copyButton = this.getElementNearTitle(term, { selector: 'button[aria-label="Copy link"]' });
      await this.verifier.verifyTheElementIsVisible(copyButton, { timeout: 5000 });
    });
  }

  async clickCopyLinkButton(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Clicking copy link button for "${term}"`, async () => {
      const copyButton = this.getElementNearTitle(term, { selector: 'button[aria-label="Copy link"]' });
      await this.clickOnElement(copyButton);
    });
  }

  async verifyCopiedTextIsDisplayed(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Verifying "Copied" text is displayed for "${term}"`, async () => {
      const copyText = this.getElementNearTitle(term, { text: 'Copied' });
      await this.verifier.verifyTheElementIsVisible(copyText);
    });
  }

  async clickOnSearchResult(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Clicking on search result "${term}"`, async () => {
      const resultElement = this.page.locator(`xpath=//h2[contains(@class,"title_listTi") and text()="${term}"]`);
      await this.clickOnElement(resultElement);
    });
  }

  async clickOnThumbnail(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Clicking on thumbnail of "${term}"`, async () => {
      const thumbnailElement = this.page.locator(`[class*="thumbnail"]`);
      await this.clickOnElement(thumbnailElement);
    });
  }

  async verifyCopiedUrlNavigation(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Verify copied URL for "${term}" navigates to correct page`, async () => {
      const copiedUrl = await this.page.evaluate(() => navigator.clipboard.readText());
      await this.page.goto(copiedUrl);
      await expect(this.page).toHaveURL(term);
      await expect(this.h1Text).toContainText(term, { timeout: 50000 });
    });
  }

  async clickOnSiteAndVerifyNavigation(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Clicking on site "${term}" and verifying navigation`, async () => {
      // Click on the site name (h2 heading)
      const siteHeading = this.getElementNearTitle(term); // returns the h2 element
      await this.verifier.waitUntilElementIsVisible(siteHeading, { timeout: 20000 });
      await this.clickOnElement(siteHeading);

      await expect(this.page).toHaveURL(new RegExp(term));
      await expect(this.h1Text).toContainText(term, { timeout: 50000 });
    });
  }

  async clickOnThumbnailAndVerifyNavigation(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Clicking on thumbnail for "${term}" and verifying navigation`, async () => {
      // Find and click the thumbnail inside the correct list item
      const thumbnail = this.getElementNearTitle(term, { selector: 'div[class*="Emblem-module__icon__"]' });
      await this.clickOnElement(thumbnail);

      // Verify navigation: check URL and h1 text
      await expect(this.page).toHaveURL(new RegExp(term));
      await expect(this.h1Text).toContainText(term, { timeout: 50000 });
    });
  }
}
