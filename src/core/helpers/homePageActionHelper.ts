import { Page, test } from '@playwright/test';
import { HomePage as OldUxHomePage } from '../pages/oldUx/homePage';
import { HomePage as NewUxHomePage } from '../pages/newUx/homePage';
import { GlobalSearchResultPage } from '../../modules/global-search/pages/globalSearchResultPage';
import { AddContentModalComponent } from '../../modules/content/components/addContentModal';
import { CreateComponent } from '../../modules/content/components/createComponent';

export class HomePageActionHelper {
  readonly page: Page;
  constructor(readonly homePage: OldUxHomePage | NewUxHomePage, readonly newUxEnabled:boolean) {
    this.homePage = homePage;
    this.page = this.homePage.page;
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
      await this.homePage.topNavBarComponent.typeInSearchBarInput(searchTerm);
      await this.homePage.topNavBarComponent.clickSearchButton();
      return new GlobalSearchResultPage(this.page);
    });
  }
  
  /**
   * Clicks on add content button from the top nav bar
   * It will open the add content modal
   * @param contentType - The content type to create
   * @param options - The options for the step
   */
  async clickOnCreateButtonOnSideNavBar(options?: { stepInfo?: string }): Promise<CreateComponent> {
    return await test.step(options?.stepInfo || `Clicking on add content button`, async () => {
      if(this.homePage instanceof NewUxHomePage) {
        await this.homePage.sideNavBarComponent.clickOnCreateButton();
        const createComponent = new CreateComponent(this.page);
        await createComponent.verifyTheCreateComponentIsVisible();
        return createComponent;
      } 
      throw new Error("New UX is not enabled, hence this method is not applicable");
    });
  }


  async clickOnCreateContentButtonOnTopNavBar(options?: { stepInfo?: string }): Promise<AddContentModalComponent> {
    return await test.step(options?.stepInfo || `Clicking on create content button on top nav bar`, async () => {
      await this.homePage.topNavBarComponent.clickOnCreateContentButton();
      const addContentModal = new AddContentModalComponent(this.page);
      await addContentModal.verifyTheAddContentModalIsVisible();
      return addContentModal;
    });
  }
}
