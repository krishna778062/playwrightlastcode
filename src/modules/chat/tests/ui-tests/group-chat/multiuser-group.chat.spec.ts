import { CHAT_FEATURE_TAGS, CHAT_SUITE_TAGS } from '@chat/constants/testTags';
import { groupChatTestFixture as test } from '@chat/fixtures/groupChatFixture';
import { MultiUserChatTestHelper } from '@chat/helpers/multiUserChatTestHelper';
import { CHAT_TEST_DATA } from '@chat/test-data/chat.test-data';
import { ChatTestUser } from '@chat/types/chat-test.type';
import { MessageEmojis } from '@core/constants/messageEmojis';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';

import { ChatAppPage } from '@/src/modules/chat/ui/pages/chatPage/chatPage';

test.describe('group Chat with multiple users', { tag: [CHAT_SUITE_TAGS.GROUP_CHAT] }, () => {
  let user1: ChatTestUser;
  let user2: ChatTestUser;
  let user1ChatPage: ChatAppPage;
  let user2ChatPage: ChatAppPage;
  let multiUserChatTest: MultiUserChatTestHelper;

  test.beforeEach(
    'Setting up multi user chat test in before each',
    async ({ user1Page, user2Page, endUsersForChat, browser }) => {
      user1 = endUsersForChat[0];
      user2 = endUsersForChat[1];
      user1ChatPage = new ChatAppPage(user1Page);
      user2ChatPage = new ChatAppPage(user2Page);
      await Promise.all([user1ChatPage.loadPage({ timeout: 40_000 }), user2ChatPage.loadPage({ timeout: 40_000 })]);
      multiUserChatTest = new MultiUserChatTestHelper(browser);
    }
  );

  test(
    'verify user 1 and user 2 should be able to exchange messages, reply on message thread and react on message',
    { tag: [TestPriority.P0, TestGroupType.SMOKE, '@message-thread', '@react-on-message'] },
    async ({ groupName }) => {
      // Login both users and navigate to chats
      await multiUserChatTest.openGroupChatForMultipleUsers([user1ChatPage, user2ChatPage], groupName);

      // User 1 sends message
      await user1ChatPage.actions.sendMessage(CHAT_TEST_DATA.MESSAGES.USER1.INITIAL);

      // Verify message appears for both users
      await multiUserChatTest.verifyMessageAppearsForAllTheUsersInChatSection(
        [user1ChatPage, user2ChatPage],
        CHAT_TEST_DATA.MESSAGES.USER1.INITIAL
      );

      // User 2 sends message
      await user2ChatPage.actions.sendMessage(CHAT_TEST_DATA.MESSAGES.USER2.INITIAL);

      // Verify message appears for both users
      await multiUserChatTest.verifyMessageAppearsForAllTheUsersInChatSection(
        [user1ChatPage, user2ChatPage],
        CHAT_TEST_DATA.MESSAGES.USER2.INITIAL,
        { timeout: 30_000 }
      );

      //verify user 1 can reply to user 2's message
      const replyThreadComponentForUser1 = await user1ChatPage.actions.replyToMessage(
        CHAT_TEST_DATA.MESSAGES.USER2.INITIAL,
        CHAT_TEST_DATA.MESSAGES.USER1.REPLY,
        {
          stepInfo: `User 1 replying to user 2'smessage ${CHAT_TEST_DATA.MESSAGES.USER2.INITIAL}`,
        }
      );

      //verify user 2 can add his reply to same thread
      const replyThreadComponentForUser2 = await user2ChatPage.actions.replyToMessage(
        CHAT_TEST_DATA.MESSAGES.USER2.INITIAL,
        CHAT_TEST_DATA.MESSAGES.USER2.REPLY,
        {
          stepInfo: `User 2 replying to user 1's message ${CHAT_TEST_DATA.MESSAGES.USER1.INITIAL}`,
        }
      );

      //now user 1 will get the focused message component from the reply thread based on the message text by user 2
      const user1FocusedMessageInReplyThread = await replyThreadComponentForUser1.getFocusedMessageInReplyThread(
        CHAT_TEST_DATA.MESSAGES.USER2.REPLY,
        {
          stepInfo: `Waiting until user 1 ${user1.first_name} starts seeing the message ${CHAT_TEST_DATA.MESSAGES.USER2.REPLY} in reply thread`,
        }
      );
      await user1FocusedMessageInReplyThread.reactOnMessage(MessageEmojis.THUMBS_UP, {
        stepInfo: `User 1 ${user1.first_name} looking to react on message: ${MessageEmojis.THUMBS_UP} by user 2 ${user2.first_name}`,
      });
    }
  );

  test(
    'veirfy user 1 should be able to record video and add it to the chat and user 2 should be able to play/download the video',
    { tag: [TestPriority.P0, TestGroupType.REGRESSION, CHAT_FEATURE_TAGS.VIDEO_ATTACHMENT] },
    async ({ groupName }) => {
      await multiUserChatTest.openGroupChatForMultipleUsers([user1ChatPage, user2ChatPage], groupName);

      // User 1 records and adds video
      await user1ChatPage.actions.recordAndAddVideoToTheChat(CHAT_TEST_DATA.CONFIG.RECORDING.VIDEO.DEFAULT_DURATION, {
        keepAudioOn: true,
        keepVideoOn: true,
        addMessageWithVideo: CHAT_TEST_DATA.MESSAGES.USER1.INITIAL,
        stepInfo: `User 1 recording video and adding it to the chat with message ${CHAT_TEST_DATA.MESSAGES.USER1.INITIAL}`,
      });
      /**
       * TODO: Please extend this test to verify that user 2 can see/play/download the video
       */
    }
  );

  test(
    'verify user 1 should be able to record audio and add it to the chat and user 2 should be able to play/download the audio',
    { tag: [TestPriority.P0, TestGroupType.REGRESSION, CHAT_FEATURE_TAGS.AUDIO_ATTACHMENT] },
    async ({ groupName }) => {
      await multiUserChatTest.openGroupChatForMultipleUsers([user1ChatPage, user2ChatPage], groupName);

      // User 1 records and adds audio
      await user1ChatPage.actions.recordAndAddAudioToTheChat(CHAT_TEST_DATA.CONFIG.RECORDING.AUDIO.DEFAULT_DURATION, {
        keepAudioOn: true,
        keepVideoOn: true,
        addMessageWithAudio: CHAT_TEST_DATA.MESSAGES.USER1.INITIAL,
        stepInfo: `User 1 recording audio and adding it to the chat with message ${CHAT_TEST_DATA.MESSAGES.USER1.INITIAL}`,
      });

      /**
       * TODO: Please extend this test to verify that the other user can see/play/download the audio
       * TODO: we can also extend this test that what if user deletes his message with audio attachement
       * TODO: what other actions are possible we can extend this test to verify the same
       */
    }
  );

  test(
    'verify user 1 is able to initiate video call in group and user 2 is able to join the call',
    { tag: [TestPriority.P0, TestGroupType.SMOKE, CHAT_FEATURE_TAGS.VIDEO_CALL] },
    async ({ groupName }) => {
      await multiUserChatTest.openGroupChatForMultipleUsers([user1ChatPage, user2ChatPage], groupName);

      // User 1 initiates video call
      const user1AudioVideoCallPage = await user1ChatPage.actions.initiateAudioVideoCall('video', {
        stepInfo: `User 1 initiating video call in the chat group`,
      });

      // User 2 accepts call
      const user2AudioVideoCallPage = await user2ChatPage.actions.acceptIncomingCallInGroupChat(groupName, 'video', {
        stepInfo: `User 2 accepting incoming video call`,
      });

      // Verify video streams
      await user2AudioVideoCallPage.verifyMyVideoStreamIsVisible({
        stepInfo: `Verifying my video stream is visible for user 2`,
      });

      await user2AudioVideoCallPage.verifyVideoStreamFromUserIsVisible(user1.fullName, true, {
        stepInfo: `Verifying video stream from user 1 is visible for user 2`,
      });

      // Verify user 1 can see user 2
      await user1AudioVideoCallPage.verifyMeetingParticipantNameInList(user2.fullName, {
        stepInfo: `Verifying user 1 can see user 2 has joined and can see his video stream`,
      });

      await user1AudioVideoCallPage.verifyVideoStreamFromUserIsVisible(user2.fullName, true, {
        stepInfo: `Verifying video stream from user 2 is visible for user 1`,
      });

      // Verify participant count
      await user1AudioVideoCallPage.verifyCountOfMeetingParticipants(2, {
        stepInfo: `Verifying count of meeting participants for user 1`,
      });

      await user2AudioVideoCallPage.verifyCountOfMeetingParticipants(2, {
        stepInfo: `Verifying count of meeting participants for user 2`,
      });
    }
  );
});
