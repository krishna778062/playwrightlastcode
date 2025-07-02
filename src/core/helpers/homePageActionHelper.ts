import { Page, test } from '@playwright/test';
import { HomePage } from '../pages/homePage';
import { GlobalSearchResultPage } from '../../modules/global-search/pages/globalSearchResultPage';

export class HomePageActionHelper {
  readonly page: Page;
  constructor(readonly homePage: HomePage) {
    this.homePage = homePage;
    this.page = this.homePage.page;
  }

  async searchForTerm(searchTerm: string, options?: { stepInfo?: string }): Promise<GlobalSearchResultPage> {
    return await test.step(options?.stepInfo || `Searching for ${searchTerm}`, async () => {
      await this.homePage.topNavBarComponent.typeInSearchBarInput(searchTerm);
      await this.homePage.topNavBarComponent.clickSearchButton();
      return new GlobalSearchResultPage(this.page);
    });
  }
}
