import { Locator, Page, test } from '@playwright/test';

import { AddContentModalComponent } from '../../components/addContentModal';
import { ContentType } from '../../constants/contentType';
import { SitePageTab } from '../../constants/sitePageEnums';
import { AlbumCreationPage } from '../albumCreationPage';
import { EventCreationPage } from '../eventCreationPage';
import { PageCreationPage } from '../pageCreationPage';

import { BasePage } from '@/src/core/pages/basePage';

/**
 * Gets the URL for a given site and tab
 * @param siteId - The ID of the site
 * @param tabName - The name of the tab
 * @returns The URL for the given site and tab
 */
export const getSiteTabUrl = (siteId: string, tabName: SitePageTab): string => {
  switch (tabName) {
    case SitePageTab.DashboardTab:
      return `/site/${siteId}/dashboard`;
    case SitePageTab.FeedTab:
      return `/site/${siteId}/feed`;
    case SitePageTab.ContentTab:
      return `/site/${siteId}/content`;
    case SitePageTab.QuestionsTab:
      return `/site/${siteId}/questions`;
    case SitePageTab.FilesTab:
      return `/site/${siteId}/files`;
    case SitePageTab.AboutTab:
      return `/site/${siteId}/about/managers`;
    default:
      throw new Error(`Unknown tab: ${tabName}`);
  }
};

export class BaseSitePage extends BasePage {
  readonly siteId: string;
  readonly tabLocator: (tabName: SitePageTab) => Locator;
  readonly addContentButton = this.page.locator("button[title='Add content']");
  readonly manageSiteButton = this.page.locator("button[title='Manage site'], a[href*='/manage']");
  readonly siteNameHeading = this.page.locator('h1');
  readonly addContentModal: AddContentModalComponent;

  readonly successMessage = (message: string) =>
    this.page.locator('div[class*="Toast-module"] p', { hasText: message });

  constructor(page: Page, siteId?: string) {
    super(page);
    this.siteId = siteId ?? '';
    this.tabLocator = (tabName: SitePageTab) => {
      return this.page.getByRole('tab', { name: tabName });
    };
    this.addContentModal = new AddContentModalComponent(page);
  }

  /**
   * Navigates to a tab via page load
   * It fetches the URL from the getSiteTabUrl function and navigates to it
   * @param tabName - The name of the tab to navigate to
   */
  async navigateToTabViaPageLoad(tabName: SitePageTab): Promise<void> {
    await test.step(`Navigate to ${tabName} tab via page load`, async () => {
      const tabUrl = getSiteTabUrl(this.siteId, tabName);
      await this.goToUrl(tabUrl);
    });
  }

  async clickOnAddContent(): Promise<void> {
    await test.step('Click on add content button', async () => {
      await this.clickOnElement(this.addContentButton);
    });
  }

  async navigateToManageSite(): Promise<void> {
    await test.step('Navigate to manage site', async () => {
      await this.clickOnElement(this.manageSiteButton, {
        stepInfo: 'Click manage site button',
      });
    });
  }

  /**
   * Switches to a different tab from any site page
   * @param tabName - The tab to switch to
   * @returns The page object for the switched tab
   */
  async switchToTab(tabName: SitePageTab): Promise<any> {
    switch (tabName) {
      case SitePageTab.FilesTab:
        await this.clickOnElement(this.tabLocator(tabName), { stepInfo: `switch to ${tabName} tab by clicking on it` });
        // Dynamic import to avoid circular dependency
        const { SiteFilesPage } = await import('./siteFilesPage');
        const siteFilesPage = new SiteFilesPage(this.page, this.siteId);
        await siteFilesPage.verifyThePageIsLoaded();
        return siteFilesPage;
      case SitePageTab.DashboardTab:
        await this.clickOnElement(this.tabLocator(tabName), { stepInfo: `switch to ${tabName} tab by clicking on it` });
        // Dynamic import to avoid circular dependency
        const { SiteDashboardPage } = await import('../siteDashboardPage');
        const siteDashboardPage = new SiteDashboardPage(this.page, this.siteId);
        await siteDashboardPage.verifyThePageIsLoaded();
        return siteDashboardPage;
      default:
        throw new Error(`Invalid tab name or its not implemented yet for : ${tabName}`);
    }
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify site dashboard page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      await this.verifier.verifyTheElementIsVisible(this.addContentButton);
    });
  }

  /**
   * Verifies the site name is displayed in the h1 heading
   * @param siteName - The expected site name
   */
  async verifySiteNameIs(siteName: string, successMessage: string): Promise<void> {
    await test.step(`Verify site name "${siteName}" is displayed in heading`, async () => {
      // Verify success message is visible
      await this.verifier.verifyTheElementIsVisible(this.successMessage(successMessage), {
        assertionMessage: `Success message "${successMessage}" should be visible after publishing`,
      });

      await this.verifier.verifyElementHasText(this.siteNameHeading, siteName, {
        assertionMessage: `Site name heading should contain "${siteName}"`,
      });
    });
  }

  /**
   * Navigates from site dashboard to page creation by verifying page load, clicking add content, and selecting content type
   * @returns PageCreationPage instance
   */
  async navigateToPageCreationFromSiteDashboard(): Promise<PageCreationPage> {
    return await test.step('Navigate to page creation from site dashboard', async () => {
      // Click on add content button
      await this.clickOnAddContent();
      // Select content type and navigate to page creation
      const pageCreationPage = await this.completeContentCreationFromSitePage(ContentType.PAGE);
      await pageCreationPage.verifyThePageIsLoaded();
      return pageCreationPage as PageCreationPage;
    });
  }

  async navigateToAlbumCreationFromSiteDashboard(): Promise<AlbumCreationPage> {
    return await test.step('Navigate to album creation from site dashboard', async () => {
      // Click on add content button
      await this.clickOnAddContent();
      // Select content type and navigate to album creation
      const albumCreationPage = await this.completeContentCreationFromSitePage(ContentType.ALBUM);
      await albumCreationPage.verifyThePageIsLoaded();
      return albumCreationPage as AlbumCreationPage;
    });
  }

  async navigateToEventCreationFromSiteDashboard(): Promise<EventCreationPage> {
    return await test.step('Navigate to event creation from site dashboard', async () => {
      // Click on add content button
      await this.clickOnAddContent();
      // Select content type and navigate to event creation
      const eventCreationPage = await this.completeContentCreationFromSitePage(ContentType.EVENT);
      await eventCreationPage.verifyThePageIsLoaded();
      return eventCreationPage as EventCreationPage;
    });
  }

  /**
   * Completes content creation from site dashboard
   * @param contentType - The content type to create
   */
  async completeContentCreationFromSitePage(
    contentType: ContentType
  ): Promise<PageCreationPage | AlbumCreationPage | EventCreationPage> {
    return await this.addContentModal.completeContentCreationForm(contentType);
  }
}
