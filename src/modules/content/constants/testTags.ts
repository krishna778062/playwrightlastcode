export enum ContentSuiteTags {
  PAGE_CREATION = '@page-creation',
  ALBUM_CREATION = '@album-creation',
  CREATE_SITE = '@site-creation',
  SITE_CATEGORIES = '@site-categories',
  EVENT_CREATION = '@event-creation',
  SITE_CREATION = '@site-creation',
}

export enum ContentFeatureTags {
  ADD_SITE = '@add-site',
  COVER_IMAGE = '@cover-image',
  ADD_TARGET_AUDIENCE = '@add-target-audience',
}

export const ContentTestTags = [...Object.values(ContentSuiteTags), ...Object.values(ContentFeatureTags)] as const;

export default ContentTestTags;
