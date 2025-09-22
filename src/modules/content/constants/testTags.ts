export enum ContentSuiteTags {
  PAGE_CREATION = '@page-creation',
  ALBUM_CREATION = '@album-creation',
  SITE_CREATION = '@site-creation',
  SITE_CATEGORIES = '@site-categories',
  EVENT_CREATION = '@event-creation',
}

export enum ContentFeatureTags {
  COVER_IMAGE = '@cover-image',
  VERIFY_COMMENTS_AND_FEEDS = '@verify-comments-and-feeds',
  VALIDATION_REQUIRED_BAR_STATE = '@validation-required-bar-state',
  ADD_USERS_TO_AUTHOR = '@add-users-to-author',
}

export const ContentTestTags = [...Object.values(ContentSuiteTags), ...Object.values(ContentFeatureTags)] as const;

export default ContentTestTags;
