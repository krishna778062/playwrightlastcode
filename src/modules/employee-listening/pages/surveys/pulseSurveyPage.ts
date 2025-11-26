import test, { Locator, Page } from '@playwright/test';

import { SURVEY_QUESTION_BANK } from '../../test-data/surveyQuestions';

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
  }

  async clickPulseSurvey() {
    await this.pulseSurveyOption.waitFor({ state: 'visible' });
    await this.pulseSurveyOption.check();
  }

  async selectFrequency(frequency: string) {
    await this.frequencyDropdown.waitFor({ state: 'visible' });
    await this.frequencyDropdown.click();
    const overlay = this.page.locator('div[style*="pointer-events: auto"]');
    if (await overlay.isVisible()) {
      await overlay.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }
    const option = this.page.getByRole('option', { name: frequency });
    if (await option.isVisible()) {
      await option.click();
    } else {
      await this.page.getByText(frequency, { exact: false }).click({ force: true });
    }
  }

  async clickOnTheRadioButton() {
    await this.onTheRadioButton.waitFor({ state: 'visible' });
    await this.onTheRadioButton.check();
  }

  async selectCurrentRecurrenceDate() {
    await this.recurrenceDatePicker.waitFor({ state: 'visible' });
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
    const searchField = this.page.getByRole('textbox', { name: /search/i });
    await searchField.fill(surveyName);
    await searchField.press('Enter');
  }

  async openFirstSurveyMenu(timeout: number = 5000) {
    const firstSurveyMenuButton = this.page.getByRole('button', { name: /more|menu|three dot|⋮/i }).first();
    await firstSurveyMenuButton.waitFor({ state: 'visible', timeout });
    await firstSurveyMenuButton.click();
  }

  async deleteSurvey() {
    const deleteButton = this.page.getByRole('menuitem', { name: /delete/i });
    await deleteButton.click();
    const confirmDeleteButton = this.page.getByRole('button', { name: /delete|confirm/i });
    await confirmDeleteButton.click();
  }

  async verifyNoResultsMessage() {
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

    const recurrenceLabel = this.page.locator('label', { hasText: 'Recurrence date' });
    if ((await recurrenceLabel.count()) > 0 && (await recurrenceLabel.isVisible())) {
      await this.page.getByLabel('Recurrence date').selectOption(recurrenceDate);
    }

    await this.page.getByTestId('field-Participation window').getByRole('radio', { name: 'Custom' }).check();

    await this.page.getByLabel('Participation window', { exact: true }).selectOption(participationWindow);

    await this.page.getByRole('radio', { name: 'Schedule date and time' }).check();

    const dropdown = this.page.locator('.css-19bb58m');
    await dropdown.click();

    const menuPanel = this.page
      .locator('[role="presentation"], [role="listbox"], .MuiPaper-root')
      .filter({ has: this.page.locator('[role="menuitem"]') });

    await menuPanel.waitFor({ state: 'visible', timeout: 5000 });

    const menuItems = menuPanel.locator('[role="menuitem"]');

    await this.page.waitForFunction(count => count > 0, await menuItems.count(), { timeout: 5000 });

    let index = Number(sendDateMenuName) - 1;
    if (isNaN(index) || index < 0) index = 0;

    const itemCount = await menuItems.count();
    const finalIndex = Math.min(index, itemCount - 1);

    await menuItems.nth(finalIndex).scrollIntoViewIfNeeded();

    await menuItems.nth(finalIndex).click({ force: true });

    await this.page.waitForTimeout(800);

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
    const enabledDates = this.page.locator(`button[role="gridcell"][name="day"]:not([disabled]):not(.rdp-day_outside)`);

    const count = await enabledDates.count();

    if (count === 0) {
      throw new Error('No enabled dates found in calendar!');
    }

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

  async duplicateSurvey() {
    await this.openFirstSurveyMenu();
    const duplicateButton = this.page.getByRole('menuitem', { name: /duplicate/i });
    await duplicateButton.click();
    await this.page.getByText(/duplicate survey|copy of/i).waitFor({ state: 'visible', timeout: 5000 });
  }

  async configureSurvey(options?: { name?: string; audience?: string; dates?: any }) {
    const configureBtn = this.page.getByRole('menuitem', { name: /configure|edit/i });
    await configureBtn.click();
    await this.page
      .getByText(/configure survey|edit survey|survey settings/i)
      .waitFor({ state: 'visible', timeout: 5000 });
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

  async applyTypeFilter(type: string) {
    const typeDropdown = this.page.getByLabel('Type', { exact: false });
    await typeDropdown.click();
    await this.page.getByRole('option', { name: type }).click();
    await this.page.waitForTimeout(500);
  }

  async applyStatusFilter(status: string) {
    const statusDropdown = this.page.getByLabel('Status', { exact: false });
    await statusDropdown.click();
    await this.page.getByRole('option', { name: status }).click();
    await this.page.waitForTimeout(500);
  }

  async applySortFilter(sortOption: string) {
    let sortDropdown: Locator;
    if (
      await this.page
        .getByLabel('Sort', { exact: false })
        .isVisible({ timeout: 3000 })
        .catch(() => false)
    ) {
      sortDropdown = this.page.getByLabel('Sort', { exact: false });
    } else {
      sortDropdown = this.page.getByRole('button', { name: /Sort/i });
    }
    await sortDropdown.click();
    let optionLocator = this.page.getByRole('option', { name: sortOption });
    if (!(await optionLocator.isVisible({ timeout: 3000 }).catch(() => false))) {
      optionLocator = this.page.getByRole('menuitem', { name: sortOption });
    }
    await optionLocator.click();
    await this.page.waitForTimeout(500);
  }

  async pauseSurvey() {
    await this.page.getByText('Pause', { exact: true }).waitFor({ state: 'visible', timeout: 15000 });
    await this.page.getByText('Pause', { exact: true }).click();
  }

  async confirmPauseSurvey() {
    await this.page.getByRole('button', { name: 'Pause' }).waitFor({ state: 'visible', timeout: 15000 });
    await this.page.getByRole('button', { name: 'Pause' }).click();
  }

  async resetSurveyFilters() {
    const resetBtn = this.page.getByRole('button', { name: /reset filters|reset/i });
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      await this.page.waitForTimeout(500);
    }
  }

  async copySurveyLink() {
    const menuPanel = this.page.getByRole('menu', { name: 'manage survey' });
    await menuPanel.waitFor({ state: 'visible', timeout: 3000 });
    let copyLinkBtn = this.page.getByRole('menuitem', { name: /copy link|get link/i });
    if (!(await copyLinkBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
      if (
        await this.page
          .getByText('Copy link to survey')
          .isVisible({ timeout: 3000 })
          .catch(() => false)
      ) {
        copyLinkBtn = this.page.getByText('Copy link to survey');
      } else {
        const regex = /copy.*link/i;
        if (
          await this.page
            .getByText(regex)
            .isVisible({ timeout: 3000 })
            .catch(() => false)
        ) {
          copyLinkBtn = this.page.getByText(regex);
        } else {
          const menuItems = this.page.locator('[role="menuitem"]');
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
  }

  async verifyLinkCopiedPopup() {
    await this.page.getByText('Link copied to clipboard').waitFor({ state: 'visible', timeout: 10000 });
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
    await this.page.getByRole('menu', { name: 'manage survey' }).waitFor({ state: 'visible', timeout: 3000 });
    let copyLinkBtn = this.page.getByRole('menuitem', { name: /copy link|get link/i });
    if (!(await copyLinkBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
      if (
        await this.page
          .getByText('Copy link to survey')
          .isVisible({ timeout: 3000 })
          .catch(() => false)
      ) {
        copyLinkBtn = this.page.getByText('Copy link to survey');
      } else {
        const regex = /copy.*link/i;
        if (
          await this.page
            .getByText(regex)
            .isVisible({ timeout: 3000 })
            .catch(() => false)
        ) {
          copyLinkBtn = this.page.getByText(regex);
        } else {
          const menuItems = this.page.locator('[role="menuitem"]');
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
    const copiedLink = await this.copySurveyLinkAndOpenInNewTab();
    this.expect(copiedLink).toMatch(
      /https:\/\/simpplr\.link\/d\/e\/el-abac\.qa\.simpplr\.xyz\/surveys\/participation\/[\w-]+\?source=link_copy/
    );
    await this.openNewTabAndPasteLink();
  }

  async editSurvey() {
    await this.openFirstSurveyMenu();
    const editBtn = this.page.getByRole('menuitem', { name: 'Edit' });
    await editBtn.waitFor({ state: 'visible', timeout: 15000 });
    await editBtn.click();
    await this.page.getByText(/edit survey|survey settings/i).waitFor({ state: 'visible', timeout: 5000 });
  }

  async verifyNotYetAndScheduleDateTimeNotVisible() {
    const notYet = this.page.getByText(/not yet/i);
    const scheduleDate = this.page.getByText(/schedule date|date and time/i);
    if (await notYet.isVisible()) throw new Error('Not yet is visible');
    if (await scheduleDate.isVisible()) throw new Error('Schedule date/time is visible');
  }

  async clickFirstSurveyManageButton(): Promise<void> {
    await test.step('Click first survey manage button', async () => {
      await this.firstSurveyManageButton.click();
      await this.page.waitForTimeout(2000);
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.pulseSurveyOption.waitFor({ state: 'visible', timeout: 10000 });
  }

  async verifySurveyDeletedMessage() {
    await this.page.getByText('Survey deleted successfully').waitFor({ state: 'visible', timeout: 5000 });
  }

  async verifySurveyDraftSavedMessage() {
    await this.page.getByText('Survey draft was saved').waitFor({ state: 'visible', timeout: 5000 });
  }

  async clickSaveButton() {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async waitForSurveysPageLoad(timeout: number = 5000) {
    await this.page.waitForTimeout(timeout);
  }

  async pressEscape() {
    await this.page.keyboard.press('Escape');
  }
}
