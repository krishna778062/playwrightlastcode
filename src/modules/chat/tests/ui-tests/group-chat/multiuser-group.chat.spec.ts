import { test } from '@playwright/test';
import { BaseMultiUserChatTest } from '@chat-helpers/multiUserChatTestHelper';
import { MessageEmojis } from '@core/constants/messageEmojis';
import { Roles } from '@core/constants/roles';
import { CHAT_TEST_DATA } from '@chat/tests/test-data/chat.test-data';

test.describe('Test chat application with multiple users', () => {
  test.describe.configure({ timeout: CHAT_TEST_DATA.CONFIG.DEFAULT_TIMEOUT, mode: 'default' });

  let multiUserChatTest: BaseMultiUserChatTest;

  test.beforeEach('Setting up multi user chat test in before each', async ({ browser }) => {
    multiUserChatTest = new BaseMultiUserChatTest();
    await multiUserChatTest.setup(browser, {
      usersByRole: {
        [Roles.END_USER]: 2,
      },
      password: CHAT_TEST_DATA.CREDENTIALS.DEFAULT_PASSWORD,
    });
    await multiUserChatTest.createMultiUserContexts();
  });

  test.afterEach('Close context created for new users', async () => {
    await multiUserChatTest.cleanup();
  });

  test('Verify that user 1 and user 2 can navigate to the chat group and send messages', async () => {
    // Get test users
    const user1 = multiUserChatTest.getTestUserByIndex(0);
    const user2 = multiUserChatTest.getTestUserByIndex(1);

    // Login both users and navigate to chats
    const [user1ChatsPage, user2ChatsPage] =
      await multiUserChatTest.loginMultipleUsersAndNavigateToChats();

    // Open group chat for both users
    await multiUserChatTest.openGroupChatForMultipleUsers(
      [user1ChatsPage, user2ChatsPage],
      multiUserChatTest.getGroupName()
    );

    // User 1 sends message
    await user1ChatsPage
      .getFocusedChatComponent()
      .getChatEditorComponent()
      .sendMessage(CHAT_TEST_DATA.MESSAGES.USER1.INITIAL);

    // Verify message appears for both users
    await multiUserChatTest.verifyMessageAppearsForAllTheUsersInChatSection(
      [user1ChatsPage, user2ChatsPage],
      CHAT_TEST_DATA.MESSAGES.USER1.INITIAL
    );

    // User 2 sends message
    await user2ChatsPage
      .getFocusedChatComponent()
      .getChatEditorComponent()
      .sendMessage(CHAT_TEST_DATA.MESSAGES.USER2.INITIAL);

    // Verify message appears for both users
    await multiUserChatTest.verifyMessageAppearsForAllTheUsersInChatSection(
      [user1ChatsPage, user2ChatsPage],
      CHAT_TEST_DATA.MESSAGES.USER2.INITIAL,
      { timeout: 30_000 }
    );

    //verify user 1 can reply to user 2's message
    const replyThreadComponent = await multiUserChatTest.sendReplyMessageInThread(
      user1ChatsPage,
      CHAT_TEST_DATA.MESSAGES.USER2.INITIAL,
      CHAT_TEST_DATA.MESSAGES.USER1.REPLY,
      { userNumber: 1 }
    );

    //verify user 2 can reply to user 1's message
    await multiUserChatTest.sendReplyMessageInThread(
      user2ChatsPage,
      CHAT_TEST_DATA.MESSAGES.USER2.INITIAL,
      CHAT_TEST_DATA.MESSAGES.USER2.REPLY,
      { userNumber: 2 }
    );

    //now user 1 will get the focused message component from the reply thread based on the message text by user 2
    const user1FocusedMessageInReplyThread =
      await replyThreadComponent.getFocusedMessageInReplyThread(
        CHAT_TEST_DATA.MESSAGES.USER2.REPLY,
        {
          stepInfo: `Waiting until user 1 ${user1.first_name} starts seeing the message ${CHAT_TEST_DATA.MESSAGES.USER2.REPLY} in reply thread`,
        }
      );
    await user1FocusedMessageInReplyThread.reactOnMessage(MessageEmojis.THUMBS_UP, {
      stepInfo: `User 1 ${user1.first_name} looking to react on message: ${MessageEmojis.THUMBS_UP} by user 2 ${user2.first_name}`,
    });
  });

  test('Verify user 1 is able to record video and add it to the chat and user 2 can play/download the video', async () => {
    // Login both users and navigate to chats
    const [user1ChatsPage, user2ChatsPage] =
      await multiUserChatTest.loginMultipleUsersAndNavigateToChats();

    // Open group chat for both users
    await multiUserChatTest.openGroupChatForMultipleUsers(
      [user1ChatsPage, user2ChatsPage],
      multiUserChatTest.getGroupName()
    );

    // User 1 records and adds video
    const user1ChatEditorComponent = user1ChatsPage
      .getFocusedChatComponent()
      .getChatEditorComponent();
    const recordVideoPromptComponent = await user1ChatEditorComponent.clickOnRecordVideoOption();
    await recordVideoPromptComponent.recordAndAddTheVideoToTheChat(
      CHAT_TEST_DATA.CONFIG.RECORDING.VIDEO.DEFAULT_DURATION,
      {
        keepAudioOn: true,
        keepVideoOn: true,
      }
    );

    // Verify video is visible in chat editor
    await user1ChatEditorComponent.verifyTheVideoIsVisibleAsAttachementInTheChatEditor({
      stepInfo: `Verifying the video is visible as attachement in the chat editor for user 1`,
    });

    // Send message with video
    await user1ChatEditorComponent.sendMessage(CHAT_TEST_DATA.MESSAGES.USER1.INITIAL, {
      stepInfo: `User 1 sending message with video attachement`,
    });
  });

  test('Verify user 1 is able to record audio and add it to the chat and user 2 can play/download the audio', async () => {
    // Login both users and navigate to chats
    const [user1ChatsPage, user2ChatsPage] =
      await multiUserChatTest.loginMultipleUsersAndNavigateToChats();

    // Open group chat for both users
    await multiUserChatTest.openGroupChatForMultipleUsers(
      [user1ChatsPage, user2ChatsPage],
      multiUserChatTest.getGroupName()
    );

    // User 1 records and adds audio
    const user1ChatEditorComponent = user1ChatsPage
      .getFocusedChatComponent()
      .getChatEditorComponent();
    const recordAudioPromptComponent = await user1ChatEditorComponent.clickOnRecordAudioOption({
      stepInfo: `User 1 clicking on record audio option`,
    });
    await recordAudioPromptComponent.recordAudioAndAddItToTheChat({
      stepInfo: `User 1 recording audio and adding it to the chat`,
    });

    // Verify audio is visible in chat editor
    await user1ChatEditorComponent.verifyTheAudioIsVisibleAsAttachementInTheChatEditor({
      stepInfo: `Verifying the audio is visible as attachement in the chat editor for user 1`,
    });

    // Send message with audio
    await user1ChatEditorComponent.sendMessage(CHAT_TEST_DATA.MESSAGES.USER1.INITIAL, {
      stepInfo: `User 1 sending message with audio attachement`,
    });
  });

  test('Verify user 1 is able to initiate video call in the chat group and user 2 can join the video call', async () => {
    const user1 = multiUserChatTest.getTestUserByIndex(0);
    const user2 = multiUserChatTest.getTestUserByIndex(1);

    // Login both users and navigate to chats
    const [user1ChatsPage, user2ChatsPage] =
      await multiUserChatTest.loginMultipleUsersAndNavigateToChats();

    // Open group chat for both users
    await multiUserChatTest.openGroupChatForMultipleUsers(
      [user1ChatsPage, user2ChatsPage],
      multiUserChatTest.getGroupName()
    );

    // User 1 initiates video call
    const user1AudioVideoCallPage = await user1ChatsPage
      .getFocusedChatComponent()
      .startCall('video', {
        stepInfo: `User 1 starting video call in the chat group`,
      });

    await user1AudioVideoCallPage.verifyThePageIsLoaded({
      stepInfo: `Verifying the audio video call page is loaded for user 1`,
    });

    // Verify user 2 receives call notification
    const user2IncomingVideoCallComponent = await user2ChatsPage
      .getFocusedChatComponent()
      .getIncomingAudioVideoCallComponent()
      .verifyIncomingCallIsReceivedFromCaller(multiUserChatTest.getGroupName(), 'video', {
        isGroupChat: true,
        stepInfo: `Verifying user 2 sees notification/popup for incoming video call from group name ${multiUserChatTest.getGroupName()}`,
      });

    // User 2 accepts call
    const user2AudioVideoCallPage = await user2IncomingVideoCallComponent.acceptIncomingCall({
      stepInfo: `User 2 accepting incoming video call`,
    });

    // Verify video streams
    await user2AudioVideoCallPage.verifyMyVideoStreamIsVisible({
      stepInfo: `Verifying my video stream is visible for user 2`,
    });

    await user2AudioVideoCallPage.verifyVideoStreamFromUserIsVisible(
      `${user1.first_name} ${user1.last_name}`,
      true,
      {
        stepInfo: `Verifying video stream from user 1 is visible for user 2`,
      }
    );

    // Verify user 1 can see user 2
    await user1AudioVideoCallPage.verifyMeetingParticipantNameInList(
      `${user2.first_name} ${user2.last_name}`,
      {
        stepInfo: `Verifying user 1 can see user 2 has joined and can see his video stream`,
      }
    );

    await user1AudioVideoCallPage.verifyVideoStreamFromUserIsVisible(
      `${user2.first_name} ${user2.last_name}`,
      true,
      {
        stepInfo: `Verifying video stream from user 2 is visible for user 1`,
      }
    );

    // Verify participant count
    await user1AudioVideoCallPage.verifyCountOfMeetingParticipants(2, {
      stepInfo: `Verifying count of meeting participants for user 1`,
    });

    await user2AudioVideoCallPage.verifyCountOfMeetingParticipants(2, {
      stepInfo: `Verifying count of meeting participants for user 2`,
    });
  });
});
