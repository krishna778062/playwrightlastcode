export enum ContentSuiteTags {
  CONTENT_MANAGEMENT = '@content-management',
  PAGE_CREATION = '@page-creation',
  CONTENT_UPLOAD = '@content-upload',
  SITE_DASHBOARD = '@site-dashboard',
  SITE_CREATION = '@site-creation',
  SITE_CATEGORIES = '@site-categories',
}

export enum ContentFeatureTags {
  COVER_IMAGE = '@cover-image',
}

export const ContentTestTags = [...Object.values(ContentSuiteTags), ...Object.values(ContentFeatureTags)] as const;

export default ContentTestTags;
