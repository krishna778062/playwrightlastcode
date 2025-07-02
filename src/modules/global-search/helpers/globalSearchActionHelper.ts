import { SiteResultItemComponent } from '../components/siteResultItemComponent';
import { GlobalSearchResultPage } from '../pages/globalSearchResultPage';

export class GlobalSearchActionHelper {
  constructor(readonly globalSearchResultPage: GlobalSearchResultPage) {
    this.globalSearchResultPage = globalSearchResultPage;
  }

  /**
   * Get the site result item exactly matching the search term
   * @param searchTerm - the search term
   * @returns the site result item
   */
  async getSiteResultItemExactlyMatchingTheSearchTerm(searchTerm: string): Promise<SiteResultItemComponent> {
    const searchResultListComponent = this.globalSearchResultPage.getSearchResultListComponent();
    return await searchResultListComponent.getSiteResultItemExactlyMatchingTheSearchTerm(searchTerm);
  }
}
