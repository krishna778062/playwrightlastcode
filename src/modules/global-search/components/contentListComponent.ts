import { expect, Locator, Page, test } from '@playwright/test';

import { ResultListingComponent } from './resultsListComponent';

import { getTodayFormattedDate } from '@/src/core/utils/dateUtil';
import { getEventDateDisplayText } from '@/src/core/utils/dateUtil';

/**
 * ContentListComponent is a UI component class that extends ResultListingComponent.
 *
 * It encapsulates interactions and assertions for content search result items in the global search results page.
 * This includes verifying displayed user, navigation via site and author links, page icon visibility, and date display.
 *
 * Use this component in Playwright tests to interact with and assert on content-specific search results.
 */
export class ContentListComponent extends ResultListingComponent {
  readonly siteBreadcrumb: Locator;
  readonly resultList: Locator;
  readonly pageIcon: Locator;
  readonly userText: Locator;
  readonly dayText: Locator;
  readonly monthText: Locator;
  readonly calendarIcon: Locator;
  readonly albumIcon: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.siteBreadcrumb = this.rootLocator.locator("span[class*='BreadcrumbItem-module__contai']");
    this.resultList = this.rootLocator.locator("div[class*='Spacing-module__row'] span[class*='ypography-module']");
    this.pageIcon = this.rootLocator.locator("[data-testid='i-page']");
    this.albumIcon = this.rootLocator.locator("[data-testid='i-albums']");
    this.userText = page.locator("h1[class*='ypography-module']");
    this.dayText = this.rootLocator.locator("div[class*='DateEmblem-module__day']");
    this.monthText = this.rootLocator.locator("div[class*='DateEmblem-module__monthInner']");
    this.calendarIcon = this.rootLocator.locator("[data-testid='i-calendar']");
  }

  /**
   * Clicks on the site link from the content card and verifies the site name breadcrumb is displayed.
   * @param name - The name of the site to click.
   */
  async clickOnSiteLink(name: string) {
    await test.step(`Clicking on the site link from content`, async () => {
      const breadcrumbLocator = this.siteBreadcrumb.last();
      const siteText = await breadcrumbLocator.textContent({ timeout: 20000 });

      if (siteText && siteText.endsWith('…')) {
        const cleanedText = siteText.slice(0, -1);
        expect(name).toContain(cleanedText);
      } else {
        await this.verifier.verifyElementHasText(breadcrumbLocator, name, {
          timeout: 4000,
          assertionMessage: 'verifying site name breadcrumb is displayed',
        });
      }
      await this.clickOnElement(breadcrumbLocator);
    });
  }

  /**
   * Verifies navigation to the site link using the provided site ID and site name.
   * @param siteId - The ID of the site to verify navigation for.
   * @param siteName - The name of the site to click.
   */
  async verifyNavigationWithSiteLink(siteId: string, siteName: string) {
    await test.step(`Verifying navigation to site link "${siteId}"`, async () => {
      await this.clickOnSiteLink(siteName);
      await this.verifier.waitUntilPageHasNavigatedTo(new RegExp(siteId), {
        timeout: 50000,
        stepInfo: `Verifying navigation to site link to "${siteId}"`,
      });
    });
  }

  /**
   * Verifies that the specified author/user is displayed in the content result item.
   * @param user - The name of the user/author to verify.
   */
  async verifyAuthorIsDisplayed(user: string) {
    await test.step(`Verifying Author ${user} is displayed`, async () => {
      await this.verifier.verifyElementHasText(this.resultList.first(), user);
    });
  }

  /**
   * Verifies navigation to the author's profile page from the content result item.
   * @param user - The name of the user/author to navigate to.
   */
  async verifyNavigationWithAuthorLink(user: string) {
    await test.step(`Verifying navigation to ${user} profile page`, async () => {
      await this.clickOnElement(this.resultList.first(), { timeout: 50_000 });
      await this.verifier.verifyElementHasText(this.userText, user, { timeout: 50_000 });
    });
  }

  /**
   * Verifies that the page icon is visible in the content result item.
   */
  async verifyPageIconIsDisplayed() {
    await test.step(`Verifying page icon is displayed`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageIcon.last());
    });
  }

  /**
   * Verifies that the album icon is visible in the content result item.
   */
  async verifyAlbumIconIsDisplayed() {
    await test.step(`Verifying album icon is displayed`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.albumIcon);
    });
  }

  /**
   * Verifies that today's formatted date is displayed in the content result item.
   */
  async verifyDateIsDisplayed() {
    const formatted = getTodayFormattedDate();
    await test.step(`Verify date ${formatted} is displayed`, async () => {
      await this.verifier.verifyElementHasText(this.resultList.last(), formatted);
    });
  }

  /**
   * Verifies that the event calendar thumbnail displays the correct month and day for the given ISO date string.
   * @param isoDateString - The ISO date string to verify in the calendar thumbnail.
   */
  async verifyEventCalendarThumbnailIsDisplayed(isoDateString: string) {
    await test.step(`Verify date calendar thumbnail is displayed`, async () => {
      // Parse the ISO date string
      const date = new Date(isoDateString);
      const expectedMonth = date.toLocaleString('en-US', { month: 'short' });
      const expectedDay = date.getDate().toString();
      await this.verifier.verifyElementHasText(this.dayText, expectedDay);
      await this.verifier.verifyElementHasText(this.monthText, expectedMonth);
    });
  }

  /**
   * Verifies that the event date is displayed as "TODAY - TOMORROW" if the dates are today and tomorrow, or as a formatted range otherwise.
   * @param fromDate - The start date of the event (ISO string).
   * @param toDate - The end date of the event (ISO string).
   */
  async verifyEventDateIsDisplayed(fromDate: string, toDate: string) {
    await test.step(`Verify date is displayed as TODAY - TOMORROW or formatted range`, async () => {
      const expectedText = getEventDateDisplayText(fromDate, toDate);
      await this.verifier.verifyElementHasText(this.resultList.last(), expectedText);
    });
  }

  /**
   * Verifies that the calendar icon is visible in the content result item.
   */
  async verifyCalendarIconIsDisplayed() {
    await test.step(`Verifying calendar icon is displayed for events`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.calendarIcon);
    });
  }

  /**
   * Verifies navigation when clicking the calendar day element.
   * @param iD - The unique identifier expected in the navigation URL.
   */
  async verifyNavigationWithCalendarLink(id: string) {
    await test.step(`Verifying navigation to calendar link with ID "${id}"`, async () => {
      await this.clickOnElement(this.dayText, { timeout: 50_000 });
      await this.verifier.waitUntilPageHasNavigatedTo(new RegExp(id), {
        timeout: 50_000,
        stepInfo: `Verifying navigation to calendar link with ID "${id}"`,
      });
    });
  }
}
