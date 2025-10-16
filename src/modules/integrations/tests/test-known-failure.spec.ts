import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { knownFailure } from '@core/utils';

test.describe('known Failures Demo', { tag: [IntegrationsSuiteTags.ABSOLUTE] }, () => {
  test(
    'passing test - should work normally',
    {
      tag: [TestPriority.P1, TestGroupType.SANITY, '@demo-pass'],
    },
    async ({ page }) => {
      await page.goto('data:text/html,<h1>Hello World</h1>');
      await page.waitForSelector('h1');
    }
  );

  test(
    'passing test - should work normally - P2',
    {
      tag: [TestPriority.P2, TestGroupType.SANITY, '@demo-pass2'],
    },
    async ({ page }) => {
      await page.goto('data:text/html,<h1>Hello India</h1>');
      await page.waitForSelector('h1');
    }
  );

  test(
    'failing test - this test case failed due to actual regression',
    {
      tag: [TestPriority.P1, TestGroupType.SANITY, '@demo-fail'],
    },
    async ({ page }) => {
      // This test case failed due to actual regression so it will be counted as actual failure
      await page.goto('https://httpstat.in/500');
      await page.waitForSelector('h1', { timeout: 5000 });
    }
  );

  test(
    'kown failure test-1 - tracked issue- High priority known failure should show at top of the list',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY, '@demo-known-fail'],
    },
    async ({ page }) => {
      // test is marked as known failure
      knownFailure(test.info(), {
        bugTicket: 'INT-26835', // bug ticket from Jira
        zephyrTestId: 'INT-23143', // test case ID from Zephyr
        bugReportedDate: '2025-10-01', // Date when the bug was reported
        priority: 'High', // High priority known failure (Eg: High, Medium, Low)
        note: 'Backend API experiencing intermittent timeout errors - engineering team investigating', // description of the known failure
      });
      // Test fails but doesn't count as regression because it is a known failure
      await page.goto('https://httpstat.in/500');
      await page.waitForSelector('h1', { timeout: 5000 });
    }
  );

  test(
    'known failure test -2 - hover on long test name to see the full test name',
    {
      tag: [TestPriority.P1, TestGroupType.SANITY, '@demo-known-fail'],
    },
    async ({ page }) => {
      // test is marked as known failure
      knownFailure(test.info(), {
        bugTicket: 'INT-26833', // bug ticket from Jira
        zephyrTestId: 'INT-23140', // test case ID from Zephyr
        bugReportedDate: '2025-10-12', // date when the bug was reported
        priority: 'Medium', // Medium priority known failure (Eg: High, Medium, Low)
        note: 'Dashboard widgets failing to load due to third-party API rate limiting', // description of the known failure
      });
      // Test fails but doesn't count as regression because it is a known failure
      await page.goto('https://httpstat.us/500');
      await page.waitForSelector('h1', { timeout: 5000 });
    }
  );

  test(
    'kown failure test -3 - Test low priority known failure should show at bottom of the list',
    {
      tag: [TestPriority.P3, TestGroupType.SANITY, '@demo-known-fail'],
    },
    async ({ page }) => {
      // test is marked as known failure
      knownFailure(test.info(), {
        bugTicket: 'INT-26833', // bug ticket from Jira
        zephyrTestId: 'INT-24188', // test case ID from Zephyr
        bugReportedDate: '2025-10-09', // date when the bug was reported
        priority: 'Low', // Low priority known failure (Eg: High, Medium, Low)
        note: 'Authentication service returning 401 errors sporadically - SSO integration issue', // description of the known failure
      });
      // Test fails but doesn't count as regression because it is a known failure
      await page.goto('https://httpstat.in/500');
      await page.waitForSelector('h1', { timeout: 5000 });
    }
  );
});
