export enum NEWSLETTER_FEATURE_TAGS {
  // Add your feature-specific tags here
  // Example: FEATURE_A = '@feature-a',
}

export enum NEWSLETTER_SUITE_TAGS {
  // Add your test suite tags here
  // Example: SMOKE = '@smoke',
}

export const NEWSLETTER_TEST_TAGS = [
  ...Object.values(NEWSLETTER_FEATURE_TAGS),
  ...Object.values(NEWSLETTER_SUITE_TAGS),
] as const;

export default NEWSLETTER_TEST_TAGS;
