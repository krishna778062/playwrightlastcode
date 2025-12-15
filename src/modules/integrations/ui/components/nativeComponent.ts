import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

/**
 * Component for handling Native Tiles functionality (pages, events & albums)
 */
export class NativeTileComponent extends BaseComponent {
  readonly addContentTileButton: Locator;
  readonly eventsContentTypeButton: Locator;
  readonly googleCalendarRadioInModal: Locator;
  readonly outlookCalendarRadio: Locator;
  readonly calendarDropdownInput: Locator;
  readonly reactSelectInput: Locator;
  readonly calendarDropdownFirstOption: Locator;
  readonly tileTitleInput: Locator;
  readonly addToHomeButton: Locator;
  readonly eventsContentTypeRadio: Locator;
  readonly googleCalendarFromRadio: Locator;
  readonly calendarValueDisplay: Locator;
  readonly editModalHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.addContentTileButton = page.getByRole('button', { name: 'Add pages, events & albums' });
    this.eventsContentTypeButton = page.getByLabel('Add content tile').getByText('Events');
    this.googleCalendarRadioInModal = page.getByLabel('Add content tile').getByText('Google Calendar');
    this.outlookCalendarRadio = page.getByText('Outlook Calendar');
    this.calendarDropdownInput = page.locator('input[role="combobox"], input[id*="react-select"]').first();
    this.reactSelectInput = page.locator('#react-select-2-input');
    this.calendarDropdownFirstOption = page.locator('[role="option"], [id*="react-select"][id*="-option"]').first();
    this.tileTitleInput = page.getByRole('textbox', { name: 'Tile title' });
    this.addToHomeButton = page.getByRole('button', { name: 'Add to home' });
    this.eventsContentTypeRadio = page.locator('#options_type_event');
    this.googleCalendarFromRadio = page.locator('#options_siteFilter_googleCalendar');
    this.calendarValueDisplay = page.locator('.css-15bnrdl-singleValue').first();
    this.editModalHeading = page.getByRole('heading', { name: 'Edit Latest & popular tile' });
  }

  /**
   * Click on "Add pages, events & albums" button
   */
  async clickAddContentTileButton(): Promise<void> {
    await test.step('Click Add pages, events & albums button', async () => {
      await this.clickOnElement(this.addContentTileButton, { timeout: 30_000 });
    });
  }

  /**
   * Select Events content type
   */
  async selectEventsContentType(): Promise<void> {
    await test.step('Select Events content type', async () => {
      await this.clickOnElement(this.eventsContentTypeButton, { timeout: 30_000 });
    });
  }

  /**
   * Select Google Calendar radio option
   */
  async selectGoogleCalendar(): Promise<void> {
    await test.step('Select Google Calendar', async () => {
      await this.clickOnElement(this.googleCalendarRadioInModal, { timeout: 30_000 });
    });
  }

  /**
   * Select Outlook Calendar radio option
   */
  async selectOutlookCalendar(): Promise<void> {
    await test.step('Select Outlook Calendar', async () => {
      await this.clickOnElement(this.outlookCalendarRadio, { timeout: 30_000 });
    });
  }

  /**
   * Select calendar from dropdown by email/name
   */
  async selectCalendarFromDropdown(calendarEmail: string): Promise<void> {
    await test.step(`Select calendar: ${calendarEmail}`, async () => {
      await this.clickOnElement(this.reactSelectInput, { timeout: 30_000 });
      const calendarEmailOption = this.page.getByText(calendarEmail, { exact: true });
      await this.clickOnElement(calendarEmailOption, { timeout: 30_000 });
    });
  }

  /**
   * Select first available calendar from dropdown
   */
  async selectFirstAvailableCalendar(): Promise<void> {
    await test.step('Select first available calendar', async () => {
      await this.calendarDropdownInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.clickOnElement(this.calendarDropdownInput, { timeout: 30_000 });

      await this.calendarDropdownFirstOption.waitFor({ state: 'visible', timeout: 10000 });
      await this.clickOnElement(this.calendarDropdownFirstOption, { timeout: 30_000 });
    });
  }

  /**
   * Select calendar type (Google Calendar or Outlook Calendar)
   * @param calendarType - The calendar type string from test
   */
  async selectCalendarType(calendarType: string): Promise<void> {
    await test.step(`Select calendar type: ${calendarType}`, async () => {
      if (calendarType === 'Google Calendar') {
        await this.selectGoogleCalendar();
      } else if (calendarType === 'Outlook Calendar') {
        await this.selectOutlookCalendar();
      } else {
        throw new Error(`Unsupported calendar type: "${calendarType}". Use 'Google Calendar' or 'Outlook Calendar'`);
      }
    });
  }

  /**
   * Set tile title
   */
  async setTileTitle(tileTitle: string): Promise<void> {
    await test.step(`Set tile title: ${tileTitle}`, async () => {
      await this.tileTitleInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.tileTitleInput.clear();
      await this.fillInElement(this.tileTitleInput, tileTitle);
    });
  }

  /**
   * Click Add to home button
   */
  async clickAddToHome(): Promise<void> {
    await test.step('Click Add to home button', async () => {
      await this.clickOnElement(this.addToHomeButton, { timeout: 30_000 });
    });
  }

  /**
   * Verify tile title in edit modal
   */
  async verifyTileTitle(expectedTitle: string): Promise<void> {
    await test.step(`Verify tile title is: ${expectedTitle}`, async () => {
      await this.tileTitleInput.waitFor({ state: 'visible', timeout: 10000 });
      const actualValue = await this.tileTitleInput.inputValue();
      expect(actualValue, `Expected tile title to be "${expectedTitle}"`).toBe(expectedTitle);
    });
  }

  /**
   * Verify Events content type is selected
   */
  async verifyEventsContentTypeSelected(): Promise<void> {
    await test.step('Verify Events content type is selected', async () => {
      await expect(this.eventsContentTypeRadio, 'Expected Events content type to be checked').toBeChecked();
    });
  }

  /**
   * Verify Google Calendar is selected in From section
   */
  async verifyGoogleCalendarSelected(): Promise<void> {
    await test.step('Verify Google Calendar is selected', async () => {
      await expect(this.googleCalendarFromRadio, 'Expected Google Calendar to be checked').toBeChecked();
    });
  }

  /**
   * Verify calendar email in dropdown
   */
  async verifyCalendarEmail(expectedEmail: string): Promise<void> {
    await test.step(`Verify calendar email is: ${expectedEmail}`, async () => {
      await this.calendarValueDisplay.waitFor({ state: 'visible', timeout: 10000 });
      const actualValue = await this.calendarValueDisplay.textContent();
      expect(actualValue?.trim(), `Expected calendar email to be "${expectedEmail}"`).toBe(expectedEmail);
    });
  }

  /**
   * Verify edit modal is opened with correct heading
   */
  async verifyEditModalOpened(): Promise<void> {
    await test.step('Verify edit modal is opened', async () => {
      await expect(this.editModalHeading, 'Expected edit modal heading to be visible').toBeVisible({ timeout: 10000 });
    });
  }
}
