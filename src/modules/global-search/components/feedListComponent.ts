import { Locator, Page, test } from '@playwright/test';

import { ContentListComponent } from './contentListComponent';

/**
 * @description Class for the feed list component
 * @export
 * @class FeedListComponent
 * @extends {ContentListComponent}
 */
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
      await this.clickOnElement(this.name, { timeout: 40000 });
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
}
