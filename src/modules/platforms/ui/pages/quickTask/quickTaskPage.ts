import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';
import { DAY_NAMES, DEFAULT_FUTURE_DAYS_OFFSET, getOrdinalSuffix, MONTH_NAMES } from '@platforms/constants/quickTask';

export class QuickTaskPage extends BasePage {
  readonly quickTaskContainer: Locator;
  readonly tasksLink: Locator;
  readonly createNewTaskButton: Locator;
  readonly taskTypeSelector: Locator;
  readonly titleInput: Locator;
  readonly contextInput: Locator;
  readonly setPriorityButton: Locator;
  readonly highPriorityOption: Locator;
  readonly selectDateButton: Locator;
  readonly addIndividualsCombobox: Locator;
  readonly tagField: Locator;
  readonly tagDropdown: Locator;
  readonly createTaskButton: Locator;
  readonly requiredFieldError: Locator;
  readonly audiencesRadio: Locator;
  readonly newTabCount: Locator;
  readonly createdTasksTab: Locator;

  constructor(page: Page, pageUrl: string = '/quick-task') {
    super(page, pageUrl);
    this.quickTaskContainer = page.locator('[data-testid="quick-task-container"]');
    this.tasksLink = page.getByRole('link', { name: 'Tasks' });
    this.createNewTaskButton = page.getByRole('button', { name: 'Create new task' });
    this.taskTypeSelector = page.locator(
      '.no-icon-shrink.file\\:.selection\\:text-brand-950.flex.flex-nowrap.items-center.justify-center.gap-2.rounded-lg'
    );
    this.titleInput = page.getByRole('textbox', { name: 'Add title' });
    this.contextInput = page.getByRole('textbox', { name: 'Add context' });
    this.setPriorityButton = page.getByRole('button', { name: 'Set priority' });
    this.highPriorityOption = page.locator('span').filter({ hasText: 'High' }).first();
    this.selectDateButton = page.getByRole('button', { name: 'Select date...' });
    this.addIndividualsCombobox = page.getByRole('combobox', { name: 'Add individuals' });
    this.tagField = page
      .getByRole('combobox', { name: 'Add tags' })
      .or(page.getByRole('combobox', { name: 'Tags' }))
      .or(page.getByPlaceholder('Add tags'));
    this.tagDropdown = page.locator('[role="listbox"]').or(page.locator('[role="menu"]'));
    this.createTaskButton = page.getByRole('button', { name: 'Create' });
    this.requiredFieldError = page.getByText('Please fill out the required field "Assigned to"');
    this.audiencesRadio = page.getByRole('radio', { name: 'Audiences' });
    this.newTabCount = page.getByRole('button', { name: /^\d+\s+new$/i });
    this.createdTasksTab = page.getByRole('tab', { name: 'Created tasks' });
  }

  /**
   * Verify the quick task page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.quickTaskContainer, 'quick task page to load').toBeVisible({ timeout: 15000 });
  }

  /**
   * Opens the create task form by navigating to Tasks and clicking create new task button
   */
  async openCreateTaskForm(): Promise<void> {
    await this.tasksLink.click();
    await this.createNewTaskButton.click();
    await this.taskTypeSelector.click();
  }

  /**
   * Fills task details including title, context, priority and future date
   * @param title - Task title
   * @param context - Task description/context
   */
  async fillTaskDetails(title: string, context: string): Promise<void> {
    await this.titleInput.fill(title);
    await this.contextInput.click();
    await this.contextInput.fill(context);
    await this.setPriorityButton.click();
    await this.highPriorityOption.click();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + DEFAULT_FUTURE_DAYS_OFFSET);
    const dayName = DAY_NAMES[futureDate.getDay()];
    const day = futureDate.getDate();
    const month = MONTH_NAMES[futureDate.getMonth()];
    const dateButtonText = `${dayName}, ${month} ${day}${getOrdinalSuffix(day)}`;
    await this.selectDateButton.click();
    await this.page.getByRole('button', { name: dateButtonText }).click();
  }

  /**
   * Fills task details with title, context and priority (without date)
   * @param title - Task title
   * @param context - Task description/context
   */
  async fillTaskDetailsWithoutDate(title: string, context: string): Promise<void> {
    await this.titleInput.fill(title);
    await this.contextInput.click();
    await this.contextInput.fill(context);
    await this.setPriorityButton.click();
    await this.highPriorityOption.click();
  }

  /**
   * Selects the current date as the due date
   */
  async selectCurrentDate(): Promise<void> {
    const currentDate = new Date();
    const dayName = DAY_NAMES[currentDate.getDay()];
    const day = currentDate.getDate();
    const month = MONTH_NAMES[currentDate.getMonth()];
    const dateButtonText = `${dayName}, ${month} ${day}${getOrdinalSuffix(day)}`;
    await this.selectDateButton.click();
    await this.page.getByRole('button', { name: dateButtonText }).click();
  }

  /**
   * Attempts to select a past date and verifies it is disabled/not selectable
   * Uses -2 days (2 days before today) to ensure it's definitely in the past
   */
  async attemptToSelectPastDate(): Promise<void> {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    const dayName = DAY_NAMES[pastDate.getDay()];
    const day = pastDate.getDate();
    const month = MONTH_NAMES[pastDate.getMonth()];
    const dateButtonText = `${dayName}, ${month} ${day}${getOrdinalSuffix(day)}`;
    await this.selectDateButton.click();
    const pastDateButton = this.page.getByRole('button', { name: dateButtonText });
    await expect(pastDateButton).toBeDisabled();
  }

  /**
   * Verifies that the selected date is displayed in the date button
   * @param expectedDateText - Expected date text to verify
   */
  async verifySelectedDate(expectedDateText: string): Promise<void> {
    await expect(this.selectDateButton).toContainText(expectedDateText);
  }

  /**
   * Verifies that the current date is selected and displayed in the date button
   * Checks that the button text contains the selected date
   */
  async verifyCurrentDateIsSelected(): Promise<void> {
    const currentDate = new Date();
    const dayName = DAY_NAMES[currentDate.getDay()];
    const day = currentDate.getDate();
    const month = MONTH_NAMES[currentDate.getMonth()];
    const expectedDateText = `${dayName}, ${month} ${day}${getOrdinalSuffix(day)}`;
    const dateButton = this.page.getByRole('button', { name: new RegExp(expectedDateText, 'i') });
    await expect(dateButton).toBeVisible({ timeout: 10000 });
  }

  /**
   * Attempts to create task without assigning to any user
   * Verifies assignee field is empty and clicks create button
   */
  async attemptToCreateTaskWithoutAssignee(): Promise<void> {
    await expect(this.addIndividualsCombobox).toHaveValue('');
    await this.createTaskButton.click();
  }

  /**
   * Verifies the required field error message is displayed
   */
  async verifyRequiredFieldError(): Promise<void> {
    await expect(this.requiredFieldError).toBeVisible();
  }

  /**
   * Selects Audiences radio option and verifies error message is still displayed
   */
  async selectAudiencesAndVerifyError(): Promise<void> {
    await this.audiencesRadio.click();
    await expect(this.requiredFieldError).toBeVisible();
  }

  /**
   * Clicks on the Tag field to open the searchable dropdown list
   */
  async clickTagField(): Promise<void> {
    await this.tagField.click();
    await expect(this.tagDropdown).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verifies that the tag dropdown list is visible and contains all expected tags
   */
  async verifyTagDropdownIsVisible(): Promise<void> {
    await expect(this.tagDropdown).toBeVisible();
    await expect(this.tagDropdown.getByText('Bug')).toBeVisible();
    await expect(this.tagDropdown.getByText('Feature')).toBeVisible();
    await expect(this.tagDropdown.getByRole('option', { name: 'Documentation' })).toBeVisible();
    await expect(this.tagDropdown.getByRole('option', { name: 'Performance' })).toBeVisible();
    await expect(this.tagDropdown.getByText('Security')).toBeVisible();
    await expect(this.tagDropdown.getByText('UI')).toBeVisible();
    await expect(this.tagDropdown.getByText('Backend')).toBeVisible();
    await expect(this.tagDropdown.getByText('API')).toBeVisible();
    await expect(this.tagDropdown.getByText('Infra')).toBeVisible();
  }

  /**
   * Navigates to the Tasks section to view task counts
   */
  async navigateToTasks(): Promise<void> {
    await this.tasksLink.click();
    await this.page.waitForLoadState('load');
    await this.page
      .locator('progressbar')
      .filter({ hasText: 'Loading…' })
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});
    await this.createdTasksTab.waitFor({ state: 'visible', timeout: 15000 });
    await this.createdTasksTab.click();
    await this.page.waitForLoadState('load');
    await this.page
      .locator('progressbar')
      .filter({ hasText: 'Loading…' })
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});
  }

  /**
   * Reloads the page and navigates to Tasks section
   * Used after API task creation to refresh the UI and check updated counts
   */
  async reloadAndNavigateToTasks(): Promise<void> {
    await this.page.reload({ waitUntil: 'load' });
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await this.navigateToTasks();
  }

  /**
   * Gets the count displayed in the "New" button (e.g., "0 New", "1 New")
   * @returns The count as a number
   */
  async getNewTabCount(): Promise<number> {
    await this.page
      .locator('progressbar')
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});
    await this.newTabCount.waitFor({ state: 'visible', timeout: 15000 });
    const countText = await this.newTabCount.textContent();
    if (!countText) {
      return 0;
    }
    const match = countText.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  /**
   * Gets the initial "New" tab count after navigating to Tasks section
   * Used to establish baseline count before creating tasks
   * @returns The initial count as a number
   */
  async getInitialNewTabCount(): Promise<number> {
    await this.navigateToTasks();
    return await this.getNewTabCount();
  }

  /**
   * Verifies that the "New" tab count matches the expected count
   * @param expectedCount - The expected count to verify
   */
  async verifyNewTabCount(expectedCount: number): Promise<void> {
    await expect(async () => {
      const newCount = await this.getNewTabCount();
      expect(newCount).toBe(expectedCount);
    }).toPass({ timeout: 20000 });
  }
}
