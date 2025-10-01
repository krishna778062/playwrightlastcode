export enum ContentSuiteTags {
  PAGE_CREATION = '@page-creation',
  CONTENT_UPLOAD = '@content-upload',
  MANAGE_CONTENT = '@manage-content',
  SITE_DASHBOARD = '@site-dashboard',
  ALBUM_CREATION = '@album-creation',
  SITE_CREATION = '@site-creation',
  SITE_CATEGORIES = '@site-categories',
  EVENT_CREATION = '@event-creation',
  FEED_SETTINGS = '@feed-settings',
  QUESTION_SETTINGS = '@question-settings',
  SOCIAL_CAMPAIGN = '@social-campaign',
}

export enum ContentFeatureTags {
  COVER_IMAGE = '@cover-image',
  NOTHING_TO_SHOW_HERE = '@nothing-to-show-here',
  MANAGE_CONTENT = '@manage-content',
  VERIFY_COMMENTS_AND_FEEDS = '@verify-comments-and-feeds',
  VALIDATION_REQUIRED_BAR_STATE = '@validation-required-bar-state',
  ADD_USERS_TO_AUTHOR = '@add-users-to-author',
  ADD_TARGET_AUDIENCE = '@add-target-audience',
  ADD_USERS_TO_ALLOWLIST = '@add-users-to-allowlist',
  HOME_FEED = '@home-feed',
  MANAGE_TOPICS = '@manage-topics',
  EDIT_TOPICS = '@edit-topics',
}

export const ContentTestTags = [...Object.values(ContentSuiteTags), ...Object.values(ContentFeatureTags)] as const;

export default ContentTestTags;
