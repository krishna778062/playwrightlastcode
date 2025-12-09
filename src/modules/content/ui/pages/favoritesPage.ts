import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';

export interface IFavoritesPageActions {
  clickOnPeopleButton: () => Promise<void>;
  clickOnContentButton: () => Promise<void>;
  unfavoriteContentByName: (contentName: string) => Promise<void>;
}

export interface IFavoritesPageAssertions {
  verifyPeopleNamesAreDisplayed: (peopleNames: string[]) => Promise<void>;
  verifyContentNamesAreDisplayed: (contentNames: string[]) => Promise<void>;
  verifyContentIsVisibleInSearchResults: (contentName: string) => Promise<void>;
  markAsFavoriteAndCheckRGBColor: () => Promise<void>;
  verifyAlbumTabImageIsDisplayed: () => Promise<void>;
  verifyEventsTabImageIsDisplayed: () => Promise<void>;
  verifyEventsTabMatchesApiDate: (startsAt: string) => Promise<void>;
  verifyUserCanMarkAsFavoriteContent: () => Promise<void>;
}

export class FavoritesPage extends BasePage implements IFavoritesPageActions, IFavoritesPageAssertions {
  //COMPONENTS

  //LOCATORS
  readonly peopleButton: Locator;
  readonly startIcon: Locator;
  readonly contentButton: Locator;
  readonly eventsTabImage: Locator;
  readonly eventsTabLink: Locator;
  readonly albumTabImage: Locator;
  readonly getPeopleNamesLocators: (name: string) => Locator;
  readonly getContentNamesLocators: (name: string) => Locator;
  readonly getContentListingItem: (contentName: string) => Locator;
  readonly getUnfavoriteButtonForContent: (contentName: string) => Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.FEATURED_SITES_PAGE);
    this.peopleButton = page.getByRole('tab', { name: 'People' });
    this.contentButton = page.getByRole('tab', { name: 'Content' });
    this.startIcon = page.getByRole('button', { name: 'Unfavorite this content' }).first();
    this.eventsTabImage = page.locator('[class="Image Image--objectFit Image--square Image--missing"]').first();
    this.eventsTabLink = page.locator('a[href*="/event/"]').first();
    this.albumTabImage = page.locator('[class="Image Image--objectFit Image--square"]').first();
    this.getPeopleNamesLocators = (name: string) => page.getByText(name, { exact: false });
    this.getContentNamesLocators = (name: string) => page.getByRole('link', { name: name, exact: true });
    this.getContentListingItem = (contentName: string) =>
      page.locator(`li.ListingItem--justFavorite:has(a.type--title:has-text("${contentName}"))`);
    this.getUnfavoriteButtonForContent = (contentName: string) =>
      this.getContentListingItem(contentName).getByRole('button', { name: 'Unfavorite this content' });
  }

  get actions(): IFavoritesPageActions {
    return this;
  }

  get assertions(): IFavoritesPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.peopleButton, {
      assertionMessage: 'People button should be visible',
    });
  }

  async clickOnPeopleButton(): Promise<void> {
    await test.step('Clicking on people button', async () => {
      await this.clickOnElement(this.peopleButton);
    });
  }

  async clickOnContentButton(): Promise<void> {
    await test.step('Clicking on content button', async () => {
      await this.clickOnElement(this.contentButton);
    });
  }

  async verifyUserCanMarkAsFavoriteContent(): Promise<void> {
    await test.step('Verify user can mark as favorite content', async () => {
      await this.verifier.verifyTheElementIsVisible(this.startIcon, {
        assertionMessage: 'Start icon should be visible',
      });
    });
  }
  async verifyEventsTabImageIsDisplayed(): Promise<void> {
    await test.step('Verify events tab image is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.eventsTabImage, {
        assertionMessage: 'Events tab image should be visible',
      });
    });
  }
  async verifyEventsTabMatchesApiDate(startsAt: string): Promise<void> {
    await test.step('Verify events tab matches API startsAt date', async () => {
      await this.verifier.verifyTheElementIsVisible(this.eventsTabLink, {
        assertionMessage: 'Events tab link should be visible',
      });

      const eventsTabText = await this.eventsTabLink.textContent();
      const { month, day } = this.parseStartsAtDate(startsAt);

      if (!eventsTabText || !this.doesTextMatchDate(eventsTabText, month, day)) {
        throw new Error(
          `Events tab text does not match API date.\n` +
            `API startsAt: ${startsAt} (${month} ${day})\n` +
            `Events tab text: "${eventsTabText || ''}"`
        );
      }
    });
  }

  private parseStartsAtDate(startsAt: string): { month: string; day: string } {
    if (!startsAt || startsAt.trim() === '') {
      throw new Error(`Invalid startsAt date: "${startsAt}"`);
    }

    const date = new Date(startsAt);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: "${startsAt}"`);
    }

    const monthNames = MANAGE_SITE_TEST_DATA.MONTH_NAMES.MONTH_NAMES;
    // Use UTC methods to avoid timezone conversion issues
    const month = monthNames[date.getUTCMonth()];
    const day = date.getUTCDate().toString();
    return { month, day };
  }

  private doesTextMatchDate(text: string, expectedMonth: string, expectedDay: string): boolean {
    const cleanText = text.trim().replace(/[\s\u200C\u200D\uFEFF\u00A0\u2000-\u200F\u2028-\u202F\u205F\u3000]+/g, ' ');
    const lowerText = cleanText.toLowerCase();
    const lowerMonth = expectedMonth.toLowerCase();
    return lowerText.includes(lowerMonth) && cleanText.includes(expectedDay);
  }

  async verifyAlbumTabImageIsDisplayed(): Promise<void> {
    await test.step('Verify album tab image is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.albumTabImage, {
        assertionMessage: 'Album tab image should be visible',
      });
    });
  }
  async markAsFavoriteAndCheckRGBColor(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.startIcon, {
      assertionMessage: 'Start icon should be visible',
    });
    // Target the SVG path specifically
    const svgPath = this.startIcon.locator('svg path');

    // Debug: Log the actual fill color
    const fillColor = await svgPath.evaluate(el => window.getComputedStyle(el).fill);

    await expect(svgPath).toHaveCSS('fill', 'rgb(207, 130, 7)');
  }

  async verifyContentNamesAreDisplayed(contentNames: string[]): Promise<void> {
    await test.step('Verify content names are displayed', async () => {
      for (let index = 0; index < contentNames.length; index++) {
        const name = contentNames[index];
        await this.verifier.verifyTheElementIsVisible(this.getContentNamesLocators(name), {
          assertionMessage: `Content name ${name} should be displayed`,
        });
      }
    });
  }

  async verifyPeopleNamesAreDisplayed(peopleNames: string[]): Promise<void> {
    await test.step('Verify people names are displayed', async () => {
      for (let index = 0; index < peopleNames.length; index++) {
        const name = peopleNames[index];
        await this.verifier.verifyTheElementIsVisible(this.getPeopleNamesLocators(name), {
          assertionMessage: `People name ${name} should be displayed`,
        });
      }
    });
  }

  async verifyContentIsVisibleInSearchResults(contentName: string): Promise<void> {
    await test.step(`Verify content "${contentName}" is visible in search results`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.getContentNamesLocators(contentName), {
        assertionMessage: `Content name ${contentName} should be displayed in favorites`,
      });
    });
  }

  async unfavoriteContentByName(contentName: string): Promise<void> {
    await test.step(`Unfavorite content "${contentName}"`, async () => {
      // First verify the content exists
      const contentItem = this.getContentListingItem(contentName);
      await this.verifier.verifyTheElementIsVisible(contentItem, {
        assertionMessage: `Content "${contentName}" should be visible in favorites list`,
      });

      // Get the unfavorite button for this specific content
      const unfavoriteButton = this.getUnfavoriteButtonForContent(contentName);
      await this.verifier.verifyTheElementIsVisible(unfavoriteButton, {
        assertionMessage: `Unfavorite button should be visible for content "${contentName}"`,
      });

      // Click the unfavorite button
      await this.clickOnElement(unfavoriteButton);

      // Wait for the content item to be removed from the list (optional verification)
      await contentItem.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
        // Content might still be visible but unfavorited, which is also acceptable
        console.log(`Content "${contentName}" may still be visible after unfavoriting`);
      });
    });
  }
}
