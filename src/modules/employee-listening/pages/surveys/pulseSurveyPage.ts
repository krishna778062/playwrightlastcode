import test, { Locator, Page } from '@playwright/test';

import { SURVEY_QUESTION_BANK } from '../../test-data/surveyQuestions';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';

export class PulseSurveyPage extends BasePage {
  readonly pulseSurveyOption: Locator;
  readonly frequencyDropdown: Locator;
  readonly onTheRadioButton: Locator;
  readonly recurrenceDatePicker: Locator;
  readonly customParticipationRadio: Locator;
  readonly participationWindowDropdown: Locator;
  readonly startDatePicker: Locator;
  readonly endDatePicker: Locator;
  readonly firstSurveyManageButton: Locator;
  readonly browseSitesButton: Locator;
  readonly siteSearchTextbox: Locator;
  readonly doneButton: Locator;
  readonly browseAudiencesButton: Locator;
  readonly searchAudienceTextbox: Locator;
  readonly nextBtn: Locator;
  readonly firstSurveyMenuButton: Locator;
  readonly deleteButton: Locator;
  readonly confirmDeleteButton: Locator;
  readonly typeDropdown: Locator;
  readonly statusDropdown: Locator;
  readonly sortDropdownLabel: Locator;
  readonly sortDropdownButton: Locator;
  readonly pauseButton: Locator;
  readonly confirmPauseButton: Locator;
  readonly resetBtn: Locator;
  readonly saveButton: Locator;
  readonly scheduleDateRadio: Locator;
  readonly menuDropdown: Locator;
  readonly menuPanel: Locator;
  readonly menuItems: Locator;
  readonly endDateRadio: Locator;
  readonly endDateButton: Locator;
  readonly endDateGridCell: Locator;
  readonly copyLinkMenu: Locator;
  readonly copyLinkBtn: Locator;
  readonly linkCopiedPopup: Locator;
  readonly editBtn: Locator;
  readonly notYetText: Locator;
  readonly scheduleDateText: Locator;
  readonly surveyDeletedMessage: Locator;
  readonly surveyDraftSavedMessage: Locator;
  readonly noResultsText: Locator;
  readonly surveyNameInput: Locator;
  readonly recurrenceLabel: Locator;
  readonly participationWindowRadio: Locator;
  readonly participationWindowSelect: Locator;
  readonly recurrenceDayDropdown: Locator;
  readonly enabledDates: Locator;
  readonly gridcell: Locator;

  constructor(page: Page) {
    super(page, '/home');
    this.pulseSurveyOption = this.page.getByRole('radio', { name: 'Pulse A survey to track' });
    this.frequencyDropdown = this.page
      .getByLabel('Frequency', { exact: false })
      .or(this.page.getByTestId('frequency-dropdown'));
    this.onTheRadioButton = this.page.getByRole('radio', { name: /On the/i });
    this.recurrenceDatePicker = this.page
      .getByLabel('Recurrence date', { exact: false })
      .or(this.page.getByTestId('recurrence-date'));
    this.customParticipationRadio = this.page
      .getByTestId('field-Participation window')
      .getByRole('radio', { name: 'Custom' });
    this.participationWindowDropdown = this.page.getByLabel('Participation window', { exact: true });
    this.startDatePicker = this.page.getByLabel('Start date', { exact: false }).or(this.page.getByTestId('start-date'));
    this.endDatePicker = this.page.getByLabel('End date', { exact: false }).or(this.page.getByTestId('end-date'));
    this.firstSurveyManageButton = this.page.getByRole('button', { name: 'manage survey' }).first();
    this.browseSitesButton = this.page.getByRole('button', { name: /Browse Sites|Browse/i });
    this.siteSearchTextbox = this.page.getByRole('textbox', { name: /Search sites|Search…/i });
    this.doneButton = this.page.getByRole('button', { name: 'Done' });
    this.browseAudiencesButton = this.page.getByRole('button', { name: /Browse/i });
    this.searchAudienceTextbox = this.page.getByRole('textbox', { name: /Search…/i });
    this.nextBtn = this.page.locator('button[type="submit"]:has-text("Next")');
    this.firstSurveyMenuButton = this.page.getByRole('button', { name: /more|menu|three dot|⋮/i }).first();
    this.deleteButton = this.page.getByRole('menuitem', { name: /delete/i });
    this.confirmDeleteButton = this.page.getByRole('button', { name: /delete|confirm/i });
    this.typeDropdown = this.page.getByLabel('Type', { exact: false });
    this.statusDropdown = this.page.getByLabel('Status', { exact: false });
    this.sortDropdownLabel = this.page.getByLabel('Sort', { exact: false });
    this.sortDropdownButton = this.page.getByRole('button', { name: /Sort/i });
    this.pauseButton = this.page.getByText('Pause', { exact: true });
    this.confirmPauseButton = this.page.getByRole('button', { name: 'Pause' });
    this.resetBtn = this.page.getByRole('button', { name: /reset filters|reset/i });
    this.saveButton = this.page.getByRole('button', { name: 'Save' });
    this.scheduleDateRadio = this.page.getByRole('radio', { name: 'Schedule date and time' });
    this.menuDropdown = this.page.locator('.css-19bb58m');
    this.menuPanel = this.page
      .locator('[role="presentation"], [role="listbox"], .MuiPaper-root')
      .filter({ has: this.page.locator('[role="menuitem"]') });
    this.menuItems = this.page.locator('[role="menuitem"]');
    this.endDateRadio = this.page.getByRole('radio', { name: 'Choose end date' });
    this.endDateButton = this.page.getByRole('button', { name: 'Select date…' });
    this.endDateGridCell = this.page.getByRole('gridcell', { name: '7', exact: true });
    this.copyLinkMenu = this.page.getByRole('menu', { name: 'manage survey' });
    this.copyLinkBtn = this.page.getByRole('menuitem', { name: /copy link|get link/i });
    this.linkCopiedPopup = this.page.getByText('Link copied to clipboard');
    this.editBtn = this.page.getByRole('menuitem', { name: 'Edit' });
    this.notYetText = this.page.getByText(/not yet/i);
    this.scheduleDateText = this.page.getByText(/schedule date|date and time/i);
    this.surveyDeletedMessage = this.page.getByText('Survey deleted successfully');
    this.surveyDraftSavedMessage = this.page.getByText('Survey draft was saved');
    this.noResultsText = this.page.getByText(/no results/i);
    this.surveyNameInput = this.page.getByRole('textbox', { name: /survey name|name/i });
    this.recurrenceLabel = this.page.locator('label', { hasText: 'Recurrence date' });
    this.participationWindowRadio = this.page
      .getByTestId('field-Participation window')
      .getByRole('radio', { name: 'Custom' });
    this.participationWindowSelect = this.page.getByLabel('Participation window', { exact: true });
    this.recurrenceDayDropdown = this.page
      .getByLabel('Recurrence day', { exact: false })
      .or(this.page.getByTestId('recurrence-day'));
    this.enabledDates = this.page.locator(`button[role="gridcell"][name="day"]:not([disabled]):not(.rdp-day_outside)`);
    this.gridcell = this.page.getByRole('gridcell', { name: '7', exact: true });
  }

  async clickPulseSurvey() {
    await test.step('Click Pulse Survey option', async () => {
      await this.clickOnElement(this.pulseSurveyOption, {
        stepInfo: 'Click Pulse Survey option',
      });
    });
  }

  async selectFrequency(frequency: string) {
    await test.step('Click Frequency dropdown', async () => {
      await this.clickOnElement(this.frequencyDropdown, {
        stepInfo: 'Click Frequency dropdown',
      });
    });
    const overlay = this.page.locator('div[style*="pointer-events: auto"]');
    if (await overlay.isVisible()) {
      await overlay.waitFor({ state: 'hidden', timeout: TIMEOUTS.MEDIUM }).catch(() => {});
    }
    const option = this.page.getByRole('option', { name: frequency });
    if (await option.isVisible()) {
      await test.step(`Click Frequency option: ${frequency}`, async () => {
        await this.clickOnElement(option, {
          stepInfo: `Click Frequency option: ${frequency}`,
        });
      });
    } else {
      await test.step(`Click Frequency text: ${frequency}`, async () => {
        await this.clickOnElement(this.page.getByText(frequency, { exact: false }), {
          stepInfo: `Click Frequency text: ${frequency}`,
        });
      });
    }
  }

  async clickOnTheRadioButton() {
    await test.step('Click On The Radio button', async () => {
      await this.clickOnElement(this.onTheRadioButton, {
        stepInfo: 'Click On The Radio button',
      });
    });
  }

  async selectCurrentRecurrenceDate() {
    await this.verifier.verifyTheElementIsVisible(this.recurrenceDatePicker, {
      assertionMessage: 'Recurrence date picker should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
    const today = new Date().getDate();
    let suffix = 'th';
    if (today === 1 || today === 21 || today === 31) suffix = 'st';
    else if (today === 2 || today === 22) suffix = 'nd';
    else if (today === 3 || today === 23) suffix = 'rd';
    const optionLabel = `${today}${suffix}`;
    await this.recurrenceDatePicker.selectOption({ label: optionLabel });
  }

  async selectCustomParticipationWindow(days: string) {
    await this.verifier.verifyTheElementIsVisible(this.customParticipationRadio, {
      assertionMessage: 'Custom participation radio should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
    await this.customParticipationRadio.check();
    await this.verifier.verifyTheElementIsVisible(this.participationWindowDropdown, {
      assertionMessage: 'Participation window dropdown should be visible after selecting Custom',
      timeout: TIMEOUTS.MEDIUM,
    });
    const optionText = days === '1' ? '1 day' : `${days} days`;
    await this.participationWindowDropdown.selectOption({ label: optionText });
  }

  async selectStartDateAfterMonths(months: number) {
    await test.step('Click Start Date Picker', async () => {
      await this.clickOnElement(this.startDatePicker, {
        stepInfo: 'Click Start Date Picker',
      });
    });
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + months);
    const year = startDate.getFullYear();
    const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
    const day = startDate.getDate().toString().padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    await this.startDatePicker.fill(dateString);
  }

  async selectEndDateFromMenu(menuItemName: string): Promise<void> {
    await test.step(`Click End Date Menu Dropdown`, async () => {
      await this.clickOnElement(this.menuDropdown, {
        stepInfo: 'Click End Date Menu Dropdown',
      });
    });
    await test.step(`Click End Date Menu Item: ${menuItemName}`, async () => {
      await this.clickOnElement(this.page.getByRole('menuitem', { name: menuItemName }), {
        stepInfo: `Click End Date Menu Item: ${menuItemName}`,
      });
    });
  }

  async selectEndDateAfterDays(days: number, menuItemName?: string) {
    if (menuItemName) {
      await this.selectEndDateFromMenu(menuItemName);
    }
    const endDateInput = this.endDatePicker;
    if (await endDateInput.isEnabled()) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      const year = endDate.getFullYear();
      const month = (endDate.getMonth() + 1).toString().padStart(2, '0');
      const day = endDate.getDate().toString().padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      await endDateInput.fill(dateString);
    }
  }

  async selectCurrentRecurrenceDay(dayName?: string) {
    if (dayName) {
      await this.recurrenceDayDropdown.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      await this.recurrenceDayDropdown.selectOption({ label: dayName });
    } else {
      const today = new Date();
      const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' });
      await this.recurrenceDayDropdown.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      await this.recurrenceDayDropdown.selectOption({ label: dayOfWeek });
    }
  }

  async selectSite(siteName: string) {
    await test.step('Click Browse Sites button', async () => {
      await this.clickOnElement(this.browseSitesButton, {
        stepInfo: 'Click Browse Sites button',
      });
    });
    await this.siteSearchTextbox.fill(siteName);
    await this.siteSearchTextbox.press('Enter');
    const siteCheckbox = this.page.getByLabel(siteName).getByRole('checkbox');
    await test.step(`Check Site Checkbox: ${siteName}`, async () => {
      await this.clickOnElement(siteCheckbox, {
        stepInfo: `Check Site Checkbox: ${siteName}`,
      });
    });
    await test.step('Click Done button', async () => {
      await this.clickOnElement(this.doneButton, {
        stepInfo: 'Click Done button',
      });
    });
  }

  async selectAudience(audienceName: string) {
    await test.step('Click Browse Audiences button', async () => {
      await this.clickOnElement(this.browseAudiencesButton, {
        stepInfo: 'Click Browse Audiences button',
      });
    });
    await this.searchAudienceTextbox.fill(audienceName);
    await this.searchAudienceTextbox.press('Enter');
    const audienceCheckbox = this.page.getByLabel(audienceName).getByRole('checkbox');
    await test.step(`Check Audience Checkbox: ${audienceName}`, async () => {
      await this.clickOnElement(audienceCheckbox, {
        stepInfo: `Check Audience Checkbox: ${audienceName}`,
      });
    });
    await test.step('Click Done button', async () => {
      await this.clickOnElement(this.doneButton, {
        stepInfo: 'Click Done button',
      });
    });
  }

  async searchSurvey(surveyName: string) {
    const searchField = this.page.getByRole('textbox', { name: /search/i });
    await searchField.fill(surveyName);
    await searchField.press('Enter');
  }

  async openFirstSurveyMenu(timeout: number = TIMEOUTS.MEDIUM) {
    await this.verifier.verifyTheElementIsVisible(this.firstSurveyMenuButton, {
      assertionMessage: 'First survey menu button should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
    await test.step('Click First Survey Menu Button', async () => {
      await this.clickOnElement(this.firstSurveyMenuButton, {
        stepInfo: 'Click First Survey Menu Button',
      });
    });
  }

  async deleteSurvey() {
    await test.step('Click Delete Button', async () => {
      await this.clickOnElement(this.deleteButton, {
        stepInfo: 'Click Delete Button',
      });
    });
    await test.step('Click Confirm Delete Button', async () => {
      await this.clickOnElement(this.confirmDeleteButton, {
        stepInfo: 'Click Confirm Delete Button',
      });
    });
  }

  async verifyNoResultsMessage() {
    await this.verifier.verifyTheElementIsVisible(this.noResultsText, {
      assertionMessage: 'No results message should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async selectSendDate({
    frequencyRadioName,
    recurrenceDate,
    participationWindow,
    sendDateMenuName,
    endDateRadioName,
    endDateButtonName,
  }: {
    frequencyRadioName: string;
    recurrenceDate: string;
    participationWindow: string;
    sendDateMenuName: string;
    endDateRadioName: string;
    endDateButtonName: string;
  }): Promise<void> {
    await this.page.getByRole('radio', { name: frequencyRadioName }).check();

    const recurrenceLabel = this.recurrenceLabel;
    if ((await recurrenceLabel.count()) > 0 && (await recurrenceLabel.isVisible())) {
      await this.page.getByLabel('Recurrence date').selectOption(recurrenceDate);
    }

    await this.participationWindowRadio.check();
    await this.participationWindowSelect.selectOption(participationWindow);
    await this.scheduleDateRadio.check();
    await this.menuDropdown.click();
    const menuPanel = this.menuPanel;
    await menuPanel.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
    const menuItems = menuPanel.locator('[role="menuitem"]');
    await this.page.waitForFunction(count => count > 0, await menuItems.count(), { timeout: TIMEOUTS.MEDIUM });
    let index = Number(sendDateMenuName) - 1;
    if (Number.isNaN(index) || index < 0) index = 0;
    const itemCount = await menuItems.count();
    const finalIndex = Math.min(index, itemCount - 1);
    await menuItems.nth(finalIndex).scrollIntoViewIfNeeded();
    await menuItems.nth(finalIndex).click({ force: true });
    await this.page.waitForTimeout(800);
    const endDateRadio = this.page.getByRole('radio', { name: endDateRadioName });
    await endDateRadio.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
    await endDateRadio.check();
    await this.page.getByRole('button', { name: endDateButtonName }).click();
    await this.selectFirstEnabledDate();
    await this.page.keyboard.press('Escape');
    await this.nextBtn.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
  }

  private async selectFirstEnabledDate() {
    const count = await this.enabledDates.count();
    if (count === 0) {
      throw new Error('No enabled dates found in calendar!');
    }
    const firstDateText = await this.enabledDates.nth(0).textContent();
    console.log('Clicking first enabled date:', firstDateText?.trim());
    await this.enabledDates.nth(0).click();
  }

  async selectSurveyDates({
    frequencyRadioName = 'Every three months A great',
    recurrenceDate = '25',
    participationWindow = '12',
    sendDateMenuName = 'Apr 25,',
    endDateRadioName = 'Choose end date',
    endDateButtonName = 'Select date…',
    endDateGridCell = '7',
  } = {}): Promise<void> {
    await this.page.getByRole('radio', { name: frequencyRadioName }).check();
    await this.recurrenceDatePicker.selectOption(recurrenceDate);
    await this.participationWindowRadio.check();
    await this.participationWindowSelect.selectOption(participationWindow);
    await this.scheduleDateRadio.check();
    await this.menuDropdown.click();
    await this.page.getByRole('menuitem', { name: sendDateMenuName }).click();
    await this.page.getByText(endDateRadioName).click();
    await this.page.locator('label').filter({ hasText: endDateRadioName }).click();
    await this.endDateButton.click();
    await this.endDateGridCell.click();
  }

  async addScaleQuestionFromDataWithoutType(surveyCreationPage: any, index: number, scaleType: string): Promise<void> {
    const questionData = SURVEY_QUESTION_BANK.SCALE[index];
    await surveyCreationPage.clickCreateYourOwnButton();
    await this.page.getByRole('textbox', { name: 'Enter your question' }).fill(questionData.question);
    if (scaleType === 'Sentiment') await surveyCreationPage.selectSentimentAnswerScale();
    if (scaleType === 'Emoji') await surveyCreationPage.selectEmojiAnswerScale();
    if (scaleType === 'Awareness') await surveyCreationPage.selectAwarenessAnswerScale();
    await surveyCreationPage.selectTheme(questionData.theme);
    await surveyCreationPage.clickAddButton();
    await surveyCreationPage.validateQuestionAddedPopup();
  }

  async duplicateSurvey() {
    await this.openFirstSurveyMenu();
    const duplicateButton = this.page.getByRole('menuitem', { name: /duplicate/i });
    await test.step('Click Duplicate Survey Button', async () => {
      await this.clickOnElement(duplicateButton, {
        stepInfo: 'Click Duplicate Survey Button',
      });
    });
    await this.verifier.verifyTheElementIsVisible(this.page.getByText(/duplicate survey|copy of/i), {
      assertionMessage: 'Duplicate survey confirmation should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async configureSurvey(options?: { name?: string; audience?: string; dates?: any }) {
    const configureBtn = this.page.getByRole('menuitem', { name: /configure|edit/i });
    await test.step('Click Configure Survey Button', async () => {
      await this.clickOnElement(configureBtn, {
        stepInfo: 'Click Configure Survey Button',
      });
    });
    await this.verifier.verifyTheElementIsVisible(
      this.page.getByText(/configure survey|edit survey|survey settings/i),
      {
        assertionMessage: 'Configure survey page should be visible',
        timeout: TIMEOUTS.MEDIUM,
      }
    );
    if (options) {
      if (options.name) {
        await this.surveyNameInput.fill(options.name);
      }
      if (options.audience) {
        await this.selectAudience(options.audience);
      }
      if (options.dates) {
        await this.selectSurveyDates(options.dates);
      }
    }
  }

  async applyTypeFilter(type: string) {
    await test.step('Click Type Dropdown', async () => {
      await this.clickOnElement(this.typeDropdown, {
        stepInfo: 'Click Type Dropdown',
      });
    });
    const option = this.page.getByRole('option', { name: type });
    await test.step(`Click Type Option: ${type}`, async () => {
      await this.clickOnElement(option, {
        stepInfo: `Click Type Option: ${type}`,
      });
    });
    await this.page.waitForTimeout(500);
  }

  async applyStatusFilter(status: string) {
    await test.step('Click Status Dropdown', async () => {
      await this.clickOnElement(this.statusDropdown, {
        stepInfo: 'Click Status Dropdown',
      });
    });
    const option = this.page.getByRole('option', { name: status });
    await test.step(`Click Status Option: ${status}`, async () => {
      await this.clickOnElement(option, {
        stepInfo: `Click Status Option: ${status}`,
      });
    });
    await this.page.waitForTimeout(500);
  }

  async applySortFilter(sortOption: string) {
    let sortDropdown: Locator;
    if (await this.sortDropdownLabel.isVisible({ timeout: TIMEOUTS.MEDIUM }).catch(() => false)) {
      sortDropdown = this.sortDropdownLabel;
    } else {
      sortDropdown = this.sortDropdownButton;
    }
    await test.step('Click Sort Dropdown', async () => {
      await this.clickOnElement(sortDropdown, {
        stepInfo: 'Click Sort Dropdown',
      });
    });
    let optionLocator = this.page.getByRole('option', { name: sortOption });
    if (!(await optionLocator.isVisible({ timeout: TIMEOUTS.MEDIUM }).catch(() => false))) {
      optionLocator = this.page.getByRole('menuitem', { name: sortOption });
    }
    await test.step(`Click Sort Option: ${sortOption}`, async () => {
      await this.clickOnElement(optionLocator, {
        stepInfo: `Click Sort Option: ${sortOption}`,
      });
    });
    await this.page.waitForTimeout(500);
  }

  async pauseSurvey() {
    await this.verifier.verifyTheElementIsVisible(this.pauseButton, {
      assertionMessage: 'Pause button should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
    await test.step('Click Pause Survey Button', async () => {
      await this.clickOnElement(this.pauseButton, {
        stepInfo: 'Click Pause Survey Button',
      });
    });
  }

  async confirmPauseSurvey() {
    await this.verifier.verifyTheElementIsVisible(this.confirmPauseButton, {
      assertionMessage: 'Confirm pause button should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
    await test.step('Click Confirm Pause Survey Button', async () => {
      await this.clickOnElement(this.confirmPauseButton, {
        stepInfo: 'Click Confirm Pause Survey Button',
      });
    });
  }

  async resetSurveyFilters() {
    if (await this.resetBtn.isVisible()) {
      await test.step('Click Reset Survey Filters Button', async () => {
        await this.clickOnElement(this.resetBtn, {
          stepInfo: 'Click Reset Survey Filters Button',
        });
      });
      await this.page.waitForTimeout(500);
    }
  }

  async copySurveyLink() {
    await this.copyLinkMenu.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
    let copyLinkBtn = this.copyLinkBtn;
    if (!(await copyLinkBtn.isVisible({ timeout: TIMEOUTS.MEDIUM }).catch(() => false))) {
      if (
        await this.page
          .getByText('Copy link to survey')
          .isVisible({ timeout: TIMEOUTS.MEDIUM })
          .catch(() => false)
      ) {
        copyLinkBtn = this.page.getByText('Copy link to survey');
      } else {
        const regex = /copy.*link/i;
        if (
          await this.page
            .getByText(regex)
            .isVisible({ timeout: TIMEOUTS.MEDIUM })
            .catch(() => false)
        ) {
          copyLinkBtn = this.page.getByText(regex);
        } else {
          const menuItems = this.menuItems;
          const count = await menuItems.count();
          const itemsText = [];
          for (let i = 0; i < count; i++) {
            itemsText.push(await menuItems.nth(i).textContent());
          }
          console.warn('No copy link button found. Menu items:', itemsText);
          throw new Error('Copy link button not found in survey menu.');
        }
      }
    }
    await test.step('Click Copy Survey Link Button', async () => {
      await this.clickOnElement(copyLinkBtn, {
        stepInfo: 'Click Copy Survey Link Button',
      });
    });
  }

  async verifyLinkCopiedPopup() {
    await this.verifier.verifyTheElementIsVisible(this.linkCopiedPopup, {
      assertionMessage: 'Link copied popup should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async openNewTabAndPasteLink() {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.page.evaluate(() => window.open('about:blank')),
    ]);
    await newPage.bringToFront();
    await newPage.keyboard.press('Control+V');
    await newPage.keyboard.press('Enter');
    return newPage;
  }

  async copySurveyLinkAndOpenInNewTab() {
    await this.copyLinkMenu.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
    let copyLinkBtn = this.copyLinkBtn;
    if (!(await copyLinkBtn.isVisible({ timeout: TIMEOUTS.MEDIUM }).catch(() => false))) {
      if (
        await this.page
          .getByText('Copy link to survey')
          .isVisible({ timeout: TIMEOUTS.MEDIUM })
          .catch(() => false)
      ) {
        copyLinkBtn = this.page.getByText('Copy link to survey');
      } else {
        const regex = /copy.*link/i;
        if (
          await this.page
            .getByText(regex)
            .isVisible({ timeout: TIMEOUTS.MEDIUM })
            .catch(() => false)
        ) {
          copyLinkBtn = this.page.getByText(regex);
        } else {
          const menuItems = this.menuItems;
          const count = await menuItems.count();
          const itemsText = [];
          for (let i = 0; i < count; i++) {
            itemsText.push(await menuItems.nth(i).textContent());
          }
          console.warn('No copy link button found. Menu items:', itemsText);
          throw new Error('Copy link button not found in survey menu.');
        }
      }
    }
    await copyLinkBtn.click();
    await this.verifyLinkCopiedPopup();
    const copiedLink = await this.page.evaluate(async () => await navigator.clipboard.readText());
    return copiedLink;
  }

  async copySurveyLinkAndOpenTabAndVerify() {
    await this.copySurveyLinkAndOpenInNewTab();
    await this.openNewTabAndPasteLink();
  }

  async editSurvey() {
    await this.openFirstSurveyMenu();
    await this.verifier.verifyTheElementIsVisible(this.editBtn, {
      assertionMessage: 'Edit button should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
    await test.step('Click Edit Survey Button', async () => {
      await this.clickOnElement(this.editBtn, {
        stepInfo: 'Click Edit Survey Button',
      });
    });
    await this.verifier.verifyTheElementIsVisible(this.page.getByText(/edit survey|survey settings/i), {
      assertionMessage: 'Edit survey page should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async verifyNotYetAndScheduleDateTimeNotVisible() {
    if (await this.notYetText.isVisible()) throw new Error('Not yet is visible');
    if (await this.scheduleDateText.isVisible()) throw new Error('Schedule date/time is visible');
  }

  async clickFirstSurveyManageButton(): Promise<void> {
    await test.step('Click first survey manage button', async () => {
      await this.clickOnElement(this.firstSurveyManageButton, {
        stepInfo: 'Click first survey manage button',
      });
      await this.page.waitForTimeout(2000);
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.pulseSurveyOption, {
      assertionMessage: 'Pulse survey option should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async verifySurveyDeletedMessage() {
    await this.verifier.verifyTheElementIsVisible(this.surveyDeletedMessage, {
      assertionMessage: 'Survey deleted message should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async verifySurveyDraftSavedMessage() {
    await this.verifier.verifyTheElementIsVisible(this.surveyDraftSavedMessage, {
      assertionMessage: 'Survey draft saved message should be visible',
      timeout: TIMEOUTS.MEDIUM,
    });
  }

  async clickSaveButton() {
    await test.step('Click Save Button', async () => {
      await this.clickOnElement(this.saveButton, {
        stepInfo: 'Click Save Button',
      });
    });
  }

  async waitForSurveysPageLoad(timeout: number = TIMEOUTS.MEDIUM) {
    await this.page.waitForTimeout(timeout);
  }

  async pressEscape() {
    await this.page.keyboard.press('Escape');
  }
}
