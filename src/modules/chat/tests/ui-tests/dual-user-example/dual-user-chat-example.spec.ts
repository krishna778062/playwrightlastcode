import { expect } from '@playwright/test';

import {
  createDualUserChatFixture,
  dualUserChatFixture as test,
  DualUserConfig,
} from '@modules/chat/fixtures/dualUserChatFixture';

/**
 * Example test suite demonstrating how to use the dualUserChatFixture
 * for testing chat functionality with two users simultaneously
 */
test.describe('Dual User Chat Examples', () => {
  test.beforeEach(async ({ user1ChatPage, user2ChatPage }) => {
    // Both users are automatically logged in and have chat pages ready
    console.log('Both users are logged in and ready for chat testing');
  });

  test('Example 1: Send message from User 1 and verify User 2 sees it', async ({ dualUserHelpers }) => {
    // Open the same group chat for both users
    await dualUserHelpers.openSameGroupChatForBothUsers('General');

    // User 1 sends a message
    const testMessage = `Hello from User 1 - ${Date.now()}`;
    await dualUserHelpers.sendMessageFromUser1(testMessage);

    // Verify both users can see the message
    await dualUserHelpers.verifyMessageVisibleForBothUsers(testMessage);
  });

  test('Example 2: Real-time conversation between two users', async ({ dualUserHelpers }) => {
    // Open the same group chat for both users
    await dualUserHelpers.openSameGroupChatForBothUsers('General');

    // User 1 starts the conversation
    const message1 = `Hi there! - ${Date.now()}`;
    await dualUserHelpers.sendMessageFromUser1(message1);
    await dualUserHelpers.verifyMessageVisibleForBothUsers(message1);

    // User 2 responds
    const message2 = `Hello back! - ${Date.now()}`;
    await dualUserHelpers.sendMessageFromUser2(message2);
    await dualUserHelpers.verifyMessageVisibleForBothUsers(message2);

    // User 1 continues the conversation
    const message3 = `How are you doing? - ${Date.now()}`;
    await dualUserHelpers.sendMessageFromUser1(message3);
    await dualUserHelpers.verifyMessageVisibleForBothUsers(message3);
  });

  test.only('Example 3: Direct message between users', async ({ dualUserHelpers }) => {
    // Open direct message conversation between users
    await dualUserHelpers.openDirectMessageBetweenUsers();

    // Send direct messages
    const directMessage1 = `Private message from User 1 - ${Date.now()}`;
    await dualUserHelpers.sendMessageFromUser1(directMessage1);
    await dualUserHelpers.verifyMessageVisibleForBothUsers(directMessage1);

    const directMessage2 = `Private reply from User 2 - ${Date.now()}`;
    await dualUserHelpers.sendMessageFromUser2(directMessage2);
    await dualUserHelpers.verifyMessageVisibleForBothUsers(directMessage2);
  });

  test('Example 4: Advanced - Individual user actions', async ({ user1ChatPage, user2ChatPage, dualUserHelpers }) => {
    // You can also access individual user chat pages for more complex scenarios
    await dualUserHelpers.openSameGroupChatForBothUsers('General');

    // User 1 sends a message using direct chat page access
    const message = `Advanced example message - ${Date.now()}`;
    await user1ChatPage.actions.sendMessage(message);

    // User 2 verifies the message using direct chat page access
    await user2ChatPage.assertions.verifyMessageIsVisible(message, {
      stepInfo: 'User 2 verifying User 1 message',
    });

    // You can also perform other chat actions like:
    // - Opening different chats for each user
    // - Checking typing indicators
    // - Verifying read receipts
    // - Testing file attachments
    // - etc.
  });

  test('Example 5: Multiple group chats simultaneously', async ({ user1ChatPage, user2ChatPage }) => {
    // User 1 joins Group A
    await user1ChatPage.actions.openGroupChat('Group A', {
      stepInfo: 'User 1 opening Group A',
    });

    // User 2 joins Group B
    await user2ChatPage.actions.openGroupChat('Group B', {
      stepInfo: 'User 2 opening Group B',
    });

    // Send messages in different groups
    await user1ChatPage.actions.sendMessage(`Message in Group A - ${Date.now()}`);
    await user2ChatPage.actions.sendMessage(`Message in Group B - ${Date.now()}`);

    // Now both users join the same group
    await user1ChatPage.actions.openGroupChat('Common Group', {
      stepInfo: 'User 1 opening Common Group',
    });
    await user2ChatPage.actions.openGroupChat('Common Group', {
      stepInfo: 'User 2 opening Common Group',
    });

    // Test real-time messaging in the common group
    const commonMessage = `Common group message - ${Date.now()}`;
    await user1ChatPage.actions.sendMessage(commonMessage);
    await user2ChatPage.assertions.verifyMessageIsVisible(commonMessage, {
      stepInfo: 'User 2 verifying message in common group',
    });
  });

  test('Example 6: Testing message reactions (if supported)', async ({
    user1ChatPage,
    user2ChatPage,
    dualUserHelpers,
  }) => {
    await dualUserHelpers.openSameGroupChatForBothUsers('General');

    // User 1 sends a message
    const messageText = `React to this message - ${Date.now()}`;
    await dualUserHelpers.sendMessageFromUser1(messageText);
    await dualUserHelpers.verifyMessageVisibleForBothUsers(messageText);

    // User 2 could react to the message (if your chat supports reactions)
    // await user2ChatPage.actions.reactToMessage(messageText, '👍');

    // User 1 could verify the reaction
    // await user1ChatPage.assertions.verifyMessageHasReaction(messageText, '👍');
  });
});

/**
 * Example with Custom Static Users
 * This demonstrates how to use specific static users instead of environment variables
 */
test.describe('Custom Static Users Example', () => {
  // Define your static users
  const customUsers: DualUserConfig = {
    user1: {
      email: 'john.doe@company.com',
      password: 'Password123!',
      name: 'John Doe',
    },
    user2: {
      email: 'jane.smith@company.com',
      password: 'Password456!',
      name: 'Jane Smith',
    },
  };

  // Create fixture with custom users
  const customTest = createDualUserChatFixture(customUsers);

  customTest('Chat between John and Jane', async ({ dualUserHelpers }) => {
    // Now John and Jane are logged in instead of default users
    await dualUserHelpers.openSameGroupChatForBothUsers('General');

    const message = `Hello from custom users! - ${Date.now()}`;
    await dualUserHelpers.sendMessageFromUser1(message);
    await dualUserHelpers.verifyMessageVisibleForBothUsers(message);
  });

  customTest('Direct message between custom users', async ({ dualUserHelpers }) => {
    await dualUserHelpers.openDirectMessageBetweenUsers();

    const dmMessage = `Private message between John and Jane - ${Date.now()}`;
    await dualUserHelpers.sendMessageFromUser2(dmMessage);
    await dualUserHelpers.verifyMessageVisibleForBothUsers(dmMessage);
  });
});

/**
 * Different Custom Users for Different Test Suites
 */
test.describe('QA Team Users', () => {
  const qaUsers: DualUserConfig = {
    user1: {
      email: 'qa.tester1@company.com',
      password: 'QaTester123!',
      name: 'QA Tester 1',
    },
    user2: {
      email: 'qa.tester2@company.com',
      password: 'QaTester456!',
      name: 'QA Tester 2',
    },
  };

  const qaTest = createDualUserChatFixture(qaUsers);

  qaTest('QA team collaboration test', async ({ dualUserHelpers }) => {
    await dualUserHelpers.openSameGroupChatForBothUsers('QA Team');

    await dualUserHelpers.sendMessageFromUser1('Starting QA testing session');
    await dualUserHelpers.sendMessageFromUser2('Ready to collaborate');

    await dualUserHelpers.verifyMessageVisibleForBothUsers('Starting QA testing session');
    await dualUserHelpers.verifyMessageVisibleForBothUsers('Ready to collaborate');
  });
});

/**
 * Notes for using the dualUserChatFixture:
 *
 * 1. Default Usage (Environment Variables):
 *    - Import: `import { dualUserChatFixture as test } from '@modules/chat/fixtures/dualUserChatFixture'`
 *    - Uses: APP_MANAGER_USERNAME/PASSWORD and END_USER_USERNAME/PASSWORD
 *
 * 2. Custom Static Users:
 *    - Import: `import { createDualUserChatFixture, DualUserConfig } from '@modules/chat/fixtures/dualUserChatFixture'`
 *    - Define your users in DualUserConfig format
 *    - Create fixture: `const customTest = createDualUserChatFixture(customUsers)`
 *    - Use: `customTest('test name', async ({ dualUserHelpers }) => { ... })`
 *
 * 3. Features:
 *    - Both users are automatically logged in before each test
 *    - Each user has their own browser context and page
 *    - Use dualUserHelpers for common dual-user operations
 *    - Access individual user pages (user1ChatPage, user2ChatPage) for advanced scenarios
 *    - The fixture handles cleanup automatically
 */
