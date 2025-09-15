import { expect, Locator, Page, test } from '@playwright/test';

import { AddContentModalComponent } from '../../components/addContentModal';
import { SiteNavigationComponent } from '../../components/site/SiteNavigationComponent';
import { ContentType } from '../../constants/contentType';
import { SitePageTab } from '../../constants/sitePageEnums';
import { AlbumCreationPage } from '../albumCreationPage';
import { EventCreationPage } from '../eventCreationPage';
import { PageCreationPage } from '../pageCreationPage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';

/**
 * SiteManager handles all site-related operations and navigation
 * Uses composition instead of inheritance to avoid circular dependencies
 */
export abstract class BaseSitePage extends BasePage {
  readonly siteId: string;
  readonly navigation: SiteNavigationComponent;
  readonly addContentModal: AddContentModalComponent;
  readonly addContentButton: Locator;
  readonly manageSiteButton: Locator;
  readonly siteNameHeading: Locator;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.SITE_PAGE(siteId));
    this.siteId = siteId;
    this.navigation = new SiteNavigationComponent(page, siteId);
    this.addContentModal = new AddContentModalComponent(page);
    this.addContentButton = this.page.locator("button[title='Add content']");
    this.manageSiteButton = this.page.locator("button[title='Manage site'], a[href*='/manage']");
    this.siteNameHeading = this.page.locator('[class*="SiteHeader-title-heading"]');
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
      await this.navigation.switchToTab(tabName);
    });
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
      await this.clickOnElement(this.addContentButton);
    });
  }

  /**
   * Navigates to manage site
   */
  async navigateToManageSite(): Promise<void> {
    await test.step('Navigate to manage site', async () => {
      await this.clickOnElement(this.manageSiteButton);
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
    await test.step(`Verify success message toast with text  "${successMessage}" is visible`, async () => {
      await this.verifyToastMessageIsVisibleWithText(successMessage);
    });
  }

  /**
   * Verifies the site name is displayed in the heading
   */
  async verifySiteNameIs(siteName: string): Promise<void> {
    await test.step(`Verify site name "${siteName}" is displayed in heading`, async () => {
      await expect(this.siteNameHeading, `should contain "${siteName}"`).toHaveText(siteName);
    });
  }
}
