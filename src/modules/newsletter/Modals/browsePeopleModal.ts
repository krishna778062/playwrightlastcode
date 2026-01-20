import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BaseActionUtil } from '@core/utils/baseActionUtil';
import { BaseVerificationUtil } from '@core/utils/baseVerificationUtil';

const MAX_PEOPLE_SELECTION = 20;

export class BrowsePeopleModal extends BaseActionUtil {
  readonly verifier: BaseVerificationUtil;

  readonly modalDialog: Locator;
  readonly departmentSelect: Locator;
  readonly locationSelect: Locator;
  readonly userCategorySelect: Locator;
  readonly addButton: Locator;
  readonly resultCountText: Locator;
  readonly searchInput: Locator;
  readonly showMoreButton: Locator;
  readonly peopleMenuPortal: Locator;
  readonly peopleList: Locator;
  readonly checkboxes: Locator;
  readonly noResultsText: Locator;
  readonly resetFiltersButton: Locator;

  readonly departmentOption: (department: string) => Locator;
  readonly locationOption: (location: string) => Locator;
  readonly personCheckbox: (name: string) => Locator;

  constructor(page: Page) {
    super(page);
    this.verifier = new BaseVerificationUtil(page);

    this.modalDialog = this.page.getByRole('dialog');
    this.departmentSelect = this.page.locator('#department');
    this.locationSelect = this.page.locator('#location');
    this.userCategorySelect = this.page.locator('#userCategory');
    this.addButton = this.modalDialog.locator("button[type='submit']").filter({ hasText: /^Add/ });
    this.resultCountText = this.modalDialog.locator('p').first();
    this.searchInput = this.modalDialog.locator('#term');
    this.showMoreButton = this.modalDialog.getByRole('button', { name: 'Show more' });
    this.peopleMenuPortal = this.page.locator('#peopleMenuPortal');
    this.peopleList = this.modalDialog.getByRole('list');
    this.checkboxes = this.modalDialog.locator('input[type="checkbox"]');
    this.noResultsText = this.modalDialog.getByText('No results');
    this.resetFiltersButton = this.modalDialog.getByRole('button', { name: 'Reset filters' });

    this.departmentOption = (department: string) => this.page.getByRole('menuitem', { name: department });
    this.locationOption = (location: string) => this.page.getByRole('menuitem', { name: location });
    this.personCheckbox = (name: string) => this.modalDialog.getByRole('checkbox', { name: new RegExp(name, 'i') });
  }

  /**
   * Enters text into the department search field
   * @param department - The department to search for
   */
  async enterTextIntoSearchDepartmentField(department: string): Promise<void> {
    await test.step(`Search for department: ${department}`, async () => {
      await expect(this.peopleMenuPortal, 'People menu portal should be visible').toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });

      await this.departmentSelect.click();
      await this.departmentSelect.fill(department);
      await this.page.waitForTimeout(TIMEOUTS.VERY_VERY_SHORT);
    });
  }

  /**
   * Clicks on a department search result
   * @param department - The department name to click
   */
  async clickSearchDepartmentFieldSearchResult(department: string): Promise<void> {
    await test.step(`Click department search result: ${department}`, async () => {
      await this.clickOnElement(this.departmentOption(department), {
        stepInfo: `Click on department: ${department}`,
      });
    });
  }

  /**
   * Enters text into the location search field
   * @param location - The location to search for
   */
  async enterTextIntoSearchLocationField(location: string): Promise<void> {
    await test.step(`Search for location: ${location}`, async () => {
      await expect(this.peopleMenuPortal, 'People menu portal should be visible').toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });

      await this.locationSelect.click();
      await this.locationSelect.fill(location);
      await this.page.waitForTimeout(TIMEOUTS.SHORT);
    });
  }

  /**
   * Clicks on a location search result (returns false if location not found)
   * @param location - The location name to click
   * @returns Promise<boolean> - true if location was clicked, false if not found
   */
  async clickSearchLocationFieldSearchResult(location: string): Promise<boolean> {
    return await test.step(`Click location search result: ${location}`, async () => {
      const locationMenuItem = this.locationOption(location);

      try {
        // Wait for the menuitem to appear
        await expect(locationMenuItem, `Location "${location}" should appear in dropdown`).toBeVisible({
          timeout: TIMEOUTS.SHORT,
        });

        await this.clickOnElement(locationMenuItem, {
          stepInfo: `Click on location: ${location}`,
        });
        return true;
      } catch (error) {
        // Location not found in dropdown - environment doesn't have this data
        console.log(`Location "${location}" not found in dropdown, skipping location filter`);
        return false;
      }
    });
  }

  /**
   * Selects a user category from the dropdown
   * @param category - The category to select
   */
  async selectUserCategory(category: string): Promise<void> {
    await test.step(`Select user category: ${category}`, async () => {
      await this.userCategorySelect.selectOption(category);
      // Wait for results to update after category selection
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });
  }

  /**
   * Asserts that the result count is displayed
   * @param expectedText - The expected result text (e.g., "1 person", "16 people")
   */
  async assertResultCountIsDisplayed(expectedText: string): Promise<void> {
    await test.step(`Assert result count: ${expectedText}`, async () => {
      const resultText = this.modalDialog.getByText(expectedText, { exact: false });
      await this.verifier.verifyTheElementIsVisible(resultText, {
        assertionMessage: `Result count "${expectedText}" should be visible`,
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Asserts that a person result is displayed with correct details
   * @param name - The person's name
   * @param role - The person's role
   * @param department - The person's department
   */
  async assertPersonResultIsDisplayed(name: string, role: string, department: string): Promise<void> {
    await test.step(`Assert person ${name} is displayed with role ${role} and department ${department}`, async () => {
      // Find the person by name in the list
      const personContainer = this.modalDialog.locator(`p:has-text("${name}")`).first();

      await this.verifier.verifyTheElementIsVisible(personContainer, {
        assertionMessage: `Person name ${name} should be visible`,
        timeout: TIMEOUTS.SHORT,
      });

      // Verify role and department are displayed
      const roleText = this.modalDialog.getByText(`${role} - ${department}`, { exact: false });
      await this.verifier.verifyTheElementIsVisible(roleText, {
        assertionMessage: `Person role "${role} - ${department}" should be visible`,
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Selects a displayed person by clicking on their checkbox
   * @param name - The person's name to select
   */
  async selectDisplayedPerson(name: string): Promise<void> {
    await test.step(`Select person: ${name}`, async () => {
      await this.clickOnElement(this.personCheckbox(name), {
        stepInfo: `Click checkbox for person: ${name}`,
      });
    });
  }

  /**
   * Clicks the Add button to add selected people to the newsletter
   */
  async clickAdd(): Promise<void> {
    await test.step('Click Add button', async () => {
      await this.clickOnElement(this.addButton, {
        stepInfo: 'Click Add button to add selected people',
      });

      await expect(this.modalDialog, 'People modal should close after adding').toBeHidden({
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Searches for a person by name in the Browse modal and selects them
   * @param personName - The name of the person to search for and select
   */
  async enterAndSelectPersonNameInBrowsePeopleModal(personName: string): Promise<void> {
    await test.step(`Search and select person: ${personName}`, async () => {
      await this.searchInput.clear();
      await this.searchInput.fill(personName);
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      await this.clickOnElement(this.checkboxes.first(), {
        stepInfo: `Select first person from search results for: ${personName}`,
      });
    });
  }

  /**
   * Asserts that people list is displayed in the modal without requiring search terms
   * Verifies that results are shown by default when modal opens
   */
  async assertPeopleListAreDisplayedOnModal(): Promise<void> {
    await test.step('Assert people list is displayed in modal', async () => {
      const listItems = this.peopleList.locator('li');

      await this.verifier.verifyTheElementIsVisible(this.peopleList, {
        assertionMessage: 'People list should be visible in the modal',
        timeout: TIMEOUTS.SHORT,
      });

      await this.verifier.verifyTheElementIsVisible(listItems.first(), {
        assertionMessage: 'At least one person should be displayed in the list',
        timeout: TIMEOUTS.SHORT,
      });

      const itemCount = await listItems.count();
      expect(itemCount, 'Should have at least 1 person in the list').toBeGreaterThanOrEqual(1);
    });
  }

  /**
   * Clicks the "Show more" button to load additional people in the modal
   */
  async clickOnShowMoreButton(): Promise<void> {
    await test.step('Click Show more button', async () => {
      await this.clickOnElement(this.showMoreButton, {
        stepInfo: 'Click Show more button to load more people',
      });

      // Wait for additional people to load
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
  }

  /**
   * Checks all available checkboxes to select the maximum number of people
   * Note: The modal enforces a maximum selection limit (currently 20)
   */
  async checkMaxNumberOfPeople(): Promise<void> {
    await test.step(`Check all checkboxes to reach maximum selection (limit: ${MAX_PEOPLE_SELECTION})`, async () => {
      const checkboxCount = await this.checkboxes.count();

      for (let i = 0; i < checkboxCount; i++) {
        const checkbox = this.checkboxes.nth(i);
        const isChecked = await checkbox.isChecked();
        if (!isChecked) {
          await checkbox.check();
        }
      }

      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });
  }

  /**
   * Searches for a person and tries to check their checkbox when already at max selection limit
   * This triggers the "Maximum selections" error
   * @param personName - The name of the person to search for and attempt to check
   */
  async searchAndTryToCheckPersonAtMaxLimit(personName: string): Promise<void> {
    await test.step(`Search and attempt to check person when at max limit: ${personName}`, async () => {
      await this.searchInput.clear();
      await this.searchInput.fill(personName);
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      await this.checkboxes.first().check();
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });
  }

  /**
   * Asserts that the maximum selection error message is displayed
   */
  async assertMaxSelectErrorIsDisplayed(): Promise<void> {
    await test.step('Assert maximum selection error is displayed', async () => {
      const errorMessage = this.modalDialog.getByText(/Maximum \d+ selections \(\d+ too many\)/);

      await this.verifier.verifyTheElementIsVisible(errorMessage, {
        assertionMessage: `Maximum selection error message should be visible (limit: ${MAX_PEOPLE_SELECTION})`,
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  async handleNoResultsAndSelectFirstPerson(): Promise<void> {
    await test.step('Handle no results scenario and select first available person', async () => {
      const noResultsVisible = await this.noResultsText.isVisible().catch(() => false);

      if (noResultsVisible) {
        await this.clickOnElement(this.resetFiltersButton, {
          stepInfo: 'Click Reset filters button',
        });

        await this.noResultsText
          .first()
          .waitFor({ state: 'hidden', timeout: TIMEOUTS.SHORT })
          .catch(() => {
            throw new Error('Unable to reset filters - no people available in this environment');
          });

        await this.peopleList.waitFor({ state: 'visible', timeout: TIMEOUTS.VERY_SHORT });
      }

      const firstCheckbox = this.checkboxes.first();
      await firstCheckbox.waitFor({ state: 'visible', timeout: TIMEOUTS.VERY_SHORT });
      await this.clickOnElement(firstCheckbox, {
        stepInfo: 'Select first available person',
      });
    });
  }
}
