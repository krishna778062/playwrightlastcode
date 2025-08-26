export enum ContentSuiteTags {
  CONTENT_MANAGEMENT = '@content-management',
  PAGE_CREATION = '@page-creation',
  CONTENT_UPLOAD = '@content-upload',
  PAGE_CREATION_ON_SITE = '@page-creation-on-site',
  SITE_CREATION = '@site-creation',
}

export enum ContentFeatureTags {
  COVER_IMAGE = '@cover-image',
}

export const ContentTestTags = [...Object.values(ContentSuiteTags), ...Object.values(ContentFeatureTags)] as const;

export default ContentTestTags;
