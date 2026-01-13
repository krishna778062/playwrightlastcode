export const MESSAGES = {
  FEATURE_NOT_AVAILABLE: 'This feature is not currently enabled. Please contact your account manager to learn more.',
  NEW_AWARD_CREATED: 'New award created',
  AWARD_DELETED: 'Award deleted',
  LINK_COPIED_TO_CLIPBOARD: 'Link copied to clipboard',
} as const;

export const AWARD_CREATION_MESSAGES = {
  DELEGATE_SELECTION_BY: 'Select when the award delegate needs to select the winner(s) by.',
  AWARD_ISSUED_ON_FIRST_DAY: 'Awards will be issued on the first day of the following month.',
} as const;

export const MANAGE_APP_SETTING_MESSAGES = {
  COMMENTS_HELPER_MESSAGE:
    'Choose whether people can comment when giving recognition. Turning this off will remove commenting from all recognition and award posts.',
  COMMENTS_ENABLED_MESSAGE: 'People can leave comments on recognition and award posts.',
  COMMENTS_DISABLED_MESSAGE: 'Comments are turned off for all recognition and award posts.',
  DISABLE_COMMENTS_CONFIRMATION: 'Are you sure you want to disable comments?',
  DISABLE_COMMENTS_WARNING:
    'Turning comments off will remove commenting from all recognition and award posts. It is not recommended, and can be detrimental to engagement.',
} as const;

export default MESSAGES;
