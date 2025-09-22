import { Page, test } from '@playwright/test';

import { FooterComponent } from '@core/components/footerComponent';
import { SideNavBarComponent } from '@core/components/sideNavBarComponent';
import { TopNavBarComponent } from '@core/components/topNavBarComponent';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';

import { SiteManagementHelper } from '../../helpers/siteManagementHelper';

import { BasePage } from '@/src/core/pages/basePage';
import { ChatNavigationComponent } from '@/src/modules/chat/components/chatNavigationComponent';
import { ChatAppPage } from '@/src/modules/chat/pages/chatPage/chatPage';
import { AddContentModalComponent } from '@/src/modules/content/components/addContentModal';
import { CreateComponent } from '@/src/modules/content/components/createComponent';
import { NotificationComponent } from '@/src/modules/content/components/notificationComponent';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { AlbumCreationPage } from '@/src/modules/content/pages/albumCreationPage';
import { EventCreationPage } from '@/src/modules/content/pages/eventCreationPage';
import { FeaturedSitePage } from '@/src/modules/content/pages/featuredSitePage';
import { ManageContentPage } from '@/src/modules/content/pages/manageContentPage';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';
import { SiteCreationPage as ContentSiteCreationPage } from '@/src/modules/content/pages/siteCreationPage';
import { SiteCreationPage as AbacSiteCreationPage } from '@/src/modules/content-abac/pages/siteCreationPage';
import { GlobalSearchResultPage } from '@/src/modules/global-search/pages/globalSearchResultPage';

export interface ICommonHomePageActions {
  searchForTerm: (searchTerm: string, options?: { stepInfo?: string }) => Promise<GlobalSearchResultPage>;
  clickOnGlobalFeed: (options?: { stepInfo?: string }) => Promise<void>;
  clickOnMessageInbox: (options?: { stepInfo?: string }) => Promise<ChatNavigationComponent>;
  navigateToChatPageViaTopNavBar: (options?: { stepInfo?: string }) => Promise<ChatAppPage>;
  openSiteCreationForm: (options?: { stepInfo?: string }) => Promise<AbacSiteCreationPage>;
}

export interface IOldUxHomePageActions extends ICommonHomePageActions {
  clickOnCreateContentButtonOnTopNavBar: (
    contentType: ContentType,
    options?: { stepInfo?: string }
  ) => Promise<AddContentModalComponent>;
  openCreateContentPageForContentType: (
    contentType: ContentType,
    options?: { stepInfo?: string }
  ) => Promise<PageCreationPage | AlbumCreationPage | EventCreationPage>;
  openSiteCreationFormForNonAbac: (options?: { stepInfo?: string }) => Promise<ContentSiteCreationPage>;
  clickOnBellIcon: (options?: { stepInfo?: string }) => Promise<NotificationComponent>;
}

export interface INewUxHomePageActions extends ICommonHomePageActions {
  clickOnCreateButtonOnSideNavBar: (options?: { stepInfo?: string }) => Promise<CreateComponent>;
  openCreateContentPageForContentType: (
    contentType: ContentType,
    options?: { stepInfo?: string }
  ) => Promise<PageCreationPage | AlbumCreationPage | EventCreationPage>;
  clickOnFeaturedSitesTab: (options?: { stepInfo?: string }) => Promise<FeaturedSitePage>;
  openSiteCreationFormForNonAbac: (options?: { stepInfo?: string }) => Promise<ContentSiteCreationPage>;
  clickOnApplicationSettings: (options?: { stepInfo?: string }) => Promise<void>;
  verifyRolesButtonVisibility: (visible: boolean, options?: { stepInfo?: string }) => Promise<void>;
  clickOnBellIcon: (options?: { stepInfo?: string }) => Promise<NotificationComponent>;
  navigateToApplication: () => Promise<void>;
  clickOnManageFeature: () => Promise<void>;
  clickOnHomeButton: () => Promise<void>;
  clickOnFeedSideMenu: () => Promise<void>;
}

export abstract class BaseHomePage extends BasePage implements ICommonHomePageActions {
  //components
  readonly topNavBarComponent: TopNavBarComponent;
  readonly sideNavBarComponent: SideNavBarComponent;
  readonly footer: FooterComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.topNavBarComponent = new TopNavBarComponent(page);
    this.sideNavBarComponent = new SideNavBarComponent(page);
    this.footer = new FooterComponent(page, this.page.locator('#site-footer'));
  }

  getSideNavBarComponent(): SideNavBarComponent {
    return this.sideNavBarComponent;
  }

  getTopNavBarComponent(): TopNavBarComponent {
    return this.topNavBarComponent;
  }

  getFooterComponent(): FooterComponent {
    return this.footer;
  }

  /**
   * Verifies the home page is loaded
   */
  async verifyThePageIsLoaded(options?: { timeout?: number }): Promise<void> {
    await test.step('Verify the home page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.topNavBarComponent.profileSettingsButton, {
        timeout: options?.timeout || TIMEOUTS.MEDIUM,
        assertionMessage: `expecting messaging button to be visible`,
      });
    });
  }

  /**
   * Searches for a term in the global search
   * @param searchTerm - The term to search for
   * @param options - The options to pass to the method
   * @param options.stepInfo - The step info to pass to the test.step method
   * @returns The global search result page
   */
  async searchForTerm(searchTerm: string, options?: { stepInfo?: string }): Promise<GlobalSearchResultPage> {
    return await test.step(options?.stepInfo || `Searching for ${searchTerm}`, async () => {
      await this.topNavBarComponent.typeInSearchBarInput(searchTerm);
      await this.topNavBarComponent.clickSearchButton();
      return new GlobalSearchResultPage(this.page);
    });
  }

  /**
   * Clicks on the global feed link in the navigation
   * @param options - The options to pass to the method
   * @param options.stepInfo - The step info to pass to the test.step method
   */
  async clickOnGlobalFeed(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Clicking on global feed', async () => {
      await this.sideNavBarComponent.clickOnGlobalFeed();
    });
  }

  /**
   * Opens site creation modal - implementation varies between UX versions
   * @param options - The options to pass to the method
   * @param options.stepInfo - The step info to pass to the test.step method
   * @returns The site creation modal component
   */
  abstract openSiteCreationForm(options?: { stepInfo?: string }): Promise<AbacSiteCreationPage>;

  /**
   * Clicks on the application settings button on the side navigation panel
   * @param options - The options for the step
   */
  async clickOnApplicationSettings(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Clicking on Application settings', async () => {
      await this.sideNavBarComponent.clickOnApplicationSettings();
    });
  }

  /**
   * Verifies the visibility of Roles button on the side navigation panel
   * @param visible - The visibility of the Roles button
   * @param options - The options for the step
   */
  async verifyRolesButtonVisibility(visible: boolean, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify the visibility of Roles button', async () => {
      await this.sideNavBarComponent.verifyRolesButtonVisibility(visible);
    });
  }

  /**
   * Clicks on the message inbox via the top nav bar
   * @param options - The options for the step
   * @returns The chat navigation component
   */
  async clickOnMessageInbox(options?: { stepInfo?: string }): Promise<ChatNavigationComponent> {
    const chatNavigationComponent = new ChatNavigationComponent(this.page);
    await this.topNavBarComponent.openMessageInbox(options);
    await chatNavigationComponent.isCommonNavigationComponentVisible(options);
    return chatNavigationComponent;
  }

  /**
   * Navigates to the chat page via the top nav bar
   * @param options - The options for the step
   * @returns The chat app page
   */
  async navigateToChatPageViaTopNavBar(options?: { stepInfo?: string }): Promise<ChatAppPage> {
    const chatAppPage = new ChatAppPage(this.page);
    const chatNavigationComponent = await this.clickOnMessageInbox(options);
    await chatNavigationComponent.clickOnSeeAllMessagesButton(options);
    await chatAppPage.verifyThePageIsLoaded();
    return chatAppPage;
  }
}
