// Utility functions for generating dynamic messages
const generateRandomNumber = (length: number = 6): string => {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
};

const generateRandomText = (): string => {
  const words = ['awesome', 'excellent', 'fantastic', 'amazing', 'wonderful', 'great', 'superb', 'brilliant'];
  return words[Math.floor(Math.random() * words.length)];
};

export interface FormattedMessageTestData {
  testName: string;
  message: string | (() => string);
  usesBold: boolean;
  usesItalic: boolean;
  usesUnderline: boolean;
  usesStrikethrough: boolean;
  testId?: string;
  storyId?: string;
  description: string;
  priority?: string;
  groupType?: string;
}

export const formattedMessageTestData: FormattedMessageTestData[] = [
  {
    testName: 'bold text message',
    message: () => `This is a bold message ${generateRandomNumber(6)} - ${generateRandomText()}`,
    usesBold: true,
    usesItalic: false,
    usesUnderline: false,
    usesStrikethrough: false,
    testId: 'CHAT-2240',
    storyId: 'CHAT-2240',
    description: 'To verify bold text message can be sent to user',
    priority: 'P2',
    groupType: 'SMOKE',
  },
  {
    testName: 'italic text message',
    message: () => `This is an italic message ${generateRandomNumber(6)} - ${generateRandomText()}`,
    usesBold: false,
    usesItalic: true,
    usesUnderline: false,
    usesStrikethrough: false,
    testId: 'CHAT-2241',
    storyId: 'CHAT-2241',
    description: 'To verify italic text message can be sent to user',
    priority: 'P2',
    groupType: 'SMOKE',
  },
  {
    testName: 'underline text message',
    message: () => `This is an underlined message ${generateRandomNumber(6)} - ${generateRandomText()}`,
    usesBold: false,
    usesItalic: false,
    usesUnderline: true,
    usesStrikethrough: false,
    testId: 'CHAT-2242',
    storyId: 'CHAT-2242',
    description: 'To verify underline text message can be sent to user',
    priority: 'P2',
    groupType: 'SMOKE',
  },
  {
    testName: 'strikethrough text message',
    message: () => `This is a strikethrough message ${generateRandomNumber(6)} - ${generateRandomText()}`,
    usesBold: false,
    usesItalic: false,
    usesUnderline: false,
    usesStrikethrough: true,
    testId: 'CHAT-2243',
    storyId: 'CHAT-2243',
    description: 'To verify strikethrough text message can be sent to user',
    priority: 'P2',
    groupType: 'SMOKE',
  },
  {
    testName: 'bold and italic text message',
    message: () => `This is both bold and italic message ${generateRandomNumber(6)} - ${generateRandomText()}`,
    usesBold: true,
    usesItalic: true,
    usesUnderline: false,
    usesStrikethrough: false,
    testId: 'CHAT-2244',
    storyId: 'CHAT-2244',
    description: 'To verify bold and italic text message can be sent to user',
    priority: 'P2',
    groupType: 'SMOKE',
  },
  {
    testName: 'all formatting applied text message',
    message: () => `This message has all formatting applied ${generateRandomNumber(6)} - ${generateRandomText()}`,
    usesBold: true,
    usesItalic: true,
    usesUnderline: true,
    usesStrikethrough: true,
    testId: 'CHAT-2219',
    storyId: 'CHAT-2219',
    description:
      'To verify text message with all formatting (bold, italic, underline, strikethrough) can be sent to user',
    priority: 'P2',
    groupType: 'SMOKE',
  },
];

export const selectThenFormatTestData: FormattedMessageTestData[] = [
  {
    testName: 'select text then apply bold formatting',
    message: () => `Select then bold text ${generateRandomNumber(6)} - ${generateRandomText()}`,
    usesBold: true,
    usesItalic: false,
    usesUnderline: false,
    usesStrikethrough: false,
    testId: 'CHAT-2220',
    storyId: 'CHAT-2220',
    description: 'To verify that text can be written first, then selected and bold formatting applied',
    priority: 'P2',
    groupType: 'SMOKE',
  },
];
