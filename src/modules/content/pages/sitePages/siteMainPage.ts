import test, { Locator, Page } from '@playwright/test';

import { FilesPreviewModalComponent } from '../../components/filesPreviewModalComponent';

import { SiteFilesPage } from './siteFilesPage';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/pages/basePage';

/**
 * A Site has many pages.
 * This class is for managing the Site Main page. This page is the main entry point for site-related functionalities.
 */
export class SiteMainPage extends BasePage {
  get gsBox(): Locator {
    return this.page.locator(`header[aria-label="Header"]`).locator('input');
  }
  gsNameOfTheSite: string = '';
  get gsDropDownFirstResult(): Locator {
    return this.page
      .locator(`header[aria-label="Header"]`)
      .locator(`a`)
      .locator(`p`, { hasText: this.gsNameOfTheSite })
      .first();
  }

  get filesTab(): Locator {
    return this.page.locator(`a[role='tab'][id='files']`);
  }
  get siteFilesLinkText(): Locator {
    return this.page.locator(`a[title="Site files"]`);
  }
  constructor(page: Page) {
    super(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilPageHasNavigatedTo(/site/);
    await this.verifier.verifyTheElementIsVisible(this.filesTab, { timeout: TIMEOUTS.MEDIUM });
  }

  /**
   * Landing on a Site Main page with a specific keyword.
   * @param keyword
   * @param keywordType
   */
  async landOnMainPageOfSite(fullNameOfTheSite: string) {
    await test.step(`Navigate to the "Public Site" ${fullNameOfTheSite}`, async () => {
      this.gsNameOfTheSite = fullNameOfTheSite;
      await this.verifier.isTheElementVisible(this.gsBox, { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.gsBox, { timeout: TIMEOUTS.MEDIUM });

      await this.fillInElement(this.gsBox, fullNameOfTheSite);
      await this.verifier.isTheElementVisible(this.gsDropDownFirstResult, { timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.gsDropDownFirstResult);

      await this.verifier.waitUntilPageHasNavigatedTo(/site/, { timeout: TIMEOUTS.MEDIUM });
      await this.verifier.verifyTheElementIsVisible(this.filesTab, { timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Once on the Site Main page, navigate to the Files tab.
   */
  async navigateToSiteFilesTab(): Promise<SiteFilesPage> {
    return await test.step(`Navigate to "Site > Files"`, async () => {
      await this.verifier.isTheElementVisible(this.filesTab, { timeout: TIMEOUTS.MEDIUM });
      await this.filesTab.click();
      const siteFilesPage = new SiteFilesPage(this.page);
      await siteFilesPage.verifyThePageIsLoaded();
      return siteFilesPage;
    });
  }
}
