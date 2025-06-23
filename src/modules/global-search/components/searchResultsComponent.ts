import { BaseComponent } from '@/src/core/components/baseComponent';
import { expect, Locator, Page, test } from '@playwright/test';

export class SearchResultsComponent extends BaseComponent {
  readonly searchResultsContainer: Locator;
  readonly resultTitle: Locator;
  readonly resultCategory: Locator;
  readonly resultThumbnail: Locator;
  readonly siteLabel: Locator;
  readonly siteIcon: Locator;
  readonly copyLinkButton: Locator;
  // readonly lockIcon: Locator;
  readonly copiedText: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.searchResultsContainer = this.page.locator('xpath=(//*[contains(@class,"eContainer-module")])[1]');
    this.resultTitle = this.page.locator('xpath=//h2[contains(@class,"title_listTi")]');
    this.resultCategory = this.page.locator('xpath=//*[contains(@class,"category")]');
    this.resultThumbnail = this.page.locator('xpath=//*[contains(@class,"thumbnail")]');
    this.siteLabel = this.page.locator('xpath=//*[contains(@class,"site-label")]');
    this.siteIcon = this.page.locator('xpath=//*[contains(@class,"site-icon")]');
    this.copyLinkButton = this.page.locator('xpath=//*[contains(@class,"copy-link")]');
    // this.lockIcon = this.page.locator('xpath=//*[contains(@class,"lock-icon")]');
    this.copiedText = this.page.getByText('Copied');
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
    return this.verifyTextNearTitle(term, category, {
      stepInfo: options?.stepInfo || `Verifying category "${category}" is displayed for "${term}"`,
    });
  }

  async verifySiteLabelIsDisplayed(term: string, label: string, options?: { stepInfo?: string }) {
    return this.verifyTextNearTitle(term, label, {
      stepInfo: options?.stepInfo || `Verifying label "${label}" is displayed for "${term}"`,
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

  async verifyThumbnailIsDisplayed(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Verifying thumbnail for "${term}" is displayed`, async () => {
      const thumbnailElement = this.page.locator(`[class*="thumbnail"]`);
      await this.verifier.waitUntilElementIsVisible(thumbnailElement);
    });
  }

  async verifySiteIconIsDisplayed(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Verifying site icon for "${term}" is displayed`, async () => {
      const siteIconElement = this.page.locator(`[class*="site-icon"]`);
      await this.verifier.waitUntilElementIsVisible(siteIconElement);
    });
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

  async clickOnCategory(term: string, category: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Clicking on category "${category}" of "${term}"`, async () => {
      const categoryElement = this.page.locator(`xpath=//*[contains(@class,"category") and text()="${category}"]`);
      await this.clickOnElement(categoryElement);
    });
  }

  async verifyTextNearTitle(term: string, text: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Verifying text "${text}" is displayed for "${term}"`, async () => {
      const element = this.page
        .locator(`div:has(h2[class*="listTitle"]:has-text("${term}")) :has-text("${text}")`)
        .first();
      return await this.verifier.verifyTheElementIsVisible(element, { timeout: 20000 });
    });
  }
}
