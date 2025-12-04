import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

// Page Object Model for the Audience management page with category creation and validation functionality
export class PeopleDirectoryPage extends BasePage {
  readonly userMode: Locator;
  readonly people: Locator;
  readonly directory: Locator;
  readonly searchPeople: Locator;
  readonly peopleFilter: Locator;
  readonly manager: Locator;
  readonly division: Locator;
  readonly expertise: Locator;
  readonly hireDate: Locator;
  readonly timeZone: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.PEOPLE_DIRECTORY_PAGE) {
    super(page, pageUrl);

    this.userMode = page.getByLabel('User mode');
    this.people = page.getByText('People');
    this.directory = page.getByText('Directory');
    this.searchPeople = page.getByLabel('Search people...');
    this.peopleFilter = page.getByLabel('Filters');

    this.timeZone = this.page.locator('xpath=//h3[text()="Time zone"]');
    this.hireDate = this.page.locator('xpath=//h3[text()="Hire date"]');
    this.expertise = this.page.locator('xpath=//h3[text()="Expertise"]');
    this.division = this.page.locator('xpath=//h3[text()="Division"]');
    this.manager = this.page.locator('xpath=//h3[text()="Manager"]');
  }

  // Verify that the Home page is loaded
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the people directory page is loaded', async () => {
      await expect(this.userMode, 'expecting User Mode to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Navigate to People Directory Page
   */
  async navigatePeopleDirectory(): Promise<void> {
    await this.clickOnElement(this.people);
    await this.clickOnElement(this.directory);
    await this.clickOnElement(this.peopleFilter);
    await expect(this.searchPeople, 'expecting search people to be visible').toBeVisible({
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  /**
   * Verify the presence of filter under filters field of people directory for custom user
   */
  async validateFilters(options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? `Click on People Directory`, async () => {
      await expect(this.searchPeople, 'expecting search people to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });

      // await expect(this.manager).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await expect(this.division).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await expect(this.expertise).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await expect(this.hireDate).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await expect(this.timeZone).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    });
  }
}
