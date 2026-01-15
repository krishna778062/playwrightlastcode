import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class QuickTaskModalComponent extends BaseComponent {
  private createTaskModal: Locator;
  private editTaskModal: Locator;
  private markAsCompletedModal: Locator;
  private createTaskModalTitle: Locator;
  private editTaskModalTitle: Locator;
  private markAsCompletedModalTitle: Locator;
  private editModalCancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.createTaskModal = page.locator('[role="dialog"]').filter({
      has: page.getByRole('textbox', { name: 'Add title' }),
    });
    this.createTaskModalTitle = this.createTaskModal
      .locator('[data-slot="dialog-title"]')
      .or(this.createTaskModal.getByRole('heading', { name: /create.*task/i }))
      .or(this.createTaskModal.locator('h1, h2, h3').filter({ hasText: /create.*task/i }));

    this.editTaskModal = page.locator('[role="dialog"]').filter({
      has: page.locator('textarea[name="description"]'),
    });
    this.editTaskModalTitle = this.editTaskModal
      .locator('[data-slot="dialog-title"]')
      .or(this.editTaskModal.getByRole('heading', { name: /edit.*task/i }))
      .or(this.editTaskModal.locator('h1, h2, h3').filter({ hasText: /edit.*task/i }));

    this.markAsCompletedModal = page.locator('[role="dialog"]').filter({ has: page.getByText(/mark as completed/i) });
    this.markAsCompletedModalTitle = this.markAsCompletedModal
      .locator('[data-slot="dialog-title"]')
      .or(this.markAsCompletedModal.getByRole('heading', { name: /mark as completed/i }))
      .or(this.markAsCompletedModal.locator('h1, h2, h3').filter({ hasText: /mark as completed/i }));

    // Cancel button in edit modal
    this.editModalCancelButton = this.editTaskModal
      .locator('button[data-slot="dialog-close"]')
      .filter({ hasText: 'Cancel' });
  }

  /**
   * Verifies that the create task modal is visible.
   */
  async verifyCreateTaskModalIsVisible(): Promise<boolean> {
    return await test.step('Verify create task modal is visible', async () => {
      await expect(this.createTaskModal).toBeVisible({ timeout: 10000 });
      await expect(this.createTaskModalTitle).toBeVisible({ timeout: 5000 });
      await expect(this.page.getByRole('textbox', { name: 'Add title' })).toBeVisible({ timeout: 5000 });
      return true;
    });
  }

  /**
   * Verifies that the edit task modal is visible.
   * @param taskTitle - Optional task title to verify in the modal
   */
  async verifyEditTaskModalIsVisible(taskTitle?: string): Promise<boolean> {
    return await test.step('Verify edit task modal is visible', async () => {
      // Verify the dialog is open with data-state="open"
      const editDialog = this.page.locator('[role="dialog"][data-state="open"]').filter({
        has: this.page.locator('[data-slot="dialog-title"]').filter({ hasText: 'Edit task' }),
      });
      await expect(editDialog, 'Edit task modal dialog should be visible and open').toBeVisible({ timeout: 10000 });

      // Verify the modal title "Edit task" is visible
      const editTaskHeading = this.page.locator('h2[data-slot="dialog-title"]').filter({ hasText: 'Edit task' });
      await expect(editTaskHeading, 'Edit task heading should be visible').toBeVisible({ timeout: 5000 });

      // Verify the modal structure
      await expect(this.editTaskModal).toBeVisible({ timeout: 10000 });
      await expect(this.editTaskModalTitle).toBeVisible({ timeout: 5000 });
      await expect(this.page.locator('textarea[name="description"]')).toBeVisible({ timeout: 5000 });

      if (taskTitle) {
        await expect(this.page.getByText(taskTitle, { exact: false })).toBeVisible({ timeout: 5000 });
      }
      return true;
    });
  }

  /**
   * Verifies that the mark as completed modal is visible.
   */
  async verifyMarkAsCompletedModalIsVisible(): Promise<boolean> {
    return await test.step('Verify mark as completed modal is visible', async () => {
      await expect(this.markAsCompletedModal).toBeVisible({ timeout: 10000 });
      await expect(this.markAsCompletedModalTitle).toBeVisible({ timeout: 5000 });
      // Verify the submit button is visible within the modal (using form attribute for specificity)
      const submitButton = this.markAsCompletedModal.locator('button[type="submit"][form="update-task-status-form"]');
      await expect(submitButton, 'Mark as completed submit button should be visible in modal').toBeVisible({
        timeout: 5000,
      });
      return true;
    });
  }

  /**
   * Verifies that the task detail page is opened and displays the task title
   * Also verifies basic components like assigned to and created by are visible
   * @param taskTitle - The task title to verify is displayed on the detail page
   * @param quickTaskPage - The QuickTaskPage instance to access verification methods
   */
  async verifyTaskDetailPageIsOpened(taskTitle: string, quickTaskPage?: any): Promise<boolean> {
    return await test.step(`Verify task detail page is opened with title: ${taskTitle}`, async () => {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      const taskTitleLocator = this.page
        .locator('h1[data-slot="page-header-title"]')
        .filter({ hasText: taskTitle })
        .first();

      await expect(taskTitleLocator, `Task title "${taskTitle}" should be visible on detail page`).toBeVisible({
        timeout: 10000,
      });

      await expect(
        this.page.getByText(/Assigned to:/i).first(),
        'Assigned to label should be visible on task detail page'
      ).toBeVisible({ timeout: 5000 });

      if (quickTaskPage) {
        const assignedUserName = await quickTaskPage.getAssignedUserName();
        const createdByUserName = await quickTaskPage.getCreatedByUserName();

        expect(assignedUserName).toBeTruthy();
        expect(assignedUserName.length).toBeGreaterThan(0);

        expect(createdByUserName).toBeTruthy();
        expect(createdByUserName.length).toBeGreaterThan(0);

        await quickTaskPage.verifyAssignedToUser(assignedUserName);
        await quickTaskPage.verifyCreatedByUser(createdByUserName);
      }

      return true;
    });
  }

  /**
   * Clicks the Cancel button in the edit task modal
   */
  async clickEditModalCancelButton(): Promise<void> {
    await super.clickCancelButton(this.editModalCancelButton, 'Click Cancel button in edit task modal');
  }
}
