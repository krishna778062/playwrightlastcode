import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { ManageSitesComponent } from '@/src/modules/content/ui/components/manageSitesComponent';

export interface IManageSiteActions {
  clickOnSite: () => Promise<void>;
  clickOnContentButton: () => Promise<void>;
  searchEventInSearchBar: (eventName: string) => Promise<void>;
  clickOnTheManageSiteButton: () => Promise<void>;
  clickOnThePageCategoryButton: () => Promise<void>;
}

export interface IManageSiteAssertions {
  verifyCoverImageIsVisible: () => Promise<void>;
  verifyEventsTabMatchesApiDate: (startsAt: string) => Promise<void>;
  checkAlbumCoverImageIsVisible: () => Promise<void>;
  checkAuthorNameIsDisplayed: (authorName: string) => Promise<void>;
  clickOnThePageCategoryButton: () => Promise<void>;
  checkTheError: () => Promise<void>;
  // Add assertions as needed
}

export class ManageSitePage extends BasePage implements IManageSiteActions, IManageSiteAssertions {
  // Locators
  readonly contentTab = this.page.locator(
    'a[href*="/content"], button:has-text("Content"), [data-testid="content-tab"]'
  );
  private manageSitesComponent: ManageSitesComponent;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.MANAGE_SITE_PAGE(siteId));
    this.manageSitesComponent = new ManageSitesComponent(page);
    this.clickOnSite = this.clickOnSite.bind(this);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.contentTab, {
      assertionMessage: 'Content tab should be visible on manage site page',
    });
  }

  get actions(): IManageSiteActions {
    return this;
  }

  get assertions(): IManageSiteAssertions {
    return this;
  }

  async clickOnSite(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.manageSitesComponent.clickOnSite);
      await this.manageSitesComponent.clickOnSite.press('Tab');
      await this.manageSitesComponent.clickOnSite.press('Enter');
    });
  }
  async verifyCoverImageIsVisible(): Promise<void> {
    await test.step('Verify cover image is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageSitesComponent.coverImage, {
        assertionMessage: 'Cover image should be visible',
      });
    });
  }

  async clickOnContentButton(): Promise<void> {
    await test.step('Clicking on content button', async () => {
      await this.clickOnElement(this.contentTab);
    });
  }

  async searchEventInSearchBar(eventName: string): Promise<void> {
    await test.step('Searching event in search bar', async () => {
      await this.typeInElement(this.manageSitesComponent.searchEventInSearchBar, eventName);
      await this.manageSitesComponent.searchEventInSearchBar.press('Enter');
    });
  }

  async verifyEventsTabMatchesApiDate(startsAt: string): Promise<void> {
    await test.step('Verify events tab matches API startsAt date', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageSitesComponent.eventsTab, {
        assertionMessage: 'Events tab should be visible',
      });

      const eventsTabText = await this.manageSitesComponent.eventsTab.innerText();
      const { month, day } = this.parseStartsAtDate(startsAt);

      if (!this.doesTextMatchDate(eventsTabText, month, day)) {
        throw new Error(
          `Events tab text does not match API date.\n` +
            `API startsAt: ${startsAt} (${month} ${day})\n` +
            `Events tab text: "${eventsTabText}"`
        );
      }
    });
  }

  private parseStartsAtDate(startsAt: string): { month: string; day: string } {
    const date = new Date(startsAt);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate().toString();
    return { month, day };
  }

  private doesTextMatchDate(text: string, expectedMonth: string, expectedDay: string): boolean {
    const cleanText = text.trim().replace(/[\s\u200C\u200D\uFEFF\u00A0\u2000-\u200F\u2028-\u202F\u205F\u3000]+/g, ' ');
    const lowerText = cleanText.toLowerCase();
    const lowerMonth = expectedMonth.toLowerCase();

    return lowerText.includes(lowerMonth) && cleanText.includes(expectedDay);
  }

  private hasDateAndMonthVisible(text: string | null): boolean {
    if (!text) return false;

    // Clean the text and remove any invisible characters
    const cleanText = text.trim().replace(/[\s\u200C\u200D\uFEFF\u00A0\u2000-\u200F\u2028-\u202F\u205F\u3000]+/g, ' ');
    if (!cleanText) return false;

    // Check for month abbreviations
    const monthAbbreviations = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    const textLower = cleanText.toLowerCase();
    const hasMonth = monthAbbreviations.some(month => textLower.includes(month));

    // Check for date numbers (1-31)
    const hasDateNumber = /\b([1-9]|[12][0-9]|3[01])\b/.test(cleanText);

    // Additional patterns for various date formats
    const datePatterns = [
      /\d{1,2}\/\d{1,2}\/\d{2,4}/, // MM/DD/YYYY or DD/MM/YYYY
      /\d{1,2}-\d{1,2}-\d{2,4}/, // MM-DD-YYYY or DD-MM-YYYY
      /\d{4}-\d{1,2}-\d{1,2}/, // YYYY-MM-DD
      /\b\d{1,2}(st|nd|rd|th)\b/, // 1st, 2nd, 3rd, 4th etc.
    ];

    const hasDatePattern = datePatterns.some(pattern => pattern.test(cleanText));
    const hasCalendarFormat = hasMonth && hasDateNumber;

    return hasCalendarFormat || hasDatePattern;
  }
  async checkAlbumCoverImageIsVisible(): Promise<void> {
    await test.step('Check album cover image is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageSitesComponent.albumCoverImage, {
        assertionMessage: 'Album cover image should be visible',
      });
    });
  }

  async checkAuthorNameIsDisplayed(authorName: string): Promise<void> {
    await test.step('Check author name is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageSitesComponent.getAuthorNameByLabel(authorName), {
        assertionMessage: `Author name '${authorName}' should be visible`,
      });
    });
  }
  async clickOnTheManageSiteButton(): Promise<void> {
    await test.step('Click on the manage site button', async () => {
      await this.clickOnElement(this.manageSitesComponent.clickOnTheManageSiteButton);
    });
  }
  async clickOnThePageCategoryButton(): Promise<void> {
    await test.step('Click on the page category button', async () => {
      await this.clickOnElement(this.manageSitesComponent.clickOnPageCategory);
    });
  }
  async checkTheError(): Promise<void> {
    await test.step('Check the error', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageSitesComponent.checkTheError, {
        assertionMessage: 'The error should be visible',
      });
    });
  }
}
