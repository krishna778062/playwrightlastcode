import { Locator, Page, test } from '@playwright/test';

import { ResultListingComponent } from '@/src/modules/global-search/components/resultsListComponent';

/**
 * External Search List Component for handling external search provider links
 */
export class ExternalSearchListComponent extends ResultListingComponent {
  readonly externalSearchContainer: Locator;
  readonly externalSearchLinks: Locator;
  readonly externalSearchLinkItems: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.externalSearchContainer = this.rootLocator.locator("[data-testid='external-search-container']");
    this.externalSearchLinks = this.page.locator('li[class*=externalSearchlist] a');
    this.externalSearchLinkItems = this.externalSearchContainer.locator('a[target="_blank"]');
  }

  /**
   * Verifies the order of external search providers matches expected order
   * @param expectedProviders - Array of expected provider names in order
   */
  async verifyExternalSearchLinksOrder(expectedProviders: string[]) {
    await test.step(`Verifying external search links are in correct order: ${expectedProviders.join(', ')}`, async () => {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          for (let i = 0; i < expectedProviders.length; i++) {
            const linkElement = this.externalSearchLinks.nth(i);
            await this.verifier.waitUntilElementIsVisible(linkElement, {
              timeout: 40_000,
            });
            await this.verifier.verifyElementContainsText(linkElement, expectedProviders[i], {
              timeout: 5_000,
              assertionMessage: `External search link at position ${i + 1} should contain "${expectedProviders[i]}"`,
            });
          }
          break; // Success - exit retry loop
        } catch (error) {
          if (attempt === 2) throw error; // Final attempt failed

          await test.step('Names mismatch detected - refreshing page for retry', async () => {
            await this.page.reload();
          });
        }
      }
    });
  }

  /**
   * Clicks on external search links and verifies each opens in new tab with correct provider URL
   * @param providerNames - Array of provider names to click and verify
   */
  async verifyNavigationToExternalSearchLinks(providerNames: string[]) {
    await test.step('Testing external search links navigation', async () => {
      for (const providerName of providerNames) {
        await test.step(`Clicking on ${providerName} external search link and verifying new tab navigation`, async () => {
          // Find the specific provider link
          const providerLink = this.externalSearchLinks.filter({ hasText: providerName });

          // Click the link and wait for new page to open using utility method
          const newPage = await this.clickAndWaitForNewPageToOpen(() => this.clickOnElement(providerLink), {
            timeout: 40_000,
            stepInfo: `Clicking on ${providerName} external search link should open new page`,
          });

          // Verify the new tab URL contains the provider name
          await test.step(`Verify new tab URL contains provider "${providerName}"`, async () => {
            const currentUrl = newPage.url().toLowerCase();
            const providerNameLower = providerName.toLowerCase().replace(/[^a-z]/g, '');
            if (!currentUrl.includes(providerNameLower)) {
              throw new Error(`URL "${currentUrl}" does not contain provider name "${providerNameLower}"`);
            }
          });

          // Close the new tab and return to original
          await newPage.close();
        });
      }
    });
  }
}
