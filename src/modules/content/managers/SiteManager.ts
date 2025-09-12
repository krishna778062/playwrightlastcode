import { Page, test } from '@playwright/test';

import { AddContentModalComponent } from '../components/addContentModal';
import { SiteNavigationComponent } from '../components/site/SiteNavigationComponent';
import { ContentType } from '../constants/contentType';
import { SitePageTab } from '../constants/sitePageEnums';
import { AlbumCreationPage } from '../pages/albumCreationPage';
import { EventCreationPage } from '../pages/eventCreationPage';
import { PageCreationPage } from '../pages/pageCreationPage';
import { SiteDashboardPage } from '../pages/siteDashboardPage';
import { SiteAboutPage } from '../pages/sitePages/siteAboutPage';
import { SiteContentPage } from '../pages/sitePages/siteContentPage';
import { SiteFeedPage } from '../pages/sitePages/siteFeedPage';
import { SiteFilesPage } from '../pages/sitePages/siteFilesPage';
import { SiteQuestionsPage } from '../pages/sitePages/siteQuestionsPage';

import { BasePage } from '@/src/core/pages/basePage';

/**
 * SiteManager handles all site-related operations and navigation
 * Uses composition instead of inheritance to avoid circular dependencies
 */
export class SiteManager {
  private readonly page: Page;
  private readonly siteId: string;
  private readonly navigation: SiteNavigationComponent;
  private readonly addContentModal: AddContentModalComponent;

  constructor(page: Page, siteId: string) {
    this.page = page;
    this.siteId = siteId;
    this.navigation = new SiteNavigationComponent(page, siteId);
    this.addContentModal = new AddContentModalComponent(page);
  }

  /**
   * Gets the site ID
   */
  getSiteId(): string {
    return this.siteId;
  }

  /**
   * Gets the navigation component
   */
  getNavigation(): SiteNavigationComponent {
    return this.navigation;
  }

  /**
   * Navigates to a specific site tab via page load
   */
  async navigateToTab(tabName: SitePageTab): Promise<void> {
    await test.step(`Navigate to ${tabName} tab via page load`, async () => {
      const tabUrl = this.navigation.getSiteTabUrl(tabName);
      await this.page.goto(tabUrl);
    });
  }

  /**
   * Switches to a different tab from any site page
   */
  async switchToTab(tabName: SitePageTab): Promise<void> {
    await test.step(`Switch to ${tabName} tab`, async () => {
      const tabLocator = this.navigation.getTabLocator(tabName);
      await tabLocator.click();
    });
  }

  /**
   * Gets the appropriate page instance for a given tab
   */
  getPageForTab(tabName: SitePageTab): BasePage {
    switch (tabName) {
      case SitePageTab.DashboardTab:
        return new SiteDashboardPage(this.page, this.siteId);
      case SitePageTab.FilesTab:
        return new SiteFilesPage(this.page, this.siteId);
      case SitePageTab.FeedTab:
        return new SiteFeedPage(this.page, this.siteId);
      case SitePageTab.ContentTab:
        return new SiteContentPage(this.page, this.siteId);
      case SitePageTab.QuestionsTab:
        return new SiteQuestionsPage(this.page, this.siteId);
      case SitePageTab.AboutTab:
        return new SiteAboutPage(this.page, this.siteId);
      default:
        throw new Error(`Unknown tab: ${tabName}`);
    }
  }

  /**
   * Navigates to page creation from site dashboard
   */
  async navigateToPageCreation(): Promise<PageCreationPage> {
    return await test.step('Navigate to page creation from site dashboard', async () => {
      await this.clickAddContent();
      const pageCreationPage = await this.completeContentCreation(ContentType.PAGE);
      await pageCreationPage.verifyThePageIsLoaded();
      return pageCreationPage as PageCreationPage;
    });
  }

  /**
   * Navigates to album creation from site dashboard
   */
  async navigateToAlbumCreation(): Promise<AlbumCreationPage> {
    return await test.step('Navigate to album creation from site dashboard', async () => {
      await this.clickAddContent();
      const albumCreationPage = await this.completeContentCreation(ContentType.ALBUM);
      await albumCreationPage.verifyThePageIsLoaded();
      return albumCreationPage as AlbumCreationPage;
    });
  }

  /**
   * Navigates to event creation from site dashboard
   */
  async navigateToEventCreation(): Promise<EventCreationPage> {
    return await test.step('Navigate to event creation from site dashboard', async () => {
      await this.clickAddContent();
      const eventCreationPage = await this.completeContentCreation(ContentType.EVENT);
      await eventCreationPage.verifyThePageIsLoaded();
      return eventCreationPage as EventCreationPage;
    });
  }

  /**
   * Clicks the add content button
   */
  async clickAddContent(): Promise<void> {
    await test.step('Click on add content button', async () => {
      const addContentButton = this.navigation.siteHeaderElements.addContentButton;
      await addContentButton.click();
    });
  }

  /**
   * Navigates to manage site
   */
  async navigateToManageSite(): Promise<void> {
    await test.step('Navigate to manage site', async () => {
      const manageSiteButton = this.navigation.siteHeaderElements.manageSiteButton;
      await manageSiteButton.click();
    });
  }

  /**
   * Completes content creation from site page
   */
  private async completeContentCreation(
    contentType: ContentType
  ): Promise<PageCreationPage | AlbumCreationPage | EventCreationPage> {
    return await this.addContentModal.completeContentCreationForm(contentType);
  }

  /**
   * Verifies success message is visible
   */
  async verifySuccessMessage(successMessage: string): Promise<void> {
    await test.step(`Verify success message "${successMessage}" is visible`, async () => {
      const successMessageLocator = this.navigation.getSuccessMessageLocator(successMessage);
      await successMessageLocator.waitFor({ state: 'visible' });
    });
  }

  /**
   * Verifies the site name is displayed in the heading
   */
  async verifySiteName(siteName: string): Promise<void> {
    await test.step(`Verify site name "${siteName}" is displayed in heading`, async () => {
      const siteNameHeading = this.navigation.siteHeaderElements.siteNameHeading;
      await siteNameHeading.waitFor({ state: 'visible' });
      const headingText = await siteNameHeading.textContent();
      if (!headingText?.includes(siteName)) {
        throw new Error(`Site name heading should contain "${siteName}", but found: ${headingText}`);
      }
    });
  }
}
