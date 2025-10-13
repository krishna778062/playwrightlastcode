import { CreateComponent as AbacCreateComponent } from '@content-abac/ui/components/globalCreateContainerComponent';
import { Page, test } from '@playwright/test';

import { CreateComponent } from '@content/ui/components/createComponent';

import { TestOptions } from '../types';
import { SideNavBarComponent, TopNavBarComponent } from '../ui/components';
import { ApplicationSettingsOption } from '../ui/types/navigation.types';
import { getEnvConfig } from '../utils/getEnvConfig';

import { EmailNotificationAppSettingsPage } from '@/src/modules/alert-notification/ui/pages/emailNotificationAppSettingsPage';
import { ChatNavigationComponent } from '@/src/modules/chat/ui/components/chatNavigationComponent';
import { ChatAppPage } from '@/src/modules/chat/ui/pages/chatPage/chatPage';
import { ContentType } from '@/src/modules/content/constants';
import {
  AddContentModalComponent,
  AlbumCreationPage,
  EventCreationPage,
  FeaturedSitePage,
  ManageApplicationPage,
  NotificationComponent,
  PageCreationPage,
  SiteCreationPage,
} from '@/src/modules/content/ui';
import { SiteCreationPageAbac } from '@/src/modules/content-abac/ui/pages/siteCreationPageAbac';
import { GlobalSearchResultPage } from '@/src/modules/global-search/ui/pages/globalSearchResultPage';

export interface ICommonHomePageActions {
  searchForTerm: (searchTerm: string, options?: { stepInfo?: string }) => Promise<GlobalSearchResultPage>;
  clickOnGlobalFeed: (options?: { stepInfo?: string }) => Promise<void>;
  clickOnMessageInbox: (options?: { stepInfo?: string }) => Promise<ChatNavigationComponent>;
  navigateToChatPageViaTopNavBar: (options?: { stepInfo?: string }) => Promise<ChatAppPage>;
  openSiteCreationForm: (
    isAbacEnabled: boolean,
    options?: TestOptions
  ) => Promise<SiteCreationPage | SiteCreationPageAbac>;
  verifyRolesButtonVisibility: (visible: boolean, options?: TestOptions) => Promise<void>;
}

export interface ICommonHomePageAssertions {
  verifyErrorMessageWhenContentSubmissionIsDisabled: (
    addContentModal: AddContentModalComponent,
    contentType: ContentType
  ) => Promise<void>;
}

export class NavigationHelper {
  readonly isNewUx: boolean;
  readonly topNavBarComponent: TopNavBarComponent;
  readonly sideNavBarComponent: SideNavBarComponent;
  constructor(private readonly page: Page) {
    this.isNewUx = getEnvConfig().newUxEnabled;
    this.topNavBarComponent = new TopNavBarComponent(page);
    this.sideNavBarComponent = new SideNavBarComponent(page);
  }

  /**
   * Searches for a term in the global search
   * @param searchTerm - The term to search for
   * @param options - The options to pass to the method
   * @param options.stepInfo - The step info to pass to the test.step method
   * @returns The global search result page
   */
  async searchForTerm(searchTerm: string, options: TestOptions): Promise<GlobalSearchResultPage> {
    return await test.step(options?.stepInfo || `Searching for ${searchTerm}`, async () => {
      await this.topNavBarComponent.searchForTerm(searchTerm, options);
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
   * Clicks the Create button, verifies the ABAC create container,
   * selects the Site option, and returns the Site creation page
   * @param options - Options for the step
   * @returns The SiteCreationPage instance
   */
  async openSiteCreationForm(
    isAbacEnabled: boolean,
    options?: TestOptions
  ): Promise<SiteCreationPage | SiteCreationPageAbac> {
    return await test.step(options?.stepInfo || 'Opening site creation form', async () => {
      // Click the Create button (returns content CreateComponent for interface compatibility)
      await this.sideNavBarComponent.clickOnCreateButton();
      if (isAbacEnabled) {
        // Use ABAC-specific CreateComponent to select Site option
        const abacCreate = new AbacCreateComponent(this.page);
        await abacCreate.verifyTheCreateComponentIsVisible();
        await abacCreate.selectSiteOptionAndOpenModal();
        return new SiteCreationPageAbac(this.page);
      } else {
        const createComponent = new CreateComponent(this.page);
        await createComponent.verifyTheCreateComponentIsVisible();
        return await createComponent.selectSiteOption();
      }
    });
  }

  /**
   * Clicks on Featured Sites tab from the side navigation bar
   * @param options - Options for the step
   */
  async clickOnFeaturedSitesTab(options?: TestOptions): Promise<FeaturedSitePage> {
    return await test.step(
      options?.stepInfo || 'Click on sites tab from side nav bar should open featured sites page',
      async () => {
        await this.sideNavBarComponent.clickOnSites();
        const featuredSitePage = new FeaturedSitePage(this.page);
        await featuredSitePage.verifyThePageIsLoaded();
        return featuredSitePage;
      }
    );
  }

  /**
   * Navigates to the application settings page
   * @param options - Options for the step
   */
  async openApplicationSettings(options?: TestOptions): Promise<void> {
    await this.sideNavBarComponent.clickOnApplicationSettings(options);
  }

  async openManageFeatureSectionInSideBar(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Clicking on manage feature on side bar', async () => {
      await this.sideNavBarComponent.clickOnManageFeature.click();
    });
  }

  async clickOnHomeButton(): Promise<void> {
    await test.step('Clicking on home button on side bar', async () => {
      await this.sideNavBarComponent.clickingOnHome.click();
    });
  }

  async clickOnFeedSideMenu(): Promise<void> {
    await test.step('Clicking on application', async () => {
      await this.sideNavBarComponent.clickOnFeedSideMenu.click();
    });
  }

  async clickOnBellIcon(options?: { stepInfo?: string }): Promise<NotificationComponent> {
    await this.topNavBarComponent.clickOnBellIconToOpenNotifications(options);
    return new NotificationComponent(this.page);
  }

  async verifyErrorMessageWhenContentSubmissionIsDisabled(
    addContentModal: AddContentModalComponent,
    contentType: ContentType
  ) {
    await test.step('Verify error message when content submission is disabled', async () => {
      await addContentModal.verifyErrorMessageWhenContentSubmissionIsDisabled(contentType);
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

  /**
   * Verifies the visibility of Roles button on the side navigation panel
   * @param visible - The visibility of the Roles button
   * @param options - The options for the step
   */
  async verifyRolesButtonVisibility(visible: boolean, options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Verify the visibility of Roles button', async () => {
      await this.sideNavBarComponent.verifyRolesButtonVisibility(visible);
    });
  }

  async openCreateContentPageForContentType(
    contentType: ContentType,
    siteName?: string,
    options?: { stepInfo?: string }
  ): Promise<PageCreationPage | AlbumCreationPage | EventCreationPage> {
    return await test.step(options?.stepInfo || `Opening create content page for ${contentType}`, async () => {
      await this.sideNavBarComponent.clickOnCreateButton();
      const createComponent = new CreateComponent(this.page);
      await createComponent.verifyTheCreateComponentIsVisible();
      const addContentModal = await createComponent.selectContentTypeAndCreateContent(contentType);
      return await addContentModal.completeContentCreationForm(contentType, {
        isFromHomePage: true,
        siteName: siteName,
      });
    });
  }

  async openAddContentModal(
    contentType: ContentType,
    siteName?: string,
    options?: { stepInfo?: string }
  ): Promise<AddContentModalComponent> {
    return await test.step(options?.stepInfo || `Opening create content page for ${contentType}`, async () => {
      await this.topNavBarComponent.clickOnCreateContentButton(options);
      const addContentModal = new AddContentModalComponent(this.page);
      await addContentModal.verifyTheAddContentModalIsVisible(contentType);
      return addContentModal;
    });
  }

  /**
   * Clicks on the social campaigns link in the side navigation bar
   * @param options - The options for the step
   */
  async clickOnSocialCampaigns(): Promise<void> {
    await test.step('Clicking on social campaigns', async () => {
      // Check if Social campaigns is directly visible
      try {
        await this.sideNavBarComponent.socialCampaignsElement.click();
      } catch (error) {
        console.log('DEBUG: Error clicking on social campaigns', error);
        console.log('DEBUG: Social campaigns is not visible, clicking on more to expand the menu');
        await this.sideNavBarComponent.moreElement.click();
      }
    });
  }

  /**
   * Navigates to email notification settings page by side nav bar
   */
  async navigateToEmailNotificationSettingsPageViaSideNavBar(options?: {
    stepInfo?: string;
  }): Promise<EmailNotificationAppSettingsPage> {
    return await test.step(
      options?.stepInfo || 'Navigating to email notification settings page via side nav bar',
      async () => {
        //click on application settings and click on application
        await this.sideNavBarComponent.openApplicationSettingsAndSelectMenuOptionFromSideNav(
          ApplicationSettingsOption.APPLICATION
        );
        //verify manage application page is visible
        const manageApplicationPage = new ManageApplicationPage(this.page);
        await manageApplicationPage.verifyThePageIsLoaded();
        // move to defaults tab
        await manageApplicationPage.actions.clickOnDefaults();
        // verify email notification settings page is visible
        const emailNotificationAppSettingsPage = new EmailNotificationAppSettingsPage(this.page);
        await emailNotificationAppSettingsPage.verifyThePageIsLoaded();
        return emailNotificationAppSettingsPage;
      }
    );
  }
}
