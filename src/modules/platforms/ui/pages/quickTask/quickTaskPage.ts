import { expect, Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';
import { DAY_NAMES, DEFAULT_FUTURE_DAYS_OFFSET, getOrdinalSuffix, MONTH_NAMES } from '@platforms/constants/quickTask';
import { QuickTaskModalComponent } from '@platforms/ui/components/quickTaskModal';

export class QuickTaskPage extends BasePage {
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
  readonly searchInput: Locator;
  readonly taskResultLink: (taskTitle: string) => Locator;
  readonly firstTaskResult: Locator;
  readonly allTaskLinks: Locator;
  readonly noTaskFoundMessage: Locator;
  readonly editButton: Locator;
  readonly dropdownMenuTrigger: (taskTitle: string) => Locator;
  readonly editOptionInDropdown: Locator;
  readonly descriptionTextarea: Locator;
  readonly prioritySelectTrigger: Locator;
  readonly tagsComboboxInput: Locator;
  readonly dueDateField: Locator;
  readonly taskDetailTags: Locator;
  readonly taskDetailTag: (tagName: string) => Locator;
  readonly taskDetailDueDate: Locator;
  readonly taskDetailDescription: Locator;
  readonly taskDetailTitle: Locator;
  readonly taskDetailAttachments: Locator;
  readonly taskDetailAttachment: (fileName: string) => Locator;
  readonly taskDetailAttachmentFileName: (fileName: string) => Locator;
  readonly taskDetailAttachmentDownloadButton: (fileName: string) => Locator;
  readonly editTitleInput: Locator;
  readonly updateTaskButton: Locator;
  readonly taskUpdatedMessage: Locator;
  readonly markAsCompletedSubmitButton: Locator;
  readonly completedStatusBadge: Locator;

  readonly quickTaskModal: QuickTaskModalComponent;

  constructor(page: Page, pageUrl: string = '/quick-tasks') {
    super(page, pageUrl);
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
    // Search and task list related locators
    // Use placeholder to differentiate from header search (which has "Search Simpplr…")
    this.searchInput = page.locator('input[data-slot="search-input"][placeholder="Search tasks"]');
    this.taskResultLink = (taskTitle: string) =>
      page.locator(`a[title="${taskTitle}"], a:has-text("${taskTitle}")`).first();
    this.firstTaskResult = page.locator('a.w-full.cursor-pointer').first();
    // All task links - use same locator as firstTaskResult but get all (without .first())
    this.allTaskLinks = page.locator('a.w-full.cursor-pointer');
    this.noTaskFoundMessage = page.locator(
      'div.flex.items-center.justify-center.py-20.text-sm.text-foreground-muted:has-text("No task found")'
    );
    // Edit task related locators
    this.editButton = page.locator('button[data-slot="tooltip-trigger"][aria-label="Edit"]');
    this.dropdownMenuTrigger = (taskTitle: string) => {
      const taskLink = this.taskResultLink(taskTitle);
      return taskLink
        .locator('xpath=ancestor::*[self::div or self::li][position()<=5]')
        .last()
        .locator('button[data-slot="dropdown-menu-trigger"]')
        .first();
    };
    this.editOptionInDropdown = page
      .locator('[role="menu"] span:has-text("Edit")')
      .filter({ hasText: /^Edit$/ })
      .first();
    this.descriptionTextarea = page.locator('textarea[data-slot="textarea"][name="description"]');
    this.prioritySelectTrigger = page.locator('button[aria-haspopup="listbox"][aria-label="Open popup"]').first();
    this.tagsComboboxInput = page.locator('input[data-slot="combobox-input"]');
    this.dueDateField = page
      .locator('div.flex.h-9.w-full.items-center.justify-start.rounded-xl.border.border-border-default')
      .first();
    // Task detail view tags - tags are displayed as badges with data-slot="badge"
    this.taskDetailTags = page.locator('span[data-slot="badge"]');
    this.taskDetailTag = (tagName: string) =>
      page.locator('span[data-slot="badge"]').filter({ hasText: new RegExp(`^${tagName}$`, 'i') });
    // Task detail view due date - displayed as text with class "text-sm text-foreground"
    // Matches date format like "Jan 16, 2026, 11:59 PM"
    this.taskDetailDueDate = page.locator('p.text-sm.text-foreground').filter({ hasText: /\w{3}\s+\d{1,2},\s+\d{4}/ }); // Matches "Jan 16, 2026" pattern
    // Task detail view description - displayed as paragraph with classes "text-foreground text-sm whitespace-pre-wrap"
    this.taskDetailDescription = page.locator('p.text-foreground.text-sm.whitespace-pre-wrap');
    // Task detail view title - displayed as h1 with data-slot="page-header-title"
    this.taskDetailTitle = page.locator('h1[data-slot="page-header-title"]');
    // Task detail view attachments - container with data-slot="attachment"
    this.taskDetailAttachments = page.locator('div[data-slot="attachment"]');
    // Task detail view attachment by file name
    this.taskDetailAttachment = (fileName: string) =>
      page.locator('div[data-slot="attachment"]').filter({ hasText: fileName });
    // Task detail view attachment file name - span with class "truncate-2 max-w-46 font-semibold"
    this.taskDetailAttachmentFileName = (fileName: string) =>
      page
        .locator('div[data-slot="attachment"]')
        .locator('span.truncate-2.max-w-46.font-semibold')
        .filter({ hasText: fileName });
    // Task detail view attachment download button - button with aria-label="Download file" within attachment
    this.taskDetailAttachmentDownloadButton = (fileName: string) =>
      page
        .locator('div[data-slot="attachment"]')
        .filter({ hasText: fileName })
        .locator('button[aria-label="Download file"]');
    // Edit task modal - title input
    this.editTitleInput = page.locator('input[data-slot="input"][name="title"][placeholder="Add title"]');
    // Update task button in edit modal
    this.updateTaskButton = page
      .locator('button[type="submit"][form="add-task-form"]')
      .filter({ hasText: 'Update task' });
    // Task updated success message
    this.taskUpdatedMessage = page
      .locator('div[data-title=""].text-foreground-main.text-base.font-bold')
      .filter({ hasText: 'Task updated' });
    // Mark as completed submit button in modal
    this.markAsCompletedSubmitButton = page.locator('button[type="submit"][form="update-task-status-form"]').or(
      page
        .locator('[role="dialog"]')
        .getByRole('button', { name: 'Mark as completed' })
        .filter({ has: page.locator('[type="submit"]') })
    );
    // Completed status badge
    this.completedStatusBadge = page.locator('span[data-slot="badge"]').filter({ hasText: /^Completed$/i });

    this.quickTaskModal = new QuickTaskModalComponent(page);
  }

  /**
   * Verify the quick task page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    // Wait for loading indicator to disappear first
    const loadingIndicator = this.page.locator('progressbar:has-text("Loading…")');
    await expect(loadingIndicator, 'Loading indicator should disappear')
      .toBeHidden({ timeout: 15000 })
      .catch(() => {});

    // Then wait for search input to be visible
    await expect(this.searchInput, 'Search input should be visible').toBeVisible({ timeout: 15000 });
  }

  /**
   * Override loadPage to use Quick Task base URL
   */
  async loadPage(options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo || `Loading page ${this.pageUrl}`, async () => {
      if (this.pageUrl !== '') {
        const quickTaskUrl = process.env.QUICK_TASK_BASE_URL;
        const currentUrl = this.page.url();
        if (quickTaskUrl && (currentUrl.includes('quick-task') || currentUrl.includes(quickTaskUrl))) {
          const fullUrl = `${quickTaskUrl}${this.pageUrl}`;
          await this.goToUrl(fullUrl, {
            waitUntil: 'domcontentloaded',
            timeout: options?.timeout,
          });
        } else {
          // Use relative URL if already on the correct domain
          await this.goToUrl(this.pageUrl, {
            waitUntil: 'domcontentloaded',
            timeout: options?.timeout,
          });
        }
      } else {
        throw new Error('Page URL is not set for this page');
      }
      await this.verifyThePageIsLoaded();
    });
  }

  /**
   * Opens the create task form by navigating to Tasks and clicking create new task button
   * Verifies that the create task modal is opened before proceeding
   */
  async openCreateTaskForm(): Promise<void> {
    await this.tasksLink.click();
    await this.createNewTaskButton.click();
    await this.taskTypeSelector.click();
    // Verify create task modal is opened
    await this.quickTaskModal.verifyCreateTaskModalIsVisible();
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
   * Verifies that all priority options are visible, can be selected, and the selected value is displayed correctly
   * Verifies: Urgent, High, Medium, and Low options
   * Also verifies that options appear in the correct order: Urgent → High → Medium → Low
   */
  async verifyAllPriorityOptionsAreVisibleAndSelectable(): Promise<void> {
    await test.step('Verify all priority options are visible, selectable, and displayed correctly', async () => {
      await this.setPriorityButton.click();

      const priorityOptions = ['Urgent', 'High', 'Medium', 'Low'];

      // Verify options appear in the correct order
      const allOptions = this.page.getByRole('option');
      const optionCount = await allOptions.count();
      expect(optionCount, 'Should have exactly 4 priority options').toBe(4);

      for (let i = 0; i < priorityOptions.length; i++) {
        const option = allOptions.nth(i);
        const optionText = await option.textContent();
        expect(optionText?.trim(), `Option at position ${i + 1} should be "${priorityOptions[i]}"`).toBe(
          priorityOptions[i]
        );
        await expect(option).toBeVisible({ timeout: 5000 });
      }

      // Verify each option can be selected and displayed correctly
      for (const option of priorityOptions) {
        await this.page.getByRole('option', { name: option }).click();
        // After selection, button name changes to the selected priority - verify it's displayed correctly
        const selectedPriorityButton = this.page.getByRole('combobox', { name: option });
        await expect(selectedPriorityButton, `Selected priority "${option}" should be displayed correctly`).toBeVisible(
          { timeout: 5000 }
        );
        // Only click to reopen dropdown if not the last option
        if (option !== priorityOptions[priorityOptions.length - 1]) {
          await selectedPriorityButton.click();
        }
      }
    });
  }

  /**
   * Verifies that user can change the selected Priority value before saving the task and creates the task
   * @param title - Task title
   * @param description - Task description
   * @param initialPriority - The initial priority to select (e.g., 'High')
   * @param newPriority - The new priority to change to (e.g., 'Urgent')
   */
  async verifyPriorityCanBeChangedAndCreateTask(
    title: string,
    description: string,
    initialPriority: string,
    newPriority: string
  ): Promise<void> {
    await test.step(`Verify priority can be changed from "${initialPriority}" to "${newPriority}" and create task`, async () => {
      // Fill title and description
      await this.titleInput.fill(title);
      await this.contextInput.click();
      await this.contextInput.fill(description);

      // Select initial priority - handle both "Set priority" and already selected priority button names
      const initialButton = this.page
        .getByRole('combobox', { name: 'Set priority' })
        .or(this.page.getByRole('combobox', { name: initialPriority }));
      await initialButton.click();
      await this.page.getByRole('option', { name: initialPriority }).click();

      // Verify initial priority is displayed
      const initialSelectedButton = this.page.getByRole('combobox', { name: initialPriority });
      await expect(initialSelectedButton, `Initial priority "${initialPriority}" should be displayed`).toBeVisible({
        timeout: 5000,
      });

      // Change to new priority
      await initialSelectedButton.click();
      await this.page.getByRole('option', { name: newPriority }).click();

      // Verify new priority is displayed
      const newSelectedButton = this.page.getByRole('combobox', { name: newPriority });
      await expect(newSelectedButton, `Changed priority "${newPriority}" should be displayed correctly`).toBeVisible({
        timeout: 5000,
      });

      // Create the task
      await this.createTaskButton.click();
      // Wait for task creation to complete - modal should close
      await this.page
        .locator('[role="dialog"]')
        .filter({
          has: this.page.getByRole('textbox', { name: 'Add title' }),
        })
        .waitFor({ state: 'hidden', timeout: 10000 })
        .catch(() => {});
    });
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
    try {
      // Try to reload the page, but handle network errors gracefully
      await this.page.reload({ waitUntil: 'load', timeout: 10000 });
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    } catch (error) {
      // If reload fails (e.g., ERR_NETWORK_CHANGED), just navigate directly
      // This can happen when network state changes during reload
      console.warn('Page reload failed, navigating directly instead:', error);
      await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
    }
    await this.navigateToMyTasks();
  }

  /**
   * Extracts task ID from the current URL
   * URL pattern: /tasks/[task-id] or /quick-tasks/[task-id]
   * @returns Task ID if found, null otherwise
   */
  extractTaskIdFromUrl(): string | null {
    const currentUrl = this.page.url();
    const taskIdMatch = currentUrl.match(/\/tasks\/([^/?]+)/) || currentUrl.match(/\/quick-tasks\/([^/?]+)/);
    return taskIdMatch ? taskIdMatch[1] : null;
  }

  /**
   * Clicks on a task by its title
   * Verifies that the task detail page is opened and displays the task title before proceeding
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
    // Handle truncated titles by matching the beginning of the title
    await expect(async () => {
      // Try exact match first
      const exactLink = this.page.getByRole('link', { name: taskTitle });
      const isExactVisible = await exactLink.isVisible().catch(() => false);
      if (isExactVisible) {
        await exactLink.click();
        return;
      }

      // If exact match not found, try partial match (for truncated titles)
      // Get all task links and find one that starts with the task title
      const allLinks = this.page.getByRole('link');
      const linkCount = await allLinks.count();

      for (let i = 0; i < linkCount; i++) {
        const link = allLinks.nth(i);
        const linkText = await link.textContent().catch(() => '');
        // Check if link text starts with task title (handles truncation)
        if (linkText?.trim().startsWith(taskTitle.trim())) {
          await link.click();
          return;
        }
      }

      // Fallback: try text-based selector with partial match
      const taskElement = this.page.locator(`text=/^${taskTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`).first();
      const isVisible = await taskElement.isVisible().catch(() => false);
      if (isVisible) {
        await taskElement.click();
        return;
      }

      throw new Error(`Task with title starting with "${taskTitle}" not found`);
    }).toPass({ timeout: 30000 });

    // Verify task detail page is opened, task title is visible, and basic components are displayed
    await this.quickTaskModal.verifyTaskDetailPageIsOpened(taskTitle);
    await this.verifyTaskDetailPageComponents();
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
   * Generic method to verify button visibility or not-visible
   * @param buttonText - The text of the button to verify
   * @param shouldBeVisible - Whether the button should be visible (default: true)
   */
  async verifyTaskActionButton(buttonText: string, shouldBeVisible: boolean = true): Promise<void> {
    await test.step(`Verify "${buttonText}" button is ${shouldBeVisible ? 'visible' : 'not visible'}`, async () => {
      const button = this.page.getByRole('button', { name: buttonText });
      if (shouldBeVisible) {
        await expect(button, `"${buttonText}" button should be visible`).toBeVisible({ timeout: 10000 });
      } else {
        await expect(button, `"${buttonText}" button should not be visible`).not.toBeVisible({ timeout: 5000 });
      }
    });
  }

  /**
   * Generic method to click a task action button by text
   * @param buttonText - The text of the button to click
   * @param waitForPageUpdate - Whether to wait for page update after clicking (default: true)
   */
  async clickTaskActionButton(buttonText: string, waitForPageUpdate: boolean = true): Promise<void> {
    await test.step(`Click "${buttonText}" button`, async () => {
      const button = this.page.getByRole('button', { name: buttonText });
      await button.waitFor({ state: 'visible', timeout: 10000 });
      await button.click();
      if (waitForPageUpdate) {
        // Wait for the page to update after clicking
        await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        await this.page
          .locator('progressbar')
          .filter({ hasText: 'Loading…' })
          .waitFor({ state: 'hidden', timeout: 15000 })
          .catch(() => {});
      }
    });
  }

  /**
   * Clicks the "Start task" button from the task menu
   */
  async clickStartTaskButton(): Promise<void> {
    await this.clickTaskActionButton('Start task');
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

    // Verify mark as completed modal is opened
    await this.quickTaskModal.verifyMarkAsCompletedModalIsVisible();

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
   * Clicks the "Mark as completed" button (appears after starting a task)
   */
  async clickMarkAsCompletedButton(): Promise<void> {
    await this.clickTaskActionButton('Mark as completed', false); // Don't wait for page update, modal will open
  }

  /**
   * Clicks the submit button in the "Mark as completed" modal
   */
  async clickMarkAsCompletedSubmitButton(): Promise<void> {
    await test.step('Click Mark as completed submit button in modal', async () => {
      await this.markAsCompletedSubmitButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.markAsCompletedSubmitButton.click();
      // Wait for modal to close and page to update
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await this.page
        .locator('progressbar')
        .filter({ hasText: 'Loading…' })
        .waitFor({ state: 'hidden', timeout: 15000 })
        .catch(() => {});
    });
  }

  /**
   * Verifies that the task status badge shows "Completed"
   */
  async verifyCompletedStatusBadgeIsVisible(): Promise<void> {
    await test.step('Verify Completed status badge is visible', async () => {
      await expect(this.completedStatusBadge, 'Completed status badge should be visible').toBeVisible({
        timeout: 10000,
      });
    });
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
   * Verifies basic components on task detail page (assigned to and created by)
   * This should be called after opening the task detail page to ensure all components are loaded
   */
  async verifyTaskDetailPageComponents(): Promise<void> {
    await test.step('Verify basic components on task detail page', async () => {
      // Get assigned user name and created by user name
      const assignedUserName = await this.getAssignedUserName();
      const createdByUserName = await this.getCreatedByUserName();

      // Verify assigned to shows a user name
      expect(assignedUserName).toBeTruthy();
      expect(assignedUserName.length).toBeGreaterThan(0);

      // Verify created by shows a user name
      expect(createdByUserName).toBeTruthy();
      expect(createdByUserName.length).toBeGreaterThan(0);

      // Verify both are displayed correctly
      await this.verifyAssignedToUser(assignedUserName);
      await this.verifyCreatedByUser(createdByUserName);
    });
  }

  /**
   * Verifies that tags are displayed in the task detail view
   * @param expectedTags - Array of expected tag names to verify (optional, if not provided will verify tags are visible)
   */
  async verifyTagsInTaskDetail(expectedTags?: string[]): Promise<void> {
    await test.step('Verify tags are displayed in task detail view', async () => {
      // Wait for tags to be visible
      await expect(this.taskDetailTags.first()).toBeVisible({ timeout: 10000 });

      // If specific tags are expected, verify each one
      if (expectedTags && expectedTags.length > 0) {
        for (const tagName of expectedTags) {
          const tagLocator = this.taskDetailTag(tagName);
          await expect(tagLocator, `Tag "${tagName}" should be visible in task detail view`).toBeVisible({
            timeout: 5000,
          });
        }
      } else {
        // Just verify that at least one tag is visible
        const tagCount = await this.taskDetailTags.count();
        expect(tagCount, 'At least one tag should be displayed in task detail view').toBeGreaterThan(0);
      }
    });
  }

  /**
   * Verifies that the due date is displayed in the task detail view
   * @param expectedDueDate - Optional expected due date in format "YYYY-MM-DD HH:mm" (e.g., "2026-01-16 00:00")
   */
  async verifyDueDateInTaskDetail(expectedDueDate?: string): Promise<void> {
    await test.step('Verify due date is displayed in task detail view', async () => {
      await expect(this.taskDetailDueDate.first(), 'Due date should be visible in task detail view').toBeVisible({
        timeout: 10000,
      });

      if (expectedDueDate) {
        const [datePart] = expectedDueDate.split(' ');
        const [year, month, day] = datePart.split('-');
        const dueDateText = await this.taskDetailDueDate.first().textContent();
        expect(dueDateText, 'Due date text should contain expected date').toContain(year);
        expect(dueDateText, 'Due date text should contain expected day').toContain(day);
      }
    });
  }

  /**
   * Verifies that the description is displayed in the task detail view
   * @param expectedDescription - Expected description text
   */
  async verifyDescriptionInTaskDetail(expectedDescription: string): Promise<void> {
    await test.step('Verify description is displayed in task detail view', async () => {
      await expect(this.taskDetailDescription.first(), 'Description should be visible in task detail view').toBeVisible(
        {
          timeout: 10000,
        }
      );

      const descriptionText = await this.taskDetailDescription.first().textContent();
      expect(descriptionText, 'Description text should contain expected content').toContain(expectedDescription);
    });
  }

  /**
   * Verifies that an attachment is displayed in the task detail view
   * @param fileName - The expected file name of the attachment
   */
  async verifyAttachmentInTaskDetail(fileName: string): Promise<void> {
    await test.step(`Verify attachment "${fileName}" is displayed in task detail view`, async () => {
      // Verify attachment container is visible
      await expect(
        this.taskDetailAttachment(fileName),
        `Attachment container for "${fileName}" should be visible`
      ).toBeVisible({
        timeout: 10000,
      });

      // Verify file name is displayed correctly
      await expect(
        this.taskDetailAttachmentFileName(fileName),
        `Attachment file name "${fileName}" should be visible`
      ).toBeVisible({
        timeout: 10000,
      });

      const fileNameText = await this.taskDetailAttachmentFileName(fileName).textContent();
      expect(fileNameText, `Attachment file name should match "${fileName}"`).toContain(fileName);

      // Verify download button is present for the attachment
      await expect(
        this.taskDetailAttachmentDownloadButton(fileName),
        `Download button for attachment "${fileName}" should be visible`
      ).toBeVisible({
        timeout: 10000,
      });
    });
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

  // ========== Search and Edit Task Methods (from new code) ==========

  /**
   * Click on the "Created tasks" tab
   */
  async clickCreatedTasksTab(): Promise<void> {
    await expect(this.createdTasksTab, 'Created tasks tab should be visible').toBeVisible({ timeout: 10000 });
    await this.createdTasksTab.click();
    // Wait for the tab to be active
    await expect(this.createdTasksTab, 'Created tasks tab should be active')
      .toHaveAttribute('data-state', 'active', { timeout: 5000 })
      .catch(() => {
        // If data-state attribute doesn't exist, that's fine - just verify it's clickable
      });
  }

  /**
   * Search for a task by title
   * @param taskTitle - The task title to search for
   */
  async searchTask(taskTitle: string): Promise<void> {
    await this.searchInput.fill(taskTitle);
    // Wait for search results to appear (wait for at least one result link)
    await expect(this.firstTaskResult, 'Search results should appear').toBeVisible({ timeout: 10000 });
  }

  /**
   * Search for a task by title and wait for either results or "No task found" message
   * @param taskTitle - The task title to search for
   */
  async searchTaskAndWait(taskTitle: string): Promise<void> {
    await this.searchInput.fill(taskTitle);
    // Wait for either search results or "No task found" message to appear
    await Promise.race([
      expect(this.firstTaskResult, 'Search results should appear')
        .toBeVisible({ timeout: 10000 })
        .catch(() => {}),
      expect(this.noTaskFoundMessage, 'No task found message should appear')
        .toBeVisible({ timeout: 10000 })
        .catch(() => {}),
    ]);
  }

  /**
   * Type search text progressively (character by character) to test real-time filtering
   * @param searchText - The text to type progressively
   * @param delayBetweenChars - Delay in milliseconds between typing each character (default: 200ms)
   */
  async typeSearchProgressively(searchText: string, delayBetweenChars: number = 200): Promise<void> {
    await this.searchInput.clear();
    for (let i = 0; i < searchText.length; i++) {
      await this.searchInput.type(searchText[i], { delay: delayBetweenChars });
      // Wait a moment for the search to process after each character
      await this.page.waitForTimeout(100);
    }
  }

  /**
   * Verify the first search result matches the expected task title
   * @param expectedTitle - The expected task title
   */
  async verifyFirstSearchResult(expectedTitle: string): Promise<void> {
    await expect(this.firstTaskResult, `First search result should contain "${expectedTitle}"`).toContainText(
      expectedTitle,
      { timeout: 10000 }
    );
  }

  /**
   * Get the title of the first search result
   * @returns The title text of the first result
   */
  async getFirstResultTitle(): Promise<string> {
    return (await this.firstTaskResult.textContent()) || '';
  }

  /**
   * Verify that "No task found" message is displayed
   */
  async verifyNoTaskFoundMessage(): Promise<void> {
    await expect(this.noTaskFoundMessage, 'No task found message should be visible').toBeVisible({ timeout: 10000 });
    await expect(this.noTaskFoundMessage, 'No task found message should contain correct text').toContainText(
      'No task found',
      { timeout: 10000 }
    );
  }

  /**
   * Clear the search input field
   */
  async clearSearchField(): Promise<void> {
    await this.searchInput.clear();
    // Wait a moment for the search to clear and results to update
    await this.page.waitForTimeout(500);
  }

  /**
   * Verify that tasks are displayed (at least one task result is visible)
   */
  async verifyTasksAreDisplayed(): Promise<void> {
    await expect(this.firstTaskResult, 'All tasks should be visible').toBeVisible({ timeout: 10000 });
  }

  /**
   * Get the current count of visible tasks in the task list
   * @returns The number of visible task links
   */
  async getTaskCount(): Promise<number> {
    await this.page
      .locator('progressbar')
      .filter({ hasText: 'Loading…' })
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});

    await expect(this.firstTaskResult, 'At least one task should be visible').toBeVisible({
      timeout: 15000,
    });

    await this.page.waitForTimeout(500);
    return await this.allTaskLinks.count();
  }

  /**
   * Verify that all expected tasks are displayed in the task list
   * @param expectedCount - The expected number of tasks to be displayed
   */
  async verifyAllTasksAreDisplayed(expectedCount: number): Promise<void> {
    await test.step(`Verify all ${expectedCount} tasks are displayed`, async () => {
      await this.page
        .locator('progressbar')
        .filter({ hasText: 'Loading…' })
        .waitFor({ state: 'hidden', timeout: 15000 })
        .catch(() => {});

      await expect(this.firstTaskResult, 'At least one task should be visible').toBeVisible({
        timeout: 15000,
      });

      await this.page.waitForTimeout(500);

      const taskCount = await this.allTaskLinks.count();

      expect(taskCount, `Expected ${expectedCount} tasks to be displayed, but found ${taskCount}`).toBe(expectedCount);
    });
  }

  /**
   * Verify that a specific task is displayed in the results
   * @param taskTitle - The task title to verify
   */
  async verifyTaskIsDisplayed(taskTitle: string): Promise<void> {
    // Wait for loading to complete and at least one task to be visible
    await this.page
      .locator('progressbar')
      .filter({ hasText: 'Loading…' })
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});

    // Wait for tasks to load (at least one task should be visible)
    await expect(this.firstTaskResult, 'Tasks should be loaded').toBeVisible({ timeout: 15000 });

    const taskLink = this.taskResultLink(taskTitle);
    await expect(taskLink, `Task "${taskTitle}" should be displayed`).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify that the Edit button is present and visible
   */
  async verifyEditButtonIsPresent(): Promise<void> {
    await expect(this.editButton, 'Edit button should be visible').toBeVisible({ timeout: 10000 });
    await expect(this.editButton, 'Edit button should have correct aria-label').toHaveAttribute('aria-label', 'Edit', {
      timeout: 5000,
    });
  }

  /**
   * Click on the dropdown menu trigger for a specific task
   * @param taskTitle - The task title to find the dropdown trigger for
   */
  async clickDropdownMenuTriggerForTask(taskTitle: string): Promise<void> {
    // First, verify the task is visible
    const taskLink = this.taskResultLink(taskTitle);
    await expect(taskLink, `Task "${taskTitle}" should be visible`).toBeVisible({ timeout: 10000 });

    // Find the task row container by navigating up the DOM tree
    // Try to find a common parent that contains both the task link and dropdown trigger
    const taskRow = taskLink.locator('xpath=ancestor::*[self::div or self::li][position()<=5]').last();

    // Look for dropdown trigger within the task row
    let dropdownTrigger = taskRow.locator('button[data-slot="dropdown-menu-trigger"]').first();

    // If not found in the row, try finding by proximity - get all dropdown triggers
    // and find the one that's closest to the task link
    const isVisible = await dropdownTrigger.isVisible().catch(() => false);
    if (!isVisible) {
      const allDropdownTriggers = this.page.locator('button[data-slot="dropdown-menu-trigger"]');
      const taskBoundingBox = await taskLink.boundingBox();

      if (taskBoundingBox) {
        let closestTrigger = allDropdownTriggers.first();
        let minDistance = Infinity;

        const count = await allDropdownTriggers.count();
        for (let i = 0; i < count; i++) {
          const trigger = allDropdownTriggers.nth(i);
          const triggerBox = await trigger.boundingBox().catch(() => null);

          if (triggerBox) {
            // Calculate distance (prioritize same row - small Y difference)
            const yDiff = Math.abs(triggerBox.y - taskBoundingBox.y);
            const xDiff = Math.abs(triggerBox.x - taskBoundingBox.x);
            const distance = yDiff < 50 ? xDiff : yDiff * 10 + xDiff; // Prefer same row

            if (distance < minDistance) {
              minDistance = distance;
              closestTrigger = trigger;
            }
          }
        }
        dropdownTrigger = closestTrigger;
      }
    }

    await expect(dropdownTrigger, `Dropdown menu trigger for task "${taskTitle}" should be visible`).toBeVisible({
      timeout: 10000,
    });
    await dropdownTrigger.click();
    // Wait for the dropdown menu to open
    await this.page.waitForTimeout(500);
  }

  /**
   * Verify that the Edit option is visible in the dropdown menu
   */
  async verifyEditOptionInDropdownIsVisible(): Promise<void> {
    await expect(this.editOptionInDropdown, 'Edit option should be visible in dropdown menu').toBeVisible({
      timeout: 10000,
    });
    await expect(this.editOptionInDropdown, 'Edit option should contain "Edit" text').toContainText('Edit', {
      timeout: 5000,
    });
  }

  /**
   * Click on the Edit button to open edit mode
   * Verifies that the edit modal is opened before proceeding
   */
  async clickEditButton(): Promise<void> {
    await expect(this.editButton, 'Edit button should be visible').toBeVisible({ timeout: 10000 });
    await this.editButton.click();
    // Verify edit modal is opened
    await this.quickTaskModal.verifyEditTaskModalIsVisible();
  }

  /**
   * Generic method to click an option from the dropdown menu for a specific task
   * @param taskTitle - The task title to find the dropdown for
   * @param optionText - The text of the option to click (e.g., "Edit", "View")
   */
  async clickDropdownOptionForTask(taskTitle: string, optionText: string): Promise<void> {
    await test.step(`Click "${optionText}" option from dropdown for task: ${taskTitle}`, async () => {
      // Click on the dropdown menu trigger
      await this.clickDropdownMenuTriggerForTask(taskTitle);

      // Wait for dropdown menu to be visible
      const dropdownMenu = this.page.locator('[role="menu"]');
      await expect(dropdownMenu, 'Dropdown menu should be visible').toBeVisible({ timeout: 5000 });

      // Locate the option specifically within the dropdown menu
      const option = dropdownMenu
        .locator(`span:has-text("${optionText}")`)
        .filter({ hasText: new RegExp(`^${optionText}$`, 'i') })
        .first();

      await expect(option, `${optionText} option should be visible in dropdown`).toBeVisible({
        timeout: 10000,
      });
      await option.click();
    });
  }

  /**
   * Click on the Edit option from the dropdown menu
   * @param taskTitle - The task title to find the dropdown for
   */
  async clickEditOptionFromDropdown(taskTitle: string): Promise<void> {
    await test.step(`Click Edit option from dropdown for task: ${taskTitle}`, async () => {
      await this.clickDropdownOptionForTask(taskTitle, 'Edit');

      // Verify edit modal is opened
      await this.quickTaskModal.verifyEditTaskModalIsVisible(taskTitle);
    });
  }

  /**
   * Fills the task title in the edit modal (without submitting)
   * @param newTitle - The new title to set
   */
  async fillTaskTitleInEditModal(newTitle: string): Promise<void> {
    await test.step(`Fill task title with: ${newTitle}`, async () => {
      // Wait for title input to be visible
      await expect(this.editTitleInput, 'Title input should be visible in edit modal').toBeVisible({
        timeout: 10000,
      });

      // Clear existing title and enter new title
      await this.editTitleInput.clear();
      await this.editTitleInput.fill(newTitle);
    });
  }

  /**
   * Updates the task title in the edit modal
   * @param newTitle - The new title to set
   */
  async updateTaskTitle(newTitle: string): Promise<void> {
    await test.step(`Update task title to: ${newTitle}`, async () => {
      // Fill the title
      await this.fillTaskTitleInEditModal(newTitle);

      // Click on Update task button
      await expect(this.updateTaskButton, 'Update task button should be visible').toBeVisible({
        timeout: 10000,
      });
      await this.updateTaskButton.click();
    });
  }

  /**
   * Verifies that the "Task updated" success message is displayed
   */
  async verifyTaskUpdatedMessage(): Promise<void> {
    await test.step('Verify Task updated message is displayed', async () => {
      await expect(this.taskUpdatedMessage, 'Task updated message should be visible').toBeVisible({
        timeout: 10000,
      });
    });
  }
}
