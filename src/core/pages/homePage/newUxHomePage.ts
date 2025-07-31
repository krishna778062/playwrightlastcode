import { Page, test } from '@playwright/test';

import { BaseHomePage, INewUxHomePageActions } from './baseHomePage';

import { CreateComponent } from '@/src/modules/content/components/createComponent';
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
}
