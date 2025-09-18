import { dualUserChatFixture as test } from '@modules/chat/fixtures/dualUserChatFixture';

/**
 * Example test suite demonstrating how to use the dualUserChatFixture
 * for testing chat functionality with two users simultaneously
 */
test.describe('Direct Message between two static users', () => {
  test('Real-time conversation between two users', async ({ dualUserHelpers }) => {
    // Open the same group chat for both users
    await dualUserHelpers.openSameGroupChatForBothUsers('direct-message');

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

  test('Direct message between two users', async ({ dualUserHelpers }) => {
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

  test('Multiple group chats simultaneously', async ({ user1ChatPage, user2ChatPage }) => {
    // User 1 joins Group A
    await user1ChatPage.actions.openGroupChat('group1', {
      stepInfo: 'User 1 opening group1',
    });

    // User 2 joins Group B
    await user2ChatPage.actions.openGroupChat('group2', {
      stepInfo: 'User 2 opening group2',
    });

    // Send messages in different groups
    await user1ChatPage.actions.sendMessage(`Message in group1 - ${Date.now()}`);
    await user2ChatPage.actions.sendMessage(`Message in group2 - ${Date.now()}`);

    // Now both users join the same group
    await user1ChatPage.actions.openGroupChat('direct-message', {
      stepInfo: 'User 1 opening Common Group',
    });
    await user2ChatPage.actions.openGroupChat('direct-message', {
      stepInfo: 'User 2 opening Common Group',
    });

    // Test real-time messaging in the common group
    const commonMessage = `Common group message - ${Date.now()}`;
    await user1ChatPage.actions.sendMessage(commonMessage);
    await user2ChatPage.assertions.verifyMessageIsVisible(commonMessage, {
      stepInfo: 'User 2 verifying message in common group',
    });
  });
});
