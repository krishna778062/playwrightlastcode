export enum ContentSuiteTags {
  PAGE_CREATION = '@page-creation',
  ALBUM_CREATION = '@album-creation',
  SITE_CREATION = '@site-creation',
  EVENT_CREATION = '@event-creation',
}

export enum ContentFeatureTags {
  COVER_IMAGE = '@cover-image',
}

export const ContentTestTags = [...Object.values(ContentSuiteTags), ...Object.values(ContentFeatureTags)] as const;

export default ContentTestTags;
