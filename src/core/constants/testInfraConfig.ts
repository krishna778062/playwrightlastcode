/**
 * Configuration related to test infrastructure and integrations
 */
export const TEST_INFRA_CONFIG = {
  ZEPHYR: {
    BASE_URL: 'https://simpplr.atlassian.net/browse/',
  },
  STORY_BASE_URL: 'https://simpplr.atlassian.net/browse/',
} as const;

export type TestInfraConfig = typeof TEST_INFRA_CONFIG;

/**
 * Helper function to generate Zephyr test case URL
 * @param testId - The Zephyr test case ID
 * @returns Full URL to the test case
 */
export const getZephyrTestCaseUrl = (testId: string | string[]): string => {
  if (Array.isArray(testId)) {
    return testId.map(id => `${TEST_INFRA_CONFIG.ZEPHYR.BASE_URL}${id}`).join(', ');
  }
  return `${TEST_INFRA_CONFIG.ZEPHYR.BASE_URL}${testId}`;
};
export const getStoryUrl = (testId: string): string => {
  return `${TEST_INFRA_CONFIG.STORY_BASE_URL}${testId}`;
};
