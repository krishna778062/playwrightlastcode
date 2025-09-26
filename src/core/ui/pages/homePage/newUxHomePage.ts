import { Page, test } from '@playwright/test';

import { AddContentModalComponent } from '@content/ui/components/addContentModal';

import { BaseHomePage, INewUxHomePageActions } from './baseHomePage';

import { ContentType } from '@/src/modules/content/constants/contentType';
import { CreateComponent } from '@/src/modules/content/ui/components/createComponent';
import { NotificationComponent } from '@/src/modules/content/ui/components/notificationComponent';
import { AlbumCreationPage } from '@/src/modules/content/ui/pages/albumCreationPage';
import { EventCreationPage } from '@/src/modules/content/ui/pages/eventCreationPage';
import { FeaturedSitePage } from '@/src/modules/content/ui/pages/featuredSitePage';
import { PageCreationPage } from '@/src/modules/content/ui/pages/pageCreationPage';
import { SiteCreationPage as ContentSiteCreationPage } from '@/src/modules/content/ui/pages/siteCreationPage';
import { CreateComponent as AbacCreateComponent } from '@/src/modules/content-abac/components/globalCreateContainerComponent';
import { SiteCreationPage as AbacSiteCreationPage } from '@/src/modules/content-abac/pages/siteCreationPage';

export interface IFeaturedSiteActions {
  navigateToApplication: () => Promise<void>;
  clickOnManageFeature: () => Promise<void>;
  clickOnHomeButton: () => Promise<void>;
  clickOnFeedSideMenu: () => Promise<void>;
}

export interface ICommonHomePageAssertions {
  verifyErrorMessageWhenContentSubmissionIsDisabled: (
    addContentModal: AddContentModalComponent,
    contentType: ContentType
  ) => Promise<void>;
}
export class NewUxHomePage extends BaseHomePage implements INewUxHomePageActions {
  // actions: any;
  constructor(page: Page) {
    super(page);
  }

  get actions(): INewUxHomePageActions {
    return this;
  }

  get assertions(): ICommonHomePageAssertions {
    return this;
  }

  /**
   * Clicks on add content button from the top nav bar
   * It will open the add content modal
   * @param contentType - The content type to create
   * @param options - The options for the step
   */
  async clickOnCreateButtonOnSideNavBar(options?: { stepInfo?: string }): Promise<CreateComponent> {
    return await test.step(options?.stepInfo || `Clicking on add content button`, async () => {
      await this.sideNavBarComponent.clickOnCreateButton();
      const createComponent = new CreateComponent(this.page);
      await createComponent.verifyTheCreateComponentIsVisible();
      return createComponent;
    });
  }

  async openCreateContentPageForContentType(
    contentType: ContentType,
    siteName?: string,
    options?: { stepInfo?: string }
  ): Promise<PageCreationPage | AlbumCreationPage | EventCreationPage> {
    return await test.step(options?.stepInfo || `Opening create content page for ${contentType}`, async () => {
      await this.clickOnCreateButtonOnSideNavBar();
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
      await this.clickOnCreateButtonOnSideNavBar();
      const createComponent = new CreateComponent(this.page);
      await createComponent.verifyTheCreateComponentIsVisible();
      const addContentModal = await createComponent.selectContentTypeAndCreateContent(contentType);
      await addContentModal.selectSiteToAddContentFromDropdown(siteName);
      return addContentModal;
    });
  }

  /**
   * Navigates to Sites from the home page
   * @param options - Options for the step
   */
  async clickOnSitesFromSideBar(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || 'Navigate to Sites > All sites', async () => {
      await this.sideNavBarComponent.clickOnSites();
    });
  }

  /**
   * Navigates to Home page
   * @param options - Options for the step
   */
  async navigateToHomePage(options?: { stepInfo?: string }): Promise<void> {
    return await test.step(options?.stepInfo || 'Navigate to Home', async () => {
      await this.sideNavBarComponent.clickOnHome();
    });
  }

  /**
   * Clicks the Create button, verifies the ABAC create container,
   * selects the Site option, and returns the Site creation page
   * @param options - Options for the step
   * @returns The SiteCreationPage instance
   */
  async openSiteCreationForm(options?: { stepInfo?: string }): Promise<AbacSiteCreationPage> {
    return await test.step(options?.stepInfo || 'Opening site creation form', async () => {
      // Click the Create button (returns content CreateComponent for interface compatibility)
      await this.clickOnCreateButtonOnSideNavBar();

      // Use ABAC-specific CreateComponent to select Site option
      const abacCreate = new AbacCreateComponent(this.page);
      await abacCreate.verifyTheCreateComponentIsVisible();
      await abacCreate.selectSiteOptionAndOpenModal();
      return new AbacSiteCreationPage(this.page);
    });
  }

  /**
   * Clicks the Create button, verifies the ABAC create container,
   * selects the Site option, and returns the Site creation page
   * @param options - Options for the step
   * @returns The SiteCreationPage instance
   */
  async openSiteCreationFormForNonAbac(options?: { stepInfo?: string }): Promise<ContentSiteCreationPage> {
    return await test.step(options?.stepInfo || 'Opening site creation form', async () => {
      // Click the Create button (returns content CreateComponent for interface compatibility)
      await this.clickOnCreateButtonOnSideNavBar();
      const createComponent = new CreateComponent(this.page);
      await createComponent.verifyTheCreateComponentIsVisible();
      return await createComponent.selectSiteOption();
    });
  }

  /**
   * Clicks on Featured Sites tab from the side navigation bar
   * @param options - Options for the step
   */
  async clickOnFeaturedSitesTab(options?: { stepInfo?: string }): Promise<FeaturedSitePage> {
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

  async navigateToApplication(): Promise<void> {
    await test.step('Clicking on application', async () => {
      await this.clickOnElement(this.sideNavBarComponent.navigateOnApplication);
    });
  }

  async clickOnManageFeature(): Promise<void> {
    await test.step('Clicking on application', async () => {
      await this.clickOnElement(this.sideNavBarComponent.clickOnManageFeature);
    });
  }

  async clickOnHomeButton(): Promise<void> {
    await test.step('Clicking on application', async () => {
      await this.clickOnElement(this.sideNavBarComponent.clickingOnHome);
    });
  }

  async clickOnHome(): Promise<void> {
    await test.step('Clicking on application', async () => {
      await this.sideNavBarComponent.clickOnHome();
    });
  }

  async clickOnFeedSideMenu(): Promise<void> {
    await test.step('Clicking on application', async () => {
      await this.clickOnElement(this.sideNavBarComponent.clickOnFeedSideMenu);
    });
  }
  async clickOnBellIcon(options?: { stepInfo?: string }): Promise<NotificationComponent> {
    await this.topNavBarComponent.clickOnBellIcon();
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
}
