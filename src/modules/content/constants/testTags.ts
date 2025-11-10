export enum ContentSuiteTags {
  PAGE_CREATION = '@page-creation',
  ALBUM_CREATION = '@album-creation',
  CREATE_SITE = '@site-creation',
  EVENT_CREATION = '@event-creation',
  SITE_CREATION = '@site-creation',
  MANAGE_SITE = '@manage-site',
  MANAGE_CONTENT = '@manage-content',
  MY_CONTENT_FILTER = '@my-content-filter',
  LANGUAGE_IN_CONTENT = '@language-in-content',
  ENABLE_DISABLE_CONTENT_SUBMISSIONS = '@enable-disable-content-submissions',
  FEED_SETTINGS = '@feed-settings',
  QUESTION_SETTINGS = '@question-settings',
  SITE_DEACTIVATION = '@site-deactivation',
}

export enum ContentFeatureTags {
  ADD_SITE = '@add-site',
  COVER_IMAGE = '@cover-image',
  ADD_TARGET_AUDIENCE = '@add-target-audience',
  ADD_USERS_TO_AUTHOR = '@add-users-to-author',
  ADD_USERS_TO_ALLOWLIST = '@add-users-to-allowlist',
  CONTENT_HOME_DASHBOARD_TILES = '@content-home-dashboard-tiles',
  UPDATE_CATEGORY = '@update-category',
  HOME_FEED = '@home-feed',
  CONTENT_VALIDATE_OPTION = '@content-validate-option',
  VALIDATION_REQUIRED_BAR_STATE = '@validation-required-bar-state',
  EDIT_TOPICS = '@edit-topics',
  SEARCH_TOPICS = '@search-topics',
  TOPIC_DETAILS_CONTENT = '@topic-details-content',
  TOPIC_DETAILS_FEED = '@topic-details-feed',
  MANAGE_TOPICS = '@manage-topics',
  VERIFY_COMMENTS_AND_FEEDS = '@verify-comments-and-feeds',
}

export const ContentTestTags = [...Object.values(ContentSuiteTags), ...Object.values(ContentFeatureTags)] as const;

export default ContentTestTags;
