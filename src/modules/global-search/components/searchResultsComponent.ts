import { BaseComponent } from '@/src/core/components/baseComponent';
import { $ } from '@faker-js/faker/dist/airline-BUL6NtOJ';
import { expect, Locator, Page, test } from '@playwright/test';
import { text } from 'stream/consumers';

export class SearchResultsComponent extends BaseComponent {
  // readonly searchResultsContainer!: Locator;
  // readonly resultTitle!: Locator;
  // readonly resultCategory!: Locator;
  // readonly resultThumbnail!: Locator;
  // readonly siteLabel!: Locator;
  // readonly siteIcon!: Locator;
  // readonly copyLinkButton!: Locator;
  // readonly lockIcon: Locator;
  readonly copiedText: Locator;
  readonly categoryText: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.copiedText = this.page.getByText('Copied');
    this.categoryText = this.page.locator('h2[class*="ist-headi"]');
  }

  getElementNearTitle(term: string, options?: { selector?: string; text?: string }): Locator {
    const listItem = this.page.getByRole('listitem').filter({
      has: this.page.getByRole('heading', { name: term }),
    });
    if (options?.selector) {
      return listItem.locator(options.selector);
    } else if (options?.text) {
      return listItem.getByText(options.text);
    }
    throw new Error('Either selector or text must be provided');
  }

  async verifyResultIsDisplayed(term: string, options?: { stepInfo?: string }): Promise<boolean> {
    return await test.step(options?.stepInfo || `Verifying result "${term}" is displayed`, async () => {
      const searchResults = this.page.locator(`h2[class*="listTitle"]:has-text("${term}")`);
      await searchResults.waitFor({ state: 'attached', timeout: 10000 });
      await searchResults.scrollIntoViewIfNeeded({ timeout: 10000 });
      return await this.verifier.verifyTheElementIsVisible(searchResults, { timeout: 20000 });
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
    await test.step(options?.stepInfo || `Clicking category "${category}" for "${term}"`, async () => {
      await this.performActionAndWaitForPageNavigation(() => this.clickOnElement(element), /category/);
      await this.verifier.waitUntilElementIsVisible(this.categoryText, { timeout: 100000 });
    });
  }

  async verifySiteLabelIsDisplayed(term: string, label: string, options?: { stepInfo?: string }) {
    const element = this.getElementNearTitle(term, { text: label });
    await test.step(options?.stepInfo || `Verifying label "${label}" is displayed for "${term}"`, async () => {
      await this.verifier.verifyTheElementIsVisible(element, { timeout: 20000 });
    });
  }

  async verifyThumbnailIsDisplayed(term: string, options?: { stepInfo?: string }) {
    const element = this.getElementNearTitle(term, { selector: 'img[class*="Emblem-module__image"]' });
    await test.step(options?.stepInfo || `Verifying thumbnail is displayed for "${term}"`, async () => {
      await this.verifier.verifyTheElementIsVisible(element, { timeout: 20000 });
    });
  }

  async verifySiteIconIsDisplayed(term: string, options?: { stepInfo?: string }) {
    const element = this.getElementNearTitle(term, { selector: '[data-testid="i-sites"]' });
    await test.step(options?.stepInfo || `Verifying site icon is displayed for "${term}"`, async () => {
      await this.verifier.verifyTheElementIsVisible(element, { timeout: 20000 });
    });
  }

  async verifyLockIconIsDisplayed(term: string, siteType: string, options?: { stepInfo?: string }) {
    await test.step(
      options?.stepInfo || `Verifying lock icon for "${term}" based on site type "${siteType}"`,
      async () => {
        const lockIcon = this.page.locator(`xpath=//*[text()="${term}"]/../i`);
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
      const resultElement = this.page.locator(`xpath=//h2[contains(@class,"title_listTi") and text()="${term}"]`);
      await resultElement.hover();
    });
  }

  async verifyCopyLinkButtonIsDisplayed(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Verifying copy link button for "${term}" is displayed`, async () => {
      await this.verifier.waitUntilElementIsVisible(this.copyLinkButton);
      await expect(this.copyLinkButton).toBeVisible();
    });
  }

  async clickCopyLinkButton(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Clicking copy link button for "${term}"`, async () => {
      await this.clickOnElement(this.copyLinkButton);
    });
  }

  async verifyCopiedTextIsDisplayed(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Verifying "Copied" text is displayed for "${term}"`, async () => {
      await this.verifier.waitUntilElementIsVisible(this.copiedText);
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
}
