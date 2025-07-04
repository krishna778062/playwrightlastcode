import { th } from '@faker-js/faker/.';
import { ResultListingComponent } from './resultsListComponent';
import { Locator, Page, test } from '@playwright/test';
import { time } from 'console';

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

  async verifyUserIsDisplayed(user: string) {
    await test.step(`Verifying user ${user} is displayed`, async () => {
      await this.verifier.verifyElementHasText(this.resultList.first(), user);
    });
  }

  async verifyNavigationWithAuthorLink(user: string) {
    await test.step(`Verifying navigation to ${user} profile page`, async () => {
      await this.clickOnElement(this.resultList.first(), { timeout: 20000 });
      await this.verifier.verifyElementHasText(this.userText, user);
    });
  }

  async verifyPageIconIsDisplayed() {
    await test.step(`Verifying page icon is displayed`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageIcon.last());
    });
  }

  async verifyDateIsDisplayed() {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    await test.step(`Verify date ${formatted} is displayed`, async () => {
      await this.verifier.verifyElementHasText(this.resultList.last(), formatted);
    });
  }
}
