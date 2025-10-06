export enum REWARD_FEATURE_TAGS {
  DISABLE_REWARD = '@disable-reward',
  ENABLE_REWARD = '@enable-reward',
  REWARD_OPTION = '@reward-option',
  REWARD_STORE = '@reward-store',
  REWARD_ORDERS_HISTORY_PAGE = '@rewards-orders-history-page',
  REWARD_ORDERS_RESEND = '@rewards-orders-resend',
  CURRENCY_CONVERSION = '@currency-conversion',
}

export enum REWARD_SUITE_TAGS {
  REGRESSION_TEST = '@regression-test',
  MANAGE_REWARD = '@manage-reward',
  REWARD_OPTIONS = '@reward-options',
  REWARD_STORE = '@reward-store',
  REWARD_ORDER_HISTORY = '@reward-order-history',
  RECOGNITION_HUB = '@recognition-hub',
}

// Combined tags for the module
export const REWARD_TEST_TAGS = [...Object.values(REWARD_FEATURE_TAGS), ...Object.values(REWARD_SUITE_TAGS)] as const;

// Default export for easy importing
export default REWARD_TEST_TAGS;
