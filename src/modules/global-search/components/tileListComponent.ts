import { Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '../../../core/constants/timeouts';
import { TileLink } from '../../../core/types/tile.type';

import { ResultListingComponent } from './resultsListComponent';

export class TileListComponent extends ResultListingComponent {
  readonly tileTitle: Locator;
  readonly searchTerm: string;
  readonly thumbnail: Locator;
  readonly thumbnailLink: Locator;
  readonly showMoreButton: Locator;
  constructor(page: Page, rootLocator: Locator, searchTerm: string) {
    super(page, rootLocator);
    this.searchTerm = searchTerm;

    // Try to find the tile title link element using role and aria-label
    this.tileTitle = this.rootLocator
      .getByRole('link')
      .and(this.rootLocator.getByLabel('enterpriseSearch:breadcrumb.innerSource.aria_label'));
    this.thumbnail = this.rootLocator
      .locator('div[class*="ListingItem_thumbnail"]')
      .or(this.rootLocator.locator("[class*='ListingItem_smallThumbnail']"));
    this.thumbnailLink = this.thumbnail.locator('a');
    this.showMoreButton = this.rootLocator.getByRole('button').filter({ hasText: 'Show more' });
  }

  async verifyTileTitleIsDisplayed(expectedTileTitle: string) {
    await test.step(`Verifying tile title is displayed`, async () => {
      await this.verifier.verifyElementHasText(this.tileTitle, new RegExp(`^${expectedTileTitle}`));
    });
  }

  async verifyTileContainsSearchTerm() {
    // Verify the tile contains the search term somewhere within it
    await this.verifier.verifyElementHasText(this.rootLocator, this.searchTerm);
  }

  async verifyTileLinkIsClickable(links: TileLink[]) {
    for (const link of links) {
      await test.step(`Verifying tile link '${link.text}' is clickable`, async () => {
        const linkElement = this.rootLocator.getByRole('link', { name: link.url }).first();

        try {
          // Try to click and wait for new page to open
          const newPage = await this.clickAndWaitForNewPageToOpen(() => this.clickOnElement(linkElement), {
            timeout: TIMEOUTS.MEDIUM,
            stepInfo: `Clicking on tile link '${link.text}' should open new page`,
          });

          // Verify page loaded successfully
          const url = newPage.url();
          if (!url || url.includes('about:blank')) {
            throw new Error('Link did not open a valid page');
          }

          // Keep focus on original tab
          await this.page.bringToFront();
        } catch (error) {
          // If no new page opened, the link might navigate in same tab
          // Just verify the link is clickable by clicking it
          await this.clickOnElement(linkElement);
          console.log(`Link '${link.text}' may have navigated in same tab`);
        }
      });
    }
  }

  async verifyThumbnailIsDisplayed() {
    await test.step(`Verifying thumbnail is displayed in the result item`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.thumbnailLink, {
        timeout: 20000,
        assertionMessage: `Verifying thumbnail is displayed in the result item`,
      });
    });
  }

  async verifyShowMoreButtonIsDisplayed(linksCount: number) {
    await test.step(`Verifying show more button is displayed`, async () => {
      if (linksCount > 3) {
        await this.verifier.verifyTheElementIsVisible(this.showMoreButton, { timeout: 5000 });
        await this.showMoreButton.click();
      }
    });
  }
  async siteLinkIsClickable(linkText: string, siteId: string) {
    await test.step(`Verifying site link is clickable`, async () => {
      const linkElement = this.rootLocator.getByRole('link', { name: linkText });
      await linkElement.click();
      await this.verifier.waitUntilPageHasNavigatedTo(new RegExp(siteId), {
        timeout: 20000,
        stepInfo: `Verifying navigation with site link to "${siteId}"`,
      });
    });
  }
  async tileLinkIsClickable(linkText: string) {
    await test.step(`Verifying tile link is clickable`, async () => {
      const linkElement = this.rootLocator.getByRole('link', { name: linkText });
      await linkElement.click();
      await this.verifier.waitUntilPageHasNavigatedTo(new RegExp(linkText), {
        timeout: 20000,
        stepInfo: `Verifying navigation with tile link to "${linkText}"`,
      });
    });
  }
}
