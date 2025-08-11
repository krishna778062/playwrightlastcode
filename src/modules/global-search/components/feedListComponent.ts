import { ContentListComponent } from '@/src/modules/global-search/components/contentListComponent';
import { Locator, Page, test } from '@playwright/test';

export class FeedListComponent extends ContentListComponent {
  public readonly feedPostText: Locator;

  /**
   * @description Creates an instance of FeedListComponent.
   * @param {Page} page The page
   * @param {Locator} [locator] The locator for the component
   * @memberof FeedListComponent
   */
  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.feedPostText = this.rootLocator.locator('h2', { hasText: 'Post in feed' });
  }

  /**
   * @description Verifies navigation to the feed link
   * @param {string} feedId The ID of the feed
   * @param {string} feedName The name of the feed
   * @returns {Promise<void>}
   * @memberof FeedListComponent
   */
  async verifyNavigationToFeedLink(feedId: string, feedName: string): Promise<void> {
    await test.step(`Verifying navigation to feed link for "${feedId}"`, async () => {
      await this.clickOnElement(this.name, { timeout: 50000 });
      const utmUrlPattern = new RegExp(
        `${feedId}.*\\?utm_source=search_result&utm_term=${encodeURIComponent(feedName)}`
      );
      const finalUrlPattern = new RegExp(feedId);

      try {
        await this.page.waitForURL(url => utmUrlPattern.test(url.toString()) || finalUrlPattern.test(url.toString()), {
          timeout: 20000,
        });
      } catch (error) {
        throw new Error(
          `Verifying navigation with title link for "${feedId}" failed. Neither UTM URL nor final URL was loaded in time.\n${error}`
        );
      }
    });
  }

  async verifyFeedResultItem(data: any) {
    await test.step(`Verifying all data points for the feed result item "${data.name}"`, async () => {
      // UI Verifications
      await this.verifyNameIsDisplayed(data.text);
      await this.verifyLabelIsDisplayed(data.label);
      await this.verifyAuthorIsDisplayed(data.author);
      await this.verifyDateIsDisplayed();
      // Navigation Verifications
      await this.hoverOverCardAndCopyLink();
      await this.verifyCopiedURL(data.feedId);
      await this.goBackToPreviousPage();
      await this.verifyNavigationToFeedLink(data.feedId, data.name);
      await this.goBackToPreviousPage();
      await this.verifyNavigationWithAuthorLink(data.author);
      await this.goBackToPreviousPage();
      await this.verifyNavigationWithHomePageLink();
      await this.goBackToPreviousPage();
    });
  }
}
