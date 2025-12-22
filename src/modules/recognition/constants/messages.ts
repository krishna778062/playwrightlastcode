export const MESSAGES = {
  FEATURE_NOT_AVAILABLE: 'This feature is not currently enabled. Please contact your account manager to learn more.',
  NEW_AWARD_CREATED: 'New award created',
  AWARD_DELETED: 'Award deleted',
} as const;

export const AWARD_CREATION_MESSAGES = {
  DELEGATE_SELECTION_BY: 'Select when the award delegate needs to select the winner(s) by.',
  AWARD_ISSUED_ON_FIRST_DAY: 'Awards will be issued on the first day of the following month.',
} as const;

export default MESSAGES;
