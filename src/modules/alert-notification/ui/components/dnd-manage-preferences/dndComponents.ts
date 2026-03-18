import { POPUP_BUTTONS } from '@alert-notification-constants/popupButtons';
import { Locator, Page, test } from '@playwright/test';

import { DND_PAGE_TEXT, MY_SETTINGS_PAGE_TEXT } from '../../../tests/test-data/dnd-manage-preferences.test-data';
import { CommonActionsComponent } from '../commonActionsComponent';

import { BaseComponent } from '@/src/core';
import { TIMEOUTS } from '@/src/core/constants/timeouts';

/**
 * DND page component (Defaults → Do not disturb).
 * Holds locators and behaviour for the app-level DND page: All organization toggle,
 * Select source, Work days, Work hours, User editable, and confirm dialog.
 */
export class DndPageComponent extends BaseComponent {
  private readonly commonActionsComponent: CommonActionsComponent;

  readonly doNotDisturbTab: Locator;
  readonly allOrganizationToggle: Locator;
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
  readonly workHoursStartSelect: Locator;
  readonly workHoursEndSelect: Locator;
  readonly confirmDisableDndDialogBody: Locator;
  readonly confirmDisableDndConfirmButton: Locator;
  readonly workDayMondayCheckbox: Locator;
  readonly workDayTuesdayCheckbox: Locator;
  readonly workDayWednesdayCheckbox: Locator;
  readonly workDayThursdayCheckbox: Locator;
  readonly workDayFridayCheckbox: Locator;
  readonly workDaySaturdayCheckbox: Locator;
  readonly workDaySundayCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    this.commonActionsComponent = new CommonActionsComponent(page);

    this.doNotDisturbTab = page.getByRole('tab', { name: DND_PAGE_TEXT.SIDEBAR_MENU.DO_NOT_DISTURB });
    this.allOrganizationToggle = page.getByRole('switch').first();
    this.selectSourceLabel = page.getByText(DND_PAGE_TEXT.SELECT_SOURCE.LABEL, { exact: false }).first();
    this.ukgSourceOption = page.getByTestId(DND_PAGE_TEXT.SELECT_SOURCE.SOURCES.UKG);
    this.manualSourceOption = page.getByTestId(DND_PAGE_TEXT.SELECT_SOURCE.SOURCES.MANUAL);
    this.workDaysSectionLabel = page.getByText(DND_PAGE_TEXT.WORK_DAYS.LABEL, { exact: false }).first();
    this.workHoursSectionLabel = page.getByText(DND_PAGE_TEXT.WORK_HOURS.LABEL, { exact: false }).first();
    this.workHoursStartTimeField = page.getByTestId(`field-${DND_PAGE_TEXT.WORK_HOURS.START_TIME_LABEL}`);
    this.workHoursEndTimeField = page.getByTestId(`field-${DND_PAGE_TEXT.WORK_HOURS.END_TIME_LABEL}`);
    this.workHoursHelperText = page.getByText(DND_PAGE_TEXT.WORK_HOURS.HELPER_TEXT, { exact: false });
    this.userEditableCheckbox = page.getByRole('checkbox', { name: DND_PAGE_TEXT.USER_EDITABLE.LABEL });
    this.userEditableHelperText = page.getByText(DND_PAGE_TEXT.USER_EDITABLE.HELPER_TEXT, { exact: false });
    this.workHoursStartSelect = this.workHoursStartTimeField.getByTestId('SelectInput');
    this.workHoursEndSelect = this.workHoursEndTimeField.getByTestId('SelectInput');
    this.confirmDisableDndDialogBody = page.getByText(DND_PAGE_TEXT.CONFIRM_DISABLE_DND.BODY, { exact: true });
    this.confirmDisableDndConfirmButton = this.confirmDisableDndDialogBody
      .locator('xpath=ancestor::div[@role="dialog" or @role="alertdialog"][1]')
      .getByRole('button', { name: POPUP_BUTTONS.CONFIRM });
    const workDayOptions = DND_PAGE_TEXT.WORK_DAYS.OPTIONS;
    this.workDayMondayCheckbox = page.getByRole('checkbox', { name: workDayOptions[0] });
    this.workDayTuesdayCheckbox = page.getByRole('checkbox', { name: workDayOptions[1] });
    this.workDayWednesdayCheckbox = page.getByRole('checkbox', { name: workDayOptions[2] });
    this.workDayThursdayCheckbox = page.getByRole('checkbox', { name: workDayOptions[3] });
    this.workDayFridayCheckbox = page.getByRole('checkbox', { name: workDayOptions[4] });
    this.workDaySaturdayCheckbox = page.getByRole('checkbox', { name: workDayOptions[5] });
    this.workDaySundayCheckbox = page.getByRole('checkbox', { name: workDayOptions[6] });
  }

  private getWorkDayCheckbox(day: string): Locator {
    const locators = [
      this.workDayMondayCheckbox,
      this.workDayTuesdayCheckbox,
      this.workDayWednesdayCheckbox,
      this.workDayThursdayCheckbox,
      this.workDayFridayCheckbox,
      this.workDaySaturdayCheckbox,
      this.workDaySundayCheckbox,
    ];
    const index = DND_PAGE_TEXT.WORK_DAYS.OPTIONS.findIndex(d => d.toLowerCase() === day.toLowerCase());
    return index >= 0 ? locators[index] : this.page.getByRole('checkbox', { name: new RegExp(day, 'i') });
  }

  async verifyDoNotDisturbTabIsVisible(): Promise<void> {
    await test.step('Verify Do not disturb tab is visible in sidebar', async () => {
      await this.verifier.verifyTheElementIsVisible(this.doNotDisturbTab, {
        assertionMessage: 'Do not disturb tab should be visible',
        timeout: 20_000,
      });
    });
  }

  async verifyDndPageAllTextElementsAfterDNDTabClick(): Promise<void> {
    await this.commonActionsComponent.verifyTextIsVisible(DND_PAGE_TEXT.HEADING);
    await this.commonActionsComponent.verifyTextIsVisible(DND_PAGE_TEXT.DESCRIPTION_LINE_1, { exact: false });
    await this.commonActionsComponent.verifyTextIsVisible(DND_PAGE_TEXT.DESCRIPTION_LINE_2, { exact: false });
    await this.commonActionsComponent.verifyLinkIsVisible(DND_PAGE_TEXT.MANAGE_PREFERENCES_BUTTON);
    await this.commonActionsComponent.verifyHeadingIsVisible(DND_PAGE_TEXT.ALL_ORGANIZATION.LABEL);
    await this.commonActionsComponent.verifyTextIsVisible(DND_PAGE_TEXT.ALL_ORGANIZATION.HELPER_TEXT, {
      exact: false,
    });
    await this.commonActionsComponent.verifyHeadingIsVisible(DND_PAGE_TEXT.AUDIENCE.LABEL);
    await this.commonActionsComponent.verifyTextIsVisible(DND_PAGE_TEXT.AUDIENCE.HELPER_TEXT, { exact: false });
  }

  async checkAllOrganizationToggleEnabled(): Promise<boolean> {
    return this.isAllOrganizationToggleEnabled();
  }

  async isAllOrganizationToggleEnabled(): Promise<boolean> {
    return test.step('Get All organization toggle state', async () => {
      await this.allOrganizationToggle.waitFor({ state: 'visible', timeout: 10_000 });
      const ariaChecked = await this.allOrganizationToggle.getAttribute('aria-checked');
      return ariaChecked === 'true';
    });
  }

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

  async verifyAllOrganizationToggleIsOnOrOff(expectedState: 'on' | 'off'): Promise<void> {
    await test.step(`Verify "All organization" toggle is ${expectedState.toUpperCase()}`, async () => {
      await this.allOrganizationToggle.waitFor({ state: 'visible', timeout: 10_000 });
      const ariaChecked = await this.allOrganizationToggle.getAttribute('aria-checked');
      const isOn = ariaChecked === 'true';
      const expectedOn = expectedState === 'on';
      test.expect(isOn, `"All organization" toggle should be ${expectedOn ? 'enabled' : 'disabled'}`).toBe(expectedOn);
    });
  }

  async verifySelectSourceSectionIsVisible(): Promise<void> {
    return this.verifySelectSourceSection();
  }

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
      const ukgCount = await this.ukgSourceOption.count();
      test.expect(ukgCount, '"UKG" source option should not be present in the UI anymore').toBe(0);
    });
  }

  async selectSourceOptionAs(source: 'UKG' | 'Manual'): Promise<void> {
    return this.selectSourceOption(source);
  }

  async selectSourceOption(source: 'UKG' | 'Manual'): Promise<void> {
    await test.step(`Select "${source}" as source`, async () => {
      const targetButton = source === 'UKG' ? this.ukgSourceOption : this.manualSourceOption;
      await this.clickOnElement(targetButton);
    });
  }

  async verifyWorkDaysSectionAndOptionsAreVisible(): Promise<void> {
    return this.verifyWorkDaysSectionAndOptions();
  }

  async verifyWorkDaysSectionAndOptions(): Promise<void> {
    await test.step('Verify "Work days" section and all day options', async () => {
      await this.verifier.verifyTheElementIsVisible(this.workDaysSectionLabel, {
        assertionMessage: '"Work days" section should be visible',
        timeout: 5_000,
      });
      for (const day of DND_PAGE_TEXT.WORK_DAYS.OPTIONS) {
        const dayCheckbox = this.getWorkDayCheckbox(day);
        await this.verifier.verifyTheElementIsVisible(dayCheckbox, {
          assertionMessage: `"${day}" checkbox should be visible`,
          timeout: 5_000,
        });
      }
    });
  }

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
   * Sets the "User editable" (Allow override by users) checkbox.
   * When unchecked, profile-level DND settings are read-only and reflect app-level settings.
   */
  async setUserEditable(enabled: boolean): Promise<void> {
    return this.commonActionsComponent.setCheckboxByName(DND_PAGE_TEXT.USER_EDITABLE.LABEL, enabled);
  }

  async selectWorkDaysAs(days: string[]): Promise<void> {
    return this.selectWorkDays(days);
  }

  /**
   * Selects (checks) the given work days. Uses shared checkbox helpers from CommonActionsComponent.
   */
  async selectWorkDays(days: string[]): Promise<void> {
    await test.step(`Select work days: ${days.join(', ')}`, async () => {
      await this.commonActionsComponent.checkCheckboxesByNames(days);
    });
  }

  async confirmDisableAllOrganizationDnd(): Promise<void> {
    await test.step('Confirm disabling DND for "All Organization"', async () => {
      await this.verifier.verifyTheElementIsVisible(this.confirmDisableDndDialogBody, {
        assertionMessage: 'Disable DND confirmation dialog should be visible',
        timeout: 10_000,
      });
      await this.clickOnElement(this.confirmDisableDndConfirmButton);
    });
  }

  async setWorkHours(startTime: string, endTime: string): Promise<void> {
    await test.step(`Set work hours from ${startTime} to ${endTime}`, async () => {
      await this.workHoursStartSelect.selectOption(startTime);
      await this.workHoursEndSelect.selectOption(endTime);
    });
  }

  /**
   * Fills work days and work hours in one call. Use when the DND page is already open
   * with "Manual" source selected (Work days and Work hours sections visible).
   * Reusable across tests wherever DND days and time need to be set.
   */
  async fillDndWorkDaysAndHours(days: string[], startTime: string, endTime: string): Promise<void> {
    await test.step(`Fill DND work days (${days.join(', ')}) and work hours (${startTime}–${endTime})`, async () => {
      await this.selectWorkDays(days);
      await this.setWorkHours(startTime, endTime);
    });
  }

  /**
   * Disables "All organization" DND: turns the toggle OFF and confirms the dialog.
   * Does not save; call the page's save and verify toast after this if needed.
   */
  async disableAllOrganizationDnd(): Promise<void> {
    await test.step('Disable All organization DND (toggle off and confirm)', async () => {
      await this.setAllOrganizationToggle(false);
      await this.confirmDisableAllOrganizationDnd();
    });
  }
}

/**
 * Profile DND component (My Settings → Notifications → Do not disturb).
 * Holds locators and behaviour for the profile-level DND page: work days, work hours,
 * read-only checks, and DND tab visibility at profile level.
 */
export class ProfileDndComponent extends BaseComponent {
  private readonly commonActionsComponent: CommonActionsComponent;

  readonly browserTab: Locator;
  readonly profileSettingsButton: Locator;
  readonly mySettingsMenuItem: Locator;
  readonly profileDndLink: Locator;
  readonly profileDndHeading: Locator;
  readonly profileWorkHoursStartSelect: Locator;
  readonly profileWorkHoursEndSelect: Locator;
  readonly profileSaveButton: Locator;
  readonly profileWorkDayMondayCheckbox: Locator;
  readonly profileWorkDayTuesdayCheckbox: Locator;
  readonly profileWorkDayWednesdayCheckbox: Locator;
  readonly profileWorkDayThursdayCheckbox: Locator;
  readonly profileWorkDayFridayCheckbox: Locator;
  readonly profileWorkDaySaturdayCheckbox: Locator;
  readonly profileWorkDaySundayCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    this.commonActionsComponent = new CommonActionsComponent(page);
    this.browserTab = page
      .getByRole('link', { name: MY_SETTINGS_PAGE_TEXT.BROWSER_TAB })
      .or(page.getByRole('tab', { name: MY_SETTINGS_PAGE_TEXT.BROWSER_TAB }));
    this.profileSettingsButton = page.getByRole('button', { name: MY_SETTINGS_PAGE_TEXT.PROFILE_SETTINGS_BUTTON });
    this.mySettingsMenuItem = page.getByRole('menuitem', { name: MY_SETTINGS_PAGE_TEXT.MY_SETTINGS_MENU_ITEM });
    this.profileDndLink = page.getByRole('link', { name: DND_PAGE_TEXT.SIDEBAR_MENU.DO_NOT_DISTURB });
    this.profileDndHeading = page.getByText(DND_PAGE_TEXT.HEADING);
    this.profileWorkHoursStartSelect = page
      .getByTestId(`field-${DND_PAGE_TEXT.WORK_HOURS.START_TIME_LABEL}`)
      .getByTestId('SelectInput');
    this.profileWorkHoursEndSelect = page
      .getByTestId(`field-${DND_PAGE_TEXT.WORK_HOURS.END_TIME_LABEL}`)
      .getByTestId('SelectInput');
    this.profileSaveButton = page.getByRole('button', { name: DND_PAGE_TEXT.SAVE_BUTTON });
    const workDayOptions = DND_PAGE_TEXT.WORK_DAYS.OPTIONS;
    this.profileWorkDayMondayCheckbox = page
      .getByRole('checkbox', { name: new RegExp(workDayOptions[0], 'i') })
      .first();
    this.profileWorkDayTuesdayCheckbox = page
      .getByRole('checkbox', { name: new RegExp(workDayOptions[1], 'i') })
      .first();
    this.profileWorkDayWednesdayCheckbox = page
      .getByRole('checkbox', { name: new RegExp(workDayOptions[2], 'i') })
      .first();
    this.profileWorkDayThursdayCheckbox = page
      .getByRole('checkbox', { name: new RegExp(workDayOptions[3], 'i') })
      .first();
    this.profileWorkDayFridayCheckbox = page
      .getByRole('checkbox', { name: new RegExp(workDayOptions[4], 'i') })
      .first();
    this.profileWorkDaySaturdayCheckbox = page
      .getByRole('checkbox', { name: new RegExp(workDayOptions[5], 'i') })
      .first();
    this.profileWorkDaySundayCheckbox = page
      .getByRole('checkbox', { name: new RegExp(workDayOptions[6], 'i') })
      .first();
  }

  private getProfileWorkDayCheckbox(day: string): Locator {
    const locators = [
      this.profileWorkDayMondayCheckbox,
      this.profileWorkDayTuesdayCheckbox,
      this.profileWorkDayWednesdayCheckbox,
      this.profileWorkDayThursdayCheckbox,
      this.profileWorkDayFridayCheckbox,
      this.profileWorkDaySaturdayCheckbox,
      this.profileWorkDaySundayCheckbox,
    ];
    const index = DND_PAGE_TEXT.WORK_DAYS.OPTIONS.findIndex(d => d.toLowerCase() === day.toLowerCase());
    return index >= 0 ? locators[index] : this.page.getByRole('checkbox', { name: new RegExp(day, 'i') }).first();
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify My Settings Notifications page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.browserTab, {
        assertionMessage: 'My Settings Notifications page should be loaded',
      });
    });
  }

  /**
   * Navigates to "My settings → Notifications" for the currently logged-in user
   * using the profile menu in the header.
   */
  async navigateToCurrentUserNotificationSettings(): Promise<void> {
    await test.step('Navigate to My settings → Notifications', async () => {
      await this.profileSettingsButton.click();
      await this.mySettingsMenuItem.click();
      await this.verifyThePageIsLoaded();
    });
  }

  /**
   * Navigates to the profile DND page (My settings → Notifications → Do not disturb).
   */
  async navigateToProfileDndPage(): Promise<void> {
    await test.step('Navigate to profile DND settings (My settings → Notifications → Do not disturb)', async () => {
      await this.navigateToCurrentUserNotificationSettings();
      await this.profileDndLink.click();
      await this.profileDndHeading.waitFor({ state: 'visible', timeout: 10_000 });
    });
  }

  /**
   * Verifies the profile DND page shows the expected work days as checked (e.g. Monday–Friday).
   */
  async verifyProfileDndWorkDaysDisplay(expectedDays: readonly string[]): Promise<void> {
    await test.step(`Verify profile DND work days display as: ${expectedDays.join(', ')}`, async () => {
      for (const day of DND_PAGE_TEXT.WORK_DAYS.OPTIONS) {
        const dayCheckbox = this.getProfileWorkDayCheckbox(day);
        await dayCheckbox.waitFor({ state: 'visible', timeout: 5_000 });
        const isChecked = await dayCheckbox.isChecked();
        const expectedChecked = expectedDays.some(d => d.toLowerCase() === day.toLowerCase());
        test.expect(isChecked, `"${day}" should be ${expectedChecked ? 'checked' : 'unchecked'}`).toBe(expectedChecked);
      }
    });
  }

  /**
   * Verifies the profile DND page shows the expected work hours (e.g. "9:00 AM", "6:00 PM").
   */
  async verifyProfileDndWorkHoursDisplay(startTimeDisplay: string, endTimeDisplay: string): Promise<void> {
    await test.step(`Verify profile DND work hours display as ${startTimeDisplay} – ${endTimeDisplay}`, async () => {
      await this.profileWorkHoursStartSelect.waitFor({ state: 'visible', timeout: 5_000 });
      await this.profileWorkHoursEndSelect.waitFor({ state: 'visible', timeout: 5_000 });
      const startText = await this.profileWorkHoursStartSelect.evaluate(el => {
        const s = el as HTMLSelectElement;
        return s.selectedOptions.length > 0 ? String(s.selectedOptions[0].textContent).trim() : '';
      });
      const endText = await this.profileWorkHoursEndSelect.evaluate(el => {
        const s = el as HTMLSelectElement;
        return s.selectedOptions.length > 0 ? String(s.selectedOptions[0].textContent).trim() : '';
      });
      test.expect(startText, 'Work hours start time should match app-level setting').toBe(startTimeDisplay);
      test.expect(endText, 'Work hours end time should match app-level setting').toBe(endTimeDisplay);
    });
  }

  /**
   * Verifies that all DND fields on the profile page are read-only (disabled).
   */
  async verifyProfileDndFieldsAreReadOnly(): Promise<void> {
    await test.step('Verify profile DND fields are read-only', async () => {
      for (const day of DND_PAGE_TEXT.WORK_DAYS.OPTIONS) {
        const dayCheckbox = this.getProfileWorkDayCheckbox(day);
        await dayCheckbox.waitFor({ state: 'visible', timeout: 5_000 });
        const disabled = await dayCheckbox.isDisabled();
        test.expect(disabled, `"${day}" checkbox should be disabled (read-only)`).toBe(true);
      }
      await test.expect(this.profileWorkHoursStartSelect).toBeDisabled();
      await test.expect(this.profileWorkHoursEndSelect).toBeDisabled();
      const saveCount = await this.profileSaveButton.count();
      if (saveCount > 0 && (await this.profileSaveButton.first().isVisible())) {
        await test
          .expect(this.profileSaveButton.first(), 'Save button should be disabled when override is off')
          .toBeDisabled();
      }
    });
  }

  /**
   * Verifies that the "Do not disturb" tab is NOT visible on the
   * My settings → Notifications page (profile level).
   */
  async verifyDoNotDisturbTabIsNotVisible(): Promise<void> {
    await test.step('Verify "Do not disturb" tab is not visible at profile level', async () => {
      const isVisible = await this.verifier.isTheElementVisible(this.profileDndLink, {
        timeout: TIMEOUTS.VERY_VERY_SHORT,
      });

      test
        .expect(
          isVisible,
          '"Do not disturb" tab should NOT be visible at profile level when org-level DND is turned OFF'
        )
        .toBe(false);
    });
  }

  /**
   * Verifies that the "Do not disturb" tab IS visible on the
   * My settings → Notifications page (profile level).
   */
  async verifyDoNotDisturbTabIsVisible(): Promise<void> {
    await test.step('Verify "Do not disturb" tab is visible at profile level', async () => {
      await this.verifier.verifyTheElementIsVisible(this.profileDndLink, {
        assertionMessage: '"Do not disturb" tab should be visible at profile level when org-level DND is turned ON',
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  /**
   * Verifies the read-only tooltip is visible when profile DND fields are locked by app-level override.
   * Hovers over the work days section to trigger the tooltip, then verifies one tooltip is visible.
   * Uses .first() because the same tooltip text appears on all 7 work-day checkboxes (strict mode).
   */
  async verifyProfileDndReadOnlyTooltip(): Promise<void> {
    const tooltipText = MY_SETTINGS_PAGE_TEXT.PROFILE_DND_READONLY_TOOLTIP;
    await test.step(`Verify tooltip: "${tooltipText}"`, async () => {
      await this.profileWorkDayMondayCheckbox.waitFor({ state: 'visible', timeout: 5_000 });
      await this.profileWorkDayMondayCheckbox.hover();
      const tooltip = this.page.getByRole('tooltip').filter({ hasText: tooltipText }).first();
      await this.verifier.verifyTheElementIsVisible(tooltip, {
        timeout: 10_000,
        assertionMessage: `Read-only tooltip "${tooltipText}" should be visible`,
      });
    });
  }
}
