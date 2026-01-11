import { faker } from '@faker-js/faker';
import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { QuickTaskPage } from '@platforms/ui/pages/quickTask/quickTaskPage';

/**
 * Test suite for Quick Task functionality
 */
test.describe('quick Task', () => {
  /**
   * Verifies that error message is displayed when attempting to create a task
   * without filling the required "Assigned to" field
   */
  test(
    'verify error is displayed when creating task without assigned to field',
    { tag: [TestPriority.P0, '@quick-task'] },
    async ({ quickTaskPage: page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-36899', 'PS-36906'],
      });

      const quickTaskPage = new QuickTaskPage(page);
      const taskName = `Task ${faker.word.noun()} ${Date.now()}`;
      const taskDescription = `Description ${faker.lorem.sentence()}`;

      await quickTaskPage.openCreateTaskForm();
      await quickTaskPage.fillTaskDetailsWithoutDate(taskName, taskDescription);
      await quickTaskPage.attemptToCreateTaskWithoutAssignee();
      await quickTaskPage.verifyRequiredFieldError();
      await quickTaskPage.selectAudiencesAndVerifyError();
    }
  );

  /**
   * Verifies that error message is displayed when attempting to create a task
   * without providing a Task Title
   */
  test(
    'verify that user cannot create a task without providing a Task Title',
    { tag: [TestPriority.P0, '@quick-task'] },
    async ({ quickTaskPage: page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-36905'],
      });

      const quickTaskPage = new QuickTaskPage(page);
      const taskDescription = `Description ${faker.lorem.sentence()}`;

      await quickTaskPage.openCreateTaskForm();
      await quickTaskPage.attemptToCreateTaskWithoutTitle(taskDescription);
      await quickTaskPage.verifyTitleRequiredFieldError();
    }
  );

  /**
   * Verifies that user can set the Due Date as the current date
   */
  test(
    'verify that user can set the Due Date as the current date',
    { tag: [TestPriority.P0, '@quick-task'] },
    async ({ quickTaskPage: page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-36937'],
      });

      const quickTaskPage = new QuickTaskPage(page);
      const taskName = `Task ${faker.word.noun()} ${Date.now()}`;
      const taskDescription = `Description ${faker.lorem.sentence()}`;

      await quickTaskPage.openCreateTaskForm();
      await quickTaskPage.fillTaskDetailsWithoutDate(taskName, taskDescription);
      await quickTaskPage.selectCurrentDate();
      await quickTaskPage.verifyCurrentDateIsSelected();
    }
  );

  /**
   * Verifies that user cannot set a Due Date in the past
   */
  test(
    'verify that user cannot set a Due Date in the past',
    { tag: [TestPriority.P0, '@quick-task'] },
    async ({ quickTaskPage: page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-36936'],
      });

      const quickTaskPage = new QuickTaskPage(page);
      const taskName = `Task ${faker.word.noun()} ${Date.now()}`;
      const taskDescription = `Description ${faker.lorem.sentence()}`;

      await quickTaskPage.openCreateTaskForm();
      await quickTaskPage.fillTaskDetailsWithoutDate(taskName, taskDescription);
      await quickTaskPage.attemptToSelectPastDate();
    }
  );

  /**
   * Verifies that user can click on the Tag field to open the searchable dropdown list of existing Tags
   */
  test(
    'verify that user can click on the Tag field to open the searchable dropdown list of existing Tags',
    { tag: [TestPriority.P0, '@quick-task'] },
    async ({ quickTaskPage: page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-36950'],
      });

      const quickTaskPage = new QuickTaskPage(page);
      const taskName = `Task ${faker.word.noun()} ${Date.now()}`;
      const taskDescription = `Description ${faker.lorem.sentence()}`;

      await quickTaskPage.openCreateTaskForm();
      await quickTaskPage.fillTaskDetailsWithoutDate(taskName, taskDescription);
      await quickTaskPage.clickTagField();
      await quickTaskPage.verifyTagDropdownIsVisible();
    }
  );

  /**
   * Verifies that user can see counts getting increased under "New" when user adds new quick task
   * Creates 2 tasks via API and validates the count increases after each task creation
   */
  test(
    'verify that user can able to see counts getting increased under new when user adds new quick task',
    { tag: [TestPriority.P0, '@quick-task'] },
    async ({ quickTaskPage: page, quickTaskApiFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-36712'],
      });

      const quickTaskPage = new QuickTaskPage(page);
      const quickTaskTestHelper = quickTaskApiFixture.quickTaskTestHelper;

      const initialCount = await quickTaskPage.getInitialTabCount('new');

      await quickTaskTestHelper.createTestTask('medium');
      await quickTaskPage.reloadAndNavigateToTasks();
      await quickTaskPage.verifyNewTabCount(initialCount + 1);

      await quickTaskTestHelper.createTestTask('high');
      await quickTaskPage.reloadAndNavigateToTasks();
      await quickTaskPage.verifyNewTabCount(initialCount + 2);
    }
  );

  /**
   * Verifies that user can see counts getting increased under "In progress" when user changes the status
   * Creates a task via API (assigned to logged-in user), navigates to My tasks, starts the task,
   * changes status to In progress, and verifies the count increases
   */
  test(
    'verify that user can able to see counts getting increased under inProgress when user changes the status on the quick task to inprogress',
    { tag: [TestPriority.P0, '@quick-task'] },
    async ({ quickTaskPage: page, quickTaskApiFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-36714'],
      });

      const quickTaskPage = new QuickTaskPage(page);
      const quickTaskTestHelper = quickTaskApiFixture.quickTaskTestHelper;

      // Get initial "In progress" tab count
      const initialInProgressCount = await quickTaskPage.getInitialTabCount('inProgress');

      // Create task via API (assigned to logged-in user)
      const taskResponse = await quickTaskTestHelper.createTestTask('medium');
      const taskTitle = taskResponse.result.title;

      // Navigate to "My tasks" tab
      await quickTaskPage.reloadAndNavigateToMyTasks();

      // Click on the created task
      await quickTaskPage.clickTaskByTitle(taskTitle);

      // Click the menu button (3-dots) to open action menu
      await quickTaskPage.clickTaskMenuButton();

      // Click "Start task" button
      await quickTaskPage.clickStartTaskButton();

      // Change status to "In progress"
      await quickTaskPage.changeStatusToInProgress();

      // Navigate back to Tasks to verify the count increased
      await quickTaskPage.navigateToTasks();

      // Verify "In progress" tab count has increased
      await quickTaskPage.verifyTabCountIncreased('inProgress', initialInProgressCount);
    }
  );

  /**
   * Verifies that user can see counts getting increased under "Completed" when user changes the status on the quick task to completed
   */
  test(
    'verify that user can able to see counts getting increased under Completed when user changes the status on the quick task to completed',
    { tag: [TestPriority.P0, '@quick-task'] },
    async ({ quickTaskPage: page, quickTaskApiFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-36713'],
      });

      const quickTaskPage = new QuickTaskPage(page);
      const quickTaskTestHelper = quickTaskApiFixture.quickTaskTestHelper;

      // Get initial "Completed" tab count
      const initialCompletedCount = await quickTaskPage.getInitialTabCount('completed');

      // Create task via API (assigned to logged-in user)
      const taskResponse = await quickTaskTestHelper.createTestTask('medium');
      const taskTitle = taskResponse.result.title;

      // Navigate to "My tasks" tab
      await quickTaskPage.reloadAndNavigateToMyTasks();

      // Click on the created task
      await quickTaskPage.clickTaskByTitle(taskTitle);

      // Click the menu button (3-dots) to open action menu
      await quickTaskPage.clickTaskMenuButton();

      // Click "Start task" button
      await quickTaskPage.clickStartTaskButton();

      // Change status to "In progress"
      await quickTaskPage.changeStatusToInProgress();

      // Mark task as completed (with comment)
      await quickTaskPage.markTaskAsCompleted('Task completed successfully');

      // Verify the status is "Completed"
      await quickTaskPage.verifyTaskStatusIsCompleted();

      // Navigate back to Tasks to verify the count increased
      await quickTaskPage.navigateToTasks();

      // Verify "Completed" tab count has increased
      await quickTaskPage.verifyTabCountIncreased('completed', initialCompletedCount);
    }
  );

  /**
   * Verifies that user can assign a task to a single user they have access to
   */
  test(
    'verify that user can assign a task to a single user they have access to',
    { tag: [TestPriority.P0, '@quick-task'] },
    async ({ quickTaskPage: page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-36894'],
      });

      const quickTaskPage = new QuickTaskPage(page);
      const taskName = `Task ${faker.word.noun()} ${Date.now()}`;
      const taskDescription = `Description ${faker.lorem.sentence()}`;

      await quickTaskPage.createTaskWithUserAssignment(taskName, taskDescription);
      await quickTaskPage.verifyTaskAssignmentAndCreatedBy();
    }
  );

  /**
   * Verifies that user can assign a task to multiple users simultaneously
   */
  test(
    'verify that user can assign a task to multiple users simultaneously',
    { tag: [TestPriority.P0, '@quick-task'] },
    async ({ quickTaskPage: page }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-36895'],
      });

      const quickTaskPage = new QuickTaskPage(page);
      const taskName = `Task ${faker.word.noun()} ${Date.now()}`;
      const taskDescription = `Description ${faker.lorem.sentence()}`;

      // Create task with multiple user assignments (first 3 users from dropdown)
      const selectedUserNames = await quickTaskPage.createTaskWithMultipleUserAssignment(taskName, taskDescription, 3);

      // Verify all selected users are assigned to the task
      // Pass expected count even if names couldn't be extracted from dropdown
      await quickTaskPage.verifyMultipleAssignedUsers(selectedUserNames, 3);

      // Verify created by shows logged-in user
      const createdByUserName = await quickTaskPage.getCreatedByUserName();
      expect(createdByUserName).toBeTruthy();
      expect(createdByUserName.length).toBeGreaterThan(0);
      await quickTaskPage.verifyCreatedByUser(createdByUserName);
    }
  );
});
