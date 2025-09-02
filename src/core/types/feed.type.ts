export interface IFeedManagementOperations {
  createPost(text: string, overrides?: any): Promise<any>;
  updatePost(feedId: string, updates: any): Promise<any>;
  deletePost(postId: string): Promise<any>;
  createFeed?(overrides?: any): Promise<any>;
  createPostWithAttachments?(text: string, attachments: any[], overrides?: any): Promise<any>;
  getFeeds?(options?: any): Promise<any>;
}

export interface CreateFeedPostPayload {
  textJson: string;
  textHtml: string;
  scope: string;
  siteId: string | null;
  listOfAttachedFiles: any[];
  ignoreToxic: boolean;
  type: string;
  variant: string;
}

export interface FeedAuthor {
  userId: string;
  name: string;
  img: string;
  department: string;
  title: string;
  signedImg: string;
}

export interface FeedResult {
  type: string;
  variant: string;
  accessType: string;
  listOfTopics: any[];
  listOfMentions: any[];
  listOfLinks: any[];
  listOfFiles: any[];
  recentComments: {
    listOfItems: any[];
    nextPageToken: string | null;
  };
  reactionCount: number;
  reactionStats: any;
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

export interface UpdateFeedPostPayload {
  text?: string;
  attachments?: string[];
}
