import { expect, Page, test } from '@playwright/test';

import { BaseActionUtil } from '@core/utils/baseActionUtil';
import { BaseVerificationUtil } from '@core/utils/baseVerificationUtil';
import { FileUtil } from '@core/utils/fileUtil';
import { StringArrayVerifier } from '@core/utils/stringArrayUtils';

export abstract class BasePage extends BaseActionUtil {
  readonly verifier: BaseVerificationUtil;
  readonly stringArrayVerifier: StringArrayVerifier;
  readonly pageUrl: string;
  constructor(page: Page, pageUrl?: string) {
    super(page);
    this.verifier = new BaseVerificationUtil(page);
    this.stringArrayVerifier = new StringArrayVerifier(page);
    this.pageUrl = pageUrl || '';
  }

  /**
   * @description
   * Every page should have a method to verify that the page is loaded
   * It could be custom and can be defined as per page boundaries
   * @example
   * To say login page is loaded, I can verify that the login button is visible
   * To say home page is loaded, I can verify that the home page title is visible
   */
  abstract verifyThePageIsLoaded(): Promise<void>;

  /**
   * @description
   * Loads the page
   * @param options - The options to pass to the visitPage method
   * @param options.stepInfo - The step info to pass to the test.step method
   * @param options.timeout - The timeout to pass to the page.goto method
   */
  async loadPage(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo || `Loading page ${this.pageUrl}`, async () => {
      if (this.pageUrl !== '') {
        await this.goToUrl(this.pageUrl);
      } else {
        throw new Error('Page URL is not set for this page');
      }
      await this.verifyThePageIsLoaded();
    });
  }

  /**
   * Generic method to click Cancel button in any modal/popup
   * @param cancelButton - The cancel button locator
   * @param stepInfo - Optional custom step information
   */
  async clickCancelButton(cancelButton: any, stepInfo?: string): Promise<void> {
    await this.clickOnElement(cancelButton, {
      stepInfo: stepInfo || 'Click Cancel button',
    });
  }

  /**
   * Generic method to add description in any modal/popup
   * @param descriptionInput - The description input locator
   * @param description - The description text to add
   * @param stepInfo - Optional custom step information
   */
  async addDescription(descriptionInput: any, description: string, stepInfo?: string): Promise<void> {
    await this.fillInElement(descriptionInput, description, {
      stepInfo: stepInfo || `Add description: ${description}`,
    });
  }

  /**
   * Generic method to click Close (X) button in any modal/popup
   * @param closeButton - The close button locator
   * @param stepInfo - Optional custom step information
   */
  async clickCloseButton(closeButton: any, stepInfo?: string): Promise<void> {
    await this.clickOnElement(closeButton, {
      stepInfo: stepInfo || 'Click Close (X) button',
    });
  }

  /**
   * @description
   * Reloads the page
   * @param options - The options to pass to the visitPage method
   * @param options.stepInfo - The step info to pass to the test.step method
   * @param options.timeout - The timeout to pass to the page.goto method
   */
  async reloadPage(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo || `Reloading page`, async () => {
      await this.page.reload();
      await this.verifyThePageIsLoaded();
    });
  }

  /**
   * @description
   * Checks for Page not found error
   */
  async verifyPageNotFoundVisibility(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo || `Verify the page - Page not found`, async () => {
      await expect(this.page.locator('h1', { hasText: 'Page not found' })).toBeVisible();
    });
  }

  /**
   * @description
   * Checks for Access Denied error page
   */
  async verifyAccessDeniedPageVisibility(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo || `Verify the page - Access Denied`, async () => {
      await expect(this.page.locator('h1', { hasText: 'Access denied' })).toBeVisible();
      await expect(
        this.page
          .locator('[class*="no-results"] div')
          .filter({ hasText: 'You are not authorized to access this resource, please contact your administrator.' })
      ).toBeVisible();
    });
  }

  /**
   * Generic method to handle file downloads with automatic cleanup
   * @param downloadTrigger - Function that triggers the download (e.g., () => this.clickOnElement(downloadButton))
   * @param stepInfo - Optional custom step information
   * @param cleanup - Whether to automatically delete the downloaded file (default: true)
   * @param timeout - Download timeout (default: TIMEOUTS.MEDIUM)
   * @returns Promise with download object for additional verification if needed
   */
  async downloadFileWithCleanup(
    downloadTrigger: () => Promise<void>,
    options?: {
      stepInfo?: string;
      cleanup?: boolean;
      timeout?: number;
    }
  ) {
    return await test.step(options?.stepInfo || 'Download file with cleanup', async () => {
      const [download] = await Promise.all([
        this.page.waitForEvent('download', { timeout: options?.timeout || 30000 }),
        downloadTrigger(),
      ]);

      // Get download info
      const downloadPath = await download.path();
      const filename = download.suggestedFilename();

      // Automatic cleanup if enabled (default: true)
      if (options?.cleanup !== false && downloadPath) {
        FileUtil.deleteTemporaryFile(downloadPath);
      }

      return { download, downloadPath, filename };
    });
  }
}
