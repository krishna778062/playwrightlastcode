import test, { Locator, Page } from '@playwright/test';

import { SURVEY_QUESTION_BANK } from '../../test-data/surveyQuestions';

export class PulseSurveyPage {
  page: Page;
  pulseSurveyOption: Locator;
  frequencyDropdown: Locator;
  onTheRadioButton: Locator;
  recurrenceDatePicker: Locator;
  customParticipationRadio: Locator;
  participationWindowDropdown: Locator;
  startDatePicker: Locator;
  endDatePicker: Locator;
  firstSurveyManageButton: Locator;

  constructor(page: Page) {
    this.page = page;
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
  }

  async clickPulseSurvey() {
    await this.pulseSurveyOption.waitFor({ state: 'visible' });
    await this.pulseSurveyOption.check();
  }

  async selectFrequency(frequency: string) {
    await this.frequencyDropdown.waitFor({ state: 'visible' });
    await this.frequencyDropdown.click();
    // Wait for overlays to disappear if present
    const overlay = this.page.locator('div[style*="pointer-events: auto"]');
    if (await overlay.isVisible()) {
      await overlay.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }
    // Click the option with the given label
    const option = this.page.getByRole('option', { name: frequency });
    if (await option.isVisible()) {
      await option.click();
    } else {
      // Fallback: try to click a text element if not a real <option>
      await this.page.getByText(frequency, { exact: false }).click({ force: true });
    }
  }

  async clickOnTheRadioButton() {
    await this.onTheRadioButton.waitFor({ state: 'visible' });
    await this.onTheRadioButton.check();
  }

  async selectCurrentRecurrenceDate() {
    await this.recurrenceDatePicker.waitFor({ state: 'visible' });
    // Get today's date and format as '25th', '1st', etc.
    const today = new Date().getDate();
    let suffix = 'th';
    if (today === 1 || today === 21 || today === 31) suffix = 'st';
    else if (today === 2 || today === 22) suffix = 'nd';
    else if (today === 3 || today === 23) suffix = 'rd';
    const optionLabel = `${today}${suffix}`;
    await this.recurrenceDatePicker.selectOption({ label: optionLabel });
  }

  async selectCustomParticipationWindow(days: string) {
    await this.customParticipationRadio.waitFor({ state: 'visible' });
    await this.customParticipationRadio.check();
    await this.participationWindowDropdown.waitFor({ state: 'visible' });
    const optionText = days === '1' ? '1 day' : `${days} days`;
    await this.participationWindowDropdown.selectOption({ label: optionText });
  }

  async selectStartDateAfterMonths(months: number) {
    await this.startDatePicker.waitFor({ state: 'visible' });
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + months);
    const year = startDate.getFullYear();
    const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
    const day = startDate.getDate().toString().padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    await this.startDatePicker.fill(dateString);
  }

  async selectEndDateFromMenu(menuItemName: string): Promise<void> {
    await this.page.locator('.css-19bb58m').click();
    await this.page.getByRole('menuitem', { name: menuItemName }).click();
  }

  async selectEndDateAfterDays(days: number, menuItemName?: string) {
    if (menuItemName) {
      await this.selectEndDateFromMenu(menuItemName);
    }
    // Only try to fill if the input is enabled
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
      const dayDropdown = this.page
        .getByLabel('Recurrence day', { exact: false })
        .or(this.page.getByTestId('recurrence-day'));
      await dayDropdown.waitFor({ state: 'visible' });
      await dayDropdown.selectOption({ label: dayName });
    } else {
      const today = new Date();
      const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' });
      const dayDropdown = this.page
        .getByLabel('Recurrence day', { exact: false })
        .or(this.page.getByTestId('recurrence-day'));
      await dayDropdown.waitFor({ state: 'visible' });
      await dayDropdown.selectOption({ label: dayOfWeek });
    }
  }

  async selectSite(siteName: string) {
    const browseSitesButton = this.page.getByRole('button', { name: /Browse Sites|Browse/i });
    await browseSitesButton.click();
    const siteSearchTextbox = this.page.getByRole('textbox', { name: /Search sites|Search…/i });
    await siteSearchTextbox.fill(siteName);
    await siteSearchTextbox.press('Enter');
    const siteCheckbox = this.page.getByLabel(siteName).getByRole('checkbox');
    await siteCheckbox.check();
    const doneButton = this.page.getByRole('button', { name: 'Done' });
    await doneButton.click();
  }

  async selectAudience(audienceName: string) {
    // Open audience selection, search, and select the audience
    const browseAudiencesButton = this.page.getByRole('button', { name: /Browse/i });
    await browseAudiencesButton.click();
    const searchTextbox = this.page.getByRole('textbox', { name: /Search…/i });
    await searchTextbox.fill(audienceName);
    await searchTextbox.press('Enter');
    const audienceCheckbox = this.page.getByLabel(audienceName).getByRole('checkbox');
    await audienceCheckbox.check();
    const doneButton = this.page.getByRole('button', { name: 'Done' });
    await doneButton.click();
  }

  async searchSurvey(surveyName: string) {
    // Search for a survey by name
    const searchField = this.page.getByRole('textbox', { name: /search/i });
    await searchField.fill(surveyName);
    await searchField.press('Enter');
  }

  async openFirstSurveyMenu(timeout: number = 5000) {
    // Open the three-dot menu for the first survey in the list, with timeout
    const firstSurveyMenuButton = this.page.getByRole('button', { name: /more|menu|three dot|⋮/i }).first();
    await firstSurveyMenuButton.waitFor({ state: 'visible', timeout });
    await firstSurveyMenuButton.click();
  }

  async deleteSurvey() {
    // Click delete and confirm
    const deleteButton = this.page.getByRole('menuitem', { name: /delete/i });
    await deleteButton.click();
    const confirmDeleteButton = this.page.getByRole('button', { name: /delete|confirm/i });
    await confirmDeleteButton.click();
  }

  async verifyNoResultsMessage() {
    // Verify the 'No results' message is visible
    await this.page.getByText(/no results/i).waitFor({ state: 'visible' });
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

    // Recurrence
    const recurrenceLabel = this.page.locator('label', { hasText: 'Recurrence date' });
    if ((await recurrenceLabel.count()) > 0 && (await recurrenceLabel.isVisible())) {
      await this.page.getByLabel('Recurrence date').selectOption(recurrenceDate);
    }

    // Participation
    await this.page.getByTestId('field-Participation window').getByRole('radio', { name: 'Custom' }).check();

    await this.page.getByLabel('Participation window', { exact: true }).selectOption(participationWindow);

    await this.page.getByRole('radio', { name: 'Schedule date and time' }).check();

    // 👉 OPEN DROPDOWN
    const dropdown = this.page.locator('.css-19bb58m');
    await dropdown.click();

    // 👉 MENU PANEL (MUIs use portals)
    const menuPanel = this.page
      .locator('[role="presentation"], [role="listbox"], .MuiPaper-root')
      .filter({ has: this.page.locator('[role="menuitem"]') });

    await menuPanel.waitFor({ state: 'visible', timeout: 5000 });

    const menuItems = menuPanel.locator('[role="menuitem"]');

    // Wait for items to load (dynamic)
    await this.page.waitForFunction(count => count > 0, await menuItems.count(), { timeout: 5000 });

    // Calculate correct index (1-based → 0-based)
    let index = Number(sendDateMenuName) - 1;
    if (isNaN(index) || index < 0) index = 0;

    const itemCount = await menuItems.count();
    const finalIndex = Math.min(index, itemCount - 1);

    // 👉 FORCE SCROLL INTO VIEW
    await menuItems.nth(finalIndex).scrollIntoViewIfNeeded();

    // 👉 CLICK USING FORCE (MUI sometimes overlays invisible divs)
    await menuItems.nth(finalIndex).click({ force: true });

    // 👉 WAIT UNTIL DROPDOWN TEXT CHANGES
    await this.page.waitForTimeout(800);

    // END DATE
    const endDateRadio = this.page.getByRole('radio', { name: endDateRadioName });
    await endDateRadio.waitFor({ state: 'visible', timeout: 5000 });
    await endDateRadio.check();

    await this.page.getByRole('button', { name: endDateButtonName }).click();
    await this.selectFirstEnabledDate();
    await this.page.keyboard.press('Escape');

    const nextBtn = this.page.locator('button[type="submit"]:has-text("Next")');
    await nextBtn.waitFor({ state: 'visible' });
  }

  private async selectFirstEnabledDate() {
    // 1️⃣ Get all visible & enabled dates inside the month
    const enabledDates = this.page.locator(`button[role="gridcell"][name="day"]:not([disabled]):not(.rdp-day_outside)`);

    // 2️⃣ Click the first visible enabled date
    const count = await enabledDates.count();

    if (count === 0) {
      throw new Error('No enabled dates found in calendar!');
    }

    // Get text of first enabled date (just for debugging)
    const firstDateText = await enabledDates.nth(0).textContent();
    console.log('Clicking first enabled date:', firstDateText?.trim());

    await enabledDates.nth(0).click();
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
    await this.page.getByLabel('Recurrence date').selectOption(recurrenceDate);
    await this.page.getByTestId('field-Participation window').getByRole('radio', { name: 'Custom' }).check();
    await this.page.getByLabel('Participation window', { exact: true }).selectOption(participationWindow);
    await this.page.getByRole('radio', { name: 'Schedule date and time' }).check();
    await this.page.locator('.css-19bb58m').click();
    await this.page.getByRole('menuitem', { name: sendDateMenuName }).click();
    await this.page.getByText(endDateRadioName).click();
    // Click the label for 'Choose end date' after checking the radio
    await this.page.locator('label').filter({ hasText: endDateRadioName }).click();
    await this.page.getByRole('button', { name: endDateButtonName }).click();
    await this.page.getByRole('gridcell', { name: endDateGridCell, exact: true }).click();
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

  // Duplicates the first survey in the list
  async duplicateSurvey() {
    await this.openFirstSurveyMenu();
    const duplicateButton = this.page.getByRole('menuitem', { name: /duplicate/i });
    await duplicateButton.click();
    // Wait for duplication modal or confirmation
    await this.page.getByText(/duplicate survey|copy of/i).waitFor({ state: 'visible', timeout: 5000 });
  }

  // Unified configureSurvey method: opens menu and/or configures survey fields
  async configureSurvey(options?: { name?: string; audience?: string; dates?: any }) {
    // Always open the menu and click 'Configure' or 'Edit'
    await this.openFirstSurveyMenu();
    const configureBtn = this.page.getByRole('menuitem', { name: /configure|edit/i });
    await configureBtn.click();
    await this.page
      .getByText(/configure survey|edit survey|survey settings/i)
      .waitFor({ state: 'visible', timeout: 5000 });
    // If options are provided, fill in fields as needed
    if (options) {
      if (options.name) {
        const nameInput = this.page.getByRole('textbox', { name: /survey name|name/i });
        await nameInput.fill(options.name);
      }
      if (options.audience) {
        await this.selectAudience(options.audience);
      }
      if (options.dates) {
        await this.selectSurveyDates(options.dates);
      }
    }
  }

  // Applies a type filter in the survey list
  async applyTypeFilter(type: string) {
    const typeDropdown = this.page.getByLabel('Type', { exact: false });
    await typeDropdown.click();
    await this.page.getByRole('option', { name: type }).click();
    await this.page.waitForTimeout(500);
  }

  // Applies a status filter in the survey list
  async applyStatusFilter(status: string) {
    const statusDropdown = this.page.getByLabel('Status', { exact: false });
    await statusDropdown.click();
    await this.page.getByRole('option', { name: status }).click();
    await this.page.waitForTimeout(500);
  }

  // Pauses the first survey in the list
  async pauseSurvey() {
    await this.page.getByText('Pause', { exact: true }).waitFor({ state: 'visible', timeout: 15000 });
    await this.page.getByText('Pause', { exact: true }).click();
  }

  // Confirms the pause action in modal
  async confirmPauseSurvey() {
    await this.page.getByRole('button', { name: 'Pause' }).waitFor({ state: 'visible', timeout: 15000 });
    await this.page.getByRole('button', { name: 'Pause' }).click();
  }

  // Resets all survey filters
  async resetSurveyFilters() {
    const resetBtn = this.page.getByRole('button', { name: /reset filters|reset/i });
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      await this.page.waitForTimeout(500);
    }
  }

  // Applies a sort filter in the survey list
  async applySortFilter(sortOption: string) {
    const sortDropdown = this.page.getByLabel('Sort', { exact: false });
    await sortDropdown.click();
    await this.page.getByRole('option', { name: sortOption }).click();
    await this.page.waitForTimeout(500);
  }

  // Copies the survey link from the menu
  async copySurveyLink() {
    await this.openFirstSurveyMenu();
    const copyLinkBtn = this.page.getByRole('menuitem', { name: /copy link|get link/i });
    await copyLinkBtn.click();
  }

  // Verifies the 'Link copied' popup appears
  async verifyLinkCopiedPopup() {
    await this.page.getByText(/link copied/i).waitFor({ state: 'visible', timeout: 3000 });
  }

  // Opens a new tab and pastes the copied link
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

  // Edits the first survey in the list
  async editSurvey() {
    await this.openFirstSurveyMenu();
    const editBtn = this.page.getByRole('menuitem', { name: /edit/i });
    await editBtn.click();
    await this.page.getByText(/edit survey|survey settings/i).waitFor({ state: 'visible', timeout: 5000 });
  }

  // Verifies 'Not yet' and schedule date/time are not visible
  async verifyNotYetAndScheduleDateTimeNotVisible() {
    const notYet = this.page.getByText(/not yet/i);
    const scheduleDate = this.page.getByText(/schedule date|date and time/i);
    if (await notYet.isVisible()) throw new Error('Not yet is visible');
    if (await scheduleDate.isVisible()) throw new Error('Schedule date/time is visible');
  }

  async clickFirstSurveyManageButton(): Promise<void> {
    await test.step('Click first survey manage button', async () => {
      await this.firstSurveyManageButton.click();
      // Wait for the menu to be visible and stable before clicking anything else
      await this.page.waitForTimeout(1000); // Give time for menu to open and stabilize
    });
  }
}
