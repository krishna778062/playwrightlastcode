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
  CUSTOM_RECURRING_AWARD = '@custom-recurring-award',
  CUSTOM_NOMINATION = '@rc-custom-nomination',
}

export const RecognitionTestTags = [
  ...Object.values(RecognitionSuitTags),
  ...Object.values(RecognitionFeatureTags),
] as const;

export default RecognitionTestTags;
