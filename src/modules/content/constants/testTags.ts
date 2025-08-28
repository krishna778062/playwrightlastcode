export enum ContentSuiteTags {
  PAGE_CREATION = '@page-creation',
  ALBUM_CREATION = '@album-creation',
  EVENT_CREATION = '@event-creation',
  SITE_CREATION = '@site-creation',
}

export enum ContentFeatureTags {
  COVER_IMAGE = '@cover-image',
  ALBUM_CREATION = '@album-creation',
}

export const ContentTestTags = [...Object.values(ContentSuiteTags), ...Object.values(ContentFeatureTags)] as const;

export default ContentTestTags;
