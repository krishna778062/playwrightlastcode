import { Page } from '@playwright/test';
import { GlobalSearchResultPage } from '../pages/globalSearchResultPage';
import { SiteResultItemComponent } from '../components/siteResultItemComponent';

export class GlobalSearchAssertionHelper {
  readonly page: Page;
  constructor(readonly globalSearchPage: GlobalSearchResultPage) {
    this.globalSearchPage = globalSearchPage;
    this.page = globalSearchPage.page;
  }

  /**
   * Verify the site result item data points
   * @param siteName - the site name
   * @param siteType - the site type
   * @param category - the category
   * @param label - the label
   */
  async verifySiteResultItemDataPoints(
    siteResultItem: SiteResultItemComponent,
    datapoints: {
      siteName: string;
      siteType: string;
      category: string;
      label: string;
      description: string;
    }
  ) {
    await siteResultItem.verifySiteNameIsDisplayed(datapoints.siteName);
    await siteResultItem.verifySiteLabelIsDisplayed(datapoints.label);
    await siteResultItem.verifySiteThumbnailIsDisplayed();
    await siteResultItem.verifySiteDescriptionIsDisplayed(datapoints.description);
  }

  /**
   * Verify all navigation links are working
   */
  async verifyAllNavigationLinksAreWorkingInSiteResultItem(siteResultItem: SiteResultItemComponent, siteId: string) {
    await siteResultItem.verifyNavigationWithThumbnailLink(siteId);
    await siteResultItem.goBackToPreviousPage();
    await siteResultItem.verifyNavigationWithHomePageLink();
    await siteResultItem.goBackToPreviousPage();
  }
}
