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
      await quickTaskPage.fillTaskDetails(taskName, taskDescription);
      await quickTaskPage.attemptToCreateTaskWithoutAssignee();
      await quickTaskPage.verifyRequiredFieldError();
      await quickTaskPage.selectAudiencesAndVerifyError();
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

      await quickTaskPage.navigateToTasks();
      const initialCount = await quickTaskPage.getNewTabCount();

      await quickTaskTestHelper.createTestTask('medium');
      await quickTaskPage.reloadAndNavigateToTasks();
      await expect(async () => {
        const count = await quickTaskPage.getNewTabCount();
        expect(count).toBe(initialCount + 1);
      }).toPass({ timeout: 20000 });

      await quickTaskTestHelper.createTestTask('high');
      await quickTaskPage.reloadAndNavigateToTasks();
      await expect(async () => {
        const count = await quickTaskPage.getNewTabCount();
        expect(count).toBe(initialCount + 2);
      }).toPass({ timeout: 20000 });
    }
  );
});
