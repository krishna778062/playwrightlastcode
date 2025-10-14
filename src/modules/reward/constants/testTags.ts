export enum REWARD_SUITE_TAGS {
  MANAGE_REWARD = '@manage-reward',
  REWARD_STORE = '@reward-store',
  RECOGNITION_HUB = '@recognition-hub',
  USER_PROFILE = '@user-profile',
}

export enum REWARD_FEATURE_TAGS {
  //Manage Rewards Related Tags
  REWARD_OVERVIEW = '@reward-overview',
  ENABLE_REWARD = '@enable-reward',
  DISABLE_REWARD = '@disable-reward',
  REWARDS_BUDGET_SUMMARY = '@budget-summary-tile',
  REWARDS_POINT_BALANCE_SUMMARY = '@point-balance-summary-tile',
  REWARDS_ACTIVITY_TABLE = '@rewards-activity-table',
  POINTS_GIVEN_ACTIVITY = '@points-given',
  POINTS_REDEEMED_ACTIVITY = '@points-redeemed',
  REWARDS_GIFTING_OPTIONS = '@rewards-gifting-options',
  REWARDS_PEER_GIFTING = '@rewards-peer-gifting',
  REWARDS_NOTIFICATIONS = '@rewards-notifications',

  // Recognition Hub Related Tags
  CREATE_RECOGNITION_WITH_POINTS = '@create-recognition-with-points',
  RECOGNITION_NOTIFICATION_CHECK = '@reward-point-notification-check',
  RECOGNITION_POINT_LABELING = '@reward-point-element-in-post',
  RECOGNITION_EDIT_POINTS = '@edit-points',

  // Reward Store Related Tags
  REWARD_OPTIONS = '@reward-options',
  REWARD_ORDER_HISTORY = '@reward-order-history',
  REWARD_OPTION = '@reward-option',
  CURRENCY_CONVERSION = '@currency-conversion',
  REWARD_STORE = '@reward-store',
  REWARD_ORDERS_HISTORY_PAGE = '@rewards-orders-history-page',
  REWARD_ORDERS_RESEND = '@rewards-orders-resend',

  // DB Related Test Case
  REWARDS_DB_CASES = '@rewards-db',

  //CSV Related Test case
  REWARDS_CSV_CASES = '@reward-csv',

  //Allowance refreshing cases
  REWARDS_ALLOWANCE_REFRESH = '@allowance-refreshing',
}

// Combined tags for the module
export const REWARD_TEST_TAGS = [...Object.values(REWARD_FEATURE_TAGS), ...Object.values(REWARD_SUITE_TAGS)] as const;

// Default export for easy importing
export default REWARD_TEST_TAGS;
