import { faker } from '@faker-js/faker';
import { expect, Locator, Page, test } from '@playwright/test';
import { AwardCreationForm } from '@recognition/ui/components/common/award-creation-form';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

export class RecurringAwardPage extends BasePage {
  readonly recurringTab: Locator;
  newRecurringAwardButton: Locator;
  awardCreationForm: AwardCreationForm;
  whoCanWinThisAwardSelectInput: Locator;
  whoCanNominateThisAwardSelectInput: Locator;
  anonymousRadioButton: Locator;
  VisibleRadioButton: Locator;
  delegateGuidanceInput: Locator;
  awardFrequencyLabel: Locator;
  awardMonthlyFrequencyButton: Locator;
  awardQuarterlyFrequencyButton: Locator;
  participationWindowLabel: Locator;
  nominationsCloseLabel: Locator;
  awardOverdueLabel: Locator;
  defaultParticipationWindow: Locator;
  defaultNominationsClose: Locator;
  defaultAwardOverdue: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION) {
    super(page, pageUrl);
    this.awardCreationForm = new AwardCreationForm(page);

    this.recurringTab = page.getByRole('tab', { name: 'Recurring awards' });
    this.newRecurringAwardButton = page.getByRole('link', { name: 'New recurring award' });
    this.whoCanWinThisAwardSelectInput = page.getByTestId('field-Who can win this award').getByTestId('SelectInput');
    this.whoCanNominateThisAwardSelectInput = page.getByTestId('field-Who can nominate').getByTestId('SelectInput');
    this.anonymousRadioButton = page.getByRole('radio', { name: 'Anonymous Nominating employee' });
    this.VisibleRadioButton = page.getByRole('radio', { name: 'Visible Award delegate can' });
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
      await this.enterAwardName(awardName);
      await this.enterAwardDescription(description);
      await this.awardCreationForm.nextButton.click();
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
}
