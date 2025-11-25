import { Locator, Page, test } from '@playwright/test';

import { ContentListComponent } from '@/src/modules/global-search/ui/components/contentListComponent';

/**
 * FederatedSearchComponent handles interactions and verifications for federated search results.
 * This component supports dynamic locators for any federated integration (Box, Google Drive, etc.)
 */
export class FederatedSearchComponent extends ContentListComponent {
  readonly integrationsSection: Locator;
  readonly integrationItem: (integrationName: string) => Locator;
  readonly integrationLogo: (integrationName: string) => Locator;
  readonly integrationCount: (integrationName: string) => Locator;
  readonly fileResultItem: Locator;
  readonly fileLogo: (integrationName: string) => Locator;
  readonly fileIntegrationText: (integrationName: string) => Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.integrationsSection = this.page.locator('h3[class*="Typography-module__heading"]').filter({
      hasText: 'Your integrations',
    });
    this.integrationItem = (integrationName: string) =>
      this.page.locator(`span[class*="Typography-module__heading3"]`).filter({ hasText: integrationName }).first();
    this.integrationLogo = (integrationName: string) => this.page.locator(`img[alt="${integrationName}"]`);
    this.integrationCount = (integrationName: string) =>
      this.integrationItem(integrationName)
        .locator('..')
        .locator('..')
        .locator('div[class*="countSection"]')
        .locator('span[class*="Typography-module__secondary"]');
    this.fileResultItem = this.rootLocator;
    this.fileLogo = (integrationName: string) => this.fileResultItem.locator(`img[alt="${integrationName}"]`);
    this.fileIntegrationText = (integrationName: string) =>
      this.fileResultItem.locator('span').filter({ hasText: integrationName });
  }

  /**
   * Verifies the "Your integrations" heading is displayed
   */
  async verifyIntegrationsHeadingIsDisplayed() {
    await test.step('Verifying "Your integrations" heading is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.integrationsSection, {
        timeout: 40000,
        assertionMessage: 'Verifying "Your integrations" heading is displayed',
      });
    });
  }

  /**
   * Verifies the integration name is displayed in the integrations section
   * @param integrationName - The name of the integration (e.g., "Box")
   */
  async verifyIntegrationNameIsDisplayed(integrationName: string) {
    await test.step(`Verifying integration "${integrationName}" is displayed`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.integrationItem(integrationName), {
        timeout: 40000,
        assertionMessage: `Verifying integration "${integrationName}" is displayed`,
      });
    });
  }

  /**
   * Verifies the integration logo is displayed
   * @param integrationName - The name of the integration (e.g., "Box")
   */
  async verifyIntegrationLogoIsDisplayed(integrationName: string) {
    await test.step(`Verifying integration logo for "${integrationName}" is displayed`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.integrationLogo(integrationName), {
        timeout: 40000,
        assertionMessage: `Verifying integration logo for "${integrationName}" is displayed`,
      });
    });
  }

  /**
   * Verifies the integration count is displayed
   * @param integrationName - The name of the integration (e.g., "Box")
   */
  async verifyIntegrationCountIsDisplayed(integrationName: string) {
    await test.step(`Verifying integration count for "${integrationName}" is displayed`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.integrationCount(integrationName), {
        timeout: 40000,
        assertionMessage: `Verifying integration count for "${integrationName}" is displayed`,
      });
    });
  }

  /**
   * Clicks on the integration item
   * @param integrationName - The name of the integration (e.g., "Box")
   */
  async clickOnIntegration(integrationName: string) {
    await test.step(`Clicking on integration "${integrationName}"`, async () => {
      await this.clickOnElement(this.integrationItem(integrationName));
    });
  }

  /**
   * Verifies the file logo is displayed
   * @param integrationName - The name of the integration (e.g., "Box")
   */
  async verifyFileLogoIsDisplayed(integrationName: string) {
    await test.step(`Verifying file logo for "${integrationName}" is displayed`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.fileLogo(integrationName), {
        timeout: 40000,
        assertionMessage: `Verifying file logo for "${integrationName}" is displayed`,
      });
    });
  }

  /**
   * Verifies the file integration text is displayed
   * @param integrationName - The name of the integration (e.g., "Box")
   */
  async verifyFileIntegrationTextIsDisplayed(integrationName: string) {
    await test.step(`Verifying file integration text "${integrationName}" is displayed`, async () => {
      await this.verifier.verifyElementHasText(this.fileIntegrationText(integrationName), integrationName, {
        timeout: 40000,
        assertionMessage: `Verifying file integration text "${integrationName}" is displayed`,
      });
    });
  }

  /**
   * Verifies the date is displayed
   * @param date - The expected date string (e.g., "Nov 20, 2024")
   */
  async verifyFederatedFileDateIsDisplayed(date: string) {
    await test.step(`Verifying date "${date}" is displayed`, async () => {
      await this.verifier.verifyElementContainsText(this.resultList.last(), date, {
        timeout: 40000,
        assertionMessage: `Verifying date "${date}" is displayed`,
      });
    });
  }

  /**
   * Verify the copied URL with the provider parameter
   * @param integrationName - The name of the integration (e.g., "Box") - will be converted to lowercase for provider check
   */
  async verifyCopiedURLWithProvider(integrationName: string) {
    await test.step(`Verifying copied URL in the clipboard contains provider="${integrationName.toLowerCase()}"`, async () => {
      const copiedUrl = await this.readClipboardText();
      await this.page.goto(copiedUrl);
      const providerParam = `provider=${integrationName.toLowerCase()}`;
      if (!copiedUrl.includes(providerParam)) {
        throw new Error(`Copied URL does not contain "${providerParam}". URL: ${copiedUrl}`);
      }
    });
  }

  /**
   * Verify navigation to title link for federated search files
   * Similar to verifyNavigationToTitleLink but doesn't require fileId
   * @param fileName - The display name/title of the file (used to locate the link)
   * @param integrationName - The name of the integration (e.g., "Box")
   */
  async verifyNavigationToFederatedFileTitleLink(fileName: string, integrationName: string) {
    await test.step(`Verifying navigation to title link for federated file "${fileName}"`, async () => {
      // Click the title link
      await this.clickOnElement(this.name, { timeout: 40000 });
      // Wait for navigation - verify URL contains provider parameter and utm_source
      const providerParam = `provider=${integrationName.toLowerCase()}`;
      const utmPattern = new RegExp(`utm_source=search_result&utm_term=${encodeURIComponent(fileName)}`);

      try {
        await this.page.waitForURL(url => url.toString().includes(providerParam) && utmPattern.test(url.toString()), {
          timeout: 20000,
        });
      } catch (error) {
        throw new Error(
          `Verifying navigation with title link for federated file "${fileName}" failed. URL should contain "${providerParam}" and utm_source parameter.\n${error}`
        );
      }
    });
  }
}
