import { GlobalSearchResultPage } from '../pages/globalSearchResultPage';

export class GlobalSearchActionHelper {
  constructor(readonly globalSearchPage: GlobalSearchResultPage) {
    this.globalSearchPage = globalSearchPage;
  }

  async searchForTerm(term: string, options?: { stepInfo?: string }) {
    await this.globalSearchPage.getGlobalSearchComponent().inputTermInSearchBar(term, options);
  }

  async clickSearchButton(options?: { stepInfo?: string }) {
    await this.globalSearchPage.getGlobalSearchComponent().clickSearchButton(options);
  }
}
