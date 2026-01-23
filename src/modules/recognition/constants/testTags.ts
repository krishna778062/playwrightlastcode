export enum RecognitionSuitTags {
  REGRESSION_TEST = '@regression-test',
  SANITY_TEST = '@sanity-test',
  SMOKE_TEST = '@smoke-test',
}

export enum RecognitionFeatureTags {
  NAVIGATION_VIA_SIDE_NAV = '@navigation-via-side-nav',
  MANAGE_RECOGNITION = '@manage-recognition',
  RECOGNITION_HUB = '@recognition-hub',
  ONLY_P2P_RECOGNITION = '@only-p2p-recognition',
  COMMENT_ENABLE_DISABLE = '@comment-enable-disable',
  CUSTOM_RECURRING_AWARD = '@custom-recurring-award',
  CUSTOM_RECURRING_AWARD_STATUS_DB = '@custom-recurring-award-status-db',
  CUSTOM_NOMINATION = '@rc-custom-nomination',
  EDIT_CUSTOM_RECURRING_AWARD = '@edit-custom-recurring-award',
  SPOT_AWARDS = '@spot-awards',
  ABAC_RECOGNITION_SHARE = '@abac-recognition-share',
}

export enum spotAwardsFeatureTags {
  SPOT_AWARDS_AUDIENCE = '@spot-awards-audience',
}

export enum RecurringAwardsFeatureTags {
  RECURRING_AWARD = '@recurring-award',
  NOMINATION_RECURRING_AWARD = '@nomination-recurring-award',
  DELEGATE_RECURRING_AWARD = '@delegate-recurring-award',
  RECURRING_AWARD_CREATION = '@recurring-award-creation',
  RECURRING_AWARD_STATUS_DB = '@RECURRING_AWARD_STATUS_DB',
  EDIT_CUSTOM_RECURRING_AWARD = '@EDIT_CUSTOM_RECURRING_AWARD',
}

export enum WorkAnniversaryFeatureTags {
  WORK_ANNIVERSARY = '@work-anniversary',
  MANAGE_WORK_ANNIVERSARY = '@manage-work-anniversary',
}

export const RecognitionTestTags = [
  ...Object.values(RecognitionSuitTags),
  ...Object.values(RecognitionFeatureTags),
  ...Object.values(RecurringAwardsFeatureTags),
  ...Object.values(WorkAnniversaryFeatureTags),
] as const;

export default RecognitionTestTags;
