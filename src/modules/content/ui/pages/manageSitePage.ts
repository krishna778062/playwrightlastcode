import { Page, test } from '@playwright/test';
import { expect } from '@playwright/test';

import { MANAGE_SITE_TEST_DATA } from '../test-data/manage-site-test-data';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { ManageSitesComponent } from '@/src/modules/content/ui/components/manageSitesComponent';

export interface IManageSiteActions {
  clickOnSite: () => Promise<void>;
  clickOnAboutTab: () => Promise<void>;
  clickOnTheMembersTab: () => Promise<void>;
  hoverOnMembersName: (membersName: string) => Promise<void>;
  clickOnTheFavouriteTabs: () => Promise<void>;
  markAsUnfavorite: (membersName: string) => Promise<void>;
  clickOnTheMemberButtonInAboutTab: () => Promise<void>;
  clickOnTheAboutTab: () => Promise<void>;
  clickOnTheManageSiteButton: () => Promise<void>;
  clickOnThePageCategoryButton: () => Promise<void>;
  searchEventInSearchBar: (eventName: string) => Promise<void>;
  clickOntheMemberButton: () => Promise<void>;
  clickOnInsideContentButton: () => Promise<void>;
}

export interface IManageSiteAssertions {
  checkIsUserMarkedAsFavorite: () => Promise<void>;
  clickOnPeppleTab: () => Promise<void>;
  verifyEventsTabMatchesApiDate: (startsAt: string) => Promise<void>;
  checkAuthorNameIsDisplayed: (authorName: string) => Promise<void>;
  checkTheError: () => Promise<void>;
  markAsFavoriteAndCheckRGBColor: (membersName: string) => Promise<void>;
  checkMarkedAsFavoriteInPeopleList: (membersName: string) => Promise<void>;
  checkMarkedAsFavoriteInPeopleListShouldNotBeVisible: (membersName: string) => Promise<void>;
  clickOnLeaveButton: () => Promise<void>;
  verifyEventsTabImageIsDisplayed: () => Promise<void>;
  verifyAlbumTabImageIsDisplayed: () => Promise<void>;
  verifyPageTabImageIsDisplayed: () => Promise<void>;
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

      const eventsTabText = await this.manageSitesComponent.eventsTab.allTextContents();
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
      await this.verifier.verifyTheElementIsVisible(this.manageSitesComponent.getAuthorNameByLabel(authorName || ''), {
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

  async clickOnAboutTab(): Promise<void> {
    await test.step('Click on the about tab', async () => {
      await this.clickOnElement(this.manageSitesComponent.clickOnAboutTab);
    });
  }

  async clickOnTheMembersTab(): Promise<void> {
    await test.step('Click on the members tab', async () => {
      await this.clickOnElement(this.manageSitesComponent.clickOnTheMembersTab);
    });
  }

  async hoverOnMembersName(membersName: string): Promise<void> {
    await test.step('Hover on the members name', async () => {
      await this.manageSitesComponent.getMembersNameByLabel(membersName).hover();
    });
  }

  async markAsFavoriteAndCheckRGBColor(membersName: string): Promise<void> {
    const publishResponse = await this.performActionAndWaitForResponse(
      () => this.clickOnElement(this.manageSitesComponent.clickOnStartIcon),
      response =>
        response.url().includes(PAGE_ENDPOINTS.IDENTITY_FAVOURITES) &&
        response.request().method() === 'POST' &&
        response.status() === 200,
      {
        timeout: 20_000,
      }
    );
    await publishResponse.finished();

    const favoriteButton = this.manageSitesComponent.getFavoriteButtonForUser(membersName);

    // Target the SVG path specifically
    const svgPath = favoriteButton.locator('svg path');

    // Debug: Log the actual fill color
    const fillColor = await svgPath.evaluate(el => window.getComputedStyle(el).fill);
    console.log('Actual SVG fill color:', fillColor);

    await expect(svgPath).toHaveCSS('fill', 'rgb(207, 130, 7)');
  }

  async checkIsUserMarkedAsFavorite(): Promise<void> {
    await test.step('Check is user marked as favorite', async () => {
      if (await this.verifier.isTheElementVisible(this.manageSitesComponent.clickOnAlreadyStarIcon)) {
        const publishResponse = await this.performActionAndWaitForResponse(
          () => this.clickOnElement(this.manageSitesComponent.clickOnStartIcon),
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

  async clickOnTheFavouriteTabs(): Promise<void> {
    await test.step('Click on the favourite tabs', async () => {
      await this.clickOnElement(this.manageSitesComponent.clickOnFavouriteTabs);
    });
  }

  async clickOnPeppleTab(): Promise<void> {
    await test.step('Click on the pepple tab', async () => {
      await this.clickOnElement(this.manageSitesComponent.clickOnPeppleTab);
    });
  }

  async checkMarkedAsFavoriteInPeopleList(membersName: string): Promise<void> {
    await test.step('Check marked as favorite in people list', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageSitesComponent.getMembersListInPeopleTab(membersName), {
        assertionMessage: 'The user should be marked as favorite',
      });
    });
  }

  async markAsUnfavorite(membersName: string): Promise<void> {
    await test.step('Mark as Favorite', async () => {
      await this.clickOnElement(this.manageSitesComponent.getFavoriteButtonForUser(membersName));
    });
  }

  async clickOnTheAboutTab(): Promise<void> {
    await test.step('Click on the about tab', async () => {
      await this.clickOnElement(this.manageSitesComponent.clickOnAboutTab);
    });
  }

  async clickOnTheMemberButtonInAboutTab(): Promise<void> {
    await test.step('Click on the member button in about tab', async () => {
      await this.clickOnElement(this.manageSitesComponent.clickOnTheMemberButtonInAboutTab);
    });
  }

  async checkMarkedAsFavoriteInPeopleListShouldNotBeVisible(membersName: string): Promise<void> {
    await test.step('Check marked as favorite in people list should not be visible', async () => {
      await this.verifier.verifyTheElementIsNotVisible(
        this.manageSitesComponent.getMembersListInPeopleTab(membersName),
        {
          assertionMessage: 'The user should not be marked as favorite',
        }
      );
    });
  }

  async clickOntheMemberButton(): Promise<void> {
    await test.step('Click on the member button', async () => {
      await this.clickOnElement(this.manageSitesComponent.clickOnTheMemberButton);
    });
  }

  async clickOnLeaveButton(): Promise<void> {
    await test.step('Click on the leave button', async () => {
      await this.clickOnElement(this.manageSitesComponent.clickOnLeaveButton);
    });
  }

  async clickOnInsideContentButton(): Promise<void> {
    await test.step('Click on the manage content button', async () => {
      await this.clickOnElement(this.manageSitesComponent.clickOnInsideContentButton);
    });
  }

  async verifyEventsTabImageIsDisplayed(): Promise<void> {
    await test.step('Verify events tab image is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageSitesComponent.eventsTabImage, {
        assertionMessage: 'Events tab image should be visible',
      });
    });
  }

  async verifyAlbumTabImageIsDisplayed(): Promise<void> {
    await test.step('Verify album tab image is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageSitesComponent.albumTabImage, {
        assertionMessage: 'Album tab image should be visible',
      });
    });
  }

  async verifyPageTabImageIsDisplayed(): Promise<void> {
    await test.step('Verify page tab image is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageSitesComponent.pageTabImage, {
        assertionMessage: 'Page tab image should be visible',
      });
    });
  }
}
