import { GlobalSearchResultPage } from '../pages/globalSearchResultPage';

export class GlobalSearchAssertionHelper {
  constructor(readonly globalSearchPage: GlobalSearchResultPage) {
    this.globalSearchPage = globalSearchPage;
  }
}
