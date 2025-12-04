import { expect, Locator, Page, test } from '@playwright/test';

import { AnalyticsFilterLabels } from '../../constants/analyticsFilterLabels';
import { GroupByOnUserParameter } from '../../constants/filters';
import { PeriodFilterTimeRange } from '../../constants/periodFilterTimeRange';
import { FilterOptions } from '../../helpers/baseAnalyticsQueryHelper';
import { DateHelper } from '../../helpers/dateHelper';
import { convertNumericMonthToAbbreviation } from '../../utils/dateUtils';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class AnalyticsFiltersComponent extends BaseComponent {
  /**
   * Returns the filter pill button by its visible label (Department, Location, People Category, Company name, Period)
   */
  readonly filterGroup: (label: string) => Locator;

  /**
   * Root of the filter dialog (ThoughtSpot popover)
   */
  readonly filterDialog: Locator;

  /**
   * Returns a specific option within an open filter dialog by its visible text
   */
  readonly filterOptionByText: (text: string) => Locator;

  readonly groupByOnUserParameterOption: (groupBy: string) => Locator;

  /**
   * Apply and Clear buttons within the filter dialog
   */
  readonly filterApplyButton: Locator;
  readonly filterClearAllButton: Locator;

  //data selector component
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly yearPicker: Locator;
  readonly monthPicker: Locator;
  readonly dayPicker: (day: string) => Locator;
  constructor(page: Page) {
    super(page);
    this.filterGroup = (label: string) => this.page.getByText(label, { exact: true });
    this.groupByOnUserParameterOption = (groupBy: string) =>
      this.page.locator("[class*='FilterGroupFilter-module']").getByText(groupBy, { exact: true });
    this.filterDialog = this.page.locator('[id*="tippy"]');
    this.filterOptionByText = (filterName: string) => this.filterDialog.getByText(filterName, { exact: true });
    this.filterApplyButton = this.page.getByRole('button', { name: 'Apply' }).first();
    this.filterClearAllButton = this.page.getByRole('button', { name: 'Clear' }).first();

    //PERIOD - DATE SELECTOR COMPONENT
    this.fromDateInput = this.page.getByRole('button', { name: 'Date from' });
    this.toDateInput = this.page.getByRole('button', { name: 'Date to' });
    this.yearPicker = this.page.getByLabel('Select year');
    this.monthPicker = this.page.getByLabel('Select month');
    this.dayPicker = (day: string) => this.page.getByRole('gridcell', { name: day, exact: true });
  }

  /**
   * Opens a filter dialog by label and waits for the dialog to be visible
   * @param label - The filter label to open
   */
  async openFilter(label: AnalyticsFilterLabels) {
    await test.step(`Open filter: ${label}`, async () => {
      await this.clickOnElement(this.filterGroup(label), {
        stepInfo: `Click on ${label} filter to open filter dialog`,
        timeout: 40_000,
      });
      await expect(this.filterDialog, `Filter dialog should be visible for ${label}`).toBeVisible();
    });
  }

  /**
   * Clicks Clear button if visible in the filter dialog
   */
  async clearSelectedFilterOptions() {
    await test.step('Clear all selected values if visible', async () => {
      if (await this.filterClearAllButton.isVisible()) {
        await this.clickOnElement(this.filterClearAllButton);
      }
    });
  }

  /**
   * Selects an option from the open filter dialog by visible text
   * @param optionText - The option to select
   */
  async selectFilterOptionByOptionName(optionText: string) {
    await test.step(`Select option: ${optionText}`, async () => {
      //check if the filter is already selected if yes then dont do anything and if no then select
      const filterOption = this.filterOptionByText(optionText);
      if (!(await filterOption.isChecked())) {
        await filterOption.check();
      }
    });
  }

  /**
   * Selects a Period filter option by opening the dialog and selecting the provided option.
   * @param periodFilterOption - The Period filter option to select.
   */
  async selectPeriodFilterOption(periodFilterOption: string) {
    await test.step(`Select Period filter option: ${periodFilterOption}`, async () => {
      const optionToSelect = this.page.getByRole('radio', { name: periodFilterOption });
      if (!(await optionToSelect.isChecked())) {
        await optionToSelect.check();
      }
    });
  }

  async selectGroupByOnUserParameterOption(groupBy: GroupByOnUserParameter) {
    await test.step(`Select Group By on User Parameter: ${groupBy}`, async () => {
      //if its not already
      const optionToSelect = this.page.getByRole('radio', { name: groupBy });
      if (!(await optionToSelect.isChecked())) {
        await optionToSelect.check();
      }
    });
  }

  /**
   * Applies the current selections in the filter dialog and waits for dialog to close
   */
  async clickOnApplyButton() {
    await test.step('Apply selected filter values', async () => {
      await this.clickOnElement(this.filterApplyButton);
      await expect(this.filterDialog, 'Filter dialog should be hidden after Apply').toBeHidden();
    });
  }

  /**
   * Verifies that common filters are visible on the dashboard (Department, Location, Company name, People Category, Period)
   */
  async verifyFiltersAreVisible() {
    await test.step('Verify common filters are visible', async () => {
      await expect(this.filterGroup('Department'), 'Department filter should be visible').toBeVisible();
      await expect(this.filterGroup('Location'), 'Location filter should be visible').toBeVisible();
      await expect(this.filterGroup('Company name'), 'Company name filter should be visible').toBeVisible();
      await expect(this.filterGroup('People Category'), 'People Category filter should be visible').toBeVisible();
      await expect(this.filterGroup('Period'), 'Period filter should be visible').toBeVisible();
    });
  }

  /**
   * Verifies that a filter dialog opens and core controls are present
   * @param label - Filter label to check
   */
  async verifyFilterDialogUI(label: AnalyticsFilterLabels) {
    await test.step(`Verify filter dialog UI: ${label}`, async () => {
      await this.openFilter(label);
      await expect(this.filterApplyButton, 'Apply button should be visible in filter dialog').toBeVisible();
      await expect(this.filterClearAllButton, 'Clear button should be visible in filter dialog').toBeVisible();
    });
  }

  /**
   * Verifies Period filter lists all expected values and then closes the dialog by clicking outside
   * @param label - The Period filter label (e.g., "Period")
   */
  async verifyFilterPeriodUI(label: AnalyticsFilterLabels) {
    await test.step('Verify Period filter options', async () => {
      await this.openFilter(label);
      const options = [
        'Last 7 days',
        'Last 30 days',
        'Last 90 days',
        'Last 12 months',
        'Last 36 months',
        'Year to date',
        'Custom',
      ];
      for (const option of options) {
        await expect(
          this.filterDialog.getByRole('radio', { name: option }),
          `Period option "${option}" should be visible`
        ).toBeVisible();
      }
      // Close the dialog by clicking on top of the page
      await this.page.mouse.click(5, 5);
      await expect(this.filterDialog, 'Filter dialog should be hidden after clicking outside').toBeHidden();
    });
  }

  /**
   * Opens a filter and returns all option texts currently visible in the dialog
   * @param label - Filter label
   * @returns List of option texts
   */
  async getOptionTexts(label: AnalyticsFilterLabels): Promise<string[]> {
    return await test.step(`Get option texts for filter: ${label}`, async () => {
      await this.openFilter(label);
      const items = this.filterDialog.getByRole('option');
      const texts = await items.allTextContents();
      await this.clickOnApplyButton();
      return texts.map(t => t.trim()).filter(Boolean);
    });
  }

  /**
   * Applies a Period filter by opening the dialog and selecting the provided option.
   * @param periodFilterOptions - The Period filter option to select.
   */
  async applyPeriodFilter(
    periodFilterOptions: (typeof PeriodFilterTimeRange)[keyof typeof PeriodFilterTimeRange],
    options?: {
      customStartDate: string; // ISO format (YYYY-MM-DD)
      customEndDate: string; // ISO format (YYYY-MM-DD)
    }
  ) {
    await test.step(`Apply Period filter: ${periodFilterOptions}`, async () => {
      await this.openFilter(AnalyticsFilterLabels.PERIOD);
      await this.selectPeriodFilterOption(periodFilterOptions.toString());
      if (periodFilterOptions === PeriodFilterTimeRange.CUSTOM) {
        if (!options?.customStartDate || !options.customEndDate) {
          throw new Error('Custom period filter requires both customStartDate and customEndDate in ISO format');
        }

        // Convert ISO dates to UI format
        const uiFormat = DateHelper.convertISOToUIFormat(options.customStartDate, options.customEndDate);

        await this.selectCustomPeriodFilter({
          customStartDate: uiFormat.customStartDate,
          customEndDate: uiFormat.customEndDate,
        });
      }
      await this.clickOnApplyButton();
    });
  }

  /**
   * Applies a Department filter by opening the dialog and selecting the provided option.
   * @param departmentFilterOptions - The Department filter option to select.
   */
  async applyDepartmentFilter(departmentFilterOptions: string[]) {
    await test.step(`Apply Department filter: ${departmentFilterOptions.join(', ')}`, async () => {
      await this.openFilter(AnalyticsFilterLabels.DEPARTMENT);
      for (const department of departmentFilterOptions) {
        await this.selectFilterOptionByOptionName(department);
      }
      await this.clickOnApplyButton();
    });
  }

  /**
   * Applies a Location filter by opening the dialog and selecting the provided option.
   * @param locationFilterOptions - The Location filter option to select.
   */
  async applyLocationFilter(locationFilterOptions: string[]) {
    await test.step(`Apply Location filter: ${locationFilterOptions.join(', ')}`, async () => {
      await this.openFilter(AnalyticsFilterLabels.LOCATION);
      for (const location of locationFilterOptions) {
        await this.selectFilterOptionByOptionName(location);
      }
      await this.clickOnApplyButton();
    });
  }

  /**
   * Applies a Company Name filter by opening the dialog and selecting the provided option.
   * @param companyNameFilterOptions - The Company Name filter option to select.
   */
  async applyCompanyNameFilter(companyNameFilterOptions: string[]) {
    await test.step(`Apply Company Name filter: ${companyNameFilterOptions.join(', ')}`, async () => {
      await this.openFilter(AnalyticsFilterLabels.COMPANY_NAME);
      for (const companyName of companyNameFilterOptions) {
        await this.selectFilterOptionByOptionName(companyName);
      }
      await this.clickOnApplyButton();
    });
  }

  /**
   * Applies a Segment filter by opening the dialog and selecting the provided option.
   * @param segmentFilterOptions - The Segment filter option to select.
   */
  async applySegmentFilter(segmentFilterOptions: string[]) {
    await test.step(`Apply Segment filter: ${segmentFilterOptions.join(', ')}`, async () => {
      await this.openFilter(AnalyticsFilterLabels.SEGMENT);
      for (const segment of segmentFilterOptions) {
        await this.selectFilterOptionByOptionName(segment);
      }
      await this.clickOnApplyButton();
    });
  }

  /**
   * Applies a People Category filter by opening the dialog and selecting the provided option.
   * @param peopleCategoryFilterOptions - The People Category filter option to select.
   */
  async applyPeopleCategoryFilter(peopleCategoryFilterOptions: string[]) {
    await test.step(`Apply People Category filter: ${peopleCategoryFilterOptions.join(', ')}`, async () => {
      //NEW LOCATOR for people category
      const peopleCategoryFilter = this.page.getByRole('button', {
        name: AnalyticsFilterLabels.PEOPLE_CATEGORY,
        exact: true,
      });
      await this.clickOnElement(peopleCategoryFilter, {
        stepInfo: 'Click on people category filter to open filter dialog',
        timeout: 40_000,
      });
      for (const peopleCategory of peopleCategoryFilterOptions) {
        await this.selectFilterOptionByOptionName(peopleCategory);
      }
      await this.clickOnApplyButton();
    });
  }

  /**
   * Selects a custom period filter by opening the calendar picker and selecting the provided dates
   * @param customStartDate - The start date to select
   * @param customEndDate - The end date to select
   */
  async selectCustomPeriodFilter({
    customStartDate,
    customEndDate,
  }: {
    customStartDate: {
      year: string;
      month: string;
      day: string;
    };
    customEndDate: {
      year: string;
      month: string;
      day: string;
    };
  }) {
    await test.step(`Selecting the from date ${customStartDate.year}-${customStartDate.month}-${customStartDate.day}`, async () => {
      await this.clickOnElement(this.fromDateInput, {
        stepInfo: 'Click on from date input to open calendar picker',
      });
      await this.waitUntilCalendarPickerIsVisible();

      //select month (convert numeric to abbreviation)
      await this.monthPicker.selectOption(convertNumericMonthToAbbreviation(customStartDate.month));

      //select year
      await this.yearPicker.selectOption(customStartDate.year);

      //select day
      await this.dayPicker(customStartDate.day).click();
    });

    await this.waitUntilCalendarPickerIsHidden();

    //now click on to date input to open calendar picker
    await test.step(`Selecting the to date ${customEndDate.year}-${customEndDate.month}-${customEndDate.day}`, async () => {
      await this.clickOnElement(this.toDateInput, {
        stepInfo: 'Click on to date input to open calendar picker',
      });
      await this.waitUntilCalendarPickerIsVisible();

      //select month (convert numeric to abbreviation)
      await this.monthPicker.selectOption(convertNumericMonthToAbbreviation(customEndDate.month));

      // Wait a bit for month selection to apply
      await this.page.waitForTimeout(300);

      //select year
      await this.yearPicker.selectOption(customEndDate.year);

      // Wait a bit for year selection to apply
      await this.page.waitForTimeout(300);

      //select day - use force click to ensure it's clicked
      const dayLocator = this.dayPicker(customEndDate.day);
      await dayLocator.scrollIntoViewIfNeeded();
      await dayLocator.click({ force: true });

      // Wait for the click to register
      await this.page.waitForTimeout(500);
    });

    // Wait for calendar picker to close and date to be applied
    await this.waitUntilCalendarPickerIsHidden();

    // Additional wait to ensure date is applied to the input field
    await this.page.waitForTimeout(1000);

    // Verify end date is set, retry if not
    const endDateText = await this.toDateInput.textContent();
    if (endDateText?.includes('Select date') || !endDateText || endDateText.trim() === '') {
      await this.clickOnElement(this.toDateInput, {
        stepInfo: 'Retry: Click on to date input to open calendar picker',
      });
      await this.waitUntilCalendarPickerIsVisible();

      await this.monthPicker.selectOption(convertNumericMonthToAbbreviation(customEndDate.month));
      await this.page.waitForTimeout(300);
      await this.yearPicker.selectOption(customEndDate.year);
      await this.page.waitForTimeout(300);

      const dayLocator = this.dayPicker(customEndDate.day);
      await dayLocator.scrollIntoViewIfNeeded();
      await dayLocator.click({ force: true });
      await this.page.waitForTimeout(500);

      await this.waitUntilCalendarPickerIsHidden();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Waits for the calendar picker to be visible
   */
  async waitUntilCalendarPickerIsVisible() {
    await test.step('Wait until calendar picker is visible', async () => {
      await this.yearPicker.waitFor({ state: 'visible' });
    });
  }

  /**
   * Waits for the calendar picker to be hidden
   */
  async waitUntilCalendarPickerIsHidden() {
    await test.step('Wait until calendar picker is hidden', async () => {
      await this.yearPicker.waitFor({ state: 'hidden' });
    });
  }

  /**
   * Verifies that the filter component is visible
   */
  async verifyFilterComponentIsVisible() {
    await test.step('Verify filter component is visible', async () => {
      await expect(
        this.filterGroup(AnalyticsFilterLabels.USER_PARAMETER),
        'Department filter should be visible'
      ).toBeVisible({
        timeout: 40_000,
      });
    });
  }

  async applyGroupByOnUserParameter(groupBy: GroupByOnUserParameter) {
    await test.step(`Apply Group By on User Parameter: ${groupBy}`, async () => {
      await this.openFilter(AnalyticsFilterLabels.USER_PARAMETER);
      await this.selectGroupByOnUserParameterOption(groupBy);
      await this.clickOnApplyButton();
    });
  }

  /**
   * Applies filters from a unified configuration object (same as DB FilterOptions)
   * Only applies filters that are provided (optional filters)
   * @param filterConfig - Unified filter configuration object
   */
  async applyFiltersFromConfig(filterConfig: FilterOptions) {
    await test.step('Apply filters from unified configuration', async () => {
      // Apply period filter (always required)
      if (filterConfig.timePeriod === PeriodFilterTimeRange.CUSTOM) {
        if (!filterConfig.customStartDate || !filterConfig.customEndDate) {
          throw new Error('Custom period filter requires both customStartDate and customEndDate');
        }
        await this.applyPeriodFilter(filterConfig.timePeriod, {
          customStartDate: filterConfig.customStartDate,
          customEndDate: filterConfig.customEndDate,
        });
      } else {
        await this.applyPeriodFilter(filterConfig.timePeriod);
      }
      await this.page.waitForTimeout(1000);

      // Apply optional filters only if provided
      if (filterConfig.departments && filterConfig.departments.length > 0) {
        await this.applyDepartmentFilter(filterConfig.departments);
        await this.page.waitForTimeout(1000);
      }

      if (filterConfig.locations && filterConfig.locations.length > 0) {
        await this.applyLocationFilter(filterConfig.locations);
        await this.page.waitForTimeout(1000);
      }

      if (filterConfig.segments && filterConfig.segments.length > 0) {
        await this.applySegmentFilter(filterConfig.segments);
        await this.page.waitForTimeout(1000);
      }

      if (filterConfig.userCategories && filterConfig.userCategories.length > 0) {
        await this.applyPeopleCategoryFilter(filterConfig.userCategories);
        await this.page.waitForTimeout(1000);
      }

      if (filterConfig.companyName && filterConfig.companyName.length > 0) {
        await this.applyCompanyNameFilter(filterConfig.companyName);
        await this.page.waitForTimeout(1000);
      }

      if (filterConfig.groupBy) {
        await this.applyGroupByOnUserParameter(filterConfig.groupBy);
        await this.page.waitForTimeout(1000);
      }
    });
  }
}
