import type { ExternalLink } from '@/src/core/types/app.type';
import { T } from '@faker-js/faker/dist/airline-BUL6NtOJ';

/**
 * Generates unique test data for parallel test execution
 * @returns Unique test data to avoid state corruption
 */
export function generateUniqueLinkTestData() {
  // Create a very short unique suffix using timestamp and random string
  const randomStr = Math.random().toString(36).substring(2, 6); // 2 random alphanumeric chars
  const uniqueSuffix = `Link${randomStr}`;

  const testLink: ExternalLink = {
    url: `https://chatgpt.com/`,
    name: `${uniqueSuffix}`,
    onOff: true,
    itemOrder: 3,
  };

  return { testLink };
}
