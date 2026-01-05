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
  readonly selectDateButton: Locator;
  readonly addIndividualsCombobox: Locator;
  readonly tagField: Locator;
  readonly tagDropdown: Locator;
  readonly createTaskButton: Locator;
  readonly requiredFieldError: Locator;
  readonly titleRequiredFieldError: Locator;
  readonly audiencesRadio: Locator;
  readonly newTabCount: Locator;
  readonly createdTasksTab: Locator;
  readonly myTasksTab: Locator;
  readonly inProgressTabCount: Locator;
  readonly taskMenuButton: Locator;
  readonly startTaskButton: Locator;
  readonly inProgressStatusButton: Locator;
  readonly completedTabCount: Locator;
  readonly individualsRadio: Locator;

  constructor(page: Page, pageUrl: string = '/quick-task') {
    super(page, pageUrl);
    this.quickTaskContainer = page.locator('[data-testid="quick-task-container"]');
    this.tasksLink = page.getByTestId('main-nav').getByRole('link', { name: 'Tasks' });
    this.createNewTaskButton = page.getByRole('button', { name: 'Create new task' });
    this.taskTypeSelector = page.locator(
      '.no-icon-shrink.file\\:.selection\\:text-brand-950.flex.flex-nowrap.items-center.justify-center.gap-2.rounded-lg'
    );
    this.titleInput = page.getByRole('textbox', { name: 'Add title' });
    this.contextInput = page.getByRole('textbox', { name: 'Add context' });
    this.setPriorityButton = page.getByRole('combobox', { name: 'Set priority' });
    this.selectDateButton = page.getByRole('button', { name: 'Select date...' });
    this.addIndividualsCombobox = page.getByRole('combobox', { name: 'Add individuals' });
    this.tagField = page
      .getByRole('combobox', { name: 'Add tags' })
      .or(page.getByRole('combobox', { name: 'Tags' }))
      .or(page.getByPlaceholder('Add tags'));
    this.tagDropdown = page.locator('[role="listbox"]').or(page.locator('[role="menu"]'));
    this.createTaskButton = page.getByRole('button', { name: 'Create' });
    this.requiredFieldError = page.getByText('Please fill out the required field "Assigned to"');
    this.titleRequiredFieldError = page.getByText('Please fill out the required field "Title"');
    this.audiencesRadio = page.getByRole('radio', { name: 'Audiences' });
    this.newTabCount = page.getByRole('button', { name: /^\d+\s+new$/i });
    this.createdTasksTab = page.getByRole('tab', { name: 'Created tasks' });
    this.myTasksTab = page.getByRole('tab', { name: 'My tasks' });
    this.inProgressTabCount = page.getByRole('button', { name: /^\d+\s+in progress$/i });
    this.taskMenuButton = page
      .locator('button[aria-label*="menu"]')
      .or(page.locator('button').filter({ hasText: /^$/ }).first());
    this.startTaskButton = page.getByText('Start task');
    this.inProgressStatusButton = page
      .locator('span[data-slot="badge"]')
      .filter({ hasText: /^In progress$/i })
      .or(page.getByText('In progress', { exact: true }));
    this.completedTabCount = page.getByRole('button', { name: /^\d+\s+completed$/i });
    this.individualsRadio = page.getByRole('radio', { name: 'Individuals' });
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
    await this.setPriorityButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.setPriorityButton.click();
    // Use retry mechanism to handle click interception
    await expect(async () => {
      const highOption = this.page.getByRole('option', { name: 'High' });
      await highOption.waitFor({ state: 'visible', timeout: 5000 });
      try {
        await highOption.click({ timeout: 3000 });
      } catch {
        // If click is intercepted, try force click
        await highOption.click({ force: true });
      }
    }).toPass({ timeout: 20000 });

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + DEFAULT_FUTURE_DAYS_OFFSET);
    const dayName = DAY_NAMES[futureDate.getDay()];
    const day = futureDate.getDate();
    const month = MONTH_NAMES[futureDate.getMonth()];
    // Use format with trailing comma as shown in codegen: "Wednesday, December 31st,"
    const dateButtonTextWithComma = `${dayName}, ${month} ${day}${getOrdinalSuffix(day)},`;
    const dateButtonTextWithoutComma = `${dayName}, ${month} ${day}${getOrdinalSuffix(day)}`;
    await this.selectDateButton.click();
    // Wait for date picker dialog to open (filter by data-side attribute to get only the date picker, not the create task dialog)
    await this.page
      .locator('[role="dialog"][data-side]')
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});

    // Check if we need to navigate to next month (if date is in next month)
    const currentMonth = new Date().getMonth();
    if (futureDate.getMonth() !== currentMonth) {
      // Navigate to next month by clicking next month button
      const nextMonthButton = this.page
        .getByRole('button', { name: /next month/i })
        .or(this.page.locator('button[aria-label*="next" i]').first());
      await nextMonthButton.click().catch(() => {});
      // Wait for calendar to update
      await this.page.waitForTimeout(300);
    }

    // Use retry mechanism to find and click the date button - try multiple formats
    await expect(async () => {
      // Try with trailing comma first
      let dateButton = this.page.getByRole('button', { name: dateButtonTextWithComma });
      let isVisible = await dateButton.isVisible().catch(() => false);

      if (!isVisible) {
        // Try without trailing comma
        dateButton = this.page.getByRole('button', { name: dateButtonTextWithoutComma });
        isVisible = await dateButton.isVisible().catch(() => false);
      }

      if (!isVisible) {
        // Try finding by day number in calendar grid (any enabled button with that day number)
        dateButton = this.page
          .locator('[role="grid"]')
          .getByRole('button', { name: String(day) })
          .filter({ hasNotText: /disabled/ })
          .first();
        isVisible = await dateButton.isVisible().catch(() => false);
      }

      if (!isVisible) {
        // Last resort: any button with the day number that's not disabled
        dateButton = this.page
          .locator('button')
          .filter({ hasText: new RegExp(`^${day}$`) })
          .filter({ hasNotText: /disabled/ })
          .first();
        isVisible = await dateButton.isVisible().catch(() => false);
      }

      if (!isVisible) {
        throw new Error(`Date button for ${dateButtonTextWithComma} not found`);
      }

      await dateButton.waitFor({ state: 'visible', timeout: 5000 });
      await dateButton.click();
    }).toPass({ timeout: 20000 });
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
    await this.setPriorityButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.setPriorityButton.click();
    // Use retry mechanism to handle click interception
    await expect(async () => {
      const highOption = this.page.getByRole('option', { name: 'High' });
      await highOption.waitFor({ state: 'visible', timeout: 5000 });
      try {
        await highOption.click({ timeout: 3000 });
      } catch {
        // If click is intercepted, try force click
        await highOption.click({ force: true });
      }
    }).toPass({ timeout: 20000 });
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
   * Attempts to create task without providing a title
   * Fills other required fields (context, priority) but leaves title empty, then clicks create button
   * @param context - Task description/context
   */
  async attemptToCreateTaskWithoutTitle(context: string): Promise<void> {
    await expect(this.titleInput).toHaveValue('');
    await this.contextInput.click();
    await this.contextInput.fill(context);
    await this.setPriorityButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.setPriorityButton.click();
    // Use retry mechanism to handle click interception
    await expect(async () => {
      const highOption = this.page.getByRole('option', { name: 'High' });
      await highOption.waitFor({ state: 'visible', timeout: 5000 });
      try {
        await highOption.click({ timeout: 3000 });
      } catch {
        // If click is intercepted, try force click
        await highOption.click({ force: true });
      }
    }).toPass({ timeout: 20000 });
    await this.createTaskButton.click();
  }

  /**
   * Verifies the title required field error message is displayed
   */
  async verifyTitleRequiredFieldError(): Promise<void> {
    await expect(this.titleRequiredFieldError).toBeVisible();
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
    // Check if we're on task detail page (has breadcrumb), use breadcrumb link if available
    const breadcrumbLink = this.page.getByLabel('Task detail breadcrumb').getByRole('link', { name: 'Tasks' });
    const isBreadcrumbVisible = await breadcrumbLink.isVisible().catch(() => false);

    if (isBreadcrumbVisible) {
      // Use breadcrumb link to navigate back from task detail page
      await breadcrumbLink.click();
    } else {
      // Use main nav link if not on task detail page
      await this.tasksLink.waitFor({ state: 'visible', timeout: 15000 });
      await expect(async () => {
        try {
          await this.tasksLink.click({ timeout: 3000 });
        } catch {
          await this.page.waitForTimeout(500);
          await this.tasksLink.click({ force: true });
        }
      }).toPass({ timeout: 20000 });
    }

    // Wait for page to load and loading to complete
    await this.page.waitForLoadState('load');
    await this.page
      .locator('progressbar')
      .filter({ hasText: 'Loading…' })
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});

    // Wait for the Created tasks tab to appear with retry mechanism
    await expect(async () => {
      await this.createdTasksTab.waitFor({ state: 'visible', timeout: 5000 });
      await this.createdTasksTab.click();
    }).toPass({ timeout: 20000 });

    // Wait for tab content to load
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
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
   * Gets the locator for a specific tab count based on tab type
   * @param tabType - The type of tab ('new', 'inProgress', or 'completed')
   * @returns The locator for the tab count
   */
  private getTabCountLocator(tabType: 'new' | 'inProgress' | 'completed'): Locator {
    switch (tabType) {
      case 'new':
        return this.newTabCount;
      case 'inProgress':
        return this.inProgressTabCount;
      case 'completed':
        return this.completedTabCount;
      default:
        throw new Error(`Unknown tab type: ${tabType}`);
    }
  }

  /**
   * Gets the count displayed in a specific tab button (e.g., "0 New", "1 In progress", "2 Completed")
   * @param tabType - The type of tab ('new', 'inProgress', or 'completed')
   * @returns The count as a number
   */
  async getTabCount(tabType: 'new' | 'inProgress' | 'completed'): Promise<number> {
    await this.page
      .locator('progressbar')
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});
    const tabCountLocator = this.getTabCountLocator(tabType);
    await tabCountLocator.waitFor({ state: 'visible', timeout: 15000 });
    const countText = await tabCountLocator.textContent();
    if (!countText) {
      return 0;
    }
    const match = countText.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  /**
   * Gets the initial tab count after navigating to Tasks section
   * Used to establish baseline count before making changes
   * @param tabType - The type of tab ('new', 'inProgress', or 'completed')
   * @returns The initial count as a number
   */
  async getInitialTabCount(tabType: 'new' | 'inProgress' | 'completed'): Promise<number> {
    await this.navigateToTasks();
    return await this.getTabCount(tabType);
  }

  /**
   * Verifies that a tab count has increased from the initial count
   * @param tabType - The type of tab ('new', 'inProgress', or 'completed')
   * @param initialCount - The initial count before the change
   */
  async verifyTabCountIncreased(tabType: 'new' | 'inProgress' | 'completed', initialCount: number): Promise<void> {
    await expect(async () => {
      const newCount = await this.getTabCount(tabType);
      expect(newCount).toBeGreaterThan(initialCount);
    }).toPass({ timeout: 20000 });
  }

  /**
   * Verifies that the "New" tab count matches the expected count
   * @param expectedCount - The expected count to verify
   */
  async verifyNewTabCount(expectedCount: number): Promise<void> {
    await expect(async () => {
      const newCount = await this.getTabCount('new');
      expect(newCount).toBe(expectedCount);
    }).toPass({ timeout: 20000 });
  }

  /**
   * Navigates to "My tasks" tab
   */
  async navigateToMyTasks(): Promise<void> {
    await this.tasksLink.click();
    await this.page.waitForLoadState('load');
    await this.page
      .locator('progressbar')
      .filter({ hasText: 'Loading…' })
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});
    await this.myTasksTab.waitFor({ state: 'visible', timeout: 15000 });
    await this.myTasksTab.click();
    await this.page.waitForLoadState('load');
    await this.page
      .locator('progressbar')
      .filter({ hasText: 'Loading…' })
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});
  }

  /**
   * Reloads the page and navigates to "My tasks" tab
   * Used after API task creation to refresh the UI
   */
  async reloadAndNavigateToMyTasks(): Promise<void> {
    await this.page.reload({ waitUntil: 'load' });
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await this.navigateToMyTasks();
  }

  /**
   * Clicks on a task by its title
   * @param taskTitle - The title of the task to click
   */
  async clickTaskByTitle(taskTitle: string): Promise<void> {
    // Wait for loading to complete and task list to be ready
    await this.page
      .locator('progressbar')
      .filter({ hasText: 'Loading…' })
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});

    // Use retry mechanism to wait for task link to appear
    // Try both link and text-based selector
    await expect(async () => {
      // Try link first
      const taskLink = this.page.getByRole('link', { name: taskTitle });
      const isVisible = await taskLink.isVisible().catch(() => false);
      if (isVisible) {
        await taskLink.click();
        return;
      }

      // If link not found, try text-based selector
      const taskElement = this.page.locator(`text=${taskTitle}`).first();
      await expect(taskElement).toBeVisible({ timeout: 5000 });
      await taskElement.click();
    }).toPass({ timeout: 30000 });
  }

  /**
   * Clicks on the task menu (3-dots button) to open action menu
   * The menu button appears on the task detail page
   * Uses Radix UI dropdown trigger pattern - looks for button that opens a menu
   */
  async clickTaskMenuButton(): Promise<void> {
    // The menu button is a Radix UI dropdown trigger
    // Try to find it by looking for a button that's a trigger for a dropdown/menu
    // or a button with aria-haspopup="menu"
    const menuButton = this.page
      .locator('button[aria-haspopup="menu"]')
      .or(this.page.locator('button[aria-label*="menu" i]'))
      .or(this.page.locator('button[aria-label*="More" i]'))
      .or(this.page.locator('button[aria-label*="Actions" i]'))
      .or(
        this.page
          .locator('button')
          .filter({ has: this.page.locator('svg') })
          .first()
      );

    await menuButton.first().waitFor({ state: 'visible', timeout: 15000 });
    await menuButton.first().click();
  }

  /**
   * Clicks the "Start task" button from the task menu
   */
  async clickStartTaskButton(): Promise<void> {
    await this.startTaskButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.startTaskButton.click();
    // Wait for the page to update after starting the task
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await this.page
      .locator('progressbar')
      .filter({ hasText: 'Loading…' })
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});
  }

  /**
   * Changes the task status to "In progress"
   */
  async changeStatusToInProgress(): Promise<void> {
    // Wait for the status element to appear with retry mechanism
    // The "In progress" is a span with data-slot="badge", not a button
    await expect(async () => {
      // Try to find the status badge/button
      const statusElement = this.page
        .locator('span[data-slot="badge"]')
        .filter({ hasText: /^In progress$/i })
        .or(this.page.getByText('In progress', { exact: true }));
      await expect(statusElement.first()).toBeVisible({ timeout: 5000 });
      await statusElement.first().click();
    }).toPass({ timeout: 20000 });
  }

  /**
   * Marks the task as completed by clicking "Mark as completed", entering a comment, and confirming
   * @param comment - Optional comment to add when marking as completed (default: "Task completed")
   */
  async markTaskAsCompleted(comment: string = 'Task completed'): Promise<void> {
    // Click "Mark as completed" button - it might be in the menu or directly visible
    await expect(async () => {
      const markCompletedButton = this.page
        .getByText('Mark as completed')
        .or(this.page.getByRole('button', { name: /mark as completed/i }));
      await markCompletedButton.waitFor({ state: 'visible', timeout: 5000 });
      await markCompletedButton.click();
    }).toPass({ timeout: 20000 });

    // Wait for dialog/modal to be visible
    await this.page
      .locator('[role="dialog"]')
      .or(this.page.locator('form'))
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});

    // Enter comment in the textbox - try multiple locator strategies
    await expect(async () => {
      // Try different locator strategies for the comment input
      let commentInput = this.page.getByRole('textbox', { name: /comment/i });
      let isVisible = await commentInput.isVisible().catch(() => false);

      if (!isVisible) {
        commentInput = this.page.getByPlaceholder(/comment/i);
        isVisible = await commentInput.isVisible().catch(() => false);
      }

      if (!isVisible) {
        commentInput = this.page.getByLabel(/comment/i);
        isVisible = await commentInput.isVisible().catch(() => false);
      }

      if (!isVisible) {
        commentInput = this.page.locator('textarea').or(this.page.getByRole('textbox'));
        isVisible = await commentInput.isVisible().catch(() => false);
      }

      if (!isVisible) {
        throw new Error('Comment input field not found');
      }

      await commentInput.waitFor({ state: 'visible', timeout: 5000 });
      await commentInput.fill(comment);
    }).toPass({ timeout: 15000 });

    // Click the confirm "Mark as completed" button in the popup
    // Use the submit button in the form (type="submit" with form="update-task-status-form")
    await expect(async () => {
      // Try the submit button with form attribute first (most specific)
      let confirmButton = this.page.locator('button[type="submit"][form="update-task-status-form"]');
      let isVisible = await confirmButton.isVisible().catch(() => false);

      if (!isVisible) {
        // Fallback to submit button in dialog
        confirmButton = this.page
          .locator('[role="dialog"]')
          .getByRole('button', { name: 'Mark as completed', exact: true })
          .filter({ has: this.page.locator('[type="submit"]') });
        isVisible = await confirmButton.isVisible().catch(() => false);
      }

      if (!isVisible) {
        // Last fallback - first submit button with "Mark as completed" text
        confirmButton = this.page
          .getByRole('button', { name: 'Mark as completed' })
          .filter({ hasText: 'Mark as completed' })
          .first();
        isVisible = await confirmButton.isVisible().catch(() => false);
      }

      if (!isVisible) {
        throw new Error('Mark as completed submit button not found');
      }

      await confirmButton.waitFor({ state: 'visible', timeout: 5000 });
      await confirmButton.click();
    }).toPass({ timeout: 15000 });

    // Wait for the page to update after marking as completed
    await this.page
      .locator('progressbar')
      .filter({ hasText: 'Loading…' })
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  }

  /**
   * Verifies that the task status is "Completed"
   */
  async verifyTaskStatusIsCompleted(): Promise<void> {
    await expect(async () => {
      const completedStatus = this.page
        .locator('span[data-slot="badge"]')
        .filter({ hasText: /^Completed$/i })
        .or(this.page.getByText('Completed', { exact: true }));
      await expect(completedStatus.first()).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout: 20000 });
  }

  /**
   * Selects the "Individuals" radio option for task assignment
   */
  async selectIndividualsRadio(): Promise<void> {
    await this.individualsRadio.waitFor({ state: 'visible', timeout: 15000 });
    await this.individualsRadio.click();
  }

  /**
   * Selects the first user from the "Add individuals" dropdown
   * This selects the first available user from the dropdown list
   */
  async selectFirstUserFromDropdown(): Promise<void> {
    await this.addIndividualsCombobox.waitFor({ state: 'visible', timeout: 15000 });
    await this.addIndividualsCombobox.click();
    // Wait for dropdown to open and first option to be visible
    await this.page
      .locator('.flex.shrink-0.items-center.justify-center')
      .first()
      .waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator('.flex.shrink-0.items-center.justify-center').first().click();
  }

  /**
   * Selects multiple users (first 3) from the "Add individuals" dropdown
   * This selects the first 3 available users from the dropdown list
   * @returns Array of selected user names (may be empty if names cannot be extracted from dropdown)
   */
  async selectMultipleUsersFromDropdown(count: number = 3): Promise<string[]> {
    await this.addIndividualsCombobox.waitFor({ state: 'visible', timeout: 15000 });
    await this.addIndividualsCombobox.click();

    // Wait for dropdown to open
    await this.page.waitForTimeout(500);

    const selectedUserNames: string[] = [];
    // Find all user options in the dropdown - look for the actual user list items
    // The dropdown typically has options that can be clicked to select users
    const userOptions = this.page
      .locator('[role="listbox"] [role="option"]')
      .or(this.page.locator('[role="menu"] [role="menuitem"]'))
      .or(this.page.locator('.flex.shrink-0.items-center.justify-center'));

    // Get count of available options
    const optionCount = await userOptions.count();
    const usersToSelect = Math.min(count, optionCount);

    // Select first N users from the dropdown
    // Keep dropdown open by not clicking outside between selections
    for (let i = 0; i < usersToSelect; i++) {
      // Re-query the options each time in case the list updates
      const currentOptions = this.page
        .locator('[role="listbox"] [role="option"]')
        .or(this.page.locator('[role="menu"] [role="menuitem"]'))
        .or(this.page.locator('.flex.shrink-0.items-center.justify-center'));

      const userOption = currentOptions.nth(i);
      await userOption.waitFor({ state: 'visible', timeout: 10000 });

      // Try to get user name from the option element or its parent
      try {
        // Try getting text from the option itself
        let userName = await userOption.textContent().catch(() => '');

        // If empty, try getting from parent element
        if (!userName?.trim()) {
          const parentElement = userOption.locator('..');
          userName = await parentElement.textContent().catch(() => '');
        }

        if (userName?.trim()) {
          // Clean up the name (remove any extra whitespace, newlines, or icons)
          const cleanName = userName.trim().split('\n')[0].trim().replace(/\s+/g, ' ');
          if (cleanName && cleanName.length > 1 && !selectedUserNames.includes(cleanName)) {
            selectedUserNames.push(cleanName);
          }
        }
      } catch {
        // If we can't get the name from dropdown, that's okay - we'll verify from task detail page
      }

      // Click the user option to select it
      await userOption.click();

      // Wait a bit for the selection to register and UI to update
      // Check if dropdown is still open - if not, we might need to reopen it
      await this.page.waitForTimeout(500);

      // Verify dropdown is still open (for multi-select, it should stay open)
      const dropdownVisible = await this.page
        .locator('[role="listbox"], [role="menu"]')
        .isVisible()
        .catch(() => false);

      // If dropdown closed and we have more users to select, reopen it
      if (!dropdownVisible && i < usersToSelect - 1) {
        await this.addIndividualsCombobox.click();
        await this.page.waitForTimeout(500);
      }
    }

    return selectedUserNames;
  }

  /**
   * Verifies that the task is assigned to a specific user
   * @param userName - The expected user name (e.g., "Amber Rich")
   */
  async verifyAssignedToUser(userName: string): Promise<void> {
    // Verify "Assigned to:" label is visible
    const assignedToLabel = this.page.getByText(/Assigned to:/i).first();
    await expect(assignedToLabel).toBeVisible({ timeout: 10000 });

    // Get the text content of the element containing "Assigned to:"
    // This element should also contain the user name
    const assignedToElement = this.page
      .locator('div, span, label, p, li, td')
      .filter({ hasText: /Assigned to:/i })
      .first();
    const assignedToText = await assignedToElement.textContent();

    if (!assignedToText) {
      throw new Error('Assigned to text not found');
    }

    // Extract user name from "Assigned to: User Name" - try multiple patterns
    let match = assignedToText.match(/Assigned to:\s*([^\n\r]+?)(?:\s*(?:Completion|Priority|Due date|Created by)|$)/i);
    if (!match) {
      // Try without colon
      match = assignedToText.match(/Assigned to\s+([^\n\r]+?)(?:\s*(?:Completion|Priority|Due date|Created by)|$)/i);
    }
    if (!match) {
      // Fallback: just get text after "Assigned to:" up to next label or end
      const parts = assignedToText.split(/Assigned to:?\s*/i);
      if (parts.length > 1) {
        const extractedName = parts[1].split(/\s*(?:Completion|Priority|Due date|Created by)/i)[0].trim();
        expect(extractedName).toBe(userName);
        return;
      }
    }

    // Verify the extracted user name matches
    const extractedName = match ? match[1].trim() : '';
    expect(extractedName).toBe(userName);
  }

  /**
   * Verifies that the task was created by a specific user
   * @param userName - The expected user name (e.g., "Saran Kumar")
   */
  async verifyCreatedByUser(userName: string): Promise<void> {
    // Verify "Created by:" label is visible
    const createdByLabel = this.page.getByText(/Created by:/i).first();
    await expect(createdByLabel).toBeVisible({ timeout: 10000 });

    // Get the text content of the element containing "Created by:"
    // This element should also contain the user name
    const createdByElement = this.page
      .locator('div, span, label, p, li, td')
      .filter({ hasText: /Created by:/i })
      .first();
    const createdByText = await createdByElement.textContent();

    if (!createdByText) {
      throw new Error('Created by text not found');
    }

    // Extract user name from "Created by: User Name" - try multiple patterns
    let match = createdByText.match(/Created by:\s*([^\n\r]+?)(?:\s*(?:Download|Privacy|Terms|Powered|Copyright|$))/i);
    if (!match) {
      // Try without colon
      match = createdByText.match(/Created by\s+([^\n\r]+?)(?:\s*(?:Download|Privacy|Terms|Powered|Copyright|$))/i);
    }
    if (!match) {
      // Fallback: just get text after "Created by:" up to next label or end
      const parts = createdByText.split(/Created by:?\s*/i);
      if (parts.length > 1) {
        const extractedName = parts[1].split(/\s*(?:Download|Privacy|Terms|Powered|Copyright)/i)[0].trim();
        expect(extractedName).toBe(userName);
        return;
      }
    }

    // Verify the extracted user name matches
    const extractedName = match ? match[1].trim() : '';
    expect(extractedName).toBe(userName);
  }

  /**
   * Gets the assigned user name from the task detail page
   * @returns The assigned user name
   */
  async getAssignedUserName(): Promise<string> {
    // Wait for assigned to text to be visible - use first() to handle strict mode violation
    await this.page
      .getByText(/Assigned to:/i)
      .first()
      .waitFor({ state: 'visible', timeout: 15000 });

    // Get the text content - find the element that contains both "Assigned to:" and the user name
    // Look for the parent element that contains the full text
    const assignedToElement = this.page
      .locator('div, span, label, p, li, td')
      .filter({ hasText: /Assigned to:/i })
      .first();
    const assignedToText = await assignedToElement.textContent();

    if (!assignedToText) {
      throw new Error('Assigned to text not found');
    }

    // Extract user name from "Assigned to: User Name" - stop at next label (Completion, Priority, etc.)
    let match = assignedToText.match(/Assigned to:\s*([^\n\r]+?)(?:\s*(?:Completion|Priority|Due date|Created by)|$)/i);
    if (!match) {
      // Try without colon
      match = assignedToText.match(/Assigned to\s+([^\n\r]+?)(?:\s*(?:Completion|Priority|Due date|Created by)|$)/i);
    }
    if (!match) {
      // Fallback: just get text after "Assigned to:" up to next label or end
      const parts = assignedToText.split(/Assigned to:?\s*/i);
      if (parts.length > 1) {
        return parts[1].split(/\s*(?:Completion|Priority|Due date|Created by)/i)[0].trim();
      }
    }
    return match ? match[1].trim() : '';
  }

  /**
   * Gets all assigned user names from the task detail page (for multiple users)
   * @returns Array of assigned user names
   */
  async getAssignedUserNames(): Promise<string[]> {
    // Wait for assigned to text to be visible
    await this.page
      .getByText(/Assigned to:/i)
      .first()
      .waitFor({ state: 'visible', timeout: 15000 });

    // Try to find user names as separate elements (chips/badges) first
    // Multiple users might be displayed as separate elements, not just text
    const userChips = this.page
      .locator('div, span, label, p, li, td')
      .filter({ hasText: /Assigned to:/i })
      .first()
      .locator('span, div, a')
      .filter({ hasNotText: /Assigned to|Completion|Priority|Due date|Created by/i });

    const chipCount = await userChips.count();
    if (chipCount > 1) {
      // If we found multiple chips/elements, extract names from each
      const names: string[] = [];
      for (let i = 0; i < chipCount; i++) {
        const chipText = await userChips
          .nth(i)
          .textContent()
          .catch(() => '');
        if (chipText?.trim() && !chipText.match(/Assigned to|Completion|Priority|Due date|Created by/i)) {
          const cleanName = chipText.trim();
          if (cleanName.length > 0 && !names.includes(cleanName)) {
            names.push(cleanName);
          }
        }
      }
      if (names.length > 0) {
        return names;
      }
    }

    // Fallback: Get the text content and parse it
    const assignedToElement = this.page
      .locator('div, span, label, p, li, td')
      .filter({ hasText: /Assigned to:/i })
      .first();
    const assignedToText = await assignedToElement.textContent();

    if (!assignedToText) {
      throw new Error('Assigned to text not found');
    }

    // Extract all user names from "Assigned to: User1, User2, User3" or "Assigned to: User1 User2 User3"
    // Stop at next label (Completion, Priority, etc.)
    let match = assignedToText.match(/Assigned to:\s*([^\n\r]+?)(?:\s*(?:Completion|Priority|Due date|Created by)|$)/i);
    if (!match) {
      // Try without colon
      match = assignedToText.match(/Assigned to\s+([^\n\r]+?)(?:\s*(?:Completion|Priority|Due date|Created by)|$)/i);
    }

    if (!match) {
      // Fallback: just get text after "Assigned to:" up to next label or end
      const parts = assignedToText.split(/Assigned to:?\s*/i);
      if (parts.length > 1) {
        const userNamesText = parts[1].split(/\s*(?:Completion|Priority|Due date|Created by)/i)[0].trim();
        // Split by comma first, then by spaces if no comma
        if (userNamesText.includes(',')) {
          return userNamesText
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        }
        // If no comma, the text might be a single name or multiple names
        // Since names typically have spaces (e.g., "Amber Rich"), we can't reliably split
        // Return as single name - if multiple users are selected, they should be comma-separated
        return userNamesText ? [userNamesText] : [];
      }
      return [];
    }

    const userNamesText = match[1].trim();
    // Split by comma first (most reliable)
    if (userNamesText.includes(',')) {
      return userNamesText
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    }

    // If no comma, the entire text might be a single name or multiple names separated by spaces
    // This is ambiguous, so return as single name for now
    // In practice, multiple users should be comma-separated
    return userNamesText ? [userNamesText] : [];
  }

  /**
   * Gets the created by user name from the task detail page
   * @returns The created by user name
   */
  async getCreatedByUserName(): Promise<string> {
    // Wait for created by text to be visible - use first() to handle strict mode violation
    await this.page
      .getByText(/Created by:/i)
      .first()
      .waitFor({ state: 'visible', timeout: 15000 });

    // Get the text content - find the element that contains both "Created by:" and the user name
    // Look for the parent element that contains the full text
    const createdByElement = this.page
      .locator('div, span, label, p, li, td')
      .filter({ hasText: /Created by:/i })
      .first();
    const createdByText = await createdByElement.textContent();

    if (!createdByText) {
      throw new Error('Created by text not found');
    }

    // Extract user name from "Created by: User Name" - stop at next label (Download, Privacy, etc.)
    let match = createdByText.match(/Created by:\s*([^\n\r]+?)(?:\s*(?:Download|Privacy|Terms|Powered|Copyright|$))/i);
    if (!match) {
      // Try without colon
      match = createdByText.match(/Created by\s+([^\n\r]+?)(?:\s*(?:Download|Privacy|Terms|Powered|Copyright|$))/i);
    }
    if (!match) {
      // Fallback: just get text after "Created by:" up to next label or end
      const parts = createdByText.split(/Created by:?\s*/i);
      if (parts.length > 1) {
        return parts[1].split(/\s*(?:Download|Privacy|Terms|Powered|Copyright)/i)[0].trim();
      }
    }
    return match ? match[1].trim() : '';
  }

  /**
   * Creates a task with user assignment (selects first user from dropdown)
   * Uses existing fillTaskDetails method and adds user assignment
   * @param title - Task title
   * @param description - Task description
   */
  async createTaskWithUserAssignment(title: string, description: string): Promise<void> {
    // Open create task form
    await this.openCreateTaskForm();

    // Fill task details (title, priority, date) - using existing method
    await this.fillTaskDetails(title, description);

    // Select "Individuals" radio option (instead of "Myself")
    await this.selectIndividualsRadio();

    // Select first user from dropdown
    await this.selectFirstUserFromDropdown();

    // Click on the element that contains "CancelCreate task" text (closes dropdown/overlay)
    await this.page.getByText('CancelCreate task').waitFor({ state: 'visible', timeout: 10000 });
    await this.page.getByText('CancelCreate task').click();

    // Wait for dropdown/overlay to close
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Create the task - use retry mechanism in case button is not immediately clickable
    await expect(async () => {
      await this.createTaskButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.createTaskButton.waitFor({ state: 'attached', timeout: 5000 });
      try {
        await this.createTaskButton.click({ timeout: 3000 });
      } catch {
        // If click fails, try force click
        await this.createTaskButton.click({ force: true });
      }
    }).toPass({ timeout: 20000 });

    // Wait for success notification and page to stabilize
    await this.page
      .getByText('Task created')
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});

    // Wait for loading to complete and main navigation to be visible
    await this.page
      .locator('progressbar')
      .filter({ hasText: 'Loading…' })
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});

    await this.page
      .getByTestId('main-nav')
      .waitFor({ state: 'visible', timeout: 15000 })
      .catch(() => {});

    // Navigate to Tasks to find the created task
    await this.navigateToTasks();

    // Click on the created task to view details
    await this.clickTaskByTitle(title);
  }

  /**
   * Verifies that the task is assigned to a user and created by a user
   * Verifies both assigned to and created by are displayed correctly
   */
  async verifyTaskAssignmentAndCreatedBy(): Promise<void> {
    // Get the assigned user name and created by user name
    const assignedUserName = await this.getAssignedUserName();
    const createdByUserName = await this.getCreatedByUserName();

    // Verify assigned to shows a user name (first user from dropdown)
    expect(assignedUserName).toBeTruthy();
    expect(assignedUserName.length).toBeGreaterThan(0);

    // Verify created by shows a user name (logged-in user)
    expect(createdByUserName).toBeTruthy();
    expect(createdByUserName.length).toBeGreaterThan(0);

    // Verify both are displayed correctly
    await this.verifyAssignedToUser(assignedUserName);
    await this.verifyCreatedByUser(createdByUserName);
  }

  /**
   * Verifies that the task is assigned to multiple users
   * @param expectedUserNames - Array of expected user names (optional, if empty will verify count from page)
   * @param expectedCount - Expected number of users (default: 3)
   */
  async verifyMultipleAssignedUsers(expectedUserNames: string[] = [], expectedCount: number = 3): Promise<void> {
    // Verify "Assigned to:" label is visible
    const assignedToLabel = this.page.getByText(/Assigned to:/i).first();
    await expect(assignedToLabel).toBeVisible({ timeout: 10000 });

    // Get all assigned user names from the page
    const assignedUserNames = await this.getAssignedUserNames();

    // Verify we have at least the expected number of users
    expect(
      assignedUserNames.length,
      `Expected at least ${expectedCount} assigned users, but found ${assignedUserNames.length}: ${assignedUserNames.join(', ')}`
    ).toBeGreaterThanOrEqual(expectedCount);

    // If expected user names were provided, verify each appears in the assigned users list
    if (expectedUserNames.length > 0) {
      for (const expectedName of expectedUserNames) {
        if (expectedName.trim()) {
          const found = assignedUserNames.some(
            name =>
              name.toLowerCase().includes(expectedName.toLowerCase()) ||
              expectedName.toLowerCase().includes(name.toLowerCase())
          );
          expect(
            found,
            `Expected user "${expectedName}" not found in assigned users: ${assignedUserNames.join(', ')}`
          ).toBe(true);
        }
      }
    }
  }

  /**
   * Creates a task with multiple user assignments (selects first N users from dropdown)
   * @param title - Task title
   * @param description - Task description
   * @param userCount - Number of users to assign (default: 3)
   * @returns Array of selected user names
   */
  async createTaskWithMultipleUserAssignment(
    title: string,
    description: string,
    userCount: number = 3
  ): Promise<string[]> {
    // Open create task form
    await this.openCreateTaskForm();

    // Fill task details (title, priority, date) - using existing method
    await this.fillTaskDetails(title, description);

    // Select "Individuals" radio option (instead of "Myself")
    await this.selectIndividualsRadio();

    // Select multiple users from dropdown
    const selectedUserNames = await this.selectMultipleUsersFromDropdown(userCount);

    // Click on the element that contains "CancelCreate task" text (closes dropdown/overlay)
    await this.page.getByText('CancelCreate task').waitFor({ state: 'visible', timeout: 10000 });
    await this.page.getByText('CancelCreate task').click();

    // Wait for dropdown/overlay to close
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Create the task - use retry mechanism in case button is not immediately clickable
    await expect(async () => {
      await this.createTaskButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.createTaskButton.waitFor({ state: 'attached', timeout: 5000 });
      try {
        await this.createTaskButton.click({ timeout: 3000 });
      } catch {
        // If click fails, try force click
        await this.createTaskButton.click({ force: true });
      }
    }).toPass({ timeout: 20000 });

    // Wait for success notification and page to stabilize
    await this.page
      .getByText('Task created')
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});

    // Wait for loading to complete and main navigation to be visible
    await this.page
      .locator('progressbar')
      .filter({ hasText: 'Loading…' })
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});

    await this.page
      .getByTestId('main-nav')
      .waitFor({ state: 'visible', timeout: 15000 })
      .catch(() => {});

    // Navigate to Tasks to find the created task
    await this.navigateToTasks();

    // Click on the created task to view details
    await this.clickTaskByTitle(title);

    return selectedUserNames;
  }
}
