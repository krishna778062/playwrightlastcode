import { test } from '@playwright/test';
import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { MultiUserChatTestHelper } from '../helpers/multiUserChatTestHelper';
import { ChatTestUser } from '../types/chat-test.type';
import { Roles } from '../../../core/constants/roles';

type GroupChatTestObject = {
  appManagerApiClient: AppManagerApiClient;
  endUsers: ChatTestUser[];
  groupName: string;
  multiUserChatTestHelper: MultiUserChatTestHelper;
};

export const groupChatTestFixture = test.extend<GroupChatTestObject>({
  multiUserChatTestHelper: async ({ browser }, use) => {
    const multiUserChatTestHelper = new MultiUserChatTestHelper();
    await multiUserChatTestHelper.setup(browser, {
      usersByRole: {
        [Roles.END_USER]: 2,
      },
      password: 'Simpplr@2025',
      createGroup: true,
    });
    multiUserChatTestHelper.getTestData().users.forEach(user => {
      console.log(`From multiUserChatTestHelper: ${user.email}`);
    });
    await use(multiUserChatTestHelper);
  },
  appManagerApiClient: async ({ multiUserChatTestHelper }, use) => {
    await use(multiUserChatTestHelper.getTestData().appManagerApiClient);
  },
  endUsers: async ({ multiUserChatTestHelper, browser }, use) => {
    multiUserChatTestHelper.getTestData().users.forEach(user => {
      console.log(`From endUsers: ${user.email}`);
    });
    await use(multiUserChatTestHelper.getTestData().users);
  },

  groupName: async ({ multiUserChatTestHelper }, use) => {
    const groupName = multiUserChatTestHelper.getTestData().groupName;
    await use(groupName);
  },
});
