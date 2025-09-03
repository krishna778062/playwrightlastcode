export enum CHAT_FEATURE_TAGS {
  CHAT_ATTACHMENT = '@chat-attachment',
  GROUP_CHAT = '@group-chat',
  MESSAGE_THREAD = '@message-thread',
  REACT_ON_MESSAGE = '@react-on-message',
  VIDEO_CALL = '@video-call',
  AUDIO_CALL = '@audio-call',
  VIDEO_ATTACHMENT = '@video-attachement',
  AUDIO_ATTACHMENT = '@audio-attachement',
}

export enum CHAT_SUITE_TAGS {
  CHAT_ATTACHMENT = '@chat-attachment',
  DIRECT_MESSAGE = '@direct-message',
  GROUP_CHAT = '@group-chat',
  UNFURL_LINK = '@unfurl-link',
}

// Combined tags for the module
export const CHAT_TEST_TAGS = [...Object.values(CHAT_FEATURE_TAGS), ...Object.values(CHAT_SUITE_TAGS)] as const;

// Default export for easy importing
export default CHAT_TEST_TAGS;
