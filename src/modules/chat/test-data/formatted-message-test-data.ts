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
  usesBulletList: boolean;
  usesOrderList: boolean;
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
    usesBulletList: false,
    usesOrderList: false,
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
    usesBulletList: false,
    usesOrderList: false,
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
    usesBulletList: false,
    usesOrderList: false,
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
    usesBulletList: false,
    usesOrderList: false,
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
    usesBulletList: false,
    usesOrderList: false,
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
    usesBulletList: false,
    usesOrderList: false,
    testId: 'CHAT-2219',
    storyId: 'CHAT-2219',
    description:
      'To verify text message with all formatting (bold, italic, underline, strikethrough) can be sent to user',
    priority: 'P2',
    groupType: 'SMOKE',
  },

  {
    testName: 'applying bullet points to text message',
    message: () =>
      `This message is for testing the bullet points  ${generateRandomNumber(6)} - ${generateRandomText()}`,
    usesBold: false,
    usesItalic: false,
    usesUnderline: false,
    usesStrikethrough: false,
    usesBulletList: true,
    usesOrderList: false,
    testId: 'CHAT-2248',
    storyId: 'CHAT-2248',
    description: 'To verify text message with bullet points can be sent to user',
    priority: 'P2',
    groupType: 'SMOKE',
  },

  {
    testName: 'applying ordered list to text message',
    message: () => `This message is for testing the ordered list  ${generateRandomNumber(6)} - ${generateRandomText()}`,
    usesBold: false,
    usesItalic: false,
    usesUnderline: false,
    usesStrikethrough: false,
    usesBulletList: false,
    usesOrderList: true,
    testId: 'CHAT-2249',
    storyId: 'CHAT-2249',
    description: 'To verify text message with ordered list can be sent to user',
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
    usesBulletList: false,
    usesOrderList: false,
    testId: 'CHAT-2220',
    storyId: 'CHAT-2220',
    description: 'To verify that text can be written first, then selected and bold formatting applied',
    priority: 'P2',
    groupType: 'SMOKE',
  },

  {
    testName: 'select text then apply italic formatting',
    message: () => `Select then italic text ${generateRandomNumber(6)} - ${generateRandomText()}`,
    usesBold: false,
    usesItalic: true,
    usesUnderline: false,
    usesStrikethrough: false,
    usesBulletList: false,
    usesOrderList: false,
    testId: 'CHAT-2250',
    storyId: 'CHAT-2250',
    description: 'To verify that text can be written first, then selected and italic formatting applied',
    priority: 'P2',
    groupType: 'SMOKE',
  },

  {
    testName: 'select text then apply underline formatting',
    message: () => `Select then underline text ${generateRandomNumber(6)} - ${generateRandomText()}`,
    usesBold: false,
    usesItalic: false,
    usesUnderline: true,
    usesStrikethrough: false,
    usesBulletList: false,
    usesOrderList: false,
    testId: 'CHAT-2251',
    storyId: 'CHAT-2251',
    description: 'To verify that text can be written first, then selected and underline formatting applied',
    priority: 'P2',
    groupType: 'SMOKE',
  },

  {
    testName: 'select text then apply strike through formatting',
    message: () => `Select then strike through text ${generateRandomNumber(6)} - ${generateRandomText()}`,
    usesBold: false,
    usesItalic: false,
    usesUnderline: false,
    usesStrikethrough: true,
    usesBulletList: false,
    usesOrderList: false,
    testId: 'CHAT-2252',
    storyId: 'CHAT-2252',
    description: 'To verify that text can be written first, then selected and strike through formatting applied',
    priority: 'P2',
    groupType: 'SMOKE',
  },
];
