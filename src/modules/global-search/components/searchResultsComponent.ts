import { BaseComponent } from '@/src/core/components/baseComponent';
import { expect, Locator, Page, test } from '@playwright/test';

export class SearchResultsComponent extends BaseComponent {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
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
    this.searchInput = this.page.getByPlaceholder('Search', { exact: false });
    this.searchButton = this.page.locator('button[aria-label="Search"]');
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
      const searchResults = this.page.locator(`xpath=//h2[contains(@class,"itle_listTi") and text()="${term}"]`);
      // await searchResults.scrollIntoViewIfNeeded();
      return await this.verifier.verifyTheElementIsVisible(searchResults);
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

  async verifyCategoryIsDisplayed(term: string, category: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Verifying category "${category}" of "${term}" is displayed`, async () => {
      const categoryElement = this.page.locator(`[class*="category"][text()='${category}']`);
      await this.verifier.waitUntilElementIsVisible(categoryElement);
    });
  }

  async verifyThumbnailIsDisplayed(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Verifying thumbnail for "${term}" is displayed`, async () => {
      const thumbnailElement = this.page.locator(`[class*="thumbnail"]`);
      await this.verifier.waitUntilElementIsVisible(thumbnailElement);
    });
  }

  async verifySiteLabelIsDisplayed(term: string, options?: { stepInfo?: string }) {
    await test.step(options?.stepInfo || `Verifying site label for "${term}" is displayed`, async () => {
      const siteLabelElement = this.page.locator(`[class*="site-label"]`);
      await this.verifier.waitUntilElementIsVisible(siteLabelElement);
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
}
