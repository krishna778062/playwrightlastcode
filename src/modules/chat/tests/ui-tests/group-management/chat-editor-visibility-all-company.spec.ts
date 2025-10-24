import { expect, test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { tagTest } from '@core/utils/testDecorator';

import { CHAT_SUITE_TAGS } from '../../../constants/testTags';

// Constants
const GROUP_NAME = 'all-company';
const SEARCH_FILTER_REGEX = /^all-companyall-companyall-company1all-companyShow more$/;

/**
 * Test suite for verifying chat editor visibility in announcement-only groups
 */
test.describe(
  'Group Management - Chat Editor Visibility',
  { tag: [CHAT_SUITE_TAGS.GROUP_CHAT, TestPriority.P2] },
  () => {
    test(
      'Verify chat editor input box is hidden when navigating to all-company group',
      { tag: [TestPriority.P2, TestGroupType.SMOKE] },
      async ({ browser }) => {
        tagTest(test.info(), {
          description:
            'User logs in with shivam.kalkhanday+7 credentials and verifies chat editor is hidden in all-company group',
          zephyrTestId: 'CHAT-XXXX',
          storyId: 'CHAT-XXXX',
        });

        // Get END_USER2 credentials from environment (shivam.kalkhanday+7)
        const user2Email = process.env.END_USER2_USERNAME || '';
        const user2Password = process.env.END_USER2_PASSWORD || '';

        // Create a new browser context and page
        const context = await browser.newContext();
        const page = await context.newPage();

        // Login with END_USER2 credentials
        const homePage = await LoginHelper.loginWithPassword(page, {
          email: user2Email,
          password: user2Password,
        });

        await homePage.verifyThePageIsLoaded();

        // Navigate to Chat page
        const chatAppPage = await homePage.navigateToChatPageViaTopNavBar();

        // Search for all-company group
        await page.getByRole('textbox', { name: 'Search...' }).fill(GROUP_NAME);

        // Click on the all-company group to open it
        await page.locator('div').filter({ hasText: SEARCH_FILTER_REGEX }).getByRole('paragraph').nth(3).click();

        // Wait for the conversation to load
        await page.waitForTimeout(2000);

        // Get the chat editor component container
        const chatEditorContainer = page.locator("[class*='ChatEditor_editorContainer']");

        // Verify that the chat editor container is hidden
        await expect(chatEditorContainer).toBeHidden({
          timeout: 10_000,
        });

        console.log('SUCCESS: Chat editor is hidden in all-company group for END_USER2');

        // Cleanup
        await context.close();
      }
    );
  }
);
