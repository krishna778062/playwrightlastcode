import { Page, test } from '@playwright/test';
import { HomePage } from '../pages/homePage';
import { GlobalSearchResultPage } from '../../modules/global-search/pages/globalSearchResultPage';
import { AddContentModalComponent } from '@/src/modules/content/components/addContentModal';

export class HomePageActionHelper {
  readonly page: Page;
  constructor(readonly homePage: HomePage) {
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
   * It will verify that the add content modal is visible
   * returns the add content modal component
   * @param options - The options for the step
   * @returns the add content modal component
   */
  async clickOnAddContentButton(options?: { stepInfo?: string }): Promise<AddContentModalComponent> {
    return await test.step(options?.stepInfo || `Clicking on add content button`, async () => {
      await this.homePage.topNavBarComponent.clickOnAddContentButton();
      //verify that the add content modal is visible
      let addContentModal = new AddContentModalComponent(this.page);
      await addContentModal.verifyTheAddContentModalIsVisible();
      return addContentModal;
    });
  }
}
