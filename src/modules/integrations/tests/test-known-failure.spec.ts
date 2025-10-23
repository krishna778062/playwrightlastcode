import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('known Failures Demo', { tag: [IntegrationsSuiteTags.ABSOLUTE] }, () => {
  test(
    'should pass normally',
    {
      tag: [TestPriority.P1, TestGroupType.SANITY, '@demo-pass'],
    },
    async ({ page }) => {
      await page.goto('data:text/html,<h1>Hello World</h1>');
      await page.waitForSelector('h1');
    }
  );

  test(
    'should pass and be removed from known failures',
    {
      tag: [TestPriority.P2, TestGroupType.SANITY],
    },
    async ({ page }) => {
      tagTest(test.info(), {
        isKnownFailure: true,
        bugTicket: 'INT-26835', // bug ticket from Jira
        zephyrTestId: 'INT-23143', // test case ID from Zephyr
        bugReportedDate: '2025-10-01', // Date when the bug was reported
        knownFailurePriority: 'High', // High priority known failure (Eg: High, Medium, Low)
        knownFailureNote: 'Backend API experiencing intermittent timeout errors - engineering team investigating', // description of the known failure
      });
      await page.goto('data:text/html,<h1>Hello India</h1>');
      await page.waitForSelector('h1');
    }
  );

  test.fixme(
    'should pass normally with P2 priority',
    {
      tag: [TestPriority.P2, TestGroupType.SANITY, '@demo-pass2'],
    },
    async ({ page }) => {
      await page.goto('data:text/html,<h1>Hello India</h1>');
      await page.waitForSelector('h1');
    }
  );

  test(
    'should fail due to actual regression',
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
    'should fail as high priority known failure',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY, '@demo-known-fail'],
    },
    async ({ page }) => {
      tagTest(test.info(), {
        isKnownFailure: true,
        bugTicket: 'INT-26835', // bug ticket from Jira
        zephyrTestId: 'INT-23143', // test case ID from Zephyr
        bugReportedDate: '2025-10-01', // Date when the bug was reported
        knownFailurePriority: 'High', // High priority known failure (Eg: High, Medium, Low)
        knownFailureNote: 'Backend API experiencing intermittent timeout errors - engineering team investigating', // description of the known failure
      });
      // Test fails but doesn't count as regression because it is a known failure
      await page.goto('https://httpstat.in/500');
      await page.waitForSelector('h1', { timeout: 5000 });
    }
  );

  test(
    'should fail as medium priority known failure',
    {
      tag: [TestPriority.P1, TestGroupType.SANITY, '@demo-known-fail'],
    },
    async ({ page }) => {
      tagTest(test.info(), {
        isKnownFailure: true,
        bugTicket: 'INT-26833', // bug ticket from Jira
        zephyrTestId: 'INT-23140', // test case ID from Zephyr
        bugReportedDate: '2025-10-12', // date when the bug was reported
        knownFailurePriority: 'Medium', // Medium priority known failure (Eg: High, Medium, Low)
        knownFailureNote: 'Dashboard widgets failing to load due to third-party API rate limiting', // description of the known failure
      });
      // Test fails but doesn't count as regression because it is a known failure
      await page.goto('https://httpstat.us/500');
      await page.waitForSelector('h1', { timeout: 5000 });
    }
  );

  test(
    'should fail as low priority known failure',
    {
      tag: [TestPriority.P3, TestGroupType.SANITY, '@demo-known-fail'],
    },
    async ({ page }) => {
      tagTest(test.info(), {
        isKnownFailure: true,
        bugTicket: 'INT-26833', // bug ticket from Jira
        zephyrTestId: 'INT-24188', // test case ID from Zephyr
        bugReportedDate: '2025-10-09', // date when the bug was reported
        knownFailurePriority: 'Low', // Low priority known failure (Eg: High, Medium, Low)
        knownFailureNote: 'Authentication service returning 401 errors sporadically - SSO integration issue', // description of the known failure
      });
      // Test fails but doesn't count as regression because it is a known failure
      await page.goto('https://httpstat.in/500');
      await page.waitForSelector('h1', { timeout: 5000 });
    }
  );
});
