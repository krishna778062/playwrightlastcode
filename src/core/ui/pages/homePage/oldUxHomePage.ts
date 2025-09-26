import { Page, test } from '@playwright/test';

import { BaseHomePage, ICommonHomePageAssertions, IOldUxHomePageActions } from './baseHomePage';

import { ContentType } from '@/src/modules/content/constants/contentType';
import { AddContentModalComponent } from '@/src/modules/content/ui/components/addContentModal';
import { CreateComponent as ContentCreateComponent } from '@/src/modules/content/ui/components/createComponent';
import { NotificationComponent } from '@/src/modules/content/ui/components/notificationComponent';
import { AlbumCreationPage } from '@/src/modules/content/ui/pages/albumCreationPage';
import { EventCreationPage } from '@/src/modules/content/ui/pages/eventCreationPage';
import { FeaturedSitePage } from '@/src/modules/content/ui/pages/featuredSitePage';
import { PageCreationPage } from '@/src/modules/content/ui/pages/pageCreationPage';
import { SiteCreationPage as ContentSiteCreationPage } from '@/src/modules/content/ui/pages/siteCreationPage';
import { CreateComponent } from '@/src/modules/content-abac/components/globalCreateContainerComponent';
import { SiteCreationPage } from '@/src/modules/content-abac/pages/siteCreationPage';

export class OldUxHomePage extends BaseHomePage implements IOldUxHomePageActions {
  constructor(page: Page) {
    super(page);
  }

  get actions(): IOldUxHomePageActions {
    return this;
  }

  get assertions(): ICommonHomePageAssertions {
    return this;
  }

  async clickOnCreateContentButtonOnTopNavBar(
    contentType: ContentType,
    options?: { stepInfo?: string }
  ): Promise<AddContentModalComponent> {
    return await test.step(options?.stepInfo || `Clicking on create content button on top nav bar`, async () => {
      await this.topNavBarComponent.clickOnCreateContentButton();
      const addContentModal = new AddContentModalComponent(this.page);
      await addContentModal.verifyTheAddContentModalIsVisible(contentType);
      return addContentModal;
    });
  }

  async openCreateContentPageForContentType(
    contentType: ContentType,
    options?: { stepInfo?: string }
  ): Promise<PageCreationPage | AlbumCreationPage | EventCreationPage> {
    return await test.step(options?.stepInfo || `Opening create content page for ${contentType}`, async () => {
      await this.clickOnCreateContentButtonOnTopNavBar(contentType);
      const addContentModal = new AddContentModalComponent(this.page);
      await addContentModal.verifyTheAddContentModalIsVisible(contentType);
      return await addContentModal.completeContentCreationForm(contentType, { isFromHomePage: true });
    });
  }

  async openSiteCreationForm(options?: { stepInfo?: string }): Promise<SiteCreationPage> {
    return await test.step(options?.stepInfo || 'Opening site creation form', async () => {
      const createComponent = new CreateComponent(this.page);
      await createComponent.verifyTheCreateComponentIsVisible();
      await createComponent.selectSiteOptionAndOpenModal();
      return new SiteCreationPage(this.page);
    });
  }

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

  async openSiteCreationFormForNonAbac(options?: { stepInfo?: string }): Promise<ContentSiteCreationPage> {
    return await test.step(options?.stepInfo || 'Opening non-ABAC site creation form', async () => {
      const createComponent = new ContentCreateComponent(this.page);
      await createComponent.verifyTheCreateComponentIsVisible();
      return await createComponent.selectSiteOption();
    });
  }

  async clickOnBellIcon(options?: { stepInfo?: string }): Promise<NotificationComponent> {
    return await test.step(options?.stepInfo || 'Click on bell icon', async () => {
      await this.topNavBarComponent.clickOnBellIcon();
      return new NotificationComponent(this.page);
    });
  }

  async openAddContentModal(
    contentType: ContentType,
    siteName?: string,
    options?: { stepInfo?: string }
  ): Promise<AddContentModalComponent> {
    return await test.step(options?.stepInfo || `Opening create content page for ${contentType}`, async () => {
      await this.clickOnCreateContentButtonOnTopNavBar(contentType);
      const addContentModal = new AddContentModalComponent(this.page);
      await addContentModal.verifyTheAddContentModalIsVisible(contentType);
      return addContentModal;
    });
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
