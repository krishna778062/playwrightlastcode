export interface AlbumCreationResponse {
  status: string;
  result: AlbumCreationResult;
}

export interface AlbumCreationResult {
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
  canMove: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canComment: boolean;
  canAddToAlbum: boolean;
  authoredBy: AuthorInfo;
  albumVideoUrl?: string;
  isOpenToSubmissions?: boolean;
  albumImages?: AlbumImage[];
  albumAttachments?: AlbumAttachment[];
}

export interface UsefulContent {
  id: string;
  title: string;
  summary: string;
  type: string;
}

export interface SiteInfo {
  siteId: string;
  siteName: string;
  siteUrl: string;
  siteType: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  color: string;
}

export interface AuthorInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

export interface AlbumImage {
  id: string;
  fileName: string;
  url: string;
  caption?: string;
  isCover: boolean;
  order: number;
}

export interface AlbumAttachment {
  id: string;
  fileName: string;
  url: string;
  fileSize: number;
  mimeType: string;
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
