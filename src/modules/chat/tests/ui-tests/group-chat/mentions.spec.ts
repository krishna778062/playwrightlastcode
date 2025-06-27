import { expect, Page } from '@playwright/test';
import { groupChatTestFixture as test } from '@chat/fixtures/groupChatFixture';
import { ChatTestUser } from '@chat/types/chat-test.type';
import { ChatAppPage } from '@chat/pages/chatsPage';

test.describe('Group Chat Mentions', () => {
  let user1: ChatTestUser;
  let user2: ChatTestUser;
  let user1ChatPage: ChatAppPage;
  let user2ChatPage: ChatAppPage;

  test.beforeEach(async ({ endUsersForChat, user1Page, user2Page }) => {
    user1 = endUsersForChat[0];
    user2 = endUsersForChat[1];
    user1ChatPage = new ChatAppPage(user1Page);
    user2ChatPage = new ChatAppPage(user2Page);
    await Promise.all([user1ChatPage.loadPage({ timeout: 40_000 }), user2ChatPage.loadPage({ timeout: 40_000 })]);
  });

  test.afterEach(async () => {
    await user1ChatPage?.page?.close();
    await user2ChatPage?.page?.close();
  });

  test('verify user is able to mention the same group in group chat and both users sees the message', async ({
    groupName,
  }) => {
    // const [user1ChatPage, user2ChatPage] = await multiUserChatTestHelper.loginMultipleUsersAndNavigateToChats([0, 1]);
    await user1ChatPage.getActions().openGroupChat(groupName, {
      stepInfo: `user 1 opening group ${groupName}`,
    });
    await user1ChatPage.getActions().sendMessage('Hello This message if from user 1 @user2', {
      stepInfo: `user 1 sending message "Hello This message if from user 1 @user2"`,
    });
    await user1ChatPage.getAssertions().verifyMessageIsVisible('Hello This message if from user 1 @user2', {
      stepInfo: `user 1 verifying message "Hello This message if from user 1 @user2"`,
    });

    //now user 2 opens the group chat and verifies the message
    await user2ChatPage.getActions().openGroupChat(groupName, {
      stepInfo: `user 2 opening group ${groupName}`,
    });
    await user2ChatPage.getAssertions().verifyMessageIsVisible('Hello This message if from user 1 @user2');

    //verify users are able to tag same group in chat
    await user1ChatPage.getActions().sendMessageWithGroupMention(groupName, 'Hello This message if from user 1');
    await user2ChatPage.getAssertions().verifyMessageIsVisible(`@${groupName} Hello This message if from user 1`);
  });

  test('verify mentions notification goes to user who is not active in the group chat', async ({ groupName }) => {
    // const [user1ChatPage, user2ChatPage] = await multiUserChatTestHelper.loginMultipleUsersAndNavigateToChats([0, 1]);
    await user1ChatPage.getActions().openGroupChat(groupName);
    await user1ChatPage.getActions().sendMessage('Hello This message if from user 1 @user2');
    await user1ChatPage.getAssertions().verifyMessageIsVisible('Hello This message if from user 1 @user2');
    //verify users are able to tag same group in chat
    await user1ChatPage.getActions().sendMessageWithGroupMention(groupName, 'Hello This message if from user 1');

    //nothing happens here TODO : Check with Aditya on this
  });

  test('verify if user 1 mentions user 2 in the group chat, user 2 sees that message in mentions section', async ({
    groupName,
  }) => {
    // const [user1ChatPage, user2ChatPage] = await multiUserChatTestHelper.loginMultipleUsersAndNavigateToChats([0, 1]);
    await user1ChatPage.getActions().openGroupChat(groupName);
    await user1ChatPage.getActions().sendMessage('Hello This message if from user 1');
    await user1ChatPage.getAssertions().verifyMessageIsVisible('Hello This message if from user 1');
    //verify users are able to tag same group in chat
    await user1ChatPage.getActions().sendMessageWithPeopleMention(user2.fullName, 'Hi, How are you?');
    //verify user1 is able to see his own message in chat
    await user1ChatPage.getAssertions().verifyMessageIsVisible(`@${user2.fullName} Hi, How are you?`);
    //verify user 1 is able to hover over the mentioned user and it should open user's profile
    const messageItemForUser1 = await user1ChatPage
      .getActions()
      .getMessageItemFromChat(`@${user2.fullName} Hi, How are you?`);
    const mentionedUserNameInMessage = messageItemForUser1.locator(`[data-label="${user2.fullName}"]`);
    await mentionedUserNameInMessage.hover();
    //verify user 2 profile is visible
    const user2Profile = user1ChatPage.page.locator('[class*=User_chatProfileCardRoot]');
    await expect(user2Profile).toBeVisible();
    const user2ProfileName = user2Profile.locator('[class*=User_profileInfo_]');
    await expect(user2ProfileName).toContainText(user2.fullName);

    //now verify if user 1 click on the mentioned user, it should open user's profile in sidebar
    await mentionedUserNameInMessage.click();
    const chatProfileInSidebar = user1ChatPage.page.locator('[class*=Profile_profileContainer]');
    await expect(chatProfileInSidebar).toBeVisible();
    const user2ProfileNameInSidebar = chatProfileInSidebar.locator('[class*=Profile_profileUserName]');
    await expect(user2ProfileNameInSidebar).toContainText(user2.fullName);

    const user2ProfileLink = user2ProfileNameInSidebar.getByRole('link', { name: user2.fullName });
    await user2ProfileLink.click();
    await user1ChatPage.page.waitForURL(/people/);
    await user1ChatPage.page.goBack();

    //wait for 3 seconds
    await user2ChatPage.sleep(3000);
    //verify user 2 is able to see the message in mentions section
    await user2ChatPage.getActions().openMentionsSection();
    await user2ChatPage
      .getAssertions()
      .verifyMessageIsPresentInMentionsSection(groupName, `@${user2.fullName} Hi, How are you?`, user1.fullName);
    await user2ChatPage.getActions().clickOnMessageInMentionsSection(groupName, `@${user2.fullName} Hi, How are you?`);
  });

  test('verify if user clicks on a mentioned message which is deleted, it should not open the message in mentions section', async ({
    groupName,
  }) => {
    // const [user1ChatPage, user2ChatPage] = await multiUserChatTestHelper.loginMultipleUsersAndNavigateToChats([0, 1]);
    await user1ChatPage.getActions().openGroupChat(groupName);
    await user1ChatPage.getActions().sendMessage('Hello This message if from user 1');
    await user1ChatPage.getAssertions().verifyMessageIsVisible('Hello This message if from user 1');

    await user1ChatPage.getActions().sendMessageWithPeopleMention(user2.fullName, 'Hi, How are you?');
    await user1ChatPage.getAssertions().verifyMessageIsVisible(`@${user2.fullName} Hi, How are you?`);
    const messageId = await user1ChatPage.getActions().getDataMessageId(`@${user2.fullName} Hi, How are you?`);
    console.log(`messageId for user 1 is : ${messageId}`);

    //user 2 opens mention section and verify the message is present
    await user2ChatPage.sleep(3000);
    await user2ChatPage.getActions().openMentionsSection();
    await user2ChatPage
      .getAssertions()
      .verifyMessageIsPresentInMentionsSection(groupName, `@${user2.fullName} Hi, How are you?`, user1.fullName);

    //now user 1 deletes the message
    await user1ChatPage.getActions().deleteMessage(`@${user2.fullName} Hi, How are you?`);
    //verify user 2 is not able to see the message in mentions section
    await user2ChatPage.getActions().clickOnMessageInMentionsSection(groupName, `@${user2.fullName} Hi, How are you?`);

    await user2ChatPage.getAssertions().verifyTheMessageAppearsDeleted(String(messageId));
  });
});
