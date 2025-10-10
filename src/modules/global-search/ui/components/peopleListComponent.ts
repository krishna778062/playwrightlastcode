import { Locator, Page, test } from '@playwright/test';

import { ResultListingComponent } from '@/src/modules/global-search/ui/components/resultsListComponent';

/**
 * Component for handling people search results in global search
 */
export class PeopleListComponent extends ResultListingComponent {
  private readonly jobDeptLocationLocator: Locator;
  private readonly userThumbnailLocator: Locator;
  private readonly peopleLinkLocator: Locator;
  private readonly homePageLinkLocator: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.jobDeptLocationLocator = this.rootLocator.locator('p');
    this.userThumbnailLocator = this.rootLocator.locator('div[class*="UserEmblem-module"]');
    this.peopleLinkLocator = this.rootLocator.locator('span[class*="BreadcrumbItem-module"]:has-text("People")');
    this.homePageLinkLocator = this.rootLocator.locator('a[aria-label*="home"]');
  }

  /**
   * Verifies job title and department are displayed in the people result item
   * @param jobTitle - the expected job title
   * @param department - the expected department
   */
  async verifyJobTitleAndDepartmentIsDisplayed(jobTitle: string, department: string) {
    await test.step(`Verifying job title "${jobTitle}" and department "${department}" are displayed in the people result item`, async () => {
      const expectedText = `${jobTitle} - ${department}`;
      // Try multiple locator strategies for better reliability
      const jobDeptElement = this.jobDeptLocationLocator.filter({ hasText: expectedText });
      await this.verifier.verifyElementHasText(jobDeptElement, expectedText, {
        timeout: 20000,
        assertionMessage: `Verifying job title "${jobTitle}" and department "${department}" are displayed as "${expectedText}" in the people result item`,
      });
    });
  }

  /**
   * Verifies location is displayed in the people result item
   * @param location - the expected location (e.g., "Bengaluru, Karnataka")
   */
  async verifyLocationIsDisplayed(location: string) {
    await test.step(`Verifying location "${location}" is displayed in the people result item`, async () => {
      // Use text-based locator for better reliability
      const locationElement = this.jobDeptLocationLocator.filter({ hasText: location });
      await this.verifier.verifyElementHasText(locationElement, location, {
        timeout: 20000,
        assertionMessage: `Verifying location "${location}" is displayed in the people result item`,
      });
    });
  }

  /**
   * Verifies user thumbnail is displayed in the people result item
   */
  async verifyUserThumbnailIsDisplayed() {
    await test.step(`Verifying user thumbnail is displayed in the people result item`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.userThumbnailLocator, {
        timeout: 20000,
        assertionMessage: `Verifying user thumbnail is displayed in the people result item`,
      });
    });
  }

  /**
   * Verifies navigation to user profile by clicking on the user thumbnail
   * @param userId - the user ID to verify in the URL
   */
  async verifyNavigationWithUserThumbnailLink(userId: string) {
    await test.step(`Verifying navigation with user thumbnail link to "${userId}"`, async () => {
      await this.clickOnElement(this.userThumbnailLocator, { timeout: 50_000 });
      await this.verifier.waitUntilPageHasNavigatedTo(new RegExp(userId), {
        timeout: 50_000,
        stepInfo: `Verifying navigation with user thumbnail link to "${userId}"`,
      });
    });
  }

  /**
   * Verifies navigation to people page by clicking on the people link
   */
  async verifyNavigationWithPeopleLink() {
    await test.step(`Verifying navigation to people page`, async () => {
      await this.clickOnElement(this.peopleLinkLocator, { timeout: 50_000 });
      await this.verifier.waitUntilPageHasNavigatedTo(new RegExp('people'), {
        timeout: 50_000,
        stepInfo: `Verifying navigation to people page`,
      });
    });
  }

  /**
   * Verify the navigation with the home page link
   */
  async verifyNavigationWithHomePageLink() {
    await test.step(`Verifying navigation with home page link`, async () => {
      await this.clickOnElement(this.homePageLinkLocator, { timeout: 50_000 });
      await this.verifier.waitUntilPageHasNavigatedTo(new RegExp('home'), {
        timeout: 20_000,
        stepInfo: `Verifying navigation with home page link`,
      });
    });
  }
}
