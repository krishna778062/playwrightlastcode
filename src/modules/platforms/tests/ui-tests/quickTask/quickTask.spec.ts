import { faker } from '@faker-js/faker';
import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { platformTestFixture as test } from '@platforms/fixtures/platformFixture';
import { QuickTaskPage } from '@platforms/ui/pages/quickTask/quickTaskPage';

/**
 * Test suite for Quick Task functionality
 */
test.describe.serial('quick Task', () => {
  // Store task IDs and titles for each test that needs them
  let testTaskIds: string[] = [];
  let testTaskTitles: string[] = [];

  /**
   * Creates multiple tasks (more than 3) before each test that needs them
   * Only runs for tests tagged with @requires-task-prerequisite
   */
  test.beforeEach(async ({ quickTaskApiFixture }, testInfo) => {
    // Only create tasks for tests that have the @requires-task-prerequisite tag
    const testTags = testInfo.tags || [];
    const needsTasks = testTags.includes('@requires-task-prerequisite');

    if (needsTasks) {
      // Create more than 3 tasks (creating 4 tasks) with dynamic names using faker
      const taskCount = 4;
      testTaskIds = [];
      testTaskTitles = [];

      for (let i = 0; i < taskCount; i++) {
        // Generate completely random task title using faker
        const uniqueTitle = `${faker.lorem.words({ min: 2, max: 4 })} ${Date.now()}-${i}`;
        const taskDetails = await quickTaskApiFixture.quickTaskService.createTaskAsPrerequisite(uniqueTitle, 'urgent');
        testTaskIds.push(taskDetails.taskId);
        testTaskTitles.push(taskDetails.title);
        console.log(`Created task ${i + 1}/${taskCount} for test: ${testInfo.title}`);
        console.log(`Task ID: ${taskDetails.taskId}, Title: ${taskDetails.title}`);
      }
      console.log(`Total ${taskCount} tasks created for test: ${testInfo.title}`);
    }
  });

  /**
   * Cleans up all tasks created in beforeEach after each test
   */
  test.afterEach(async ({ quickTaskApiFixture }, testInfo) => {
    if (testTaskIds.length > 0) {
      console.log(`Cleaning up ${testTaskIds.length} task(s) for test: ${testInfo.title}`);
      for (const taskId of testTaskIds) {
        try {
          console.log(`Deleting task ID: ${taskId}`);
          await quickTaskApiFixture.quickTaskService.deleteTask(taskId);
          console.log(`Successfully deleted task with ID: ${taskId}`);
        } catch (error) {
          console.warn(`Failed to delete task with ID: ${taskId}:`, error);
          // Don't throw - cleanup failures shouldn't fail the test suite
        }
      }
      testTaskIds = [];
      testTaskTitles = [];
    }
  });

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

      await page.waitForTimeout(2000);
      await quickTaskPage.reloadAndNavigateToTasks();
      await quickTaskPage.verifyNewTabCount(initialCount + 1);

      await quickTaskTestHelper.createTestTask('high');
      await page.waitForTimeout(2000);
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
      const taskTitle = taskResponse.result?.title;
      if (!taskTitle) {
        throw new Error('Task title not found in create task response');
      }

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
      const taskTitle = taskResponse.result?.title;
      if (!taskTitle) {
        throw new Error('Task title not found in create task response');
      }

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

  test(
    'verify that the user can search a task using the exact task title',
    { tag: [TestPriority.P0, '@quick-task1', '@requires-task-prerequisite'] },
    async ({ quickTaskPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-37278'],
      });

      if (!testTaskTitles || testTaskTitles.length === 0) {
        throw new Error('Task titles not available. Tasks should be created in beforeEach.');
      }

      // Use the first dynamically created task title for searching
      const searchTaskTitle = testTaskTitles[0];

      const currentUrl = quickTaskPage.url();
      expect(currentUrl, 'Should be logged in (URL should not contain login/authenticate)').not.toContain('login');
      expect(currentUrl, 'Should be logged in (URL should not contain authenticate)').not.toContain('authenticate');

      // Wait a moment for the tasks to be available in the UI after API creation
      await quickTaskPage.waitForTimeout(2000);

      // Navigate to quick tasks page (user is already logged in via fixture)
      const quickTaskPageObj = new QuickTaskPage(quickTaskPage);
      await quickTaskPageObj.loadPage();
      await quickTaskPageObj.verifyThePageIsLoaded();

      // Click on the "Created tasks" tab before searching
      await quickTaskPageObj.clickCreatedTasksTab();

      // Search for the task using dynamically created task title
      await quickTaskPageObj.searchTask(searchTaskTitle);

      // Verify the first result matches the searched task title
      await quickTaskPageObj.verifyFirstSearchResult(searchTaskTitle);

      // Additional verification: Get the first result title and verify it matches
      const firstResultTitle = await quickTaskPageObj.getFirstResultTitle();
      expect(firstResultTitle.trim(), `First result should be "${searchTaskTitle}"`).toBe(searchTaskTitle);
    }
  );

  test(
    'verify that the task list filters correctly when searching with a partial task title',
    { tag: [TestPriority.P0, '@quick-task1', '@requires-task-prerequisite'] },
    async ({ quickTaskPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-37279'],
      });

      if (!testTaskTitles || testTaskTitles.length === 0) {
        throw new Error('Task titles not available. Tasks should be created in beforeEach.');
      }

      // Use the first dynamically created task title and extract partial text
      const fullTaskTitle = testTaskTitles[0];
      // Extract first word from the task title for partial search
      const partialSearchText = fullTaskTitle.split(' ')[0];

      const currentUrl = quickTaskPage.url();
      expect(currentUrl, 'Should be logged in (URL should not contain login/authenticate)').not.toContain('login');
      expect(currentUrl, 'Should be logged in (URL should not contain authenticate)').not.toContain('authenticate');

      // Navigate to quick tasks page (user is already logged in via fixture)
      const quickTaskPageObj = new QuickTaskPage(quickTaskPage);
      await quickTaskPageObj.loadPage();
      await quickTaskPageObj.verifyThePageIsLoaded();

      // Click on the "Created tasks" tab before searching
      await quickTaskPageObj.clickCreatedTasksTab();

      // Search for the task using partial text
      await quickTaskPageObj.searchTask(partialSearchText);

      // Verify the first result contains the full task title
      await quickTaskPageObj.verifyFirstSearchResult(fullTaskTitle);

      // Additional verification: Get the first result title and verify it contains the partial search text
      const firstResultTitle = await quickTaskPageObj.getFirstResultTitle();
      expect(firstResultTitle.trim().toLowerCase(), `First result should contain "${partialSearchText}"`).toContain(
        partialSearchText.toLowerCase()
      );
    }
  );

  test(
    'verify that no tasks appear when the user searches for a non-existing task title',
    { tag: [TestPriority.P0, '@quick-task1'] },
    async ({ quickTaskPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-37281'],
      });

      // Use a non-existing task title for search
      const nonExistingTaskTitle = 'NonExistingTaskTitle12345';

      const currentUrl = quickTaskPage.url();
      expect(currentUrl, 'Should be logged in (URL should not contain login/authenticate)').not.toContain('login');
      expect(currentUrl, 'Should be logged in (URL should not contain authenticate)').not.toContain('authenticate');

      // Navigate to quick tasks page (user is already logged in via fixture)
      const quickTaskPageObj = new QuickTaskPage(quickTaskPage);
      await quickTaskPageObj.loadPage();
      await quickTaskPageObj.verifyThePageIsLoaded();

      // Click on the "Created tasks" tab before searching
      await quickTaskPageObj.clickCreatedTasksTab();

      // Search for a non-existing task
      await quickTaskPageObj.searchTaskAndWait(nonExistingTaskTitle);

      // Verify "No task found" message is displayed
      await quickTaskPageObj.verifyNoTaskFoundMessage();
    }
  );

  test(
    'verify that clearing the search input displays the full task list again',
    { tag: [TestPriority.P0, '@quick-task1', '@requires-task-prerequisite'] },
    async ({ quickTaskPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-37282'],
      });

      if (!testTaskTitles || testTaskTitles.length === 0) {
        throw new Error('Task titles not available. Tasks should be created in beforeEach.');
      }

      const taskTitle = testTaskTitles[0];

      const currentUrl = quickTaskPage.url();
      expect(currentUrl, 'Should be logged in (URL should not contain login/authenticate)').not.toContain('login');
      expect(currentUrl, 'Should be logged in (URL should not contain authenticate)').not.toContain('authenticate');

      const quickTaskPageObj = new QuickTaskPage(quickTaskPage);
      await quickTaskPageObj.loadPage();
      await quickTaskPageObj.verifyThePageIsLoaded();

      await quickTaskPageObj.clickCreatedTasksTab();

      const initialTaskCount = await quickTaskPageObj.getTaskCount();
      expect(initialTaskCount, 'Initial task count should be greater than 0').toBeGreaterThan(0);

      await quickTaskPageObj.searchTask(taskTitle);

      await quickTaskPageObj.verifyFirstSearchResult(taskTitle);
      const filteredTaskCount = await quickTaskPageObj.getTaskCount();
      expect(filteredTaskCount, 'Filtered task count should be less than initial count').toBeLessThan(initialTaskCount);

      await quickTaskPageObj.clearSearchField();

      await quickTaskPageObj.verifyAllTasksAreDisplayed(initialTaskCount);

      await quickTaskPageObj.verifyTaskIsDisplayed(taskTitle);
    }
  );

  test(
    'verify that tasks are filtered in real-time while typing in the search bar',
    { tag: [TestPriority.P0, '@quick-task1', '@requires-task-prerequisite'] },
    async ({ quickTaskPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-37283'],
      });

      if (!testTaskTitles || testTaskTitles.length === 0) {
        throw new Error('Task titles not available. Tasks should be created in beforeEach.');
      }

      // Use the first dynamically created task title
      const taskTitle = testTaskTitles[0];
      // Extract first word from the task title for progressive typing
      const searchText = taskTitle.split(' ')[0];

      const currentUrl = quickTaskPage.url();
      expect(currentUrl, 'Should be logged in (URL should not contain login/authenticate)').not.toContain('login');
      expect(currentUrl, 'Should be logged in (URL should not contain authenticate)').not.toContain('authenticate');

      // Navigate to quick tasks page (user is already logged in via fixture)
      const quickTaskPageObj = new QuickTaskPage(quickTaskPage);
      await quickTaskPageObj.loadPage();
      await quickTaskPageObj.verifyThePageIsLoaded();

      // Click on the "Created tasks" tab before searching
      await quickTaskPageObj.clickCreatedTasksTab();

      // Verify tasks are initially displayed
      await quickTaskPageObj.verifyTasksAreDisplayed();

      // Type search text progressively (character by character) to test real-time filtering
      // Start with first character
      await quickTaskPageObj.searchInput.type(searchText[0], { delay: 200 });
      await quickTaskPage.waitForTimeout(300);
      // Verify results are filtered after typing first character
      await quickTaskPageObj.verifyTasksAreDisplayed();

      // Type remaining characters progressively
      for (let i = 1; i < searchText.length; i++) {
        await quickTaskPageObj.searchInput.type(searchText[i], { delay: 200 });
        await quickTaskPage.waitForTimeout(300);
        // Verify results are still displayed after each character
        await quickTaskPageObj.verifyTasksAreDisplayed();
      }

      // Verify the final search result contains the task title
      await quickTaskPageObj.verifyFirstSearchResult(taskTitle);

      // Additional verification: Get the first result title and verify it matches
      const firstResultTitle = await quickTaskPageObj.getFirstResultTitle();
      expect(firstResultTitle.trim().toLowerCase(), `First result should contain "${searchText}"`).toContain(
        searchText.toLowerCase()
      );
    }
  );

  test(
    'verify the Edit Task option is visible in task view',
    { tag: [TestPriority.P0, '@quick-task1', '@requires-task-prerequisite'] },
    async ({ quickTaskPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-37308'],
      });

      if (!testTaskTitles || testTaskTitles.length === 0) {
        throw new Error('Task titles not available. Tasks should be created in beforeEach.');
      }

      // Use the first dynamically created task title
      const taskTitle = testTaskTitles[0];

      const currentUrl = quickTaskPage.url();
      expect(currentUrl, 'Should be logged in (URL should not contain login/authenticate)').not.toContain('login');
      expect(currentUrl, 'Should be logged in (URL should not contain authenticate)').not.toContain('authenticate');

      // Navigate to quick tasks page (user is already logged in via fixture)
      const quickTaskPageObj = new QuickTaskPage(quickTaskPage);
      await quickTaskPageObj.loadPage();
      await quickTaskPageObj.verifyThePageIsLoaded();

      // Click on the "Created tasks" tab
      await quickTaskPageObj.clickCreatedTasksTab();

      // Verify the task is displayed
      await quickTaskPageObj.verifyTaskIsDisplayed(taskTitle);

      // Click on the task to open its details
      // This automatically verifies the task detail page is opened, task title is visible,
      // and basic components (assigned to, created by) are displayed
      await quickTaskPageObj.clickTaskByTitle(taskTitle);

      // Verify the Edit button is present
      await quickTaskPageObj.verifyEditButtonIsPresent();
    }
  );

  test(
    'verify the Edit Task option is visible in the task list',
    { tag: [TestPriority.P0, '@quick-task1', '@requires-task-prerequisite'] },
    async ({ quickTaskPage }) => {
      tagTest(test.info(), {
        zephyrTestId: ['PS-37309'],
      });

      if (!testTaskTitles || testTaskTitles.length === 0) {
        throw new Error('Task titles not available. Tasks should be created in beforeEach.');
      }

      // Use the first dynamically created task title
      const taskTitle = testTaskTitles[0];

      const currentUrl = quickTaskPage.url();
      expect(currentUrl, 'Should be logged in (URL should not contain login/authenticate)').not.toContain('login');
      expect(currentUrl, 'Should be logged in (URL should not contain authenticate)').not.toContain('authenticate');

      // Navigate to quick tasks page (user is already logged in via fixture)
      const quickTaskPageObj = new QuickTaskPage(quickTaskPage);
      await quickTaskPageObj.loadPage();
      await quickTaskPageObj.verifyThePageIsLoaded();

      // Click on the "Created tasks" tab
      await quickTaskPageObj.clickCreatedTasksTab();

      // Verify the task is displayed
      await quickTaskPageObj.verifyTaskIsDisplayed(taskTitle);

      // Click on the dropdown menu trigger for the task
      await quickTaskPageObj.clickDropdownMenuTriggerForTask(taskTitle);

      // Verify the Edit option is visible in the dropdown menu
      await quickTaskPageObj.verifyEditOptionInDropdownIsVisible();
    }
  );
});
