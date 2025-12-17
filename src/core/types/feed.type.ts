export interface IFeedManagementOperations {
  createPost(text: string, overrides?: any): Promise<any>;
  updatePost(feedId: string, updates: any): Promise<any>;
  deletePost(feedId: string): Promise<any>;
  createFeed?(overrides?: any): Promise<any>;
  createPostWithAttachments?(text: string, attachments: any[], overrides?: any): Promise<any>;
  getFeeds?(options?: any): Promise<any>;
}

/**
 * Attached file structure for feed creation request
 */
export interface AttachedFile {
  fileId: string;
  provider: string;
  size: number;
  name: string;
  type: string;
  thumbnail?: string;
}

/**
 * Request payload for creating a feed post
 */
export interface CreateFeedPostPayload {
  textJson: string;
  textHtml: string;
  scope: string;
  siteId: string | null;
  contentId?: string | null;
  listOfAttachedFiles: AttachedFile[];
  ignoreToxic: boolean;
  type: string;
  variant: string;
  listOfTopics?: { id: string; name: string }[];
}

/**
 * Feed author information
 */
export interface FeedAuthor {
  userId: string;
  name: string;
  img: string;
  department: string;
  title: string;
  signedImg: string;
}

/**
 * Topic information in feed response
 */
export interface FeedTopic {
  topicId: string;
  name: string;
  link: string;
  canEdit: boolean;
  canDelete: boolean;
  canFollow: boolean;
}

/**
 * Mention information in feed response
 */
export interface FeedMention {
  id: string;
  name: string;
  type: 'site' | 'people' | 'user';
}

/**
 * File information in feed response
 */
export interface FeedFile {
  fileId: string;
  provider: string;
  size: number;
  name: string;
  type: string;
  thumbnail: string;
  providerFileId: string | null;
  version: number;
  publicURL: string | null;
  previewURL: string | null;
  previewStoragePath: string | null;
  additionalAttr: any | null;
  metadata: any | null;
  altText: string | null;
  isAccessible: boolean;
  isDownloadableOniOS: boolean;
  isImage: boolean;
  mimeType: string;
  path: string;
  downloadURL: string;
  fileExtension: string;
  isVideo: boolean;
  isAudio: boolean;
  signedDownloadURL: string;
  signedPath: string;
  signedThumbnail: string;
}

/**
 * Feed result structure from API response
 */
export interface FeedResult {
  type: string;
  variant: string;
  accessType: string;
  listOfTopics: FeedTopic[];
  listOfMentions: FeedMention[];
  listOfLinks: string[];
  listOfFiles: FeedFile[];
  recentComments: {
    listOfItems: any[];
    nextPageToken: string | null;
  };
  reactionCount: number;
  reactionStats: Record<string, any>;
  feedId: string;
  createdAt: string;
  modifiedAt: string | null;
  modifiedBy: string | null;
  lastActivityAt: string;
  commentCount: number;
  shareCount: number;
  site: any | null;
  content: any | null;
  textHtml: string | null;
  textJson: string;
  authoredBy: FeedAuthor;
  accountId: string;
  segmentId: string | null;
  data: any | null;
  canDelete: boolean;
  canShare: boolean;
  canEdit: boolean;
  canFavourite: boolean;
  isToxic: boolean;
  isDeleted: boolean;
  moderationResult: any | null;
  title: string | null;
}

export interface FeedPostResponse {
  apiName: string;
  status: string;
  message: string;
  result: FeedResult;
  responseTimeStamp: number;
  delay: number;
}

/**
 * Request payload for updating a feed post
 */
export interface UpdateFeedPostPayload {
  textJson: string;
  textHtml: string;
  listOfAttachedFiles: AttachedFile[];
  ignoreToxic: boolean;
  siteId?: string | null;
}

/**
 * Request payload for creating a question
 */
export interface CreateQuestionPayload {
  title: string;
  textJson: string;
  textHtml: string;
  scope: string;
  siteId: string | null;
  contentId?: string | null;
  listOfAttachedFiles: AttachedFile[];
  ignoreToxic: boolean;
  type: 'question';
  variant: string;
  listOfTopics?: { id: string; name: string }[];
}

/**
 * Request payload for updating a question
 */
export interface UpdateQuestionPayload {
  title?: string;
  textJson?: string;
  textHtml?: string;
  ignoreToxic?: boolean;
  listOfAttachedFiles?: AttachedFile[];
}

/**
 * Request payload for creating an answer (comment on question)
 */
export interface CreateAnswerPayload {
  textJson: string;
  textHtml: string;
  listOfAttachedFiles?: AttachedFile[];
  ignoreToxic?: boolean;
}

/**
 * Response structure for question (extends FeedPostResponse)
 */
export interface QuestionResponse extends FeedPostResponse {
  result: FeedResult & {
    title: string;
    type: 'question';
  };
}

/**
 * Response structure for getting question details (GetFeedPost API)
 */
export interface GetQuestionDetailsResponse {
  apiName: string;
  status: string;
  message: string;
  result: FeedResult & {
    title: string;
    type: 'question';
    duplicateOf: string | null;
    listOfDuplicates: any[];
    audiences: any[];
    odinFeedId: string | null;
    canMarkDuplicate: boolean;
  };
  responseTimeStamp: number;
  delay: number;
}
