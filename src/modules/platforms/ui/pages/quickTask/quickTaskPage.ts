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
  readonly createTaskButton: Locator;
  readonly requiredFieldError: Locator;
  readonly audiencesRadio: Locator;

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
    this.createTaskButton = page.getByRole('button', { name: 'Create' });
    this.requiredFieldError = page.getByText('Please fill out the required field "Assigned to"');
    this.audiencesRadio = page.getByRole('radio', { name: 'Audiences' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.quickTaskContainer, 'quick task page to load').toBeVisible({ timeout: 15000 });
  }

  async openCreateTaskForm(): Promise<void> {
    await this.tasksLink.click();
    await this.createNewTaskButton.click();
    await this.taskTypeSelector.click();
  }

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

  async attemptToCreateTaskWithoutAssignee(): Promise<void> {
    await expect(this.addIndividualsCombobox).toHaveValue('');
    await this.createTaskButton.click();
  }

  async verifyRequiredFieldError(): Promise<void> {
    await expect(this.requiredFieldError).toBeVisible();
  }

  async selectAudiencesAndVerifyError(): Promise<void> {
    await this.audiencesRadio.click();
    await expect(this.requiredFieldError).toBeVisible();
  }
}
