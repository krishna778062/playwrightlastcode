import { faker } from '@faker-js/faker';
import { expect, Locator, Page, test } from '@playwright/test';
import { AwardCreationForm } from '@recognition/ui/components/common/award-creation-form';
import fs from 'fs';
import path from 'path';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

import { AWARD_CREATION_MESSAGES } from '../../../constants/messages';

export class RecurringAwardPage extends BasePage {
  readonly recurringTab: Locator;
  newRecurringAwardButton: Locator;
  readonly recurringAwardsFilter: Locator;
  awardCreationForm: AwardCreationForm;
  whoCanWinThisAwardSelectInput: Locator;
  whoCanNominateThisAwardSelectInput: Locator;
  anonymousRadioButton: Locator;
  visibleRadioButton: Locator;
  delegateGuidanceInput: Locator;
  awardFrequencyLabel: Locator;
  awardMonthlyFrequencyButton: Locator;
  awardQuarterlyFrequencyButton: Locator;
  participationWindowLabel: Locator;
  nominationsCloseLabel: Locator;
  awardOverdueLabel: Locator;
  defaultAwardOverdue: Locator;
  defaultParticipationWindow: Locator;
  defaultNominationsClose: Locator;

  // Award table elements
  readonly noRecurringAwardsMessage: Locator;
  readonly recurringAwardTable: Locator;
  readonly recurringAwardTableHeading: Locator;
  readonly recurringAwardTableRows: Locator;

  awardDelegateField: Locator;
  awardDelegateSearchInput: Locator;
  awardDelegateOption: (delegateName: string) => Locator;
  awardProcessHeading: Locator;
  awardProcessDescription: Locator;
  delegateAwardOptionLabel: Locator;
  delegateAwardOptionButton: Locator;
  nominationAwardOptionLabel: Locator;
  nominationAwardOptionButton: Locator;
  whoCanWinThisAwardLabel: Locator;
  whoCanNominateLabel: Locator;
  whoCanWinSelect: Locator;
  whoCanNominateSelect: Locator;
  awardTimeZoneDropdown: Locator;
  awardTimeZoneOption: (timezone: string) => Locator;
  startDateDropdown: Locator;
  startDateDropdownOptions: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION) {
    super(page, pageUrl);
    this.awardCreationForm = new AwardCreationForm(page);
    this.recurringTab = page.getByRole('tab', { name: 'Recurring awards' });
    this.newRecurringAwardButton = page.getByRole('link', { name: 'New recurring award' });
    this.recurringAwardsFilter = page.locator('div[class*="FilterOptions_filterContainer"] [role="tablist"] button');

    // Award table
    this.recurringAwardTable = page.locator('table[class*="Table-module__table"]');
    this.recurringAwardTableHeading = this.recurringAwardTable.locator('thead button');
    this.recurringAwardTableRows = this.recurringAwardTable.locator('tbody tr');
    this.noRecurringAwardsMessage = page.locator('div[class*="DataGrid-module__emptyWrapper"] h3');
    this.whoCanWinThisAwardSelectInput = page.getByTestId('field-Who can win this award').getByTestId('SelectInput');
    this.whoCanNominateThisAwardSelectInput = page.getByTestId('field-Who can nominate').getByTestId('SelectInput');
    this.anonymousRadioButton = page.getByRole('radio', { name: 'Anonymous Nominating employee' });
    this.visibleRadioButton = page.getByRole('radio', { name: 'Visible Award delegate can' });
    this.delegateGuidanceInput = page.getByRole('textbox', { name: 'Delegate guidance' });

    // Award Frequency
    this.awardFrequencyLabel = page.getByText('Frequency*');
    this.awardMonthlyFrequencyButton = page.locator('#frequencyMONTHLY');
    this.awardQuarterlyFrequencyButton = page.locator('#frequencyQUARTERLY');

    //Award frequency and schedule
    this.participationWindowLabel = page.getByText('Participation window*');
    this.nominationsCloseLabel = page.getByText('Nominations close*');
    this.awardOverdueLabel = page.getByText('Award overdue*');
    this.defaultParticipationWindow = page.locator('label[for="participationWindowDEFAULT"]');
    this.defaultNominationsClose = page.locator('label[for="nominationsCloseDEFAULT"]');
    this.defaultAwardOverdue = page.locator('label[for="awardOverdueDEFAULT"]');

    // Award delegate & award process elements
    this.awardDelegateField = page.getByTestId('field-Award delegate');
    this.awardDelegateSearchInput = this.awardDelegateField.locator('input.ReactSelectInput-inputField, input');
    this.awardDelegateOption = (delegateName: string) =>
      page.locator('[role="option"], [role="menuitem"], [data-testid="SelectOption"]').filter({
        hasText: delegateName,
      });
    this.awardProcessHeading = page.getByRole('heading', { level: 2, name: 'Award process' });
    this.awardProcessDescription = page.getByText('The award delegate will always have final say on the award winner');
    this.delegateAwardOptionLabel = page.locator('label[for="awardProcessDIRECT"]').first();
    this.delegateAwardOptionButton = page.locator('[for="awardProcessDIRECT"] input').first();
    this.nominationAwardOptionLabel = page.locator('label [for="awardProcessNOMINATION"]').first();
    this.nominationAwardOptionButton = page.locator('[for="awardProcessNOMINATION"] input').first();

    // Who can win/nominate fields
    this.whoCanWinThisAwardLabel = page.getByTestId('field-Who can win this award').locator('label');
    this.whoCanNominateLabel = page.getByTestId('field-Who can nominate').locator('label');
    this.whoCanWinSelect = page.locator('#whoCanWin');
    this.whoCanNominateSelect = page.locator('#whoCanNominate');

    // Timezone dropdown
    const awardTimeZoneField = page.getByTestId('field-Award timezone');
    this.awardTimeZoneDropdown = awardTimeZoneField.locator('input').first();
    this.awardTimeZoneOption = (timezone: string) =>
      awardTimeZoneField.locator('[role="menuitem"]').filter({ hasText: timezone });

    //Effective from dropdown
    this.startDateDropdown = page.locator('select#startDate').first();
    this.startDateDropdownOptions = page.locator('select#startDate option');
  }

  /**
   * Verify that the recurring award page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the recurring award page is loaded', async () => {
      await expect(this.newRecurringAwardButton, 'expecting create recurring award element to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Navigate to Recurring Award page via endpoint
   */
  async navigateRecurringAwardPageViaEndpoint(endpoint: string): Promise<void> {
    await test.step(`Navigating to ${endpoint} via endpoint`, async () => {
      await this.page.goto(endpoint);
      await this.verifyThePageIsLoaded();
    });
  }

  /**
   * Click the 'New recurring award' button after ensuring award column data is visible
   */
  async clickRecurringAwardNewButton(): Promise<void> {
    await test.step('Clicking New recurring award button', async () => {
      await expect(this.newRecurringAwardButton, 'expecting new recurring award button to be visible').toBeVisible();
      await this.newRecurringAwardButton.click();
    });
  }

  /**
   * Enter award name in the award name input field
   * @param awardName - The name of the award to enter
   */
  async enterAwardName(awardName: string): Promise<void> {
    await test.step(`Entering award name: ${awardName}`, async () => {
      await expect(this.awardCreationForm.awardNameInput, 'expecting award name input to be visible').toBeVisible();
      await this.awardCreationForm.awardNameInput.fill(awardName);
    });
  }

  /**
   * Enter award description in the award description input field
   * @param description - The description of the award to enter
   */
  async enterAwardDescription(description: string): Promise<void> {
    await test.step(`Entering award description: ${description}`, async () => {
      await expect(
        this.awardCreationForm.awardDescriptionInput,
        'expecting award description input to be visible'
      ).toBeVisible();
      await this.awardCreationForm.awardDescriptionInput.fill(description);
    });
  }

  /**
   * Verify that the default award badge is displayed
   */
  async verifyDefaultAwardBadge(): Promise<void> {
    await test.step('Verifying default award badge is displayed', async () => {
      await expect(
        this.awardCreationForm.defaultAwardBadge,
        'expecting default award badge to be visible'
      ).toBeVisible();
    });
  }

  /**
   * Fill the first page of recurring award creation form
   * @param badgeTab - Whether to select badge tab (reserved for future use)
   * @param awardDescription - Optional award description (defaults to generated description)
   * @returns The generated award name
   */
  async fillRecurringAwardFormPageOne(awardDescription?: string): Promise<string> {
    const awardName = `Sales superstar ${faker.string.alphanumeric(8)}`;
    const description =
      awardDescription || 'This is an automated test award for recognizing outstanding sales performance';
    await test.step(`Filling recurring award page one form with award name: ${awardName}`, async () => {
      await this.awardCreationForm.skeletonButton.waitFor({ state: 'detached' });
      await this.enterAwardName(awardName);
      await this.enterAwardDescription(description);
      await expect(this.awardCreationForm.nextButton).toBeEnabled();
      await this.awardCreationForm.nextButton.click();
      await expect(this.awardCreationForm.nextButton).toBeVisible();
      await expect(
        this.awardDelegateField,
        'expecting award delegate field on page two to be visible before proceeding'
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
    return awardName;
  }

  /**
   * Select award frequency (Monthly or Quarterly)
   * @param frequencyType - The type of frequency to select ('Monthly' or 'Quarterly')
   */
  async selectAwardFrequency(frequencyType: string): Promise<void> {
    await test.step(`Selecting award frequency: ${frequencyType}`, async () => {
      await expect(this.awardFrequencyLabel, 'expecting award frequency label to be visible').toBeVisible();
      if (frequencyType === 'Monthly') {
        const isChecked = await this.awardMonthlyFrequencyButton.isChecked();
        if (!isChecked) {
          await this.awardMonthlyFrequencyButton.click();
        }
      } else if (frequencyType === 'Quarterly') {
        const isChecked = await this.awardQuarterlyFrequencyButton.isChecked();
        if (!isChecked) {
          await this.awardQuarterlyFrequencyButton.click();
        }
      } else {
        throw new Error(`Invalid frequency type: ${frequencyType}. Expected 'Monthly' or 'Quarterly'.`);
      }
    });
  }

  /**
   * Select the effective from dropdown by index.
   * @param frequencyType - The type of frequency ('Monthly' or 'Quarterly').
   * @param optionIndex - The index of the option to select.
   */
  async selectEffectiveFromDropdownByIndex(
    frequencyType: 'Monthly' | 'Quarterly',
    optionIndex?: number | null
  ): Promise<void> {
    // Skip disabled placeholder (index 0)
    const baseIndex = 1;
    const index =
      optionIndex !== null && optionIndex !== undefined
        ? optionIndex + baseIndex
        : frequencyType === 'Monthly'
          ? baseIndex
          : baseIndex + 2; // Quarterly example

    await test.step(`Selecting effective from dropdown by index: ${index}`, async () => {
      await this.startDateDropdown.waitFor({ state: 'visible' });
      await this.startDateDropdown.selectOption({ index });
    });
  }

  /**
   * Verify default schedule options based on selected award frequency
   * @param frequencyType - The type of frequency ('Monthly' or 'Quarterly')
   */
  async verifyDefaultScheduleOptionsByFrequency(frequencyType: string): Promise<void> {
    await test.step(`Verifying default schedule options for ${frequencyType} frequency`, async () => {
      let periodLabel = '';
      if (frequencyType === 'Monthly') {
        periodLabel = 'month';
      } else if (frequencyType === 'Quarterly') {
        periodLabel = 'quarter';
      } else {
        throw new Error(`Invalid frequency type: ${frequencyType}. Expected 'Monthly' or 'Quarterly'.`);
      }
      // Verify default participation window
      await expect(this.participationWindowLabel, 'expecting participation window label to be visible').toBeVisible();
      await expect(
        this.defaultParticipationWindow.locator('div'),
        'expecting default participation window text'
      ).toHaveText(`Whole ${periodLabel}`);
      // Verify default nominations close date
      await expect(this.nominationsCloseLabel, 'expecting nominations close label to be visible').toBeVisible();
      await expect(this.defaultNominationsClose.locator('div'), 'expecting default nominations close text').toHaveText(
        `On the last day of the ${periodLabel}`
      );
      // Verify default award overdue date
      await expect(this.awardOverdueLabel, 'expecting award overdue label to be visible').toBeVisible();
      await expect(this.defaultAwardOverdue.locator('div'), 'expecting default award overdue text').toHaveText(
        `On the last day of the ${periodLabel}`
      );
    });
  }

  async verifyPreSelectedValueForEffectiveFromDropdown(frequencyType: 'Monthly' | 'Quarterly'): Promise<void> {
    await test.step(`Verifying preselected value for "Effective from" dropdown when frequency is ${frequencyType}`, async () => {
      const today = new Date();
      const currentMonth = today.getMonth(); // 0-11
      const currentYear = today.getFullYear();
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      if (frequencyType === 'Monthly') {
        const selectedMonthOption = await this.page.locator('select#startDate option:checked').textContent();
        const expectedMonthLabel = `${monthNames[currentMonth]} ${currentYear}`;
        console.log('selectedMonthOption1', selectedMonthOption);
        console.log('expectedMonthLabel', expectedMonthLabel);
        expect(selectedMonthOption?.trim()).toBe(expectedMonthLabel);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (frequencyType === 'Quarterly') {
        // Calculate current quarter
        const currentQuarter = Math.floor(currentMonth / 3) + 1; // 1-4
        const quarterStartMonthIndex = (currentQuarter - 1) * 3;
        const quarterEndMonthIndex = quarterStartMonthIndex + 2;
        const selectedQuarterOption = this.page.locator('select#startDate option:checked');
        const selectedQuarterText = await selectedQuarterOption.textContent();
        const expectedQuarterLabel = `${currentYear} Q${currentQuarter} | ${monthNames[quarterStartMonthIndex]} - ${monthNames[quarterEndMonthIndex]} ${currentYear}`;
        expect(selectedQuarterText?.trim()).toBe(expectedQuarterLabel);
      } else {
        throw new Error(`Invalid frequency type: ${frequencyType}. Expected 'Monthly' or 'Quarterly'.`);
      }
    });
  }

  /**
   * Verify that past months or quarters are not displayed or selectable in the "First Award month" dropdown
   * @param frequencyType - The type of frequency ('Monthly' or 'Quarterly')
   */
  async verifyNoPastMonthsInEffectiveFromDropdown(frequencyType: 'Monthly' | 'Quarterly'): Promise<void> {
    await test.step(`Verifying that past ${frequencyType === 'Monthly' ? 'months' : 'quarters'} are not displayed or selectable`, async () => {
      const today = new Date();
      const currentMonth = today.getMonth(); // 0-11
      const currentYear = today.getFullYear();
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      await expect(this.startDateDropdown, 'expecting start date dropdown to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      const allOptions = await this.startDateDropdown.locator('option').allTextContents();
      const availableOptions = allOptions.filter(option => option.trim() !== '');
      if (frequencyType === 'Monthly') {
        // Parse monthly options: "January 2024", "February 2024", etc.
        for (const optionText of availableOptions) {
          const trimmedOption = optionText.trim();
          if (!trimmedOption) continue;
          // Parse the month and year from the option text
          const monthYearMatch = trimmedOption.match(/^(\w+)\s+(\d+)$/);
          if (!monthYearMatch) {
            continue; // Skip if format doesn't match
          }
          const monthName = monthYearMatch[1];
          const year = parseInt(monthYearMatch[2], 10);
          const monthIndex = monthNames.indexOf(monthName);
          if (monthIndex === -1) {
            continue; // Skip if month name not found
          }
          // Check if this option represents a past month
          if (year < currentYear || (year === currentYear && monthIndex < currentMonth)) {
            throw new Error(
              `Past month found in dropdown: "${trimmedOption}". Only current and future months should be available.`
            );
          }
        }
      } else {
        // frequencyType must be 'Quarterly' at this point
        // Parse quarterly options: "2024 Q1 | January - March 2024", etc.
        for (const optionText of availableOptions) {
          const trimmedOption = optionText.trim();
          if (!trimmedOption) continue;
          // Parse the quarter from the option text: "2024 Q1 | ..."
          const quarterMatch = trimmedOption.match(/^(\d+)\s+Q(\d+)/);
          if (!quarterMatch) {
            continue; // Skip if format doesn't match
          }
          const year = parseInt(quarterMatch[1], 10);
          const quarter = parseInt(quarterMatch[2], 10);
          const currentQuarter = Math.floor(currentMonth / 3) + 1; // 1-4
          // Check if this option represents a past quarter
          if (year < currentYear || (year === currentYear && quarter < currentQuarter)) {
            throw new Error(
              `Past quarter found in dropdown: "${trimmedOption}". Only current and future quarters should be available.`
            );
          }
        }
      }
    });
  }

  async validateTheFilters(): Promise<void> {
    await this.verifier.verifyElementHasAttribute(this.recurringTab, 'aria-selected', 'true');
    const filterNames = ['All', 'Active', 'Inactive', 'Draft', 'Scheduled'];
    for (let i = 0; i < filterNames.length; i++) {
      await this.verifier.verifyTheElementIsVisible(this.recurringAwardsFilter.nth(i));
      await this.verifier.verifyElementHasText(this.recurringAwardsFilter.nth(i), filterNames[i]);
    }
  }

  async validateNewRecurringAwardCreationButton(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.newRecurringAwardButton);
    await this.verifier.verifyTheElementIsEnabled(this.newRecurringAwardButton);
  }

  async validateTheRecurringAwardTable(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.recurringAwardTable);
    const tableHeadings = [
      'Award',
      'Award delegate',
      'Frequency',
      'Award process',
      'Status',
      'Last instance',
      'Created',
    ];
    for (let i = 0; i < tableHeadings.length - 1; i++) {
      await this.verifier.verifyElementHasText(this.recurringAwardTableHeading.nth(i), tableHeadings[i]);
    }
    const rowCount = await this.recurringAwardTableRows.count();
    for (let i = 0; i < (rowCount < 3 ? rowCount : 3); i++) {
      const row = this.recurringAwardTableRows.nth(i);
      for (let j = 0; j < tableHeadings.length; j++) {
        const cellHandle = await row.locator('td').nth(j).elementHandle();
        if (!cellHandle) continue;
        await this.page.evaluate(el => {
          if (el instanceof HTMLElement) {
            el.style.outline = '3px solid red';
            el.style.transition = 'outline 0.3s ease-in-out';
          }
        }, cellHandle);
        await this.verifier.verifyTheElementIsVisible(row.locator('td').nth(j));
        await this.page.evaluate(el => {
          if (el instanceof HTMLElement) {
            el.style.outline = '';
          }
        }, cellHandle);
      }
    }
  }

  async mockTheRecurringAwardListApidCall(): Promise<void> {
    await this.page.route('**/recognition/admin/award/recurring/listing*', route => void route.abort());
    await this.page.reload();
    await this.verifyThePageIsLoaded();
  }

  async validateNoRecurringAwardsMessage(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.newRecurringAwardButton);
    await this.verifier.verifyTheElementIsEnabled(this.noRecurringAwardsMessage);
    return;
  }

  async unrouteTheRecurringAwardListApidCall(): Promise<void> {
    await this.page.unroute('**/recognition/admin/award/recurring/listing*');
    await this.page.reload();
    await this.verifyThePageIsLoaded();
  }

  async clickOnFilterButtonAndValidateRows(filter: string, rowCount: number): Promise<void> {
    await this.mockTheRecurringAwardsInUI(filter.toUpperCase());
    await this.verifyThePageIsLoaded();
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exactRegex = new RegExp(`^${escapeRegExp(filter)}$`);
    const filterButton = this.recurringAwardsFilter.filter({ hasText: exactRegex });
    await this.verifier.verifyTheElementIsVisible(filterButton);
    await this.verifier.waitUntilElementIsVisible(this.recurringAwardTableRows.last());
    await filterButton.click();
    await this.verifier.waitUntilElementIsVisible(this.recurringAwardTableRows.last());
    const actualRowCount = await this.recurringAwardTableRows.count();
    expect(actualRowCount).toBe(rowCount);
  }

  async mockTheRecurringAwardsInUI(filter: string): Promise<void> {
    console.log(`**/recognition/admin/award/recurring/listing?**&status=${filter}`);
    await this.page.route(
      `**/recognition/admin/award/recurring/listing?size=10&sortBy=awardName&order=asc&status=${filter}`,
      async route => {
        const fixture = await fs.promises.readFile(
          path.join(__dirname, '..', '..', '..', 'test-data', 'recurring-awards.json'),
          'utf8'
        );
        const data = JSON.parse(fixture);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(data),
        });
      }
    );
    await this.page.reload();
  }

  /**
   * Fill the second page of recurring award creation form
   * @param delegateUserName - The name of the delegate to select
   * @param awardType - The type of award to select
   * @param frequencyType - The type of frequency to select
   * @param timezone - The timezone to select
   */
  async fillRecurringAwardFormPageTwo(
    delegateUserName: string,
    awardType: string,
    frequencyType: string,
    timezone: string,
    effectiveFromOption?: string | number | null
  ) {
    await test.step('Completing recurring award form page two', async () => {
      await this.selectSingleAwardDelegate(delegateUserName);
      await this.whoCanWinOrNominate('Win', 'All employees', 1);
      await this.recurringAwardType(awardType);
      await this.whoCanWinOrNominate('Nominate', 'All employees', 2);
      await this.selectAwardFrequency(frequencyType);

      if (effectiveFromOption !== undefined) {
        const parsedIndex =
          typeof effectiveFromOption === 'number'
            ? effectiveFromOption
            : /^\d+$/.test(String(effectiveFromOption))
              ? Number.parseInt(String(effectiveFromOption), 10)
              : undefined;
        if (parsedIndex !== undefined) {
          // Ensure frequencyType is correctly typed for selectEffectiveFromDropdownByIndex
          if (frequencyType === 'Monthly' || frequencyType === 'Quarterly') {
            await this.selectEffectiveFromDropdownByIndex(frequencyType, parsedIndex);
          } else {
            throw new Error(`Invalid frequencyType value: ${frequencyType}`);
          }
        }
      }
      await this.selectAwardTimeZoneRecurringAward(timezone);
    });
  }

  /**
   * Confirm and create recurring award
   */
  async confirmAndCreateRecurringAward(): Promise<void> {
    await test.step('Confirming and creating recurring award', async () => {
      await expect(this.awardCreationForm.nextButton).toBeEnabled();
      await this.awardCreationForm.nextButton.click();
      await expect(this.awardCreationForm.createButton).toBeVisible();
      await expect(this.awardCreationForm.createButton).toBeEnabled();
      await this.awardCreationForm.createButton.click();
    });
  }

  /**
   * Select a single award delegate
   * @param delegateName - The name of the delegate to select
   */
  async selectSingleAwardDelegate(delegateName: string): Promise<void> {
    await test.step(`Selecting award delegate: ${delegateName}`, async () => {
      await expect(this.awardDelegateField, 'expecting award delegate field container to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      const delegateInput = await this.getInteractiveInput(this.awardDelegateField, this.awardDelegateSearchInput);
      await expect(delegateInput, 'expecting award delegate input to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await delegateInput.click();
      await this.clearAndType(delegateInput, delegateName);
      const option = this.awardDelegateOption(delegateName).first();
      await expect(option, `expecting delegate option ${delegateName} to appear`).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await option.click();
    });
  }

  /**
   * Select who can win or nominate
   * @param action - The action to perform ('Win' or 'Nominate')
   * @param option - The option to select
   * @param index - The index to select
   */
  async whoCanWinOrNominate(action: 'Win' | 'Nominate', option: string, index: number = 1): Promise<void> {
    await test.step(`Selecting "${option}" for "Who can ${action.toLowerCase()}"`, async () => {
      const labelLocator = action === 'Win' ? this.whoCanWinThisAwardLabel : this.whoCanNominateLabel;
      const expectedLabelText = action === 'Win' ? 'Who can win this award*' : 'Who can nominate*';
      await expect(labelLocator, `expecting ${expectedLabelText} label to be visible`).toContainText(
        expectedLabelText,
        {
          timeout: TIMEOUTS.MEDIUM,
        }
      );
      const selectLocator = this.getWhoCanSelectLocator(action);
      await this.selectOptionFromLocator(selectLocator, option);
      switch (option) {
        case 'Department members':
          await this.selectWhoCanSubElements('department', 'Engineering', index);
          break;
        case 'Employees from a location':
          await this.selectWhoCanSubElements('location', 'San Francisco', index);
          break;
        case 'Employees from an audience':
          await this.selectWhoCanSubElements('audience', 'US team', index);
          break;
        case "Award delegate's direct reports":
        case "Award delegate's full ladder reports":
        case 'All employees':
        default:
          break;
      }
    });
  }

  /**
   * Select the recurring award type
   * @param option - The option to select
   */
  async recurringAwardType(option: string): Promise<void> {
    await test.step(`Selecting recurring award type: ${option}`, async () => {
      await expect(this.awardProcessHeading, 'expecting award process heading').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(this.awardProcessDescription, 'expecting award process description').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });

      switch (option) {
        case 'Delegate':
          await this.delegateAwardOptionButton.click({ force: true });
          break;
        case 'Nominations':
          await this.nominationAwardOptionButton.click({ force: true });
          break;
        default:
          throw new Error(`Unsupported award type option: ${option}`);
      }
    });
  }

  /**
   * Select the award time zone
   * @param timezone - The timezone to select
   */
  async selectAwardTimeZoneRecurringAward(timezone: string): Promise<void> {
    await test.step(`Selecting award time zone: ${timezone}`, async () => {
      await expect(this.awardTimeZoneDropdown, 'expecting award time zone dropdown to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.awardTimeZoneDropdown.click();
      const option = this.awardTimeZoneOption(timezone).first();
      await expect(option, `expecting ${timezone} option`).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await option.click();
    });
  }

  /**
   * Submit recurring award
   * checks for Continue button and click it if present
   */
  async submitRecurringAward(): Promise<void> {
    await test.step('Asserting recurring award submission is successful', async () => {
      const continueButton = this.awardCreationForm.continueButton;
      await test.step('Clicking Continue button if present', async () => {
        if (await continueButton.isVisible({ timeout: 3000 })) {
          await expect(this.awardCreationForm.continueButton, 'expecting continue button to be visible').toBeVisible({
            timeout: TIMEOUTS.MEDIUM,
          });
          await continueButton.click();
        }
      });
    });
  }

  private getWhoCanSelectLocator(action: 'Win' | 'Nominate'): Locator {
    if (action === 'Win') {
      return this.whoCanWinSelect;
    }
    return this.whoCanNominateSelect;
  }

  private getDropdownOption(optionText: string): Locator {
    return this.page
      .locator('[role="option"], [role="menuitem"], [data-testid="SelectOption"]')
      .filter({ hasText: optionText })
      .first();
  }

  private async selectOptionFromLocator(locator: Locator, option: string): Promise<void> {
    try {
      await locator.selectOption({ label: option });
      return;
    } catch {
      // ignore as the locator might not be a native select element
    }
    const reactSelectInput = locator.locator('input.ReactSelectInput-inputField').first();
    if ((await reactSelectInput.count()) > 0) {
      await this.typeAndChooseReactSelectOption(reactSelectInput, option);
      return;
    }
    try {
      await locator.click();
    } catch {
      // Fallback to clicking the parent container if the locator itself isn't clickable
      const parent = locator.locator('..');
      await parent.click();
    }
    const optionLocator = this.getDropdownOption(option);
    await expect(optionLocator, `expecting option ${option}`).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    await optionLocator.click();
  }

  private async selectWhoCanSubElements(
    type: 'department' | 'location' | 'audience',
    option: string,
    index: number = 1
  ): Promise<void> {
    await test.step(`Selecting ${option} for ${type} (index ${index})`, async () => {
      const locator = await this.findSubElementLocator(type, index);
      if (!locator) {
        throw new Error(`Unable to locate ${type} selector for index ${index}`);
      }
      await this.selectOptionFromLocator(locator, option);
    });
  }

  private async findSubElementLocator(
    type: 'department' | 'location' | 'audience',
    index: number
  ): Promise<Locator | null> {
    const normalizedIndex = Math.max(index, 1) - 1;
    const candidates = [
      `[data-testid="${type}-select"]`,
      `[data-testid="${type}Select"]`,
      `[data-testid="field-${this.capitalize(type)}"]`,
      `#${type}${index}`,
      `#${type}`,
      `[name*="${type}"]`,
      `[id*="${type}"]`,
    ];

    for (const selector of candidates) {
      const candidateLocator = this.page.locator(selector);
      const count = await candidateLocator.count();
      if (count === 0) {
        continue;
      }
      const targetLocator = count > normalizedIndex ? candidateLocator.nth(normalizedIndex) : candidateLocator.first();
      const selectChild = targetLocator.locator('select').first();
      if ((await selectChild.count()) > 0) {
        return selectChild;
      }
      const inputChild = targetLocator.locator('input.ReactSelectInput-inputField').first();
      if ((await inputChild.count()) > 0) {
        return inputChild;
      }
      if ((await targetLocator.evaluateAll(elements => elements.length > 0).catch(() => false)) === true) {
        return targetLocator;
      }
    }

    const labelLocator = this.page
      .locator('label')
      .filter({ hasText: new RegExp(type, 'i') })
      .nth(normalizedIndex);
    if ((await labelLocator.count()) > 0) {
      const forAttribute = await labelLocator.getAttribute('for');
      if (forAttribute) {
        const associated = this.page.locator(`#${forAttribute}`);
        if ((await associated.count()) > 0) {
          return associated.first();
        }
      }
    }
    const fallbackReactInput = this.page.locator('input.ReactSelectInput-inputField').nth(normalizedIndex);
    if ((await fallbackReactInput.count()) > 0) {
      return fallbackReactInput;
    }
    return null;
  }

  /**
   * Type and choose the react select option
   * @param input - The input locator
   * @param option - The option to choose
   */
  private async typeAndChooseReactSelectOption(input: Locator, option: string): Promise<void> {
    await input.click();
    try {
      await input.press('Meta+A');
    } catch {
      await input.press('Control+A').catch(() => undefined);
    }
    await input.press('Backspace');
    await this.page.keyboard.type(option, { delay: 75 });
    const optionLocator = this.getDropdownOption(option);
    await expect(optionLocator, `expecting option ${option}`).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    await optionLocator.click();
  }
  /**
   * Get the interactive input locator
   * @param container - The container locator
   * @param fallback - The fallback locator
   * @returns The interactive input locator
   */
  private async getInteractiveInput(container: Locator, fallback: Locator): Promise<Locator> {
    const reactInput = container.locator('input.ReactSelectInput-inputField').first();
    if ((await reactInput.count()) > 0) {
      return reactInput;
    }
    if ((await fallback.count()) > 0) {
      return fallback.first();
    }
    const genericInput = container.locator('input').first();
    if ((await genericInput.count()) > 0) {
      return genericInput;
    }
    return container;
  }

  /**
   * Clear and type in the input field
   * @param input - The input locator
   * @param value - The value to type
   */
  private async clearAndType(input: Locator, value: string): Promise<void> {
    await input.click();
    try {
      await input.press('Meta+A');
    } catch {
      await input.press('Control+A').catch(() => undefined);
    }
    await input.press('Backspace').catch(() => undefined);
    await this.page.keyboard.type(value, { delay: 75 });
  }

  /**
   * Capitalize the text
   * @param text - The text to capitalize
   * @returns The capitalized text
   */
  private capitalize(text: string): string {
    if (!text) {
      return text;
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Select the overdue option for the custom recurring award.
   * @param overdueFilter - The overdue filter.
   */
  async selectOverdueOption(overdueFilter: 'Default' | 'None' | 'Custom'): Promise<void> {
    await test.step(`Selecting overdue filter for a recurring award`, async () => {
      await expect(this.awardOverdueLabel, 'expecting award overdue label to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      for (const helperText of [
        AWARD_CREATION_MESSAGES.DELEGATE_SELECTION_BY,
        AWARD_CREATION_MESSAGES.AWARD_ISSUED_ON_FIRST_DAY,
      ]) {
        try {
          await this.awardCreationForm.verifyHelperTextOnPage(helperText);
        } catch (error) {
          console.warn(`Helper text not visible (continuing): ${helperText}`, error);
        }
      }

      if (overdueFilter === 'Default') {
        await this.awardCreationForm.checkRadioButton('Award overdue', 'On the last day of the month');
      } else if (overdueFilter === 'None') {
        await this.awardCreationForm.checkRadioButton('Award overdue', 'No overdue date');
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (overdueFilter === 'Custom') {
        await this.awardCreationForm.checkRadioButton('Award overdue', 'Custom');
        await this.verifier.verifyTheElementIsVisible(this.page.getByText('Day(s)').last(), {
          timeout: TIMEOUTS.MEDIUM,
          assertionMessage: `Day(s) text should be visible on page`,
        });
      } else {
        throw new Error(`Unsupported overdue filter: ${overdueFilter}`);
      }
    });
  }

  /**
   * Set the custom range for the custom recurring award.
   * @param fieldTestId - The field test id.
   * @param plusClicks - The number of plus clicks.
   * @param minusClicks - The number of minus clicks.
   * @param expectPlusDisabled - The expected plus disabled.
   * @param expectMinusDisabled - The expected minus disabled.
   * @param expectedValue - The expected value.
   */
  async setCustomRangeForCustomRecurringAward({
    fieldTestId,
    plusClicks = 0,
    minusClicks = 0,
    expectPlusDisabled = false,
    expectMinusDisabled = false,
    expectedValue,
  }: {
    fieldTestId: string;
    plusClicks?: number;
    minusClicks?: number;
    unit?: string;
    expectedValue?: number;
    expectPlusDisabled?: boolean;
    expectMinusDisabled?: boolean;
  }) {
    const field = this.page.getByTestId(`field-${fieldTestId}`);
    const customRadio = field.getByRole('radio', { name: 'Custom' });
    if (!(await customRadio.isChecked())) {
      await customRadio.check();
    }
    const clickIfEnabled = async (button: Locator, times: number) => {
      for (let i = 0; i < times; i++) {
        if (!(await button.isEnabled())) break;
        await button.click();
      }
    };

    const plusButton = this.awardCreationForm.plusButton;
    // verify and click Plus (only if provided)
    if (plusClicks > 0) {
      (await this.verifier.verifyTheElementIsVisible(plusButton),
        { timeout: TIMEOUTS.MEDIUM, assertionMessage: `Day(s) text should be visible on page` });
      await clickIfEnabled(plusButton, plusClicks);
    }
    // verify and click Minus (only if provided)
    if (minusClicks > 0) {
      const minusButton = this.awardCreationForm.minusButton;
      (await this.verifier.verifyTheElementIsVisible(minusButton),
        { timeout: TIMEOUTS.MEDIUM, assertionMessage: `Day(s) text should be visible on page` });
      await clickIfEnabled(minusButton, minusClicks);
      if (expectMinusDisabled) {
        await expect(minusButton).toBeDisabled();
      }
    }
    if (expectPlusDisabled) {
      await expect(plusButton).toBeDisabled();
    }
    if (expectedValue !== undefined) {
      const rangeValueInput = this.awardCreationForm.rangeValueInput;
      await expect(rangeValueInput).toHaveValue(expectedValue.toString());
    }
  }

  /**
   * Validate the min/max constraints for the custom range.
   * Covers manual checks:
   * - Try setting 0 (should stay at 1 and minus disabled)
   * - Try setting 1 (minimum allowed)
   * - Try setting 27 (maximum allowed)
   * - Try setting 28 (should stay at 27 and plus disabled)
   */
  async validateCustomRangeBounds(fieldTestId: string): Promise<void> {
    await test.step(`Validating custom range bounds for ${fieldTestId}`, async () => {
      const plusButton = this.awardCreationForm.plusButton;
      const minusButton = this.awardCreationForm.minusButton;
      const rangeValueInput = this.awardCreationForm.rangeValueInput;
      const readValue = async (): Promise<number> => {
        const valueText = await rangeValueInput.inputValue();
        return Number.parseInt(valueText, 10);
      };

      // Drive down to the minimum and assert lower bound (0/1 checks)
      for (let i = 0; i < 5; i++) {
        const current = await readValue();
        if (current <= 1) break;
        await minusButton.click();
      }
      await expect(rangeValueInput).toHaveValue('1');
      await expect(minusButton).toBeDisabled();

      // Increment up to the max and assert upper bound (27/28 checks)
      for (let i = 0; i < 30; i++) {
        const current = await readValue();
        if (current >= 27) break;
        await plusButton.click();
      }
      await expect(rangeValueInput).toHaveValue('27');
      await expect(plusButton).toBeDisabled();
    });
  }
}
