export interface B2BContentListRequest {
  contentIds: string[];
  content_type: string;
  requestedLanguages: string[];
  size: number;
}

export interface B2BAlbumImage {
  id: string;
  albumMediaId: string;
  isCover: boolean;
  description: string;
  img: string;
  isVideo: boolean;
}

export interface B2BContentAuthor {
  name: string;
  id: string;
}

export interface B2BContentSite {
  id: string;
  siteId: string;
  name: string;
  img: string;
  isContentManager: boolean;
  isPublic: boolean;
  isPrivate: boolean;
  isMember: boolean;
  isManager: boolean;
  isListed: boolean;
  isActive: boolean;
  access: string;
  allowContentUnfurling: boolean;
}

export interface B2BContentCategory {
  name: string | null;
  id: string | null;
  categoryId: string | null;
}

export interface B2BManualTranslationFields {
  [language: string]: {
    title: string;
    summary: string | null;
    imgCaption: string | null;
    language: string;
  };
}

export interface B2BContentItem {
  listOfTopics: Array<{ id: string; name: string }>;
  type: string;
  title: string;
  excerpt: string;
  summary: string | null;
  status: string;
  position: number;
  imgLandscape: string;
  coverImgPublicUrl: string | null;
  language: string;
  manualTransEnabled: boolean | null;
  authoredBy: B2BContentAuthor;
  site: B2BContentSite;
  publishAt: string;
  modifiedAt: string;
  isScheduled: boolean;
  isPublished: boolean;
  isMustRead: boolean;
  hasRead: boolean;
  isFavorited: boolean;
  isDeleted: boolean;
  id: string;
  createdAt: string;
  expiresAt: string | null;
  contentSubType: string | null;
  contentId: string;
  category: B2BContentCategory;
  canPublishUnpublish: boolean;
  canModerate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  validationRequired: boolean;
  validationExpired: boolean;
  hasSeen: boolean;
  first_published_on: string;
  lastDismissedAt: string | null;
  listOfTopAlbumImages?: B2BAlbumImage[];
  manualTranslationsFields?: B2BManualTranslationFields;
}

export interface B2BContentListResult {
  listOfItems: B2BContentItem[];
  bucket: string;
}

export interface B2BContentListResponse {
  status: string;
  result: B2BContentListResult;
  message: string;
}
