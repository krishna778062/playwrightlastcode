import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

// Page Object Model for the Audience management page with category creation and validation functionality
export class PeopleDirectoryPage extends BasePage {
  readonly userMode: Locator;
  readonly people: Locator;
  readonly searchPeople: Locator;
  readonly peopleFilter: Locator;
  readonly manager: Locator;
  readonly assistant: Locator;
  readonly expertise: Locator;
  readonly hireDate: Locator;
  readonly timeZone: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.PEOPLE_DIRECTORY_PAGE) {
    super(page, pageUrl);

    this.userMode = page.locator('[aria-label*="User mode"]');
    this.people = page.getByText('People');
    this.searchPeople = page.locator('[aria-label*="Search people..."]');
    this.peopleFilter = page.locator('[aria-label*="Filters"]');
    this.manager = page.locator('[h3*="Manager"]');
    this.assistant = page.locator('[h3*="Assistant"]');

    this.expertise = page.locator('[h3*="Expertise"]');
    this.hireDate = page.locator('[h3*="Hire date"]');
    this.timeZone = page.locator('[h3*="Time zone"]');
  }

  // Verify that the Home page is loaded
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the home page is loaded', async () => {
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

      await expect(this.manager).toBeVisible,
        {
          stepInfo: 'Verify the presence of Manager filter',
          timeout: TIMEOUTS.MEDIUM,
        };
      await expect(this.assistant).toBeVisible,
        {
          stepInfo: 'Verify the presence of assistant filter',
          timeout: TIMEOUTS.MEDIUM,
        };
      await expect(this.expertise).toBeVisible,
        {
          stepInfo: 'Verify the presence of expertise filter',
          timeout: TIMEOUTS.MEDIUM,
        };
      await expect(this.hireDate).toBeVisible,
        {
          stepInfo: 'Verify the presence of hireDate filter',
          timeout: TIMEOUTS.MEDIUM,
        };
      await expect(this.timeZone).toBeVisible,
        {
          stepInfo: 'Verify the presence of timeZone filter',
          timeout: TIMEOUTS.MEDIUM,
        };
    });
  }
}
