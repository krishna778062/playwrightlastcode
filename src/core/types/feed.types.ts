export interface IFeedManagementOperations {
  createPost(postData: CreateFeedPostPayload): Promise<{ postResult: FeedPostResponse; postId: string }>;
  updatePost(postId: string, postData: UpdateFeedPostPayload): Promise<FeedPostResponse>;
  deletePost(postId: string): Promise<void>;
}

export interface CreateFeedPostPayload {
  text: string;
  attachments?: string[];
  publishAt?: string;
  isFeedEnabled?: boolean;
}

export interface UpdateFeedPostPayload {
  text?: string;
  attachments?: string[];
}

export interface FeedPostResponse {
  postId: string;
  text: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  attachments: string[];
  siteId: string;
}
