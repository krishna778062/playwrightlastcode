import { expect } from '@playwright/test';

import { groupChatTestFixture as test } from '@chat/fixtures/groupChatFixture';
import { ChatTestUser } from '@chat/types/chat-test.type';
import { TestPriority } from '@core/constants/testPriority';

import { USER_STATUS } from '@/src/core/constants/status';
import { CHAT_SUITE_TAGS } from '@/src/modules/chat/constants/testTags';
import { MessageCardComponent } from '@/src/modules/chat/ui/components/messageCardComponent';
import { ChatAppPage } from '@/src/modules/chat/ui/pages/chatPage/chatPage';

test.describe(
  'test chat application with attachment',
  {
    tag: [CHAT_SUITE_TAGS.CHAT_ATTACHMENT],
  },
  () => {
    let user1: ChatTestUser;
    let user2: ChatTestUser;
    let user1ChatPage: ChatAppPage;
    test.beforeEach('before each', async ({ endUsersForChat, user1Page }) => {
      user1 = endUsersForChat[0];
      user2 = endUsersForChat[1];
      user1ChatPage = new ChatAppPage(user1Page);
      await user1ChatPage.loadPage({ timeout: 40_000 });
    });

    test.afterEach('after each', async ({ endUsersForChat, userManagementService }) => {
      // Deactivate users after each test
      for (const user of endUsersForChat) {
        if (user.email) {
          try {
            const userId = await userManagementService.getUserId(user.email);
            console.log(`Deactivating user ${user.email} with userId: ${userId}`);
            await userManagementService.updateUserStatus(userId, USER_STATUS.INACTIVE);
          } catch (error) {
            console.log(`Failed to deactivate user ${user.email}: ${error}`);
          }
        }
      }
    });

    test(
      'verify user is able to add and send pdf as  attachment in chat',
      {
        tag: [TestPriority.P0, '@chat-attachment'],
      },
      async () => {
        //now open conversation with user 2
        await user1ChatPage.actions.openDirectMessageWithUser(user2.fullName, {
          stepInfo: `User 1 opening direct message with ${user2.fullName}`,
        });
        await user1ChatPage.actions.sendAttachment('src/modules/chat/test-data/static-files/pdfFiles/1.pdf', {
          stepInfo: `User 1 sending attachment to ${user2.fullName}`,
        });
      }
    );

    test(
      'verify sending unsupported files format',
      {
        tag: [TestPriority.P0],
      },
      async () => {
        const user2Name = user2.fullName;
        //now open conversation with user 2
        await user1ChatPage.actions.openDirectMessageWithUser(user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        await user1ChatPage.actions.addAttachment(
          'src/modules/chat/test-data/static-files/unsupportedFiles/websocketConnection.jmx',
          {
            stepInfo: `User 1 sending attachment to ${user2Name} which is not supported`,
            isItValidFile: false,
          }
        );
        await user1ChatPage.assertions.verifyUnsupportedFileHandling({
          stepInfo: `User 1 Verifying the unsupported file message is visible`,
        });
      }
    );

    test(
      'verify sending a file larger than 100 MB',
      {
        tag: [TestPriority.P0],
      },
      async () => {
        const user2Name = user2.fullName;
        //now open conversation with user 2
        await user1ChatPage.actions.openDirectMessageWithUser(user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        await user1ChatPage.actions.sendAttachment('src/modules/chat/test-data/static-files/pdfFiles/1.pdf', {
          stepInfo: `User 1 sending attachment to ${user2Name} which is larger than 100 MB`,
        });
      }
    );

    test(
      'verify user can attach upto 10 files in message successfully',
      {
        tag: [TestPriority.P0],
      },
      async () => {
        const user2Name = user2.fullName;
        //now open conversation with user 2
        await user1ChatPage.actions.openDirectMessageWithUser(user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        for (let i = 0; i < 9; i++) {
          await user1ChatPage.actions.addAttachment('src/modules/chat/test-data/static-files/pdfFiles/1.pdf', {
            stepInfo: `User 1 sending attachment to ${user2Name}`,
          });
          await user1ChatPage
            .getConversationWindowComponent()
            .getChatEditorComponent()
            .addMediaAttachmentButton.setInputFiles([]);
        }
        await user1ChatPage.actions.sendAttachment('src/modules/chat/test-data/static-files/pdfFiles/1.pdf', {
          stepInfo: `User 1 sending attachment to ${user2Name}`,
        });
      }
    );

    test(
      'verify user can not attach more than 10 files in message and on doing that it shows error message',
      {
        tag: [TestPriority.P0],
      },
      async () => {
        const user2Name = user2.fullName;
        //now open conversation with user 2
        await user1ChatPage.actions.openDirectMessageWithUser(user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        for (let i = 0; i < 10; i++) {
          await user1ChatPage.actions.addAttachment('src/modules/chat/test-data/static-files/pdfFiles/1.pdf', {
            stepInfo: `User 1 sending attachment to ${user2Name}`,
          });
          await user1ChatPage
            .getConversationWindowComponent()
            .getChatEditorComponent()
            .addMediaAttachmentButton.setInputFiles([]);
        }
        await user1ChatPage.actions.addAttachment('src/modules/chat/test-data/static-files/pdfFiles/1.pdf', {
          stepInfo: `User 1 sending attachment to ${user2Name}`,
          isItValidFile: false,
        });
        const maximumFilesLimitError = user1ChatPage.page.locator('span', {
          hasText: 'Maximum attachments limit reached',
        });
        await expect(maximumFilesLimitError).toBeVisible();
      }
    );

    test(
      'verify viewing image attachment',
      {
        tag: [TestPriority.P0],
      },
      async ({ user1Page }) => {
        const user2Name = user2.fullName;
        //now open conversation with user 2
        await user1ChatPage.actions.openDirectMessageWithUser(user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        await user1ChatPage.actions.sendAttachment('src/modules/chat/test-data/static-files/imageFiles/Image1.jpg', {
          stepInfo: `User 1 sending attachment to ${user2Name}`,
        });
        await user1ChatPage.sleep(2000);
        const user1MessageWithAttachment = await user1ChatPage.actions.getLastMessageWithAttachment('image');
        await expect(user1MessageWithAttachment).toBeVisible();

        //open the image attachement for preview
        const focusedMessageComponent = new MessageCardComponent(user1Page, user1MessageWithAttachment);
        await focusedMessageComponent.openAttachmentForPreview('image');

        await user1ChatPage.getImageAttachementPreviewModalComponent().verifyTheImageAttachementPreviewModalIsVisible({
          stepInfo: `User 1 Verifying the image attachement preview modal is visible`,
        });
        await user1ChatPage.getImageAttachementPreviewModalComponent().clickOnCloseAttachmentPreviewButton({
          stepInfo: `User 1 Clicking on the close attachment preview button`,
        });
        await user1ChatPage
          .getImageAttachementPreviewModalComponent()
          .verifyTheImageAttachementPreviewModalIsNotVisible({
            stepInfo: `User 1 Verifying the image attachement preview modal is not visible`,
          });
      }
    );

    test(
      'verify attachment deletion before sending',
      {
        tag: [TestPriority.P0],
      },
      async () => {
        const user2Name = user2.fullName; //now open conversation with user 2
        await user1ChatPage.actions.openDirectMessageWithUser(user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        //verify user is able to add and delete attachment in editor
        await user1ChatPage.assertions.verifyUserIsAbleToAddAndDeleteAttachmentInEditor(
          'src/modules/chat/test-data/static-files/imageFiles/Image1.jpg',
          {
            stepInfo: `Verifying user 1 is able to add and delete attachment in editor`,
          }
        );
      }
    );

    test(
      'verify sending video attachment',
      {
        tag: [TestPriority.P0],
      },
      async () => {
        const user2Name = user2.fullName;
        //now open conversation with user 2
        await user1ChatPage.actions.openDirectMessageWithUser(user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        await user1ChatPage.actions.sendAttachment('src/modules/chat/test-data/static-files/videoFiles/video1.mp4', {
          stepInfo: `User 1 sending attachment to ${user2Name}`,
        });
      }
    );
  }
);
