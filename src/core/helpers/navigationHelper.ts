import { Page, test } from '@playwright/test';

import { CreateComponent } from '@content/ui/components/createComponent';

import { TestOptions } from '../types';
import { SideNavBarComponent, TopNavBarComponent } from '../ui/components';
import { ApplicationSettingsOption } from '../ui/types/navigation.types';

import { EmailNotificationAppSettingsPage } from '@/src/modules/alert-notification/ui/pages/emailNotificationAppSettingsPage';
import { ChatNavigationComponent } from '@/src/modules/chat/ui/components/chatNavigationComponent';
import { ChatAppPage } from '@/src/modules/chat/ui/pages/chatPage/chatPage';
import { ContentType } from '@/src/modules/content/constants';
import {
  AddContentModalComponent,
  AlbumCreationPage,
  ContentModerationQueuePage,
  EventCreationPage,
  FeaturedSitePage,
  ManageApplicationPage,
  NotificationComponent,
  PageCreationPage,
  SiteCreationPage,
} from '@/src/modules/content/ui';
import { CreateComponent as AbacCreateComponent } from '@/src/modules/content/ui/components/globalCreateContainerComponent';
import { ContentStudioPageCreationPage } from '@/src/modules/content/ui/pages/contentStudioPageCreationPage';
import { ORGChartPage } from '@/src/modules/content/ui/pages/ORGChatPage';
import { SiteCreationPageAbac } from '@/src/modules/content/ui/pages/siteCreationPageAbac';
import { AnalyticsLandingPage } from '@/src/modules/data-engineering/ui/pages/analyticsLandingPage';
import { GlobalSearchResultPage } from '@/src/modules/global-search/ui/pages/globalSearchResultPage';
import { ManageRecognitionPage } from '@/src/modules/recognition/ui/pages/manage/manageRecognitionPage';
import { RecognitionHubPage } from '@/src/modules/recognition/ui/pages/recognitionHubPage';

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
  readonly topNavBarComponent: TopNavBarComponent;
  readonly sideNavBarComponent: SideNavBarComponent;
  constructor(private readonly page: Page) {
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

  async clickOnFavoritePeopleSection(): Promise<void> {
    await test.step('Clicking on favourite people section', async () => {
      await this.sideNavBarComponent.favoritePeopleSection.click();
    });
  }

  async clickOnOrgChartButton(options?: TestOptions): Promise<void> {
    await test.step(options?.stepInfo || 'Clicking on org chart button', async () => {
      await this.sideNavBarComponent.clickOnOrgChartButton(options);
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
    options?: { stepInfo?: string; isFromStudio?: boolean; siteName?: string }
  ): Promise<PageCreationPage | AlbumCreationPage | EventCreationPage | ContentStudioPageCreationPage> {
    return await test.step(options?.stepInfo || `Opening create content page for ${contentType}`, async () => {
      await this.sideNavBarComponent.clickOnCreateButton();
      const createComponent = new CreateComponent(this.page);
      await createComponent.verifyTheCreateComponentIsVisible();
      const addContentModal = await createComponent.selectContentTypeAndCreateContent(contentType);
      return await addContentModal.completeContentCreationForm(contentType, {
        isFromHomePage: true,
        siteName: options?.siteName,
        isFromStudio: options?.isFromStudio || false,
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
        await this.sideNavBarComponent.socialCampaignsElement.click();
      }
    });
  }

  async verifySocialCampaignsOptionIsVisible(): Promise<void> {
    await test.step('Verifying social campaigns option is visible', async () => {
      if (await this.sideNavBarComponent.moreElement.isVisible()) {
        await this.sideNavBarComponent.moreElement.click();
      }
      await this.sideNavBarComponent.verifier.verifyTheElementIsVisible(
        this.sideNavBarComponent.socialCampaignsElement
      );
    });
  }

  async verifySocialCampaignsOptionIsNotVisible(): Promise<void> {
    await test.step('Verifying social campaigns option is not visible', async () => {
      if (await this.sideNavBarComponent.moreElement.isVisible()) {
        await this.sideNavBarComponent.moreElement.click();
      }
      await this.sideNavBarComponent.verifier.verifyTheElementIsNotVisible(
        this.sideNavBarComponent.socialCampaignsElement
      );
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

  /**
   * Navigates to the analytics landing page
   * @param options - The options for the step
   * @returns The analytics landing page
   */
  async navigateToAnalyticsLandingPage(options?: TestOptions): Promise<AnalyticsLandingPage> {
    return await test.step(options?.stepInfo || 'Navigating to analytics landing page', async () => {
      await this.sideNavBarComponent.clickOnAnalyticsButton(options);
      const analyticsLandingPage = new AnalyticsLandingPage(this.page);
      await analyticsLandingPage.verifyThePageIsLoaded();
      return analyticsLandingPage;
    });
  }

  async navigateToAppAnalytics(options?: TestOptions): Promise<void> {
    return await test.step(options?.stepInfo || 'Navigating to app analytics', async () => {
      const analyticsLandingPage = await this.navigateToAnalyticsLandingPage(options);
      await analyticsLandingPage.openAppAnalytics();
    });
  }

  /**
   * Navigates to the recognition analytics page
   * @param options - The options for the step
   * @returns The recognition analytics page
   */
  async navigateToRecognitionAnalytics(options?: TestOptions): Promise<void> {
    return await test.step(options?.stepInfo || 'Navigating to recognition analytics', async () => {
      const analyticsLandingPage = await this.navigateToAnalyticsLandingPage(options);
      await analyticsLandingPage.openRecognitionAnalytics();
    });
  }
  async navigateToORGChart(options?: TestOptions): Promise<ORGChartPage> {
    return await test.step(options?.stepInfo || 'Navigating to ORG chart', async () => {
      await this.sideNavBarComponent.clickOnOrgChartButton(options);
      return new ORGChartPage(this.page);
    });
  }
  /**
   * Navigates to the campaign analytics page
   * @param options - The options for the step
   * @returns The campaign analytics page
   */
  async navigateToManageCampaigns(options?: TestOptions): Promise<void> {
    return await test.step(options?.stepInfo || 'Navigating to campaign analytics', async () => {
      const analyticsLandingPage = await this.navigateToAnalyticsLandingPage(options);
      await analyticsLandingPage.openCampaignAnalytics();
    });
  }

  /**
   * Navigates to the manage recognition page via the side nav bar
   * @param options - The options for the step
   * @returns The manage recognition page
   */

  async navigateToManageRecognitionViaSideNavBar(options?: { stepInfo?: string }): Promise<ManageRecognitionPage> {
    return await test.step(options?.stepInfo || 'Navigating to manage recognition via side nav bar', async () => {
      await this.sideNavBarComponent.clickRecognitionLinkInsideManageNavMenu();
      const manageRecognitionPage = new ManageRecognitionPage(this.page);
      await manageRecognitionPage.verifyThePageIsLoaded();
      return manageRecognitionPage;
    });
  }

  /**
   * Navigates to the recognition hub page via the side nav bar
   * @param options - The options for the step
   * @returns The recognition hub page
   */
  async navigateToRecognitionHubViaSideNavBar(options?: { stepInfo?: string }): Promise<RecognitionHubPage> {
    return await test.step(options?.stepInfo || 'Navigating to recognition hub via side nav bar', async () => {
      await this.sideNavBarComponent.clickRecognitionLinkUnderHomeNavMenu();
      const recognitionHubPage = new RecognitionHubPage(this.page);
      await recognitionHubPage.verifyThePageIsLoaded();
      return recognitionHubPage;
    });
  }

  /**
   * Navigates to the content moderation queue page via Avatar → Manage → Content Moderation
   * @param options - The options for the step
   * @returns The ContentModerationQueuePage instance
   */
  async navigateToContentModerationQueue(options?: { stepInfo?: string }) {
    return await test.step(
      options?.stepInfo || 'Navigating to content moderation queue via Avatar → Manage → Content Moderation',
      async () => {
        // Open profile settings (Avatar)
        const manageFeatureComponent = this.sideNavBarComponent.clickOnManageFeature;

        await manageFeatureComponent.click();
        await test.step('Clicking on content moderation', async () => {
          await this.sideNavBarComponent.clickOnContentModeration.click();
        });

        // Return ContentModerationQueuePage
        const moderationQueuePage = new ContentModerationQueuePage(this.page);
        await moderationQueuePage.verifyThePageIsLoaded();
        return moderationQueuePage;
      }
    );
  }
}
