export enum ContentSuiteTags {
  CONTENT_MANAGEMENT = '@content-management',
  PAGE_CREATION = '@page-creation',
  CONTENT_UPLOAD = '@content-upload',
  MANAGE_CONTENT = '@manage-content',
}

export enum ContentFeatureTags {
  COVER_IMAGE = '@cover-image',
  NOTHING_TO_SHOW_HERE = '@nothing-to-show-here',
  MANAGE_CONTENT = '@manage-content',
}

export const ContentTestTags = [...Object.values(ContentSuiteTags), ...Object.values(ContentFeatureTags)] as const;

export default ContentTestTags;
