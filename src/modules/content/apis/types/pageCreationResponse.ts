export interface PageCreationResponse {
  status: string;
  result: PageCreationResult;
}

export interface PageCreationResult {
  versionId: number;
  usefulContent: UsefulContent;
  type: string;
  title: string;
  summary: string;
  status: string;
  site: SiteInfo;
  recentViewCount: number;
  publishAt: string;
  postCount: number;
  listOfTopics: any[];
  listOfContentTopics: any[];
  listOfTopAlbumImages: any[];
  listOfInlineImages: any[];
  listOfFiles: any[];
  listOfRemovedFiles: any;
  likeCount: number;
  lastModifiedDateTimeStamp: number;
  isScheduled: boolean;
  isPublished: boolean;
  isOpenToNotification: boolean;
  isMustRead: boolean;
  isMaximumWidth: boolean;
  isLiked: boolean;
  isLatest: boolean;
  isInSiteCarousel: boolean;
  isInHomeCarousel: boolean;
  homeCarouselItemId: string | null;
  siteCarouselItemId: string | null;
  isFeedEnabled: boolean;
  isFavorited: boolean;
  imgLayout: string;
  id: string;
  hasRead: boolean;
  favoriteContext: string;
  excerpt: string;
  editedBy: Record<string, any>;
  createdAt: string;
  modifiedAt: string;
  contentSubType: string;
  contentId: string;
  category: CategoryInfo;
  canSendUpdateNotification: boolean;
  canPublishUnpublish: boolean;
  canModerate: boolean;
  canMakeMustRead: boolean;
  canEdit: boolean;
  canDelete: boolean;
  body: string;
  isFroalaContent: boolean;
  authoredBy: AuthorInfo;
  imgLandscapeFile: ImageFile;
  imgLandscape: string;
  imgSquareFile: ImageFile;
  imgSquare: string;
  imgOriginalFile: ImageFile;
  imgOriginal: string;
  imgCaption: string;
  firstPublishedAt: string;
  listOfMentions: any[];
  language: string;
  is_new_tiptap: boolean;
  isNewTiptap: boolean;
  listOfInlineVideos: any[];
  expiresAt: string;
  manualTransEnabled: boolean;
  templateId: string;
  isQuestionAnswerEnabled: boolean;
}

export interface UsefulContent {
  hasUserRated: boolean;
  canViewHistory: boolean;
}

export interface SiteInfo {
  siteId: string;
  name: string;
  isPublic: boolean;
  isPrivate: boolean;
  isMember: boolean;
  isManager: boolean;
  isListed: boolean;
  isContentManager: boolean;
  isActive: boolean;
  img: string;
  access: string;
  isFeatured: boolean;
  isQuestionAnswerEnabled: boolean;
}

export interface CategoryInfo {
  site: Record<string, any>;
  name: string;
  id: string;
  categoryId: string;
  authoredBy: Record<string, any>;
}

export interface AuthorInfo {
  peopleId: string;
  name: string;
  mediumPhotoUrl: string | null;
  location: string | null;
  lastName: string;
  isProtectedAuthor: boolean;
  isFollowing: boolean;
  isActive: boolean;
  img: string | null;
  id: string;
  firstName: string;
  email: string;
  country: string | null;
  canFollow: boolean;
}

export interface ImageFile {
  type: string;
  title: string;
  thumbnailImg: string;
  thumbnail: string;
  size: string;
  provider: string;
  imgTHUMB720BY480URL: string;
  imgTHUMB240BY180URL: string;
  imgFullURL: string;
  id: string;
  fileUrl: string;
  fileId: string;
  downloadUrl: string;
  link: string | null;
  context: string;
  isImage: boolean;
  isVideo: boolean;
  altText: string | null;
  attribution: string | null;
}
