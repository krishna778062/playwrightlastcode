import { expect } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { tagTest } from '@core/utils/testDecorator';
import { chatTestFixture as test } from '@modules/chat/fixtures/chatFixture';

import { CHAT_SUITE_TAGS } from '../../../constants/testTags';

// Constants
const GROUP_NAME = 'all-company';
const SEARCH_FILTER_REGEX = /^all-companyall-companyall-company1all-companyShow more$/;
const GROUP_PERMISSION_TEXT = 'Open (Everyone can post or comment)Announcement only (Only group admin/s can';
const ANNOUNCEMENT_RADIO_LABEL = 'Announcement only (Only group admin/s can post)';
const OPEN_RADIO_LABEL = 'Open (Everyone can post or comment)';

/**
 * Group management and settings test suite
 */
test.describe('Group Management - Settings', { tag: [CHAT_SUITE_TAGS.GROUP_CHAT, TestPriority.P2] }, () => {
  test(
    'Verify group settings are accessible and radio options are visible',
    { tag: [TestPriority.P2, TestGroupType.SMOKE] },
    async ({ appManagerHomePage }) => {
      tagTest(test.info(), {
        description: 'App manager navigates to group settings and verifies that group permission options are visible',
        zephyrTestId: 'CHAT-2355',
        storyId: 'CHAT-2355',
      });

      const chatAppPage = await appManagerHomePage.navigateToChatPageViaTopNavBar();
      const { page } = chatAppPage;

      // Search and select group
      await page.getByRole('textbox', { name: 'Search...' }).fill(GROUP_NAME);
      await page.locator('div').filter({ hasText: SEARCH_FILTER_REGEX }).getByRole('paragraph').nth(3).click();

      // Open group settings
      await page.getByTestId('moreOptions').click();
      await page.getByTestId('managegroup').click();

      // Verify group permissions
      await expect(page.getByText(GROUP_PERMISSION_TEXT)).toBeVisible();
      await expect(page.getByRole('radio', { name: OPEN_RADIO_LABEL })).not.toBeChecked();
      await expect(page.getByRole('radio', { name: ANNOUNCEMENT_RADIO_LABEL })).toBeChecked();
    }
  );
});

test.describe(
  'Group Management - Chat Editor Visibility',
  { tag: [CHAT_SUITE_TAGS.GROUP_CHAT, TestPriority.P2] },
  () => {
    test.only(
      'Verify chat editor input box is hidden when navigating to all-company group',
      { tag: [TestPriority.P2, TestGroupType.SMOKE] },
      async ({ browser }) => {
        tagTest(test.info(), {
          description:
            'Standard user navigates to group settings and verifies that group permission options are not visible',
          zephyrTestId: 'CHAT-2356',
          storyId: 'CHAT-2356',
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
        await expect(chatEditorContainer).toBeHidden();

        console.log('SUCCESS: Chat editor is hidden in all-company group for END_USER2');

        // Open group settings
        await page.getByTestId('moreOptions').click();
        await page.getByTestId('managegroup').isHidden();
      }
    );
  }
);
