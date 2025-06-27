import { groupChatTestFixture as test } from '@chat/fixtures/groupChatFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestSuite } from '@core/constants/testSuite';
import { ChatAppPage } from '@chat/pages/chatsPage';
import { ChatTestUser } from '@chat/types/chat-test.type';
import { expect } from '@playwright/test';
import { FocusedMessageComponent } from '@chat/components/focusedMessageComponent';

test.describe(
  'Test chat application with attachment',
  {
    tag: [TestSuite.CHAT_ATTACHMENT],
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

    test(
      'Verify user is able to add and send pdf as  attachment in chat',
      {
        tag: [TestPriority.P0, '@chat-attachment'],
      },
      async () => {
        //now open conversation with user 2
        await user1ChatPage.getActions().openDirectMessageWithUser(user2.fullName, {
          stepInfo: `User 1 opening direct message with ${user2.fullName}`,
        });
        await user1ChatPage.getActions().sendAttachment('src/modules/chat/test-data/static-files/pdfFiles/1.pdf', {
          stepInfo: `User 1 sending attachment to ${user2.fullName}`,
        });
      }
    );

    test(
      'Verify sending unsupported files format',
      {
        tag: [TestPriority.P0, '@chat-attachment'],
      },
      async () => {
        const user2Name = user2.fullName;
        //now open conversation with user 2
        await user1ChatPage.getActions().openDirectMessageWithUser(user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        await user1ChatPage
          .getActions()
          .addAttachment('src/modules/chat/test-data/static-files/unsupportedFiles/websocketConnection.jmx', {
            stepInfo: `User 1 sending attachment to ${user2Name} which is not supported`,
            isItValidFile: false,
          });
        await user1ChatPage.getAssertions().verifyUnsupportedFileHandling({
          stepInfo: `User 1 Verifying the unsupported file message is visible`,
        });
      }
    );

    test(
      'Verify sending a file larger than 100 MB',
      {
        tag: [TestPriority.P0, '@chat-attachment'],
      },
      async () => {
        const user2Name = user2.fullName;
        //now open conversation with user 2
        await user1ChatPage.getActions().openDirectMessageWithUser(user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        await user1ChatPage.getActions().sendAttachment('src/modules/chat/test-data/static-files/pdfFiles/1.pdf', {
          stepInfo: `User 1 sending attachment to ${user2Name} which is larger than 100 MB`,
        });
      }
    );

    test(
      'verify user can attach upto 10 files in message successfully',
      {
        tag: [TestPriority.P0, '@chat-attachment'],
      },
      async () => {
        const user2Name = user2.fullName;
        //now open conversation with user 2
        await user1ChatPage.getActions().openDirectMessageWithUser(user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        for (let i = 0; i < 9; i++) {
          await user1ChatPage.getActions().addAttachment('src/modules/chat/test-data/static-files/pdfFiles/1.pdf', {
            stepInfo: `User 1 sending attachment to ${user2Name}`,
          });
          await user1ChatPage
            .getFocusedChatComponent()
            .getChatEditorComponent()
            .addMediaAttachmentButton.setInputFiles([]);
        }
        await user1ChatPage.getActions().sendAttachment('src/modules/chat/test-data/static-files/pdfFiles/1.pdf', {
          stepInfo: `User 1 sending attachment to ${user2Name}`,
        });
      }
    );

    test(
      'verify user can not attach more than 10 files in message and on doing that it shows error message',
      {
        tag: [TestPriority.P0, '@chat-attachment'],
      },
      async () => {
        const user2Name = user2.fullName;
        //now open conversation with user 2
        await user1ChatPage.getActions().openDirectMessageWithUser(user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        for (let i = 0; i < 10; i++) {
          await user1ChatPage.getActions().addAttachment('src/modules/chat/test-data/static-files/pdfFiles/1.pdf', {
            stepInfo: `User 1 sending attachment to ${user2Name}`,
          });
          await user1ChatPage
            .getFocusedChatComponent()
            .getChatEditorComponent()
            .addMediaAttachmentButton.setInputFiles([]);
        }
        await user1ChatPage.getActions().addAttachment('src/modules/chat/test-data/static-files/pdfFiles/1.pdf', {
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
      'Verify viewing image attachment',
      {
        tag: [TestPriority.P0, '@chat-attachment'],
      },
      async ({ user1Page }) => {
        const user2Name = user2.fullName;
        //now open conversation with user 2
        await user1ChatPage.getActions().openDirectMessageWithUser(user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        await user1ChatPage
          .getActions()
          .sendAttachment('src/modules/chat/test-data/static-files/imageFiles/Image1.jpg', {
            stepInfo: `User 1 sending attachment to ${user2Name}`,
          });
        await user1ChatPage.sleep(2000);
        const user1MessageWithAttachment = await user1ChatPage.getActions().getLastMessageWithAttachment('image');
        await expect(user1MessageWithAttachment).toBeVisible();

        //open the image attachement for preview
        const focusedMessageComponent = new FocusedMessageComponent(user1Page, user1MessageWithAttachment);
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
      'Verify attachment deletion before sending',
      {
        tag: [TestPriority.P0, '@chat-attachment'],
      },
      async () => {
        const user2Name = user2.fullName; //now open conversation with user 2
        await user1ChatPage.getActions().openDirectMessageWithUser(user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        //verify user is able to add and delete attachment in editor
        await user1ChatPage
          .getAssertions()
          .verifyUserIsAbleToAddAndDeleteAttachmentInEditor(
            'src/modules/chat/test-data/static-files/imageFiles/Image1.jpg',
            {
              stepInfo: `Verifying user 1 is able to add and delete attachment in editor`,
            }
          );
      }
    );

    test(
      'Verify sending video attachment',
      {
        tag: [TestPriority.P0, '@chat-attachment'],
      },
      async () => {
        const user2Name = user2.fullName;
        //now open conversation with user 2
        await user1ChatPage.getActions().openDirectMessageWithUser(user2Name, {
          stepInfo: `User 1 opening direct message with ${user2Name}`,
        });
        await user1ChatPage
          .getActions()
          .sendAttachment('src/modules/chat/test-data/static-files/videoFiles/video.mp4', {
            stepInfo: `User 1 sending attachment to ${user2Name}`,
          });
      }
    );
  }
);
