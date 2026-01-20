export enum NEWSLETTER_FEATURE_TAGS {
  NEWSLETTER_HOME_PAGE = '@newsletter-home-page',
}

export enum NEWSLETTER_SUITE_TAGS {
  NEWSLETTER = '@newsletter',
}

export const NEWSLETTER_TEST_TAGS = [
  ...Object.values(NEWSLETTER_FEATURE_TAGS),
  ...Object.values(NEWSLETTER_SUITE_TAGS),
] as const;

export default NEWSLETTER_TEST_TAGS;
