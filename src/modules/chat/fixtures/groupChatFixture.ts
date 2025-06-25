import { BrowserContext, Page, test } from '@playwright/test';
import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { MultiUserChatTestHelper } from '../helpers/multiUserChatTestHelper';
import { ChatTestUser } from '../types/chat-test.type';
import { Roles } from '../../../core/constants/roles';
import { ChatGroupTestDataBuilder } from '../test-data-builders/ChatGroupTestDataBuilder';
import { ApiClientFactory } from '../../../core/api/factories/apiClientFactory';
import { getEnvConfig } from '../../../core/utils/getEnvConfig';
import { TestDataGenerator } from '../../../core/utils/testDataGenerator';

export const groupChatTestFixture = test.extend<
  {
    groupName: string;
    user1Page: Page;
    user2Page: Page;
  },
  {
    appManagerApiClient: AppManagerApiClient;
    endUsersForChat: ChatTestUser[];
    loggedInContexts: { [key: string]: BrowserContext };
  }
>({
  appManagerApiClient: [
    async ({}, use, workerInfo) => {
      console.log(`Settnig up app manager client for worker => `, workerInfo.workerIndex);
      const appManagerApiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
        type: 'credentials',
        credentials: {
          username: getEnvConfig().appManagerEmail,
          password: getEnvConfig().appManagerPassword,
        },
        baseUrl: getEnvConfig().apiBaseUrl,
      });
      await use(appManagerApiClient);
    },
    { scope: 'worker' },
  ],
  endUsersForChat: [
    async ({ appManagerApiClient }, use) => {
      const chatGroupTestDataBuilder = new ChatGroupTestDataBuilder(appManagerApiClient);
      const userBuilder = chatGroupTestDataBuilder.getUserBuilder();
      const endUsers = await userBuilder.addUsersToSystem(2, Roles.END_USER, 'Simpplr@2025');
      const usersWithChatIds: ChatTestUser[] = await Promise.all(
        endUsers.map(async user => ({
          ...user,
          chatUserId: await appManagerApiClient
            .getUserManagementService()
            .getChatUserId(user.first_name, user.last_name),
        }))
      );
      await use(usersWithChatIds);
    },
    { scope: 'worker' },
  ],
  loggedInContexts: [
    async ({ endUsersForChat, browser }, use) => {
      const multiUserChatTestHelper = new MultiUserChatTestHelper(browser, true);
      await multiUserChatTestHelper.createContextsForUsers(endUsersForChat);
      const loggedInContexts = await multiUserChatTestHelper.createLoggedInContextsForUsers(endUsersForChat);
      await use(loggedInContexts);
      await multiUserChatTestHelper.cleanup();
    },
    { scope: 'worker' },
  ],
  groupName: [
    async ({ appManagerApiClient, endUsersForChat }, use) => {
      const chatGroupTestDataBuilder = new ChatGroupTestDataBuilder(appManagerApiClient);
      const groupName = TestDataGenerator.generateGroupName();
      const chatTestUserIds = endUsersForChat.map(user => user.chatUserId);
      const group = await chatGroupTestDataBuilder.createChatGroup(groupName, chatTestUserIds, {
        conversationType: 'GROUP',
      });
      await use(group);
    },
    { scope: 'test' },
  ],
  user1Page: [
    async ({ loggedInContexts, endUsersForChat }, use) => {
      const user1Context = loggedInContexts[endUsersForChat[0].email];
      const user1Page = await user1Context.newPage();
      //video path
      const videoPath = await user1Page.video()?.path();
      console.log('videoPath for user 1', videoPath);
      await use(user1Page);
      await user1Page?.close();
      if (videoPath) {
        const projectName = test.info().project.name;
        const listOfProjects = test.info().config.projects;
        for (const project of listOfProjects) {
          if (project.name === projectName) {
            if (project.use.video === 'on' || project.use.video === 'retain-on-failure') {
              await test.info().attach(`video-${endUsersForChat[0].fullName}`, {
                path: videoPath,
                contentType: 'video/webm',
              });
            }
          }
        }
      }
    },
    { scope: 'test' },
  ],
  user2Page: [
    async ({ loggedInContexts, endUsersForChat }, use) => {
      const user2Context = loggedInContexts[endUsersForChat[1].email];
      const user2Page = await user2Context.newPage();
      //video path
      const videoPath = await user2Page.video()?.path();
      console.log('videoPath for user 2', videoPath);
      await use(user2Page);
      await user2Page?.close();
      if (videoPath) {
        const projectName = test.info().project.name;
        const listOfProjects = test.info().config.projects;
        console.log('listOfProjects', listOfProjects);
        console.log('projectName', projectName);
        for (const project of listOfProjects) {
          console.log('project.use.video', project.use.video);
          if (project.name === projectName) {
            if (project.use.video === 'on' || project.use.video === 'retain-on-failure') {
              await test.info().attach(`video-${endUsersForChat[1].fullName}`, {
                path: videoPath,
                contentType: 'video/webm',
              });
            }
          }
        }
      }
    },
    { scope: 'test' },
  ],
});
