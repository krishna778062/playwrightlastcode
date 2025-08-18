import { Page, test } from '@playwright/test';

import { BaseHomePage, INewUxHomePageActions } from './baseHomePage';

import { CreateComponent } from '@/src/modules/content/components/createComponent';
import { SiteCeationFormComponent } from '@/src/modules/content/components/siteCreatePageComponents/siteCreationFormComponent';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { AlbumCreationPage } from '@/src/modules/content/pages/albumCreationPage';
import { EventCreationPage } from '@/src/modules/content/pages/eventCreationPage';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';

export class NewUxHomePage extends BaseHomePage implements INewUxHomePageActions {
  constructor(page: Page) {
    super(page);
  }

  get actions(): INewUxHomePageActions {
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
    options?: { stepInfo?: string }
  ): Promise<PageCreationPage | AlbumCreationPage | EventCreationPage> {
    return await test.step(options?.stepInfo || `Opening create content page for ${contentType}`, async () => {
      await this.clickOnCreateButtonOnSideNavBar();
      const createComponent = new CreateComponent(this.page);
      await createComponent.verifyTheCreateComponentIsVisible();
      const addContentModal = await createComponent.selectContentTypeAndCreateContent(contentType);
      return await addContentModal.completeContentCreationForm(contentType);
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

  async openSiteCreationForm(options?: {
    stepInfo?: string;
  }): Promise<import('@/src/modules/content/pages/siteCreationPage').SiteCreationPage> {
    return await test.step(options?.stepInfo || 'Opening site creation form', async () => {
      const createComponent = await this.clickOnCreateButtonOnSideNavBar();
      await createComponent.verifyTheCreateComponentIsVisible();
      const formComponent = await createComponent.selectSiteOptionAndOpenModal();
      const { SiteCreationPage } = await import('@/src/modules/content/pages/siteCreationPage');
      return new SiteCreationPage(this.page);
    });
  }
}
