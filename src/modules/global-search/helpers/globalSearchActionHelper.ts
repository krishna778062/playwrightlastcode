import { GlobalSearchPage } from '../pages/globalSearchPage';

export class GlobalSearchActionHelper {
  constructor(readonly globalSearchPage: GlobalSearchPage) {
    this.globalSearchPage = globalSearchPage;
  }

  async searchForTerm(term: string, options?: { stepInfo?: string }) {
    await this.globalSearchPage.getGlobalSearchComponent().inputTermInSearchBar(term, options);
  }

  async clickSearchButton(options?: { stepInfo?: string }) {
    await this.globalSearchPage.getGlobalSearchComponent().clickSearchButton(options);
  }
}
