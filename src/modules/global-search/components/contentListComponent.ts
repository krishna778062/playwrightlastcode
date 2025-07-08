import { ResultListingComponent } from './resultsListComponent';
import { Locator, Page, test } from '@playwright/test';
import { getTodayFormattedDate } from '@/src/core/utils/dateUtil';

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

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.siteBreadcrumb = this.rootLocator.locator("span[class*='BreadcrumbItem-module__contai']");
    this.resultList = this.rootLocator.locator("div[class*='Spacing-module__row'] span[class*='ypography-module']");
    this.pageIcon = this.rootLocator.locator("[data-testid='i-page']");
    this.userText = page.locator("h1[class*='ypography-module']");
  }

  async clickOnSiteLink(name: string) {
    await test.step(`Clicking on the site link from content`, async () => {
      await this.verifier.verifyElementHasText(this.siteBreadcrumb.last(), name, {
        timeout: 4000,
        assertionMessage: 'verifying site name breadcrumb is displayed',
      });
      await this.clickOnElement(this.siteBreadcrumb.last());
    });
  }

  async verifyNavigationWithSiteLink(siteId: string, siteName: string) {
    await test.step(`Verifying navigation to site link "${siteId}"`, async () => {
      await this.clickOnSiteLink(siteName);
      await this.verifier.waitUntilPageHasNavigatedTo(new RegExp(siteId), {
        timeout: 80000,
        stepInfo: `Verifying navigation to site link to "${siteId}"`,
      });
    });
  }

  async verifyAuthorIsDisplayed(user: string) {
    await test.step(`Verifying Author ${user} is displayed`, async () => {
      await this.verifier.verifyElementHasText(this.resultList.first(), user);
    });
  }

  async verifyNavigationWithAuthorLink(user: string) {
    await test.step(`Verifying navigation to ${user} profile page`, async () => {
      await this.clickOnElement(this.resultList.first(), { timeout: 20000 });
      await this.verifier.verifyElementHasText(this.userText, user,{timeout:30000});
    });
  }

  async verifyPageIconIsDisplayed() {
    await test.step(`Verifying page icon is displayed`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageIcon.last());
    });
  }

  async verifyDateIsDisplayed() {
    const formatted = getTodayFormattedDate();
    await test.step(`Verify date ${formatted} is displayed`, async () => {
      await this.verifier.verifyElementHasText(this.resultList.last(), formatted);
    });
  }
}
