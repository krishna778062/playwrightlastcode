// Utility functions for generating dynamic messages
const generateRandomNumber = (length: number = 6): string => {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
};

export interface MessageTestData {
  testName: string;
  message: string | (() => string);
  testId?: string;
  storyId?: string;
  description: string;
  priority?: string;
  groupType?: string;
}

export const messageTestData: MessageTestData[] = [
  {
    testName: 'normal message',
    message: () => `Hello ${generateRandomNumber(6)} test message`,
    testId: 'CHAT-2179',
    storyId: 'CHAT-2179',
    description: 'To verify normal message can be sent to user',
    priority: 'P2',
    groupType: 'SMOKE',
  },

  {
    testName: 'long message (25+ characters)',
    message: () =>
      `This is a very long message that contains exactly ${generateRandomNumber(6)} characters for testing purposes 123456`,
    testId: 'CHAT-2208',
    storyId: 'CHAT-2208',
    description: 'To verify long message can be sent to user',
    priority: 'P2',
    groupType: 'SMOKE',
  },

  {
    testName: 'special characters message',
    message: () => '!@#$%^&*()_+-=[]{}|;:,.<>? ' + generateRandomNumber(6) + ' ',
    testId: 'CHAT-2211',
    storyId: 'CHAT-2211',
    description: 'To verify special characters message can be sent to user',
    priority: 'P3',
    groupType: 'REGRESSION',
  },
];
