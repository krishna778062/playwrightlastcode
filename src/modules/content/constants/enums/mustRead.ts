/**
 * Audience types for must read content
 * Used when making content must read via API
 */
export enum MustReadAudienceType {
  SITE_MEMBERS_AND_FOLLOWERS = 'site_members_and_followers',
  ALL_EMPLOYEES = 'all_employees',
}

/**
 * Duration options for must read content
 * Used when making content must read via API
 */
export enum MustReadDuration {
  THIRTY_DAYS = 'thirty_days',
  SIXTY_DAYS = 'sixty_days',
  NINETY_DAYS = 'ninety_days',
}
