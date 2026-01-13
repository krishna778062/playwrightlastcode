import { Page, test } from '@playwright/test';

import { DND_PAGE_TEXT, MANAGE_PREFERENCES_PAGE_TEXT } from '../../../tests/test-data/dnd-manage-preferences.test-data';
import { CommonActionsComponent } from '../../components/commonActionsComponent';
import { DndManagePreferencesComponent } from '../../components/dnd-manage-preferences/dndManagePreferencesComponent';

import { BasePage, PAGE_ENDPOINTS } from '@/src/core';

/**
 * DND & Manage Preferences Page
 * Uses CommonActionsComponent for common operations
 * Uses DndManagePreferencesComponent for DND-specific operations.
 * Page methods use the same names as the component for readable, consistent usage in specs.
 */
export class DndManagePreferencesPage extends BasePage {
  readonly dndManagePreferencesComponent: DndManagePreferencesComponent;
  readonly commonActionsComponent: CommonActionsComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.DND_PAGE);
    this.dndManagePreferencesComponent = new DndManagePreferencesComponent(page);
    this.commonActionsComponent = new CommonActionsComponent(page);
  }

  // ==================== Page-level (DND / Manage Preferences) ====================

  /**
   * Verifies the DND page is loaded by checking the heading
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify DND page is loaded', async () => {
      await this.commonActionsComponent.verifyTextIsVisible(DND_PAGE_TEXT.HEADING);
    });
  }

  /**
   * Navigates to the DND page directly.
   * After goto, the Defaults layout may show the first tab (Email notifications); clicking the "Do not disturb" tab
   * ensures the DND content is visible (same flow as dnd.spec.ts).
   */
  async navigateToDndPage(): Promise<void> {
    await test.step('Navigate to Do not disturb page', async () => {
      await this.page.goto(PAGE_ENDPOINTS.DND_PAGE);
      await this.commonActionsComponent.clickTab(DND_PAGE_TEXT.SIDEBAR_MENU.DO_NOT_DISTURB);
      await this.commonActionsComponent.verifyTextIsVisible(DND_PAGE_TEXT.HEADING);
    });
  }

  /**
   * Verifies the Manage Preferences page is loaded by checking the heading
   */
  async verifyManagePreferencesPageIsLoaded(): Promise<void> {
    await test.step('Verify Manage Preferences page is loaded', async () => {
      await this.commonActionsComponent.verifyHeadingIsVisible(MANAGE_PREFERENCES_PAGE_TEXT.HEADING);
      // Wait for at least one notification row to be visible
      const rows = this.page.locator('tr').filter({ has: this.page.locator('select[aria-label="Priority"]') });
      await rows.first().waitFor({ state: 'visible', timeout: 10_000 });
    });
  }

  /**
   * Clicks the "Manage preferences" link to open the Manage Preferences page
   */
  async clickManagePreferencesLink(): Promise<void> {
    return this.commonActionsComponent.clickLink(DND_PAGE_TEXT.MANAGE_PREFERENCES_BUTTON);
  }

  /**
   * Navigates to DND page then clicks "Manage preferences" (common setup for Manage Preferences tests)
   */
  async openManagePreferencesPage(): Promise<void> {
    await this.navigateToDndPage();
    await this.clickManagePreferencesLink();
  }

  /**
   * Verifies the DND page shows all main elements after clicking the DND tab (heading, descriptions, link, All organization, Audience)
   */
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

  /**
   * Verifies the Manage Preferences page heading is visible
   */
  async verifyManagePreferencesPageHeading(): Promise<void> {
    await this.commonActionsComponent.verifyHeadingIsVisible(MANAGE_PREFERENCES_PAGE_TEXT.HEADING);
  }

  /**
   * Verifies the Filters panel shows Priority and Category section buttons
   */
  async verifyFiltersPanelSectionsVisible(): Promise<void> {
    await this.commonActionsComponent.verifyButton(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.PRIORITY, 'visible');
    await this.commonActionsComponent.verifyButton(MANAGE_PREFERENCES_PAGE_TEXT.FILTERS.SECTIONS.CATEGORY, 'visible');
  }

  /** Delegates to commonActionsComponent for buttons and toast */
  async verifyButton(
    buttonName: string,
    verificationType: 'visible' | 'enabled' | 'disabled',
    step?: string
  ): Promise<void> {
    return this.commonActionsComponent.verifyButton(buttonName, verificationType, step);
  }

  async clickButton(buttonName: string, step?: string): Promise<void> {
    return this.commonActionsComponent.clickButton(buttonName, step);
  }

  async verifyToastMessage(message: string): Promise<void> {
    return this.commonActionsComponent.verifyToastMessage(message);
  }

  async reloadPage(): Promise<void> {
    return this.commonActionsComponent.reloadPage();
  }

  /** Navigates to the app home page */
  async goToHome(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * Verifies the Manage Preferences page shows heading and all three description lines
   */
  async verifyManagePreferencesHeadingAndDescriptions(): Promise<void> {
    await this.commonActionsComponent.verifyHeadingIsVisible(MANAGE_PREFERENCES_PAGE_TEXT.HEADING);
    await this.commonActionsComponent.verifyTextIsVisible(MANAGE_PREFERENCES_PAGE_TEXT.DESCRIPTION_LINE_1, {
      exact: false,
    });
    await this.commonActionsComponent.verifyTextIsVisible(MANAGE_PREFERENCES_PAGE_TEXT.DESCRIPTION_LINE_2, {
      exact: false,
    });
    await this.commonActionsComponent.verifyTextIsVisible(MANAGE_PREFERENCES_PAGE_TEXT.DESCRIPTION_LINE_3, {
      exact: false,
    });
  }

  /**
   * Verifies the DND page shows heading, description and section labels (All organization, Audience) after navigating back
   */
  async verifyDndPageContentAfterNavigatingBack(): Promise<void> {
    await this.commonActionsComponent.verifyTextIsVisible(DND_PAGE_TEXT.HEADING);
    await this.commonActionsComponent.verifyTextIsVisible(DND_PAGE_TEXT.DESCRIPTION_LINE_1, { exact: false });
    await this.commonActionsComponent.verifyHeadingIsVisible(DND_PAGE_TEXT.ALL_ORGANIZATION.LABEL);
    await this.commonActionsComponent.verifyHeadingIsVisible(DND_PAGE_TEXT.AUDIENCE.LABEL);
  }

  // ==================== Same-name methods to DndManagePreferencesComponent ====================

  async clickBackToDndPage(): Promise<void> {
    return this.dndManagePreferencesComponent.clickBackButton();
  }

  async verifyDoNotDisturbTabIsVisible(): Promise<void> {
    return this.dndManagePreferencesComponent.verifyDoNotDisturbTabIsVisible();
  }

  async checkAllOrganizationToggleEnabled(): Promise<boolean> {
    return this.dndManagePreferencesComponent.isAllOrganizationToggleEnabled();
  }

  async setAllOrganizationToggle(enabled: boolean): Promise<void> {
    return this.dndManagePreferencesComponent.setAllOrganizationToggle(enabled);
  }

  async verifyAllOrganizationToggleIsOnOrOff(expectedState: 'on' | 'off'): Promise<void> {
    return this.dndManagePreferencesComponent.verifyAllOrganizationToggleState(expectedState);
  }

  async verifySelectSourceSectionIsVisible(): Promise<void> {
    return this.dndManagePreferencesComponent.verifySelectSourceSection();
  }

  async selectSourceOptionAs(source: 'UKG' | 'Manual'): Promise<void> {
    return this.dndManagePreferencesComponent.selectSourceOption(source);
  }

  async verifyWorkDaysSectionAndOptionsAreVisible(): Promise<void> {
    return this.dndManagePreferencesComponent.verifyWorkDaysSectionAndOptions();
  }

  async selectWorkDaysAs(days: string[]): Promise<void> {
    return this.dndManagePreferencesComponent.selectWorkDays(days);
  }

  async verifyWorkHoursSection(): Promise<void> {
    return this.dndManagePreferencesComponent.verifyWorkHoursSection();
  }

  async confirmDisableAllOrganizationDnd(): Promise<void> {
    return this.dndManagePreferencesComponent.confirmDisableAllOrganizationDnd();
  }

  async setWorkHours(startTime: string, endTime: string): Promise<void> {
    return this.dndManagePreferencesComponent.setWorkHours(startTime, endTime);
  }

  async verifyUserEditableOption(): Promise<void> {
    return this.dndManagePreferencesComponent.verifyUserEditableOption();
  }

  async verifyAllNotificationRows(
    notifications: readonly { name: string; description: string; category: string }[]
  ): Promise<void> {
    return this.dndManagePreferencesComponent.verifyAllNotificationRows(notifications);
  }

  async searchNotifications(searchTerm: string): Promise<void> {
    return this.dndManagePreferencesComponent.searchNotifications(searchTerm);
  }

  async clearSearch(): Promise<void> {
    return this.dndManagePreferencesComponent.clearSearch();
  }

  async verifySearchResultContains(notificationName: string, category: string): Promise<void> {
    return this.dndManagePreferencesComponent.verifySearchResultContains(notificationName, category);
  }

  async clickSortByDropdown(): Promise<void> {
    return this.dndManagePreferencesComponent.clickSortByDropdown();
  }

  async verifySortOptionsVisible(options: readonly string[]): Promise<void> {
    return this.dndManagePreferencesComponent.verifySortOptionsVisible(options);
  }

  async clickFiltersButton(): Promise<void> {
    return this.dndManagePreferencesComponent.clickFiltersButton();
  }

  async verifyFiltersPanelVisible(): Promise<void> {
    return this.dndManagePreferencesComponent.verifyFiltersPanelVisible();
  }

  async expandFilterSection(sectionName: string): Promise<void> {
    return this.dndManagePreferencesComponent.expandFilterSection(sectionName);
  }

  async verifyFilterOptionsVisible(options: readonly string[]): Promise<void> {
    return this.dndManagePreferencesComponent.verifyFilterOptionsVisible(options);
  }

  async verifyFilterOptionsHaveCounts(options: readonly string[]): Promise<void> {
    return this.dndManagePreferencesComponent.verifyFilterOptionsHaveCounts(options);
  }

  async selectFilterOption(optionName: string): Promise<void> {
    return this.dndManagePreferencesComponent.selectFilterOption(optionName);
  }

  async unselectFilterOption(optionName: string): Promise<void> {
    return this.dndManagePreferencesComponent.unselectFilterOption(optionName);
  }

  async verifyFiltersButtonActiveState(expectedCount: number): Promise<void> {
    return this.dndManagePreferencesComponent.verifyFiltersButtonActiveState(expectedCount);
  }

  async verifyAllRowsHavePriority(expectedPriority: string): Promise<void> {
    return this.dndManagePreferencesComponent.verifyAllRowsHavePriority(expectedPriority);
  }

  async getNotificationRowCount(): Promise<number> {
    return this.dndManagePreferencesComponent.getNotificationRowCount();
  }

  async searchInCategoryFilter(searchTerm: string): Promise<void> {
    return this.dndManagePreferencesComponent.searchInCategoryFilter(searchTerm);
  }

  async clearCategorySearch(): Promise<void> {
    return this.dndManagePreferencesComponent.clearCategorySearch();
  }

  async verifyCategorySearchBoxVisible(): Promise<void> {
    return this.dndManagePreferencesComponent.verifyCategorySearchBoxVisible();
  }

  async verifyAllRowsHaveCategory(expectedCategory: string): Promise<void> {
    return this.dndManagePreferencesComponent.verifyAllRowsHaveCategory(expectedCategory);
  }

  async verifyAllRowsHaveCategoryOneOf(expectedCategories: string[]): Promise<void> {
    return this.dndManagePreferencesComponent.verifyAllRowsHaveCategoryOneOf(expectedCategories);
  }

  async verifyPriorityFilterCountMatchesVisibleRows(priorityLabel: string): Promise<void> {
    return this.dndManagePreferencesComponent.verifyPriorityFilterCountMatchesVisibleRows(priorityLabel);
  }

  async verifyCategoryFilterCountMatchesVisibleRows(categoryLabel: string): Promise<void> {
    return this.dndManagePreferencesComponent.verifyCategoryFilterCountMatchesVisibleRows(categoryLabel);
  }

  async clickResetAllFilters(): Promise<void> {
    return this.dndManagePreferencesComponent.clickResetAllFilters();
  }

  async verifyFiltersButtonDefaultState(): Promise<void> {
    return this.dndManagePreferencesComponent.verifyFiltersButtonDefaultState();
  }

  async verifyEditablePriorityDropdownOptions(notification: { name: string; category: string }): Promise<void> {
    return this.dndManagePreferencesComponent.verifyEditablePriorityDropdownOptions(notification);
  }

  async verifySystemNotificationPriorityLocked(notification: { name: string; category: string }): Promise<void> {
    return this.dndManagePreferencesComponent.verifySystemNotificationPriorityLocked(notification);
  }

  async getNotificationPriorityValue(notification: { name: string; category: string }): Promise<string> {
    return this.dndManagePreferencesComponent.getNotificationPriorityValue(notification);
  }

  async changeNotificationPriority(
    notification: { name: string; category: string },
    newPriority: string
  ): Promise<void> {
    return this.dndManagePreferencesComponent.changeNotificationPriority(notification, newPriority);
  }

  async verifyNotificationPriorityValue(
    notification: { name: string; category: string },
    expectedPriority: string
  ): Promise<void> {
    return this.dndManagePreferencesComponent.verifyNotificationPriorityValue(notification, expectedPriority);
  }

  async selectSortOption(optionName: string): Promise<void> {
    return this.dndManagePreferencesComponent.selectSortOption(optionName);
  }

  async verifySortedByPriorityOrder(): Promise<void> {
    return this.dndManagePreferencesComponent.verifySortedByPriorityOrder();
  }

  async verifyNotificationIsAtTop(notification: { name: string; category: string }): Promise<void> {
    return this.dndManagePreferencesComponent.verifyNotificationIsAtTop(notification);
  }

  async verifySortByButtonText(expectedText: string): Promise<void> {
    return this.dndManagePreferencesComponent.verifySortByButtonText(expectedText);
  }

  async verifySortedByCategoryOrder(expectedCategories: readonly string[]): Promise<void> {
    return this.dndManagePreferencesComponent.verifySortedByCategoryOrder(expectedCategories);
  }

  async clickOnDNDTab(tabName: string): Promise<void> {
    return this.commonActionsComponent.clickTab(tabName);
  }
}
