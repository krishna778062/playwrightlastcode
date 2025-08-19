import { Page, test } from '@playwright/test';

import { BaseHomePage, ICommonHomePageActions, IOldUxHomePageActions } from './baseHomePage';

import { AddContentModalComponent } from '@/src/modules/content/components/addContentModal';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { AlbumCreationPage } from '@/src/modules/content/pages/albumCreationPage';
import { EventCreationPage } from '@/src/modules/content/pages/eventCreationPage';
import { FeaturedSitePage } from '@/src/modules/content/pages/featuredSitePage';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';

export class OldUxHomePage extends BaseHomePage implements IOldUxHomePageActions {
  constructor(page: Page) {
    super(page);
  }

  get actions(): IOldUxHomePageActions {
    return this;
  }

  async clickOnCreateContentButtonOnTopNavBar(options?: { stepInfo?: string }): Promise<AddContentModalComponent> {
    return await test.step(options?.stepInfo || `Clicking on create content button on top nav bar`, async () => {
      await this.topNavBarComponent.clickOnCreateContentButton();
      const addContentModal = new AddContentModalComponent(this.page);
      await addContentModal.verifyTheAddContentModalIsVisible();
      return addContentModal;
    });
  }

  async openCreateContentPageForContentType(
    contentType: ContentType,
    options?: { stepInfo?: string }
  ): Promise<PageCreationPage | AlbumCreationPage | EventCreationPage> {
    return await test.step(options?.stepInfo || `Opening create content page for ${contentType}`, async () => {
      await this.clickOnCreateContentButtonOnTopNavBar();
      const addContentModal = new AddContentModalComponent(this.page);
      await addContentModal.verifyTheAddContentModalIsVisible();
      return await addContentModal.completeContentCreationForm(contentType);
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
}
