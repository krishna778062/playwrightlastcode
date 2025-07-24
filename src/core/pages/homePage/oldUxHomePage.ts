import { AddContentModalComponent } from "@/src/modules/content/components/addContentModal";
import { BaseHomePage, ICommonHomePageActions, IOldUxHomePageActions } from "./baseHomePage";
import { Page,test } from "@playwright/test";
import { PageCreationPage } from "@/src/modules/content/pages/pageCreationPage";
import { AlbumCreationPage } from "@/src/modules/content/pages/albumCreationPage";
import { ContentType } from "@/src/modules/content/constants/contentType";
import { EventCreationPage } from "@/src/modules/content/pages/eventCreationPage";

export class OldUxHomePage extends BaseHomePage  implements IOldUxHomePageActions{
    
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


}