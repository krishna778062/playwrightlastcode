import test from '@playwright/test';
import { Roles } from '@/src/core/constants/roles';
import { ApiClientFactory } from '@core/apiClients/apiClientFactory';
import { AppManagerApiClient } from '@core/apiClients/appManagerApiClient';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { LoginPage } from '@modules/chat/pages/loginPage';
import { ChatAppPage } from '@modules/chat/pages/chatsPage';
import { MessageEmojis } from '@/src/core/constants/messageEmojis';
import { TestDataBuilderUsingAPI } from '@/src/core/utils/testDataBuilder';

test.describe('Test chat application', () => {
  let groupName: string;
  let testDataBuilderUsingAPI: TestDataBuilderUsingAPI;
  test.beforeEach(`Login to Simpplr App`, async ({ page }) => {
    //login as admin
    const loginPage = new LoginPage(page);
    await loginPage.loadPage();
    const homePage = await loginPage.login('prateek.parashar@simpplr.com', 'Pp@123456');
    await homePage.getTopNavBarComponent().navigateToChatsPage();
    //generate test data for this suite and use it to create test data for the chat
    const appManagerClient = await ApiClientFactory.createClient(AppManagerApiClient, {
      type: 'cookies',
      page: page,
      baseUrl: process.env.API_BASE_URL!,
    });
    testDataBuilderUsingAPI = new TestDataBuilderUsingAPI(appManagerClient);
    groupName = TestDataGenerator.generateGroupName();
    await testDataBuilderUsingAPI.buildTestDataForChat(groupName, {
      createNew: { [Roles.END_USER]: 1 },
    });
  });

  test.fixme(
    `Admin should be able to chat with the newly added user inside newly added group`,
    async ({ page }) => {
      const chatsPage = new ChatAppPage(page);
      await chatsPage.loadPage();
      //verify user is able to see the newly added group in the list of groups
      await chatsPage.getInboxSideBarComponent().getGroupChatsSection().openGroupChat(groupName);
      await chatsPage
        .getFocusedChatComponent()
        .getChatEditorComponent()
        .sendMessage('Hello, how are you?');
      await chatsPage
        .getFocusedChatComponent()
        .verifyMessageIsPresentInListOfChatMessages('Hello, how are you?');
      const message = await chatsPage
        .getFocusedChatComponent()
        .getFocusedMessageObjectFromListOfChatMessages('Hello, how are you?');
      await message.reactOnMessage(MessageEmojis.PENSIVE_FACE);
      //delete the message
      await message.deleteMessageFromMessageActionsMenu();
      await chatsPage
        .getFocusedChatComponent()
        .verifyMessageIsNotPresentInListOfChatMessages('Hello, how are you?');
    }
  );
});
