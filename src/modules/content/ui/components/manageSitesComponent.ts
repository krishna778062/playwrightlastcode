import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';

export class ManageSitesComponent extends BaseComponent {
  readonly clickOnSite: Locator;
  readonly coverImage: Locator;
  readonly contentTab: Locator;
  readonly eventsTab: Locator;
  readonly searchEventInSearchBar: Locator;
  readonly albumCoverImage: Locator;
  readonly authorName: Locator;
  readonly clickOnTheManageSiteButton: Locator;
  readonly clickOnPageCategory: Locator;
  readonly checkTheError: Locator;
  readonly clickOnAboutTab: Locator;
  readonly clickOnTheMembersTab: Locator;
  readonly clickOnStartIcon: Locator;
  readonly clickOnFavouriteTabs: Locator;
  readonly clickOnPeppleTab: Locator;
  readonly clickOnTheMemberButtonInAboutTab: Locator;
  readonly clickOnAlreadyStarIcon: Locator;
  readonly clickOnTheMemberButton: Locator;
  readonly clickOnLeaveButton: Locator;
  readonly clickOnInsideContentButton: Locator;
  readonly eventsTabImage: Locator;
  readonly albumTabImage: Locator;
  readonly pageTabImage: Locator;
  readonly nothingToShowHereText: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.clickOnSite = page.getByRole('cell', { name: 'Name' });
    this.coverImage = page.locator('.SiteHeader-image:has(img[src])');
    this.contentTab = page.getByRole('tab', { name: 'Content' });
    this.eventsTab = page.locator('[class="CalendarDay CalendarDay--xlarge"]').first();
    this.searchEventInSearchBar = page.getByRole('textbox', { name: 'Search…' });
    this.albumCoverImage = page.locator('[aria-label="Open album"]').first();
    this.authorName = page.locator('[class="ContentCard"]').first();
    this.clickOnTheManageSiteButton = page.getByRole('link', { name: 'Manage site' });
    this.clickOnPageCategory = page.getByRole('tab', { name: 'Page categories' });
    this.checkTheError = page.locator('p', { hasText: 'Duplicate page category name' });
    this.clickOnAboutTab = page.getByRole('tab', { name: 'About' });
    this.clickOnTheMembersTab = page.getByRole('tab', { name: 'Members' });
    this.clickOnStartIcon = page.getByRole('button', { name: 'Favorite this user' });
    this.clickOnAlreadyStarIcon = page.getByRole('button', { name: 'Unfavorite this user' });
    this.clickOnFavouriteTabs = page.getByRole('menuitem', { name: 'Favorites Favorites' });

    this.clickOnPeppleTab = page.getByRole('tab', { name: 'People' });
    this.clickOnTheMemberButtonInAboutTab = page.locator(`[role="tab"][id="member"]`);
    this.clickOnTheMemberButton = page.getByRole('button', { name: 'Member' });
    this.clickOnLeaveButton = page.getByRole('button', { name: 'Leave', exact: true });
    this.clickOnInsideContentButton = page.getByRole('tab', { name: 'Content' });
    this.eventsTabImage = page.locator('[class="CalendarDay CalendarDay--xlarge"]').first();
    this.albumTabImage = page.locator('[class="Image Image--objectFit Image--square"]').first();
    this.pageTabImage = page.locator('[class="Image Image--objectFit Image--square"]').first();
    this.nothingToShowHereText = page.locator('p:has-text("Nothing to show here")');
  }

  getAuthorNameByLabel(authorName: string): Locator {
    return this.page.locator(`[class="meta-link"]`).filter({ hasText: authorName }).first();
  }

  getMembersNameByLabel(membersName: string): Locator {
    return this.page.locator(`[aria-label="${membersName}"]`);
  }

  getMembersListInPeopleTab(membersName: string): Locator {
    return this.page.getByRole('link', { name: membersName });
  }

  getFavoriteButtonForUser(membersName: string): Locator {
    return this.page
      .getByRole('listitem')
      .filter({ hasText: membersName })
      .getByRole('button', { name: 'Favorite this user' });
  }

  // Action methods
  async clickOnSiteAction(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.clickOnSite);
      await this.clickOnSite.press('Tab');
      await this.clickOnSite.press('Enter');
    });
  }

  async searchEventInSearchBarAction(eventName: string): Promise<void> {
    await test.step('Searching event in search bar', async () => {
      await this.typeInElement(this.searchEventInSearchBar, eventName);
      await this.searchEventInSearchBar.press('Enter');
    });
  }

  async verifyEventsTabMatchesApiDate(startsAt: string): Promise<void> {
    await test.step('Verify events tab matches API startsAt date', async () => {
      await this.verifier.verifyTheElementIsVisible(this.eventsTab, {
        assertionMessage: 'Events tab should be visible',
      });

      const eventsTabText = await this.eventsTab.allTextContents();
      console.log('Events tab text:', eventsTabText);
      console.log('Starts at date:', startsAt);
      const { month, day } = this.parseStartsAtDate(startsAt);

      if (!this.doesTextMatchDate(eventsTabText[0], month, day)) {
        throw new Error(
          `Events tab text does not match API date.\n` +
            `API startsAt: ${startsAt} (${month} ${day})\n` +
            `Events tab text: "${eventsTabText[0]}"`
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
    const month = monthNames[date.getMonth()];
    const day = date.getDate().toString();
    return { month, day };
  }

  private doesTextMatchDate(text: string, expectedMonth: string, expectedDay: string): boolean {
    const cleanText = text.trim().replace(/[\s\u200C\u200D\uFEFF\u00A0\u2000-\u200F\u2028-\u202F\u205F\u3000]+/g, ' ');
    const lowerText = cleanText.toLowerCase();
    const lowerMonth = expectedMonth.toLowerCase();

    console.log(`🔍 Matching: "${text}" | Expected: ${expectedMonth}${expectedDay}`);
    console.log(`📝 Clean text: "${cleanText}" -> "${lowerText}"`);
    console.log(`✅ Month "${lowerMonth}": ${lowerText.includes(lowerMonth)}`);
    console.log(`✅ Day "${expectedDay}": ${cleanText.includes(expectedDay)}`);

    return lowerText.includes(lowerMonth) && cleanText.includes(expectedDay);
  }

  async checkAuthorNameIsDisplayed(authorName: string | undefined): Promise<void> {
    await test.step('Check author name is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getAuthorNameByLabel(authorName || ''), {
        assertionMessage: `Author name '${authorName}' should be visible`,
      });
    });
  }

  async clickOnTheManageSiteButtonAction(): Promise<void> {
    await test.step('Click on the manage site button', async () => {
      await this.clickOnElement(this.clickOnTheManageSiteButton);
    });
  }

  async clickOnThePageCategoryButtonAction(): Promise<void> {
    await test.step('Click on the page category button', async () => {
      await this.clickOnElement(this.clickOnPageCategory);
    });
  }

  async checkTheErrorAction(): Promise<void> {
    await test.step('Check the error', async () => {
      await this.verifier.verifyTheElementIsVisible(this.checkTheError, {
        assertionMessage: 'The error should be visible',
      });
    });
  }

  async clickOnAboutTabAction(): Promise<void> {
    await test.step('Click on the about tab', async () => {
      await this.clickOnElement(this.clickOnAboutTab);
    });
  }

  async clickOnTheMembersTabAction(): Promise<void> {
    await test.step('Click on the members tab', async () => {
      await this.clickOnElement(this.clickOnTheMembersTab);
    });
  }

  async hoverOnMembersName(membersName: string): Promise<void> {
    await test.step('Hover on the members name', async () => {
      await this.getMembersNameByLabel(membersName).hover();
    });
  }

  async markAsFavoriteAndCheckRGBColor(membersName: string): Promise<void> {
    const publishResponse = await this.performActionAndWaitForResponse(
      () => this.clickOnElement(this.clickOnStartIcon),
      response =>
        response.url().includes(PAGE_ENDPOINTS.IDENTITY_FAVOURITES) &&
        response.request().method() === 'POST' &&
        response.status() === 200,
      {
        timeout: 20_000,
      }
    );
    await publishResponse.finished();

    const favoriteButton = this.getFavoriteButtonForUser(membersName);

    // Target the SVG path specifically
    const svgPath = favoriteButton.locator('svg path');

    // Debug: Log the actual fill color
    const fillColor = await svgPath.evaluate(el => window.getComputedStyle(el).fill);
    console.log('Actual SVG fill color:', fillColor);

    await expect(svgPath).toHaveCSS('fill', 'rgb(207, 130, 7)');
  }

  async checkIsUserMarkedAsFavorite(): Promise<void> {
    await test.step('Check is user marked as favorite', async () => {
      if (await this.verifier.isTheElementVisible(this.clickOnAlreadyStarIcon)) {
        const publishResponse = await this.performActionAndWaitForResponse(
          () => this.clickOnElement(this.clickOnStartIcon),
          response =>
            response.url().includes(PAGE_ENDPOINTS.IDENTITY_FAVOURITES) &&
            response.request().method() === 'POST' &&
            response.status() === 200,
          {
            timeout: 20_000,
          }
        );
        await publishResponse.finished();
      } else {
        console.log('The user is not marked as favorite');
      }
    });
  }

  async clickOnTheFavouriteTabsAction(): Promise<void> {
    await test.step('Click on the favourite tabs', async () => {
      await this.clickOnElement(this.clickOnFavouriteTabs);
    });
  }

  async clickOnPeppleTabAction(): Promise<void> {
    await test.step('Click on the pepple tab', async () => {
      await this.clickOnElement(this.clickOnPeppleTab);
    });
  }

  async checkMarkedAsFavoriteInPeopleList(membersName: string): Promise<void> {
    await test.step('Check marked as favorite in people list', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getMembersListInPeopleTab(membersName), {
        assertionMessage: 'The user should be marked as favorite',
      });
    });
  }

  async markAsUnfavorite(membersName: string): Promise<void> {
    await test.step('Mark as Favorite', async () => {
      await this.clickOnElement(this.getFavoriteButtonForUser(membersName));
    });
  }

  async clickOnTheAboutTabAction(): Promise<void> {
    await test.step('Click on the about tab', async () => {
      await this.clickOnElement(this.clickOnAboutTab);
    });
  }

  async clickOnTheMemberButtonInAboutTabAction(): Promise<void> {
    await test.step('Click on the member button in about tab', async () => {
      await this.clickOnElement(this.clickOnTheMemberButtonInAboutTab);
    });
  }

  async checkMarkedAsFavoriteInPeopleListShouldNotBeVisible(membersName: string): Promise<void> {
    await test.step('Check marked as favorite in people list should not be visible', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.getMembersListInPeopleTab(membersName), {
        assertionMessage: 'The user should not be marked as favorite',
      });
    });
  }

  async clickOntheMemberButtonAction(): Promise<void> {
    await test.step('Click on the member button', async () => {
      await this.clickOnElement(this.clickOnTheMemberButton);
    });
  }

  async clickOnLeaveButtonAction(): Promise<void> {
    await test.step('Click on the leave button', async () => {
      await this.clickOnElement(this.clickOnLeaveButton);
    });
  }

  async clickOnInsideContentButtonAction(): Promise<void> {
    await test.step('Click on the manage content button', async () => {
      await this.clickOnElement(this.clickOnInsideContentButton);
    });
  }

  async verifyEventsTabImageIsDisplayed(): Promise<void> {
    await test.step('Verify events tab image is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.eventsTabImage, {
        assertionMessage: 'Events tab image should be visible',
      });
    });
  }

  async verifyAlbumTabImageIsDisplayed(): Promise<void> {
    await test.step('Verify album tab image is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.albumTabImage, {
        assertionMessage: 'Album tab image should be visible',
      });
    });
  }

  async verifyPageTabImageIsDisplayed(): Promise<void> {
    await test.step('Verify page tab image is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageTabImage, {
        assertionMessage: 'Page tab image should be visible',
      });
    });
  }

  async verifyNoSitesFoundAction(siteName: string): Promise<void> {
    await test.step(`Verify no sites found for search term: ${siteName}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.nothingToShowHereText, {
        assertionMessage: `No sites found message should be visible when searching for: ${siteName}`,
      });
    });
  }
}
