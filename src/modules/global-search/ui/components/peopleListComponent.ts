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
  private readonly orgChartIconLocator: Locator;
  private readonly tooltipLocator: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);
    this.jobDeptLocationLocator = this.rootLocator.locator('p');
    this.userThumbnailLocator = this.rootLocator.locator('div[class*="UserEmblem-module"]');
    this.peopleLinkLocator = this.rootLocator.locator('span[class*="BreadcrumbItem-module"]:has-text("People")');
    this.homePageLinkLocator = this.rootLocator.locator('a[aria-label*="home"]');
    this.orgChartIconLocator = this.rootLocator.locator('[data-testid="i-orgChart"]');
    this.tooltipLocator = this.page.locator('[role="tooltip"]');
  }

  /**
   * Verifies job title and department are displayed in the people result item
   * @param jobTitle - the expected job title
   * @param department - the expected department
   */
  async verifyJobTitleAndDepartmentIsDisplayed(jobTitle: string, department: string) {
    await test.step(`Verifying job title "${jobTitle}" and department "${department}" are displayed in the people result item`, async () => {
      const expectedText = `${jobTitle} - ${department}`;
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

  /**
   * Verifies org chart icon visibility based on configuration
   * @param shouldBeVisible - whether the org chart icon should be visible or not
   */
  async verifyOrgChartIconVisibility(shouldBeVisible: boolean) {
    await test.step(`Verifying org chart icon is ${shouldBeVisible ? 'visible' : 'not visible'} in the people result item`, async () => {
      if (shouldBeVisible) {
        await this.verifier.verifyTheElementIsVisible(this.orgChartIconLocator, {
          timeout: 50000,
          assertionMessage: `Verifying org chart icon is visible in the people result item`,
        });
      } else {
        await this.verifier.verifyTheElementIsNotVisible(this.orgChartIconLocator, {
          timeout: 20000,
          assertionMessage: `Verifying org chart icon is not visible in the people result item`,
        });
      }
    });
  }

  /**
   * Verifies org chart icon tooltip text on mouse hover
   * @param expectedTooltipText - the expected tooltip text
   */
  async verifyOrgChartIconTooltip(expectedTooltipText: string) {
    await test.step(`Verifying org chart icon tooltip shows "${expectedTooltipText}"`, async () => {
      await this.orgChartIconLocator.hover();
      const tooltipWithText = this.tooltipLocator.filter({ hasText: expectedTooltipText });
      await this.verifier.verifyTheElementIsVisible(tooltipWithText, {
        timeout: 5000,
        assertionMessage: `Verifying org chart icon tooltip shows "${expectedTooltipText}"`,
      });
    });
  }

  /**
   * Clicks on org chart icon and verifies navigation to org chart page
   * @param userId - the user ID to verify in the org chart URL
   */
  async clickOrgChartIconAndVerifyNavigation(userId: string) {
    await test.step(`Clicking org chart icon and verifying navigation to org chart page for user "${userId}"`, async () => {
      await this.clickOnElement(this.orgChartIconLocator, {
        timeout: 20000,
        stepInfo: 'Clicking on org chart icon',
      });

      // Wait for navigation to org chart page with user ID
      const orgChartUrlPattern = new RegExp(`orgchart.*${userId}`);
      await this.verifier.waitUntilPageHasNavigatedTo(orgChartUrlPattern, {
        timeout: 50_000,
        stepInfo: `Verifying navigation to org chart page for user "${userId}"`,
      });
    });
  }
}
