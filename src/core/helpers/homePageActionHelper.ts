import { Page, test } from '@playwright/test';
import { HomePage as OldUxHomePage } from '../pages/oldUx/homePage';
import { HomePage as NewUxHomePage } from '../pages/newUx/homePage';
import { GlobalSearchResultPage } from '../../modules/global-search/pages/globalSearchResultPage';
import { AddContentModalComponent } from '../../modules/content/components/addContentModal';
import { CreateComponent } from '../../modules/content/components/createComponent';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { getEnvConfig } from '../utils/getEnvConfig';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';
import { EventCreationPage } from '@/src/modules/content/pages/eventCreationPage';
import { AlbumCreationPage } from '@/src/modules/content/pages/albumCreationPage';

export class HomePageActionHelper {
  readonly page: Page;
  constructor(
    readonly homePage: OldUxHomePage | NewUxHomePage,
    readonly newUxEnabled: boolean
  ) {
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
      if (this.homePage instanceof NewUxHomePage) {
        await this.homePage.sideNavBarComponent.clickOnCreateButton();
        const createComponent = new CreateComponent(this.page);
        await createComponent.verifyTheCreateComponentIsVisible();
        return createComponent;
      }
      throw new Error('New UX is not enabled, hence this method is not applicable');
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

  /**It handles both old and new ux
   * Opens the create content page for the given content type
   * @param contentType - The content type to create
   * @param options - The options for the step
   * @returns The create content page
   */
  async openCreateContentPageForContentType(
    contentType: ContentType,
    options?: { stepInfo?: string }
  ): Promise<PageCreationPage | AlbumCreationPage | EventCreationPage> {
    return await test.step(options?.stepInfo || `Opening create content page for ${contentType}`, async () => {
      //if new ux is enabled, use side nav bar to create a page
      if (getEnvConfig().newUxEnabled) {
        await this.clickOnCreateButtonOnSideNavBar(); //we need to use side bar to open create section
        const createComponent = new CreateComponent(this.page);
        await createComponent.verifyTheCreateComponentIsVisible();
        const addContentModal = await createComponent.selectContentTypeAndCreateContent(contentType);
        return await addContentModal.completeContentCreationForm(contentType);
      }
      else{
        await this.clickOnCreateContentButtonOnTopNavBar();
        const addContentModal = new AddContentModalComponent(this.page);
        await addContentModal.verifyTheAddContentModalIsVisible();
        return await addContentModal.completeContentCreationForm(contentType);
      }
    });
  }

  async clickOnGlobalFeed(): Promise<void> {
    await test.step('Click on Global Feed', async () => {
      const feedLink = this.homePage.page.getByText('Feed', { exact: true });
      const homeLink = this.homePage.page.getByText('Home', { exact: true });
      
      if (await feedLink.isVisible()) {
        await feedLink.click();
      } else {
        await homeLink.click();
      }
    });
  }
}
