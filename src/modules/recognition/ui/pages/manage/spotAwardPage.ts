import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';
import { getFormattedDate } from '@core/utils/dateUtil';

import MESSAGES from '../../../constants/messages';
import { SubTabIndicator } from '../../components/common/sub-tab-indicator';
import { GiveRecognitionDialogBox } from '../../components/recognition/give-recognition-dialog-box';
import { RecognitionHubPage } from '../recognitionHubPage';

import { ManageRecognitionPage } from './manageRecognitionPage';

export class SpotAwardPage extends BasePage {
  readonly subTabIndicator: SubTabIndicator;
  // Create/Edit form locators
  readonly container: Locator;
  readonly header: Locator;
  readonly awardNameField: Locator;
  readonly awardDescriptionField: Locator;
  readonly cancelButton: Locator;
  readonly saveDraftButton: Locator;
  readonly nextButton: Locator;
  readonly createAndScheduleButton: Locator;
  readonly saveChangesButton: Locator;
  readonly submitButton: Locator;
  readonly companyValuesField: Locator;
  readonly whoCanGiveAwardOption: Locator;
  readonly whoCanReceiveAwardOption: Locator;
  readonly extraField: Locator;
  readonly dateFrom: Locator;
  readonly dateTo: Locator;
  readonly awardGuidance: Locator;
  readonly timesInput: Locator;
  readonly timesPlus: Locator;
  readonly timesMinus: Locator;
  readonly frequencyOption: Locator;
  readonly createButton: Locator;
  readonly selectOptions: Locator;
  readonly selectNextMonthButton: Locator;

  constructor(page: Page) {
    super(page);
    this.subTabIndicator = new SubTabIndicator(page);
    // Initialize create/edit form locators
    this.container = page.locator('[data-testid*="pageContainer"]');
    this.header = this.container.getByRole('heading').first();
    this.awardNameField = this.container.getByRole('textbox', { name: 'Award name*' });
    this.awardDescriptionField = this.container.getByRole('textbox', { name: 'Award description*' });
    this.cancelButton = this.container.getByRole('button', { name: 'Cancel' });
    this.saveDraftButton = this.container.getByRole('button', { name: 'Save draft' });
    this.nextButton = this.container.getByRole('button', { name: 'Next' });
    this.createAndScheduleButton = this.container
      .getByRole('button', { name: 'Create & schedule' })
      .or(this.container.getByRole('button', { name: 'Create' }));

    this.saveChangesButton = this.container.getByRole('button', { name: 'Save changes' });
    this.submitButton = this.container.getByRole('button', { name: 'Submit' });
    this.companyValuesField = this.container.locator('[data-testid*="company values"] input[type="text"]');
    // this.whoCanGiveAwardOption = this.container.locator('[id="spotAwardGiverTarget"]');
    // this.whoCanReceiveAwardOption = this.container.locator('[id="spotAwardReceiverTarget"]');
    this.whoCanGiveAwardOption = this.container.getByTestId('field-Who can give this award').getByTestId('SelectInput');
    this.whoCanReceiveAwardOption = this.container
      .getByTestId('field-Who can receive this award')
      .getByTestId('SelectInput');
    this.extraField = this.container.locator('input[id*="react-select-"]');
    this.dateFrom = this.container.getByRole('button', { name: 'Date from*' });
    this.dateTo = this.container.getByRole('button', { name: 'Date to*' });
    this.awardGuidance = this.container.getByRole('textbox', { name: 'Award guidance(optional)' });
    this.timesInput = this.container.locator('[id="limitPerPeriod"]');
    this.timesMinus = this.container.getByRole('button', { name: 'Minus' });
    this.timesPlus = this.container.getByRole('button', { name: 'Plus' });
    this.frequencyOption = this.container.getByTestId('field-Frequency').getByTestId('SelectInput');
    this.createButton = this.container.getByRole('button', { name: 'Create', exact: true });
    this.selectOptions = this.container.getByRole('menuitem');
    this.selectNextMonthButton = this.container.getByRole('button', { name: 'Next month' });
  }

  /**
   * Verify that the spot award page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the spot award page is loaded', async () => {
      const spotAwardTab = this.page.getByRole('tab', { name: 'Spot awards' });
      await expect(spotAwardTab, 'expecting spot awards tab to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Navigate to spot awards tab
   */
  async navigateToSpotAwardsTab(): Promise<void> {
    await test.step('Navigating to spot awards tab', async () => {
      const spotAwardTab = this.page.getByRole('tab', { name: 'Spot awards' });
      await expect(spotAwardTab, 'expecting spot awards tab to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await spotAwardTab.click();
    });
  }

  /**
   * Mock empty spot awards listing API
   * This will intercept all calls to the spot awards listing endpoint and return empty results
   * @param includeQueryParams - Whether to match query parameters in the route (default: true)
   */
  async mockEmptySpotAwardsListing(includeQueryParams: boolean = true): Promise<void> {
    await test.step('Mocking empty spot awards listing API', async () => {
      const routePattern = includeQueryParams
        ? '**/recognition/admin/award/spot/listing*'
        : '**/recognition/admin/award/spot/listing';

      await this.page.route(routePattern, async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: [],
          }),
        });
      });
    });
  }

  /**
   * Remove the empty spot awards listing API mock
   * Call this method to restore the original API behavior
   */
  async unrouteEmptySpotAwardsListing(): Promise<void> {
    await test.step('Removing empty spot awards listing API mock', async () => {
      await this.page.unroute('**/recognition/admin/award/spot/listing*');
    });
  }

  /**
   * Verify empty state for spot awards
   */
  async verifyEmptyState(): Promise<void> {
    await test.step('Verifying spot awards empty state', async () => {
      await expect(
        this.subTabIndicator.pageContainer.getByText('You don’t have any spot awards'),
        'expecting empty state header to be visible'
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(
        this.subTabIndicator.pageContainer.getByText(
          'Reward outstanding performance instantly with Spot Awards. Celebrate teamwork, innovation, and impact with tailored, meaningful recognition.'
        ),
        'expecting empty state description to be visible'
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(
        this.subTabIndicator.getButton('New spot award', 'link'),
        'expecting New spot award button to be visible'
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Verify all filter tabs are visible
   * @param tabOptions - Array of tab names to verify
   */
  async verifyFilterTabs(tabOptions: string[]): Promise<void> {
    await test.step('Verifying filter tabs for spot awards', async () => {
      for (const tabOption of tabOptions) {
        await expect(this.subTabIndicator.getTab(tabOption), `expecting ${tabOption} tab to be visible`).toBeVisible({
          timeout: TIMEOUTS.MEDIUM,
        });
      }
    });
  }

  /**
   * Verify spot award table columns
   */
  async verifyTableColumns(): Promise<void> {
    await test.step('Verifying spot award table columns', async () => {
      const columns = ['Award', 'Available to', 'Times awarded', 'Status', 'Created', 'Edited'];
      for (const column of columns) {
        await expect(this.subTabIndicator.getCell(column), `expecting ${column} column to be visible`).toBeVisible({
          timeout: TIMEOUTS.MEDIUM,
        });
      }
    });
  }

  /**
   * Verify three dots menu options for spot award
   * @param awardIndex - Index of the award row (0-based)
   */
  async verifyThreeDotsMenuOptions(awardIndex: number): Promise<void> {
    await test.step(`Verifying three dots menu options for award at index ${awardIndex}`, async () => {
      const threeDotsButton = this.subTabIndicator.getThreeDotsButton(awardIndex);
      await expect(threeDotsButton, 'expecting three dots button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await threeDotsButton.click();
      await expect(this.subTabIndicator.editMenuItem, 'expecting edit menu item to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(this.subTabIndicator.deactivateMenuItem, 'expecting deactivate menu item to be visible').toBeVisible(
        {
          timeout: TIMEOUTS.MEDIUM,
        }
      );
    });
  }

  /**
   * Click show more button if visible
   * @param awardCell - Locator of the award cell
   */
  async clickShowMoreIfVisible(awardCell: Locator): Promise<void> {
    await test.step('Clicking show more button if visible', async () => {
      const showMoreButton = this.page.getByTestId('show-more-button');

      // Check if award name is visible, if not, click show more button until it appears
      let isAwardVisible = false;
      const maxRetries = 10; // Maximum number of times to click show more button
      let retryCount = 0;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      while (!isAwardVisible && retryCount < maxRetries) {
        // Check if award name is visible
        const isVisible = await awardCell.isVisible().catch(() => false);

        if (isVisible) {
          isAwardVisible = true;
          break;
        }

        // If award is not visible, check if show more button exists and is visible
        try {
          const showMoreButtonVisible = await showMoreButton.isVisible();

          if (!showMoreButtonVisible) {
            // Show more button is not available, stop trying
            console.log('Show more button is not available. Stopping search.');
            break;
          }

          // Click show more button and wait for new items to load
          await showMoreButton.click();
          await this.page.waitForTimeout(1000); // Wait for new items to load
          retryCount++;
        } catch {
          // Show more button doesn't exist, stop trying
          console.log('Show more button does not exist. Stopping search.');
          break;
        }
      }
      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Verify award name is visible in table
   * @param awardName - Name of the award to verify
   */
  async verifyAwardNameInTable(awardName: string): Promise<void> {
    await test.step(`Verifying award name ${awardName} in table`, async () => {
      const awardCell = this.subTabIndicator.getCell(awardName).first();
      await this.clickShowMoreIfVisible(awardCell);
      await this.page.waitForTimeout(2000);

      await awardCell.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      await expect(awardCell, `expecting award "${awardName}" to be visible`).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Verify three dots menu options for award by name
   * @param awardName - Name of the award
   */
  async verifyThreeDotsMenuOptionsByName(awardName: string): Promise<void> {
    await test.step(`Verifying three dots menu options for award: ${awardName}`, async () => {
      const threeDotsButton = this.subTabIndicator.getThreeDotsButton(awardName);
      await threeDotsButton.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      await threeDotsButton.click();
      await expect(this.subTabIndicator.editMenuItem, 'expecting edit menu item to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(this.subTabIndicator.deactivateMenuItem, 'expecting deactivate menu item to be visible').toBeVisible(
        {
          timeout: TIMEOUTS.MEDIUM,
        }
      );
    });
  }

  /**
   * Verify create spot award page UI elements
   */
  async verifyCreatePageUI(): Promise<void> {
    await test.step('Verifying create spot award page UI', async () => {
      await expect(this.header, 'expecting header to be visible').toHaveText('Create spot award');
      await expect(this.cancelButton, 'expecting cancel button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(this.saveDraftButton, 'expecting save draft button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(this.nextButton, 'expecting next button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Get badge locator by index
   * @param index - Index of the badge (0-based)
   */
  getBadge(index: number): Locator {
    return this.container.locator('[data-testid="field-Badge"]').getByRole('radio').nth(index);
  }

  /**
   * Get company values option locator
   * @param option - Company value option name
   */
  companyValuesOption(option: string): Locator {
    return this.container.getByRole('heading', { name: option }).first();
  }

  /**
   * Get select award period radio button
   * @param radioName - Name of the radio button
   */
  selectAwardPeriod(radioName: 'Indefinitely' | 'During a specified period'): Locator {
    return this.container.getByRole('radio', { name: radioName });
  }

  /**
   * Get date cell locator
   * @param date - Date string to match (formatted like "Fri Dec 26" or just "26")
   */
  dateCell(date: string): Locator {
    // Extract day number from formatted date string (e.g., "Fri Dec 26" -> "26", "03" -> "3")
    const dayNumber = date.match(/\d+/)?.[0] || date;
    // Remove leading zeros (e.g., "03" -> "3") since calendar gridcells don't have leading zeros
    const dayWithoutLeadingZero = String(Number(dayNumber));
    // Use exact match to avoid matching days like 13, 23, 30, 31 that contain the same digits
    return this.container.getByRole('gridcell', { name: dayWithoutLeadingZero, exact: true });
  }

  /**
   * Get select how often award given radio button
   * @param radioName - Name of the radio button
   */
  selectHowOftenAwardGiven(radioName: 'Unlimited' | 'Limited'): Locator {
    // Scope to the "How often can this award be given" field container to avoid matching other radio buttons
    const fieldContainer = this.container
      .locator('*')
      .filter({ hasText: /How often can this award be given/i })
      .first();
    return fieldContainer.getByRole('radio', { name: radioName, exact: true }).first();
  }

  /**
   * Get extra field select option locator
   * @param option - Option name to select
   */
  extraFieldSelectOption(option: string): Locator {
    return this.container.getByRole('menuitem', { name: option }).first();
  }

  /**
   * Get extra field select option by index
   * @param index - Index of the option
   */
  extraFieldSelectOptionByIndex(index: number): Locator {
    return this.selectOptions.nth(index);
  }

  /**
   * Fill spot award form page one
   * @param awardName - Name of the award
   * @param awardDescription - Description of the award
   * @param badgeIndex - Index of badge to select (default: 1)
   * @param skipNext - Whether to skip clicking Next button (default: false)
   */
  async fillSpotAwardFormPageOne(
    awardName: string,
    awardDescription: string = 'Spot award description',
    badgeIndex: number = 2,
    skipNext: boolean = false
  ): Promise<void> {
    await test.step('Filling spot award form page one', async () => {
      await this.awardNameField.fill(awardName);
      await this.awardDescriptionField.fill(awardDescription);
      await this.getBadge(badgeIndex).click();
      if (!skipNext) {
        await this.nextButton.click();
      }
    });
  }

  /**
   * Get dropdown option locator
   * @param optionText - Text of the option to find
   */
  private getDropdownOption(optionText: string): Locator {
    return this.page
      .locator('[role="option"], [role="menuitem"], [data-testid="SelectInput"]')
      .filter({ hasText: optionText })
      .first();
  }

  /**
   * Select option from combobox (React Select or native select)
   * @param comboboxLocator - Locator for the combobox
   * @param optionText - Text of the option to select
   */
  async selectComboboxOption(comboboxLocator: Locator, optionText: string): Promise<void> {
    await test.step(`Selecting "${optionText}" from combobox`, async () => {
      // Try native selectOption first
      try {
        await comboboxLocator.selectOption({ label: optionText });
        return;
      } catch {
        // If that fails, treat it as a React Select combobox
      }

      // Click to open the combobox
      try {
        await comboboxLocator.click();
      } catch {
        // Fallback: try clicking parent container if locator itself isn't clickable
        const parent = comboboxLocator.locator('..');
        await parent.click();
      }

      // Wait for dropdown to open and find the option
      const optionLocator = this.getDropdownOption(optionText);
      await expect(optionLocator, `expecting option "${optionText}" to be visible`).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await optionLocator.click();
    });
  }
  /**
   * Fill spot award configuration
   * @param whoCanGive - Who can give the award
   * @param whoCanReceive - Who can receive the award
   * @param location - Location if whoCanReceive is 'Employees in a location'
   * @param awardPeriod - Award period option
   * @param dateFrom - Start date
   * @param dateTo - End date
   * @param howOften - How often award can be given
   * @param guidance - Award guidance text
   */
  async fillSpotAwardConfiguration(
    whoCanGive: string,
    whoCanReceive: string,
    location?: string,
    awardPeriod: 'Indefinitely' | 'During a specified period' = 'During a specified period',
    dateFrom?: string,
    dateTo?: string,
    howOften: 'Unlimited' | 'Limited' = 'Unlimited',
    guidance: string = 'Spot award guidance',
    timesValue: string = '5',
    frequency: string = 'Monthly'
  ): Promise<void> {
    await test.step('Filling spot award configuration', async () => {
      await this.selectComboboxOption(this.whoCanGiveAwardOption, whoCanGive);

      // Handle giver type extra field (department or location)
      if (
        whoCanGive.includes('Employees in a location') ||
        whoCanGive.includes('Managers in a location') ||
        whoCanGive.includes('Employees in a department') ||
        whoCanGive.includes('Managers in a department')
      ) {
        await this.extraField.first().waitFor({ state: 'visible' });
        await this.extraField.first().click();
        await expect(
          this.extraFieldSelectOptionByIndex(0),
          'expecting giver department/location option to be visible'
        ).toBeVisible({
          timeout: TIMEOUTS.MEDIUM,
        });
        await this.extraFieldSelectOptionByIndex(0).click();
      }

      await this.selectComboboxOption(this.whoCanReceiveAwardOption, whoCanReceive);

      // Handle receiver type extra field (department or location)
      if (whoCanReceive.includes('location')) {
        if (location) {
          await this.extraField.last().fill(location);
          await this.extraFieldSelectOption(location).click();
        } else {
          // If no specific location provided, select first option
          await this.extraField.last().click();
          await expect(
            this.extraFieldSelectOptionByIndex(0),
            'expecting receiver location option to be visible'
          ).toBeVisible({
            timeout: TIMEOUTS.MEDIUM,
          });
          await this.extraFieldSelectOptionByIndex(0).click();
        }
      } else if (whoCanReceive.includes('department')) {
        await this.extraField.last().click();
        await expect(
          this.extraFieldSelectOptionByIndex(0),
          'expecting receiver department option to be visible'
        ).toBeVisible({
          timeout: TIMEOUTS.MEDIUM,
        });
        await this.extraFieldSelectOptionByIndex(0).click();
      }

      if (awardPeriod === 'During a specified period' && dateFrom && dateTo) {
        await this.selectAwardPeriod(awardPeriod).check();
        await this.dateFrom.click();
        await expect(this.dateCell(dateFrom), 'expecting date from cell to be visible').toBeVisible({
          timeout: TIMEOUTS.MEDIUM,
        });
        await this.dateCell(dateFrom).click();
        await this.dateTo.click();

        // Check if date cell is visible and enabled
        const dateCellLocator = this.dateCell(dateTo);
        const isVisible = await dateCellLocator.isVisible().catch(() => false);
        const isEnabled = isVisible ? await dateCellLocator.isEnabled().catch(() => false) : false;

        // If not visible or disabled, navigate to next month
        if (!isVisible || !isEnabled) {
          await this.selectNextMonthButton.click();
          await this.page.waitForTimeout(1000);
          await expect(dateCellLocator, 'expecting date to cell to be visible').toBeVisible({
            timeout: TIMEOUTS.MEDIUM,
          });
          await expect(dateCellLocator, 'expecting date to cell to be enabled').toBeEnabled({
            timeout: TIMEOUTS.MEDIUM,
          });
        }
        await dateCellLocator.click();
      } else {
        await expect(
          this.selectAwardPeriod('Indefinitely'),
          'expecting Indefinitely period to be checked'
        ).toHaveAttribute('checked');
      }
      // Handle how often
      if (howOften === 'Limited') {
        await this.selectHowOftenAwardGiven('Limited').check();
        await this.timesInput.fill(timesValue);
        await expect(this.timesInput, `expecting times input to have value ${timesValue}`).toHaveValue(timesValue);
        await this.timesPlus.click();
        const incrementedValue = String(Number(timesValue) + 1);
        await expect(this.timesInput, `expecting times input to have value ${incrementedValue}`).toHaveValue(
          incrementedValue
        );
        await this.timesMinus.click();
        await expect(this.timesInput, `expecting times input to have value ${timesValue}`).toHaveValue(timesValue);
      } else {
        await this.selectHowOftenAwardGiven('Unlimited').check();
      }

      // Handle frequency for indefinitely + limited
      if (awardPeriod === 'Indefinitely' && howOften === 'Limited') {
        await this.frequencyOption.selectOption(frequency);
      }
      await this.awardGuidance.fill(guidance);
      if (awardPeriod === 'Indefinitely') {
        await this.createButton.click();
      } else {
        await this.createAndScheduleButton.click();
      }
    });
  }

  /**
   * Fill complete spot award form and create award
   * @param awardName - Name of the award
   * @param awardDescription - Description of the award (defaults to awardName)
   * @param badgeIndex - Index of badge to select (default: 2)
   * @param giverType - Who can give the award
   * @param receiverType - Who can receive the award
   * @param location - Location if receiverType includes 'location'
   * @param awardPeriod - Award period option ('Indefinitely' | 'During a specified period')
   * @param howOften - How often award can be given ('Unlimited' | 'Limited')
   * @param guidance - Award guidance text (default: 'Test Guidance')
   * @param timesValue - Number of times for limited awards (default: '5')
   * @param frequency - Frequency option for indefinitely + limited awards (default: 'Monthly')
   */
  async fillCompleteSpotAwardFormAndCreate(
    awardName: string,
    awardDescription: string,
    badgeIndex: number,
    giverType: string,
    receiverType: string,
    location: string | undefined,
    awardPeriod: 'Indefinitely' | 'During a specified period',
    howOften: 'Unlimited' | 'Limited',
    guidance: string = 'Test Guidance',
    timesValue: string = '5',
    frequency: string = 'Monthly'
  ): Promise<void> {
    await test.step('Fill out required details', async () => {
      // Fill page one
      await this.fillSpotAwardFormPageOne(awardName, awardDescription, badgeIndex);

      // Wait for configuration page to load
      await expect(this.whoCanGiveAwardOption, 'expecting who can give award option to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });

      // Handle award period dates
      let from: string | undefined;
      let to: string | undefined;
      if (awardPeriod === 'During a specified period') {
        from = getFormattedDate({ days: 1 }).replace(',', '');
        to = getFormattedDate({ days: 5 }).replace(',', '');
      }

      await this.fillSpotAwardConfiguration(
        giverType,
        receiverType,
        location,
        awardPeriod,
        from,
        to,
        howOften,
        guidance,
        timesValue,
        frequency
      );
    });
  }

  /**
   * Edit spot award name
   * @param newAwardName - New name for the award
   */
  async editAwardName(newAwardName: string): Promise<void> {
    await test.step(`Editing award name to ${newAwardName}`, async () => {
      await this.awardNameField.fill(newAwardName);
      await this.nextButton.click();
      await this.saveChangesButton.click();
    });
  }

  /**
   * Get current award name from input field
   */
  async getCurrentAwardName(): Promise<string> {
    return await this.awardNameField.inputValue();
  }

  /**
   * Update draft spot award with dates
   * @param dateFrom - Start date
   * @param dateTo - End date
   * @param howOften - How often award can be given
   * @param guidance - Award guidance text
   */
  async updateDraftSpotAward(
    dateFrom: string,
    dateTo: string,
    howOften: 'Unlimited' | 'Limited' = 'Unlimited',
    guidance: string = 'Spot award guidance'
  ): Promise<void> {
    await test.step('Updating draft spot award', async () => {
      await this.nextButton.click();
      await this.selectAwardPeriod('During a specified period').check();
      await this.dateFrom.click();
      await expect(this.dateCell(dateFrom), 'expecting date from cell to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.dateCell(dateFrom).click();
      await this.dateTo.click();
      await expect(this.dateCell(dateTo), 'expecting date to cell to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.dateCell(dateTo).click();
      await this.selectHowOftenAwardGiven(howOften).check();
      await this.awardGuidance.fill(guidance);
      await this.submitButton.click();
    });
  }

  /**
   * Verify recognition page is loaded
   * @param expectedUrl - Expected URL to verify
   */
  async verifyRecognitionPageLoaded(expectedUrl: string): Promise<void> {
    await test.step('User should be on Recognition page', async () => {
      await expect(this.page, 'expecting page to have correct URL').toHaveURL(expectedUrl);
      const recognitionHeader = this.page.getByRole('heading', { name: 'Recognition' }).first();
      await expect(recognitionHeader, 'expecting recognition header to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Verify spot awards tab is visible
   */
  async verifySpotAwardsTabVisible(): Promise<void> {
    await test.step('Validate Spot awards tab', async () => {
      const spotAwardTab = this.page.getByRole('tab', { name: 'Spot awards' });
      await expect(spotAwardTab, 'expecting spot awards tab to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Verify table columns and sort functionality
   */
  async verifyTableColumnsAndSort(): Promise<void> {
    await test.step('Validate column value on dashboard for spot award', async () => {
      await this.verifyTableColumns();
      await this.subTabIndicator.getCell('Created').click();
      await expect(this.subTabIndicator.getCell('').first(), 'expecting empty cell to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Edit award and verify changes
   * @param newAwardName - New name for the award
   */
  async editAwardAndVerifyChanges(newAwardName: string): Promise<void> {
    await test.step('Now click on edit option and make some edit on awards and click on update', async () => {
      await this.subTabIndicator.editMenuItem.click();
      await this.editAwardName(newAwardName);
      await this.page.waitForTimeout(2000);
      await this.verifyAwardNameInTable(newAwardName);
    });
  }

  /**
   * Navigate to spot awards and wait for awards to load
   */
  async navigateToSpotAwardsAndWaitForAwards(): Promise<void> {
    await test.step('Navigate to spot awards', async () => {
      await this.navigateToSpotAwardsTab();
      await this.subTabIndicator.getThreeDotsButton(0).waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Click new spot award button, verify UI and cancel
   */
  async clickNewSpotAwardAndCancel(): Promise<void> {
    await test.step('Click on New spot awards and validate UI', async () => {
      await this.subTabIndicator.getButton('New spot award', 'link').click();
      await this.verifyCreatePageUI();
      await this.cancelButton.click();
    });
  }

  /**
   * Fill spot award configuration and verify success toast
   * @param whoCanGive - Who can give the award
   * @param whoCanReceive - Who can receive the award
   * @param location - Location if whoCanReceive is 'Employees in a location'
   * @param dateFrom - Start date
   * @param dateTo - End date
   */
  async fillSpotAwardConfigurationAndVerifyToast(
    whoCanGive: string,
    whoCanReceive: string,
    location: string,
    dateFrom: string,
    dateTo: string
  ): Promise<void> {
    await test.step('Fill out award configuration details', async () => {
      await this.fillSpotAwardConfiguration(
        whoCanGive,
        whoCanReceive,
        location,
        'During a specified period',
        dateFrom,
        dateTo,
        'Unlimited'
      );
    });
  }

  /**
   * Verify active tab and click deactivate
   * @param manageRecognitionPage - ManageRecognitionPage instance
   */
  async verifyActiveTabAndClickDeactivate(manageRecognitionPage: any): Promise<void> {
    await test.step('Validate Active tab', async () => {
      await manageRecognitionPage.selectTab('Active');
      await expect(this.subTabIndicator.getTab('Active'), 'expecting Active tab to be selected').toHaveAttribute(
        'aria-selected',
        'true',
        { timeout: TIMEOUTS.MEDIUM }
      );
      await this.verifyThreeDotsMenuOptions(0);
      await this.subTabIndicator.deactivateMenuItem.click();
    });
  }

  /**
   * Verify and confirm deactivate modal
   * @param confirmationModal - DialogBox instance
   * @returns Award title extracted from modal
   */
  async verifyAndConfirmDeactivateModal(confirmationModal: any): Promise<string> {
    return await test.step('Validate Confirmation Modal', async () => {
      await confirmationModal.title.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      await expect(confirmationModal.title, 'expecting modal title to be correct').toHaveText('Deactivate spot award');
      await expect(confirmationModal.closeButton, 'expecting close button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });

      const descriptionText = await confirmationModal.description.first().innerText();
      // Match both straight quotes (') and curly quotes (' and ') - use capture group [1] to get text without quotes
      const awardTitleMatch = descriptionText.match(/[''"](.+?)[''"]/);
      const awardTitle = awardTitleMatch ? awardTitleMatch[1] : '';
      await expect(
        confirmationModal.description.first(),
        'expecting modal description to contain award title'
      ).toContainText('Are you sure you want to disable', { timeout: TIMEOUTS.MEDIUM });
      await expect(confirmationModal.cancelButton, 'expecting cancel button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(confirmationModal.confirmButton, 'expecting confirm button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(confirmationModal.confirmButton, 'expecting confirm button text to be correct').toHaveText(
        'Deactivate'
      );
      const awardCell = this.page.locator('table tbody tr').filter({ hasText: awardTitle });
      const awardNameCell = awardCell.locator('td').nth(0);
      await confirmationModal.confirmButton.click();
      return (await awardNameCell.textContent()) || '';
    });
  }

  /**
   * Verify inactive tab and activate award
   * @param awardTitle - Title of the award
   * @param manageRecognitionPage - ManageRecognitionPage instance
   * @param confirmationModal - DialogBox instance
   */
  async verifyInactiveTabAndActivateAward(
    awardTitle: string,
    manageRecognitionPage: any,
    confirmationModal: any
  ): Promise<void> {
    await test.step('Validate Inactive tab', async () => {
      await manageRecognitionPage.selectTab('Inactive');
      await expect(
        this.subTabIndicator.getCell(awardTitle),
        'expecting award to be visible in inactive tab'
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.subTabIndicator.getThreeDotsButton(awardTitle).click();
      await expect(this.subTabIndicator.activateMenuItem, 'expecting activate menu item to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.subTabIndicator.activateMenuItem.click();
      await expect(confirmationModal.title, 'expecting modal title to be correct').toHaveText('Activate spot award');
      await expect(
        confirmationModal.description.first(),
        'expecting modal description to contain award title'
      ).toContainText(`Are you sure you want to activate`, { timeout: TIMEOUTS.MEDIUM });
      await expect(confirmationModal.closeButton, 'expecting close button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(confirmationModal.cancelButton, 'expecting cancel button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(confirmationModal.confirmButton, 'expecting confirm button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(confirmationModal.confirmButton, 'expecting confirm button text to be correct').toHaveText(
        'Activate'
      );
      await confirmationModal.confirmButton.click();
      await manageRecognitionPage.selectTab('Active');
      await expect(
        this.subTabIndicator.getCell(awardTitle).nth(0),
        'expecting award to be visible in active tab'
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Verify draft tab and update draft award
   * @param manageRecognitionPage - ManageRecognitionPage instance
   * @returns Award title from the draft
   */
  async verifyDraftTabAndUpdateAward(updateSpotAwardTitle: string): Promise<string> {
    return await test.step('Validate Draft tab', async () => {
      const from = getFormattedDate({ days: 1 }).replace(',', '');
      const to = getFormattedDate({ days: 5 }).replace(',', '');
      await this.subTabIndicator.getButton('New spot award', 'link').click();
      await this.verifyCreatePageUI();
      await this.fillSpotAwardFormPageOne(updateSpotAwardTitle);
      await this.page.waitForTimeout(1000);
      await this.fillSpotAwardConfiguration(
        'All employees',
        'Employees in a location',
        'India',
        'During a specified period',
        from,
        to,
        'Unlimited'
      );
      await this.page.waitForTimeout(500);
      return updateSpotAwardTitle;
    });
  }

  /**
   * Verify scheduled tab and deactivate/activate award
   * @param awardTitle - Title of the award
   * @param manageRecognitionPage - ManageRecognitionPage instance
   * @param confirmationModal - DialogBox instance
   */
  async verifyScheduledTabAndDeactivateActivateAward(
    awardTitle: string,
    manageRecognitionPage: any,
    confirmationModal: any
  ): Promise<void> {
    await test.step('Validate Scheduled tab', async () => {
      await manageRecognitionPage.selectTab('Scheduled');
      await this.subTabIndicator.getCell(awardTitle).first().waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      await this.verifyThreeDotsMenuOptionsByName(awardTitle);
      await this.subTabIndicator.deactivateMenuItem.click();
      await expect(confirmationModal.title, 'expecting modal title to be correct').toHaveText('Deactivate spot award');
      await expect(
        confirmationModal.description.first(),
        'expecting modal description to contain disable message'
      ).toContainText('Are you sure you want to disable', { timeout: TIMEOUTS.MEDIUM });
      await expect(confirmationModal.closeButton, 'expecting close button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(confirmationModal.cancelButton, 'expecting cancel button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(confirmationModal.confirmButton, 'expecting confirm button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(confirmationModal.confirmButton, 'expecting confirm button text to be correct').toHaveText(
        'Deactivate'
      );
      await confirmationModal.confirmButton.click();
      await manageRecognitionPage.selectTab('Inactive');
      await expect(
        this.subTabIndicator.getCell(awardTitle).nth(0),
        'expecting award to be visible in inactive tab'
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.subTabIndicator.getThreeDotsButton(awardTitle).click();
      await expect(this.subTabIndicator.activateMenuItem, 'expecting activate menu item to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.subTabIndicator.activateMenuItem.click();
      await expect(confirmationModal.title, 'expecting modal title to be correct').toHaveText('Activate spot award');
      await expect(
        confirmationModal.description.first(),
        'expecting modal description to contain activate message'
      ).toContainText('Are you sure you want to activate', { timeout: TIMEOUTS.MEDIUM });
      await expect(confirmationModal.closeButton, 'expecting close button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(confirmationModal.cancelButton, 'expecting cancel button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(confirmationModal.confirmButton, 'expecting confirm button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(confirmationModal.confirmButton, 'expecting confirm button text to be correct').toHaveText(
        'Activate & schedule'
      );
      await confirmationModal.confirmButton.click();
      await manageRecognitionPage.selectTab('Scheduled');
      await expect(
        this.subTabIndicator.getCell(awardTitle).nth(0),
        'expecting award to be visible in active tab'
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Verify edit date count is greater than zero
   * @param awardName - Award name
   * @param expectedCount - Expected minimum count
   */
  async verifyEditDateCount(awardName: string, expectedCount: number = 0): Promise<void> {
    await test.step('Verify edit date count', async () => {
      const awardCell = this.page.locator('table tbody tr').filter({ hasText: awardName });
      const editDateCount = await awardCell.locator('td').nth(5).count();
      expect(editDateCount, 'expecting edit date count to be greater than zero').toBeGreaterThan(expectedCount);
    });
  }

  /**
   * Validate award name field character limit
   * @param longText - Text that exceeds 100 characters
   * @param validText - Text that is within 100 characters
   */
  async validateAwardNameFieldCharacterLimit(longText: string, validText: string): Promise<void> {
    await test.step('Validate awards name field', async () => {
      await expect(this.header, 'expecting header to be correct').toHaveText('Create spot award');
      await this.awardNameField.fill(longText);
      await this.awardNameField.blur();
      await expect(
        this.page.getByText('Must not exceed 100 characters'),
        'expecting validation error to be visible'
      ).toBeVisible();
      await this.awardNameField.fill(validText);
      await this.awardNameField.blur();
      await expect(
        this.page.getByText('Must not exceed 100 characters'),
        'expecting validation error to not be visible'
      ).not.toBeVisible();
    });
  }

  /**
   * Validate award description field character limit
   * @param longText - Text that exceeds 500 characters
   * @param validText - Text that is within 500 characters
   */
  async validateAwardDescriptionFieldCharacterLimit(longText: string, validText: string): Promise<void> {
    await test.step('Validate awards description field', async () => {
      await this.awardDescriptionField.fill(longText);
      await this.awardDescriptionField.blur();
      await expect(
        this.page.getByText('Must not exceed 500 characters'),
        'expecting validation error to be visible'
      ).toBeVisible();
      await this.awardDescriptionField.fill(validText);
      await this.awardDescriptionField.blur();
      await expect(
        this.page.getByText('Must not exceed 500 characters'),
        'expecting validation error to not be visible'
      ).not.toBeVisible();
    });
  }

  /**
   * Validate award guidance field character limit
   * @param longText - Text that exceeds 1500 characters
   * @param validText - Text that is within 1500 characters
   */
  async validateAwardGuidanceFieldCharacterLimit(longText: string, validText: string): Promise<void> {
    await test.step('Validate awards award guidance field', async () => {
      await this.nextButton.click();
      await this.awardGuidance.fill(longText);
      await this.awardGuidance.blur();
      await expect(
        this.page.getByText('Must not exceed 1500 characters'),
        'expecting validation error to be visible'
      ).toBeVisible();
      await this.awardGuidance.fill(validText);
      await this.awardGuidance.blur();
      await expect(
        this.page.getByText('Must not exceed 1500 characters'),
        'expecting validation error to not be visible'
      ).not.toBeVisible();
    });
  }

  /**
   * Verify new spot award page elements are visible
   */
  async verifyNewSpotAwardPageElements(): Promise<void> {
    await test.step('Clicked on New Spot awards', async () => {
      await expect(this.container, 'expecting container to be visible').toBeVisible();
      await expect(this.cancelButton, 'expecting cancel button to be visible').toBeVisible();
      await expect(this.saveDraftButton, 'expecting save draft button to be visible').toBeVisible();
      await expect(this.nextButton, 'expecting next button to be visible').toBeVisible();
    });
  }

  /**
   * Verify created award in table with menu options
   * @param awardName - Name of the award to verify
   */
  async verifyCreatedAwardInTable(awardName: string): Promise<void> {
    await test.step('Validate the created award', async () => {
      await this.page.waitForTimeout(2000);
      await this.verifyAwardNameInTable(awardName);
      await this.subTabIndicator.getThreeDotsButton(awardName).click();
      await expect(this.subTabIndicator.editMenuItem, 'expecting edit menu item to be visible').toBeVisible();
      await expect(
        this.subTabIndicator.deactivateMenuItem,
        'expecting deactivate menu item to be visible'
      ).toBeVisible();
      await expect(this.subTabIndicator.deleteMenuItem, 'expecting delete menu item to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.subTabIndicator.deleteMenuItem.click();
      await this.page.waitForTimeout(500);
      await this.subTabIndicator.deleteButton.click();
      await expect(this.page.locator('div[role="alert"] p'), 'expecting toast alert to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Verify new spot award header and cancel button
   */
  async verifyNewSpotAwardHeader(): Promise<void> {
    await test.step('Clicked on New Spot awards', async () => {
      await expect(this.header, 'expecting header to be correct').toHaveText('Create spot award');
      await expect(this.cancelButton, 'expecting cancel button to be visible').toBeVisible();
    });
  }

  /**
   * Click cancel button and verify navigation to recognition page
   * @param manageRecognitionPage - ManageRecognitionPage instance
   */
  async clickCancelAndVerifyNavigation(manageRecognitionPage: any): Promise<void> {
    await test.step('Click on cancel button and validate', async () => {
      await this.cancelButton.click();
      await expect(manageRecognitionPage.recognitionHeader, 'expecting recognition header to be visible').toHaveText(
        'Recognition'
      );
    });
  }

  /**
   * Create spot award with audience option
   * @param awardName - Name of the award
   * @param awardDescription - Description of the award
   * @param badgeIndex - Index of badge to select
   * @param giverType - Who can give the award (e.g., 'Users in an audience')
   * @param receiverType - Who can receive the award
   */
  async createSpotAwardWithAudienceOption(
    awardName: string,
    awardDescription: string,
    badgeIndex: number,
    giverType: string,
    receiverType: string
  ): Promise<void> {
    await test.step('Fill out required details with audience option', async () => {
      await this.fillSpotAwardFormPageOne(awardName, awardDescription, badgeIndex);
      await this.page.waitForTimeout(500);
      await expect(this.whoCanGiveAwardOption, 'expecting who can give award option to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });

      const options = (await this.whoCanGiveAwardOption
        .locator('option')
        .allTextContents()
        .catch(() => [])) as string[];
      expect.soft(options, `expecting "${giverType}" to be in dropdown options`).toContain(giverType);
      if (giverType === 'Users in an audience') {
        await this.selectComboboxOption(this.whoCanGiveAwardOption, giverType);
        await this.extraField.click();
        await this.getOption(0).click();
      } else if (options.includes(giverType)) {
        await this.whoCanGiveAwardOption.selectOption({ label: giverType });
      } else {
        await this.selectComboboxOption(this.whoCanGiveAwardOption, giverType);
      }
      await this.selectComboboxOption(this.whoCanReceiveAwardOption, receiverType);
      await this.createButton.click();
    });
  }

  /**
   * Edit spot award and select audience option
   * @param giverType - Who can give the award (e.g., 'Users in an audience')
   */
  async editSpotAwardAndSelectAudienceOption(giverType: string): Promise<void> {
    await test.step('Fill out required details with audience option', async () => {
      await this.awardDescriptionField.waitFor({ state: 'attached' });
      await this.getBadge(2).waitFor({ state: 'attached' });
      await this.nextButton.scrollIntoViewIfNeeded();
      await this.nextButton.click();
      await this.whoCanGiveAwardOption.waitFor({ state: 'visible' });
      await expect(this.whoCanGiveAwardOption, 'expecting who can give award option to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });

      const options = (await this.whoCanGiveAwardOption
        .locator('option')
        .allTextContents()
        .catch(() => [])) as string[];
      expect.soft(options, `expecting "${giverType}" to be in dropdown options`).toContain(giverType);

      if (giverType === 'Users in an audience') {
        await this.selectComboboxOption(this.whoCanGiveAwardOption, giverType);
        await this.extraField.first().waitFor({ state: 'visible' });
        await this.extraField.first().click();
        await this.getOption(0).click();
      } else if (options.includes(giverType)) {
        await this.whoCanGiveAwardOption.selectOption({ label: giverType });
      } else {
        await this.selectComboboxOption(this.whoCanGiveAwardOption, giverType);
      }

      await this.saveChangesButton.click();
    });
  }

  /**
   * Delete spot award and verify toast message
   */
  async deleteSpotAwardAndVerifyToast(): Promise<void> {
    await test.step('Clean up - Delete created spot award', async () => {
      await this.page.waitForTimeout(1000);
      await this.subTabIndicator.getThreeDotsButton(0).click();
      await expect(this.subTabIndicator.deleteMenuItem, 'expecting delete menu item to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.subTabIndicator.deleteMenuItem.click();
      await this.page.waitForTimeout(500);
      await this.subTabIndicator.deleteButton.click();
      await expect(this.page.locator('div[role="alert"] p'), 'expecting toast alert to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Click new spot award button
   * @param manageRecognitionPage - ManageRecognitionPage instance
   */
  async clickNewSpotAwardButton(manageRecognitionPage: ManageRecognitionPage): Promise<void> {
    await test.step('Create new spot award', async () => {
      await manageRecognitionPage.subTabIndicator.getButton('New spot award', 'link').click();
    });
  }

  /**
   * Click edit spot award button
   * @param manageRecognitionPage - ManageRecognitionPage instance
   */
  async clickEditSpotAwardButton(manageRecognitionPage: ManageRecognitionPage): Promise<void> {
    await test.step('Edit existing spot award', async () => {
      await manageRecognitionPage.subTabIndicator.getThreeDotsButton(0).click();
      await manageRecognitionPage.subTabIndicator.editMenuItem.click();
    });
  }

  /**
   * Get option locator by identifier (string or number)
   * @param identifier - The identifier can be a string or a number
   * @returns Locator for the option
   */
  getOption(identifier: string | number): Locator {
    if (typeof identifier === 'string') {
      return this.selectOptions.getByText(identifier).first();
    } else {
      return this.selectOptions.nth(identifier);
    }
  }

  /**
   * Delete spot award and verify toast message
   */
  async verifyAwardInTableAndDelete(awardName: string): Promise<void> {
    await test.step('Validate the created award and delete it', async () => {
      await this.page.waitForTimeout(2000);
      await this.verifyAwardNameInTable(awardName);
      await this.subTabIndicator.getThreeDotsButton(awardName).click();
      await expect(this.subTabIndicator.editMenuItem, 'expecting edit menu item to be visible').toBeVisible();
      await expect(
        this.subTabIndicator.deactivateMenuItem,
        'expecting deactivate menu item to be visible'
      ).toBeVisible();
      await expect(this.subTabIndicator.deleteMenuItem, 'expecting delete menu item to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.subTabIndicator.deleteMenuItem.click();
      await this.page.waitForTimeout(500);
      await this.subTabIndicator.deleteButton.click();
      await expect(this.page.locator('div[role="alert"] p'), 'expecting toast alert to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Create a simple spot award with just page one filled
   * @param awardName - Name of the award
   * @param awardDescription - Description of the award
   * @param badgeIndex - Index of badge to select
   */
  async createSimpleSpotAward(awardName: string, awardDescription: string, badgeIndex: number = 2): Promise<void> {
    await test.step('Create spot award', async () => {
      await this.fillSpotAwardFormPageOne(awardName, awardDescription, badgeIndex);
      await this.createButton.click();
    });
  }

  /**
   * Create spot award with company value
   * @param awardName - Name of the award
   * @param awardDescription - Description of the award
   * @param companyValue - Company value to attach
   * @param badgeIndex - Index of badge to select
   */
  async createSpotAwardWithCompanyValue(
    awardName: string,
    awardDescription: string,
    companyValue: string,
    badgeIndex: number = 2
  ): Promise<void> {
    await test.step('Create spot award with company value attached', async () => {
      // Fill page one but don't click Next yet, as company values field is on page 1
      await this.fillSpotAwardFormPageOne(awardName, awardDescription, badgeIndex, true);
      // Wait for company values field to be visible
      await expect(this.companyValuesField, 'expecting company values field to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.companyValuesField.fill(companyValue);
      await this.page.waitForTimeout(1000);
      await this.getOption(0).click();
      await this.page.waitForTimeout(1000);
      // Now click Next to go to configuration page
      await this.nextButton.click();
      // Wait for configuration page to load
      await expect(this.whoCanGiveAwardOption, 'expecting who can give award option to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.createButton.click();
    });
  }

  /**
   * Create spot award with limited times and frequency
   * @param awardName - Name of the award
   * @param awardDescription - Description of the award
   * @param frequency - Frequency option (e.g., 'Monthly', 'Yearly')
   * @param badgeIndex - Index of badge to select
   */
  async createSpotAwardWithLimitedTimes(
    awardName: string,
    awardDescription: string,
    frequency: string = 'Monthly',
    badgeIndex: number = 2
  ): Promise<void> {
    await test.step('Create spot award with limited time', async () => {
      await this.fillSpotAwardFormPageOne(awardName, awardDescription, badgeIndex);
      await this.selectHowOftenAwardGiven('Limited').check();
      await this.frequencyOption.selectOption(frequency);
      await this.page.waitForTimeout(1000);
      await this.frequencyOption.selectOption('Monthly');
      await this.createButton.click();
    });
  }

  /**
   * Verify toast message text
   * @param expectedMessage - Expected toast message text
   */
  async verifyToastMessage(expectedMessage: string): Promise<void> {
    await test.step(`Verify toast message: ${expectedMessage}`, async () => {
      const toastAlert = this.page.locator('div[role="alert"] p');
      await expect(toastAlert, `expecting toast message to be "${expectedMessage}"`).toHaveText(expectedMessage, {
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Wait for toast message to be hidden
   */
  async waitForToastToHide(): Promise<void> {
    await test.step('Wait for toast message to be hidden', async () => {
      const toastAlert = this.page.locator('div[role="alert"] p');
      const count = await toastAlert.count();
      if (count > 0) {
        await toastAlert.first().waitFor({ state: 'hidden', timeout: TIMEOUTS.MEDIUM });
      }
    });
  }

  /**
   * Create spot award and verify duplicate name error
   * @param awardName - Name of the award (duplicate)
   * @param awardDescription - Description of the award
   * @param badgeIndex - Index of badge to select
   */
  async createSpotAwardAndVerifyDuplicateError(
    awardName: string,
    awardDescription: string,
    badgeIndex: number = 2
  ): Promise<void> {
    await test.step('Create spot award with existing award name', async () => {
      await this.fillSpotAwardFormPageOne(awardName, awardDescription, badgeIndex);
      await this.createButton.click();
      await this.verifyToastMessage('Award name already exists');
    });
  }

  /**
   * Complete flow: Create award, verify duplicate error, and cleanup
   * @param manageRecognitionPage - ManageRecognitionPage instance
   * @param awardName - Name of the award
   */
  async createAwardAndVerifyDuplicateErrorFlow(
    manageRecognitionPage: ManageRecognitionPage,
    awardName: string
  ): Promise<void> {
    await test.step('Create award, verify duplicate error, and cleanup', async () => {
      await this.clickNewSpotAwardButton(manageRecognitionPage);
      await this.createSimpleSpotAward(awardName, awardName);
      await this.verifyToastMessage(MESSAGES.NEW_AWARD_CREATED);
      await this.waitForToastToHide();

      await this.clickNewSpotAwardButton(manageRecognitionPage);
      await this.createSpotAwardAndVerifyDuplicateError(awardName, awardName);

      await this.cancelButton.click();
      await this.verifyAwardInTableAndDelete(awardName);
    });
  }

  /**
   * Navigate to recognition hub and open give recognition dialog
   * @param recognitionHubPage - RecognitionHubPage instance
   * @param giveRecognitionDialogBox - GiveRecognitionDialogBox instance
   */
  async navigateToRecognitionHubAndOpenDialog(
    recognitionHubPage: RecognitionHubPage,
    giveRecognitionDialogBox: GiveRecognitionDialogBox
  ): Promise<void> {
    await test.step('Navigate to recognition hub and open give recognition dialog', async () => {
      await recognitionHubPage.navigateRecognitionHubViaEndpoint(PAGE_ENDPOINTS.RECOGNITION_HUB);
      await recognitionHubPage.giveRecognitionButton.click();
      await expect(giveRecognitionDialogBox.container, 'expecting dialog container to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await giveRecognitionDialogBox.spotAwardTab.click();
    });
  }

  /**
   * Complete flow: Create award with company value and verify company value behavior
   * @param manageRecognitionPage - ManageRecognitionPage instance
   * @param recognitionHubPage - RecognitionHubPage instance
   * @param giveRecognitionDialogBox - GiveRecognitionDialogBox instance
   * @param awardName - Name of the award
   * @param companyValue - Company value to attach
   */
  async createAwardWithCompanyValueAndVerifyFlow(
    manageRecognitionPage: ManageRecognitionPage,
    recognitionHubPage: RecognitionHubPage,
    giveRecognitionDialogBox: GiveRecognitionDialogBox,
    awardName: string,
    companyValue: string
  ): Promise<void> {
    await test.step('Create award with company value and verify behavior', async () => {
      await this.clickNewSpotAwardButton(manageRecognitionPage);
      await this.createSpotAwardWithCompanyValue(awardName, awardName, companyValue);
      await this.verifyToastMessage(MESSAGES.NEW_AWARD_CREATED);
      await this.waitForToastToHide();
      await this.page.reload();

      await this.navigateToRecognitionHubAndOpenDialog(recognitionHubPage, giveRecognitionDialogBox);
      await giveRecognitionDialogBox.verifyCompanyValueNotPresent(companyValue);
      await giveRecognitionDialogBox.descriptionTextArea.fill('Test Message');
      await giveRecognitionDialogBox.selectAwardAndVerifyCompanyValue(awardName, companyValue);
      await giveRecognitionDialogBox.clearAwardAndVerifyCompanyValueRemoved(companyValue);

      await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint(
        'manage',
        PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION
      );
      await manageRecognitionPage.spotAwardTab.click();
      await this.verifyAwardInTableAndDelete(awardName);
    });
  }

  /**
   * Create first recognition with award (for disabled test)
   * @param giveRecognitionDialogBox - GiveRecognitionDialogBox instance
   * @param awardName - Name of the award
   */
  async createFirstRecognitionWithAward(
    giveRecognitionDialogBox: GiveRecognitionDialogBox,
    awardName: string
  ): Promise<void> {
    await test.step('Create a spot award Recognition 1st time', async () => {
      await giveRecognitionDialogBox.descriptionTextArea.waitFor({ state: 'visible' });
      await giveRecognitionDialogBox.recipientsInput.click();
      await this.page.waitForTimeout(1000);
      await giveRecognitionDialogBox.recipientsInput.fill(awardName);
      await this.page.waitForTimeout(1000);
      await giveRecognitionDialogBox.suggesterContainer.waitFor({ state: 'visible' });
      await giveRecognitionDialogBox.getOption(0).click();
      await this.page.waitForTimeout(1000);
      await giveRecognitionDialogBox.recipientToGiveAwardInput.click();
      await this.page.waitForTimeout(1000);
      await giveRecognitionDialogBox.suggesterContainer.waitFor({ state: 'visible' });
      await giveRecognitionDialogBox.getOption(0).click();
      await giveRecognitionDialogBox.descriptionTextArea.fill('Test Message');
      await expect(giveRecognitionDialogBox.recognizeButton, 'expecting recognize button to be enabled').toBeEnabled();
      await giveRecognitionDialogBox.recognizeButton.click();
      await giveRecognitionDialogBox.skipButton.click();
    });
  }

  /**
   * Create second recognition and verify award disabled warning
   * @param recognitionHubPage - RecognitionHubPage instance
   * @param giveRecognitionDialogBox - GiveRecognitionDialogBox instance
   * @param awardName - Name of the award
   */
  async createSecondRecognitionAndVerifyDisabledWarning(
    recognitionHubPage: RecognitionHubPage,
    giveRecognitionDialogBox: GiveRecognitionDialogBox,
    awardName: string
  ): Promise<void> {
    await test.step('Create a spot award Recognition 2nd time and get award disabled message', async () => {
      await this.page.reload();
      await recognitionHubPage.giveRecognitionButton.click();
      await this.page.waitForTimeout(2000);
      await giveRecognitionDialogBox.spotAwardTab.click();
      await giveRecognitionDialogBox.descriptionTextArea.waitFor({ state: 'visible' });
      await this.page.waitForTimeout(1000);
      await giveRecognitionDialogBox.recipientsInput.click();
      await this.page.waitForTimeout(1000);
      await giveRecognitionDialogBox.recipientsInput.fill(awardName);
      await this.page.waitForTimeout(1000);
      await giveRecognitionDialogBox.suggesterContainer.waitFor({ state: 'visible' });
      await giveRecognitionDialogBox.getOption(0).click();
      await giveRecognitionDialogBox.verifyAwardDisabledWarning();
    });
  }

  /**
   * Complete flow: Create award with limited times and verify disabled behavior
   * @param manageRecognitionPage - ManageRecognitionPage instance
   * @param recognitionHubPage - RecognitionHubPage instance
   * @param giveRecognitionDialogBox - GiveRecognitionDialogBox instance
   * @param awardName - Name of the award
   */
  async createAwardWithLimitedTimesAndVerifyDisabledFlow(
    manageRecognitionPage: ManageRecognitionPage,
    recognitionHubPage: RecognitionHubPage,
    giveRecognitionDialogBox: GiveRecognitionDialogBox,
    awardName: string
  ): Promise<void> {
    await test.step('Create award with limited times and verify disabled behavior', async () => {
      await this.clickNewSpotAwardButton(manageRecognitionPage);
      await this.createSpotAwardWithLimitedTimes(awardName, awardName);
      await this.verifyToastMessage(MESSAGES.NEW_AWARD_CREATED);
      await this.waitForToastToHide();
      await this.page.reload();

      await this.navigateToRecognitionHubAndOpenDialog(recognitionHubPage, giveRecognitionDialogBox);
      await this.createFirstRecognitionWithAward(giveRecognitionDialogBox, awardName);
      await this.createSecondRecognitionAndVerifyDisabledWarning(
        recognitionHubPage,
        giveRecognitionDialogBox,
        awardName
      );

      await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint(
        'manage',
        PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION
      );
      await manageRecognitionPage.spotAwardTab.click();
      await this.verifyAwardInTableAndDelete(awardName);
    });
  }

  /**
   * Complete flow: Create award, publish, share, and cleanup
   * @param manageRecognitionPage - ManageRecognitionPage instance
   * @param recognitionHubPage - RecognitionHubPage instance
   * @param giveRecognitionDialogBox - GiveRecognitionDialogBox instance
   * @param awardName - Name of the award
   */
  async createAwardPublishShareAndCleanupFlow(
    manageRecognitionPage: ManageRecognitionPage,
    recognitionHubPage: RecognitionHubPage,
    giveRecognitionDialogBox: GiveRecognitionDialogBox,
    awardName: string
  ): Promise<void> {
    await test.step('Create award, publish, share, and cleanup', async () => {
      await this.clickNewSpotAwardButton(manageRecognitionPage);
      await this.createSimpleSpotAward(awardName, awardName);
      await this.verifyToastMessage(MESSAGES.NEW_AWARD_CREATED);
      await this.page.reload();

      await this.navigateToRecognitionHubAndOpenDialog(recognitionHubPage, giveRecognitionDialogBox);
      await giveRecognitionDialogBox.publishSpotAward(awardName);
      await this.verifyToastMessage('Recognition published');
      await this.waitForToastToHide();

      await giveRecognitionDialogBox.shareToFeedViaModal();
      await this.verifyToastMessage('Recognition shared successfully');
      await this.waitForToastToHide();

      await giveRecognitionDialogBox.shareToFeedViaShareIcon();
      await this.verifyToastMessage('Recognition shared successfully');

      await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint(
        'manage',
        PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION
      );
      await manageRecognitionPage.spotAwardTab.click();
      await this.verifyAwardInTableAndDelete(awardName);
    });
  }

  /**
   * Complete flow: Navigate to recognition hub and verify pagination
   * @param recognitionHubPage - RecognitionHubPage instance
   * @param giveRecognitionDialogBox - GiveRecognitionDialogBox instance
   */
  async navigateToRecognitionHubAndVerifyPagination(
    recognitionHubPage: RecognitionHubPage,
    giveRecognitionDialogBox: GiveRecognitionDialogBox
  ): Promise<void> {
    await test.step('Navigate to recognition hub and verify pagination', async () => {
      await this.navigateToRecognitionHubAndOpenDialog(recognitionHubPage, giveRecognitionDialogBox);
      await giveRecognitionDialogBox.verifyPagination();
      await giveRecognitionDialogBox.verifyNoResultsForInvalidSearch('$$*^%*');
    });
  }
}
