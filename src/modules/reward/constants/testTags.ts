export enum REWARD_FEATURE_TAGS {
  DISABLE_REWARD = '@disable-reward',
  ENABLE_REWARD = '@enable-reward',
  REWARD_OPTION = '@reward-option',
  CURRENCY_CONVERSION = '@currency-conversion',
}

export enum REWARD_SUITE_TAGS {
  REGRESSION_TEST = '@regression-test',
  MANAGE_REWARD = '@manage-reward',
  REWARD_OPTIONS = '@reward-options',
  REWARD_STORE = '@reward-store',
  RECOGNITION_HUB = '@recognition-hub',
}

// Combined tags for the module
export const REWARD_TEST_TAGS = [...Object.values(REWARD_FEATURE_TAGS), ...Object.values(REWARD_SUITE_TAGS)] as const;

// Default export for easy importing
export default REWARD_TEST_TAGS;
