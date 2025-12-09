export const CHAT_TEST_DATA = {
  CREDENTIALS: {
    DEFAULT_PASSWORD: 'Pp@123456',
    DEFAULT_USERNAME: 'prateek.parashar@simpplr.com',
  },
  CONFIG: {
    DEFAULT_TIMEOUT: 180_000,
    RECORDING: {
      VIDEO: {
        DEFAULT_DURATION: 2_000,
      },
      AUDIO: {
        DEFAULT_DURATION: 2_000,
      },
    },
  },
  MESSAGES: {
    USER1: {
      INITIAL: 'Hello, how are you?',
      REPLY: 'Hello, This is reply message from user 1',
    },
    USER2: {
      INITIAL: 'Hello, This is message from user 2',
      REPLY: 'Hello, This is reply message from user 2',
    },
  },
} as const;

export type ChatTestData = typeof CHAT_TEST_DATA;
