import { Locator, Page, test } from '@playwright/test';

import {
  DND_PAGE_TEXT,
  MANAGE_PREFERENCES_PAGE_TEXT,
  PRIORITY_DROPDOWN_OPTIONS,
} from '../../../tests/test-data/dnd-manage-preferences.test-data';

import { BaseComponent } from '@/src/core';

/**
 * DND & Manage Preferences Component
 * Contains only DND-specific locators
 * Use CommonActionsComponent for common operations (clickButton, clickLink, verifyTextIsVisible, etc.)
 */
export class DndManagePreferencesComponent extends BaseComponent {
  // Sidebar menu
  readonly doNotDisturbTab: Locator;

  // Toggle options ("All organization" and "Audience")
  readonly allOrganizationToggle: Locator;
  readonly audienceToggle: Locator;

  // DND "All organization" configuration sections
  readonly selectSourceLabel: Locator;
  readonly ukgSourceOption: Locator;
  readonly manualSourceOption: Locator;
  readonly workDaysSectionLabel: Locator;
  readonly workHoursSectionLabel: Locator;
  readonly workHoursStartTimeField: Locator;
  readonly workHoursEndTimeField: Locator;
  readonly workHoursHelperText: Locator;
  readonly userEditableCheckbox: Locator;
  readonly userEditableHelperText: Locator;

  // Manage Preferences page
  readonly backButton: Locator;
  readonly searchBox: Locator;
  readonly clearSearchButton: Locator;
  readonly sortByButton: Locator;
  readonly filtersButton: Locator;
  readonly filtersPanel: Locator;

  // Filters panel elements
  readonly filtersPanelHeader: Locator;
  readonly resetAllLink: Locator;
  readonly prioritySectionButton: Locator;
  readonly categorySectionButton: Locator;
  readonly categorySearchBox: Locator;
  readonly categorySearchClearButton: Locator;

  // Filters button states
  readonly filtersButtonDefault: Locator; // "Filters" (exact match, no count)

  // Notification table
  readonly notificationRows: Locator;

  constructor(page: Page) {
    super(page);

    // Sidebar menu - tab role
    this.doNotDisturbTab = page.getByRole('tab', { name: DND_PAGE_TEXT.SIDEBAR_MENU.DO_NOT_DISTURB });

    // Toggle options - rendered as ARIA switches; use index-based roles
    // first switch => "All organization", second => "Audience"
    this.allOrganizationToggle = page.getByRole('switch').first();
    this.audienceToggle = page.getByRole('switch').nth(1);

    // All organization configuration sections on DND page
    this.selectSourceLabel = page.getByText(DND_PAGE_TEXT.SELECT_SOURCE.LABEL, { exact: false }).first();
    // Source buttons are identified by test id in the UI (UKG / Manual)
    this.ukgSourceOption = page.getByTestId(DND_PAGE_TEXT.SELECT_SOURCE.SOURCES.UKG);
    this.manualSourceOption = page.getByTestId(DND_PAGE_TEXT.SELECT_SOURCE.SOURCES.MANUAL);
    this.workDaysSectionLabel = page.getByText(DND_PAGE_TEXT.WORK_DAYS.LABEL, { exact: false }).first();
    this.workHoursSectionLabel = page.getByText(DND_PAGE_TEXT.WORK_HOURS.LABEL, { exact: false }).first();
    this.workHoursStartTimeField = page.getByTestId(`field-${DND_PAGE_TEXT.WORK_HOURS.START_TIME_LABEL}`);
    this.workHoursEndTimeField = page.getByTestId(`field-${DND_PAGE_TEXT.WORK_HOURS.END_TIME_LABEL}`);
    this.workHoursHelperText = page.getByText(DND_PAGE_TEXT.WORK_HOURS.HELPER_TEXT, { exact: false });
    this.userEditableCheckbox = page.getByRole('checkbox', { name: DND_PAGE_TEXT.USER_EDITABLE.LABEL });
    this.userEditableHelperText = page.getByText(DND_PAGE_TEXT.USER_EDITABLE.HELPER_TEXT, { exact: false });

    // Manage Preferences page - back button
    this.backButton = page.getByTestId('back-button');

    // Search, Sort, and Filters
    this.searchBox = page.getByRole('textbox', { name: MANAGE_PREFERENCES_PAGE_TEXT.SEARCH.PLACEHOLDER });
    this.clearSearchButton = page.getByRole('button', { name: MANAGE_PREFERENCES_PAGE_TEXT.SEARCH.CLEAR_BUTTON });
    this.sortByButton = page.getByRole('button', { name: /^Sort by:/ });
    this.filtersButton = page.getByRole('button', { name: MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.BUTTON_TEXT });
    this.filtersPanel = page.getByRole('region', { name: MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.PANEL_HEADER });

    // Filters panel elements
    this.filtersPanelHeader = page.getByRole('heading', { name: MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.PANEL_HEADER });
    this.resetAllLink = page.getByText(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.RESET_ALL);
    this.prioritySectionButton = page.getByRole('button', {
      name: MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.PRIORITY,
      exact: true,
    });
    this.categorySectionButton = page.getByRole('button', {
      name: MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.CATEGORY,
      exact: true,
    });
    this.categorySearchBox = page.getByRole('region', { name: 'Category' }).getByPlaceholder('Search…');
    this.categorySearchClearButton = page.getByRole('button', { name: 'Clear' });

    // Filters button states
    this.filtersButtonDefault = page.getByRole('button', { name: 'Filters', exact: true });

    // Notification table - rows with priority dropdown
    this.notificationRows = page.locator('tr').filter({ has: page.locator('select[aria-label="Priority"]') });
  }

  /**
   * Clicks on the back button to navigate back to DND page
   */
  async clickBackButton(): Promise<void> {
    await test.step('Click back button to navigate to DND page', async () => {
      await this.clickOnElement(this.backButton);
    });
  }

  /**
   * Verifies the Do Not Disturb tab is visible in the sidebar
   */
  async verifyDoNotDisturbTabIsVisible(): Promise<void> {
    await test.step('Verify Do not disturb tab is visible in sidebar', async () => {
      await this.verifier.verifyTheElementIsVisible(this.doNotDisturbTab, {
        assertionMessage: 'Do not disturb tab should be visible',
        timeout: 20_000,
      });
    });
  }

  /**
   * Returns the current checked state of the "All organization" toggle
   */
  async isAllOrganizationToggleEnabled(): Promise<boolean> {
    return await test.step('Get All organization toggle state', async () => {
      await this.allOrganizationToggle.waitFor({ state: 'visible', timeout: 10_000 });
      const ariaChecked = await this.allOrganizationToggle.getAttribute('aria-checked');
      return ariaChecked === 'true';
    });
  }

  /**
   * Sets the "All organization" toggle to the desired state
   */
  async setAllOrganizationToggle(enabled: boolean): Promise<void> {
    await test.step(`Set "All organization" toggle to ${enabled ? 'ON' : 'OFF'}`, async () => {
      await this.allOrganizationToggle.waitFor({ state: 'visible', timeout: 10_000 });
      const ariaChecked = await this.allOrganizationToggle.getAttribute('aria-checked');
      const isCurrentlyOn = ariaChecked === 'true';
      if (isCurrentlyOn !== enabled) {
        await this.clickOnElement(this.allOrganizationToggle);
      }
    });
  }

  /**
   * Verifies the "All organization" toggle is ON or OFF
   */
  async verifyAllOrganizationToggleState(expectedState: 'on' | 'off'): Promise<void> {
    await test.step(`Verify "All organization" toggle is ${expectedState.toUpperCase()}`, async () => {
      await this.allOrganizationToggle.waitFor({ state: 'visible', timeout: 10_000 });
      const ariaChecked = await this.allOrganizationToggle.getAttribute('aria-checked');
      const isOn = ariaChecked === 'true';
      const expectedOn = expectedState === 'on';
      test.expect(isOn, `"All organization" toggle should be ${expectedOn ? 'enabled' : 'disabled'}`).toBe(expectedOn);
    });
  }

  /**
   * Verifies the "Select source" section and Manual option are visible.
   */
  async verifySelectSourceSection(): Promise<void> {
    await test.step('Verify "Select source" section and Manual source option', async () => {
      await this.verifier.verifyTheElementIsVisible(this.selectSourceLabel, {
        assertionMessage: '"Select source" label should be visible',
        timeout: 5_000,
      });

      await this.verifier.verifyTheElementIsVisible(this.manualSourceOption, {
        assertionMessage: '"Manual" source option should be visible',
        timeout: 5_000,
      });

      // Optional safety check – there should be no UKG card rendered anymore
      const ukgCount = await this.ukgSourceOption.count();
      test.expect(ukgCount, '"UKG" source option should not be present in the UI anymore').toBe(0);
    });
  }

  /**
   * Selects a source option under "Select source"
   */
  async selectSourceOption(source: 'UKG' | 'Manual'): Promise<void> {
    await test.step(`Select "${source}" as source`, async () => {
      const targetButton = source === 'UKG' ? this.ukgSourceOption : this.manualSourceOption;
      await this.clickOnElement(targetButton);
    });
  }

  /**
   * Verifies the "Work days" section and all day checkboxes are visible
   */
  async verifyWorkDaysSectionAndOptions(): Promise<void> {
    await test.step('Verify "Work days" section and all day options', async () => {
      await this.verifier.verifyTheElementIsVisible(this.workDaysSectionLabel, {
        assertionMessage: '"Work days" section should be visible',
        timeout: 5_000,
      });

      for (const day of DND_PAGE_TEXT.WORK_DAYS.OPTIONS) {
        const dayCheckbox = this.page.getByRole('checkbox', { name: day });
        await this.verifier.verifyTheElementIsVisible(dayCheckbox, {
          assertionMessage: `"${day}" checkbox should be visible`,
          timeout: 5_000,
        });
      }
    });
  }

  /**
   * Selects the given work days for the "All organization" configuration.
   * Days should match entries in DND_PAGE_TEXT.WORK_DAYS.OPTIONS (e.g. "Monday").
   */
  async selectWorkDays(days: string[]): Promise<void> {
    await test.step(`Select work days: ${days.join(', ')}`, async () => {
      for (const day of days) {
        const dayCheckbox = this.page.getByRole('checkbox', { name: new RegExp(day, 'i') });
        const isChecked = await dayCheckbox.isChecked();
        if (!isChecked) {
          await dayCheckbox.check();
        }
      }
    });
  }

  /**
   * Verifies the "Work hours" section, start/end time fields and helper text
   */
  async verifyWorkHoursSection(): Promise<void> {
    await test.step('Verify "Work hours" section and fields', async () => {
      await this.verifier.verifyTheElementIsVisible(this.workHoursSectionLabel, {
        assertionMessage: '"Work hours" section should be visible',
        timeout: 5_000,
      });

      await this.verifier.verifyTheElementIsVisible(this.workHoursStartTimeField, {
        assertionMessage: '"Work hours start time" field should be visible',
        timeout: 5_000,
      });
      await this.verifier.verifyTheElementIsVisible(this.workHoursEndTimeField, {
        assertionMessage: '"Work hours end time" field should be visible',
        timeout: 5_000,
      });
      await this.verifier.verifyTheElementIsVisible(this.workHoursHelperText, {
        assertionMessage: '"Work hours" helper text should be visible',
        timeout: 5_000,
      });
    });
  }

  /**
   * Confirms disabling DND for "All Organization" in the confirmation dialog.
   * This dialog appears when turning the All organization toggle from ON to OFF.
   */
  async confirmDisableAllOrganizationDnd(): Promise<void> {
    await test.step('Confirm disabling DND for "All Organization"', async () => {
      // Locate the dialog title text first (more reliable than ARIA name),
      // then climb up to the containing dialog element.
      const title = this.page.getByText('Disable DND for "All Organization"', { exact: false });
      await this.verifier.verifyTheElementIsVisible(title, {
        assertionMessage: 'Disable DND confirmation dialog should be visible',
        timeout: 10_000,
      });

      const dialog = title.locator('xpath=ancestor::div[@role="dialog" or @role="alertdialog"][1]');
      await this.clickOnElement(dialog.getByRole('button', { name: 'Confirm' }));
    });
  }

  /**
   * Sets the work hours start and end time for "All organization".
   * Expects option values like "09:00", "19:00" used in the underlying select.
   */
  async setWorkHours(startTime: string, endTime: string): Promise<void> {
    await test.step(`Set work hours from ${startTime} to ${endTime}`, async () => {
      const startSelect = this.workHoursStartTimeField.getByTestId('SelectInput');
      const endSelect = this.workHoursEndTimeField.getByTestId('SelectInput');

      await startSelect.selectOption(startTime);
      await endSelect.selectOption(endTime);
    });
  }

  /**
   * Verifies the "User editable" checkbox and helper text
   */
  async verifyUserEditableOption(): Promise<void> {
    await test.step('Verify "User editable" checkbox and helper text', async () => {
      await this.verifier.verifyTheElementIsVisible(this.userEditableCheckbox, {
        assertionMessage: '"User editable" checkbox should be visible',
        timeout: 5_000,
      });
      await this.verifier.verifyTheElementIsVisible(this.userEditableHelperText, {
        assertionMessage: '"User editable" helper text should be visible',
        timeout: 5_000,
      });
    });
  }

  /**
   * Gets the locator for a notification row by name and category
   * This is a helper method to centralize the row locator logic
   */
  getNotificationRowLocator(notification: { name: string; category: string }): Locator {
    return this.page
      .locator('tr')
      .filter({
        has: this.page.locator('td').first().getByText(notification.name, { exact: true }),
      })
      .filter({
        has: this.page.getByRole('cell', { name: notification.category, exact: true }),
      });
  }

  /**
   * Verifies a notification row exists with the expected name, description, and category
   */
  async verifyNotificationRow(notification: { name: string; description: string; category: string }): Promise<void> {
    await test.step(`Verify notification: ${notification.name} (${notification.category})`, async () => {
      const row = this.getNotificationRowLocator(notification);

      // Verify the row is visible
      await this.verifier.verifyTheElementIsVisible(row.first(), {
        assertionMessage: `Notification row "${notification.name}" with category "${notification.category}" should be visible`,
        timeout: 10_000,
      });

      // Verify description is in the row (using partial match)
      const descriptionInRow = row.first().getByText(notification.description, { exact: false });
      await this.verifier.verifyTheElementIsVisible(descriptionInRow, {
        assertionMessage: `Description "${notification.description}" should be visible in row`,
        timeout: 5_000,
      });
    });
  }

  /**
   * Verifies multiple notification rows
   */
  async verifyAllNotificationRows(
    notifications: readonly { name: string; description: string; category: string }[]
  ): Promise<void> {
    await test.step(`Verify all ${notifications.length} notification rows`, async () => {
      for (const notification of notifications) {
        await this.verifyNotificationRow(notification);
      }
    });
  }

  /**
   * Searches in the Manage Preferences search box
   */
  async searchNotifications(searchTerm: string): Promise<void> {
    await test.step(`Search for "${searchTerm}"`, async () => {
      await this.searchBox.click();
      await this.searchBox.fill(searchTerm);
      await this.page.waitForTimeout(500); // Wait for search results
    });
  }

  /**
   * Clears the search box
   */
  async clearSearch(): Promise<void> {
    await test.step('Clear search', async () => {
      await this.clearSearchButton.click();
    });
  }

  /**
   * Verifies search results contain expected notification
   */
  async verifySearchResultContains(notificationName: string, category: string): Promise<void> {
    await test.step(`Verify search results contain "${notificationName}" with category "${category}"`, async () => {
      const row = this.page.locator('tr').filter({ hasText: notificationName });
      await this.verifier.verifyTheElementIsVisible(row.first(), {
        assertionMessage: `Notification "${notificationName}" should be visible in search results`,
        timeout: 5_000,
      });
      const categoryCell = row.first().getByRole('cell', { name: category, exact: true });
      await this.verifier.verifyTheElementIsVisible(categoryCell, {
        assertionMessage: `Category "${category}" should be visible`,
        timeout: 5_000,
      });
    });
  }

  /**
   * Clicks the Sort by dropdown button
   */
  async clickSortByDropdown(): Promise<void> {
    await test.step('Click Sort by dropdown', async () => {
      await this.sortByButton.click();
    });
  }

  /**
   * Verifies sort options are visible (uses menuitem role to avoid matching table headers)
   */
  async verifySortOptionsVisible(options: readonly string[]): Promise<void> {
    await test.step('Verify sort options are visible', async () => {
      for (const option of options) {
        const optionElement = this.page.getByRole('menuitem', { name: option });
        await this.verifier.verifyTheElementIsVisible(optionElement, {
          assertionMessage: `Sort option "${option}" should be visible`,
          timeout: 5_000,
        });
      }
    });
  }

  /**
   * Clicks the Filters button
   */
  async clickFiltersButton(): Promise<void> {
    await test.step('Click Filters button', async () => {
      await this.filtersButton.click();
    });
  }

  /**
   * Verifies Filters panel header and Reset all link are visible
   */
  async verifyFiltersPanelVisible(): Promise<void> {
    await test.step('Verify Filters panel is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.filtersPanelHeader, {
        assertionMessage: 'Filters panel header should be visible',
        timeout: 20_000,
      });
      await this.verifier.verifyTheElementIsVisible(this.resetAllLink, {
        assertionMessage: 'Reset all link should be visible',
        timeout: 20_000,
      });
    });
  }

  /**
   * Expands a filter section (Priority or Category)
   */
  async expandFilterSection(sectionName: string): Promise<void> {
    await test.step(`Expand "${sectionName}" filter section`, async () => {
      const isPrioritySection = sectionName === MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.PRIORITY;
      const sectionButton = isPrioritySection ? this.prioritySectionButton : this.categorySectionButton;

      // Avoid toggling the accordion closed if it's already expanded
      const expanded = await sectionButton.getAttribute('aria-expanded');
      if (expanded !== 'true') {
        await this.clickOnElement(sectionButton);
      }

      // Wait for at least one option in the section to become visible
      if (isPrioritySection) {
        const firstPriorityOption = this.page.getByRole('checkbox', {
          name: MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.PRIORITY_OPTIONS[0],
        });
        await firstPriorityOption.first().waitFor({ state: 'visible', timeout: 5_000 });
      } else {
        const firstCategoryOption = this.page.getByRole('checkbox', {
          name: MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.CATEGORY_OPTIONS[0],
        });
        await firstCategoryOption.first().waitFor({ state: 'visible', timeout: 5_000 });
      }
    });
  }

  /**
   * Verifies filter options are visible (uses checkbox role to target filter panel options)
   */
  async verifyFilterOptionsVisible(options: readonly string[]): Promise<void> {
    await test.step('Verify filter options are visible', async () => {
      for (const option of options) {
        // Target checkboxes in the filter panel to avoid matching dropdown options in table rows
        const optionElement = this.page.getByRole('checkbox', { name: option });
        await this.verifier.verifyTheElementIsVisible(optionElement, {
          assertionMessage: `Filter option "${option}" should be visible`,
          timeout: 5_000,
        });
      }
    });
  }

  /**
   * Verifies that each filter option in the given list displays a numeric count
   * (e.g., "Receive immediately 29", "App management 4", etc.)
   */
  async verifyFilterOptionsHaveCounts(options: readonly string[]): Promise<void> {
    await test.step('Verify filter options display numeric counts', async () => {
      for (const option of options) {
        // Start from the checkbox (by accessible name), then climb to its parent <label>
        const checkbox = this.page.getByRole('checkbox', { name: option }).first();
        await checkbox.waitFor({ state: 'attached', timeout: 10_000 });

        // The count is rendered inside the label wrapper as a separate <p> element.
        // Use an ancestor selector to get the nearest <label>.
        const optionLabel = checkbox.locator('xpath=ancestor::label[1]');
        const labelText = (await optionLabel.textContent())?.trim() ?? '';

        // Extract a number at the end or inside parentheses; accept 0 or higher
        const match = labelText.match(/(\d+)\s*$/) || labelText.match(/\((\d+)\)/);
        if (!match) {
          throw new Error(`Filter option "${option}" does not display a numeric count. Label text: "${labelText}"`);
        }
      }
    });
  }

  /**
   * Selects a filter checkbox option
   */
  async selectFilterOption(optionName: string): Promise<void> {
    await test.step(`Select filter option "${optionName}"`, async () => {
      const checkbox = this.page.getByRole('checkbox', { name: optionName });
      // Ensure the checkbox is present and visible before interacting
      await checkbox.first().waitFor({ state: 'visible', timeout: 10_000 });
      // Use click instead of check - some checkbox implementations don't work with check()
      const isChecked = await checkbox.isChecked();
      if (!isChecked) {
        await checkbox.click();
      }
      // Press Escape to close the filter panel
      await this.page.keyboard.press('Escape');
      // Wait briefly for filter to be applied
      await this.page.waitForTimeout(500);
    });
  }

  /**
   * Unselects a filter checkbox option
   */
  async unselectFilterOption(optionName: string): Promise<void> {
    await test.step(`Unselect filter option "${optionName}"`, async () => {
      const checkbox = this.page.getByRole('checkbox', { name: optionName });
      // Use click instead of uncheck - some checkbox implementations don't work with uncheck()
      const isChecked = await checkbox.isChecked();
      if (isChecked) {
        await checkbox.click();
      }
    });
  }

  /**
   * Verifies the Filters button shows active state with count
   */
  async verifyFiltersButtonActiveState(expectedCount: number): Promise<void> {
    await test.step(`Verify Filters button shows active count (${expectedCount})`, async () => {
      // Use text locator to find button containing "Filters (count)"
      const filtersButtonWithCount = this.page.locator(`button:has-text("Filters (${expectedCount})")`);
      await this.verifier.verifyTheElementIsVisible(filtersButtonWithCount, {
        assertionMessage: `Filters button should show "Filters (${expectedCount})"`,
        timeout: 5_000,
      });
    });
  }

  /**
   * Verifies all visible notification rows have the expected priority value
   */
  async verifyAllRowsHavePriority(expectedPriority: string): Promise<void> {
    await test.step(`Verify all rows have priority "${expectedPriority}"`, async () => {
      // Wait for at least one row with priority dropdown to be visible
      await this.notificationRows.first().waitFor({ state: 'visible', timeout: 10_000 });

      const rowCount = await this.notificationRows.count();

      if (rowCount === 0) {
        throw new Error('No notification rows found');
      }

      // Check each row has the expected priority selected
      for (let i = 0; i < rowCount; i++) {
        const row = this.notificationRows.nth(i);
        const prioritySelect = row.locator('select[aria-label="Priority"]');
        const selectedText = await prioritySelect.locator('option:checked').textContent();

        if (selectedText?.trim() !== expectedPriority) {
          const notificationName = await row.locator('td').first().textContent();
          throw new Error(
            `Row "${notificationName}" has priority "${selectedText}" but expected "${expectedPriority}"`
          );
        }
      }
    });
  }

  /**
   * Returns the total number of visible notification rows
   */
  async getNotificationRowCount(): Promise<number> {
    return await test.step('Get visible notification row count', async () => {
      await this.notificationRows.first().waitFor({ state: 'visible', timeout: 10_000 });
      return this.notificationRows.count();
    });
  }

  /**
   * Searches in the Category filter search box
   */
  async searchInCategoryFilter(searchTerm: string): Promise<void> {
    await test.step(`Search for "${searchTerm}" in Category filter`, async () => {
      await this.categorySearchBox.click();
      await this.categorySearchBox.fill(searchTerm);
    });
  }

  /**
   * Clears the Category filter search box
   */
  async clearCategorySearch(): Promise<void> {
    await test.step('Clear Category search box', async () => {
      await this.categorySearchClearButton.click();
    });
  }

  /**
   * Verifies the Category search box is visible
   */
  async verifyCategorySearchBoxVisible(): Promise<void> {
    await test.step('Verify Category search box is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.categorySearchBox, {
        assertionMessage: 'Category search box should be visible',
        timeout: 5_000,
      });
    });
  }

  /**
   * Verifies all visible notification rows have the expected category
   */
  async verifyAllRowsHaveCategory(expectedCategory: string): Promise<void> {
    await test.step(`Verify all rows have category "${expectedCategory}"`, async () => {
      await this.notificationRows.first().waitFor({ state: 'visible', timeout: 10_000 });

      const rowCount = await this.notificationRows.count();
      if (rowCount === 0) {
        throw new Error('No notification rows found');
      }

      for (let i = 0; i < rowCount; i++) {
        const row = this.notificationRows.nth(i);
        const categoryCell = row.locator('td').nth(1); // Category is the 2nd column
        const categoryText = await categoryCell.textContent();

        if (categoryText?.trim() !== expectedCategory) {
          const notificationName = await row.locator('td').first().textContent();
          throw new Error(
            `Row "${notificationName}" has category "${categoryText}" but expected "${expectedCategory}"`
          );
        }
      }
    });
  }

  /**
   * Verifies all visible notification rows have one of the expected categories
   */
  async verifyAllRowsHaveCategoryOneOf(expectedCategories: string[]): Promise<void> {
    await test.step(`Verify all rows have category one of: ${expectedCategories.join(', ')}`, async () => {
      await this.notificationRows.first().waitFor({ state: 'visible', timeout: 10_000 });

      const rowCount = await this.notificationRows.count();
      if (rowCount === 0) {
        throw new Error('No notification rows found');
      }

      for (let i = 0; i < rowCount; i++) {
        const row = this.notificationRows.nth(i);
        const categoryCell = row.locator('td').nth(1);
        const categoryText = await categoryCell.textContent();

        if (!expectedCategories.includes(categoryText?.trim() || '')) {
          const notificationName = await row.locator('td').first().textContent();
          throw new Error(
            `Row "${notificationName}" has category "${categoryText}" but expected one of: ${expectedCategories.join(', ')}`
          );
        }
      }
    });
  }

  /**
   * Verifies that the count shown next to a Priority filter option
   * matches the number of visible notification rows.
   *
   * Assumes the Priority filter has already been applied.
   */
  async verifyPriorityFilterCountMatchesVisibleRows(priorityLabel: string): Promise<void> {
    await test.step(`Verify Priority filter count for "${priorityLabel}" matches visible notification rows`, async () => {
      await this.notificationRows.first().waitFor({ state: 'visible', timeout: 10_000 });

      const rowCount = await this.notificationRows.count();
      if (rowCount === 0) {
        throw new Error('No notification rows found while verifying Priority filter count');
      }

      // Read the count from the label that wraps the checkbox + text
      const checkbox = this.page.getByRole('checkbox', { name: priorityLabel }).first();
      await checkbox.waitFor({ state: 'attached', timeout: 10_000 });
      const optionLabel = checkbox.locator('xpath=ancestor::label[1]');
      const labelText = (await optionLabel.textContent())?.trim() ?? '';

      const match = labelText.match(/(\d+)\s*$/) || labelText.match(/\((\d+)\)/);
      if (!match) {
        throw new Error(
          `Could not extract count from Priority filter option "${priorityLabel}". Got label: "${labelText}"`
        );
      }

      const filterCount = Number(match[1]);
      if (filterCount !== rowCount) {
        throw new Error(
          `Priority filter "${priorityLabel}" shows count ${filterCount} but ${rowCount} notification rows are visible`
        );
      }
    });
  }

  /**
   * Verifies that the count shown next to a Category filter option
   * matches the number of visible notification rows for that category.
   *
   * Assumes the Category filter section is visible.
   */
  async verifyCategoryFilterCountMatchesVisibleRows(categoryLabel: string): Promise<void> {
    await test.step(`Verify Category filter count for "${categoryLabel}" matches visible notification rows`, async () => {
      await this.notificationRows.first().waitFor({ state: 'visible', timeout: 10_000 });

      const rowCount = await this.notificationRows.count();
      if (rowCount === 0) {
        throw new Error('No notification rows found while verifying Category filter count');
      }

      // Count visible rows for the given category
      let visibleCategoryCount = 0;
      for (let i = 0; i < rowCount; i++) {
        const row = this.notificationRows.nth(i);
        const categoryCell = row.locator('td').nth(1);
        const categoryText = (await categoryCell.textContent())?.trim() ?? '';
        if (categoryText === categoryLabel) {
          visibleCategoryCount += 1;
        }
      }

      // Read the count from the label that wraps the checkbox + text
      const checkbox = this.page.getByRole('checkbox', { name: categoryLabel }).first();
      await checkbox.waitFor({ state: 'attached', timeout: 10_000 });
      const optionLabel = checkbox.locator('xpath=ancestor::label[1]');
      const labelText = (await optionLabel.textContent())?.trim() ?? '';

      const match = labelText.match(/(\d+)\s*$/) || labelText.match(/\((\d+)\)/);
      if (!match) {
        throw new Error(
          `Could not extract count from Category filter option "${categoryLabel}". Got label: "${labelText}"`
        );
      }

      const filterCount = Number(match[1]);
      if (filterCount !== visibleCategoryCount) {
        throw new Error(
          `Category filter "${categoryLabel}" shows count ${filterCount} but ${visibleCategoryCount} matching rows are visible`
        );
      }
    });
  }

  /**
   * Clicks the Reset all link in the Filters panel
   */
  async clickResetAllFilters(): Promise<void> {
    await test.step('Click Reset all link', async () => {
      await this.resetAllLink.click();
      // Wait briefly for filters to reset and close panel
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
    });
  }

  /**
   * Verifies Filters button shows default state (no count)
   */
  async verifyFiltersButtonDefaultState(): Promise<void> {
    await test.step('Verify Filters button shows default state', async () => {
      await this.verifier.verifyTheElementIsVisible(this.filtersButtonDefault, {
        assertionMessage: 'Filters button should show default state without count',
        timeout: 5_000,
      });
    });
  }

  /**
   * Verifies editable notification has all 3 priority options in the select dropdown
   */
  async verifyEditablePriorityDropdownOptions(notification: { name: string; category: string }): Promise<void> {
    await test.step(`Verify priority dropdown options for "${notification.name}"`, async () => {
      const row = this.getNotificationRowLocator(notification).first();
      const prioritySelect = row.locator('select[aria-label="Priority"]');

      // Verify the select is enabled (not disabled)
      const isDisabled = await prioritySelect.isDisabled();
      if (isDisabled) {
        throw new Error(`Priority select for "${notification.name}" should be enabled but is disabled`);
      }

      // Verify all 3 options exist in the select by checking option count
      const optionCount = await prioritySelect.locator('option').count();
      if (optionCount !== 3) {
        throw new Error(`Priority select should have 3 options but has ${optionCount}`);
      }

      // Verify each option text exists
      const options = [
        PRIORITY_DROPDOWN_OPTIONS.RECEIVE_IMMEDIATELY,
        PRIORITY_DROPDOWN_OPTIONS.RECEIVE_AFTER_DND_ENDS,
        PRIORITY_DROPDOWN_OPTIONS.RECEIVE_AS_DIGEST,
      ];

      for (const option of options) {
        const optionElement = prioritySelect.locator('option', { hasText: option });
        const count = await optionElement.count();
        if (count === 0) {
          throw new Error(`Priority option "${option}" should exist in select`);
        }
      }
    });
  }

  /**
   * Verifies system notification priority is locked (select is disabled) and shows tooltip on hover
   */
  async verifySystemNotificationPriorityLocked(notification: { name: string; category: string }): Promise<void> {
    await test.step(`Verify system notification "${notification.name}" priority is locked`, async () => {
      const row = this.getNotificationRowLocator(notification).first();
      const prioritySelect = row.locator('select[aria-label="Priority"]');

      // Verify the select shows "Receive immediately" (value="immediate")
      const selectedValue = await prioritySelect.inputValue();
      if (selectedValue !== 'immediate') {
        throw new Error(
          `System notification "${notification.name}" should have "immediate" selected but has "${selectedValue}"`
        );
      }

      // Verify the select is disabled (locked notifications cannot be changed)
      const isDisabled = await prioritySelect.isDisabled();
      if (!isDisabled) {
        throw new Error(`System notification "${notification.name}" priority select should be disabled`);
      }

      // Hover over the select wrapper to trigger tooltip
      const selectWrapper = row.locator('[class*="priorityDropdownContainer"]');
      await selectWrapper.hover();
      await this.page.waitForTimeout(500);

      // Verify tooltip is visible within the row (scoped to avoid strict mode violation)
      const tooltip = row.getByRole('tooltip', { name: 'These are critical' });
      await this.verifier.verifyTheElementIsVisible(tooltip, {
        assertionMessage: 'System notification locked tooltip should be visible',
        timeout: 5_000,
      });
    });
  }

  /**
   * Gets the current selected priority value for a given notification
   */
  async getNotificationPriorityValue(notification: { name: string; category: string }): Promise<string> {
    const row = this.getNotificationRowLocator(notification).first();
    const prioritySelect = row.locator('select[aria-label="Priority"]');
    const selectedText = await prioritySelect.locator('option:checked').textContent();
    if (!selectedText) {
      throw new Error(`Could not get priority value for notification "${notification.name}"`);
    }
    return selectedText.trim();
  }

  /**
   * Changes the priority of a given notification
   */
  async changeNotificationPriority(
    notification: { name: string; category: string },
    newPriority: string
  ): Promise<void> {
    await test.step(`Change priority of "${notification.name}" to "${newPriority}"`, async () => {
      const row = this.getNotificationRowLocator(notification).first();
      const prioritySelect = row.locator('select[aria-label="Priority"]');
      await prioritySelect.selectOption({ label: newPriority });
    });
  }

  /**
   * Verifies the priority value for a given notification
   */
  async verifyNotificationPriorityValue(
    notification: { name: string; category: string },
    expectedPriority: string
  ): Promise<void> {
    await test.step(`Verify priority of "${notification.name}" is "${expectedPriority}"`, async () => {
      const row = this.getNotificationRowLocator(notification).first();
      const prioritySelect = row.locator('select[aria-label="Priority"]');
      const selectedText = await prioritySelect.locator('option:checked').textContent();
      if (selectedText?.trim() !== expectedPriority) {
        throw new Error(
          `Notification "${notification.name}" has priority "${selectedText}" but expected "${expectedPriority}"`
        );
      }
    });
  }

  /**
   * Selects a sort option from the Sort by dropdown
   */
  async selectSortOption(optionName: string): Promise<void> {
    await test.step(`Select sort option "${optionName}"`, async () => {
      const sortOption = this.page.getByRole('menuitem', { name: optionName });
      await sortOption.click();
      await this.page.waitForTimeout(500);
    });
  }

  /**
   * Verifies notifications are sorted by Priority in correct order:
   * 1. "Receive as digest after DND ends" at top
   * 2. "Receive after DND ends" in middle
   * 3. "Receive immediately" at bottom
   */
  async verifySortedByPriorityOrder(): Promise<void> {
    await test.step('Verify notifications are sorted by Priority in correct order', async () => {
      await this.notificationRows.first().waitFor({ state: 'visible', timeout: 10_000 });

      const rowCount = await this.notificationRows.count();
      if (rowCount === 0) {
        throw new Error('No notification rows found');
      }

      // Collect all priorities in order
      const priorities: string[] = [];
      for (let i = 0; i < rowCount; i++) {
        const row = this.notificationRows.nth(i);
        const prioritySelect = row.locator('select[aria-label="Priority"]');
        const selectedText = await prioritySelect.locator('option:checked').textContent();
        priorities.push(selectedText?.trim() || '');
      }

      // Define priority order (highest priority first)
      const priorityOrder: string[] = [
        PRIORITY_DROPDOWN_OPTIONS.RECEIVE_AS_DIGEST,
        PRIORITY_DROPDOWN_OPTIONS.RECEIVE_AFTER_DND_ENDS,
        PRIORITY_DROPDOWN_OPTIONS.RECEIVE_IMMEDIATELY,
      ];

      // Verify order: no lower priority item should appear before a higher priority item
      let lastPriorityIndex = -1;
      for (let i = 0; i < priorities.length; i++) {
        const currentPriorityIndex = priorityOrder.indexOf(priorities[i]);
        if (currentPriorityIndex === -1) {
          throw new Error(`Unknown priority value "${priorities[i]}" at row ${i}`);
        }
        if (currentPriorityIndex < lastPriorityIndex) {
          throw new Error(
            `Sort order violated at row ${i}: "${priorities[i]}" appeared after "${priorityOrder[lastPriorityIndex]}"`
          );
        }
        lastPriorityIndex = currentPriorityIndex;
      }
    });
  }

  /**
   * Verifies a specific notification appears at the top of the list (first row)
   */
  async verifyNotificationIsAtTop(notification: { name: string; category: string }): Promise<void> {
    await test.step(`Verify "${notification.name}" is at the top of the list`, async () => {
      await this.notificationRows.first().waitFor({ state: 'visible', timeout: 10_000 });

      // Get the first row and check if it contains the expected notification name
      const firstRow = this.notificationRows.first();
      const firstCell = firstRow.locator('td').first();

      // Check if the cell contains the notification name (cell has name + description)
      const hasName = await firstCell.getByText(notification.name, { exact: true }).count();

      if (hasName === 0) {
        const cellContent = await firstCell.textContent();
        throw new Error(
          `Expected "${notification.name}" at top of list but found "${cellContent?.substring(0, 50)}..."`
        );
      }
    });
  }

  /**
   * Verifies the Sort by button displays a specific text
   */
  async verifySortByButtonText(expectedText: string): Promise<void> {
    await test.step(`Verify Sort by button displays "${expectedText}"`, async () => {
      const sortButton = this.page.getByRole('button', { name: expectedText });
      await this.verifier.verifyTheElementIsVisible(sortButton, {
        assertionMessage: `Sort by button should display "${expectedText}"`,
        timeout: 5_000,
      });
    });
  }

  /**
   * Verifies notifications are grouped by Category (categories appear in grouped order)
   * @param expectedCategories - Array of expected category names
   */
  async verifySortedByCategoryOrder(expectedCategories: readonly string[]): Promise<void> {
    await test.step('Verify notifications are sorted/grouped by Category', async () => {
      await this.notificationRows.first().waitFor({ state: 'visible', timeout: 10_000 });

      const rowCount = await this.notificationRows.count();
      if (rowCount === 0) {
        throw new Error('No notification rows found');
      }

      // Collect all categories in order they appear
      const categoriesInOrder: string[] = [];
      for (let i = 0; i < rowCount; i++) {
        const row = this.notificationRows.nth(i);
        const categoryCell = row.locator('td').nth(1); // Category is the 2nd column
        const categoryText = await categoryCell.textContent();
        const category = categoryText?.trim() || '';

        // Only add if it's a new category (to track order of first appearance)
        if (!categoriesInOrder.includes(category)) {
          categoriesInOrder.push(category);
        }
      }

      // Verify each expected category appears in the grouped list
      for (const expectedCategory of expectedCategories) {
        if (!categoriesInOrder.includes(expectedCategory)) {
          throw new Error(
            `Expected category "${expectedCategory}" not found. Found categories: ${categoriesInOrder.join(', ')}`
          );
        }
      }

      // Verify items are grouped (same category items appear consecutively)
      let lastCategory = '';
      const seenCategories = new Set<string>();
      for (let i = 0; i < rowCount; i++) {
        const row = this.notificationRows.nth(i);
        const categoryCell = row.locator('td').nth(1);
        const categoryText = await categoryCell.textContent();
        const category = categoryText?.trim() || '';

        if (category !== lastCategory) {
          if (seenCategories.has(category)) {
            throw new Error(
              `Category "${category}" is not grouped - found at row ${i} after already appearing earlier`
            );
          }
          seenCategories.add(category);
          lastCategory = category;
        }
      }
    });
  }
}
