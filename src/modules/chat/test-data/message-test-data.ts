export interface MessageTestData {
  testName: string;
  message: string;
  expectedResult: string;
  testId?: string;
  storyId?: string;
  description: string;
  priority?: string;
  groupType?: string;
}

export const messageTestData: MessageTestData[] = [
  {
    testName: 'normal message',
    message: 'Hello 247776 sixth try',
    expectedResult: 'Hello 247776 sixth try',
    testId: 'CHAT-2179',
    storyId: 'CHAT-2179',
    description: 'To verify normal message can be sent to user',
    priority: 'P2',
    groupType: 'SMOKE',
  },
  {
    testName: 'long message (25+ characters)',
    message: 'This is a very long message that contains exactly twenty-five characters for testing purposes 123456',
    expectedResult:
      'This is a very long message that contains exactly twenty-five characters for testing purposes 123456',
    testId: 'CHAT-2208',
    storyId: 'CHAT-2208',
    description: 'To verify long message can be sent to user',
    priority: 'P2',
    groupType: 'SMOKE',
  },
  {
    testName: 'mixed message',
    message: 'Hello123! Test message with emojis and numbers 4567 ',
    expectedResult: 'Hello123! Test message with emojis and numbers 4567 ',
    testId: 'CHAT-2209',
    storyId: 'CHAT-2209',
    description: 'To verify mixed message can be sent to user',
    priority: 'P2',
    groupType: 'SMOKE',
  },
  // {
  //   testName: 'emoji message',
  //   message: '😀🎉🚀💻🔥',
  //   expectedResult: '😀🎉🚀💻🔥',
  //   testId: 'CHAT-2210',
  //   storyId: 'CHAT-2210',
  //   description: 'To verify emoji message can be sent to user',
  //   priority: 'P3',
  //   groupType: 'REGRESSION',
  // },
  {
    testName: 'special characters message',
    message: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    expectedResult: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    testId: 'CHAT-2211',
    storyId: 'CHAT-2211',
    description: 'To verify special characters message can be sent to user',
    priority: 'P3',
    groupType: 'REGRESSION',
  },
];
