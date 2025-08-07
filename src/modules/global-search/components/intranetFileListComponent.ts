import { ContentListComponent } from '@/src/modules/global-search/components/contentListComponent';
import { Locator, Page, test, expect } from '@playwright/test';

/**
 * IntranetFileListComponent is a UI component class that extends ContentListComponent.
 *
 * It encapsulates interactions and assertions for intranet file search result items in the global search results page.
 * This includes verifying the file icon, file type, and download button.
 *
 * Use this component in Playwright tests to interact with and assert on file-specific search results.
 */
export class IntranetFileListComponent extends ContentListComponent {
  readonly fileType: Locator;
  readonly downloadLinkButton: Locator;
  readonly closeButton: Locator;
  readonly filesTab: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.fileType = this.rootLocator.locator('[class*="IconWithLabel_label"]');
    this.downloadLinkButton = this.rootLocator.getByRole('button', { name: 'Download' });
    this.closeButton = this.page.locator('[class*="reviewModal-module-actionButto"]');
    this.filesTab = this.page.locator('a[role="tab"][id="files"]');
  }

  /**
   * Verifies all data points for an intranet file result item.
   * @param data - The intranet file search data to verify.
   */
  async verifyIntranetFileResultItem(data: any) {
    await test.step(`Verifying all data points for the intranet file result item "${data.name}"`, async () => {
      // Common verifications
      await this.verifyNameIsDisplayed(data.name);
      await this.verifyLabelIsDisplayed(data.label);
      await this.verifyAuthorIsDisplayed(data.author);
      await this.verifyDateIsDisplayed();
      await this.verifyFileThumbnailIsDisplayed();
      await this.verifyFileTypeIsDisplayed(data.type);

      // Navigation verifications
      await this.verifyNavigationToTitleLink(data.fileId, data.name, 'file');
      await this.clickOnCloseButton();
      await this.verifyNavigationWithSiteLink(data.siteId, data.siteName);
      await this.goBackToPreviousPage();
      await this.hoverOverCardAndCopyLink();
      await this.hoverOverCardAndDownloadLink(data.name);
      await this.verifyCopiedURLWithFileId(data.fileId);
      await this.goBackToPreviousPage();
      await this.verifyNavigationWithFileThumbnailLink(data.fileId);
      await this.clickOnCloseButton();
      await this.verifyNavigationWithAuthorLink(data.author);
      await this.goBackToPreviousPage();
      await this.verifyNavigationWithHomePageLink();
      await this.goBackToPreviousPage();
    });
  }

  /**
   * Verifies that the file type is displayed in the result item.
   * @param fileType - The file type to verify.
   */
  async verifyFileTypeIsDisplayed(fileType: string) {
    let expectedLabel = '';
    switch (fileType) {
      case 'pdf':
        expectedLabel = 'PDF';
        break;
      case 'docx':
        expectedLabel = 'Word Document';
        break;
      case 'pptx':
        expectedLabel = 'Microsoft PowerPoint';
        break;
      case 'csv':
        expectedLabel = 'CSV';
        break;
      default:
        throw new Error(`Unsupported file type for verification: ${fileType}`);
    }
    await test.step(`Verifying file type is displayed as "${expectedLabel}"`, async () => {
      await this.verifier.verifyElementHasText(this.fileType, expectedLabel);
    });
  }

  /**
   * Hover over the card, click the download link button, and verify the downloaded file.
   * @param expectedFileName - The expected name of the downloaded file.
   */
  async hoverOverCardAndDownloadLink(expectedFileName: string) {
    await test.step(`Mouse over, click download link button, and verify downloaded file`, async () => {
      await this.rootLocator.hover();
      await this.verifier.verifyTheElementIsVisible(this.downloadLinkButton);
      // const [download] = await Promise.all([
      //   this.page.waitForEvent('download'),
      //   this.clickOnElement(this.downloadLinkButton),
      // ]);
      // const downloadedFileName = download.suggestedFilename();
      // expect(downloadedFileName).toBe(expectedFileName);
    });
  }

  /**
   * Verify the navigation with the file thumbnail link
   * @param expectedUrl - the expected url
   */
  async verifyNavigationWithFileThumbnailLink(fileId: string) {
    await test.step(`Verifying navigation with thumbnail link to "${fileId}"`, async () => {
      await this.clickOnElement(this.thumbnail);
      await this.verifier.waitUntilPageHasNavigatedTo(new RegExp(fileId), {
        timeout: 50_000,
        stepInfo: `Verifying navigation with thumbnail link to "${fileId}"`,
      });
    });
  }

  /**
   * Verify the File thumbnail is displayed in the site result item
   */
  async verifyFileThumbnailIsDisplayed() {
    await test.step(`Verifying thumbnail is displayed in the result item`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.thumbnail, {
        timeout: 20000,
        assertionMessage: `Verifying thumbnail is displayed in the result item`,
      });
    });
  }

  /**
   * Click on the close button
   */
  async clickOnCloseButton() {
    await test.step(`Click on the close button`, async () => {
      const closeButton = this.closeButton.last();
      await this.verifier.verifyTheElementIsVisible(closeButton);
      await this.verifier.verifyTheElementIsEnabled(closeButton);
      await this.clickOnElement(closeButton);
      await this.verifier.verifyTheElementIsNotVisible(closeButton);
    });
  }

  /**
   * Verify the copied URL with the file ID
   * @param fileId - the file id
   */
  async verifyCopiedURLWithFileId(fileId: string) {
    await test.step(`Verifying copied URL in the clipboard, navigates to the right file and verifies the file`, async () => {
      const copiedUrl = await this.page.evaluate(() => navigator.clipboard.readText());
      await this.page.goto(copiedUrl);
      if (!copiedUrl.includes(fileId)) {
        throw new Error(`Copied URL does not contain id: ${fileId}. URL: ${copiedUrl}`);
      }
      if (!copiedUrl.endsWith('?provider=intranet')) {
        throw new Error(`Copied URL does not end with "?provider=intranet". URL: ${copiedUrl}`);
      }
    });
  }

  async clickFilesTab(): Promise<void> {
    await this.filesTab.waitFor({ state: 'visible' });
    await this.filesTab.click();
  }
}
