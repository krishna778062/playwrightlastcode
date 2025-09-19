export interface BaseContentPayload {
  listOfFiles: any[];
  publishAt: string;
  body: string;
  imgCaption: string;
  publishingStatus: string;
  bodyHtml: string;
  imgLayout: string;
  title: string;
  language: string;
  isFeedEnabled: boolean;
  listOfTopics: any[];
  contentType: string;
  isNewTiptap: boolean;
}

export interface PageCreationPayload extends BaseContentPayload {
  contentSubType: string;
  category: {
    id: string;
    name: string;
  };
}

export interface EventCreationPayload extends BaseContentPayload {
  startsAt: string;
  endsAt: string;
  isAllDay: boolean;
  timezoneIso: string;
  location: string;
  directions: any[];
}

export interface AlbumCreationPayload extends BaseContentPayload {
  coverImageMediaId: string;
  listOfAlbumMedia: { id: string; description: string }[];
}

export interface TopicAuthor {
  name: string;
  peopleId: string;
  id: string;
}

export interface Topic {
  name: string;
  topic_id: string;
  created_by: string;
  canEdit: boolean;
  canDelete: boolean;
  isFollowing: boolean;
  authoredBy: TopicAuthor;
}

export interface TopicListResponse {
  status: string;
  result: {
    listOfItems: Topic[];
    nextPageToken: number;
  };
  message: string;
}

// Content List Response Types
export interface ContentSite {
  id: string;
  siteId: string;
  name: string;
  isContentManager: boolean;
  isPublic: boolean;
  isPrivate: boolean;
  isMember: boolean;
  isManager: boolean;
  isListed: boolean;
  isActive: boolean;
  access: string;
  isFeatured: boolean;
  canEdit: boolean;
  canManage: boolean;
}

export interface ContentCategory {
  name: string;
  id: string;
  categoryId: string;
  pageCount: number;
}

export interface ContentAuthor {
  name: string;
  id: string;
  isProtectedAuthor: boolean;
}

export interface TimezoneDetails {
  id: number;
  name: string;
  iso: string;
  offset: string;
}

export interface ContentItem {
  type: string;
  title: string;
  excerpt: string;
  summary: string | null;
  status: string;
  position: number;
  onboardingStatus: string | null;
  onboardingAddedOn: string | null;
  isFroala: boolean;
  site: ContentSite;
  publishAt: string;
  modifiedAt: string;
  isScheduled: boolean;
  isPublished: boolean;
  isMustRead: boolean;
  hasRead: boolean;
  isFavorited: boolean;
  isDeleted: boolean;
  isFeatured: boolean;
  imgLandscape: string | null;
  signedImgLandscape: string | null;
  imgSquare: string | null;
  signedImgSquare: string | null;
  id: string;
  createdAt: string;
  expiresAt: string | null;
  contentSubType: string | null;
  contentId: string;
  category: ContentCategory;
  listOfTopics: any[];
  authoredBy: ContentAuthor;
  canPublishUnpublish: boolean;
  canModerate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  listOfTopAlbumImages: any[] | null;
  img: string | null;
  signedImg: string | null;
  videoCount: number | null;
  imageCount: number | null;
  validationRequired: boolean;
  validationExpired: boolean;
  hasSeen: boolean;
  language: string;
  manualTransEnabled: boolean | null;
  first_published_on: string;
  firstPublishedAt: string;
  lastDismissedAt: string | null;
  isRestricted: boolean;
  targetAudience: any[];
  // Event-specific fields
  timezoneName?: string;
  timezoneIso?: string;
  timezoneOffset?: number;
  timezoneDetails?: TimezoneDetails;
  startsAt?: string;
  endsAt?: string;
  isAllDay?: boolean;
  isMultiDay?: boolean;
}

export interface ContentListResponse {
  status: string;
  result: {
    nextPageToken: number;
    listOfItems: ContentItem[];
  };
  message: string;
}
