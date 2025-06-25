import { test } from '@playwright/test';
import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { CHAT_TEST_DATA } from '@/src/modules/chat/test-data/chat.test-data';
import { ChatHelper } from '@chat/helpers/chatHelper';
import { getEnvConfig } from '../../../../../core/utils/getEnvConfig';
import { LoginHelper } from '../../../../../core/helpers/loginHelper';
import { ChatAttachmentHelper } from '../../../helpers/chatAttachmentHelper';
import { ChatAttachmentPage } from '../../../pages/chatAttachmentPage';

test.describe(
  'Test chat application with attachment',
  {
    tag: [TestSuite.CHAT_ATTACHMENT],
  },  
  () => {
    test.beforeEach('before each', async ({ page }) => {
      ChatAttachmentHelper.init(page);   // 👈 make sure this runs
    });
  
    test.afterEach('Close context created for new users', async () => {
    });

    test(
      'User is able to send attachment in chat',
      {
        tag: [TestPriority.P0, '@chat-attachment'],
      },
      async ({ page }) => {
        const homePage = await LoginHelper.loginWithPassword(page, {
          email: getEnvConfig().appManagerEmail,
          password: getEnvConfig().appManagerPassword,
        });
        await homePage.verifyThePageIsLoaded();
        const chatPageUser1 = await homePage.navigateToChatsPage();
        const user2Name = 'Mya Johnson';
        const chatAttachmentPage = new ChatAttachmentPage(page);

        //now open conversation with user 2
        await ChatHelper.directMessages.openDirectMessageWithUser(chatPageUser1, user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        await chatAttachmentPage.sendAttachment('src/modules/chat/test-data/1.pdf');
  
      }
    );


    test(
      'Verify sending unsupported files format',
      {
        tag: [TestPriority.P0, '@chat-attachment'],
      },
      async ({ page }) => {
        const homePage = await LoginHelper.loginWithPassword(page, {
          email: getEnvConfig().appManagerEmail,
          password: getEnvConfig().appManagerPassword,
        });
        await homePage.verifyThePageIsLoaded();
        const chatPageUser1 = await homePage.navigateToChatsPage();
        const user2Name = 'Mya Johnson';
        const chatAttachmentPage = new ChatAttachmentPage(page);

        //now open conversation with user 2
        await ChatHelper.directMessages.openDirectMessageWithUser(chatPageUser1, user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        await chatAttachmentPage.sendUnsupportedFile('src/modules/chat/test-data/websocketConnection.jmx');
  
      }
    );


    test(
      'Verify sending a file larger than 100 MB',
      {
        tag: [TestPriority.P0, '@chat-attachment'],
      },
      async ({ page }) => {
        const homePage = await LoginHelper.loginWithPassword(page, {
          email: getEnvConfig().appManagerEmail,
          password: getEnvConfig().appManagerPassword,
        });
        await homePage.verifyThePageIsLoaded();
        const chatPageUser1 = await homePage.navigateToChatsPage();
        const user2Name = 'Mya Johnson';
        const chatAttachmentPage = new ChatAttachmentPage(page);

        //now open conversation with user 2
        await ChatHelper.directMessages.openDirectMessageWithUser(chatPageUser1, user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        await chatAttachmentPage.sendAttachment('src/modules/chat/test-data/1.pdf');
  
      }
    );

    test(
      'Verify sending 10 files',
      {
        tag: [TestPriority.P0, '@chat-attachment'],
      },
      async ({ page }) => {
        const homePage = await LoginHelper.loginWithPassword(page, {
          email: getEnvConfig().appManagerEmail,
          password: getEnvConfig().appManagerPassword,
        });
        await homePage.verifyThePageIsLoaded();
        const chatPageUser1 = await homePage.navigateToChatsPage();
        const user2Name = 'Mya Johnson';
        const chatAttachmentPage = new ChatAttachmentPage(page);

        //now open conversation with user 2
        await ChatHelper.directMessages.openDirectMessageWithUser(chatPageUser1, user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        await chatAttachmentPage.sendSameFileMultipleTimes('src/modules/chat/test-data/1.pdf', 10);
  
      }
    );
  
  test(
    'Verify sending more than 10 files',
    {
      tag: [TestPriority.P0, '@chat-attachment'],
    },
    async ({ page }) => {
      const homePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await homePage.verifyThePageIsLoaded();
      const chatPageUser1 = await homePage.navigateToChatsPage();
      const user2Name = 'Mya Johnson';
      const chatAttachmentPage = new ChatAttachmentPage(page);
      await ChatHelper.directMessages.openDirectMessageWithUser(chatPageUser1, user2Name, {
        stepInfo: `User 1 opening direct message with ${user2Name}`,
      });
        await chatAttachmentPage.sendFileExceedLimit('src/modules/chat/test-data/1.pdf', 11);

    }
  );


  
test(
  'Verify viewing image attachment',
  {
    tag: [TestPriority.P0, '@chat-attachment'],
  },
  async ({ page }) => {
    const homePage = await LoginHelper.loginWithPassword(page, {
      email: getEnvConfig().appManagerEmail,
      password: getEnvConfig().appManagerPassword,
    });
    await homePage.verifyThePageIsLoaded();
    const chatPageUser1 = await homePage.navigateToChatsPage();
    const user2Name = 'Mya Johnson';
    const chatAttachmentPage = new ChatAttachmentPage(page);
    await ChatHelper.directMessages.openDirectMessageWithUser(chatPageUser1, user2Name, {
      stepInfo: `User 1 opening direct message with ${user2Name}`,
    });
      await chatAttachmentPage.sendImageAndViewAttachment('src/modules/chat/test-data/Image1.jpg');

  }
);


test(
  'Verify attachment deletion before sending',
  {
    tag: [TestPriority.P0, '@chat-attachment'],
  },
  async ({ page }) => {
    const homePage = await LoginHelper.loginWithPassword(page, {
      email: getEnvConfig().appManagerEmail,
      password: getEnvConfig().appManagerPassword,
    });
    await homePage.verifyThePageIsLoaded();
    const chatPageUser1 = await homePage.navigateToChatsPage();
    const user2Name = 'Mya Johnson';
    const chatAttachmentPage = new ChatAttachmentPage(page);
    await ChatHelper.directMessages.openDirectMessageWithUser(chatPageUser1, user2Name, {
      stepInfo: `User 1 opening direct message with ${user2Name}`,
    });
      await chatAttachmentPage.deleteAttachmentBeforeSending('src/modules/chat/test-data/Image1.jpg');

  }
);

  test.only(
    'Verify sending video attachment',
    {
      tag: [TestPriority.P0, '@chat-attachment'],
    },
    async ({ page }) => {
      const homePage = await LoginHelper.loginWithPassword(page, {
        email: getEnvConfig().appManagerEmail,
        password: getEnvConfig().appManagerPassword,
      });
      await homePage.verifyThePageIsLoaded();
      const chatPageUser1 = await homePage.navigateToChatsPage();
      const user2Name = 'Mya Johnson';
      const chatAttachmentPage = new ChatAttachmentPage(page);
      await ChatHelper.directMessages.openDirectMessageWithUser(chatPageUser1, user2Name, {
        stepInfo: `User 1 opening direct message with ${user2Name}`,
      });
        await chatAttachmentPage.sendAttachment('src/modules/chat/test-data/video.mp4');
  
    }
  );

});
