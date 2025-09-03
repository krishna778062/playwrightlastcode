export enum ContentSuiteTags {
  PAGE_CREATION = '@page-creation',
  ALBUM_CREATION = '@album-creation',
  SITE_CREATION = '@site-creation',
  SITE_CATEGORIES = '@site-categories',
  EVENT_CREATION = '@event-creation',
  SITE_CATEGORIES = '@site-categories',
}

export enum ContentFeatureTags {
  COVER_IMAGE = '@cover-image',
}

export const ContentTestTags = [...Object.values(ContentSuiteTags), ...Object.values(ContentFeatureTags)] as const;

export default ContentTestTags;
