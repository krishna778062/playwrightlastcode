import { Page, test } from '@playwright/test';

import { BaseHomePage, ICommonHomePageActions, IOldUxHomePageActions } from './baseHomePage';

import { AddContentModalComponent } from '@/src/modules/content/components/addContentModal';
import { CreateComponent } from '@/src/modules/content/components/createComponent';
import { SiteCreationModalComponent } from '@/src/modules/content/components/siteCreationComponent';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { AlbumCreationPage } from '@/src/modules/content/pages/albumCreationPage';
import { EventCreationPage } from '@/src/modules/content/pages/eventCreationPage';
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

  async openSiteCreationModal(options?: { stepInfo?: string }): Promise<SiteCreationModalComponent> {
    return await test.step(options?.stepInfo || 'Opening site creation modal', async () => {
      // For old UX, we need to create a CreateComponent to handle site creation
      // This assumes the old UX also has the same create flow
      await this.clickOnCreateContentButtonOnTopNavBar();
      const createComponent = new CreateComponent(this.page);
      await createComponent.verifyTheCreateComponentIsVisible();
      return await createComponent.selectSiteOptionAndOpenModal();
    });
  }
}
