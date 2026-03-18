import { ALERT_NOTIFICATION_MESSAGES } from '@alert-notification-constants/messageRepo';
import { Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { DND_PAGE_TEXT } from '../../tests/test-data/dnd-manage-preferences.test-data';
import { DndPageComponent, ProfileDndComponent } from '../components/dnd-manage-preferences/dndComponents';

import { DndManagePreferencesPage } from './dnd-manage-preferences/dndManagePreferencesPage';

import { BasePage } from '@/src/core/ui/pages/basePage';

/**
 * Alert-notification scoped Defaults → Do not disturb page helper.
 * Used by dnd.spec.ts for tests that navigate from Defaults and interact with the DND page.
 * Delegates DND page behaviour to DndPageComponent; delegates navigation/buttons/toast to DndManagePreferencesPage.
 */
export class DndPage extends BasePage {
  private readonly dndManagePreferencesPage: DndManagePreferencesPage;
  private readonly dndPageComponent: DndPageComponent;

  constructor(page: Page) {
    super(page);
    this.dndManagePreferencesPage = new DndManagePreferencesPage(page);
    this.dndPageComponent = new DndPageComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    return this.dndManagePreferencesPage.verifyThePageIsLoaded();
  }

  /** Navigate to Application Settings → Manage application → Defaults (Email notifications). */
  async navigateToPageUsingDefaultsTab(): Promise<void> {
    await this.page.goto(PAGE_ENDPOINTS.EMAIL_NOTIFICATION_APP_SETTINGS_PAGE);
  }

  /** Navigate directly to the Do not disturb page. */
  async navigateToDndPage(): Promise<void> {
    return this.dndManagePreferencesPage.navigateToDndPage();
  }

  async clickOnDNDTab(tabName: string): Promise<void> {
    return this.dndManagePreferencesPage.clickOnDNDTab(tabName);
  }

  async verifyButton(
    buttonName: string,
    verificationType: 'visible' | 'enabled' | 'disabled',
    step?: string
  ): Promise<void> {
    return this.dndManagePreferencesPage.verifyButton(buttonName, verificationType, step);
  }

  async clickButton(buttonName: string, step?: string): Promise<void> {
    return this.dndManagePreferencesPage.clickButton(buttonName, step);
  }

  async verifyToastMessage(message: string): Promise<void> {
    return this.dndManagePreferencesPage.verifyToastMessage(message);
  }

  // DND page actions (delegate to DndPageComponent)
  async verifyDoNotDisturbTabIsVisible(): Promise<void> {
    return this.dndPageComponent.verifyDoNotDisturbTabIsVisible();
  }

  async verifyDndPageAllTextElementsAfterDNDTabClick(): Promise<void> {
    return this.dndPageComponent.verifyDndPageAllTextElementsAfterDNDTabClick();
  }

  async checkAllOrganizationToggleEnabled(): Promise<boolean> {
    return this.dndPageComponent.checkAllOrganizationToggleEnabled();
  }

  async isAllOrganizationToggleEnabled(): Promise<boolean> {
    return this.dndPageComponent.isAllOrganizationToggleEnabled();
  }

  async setAllOrganizationToggle(enabled: boolean): Promise<void> {
    return this.dndPageComponent.setAllOrganizationToggle(enabled);
  }

  async verifyAllOrganizationToggleIsOnOrOff(expectedState: 'on' | 'off'): Promise<void> {
    return this.dndPageComponent.verifyAllOrganizationToggleIsOnOrOff(expectedState);
  }

  async verifySelectSourceSectionIsVisible(): Promise<void> {
    return this.dndPageComponent.verifySelectSourceSectionIsVisible();
  }

  async verifySelectSourceSection(): Promise<void> {
    return this.dndPageComponent.verifySelectSourceSection();
  }

  async selectSourceOptionAs(source: 'UKG' | 'Manual'): Promise<void> {
    return this.dndPageComponent.selectSourceOptionAs(source);
  }

  async selectSourceOption(source: 'UKG' | 'Manual'): Promise<void> {
    return this.dndPageComponent.selectSourceOption(source);
  }

  async verifyWorkDaysSectionAndOptionsAreVisible(): Promise<void> {
    return this.dndPageComponent.verifyWorkDaysSectionAndOptionsAreVisible();
  }

  async verifyWorkDaysSectionAndOptions(): Promise<void> {
    return this.dndPageComponent.verifyWorkDaysSectionAndOptions();
  }

  async verifyWorkHoursSection(): Promise<void> {
    return this.dndPageComponent.verifyWorkHoursSection();
  }

  async verifyUserEditableOption(): Promise<void> {
    return this.dndPageComponent.verifyUserEditableOption();
  }

  async setUserEditable(enabled: boolean): Promise<void> {
    return this.dndPageComponent.setUserEditable(enabled);
  }

  async selectWorkDaysAs(days: string[]): Promise<void> {
    return this.dndPageComponent.selectWorkDaysAs(days);
  }

  async selectWorkDays(days: string[]): Promise<void> {
    return this.dndPageComponent.selectWorkDays(days);
  }

  async confirmDisableAllOrganizationDnd(): Promise<void> {
    return this.dndPageComponent.confirmDisableAllOrganizationDnd();
  }

  async setWorkHours(startTime: string, endTime: string): Promise<void> {
    return this.dndPageComponent.setWorkHours(startTime, endTime);
  }

  /**
   * Fills work days and work hours in one call. Use when on DND page with "Manual" selected.
   */
  async fillDndWorkDaysAndHours(days: string[], startTime: string, endTime: string): Promise<void> {
    return this.dndPageComponent.fillDndWorkDaysAndHours(days, startTime, endTime);
  }

  /**
   * Disables All organization DND (toggle off, confirm dialog). Does not save.
   */
  async disableAllOrganizationDnd(): Promise<void> {
    return this.dndPageComponent.disableAllOrganizationDnd();
  }

  /**
   * Disables All organization DND and saves: toggle off, confirm, click Save, verify toast.
   * Reusable for cleanup or whenever DND should be turned off and persisted.
   */
  async disableAllOrganizationDndAndSave(): Promise<void> {
    await this.dndPageComponent.disableAllOrganizationDnd();
    await this.verifyButton(DND_PAGE_TEXT.SAVE_BUTTON, 'enabled');
    await this.clickButton(DND_PAGE_TEXT.SAVE_BUTTON);
    await this.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.DND_SAVED_SUCCESSFULLY);
  }
}

/**
 * Alert-notification scoped My Settings → Notifications page helper.
 * Delegates all behaviour to ProfileDndComponent so tests do not depend on the content module's page object.
 */
export class AlertNotificationMySettingsNotificationsPage extends BasePage {
  private readonly profileDndComponent: ProfileDndComponent;

  constructor(page: Page) {
    super(page);
    this.profileDndComponent = new ProfileDndComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    return this.profileDndComponent.verifyThePageIsLoaded();
  }

  async navigateToCurrentUserNotificationSettings(): Promise<void> {
    return this.profileDndComponent.navigateToCurrentUserNotificationSettings();
  }

  async navigateToProfileDndPage(): Promise<void> {
    return this.profileDndComponent.navigateToProfileDndPage();
  }

  async verifyProfileDndWorkDaysDisplay(expectedDays: readonly string[]): Promise<void> {
    return this.profileDndComponent.verifyProfileDndWorkDaysDisplay(expectedDays);
  }

  async verifyProfileDndWorkHoursDisplay(startTimeDisplay: string, endTimeDisplay: string): Promise<void> {
    return this.profileDndComponent.verifyProfileDndWorkHoursDisplay(startTimeDisplay, endTimeDisplay);
  }

  async verifyProfileDndFieldsAreReadOnly(): Promise<void> {
    return this.profileDndComponent.verifyProfileDndFieldsAreReadOnly();
  }

  async verifyDoNotDisturbTabIsNotVisible(): Promise<void> {
    return this.profileDndComponent.verifyDoNotDisturbTabIsNotVisible();
  }

  async verifyDoNotDisturbTabIsVisible(): Promise<void> {
    return this.profileDndComponent.verifyDoNotDisturbTabIsVisible();
  }

  async verifyProfileDndReadOnlyTooltip(): Promise<void> {
    return this.profileDndComponent.verifyProfileDndReadOnlyTooltip();
  }
}
