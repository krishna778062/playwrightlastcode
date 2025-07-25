export interface IFeedManagementOperations {
  /**
   * Creates a new feed post
   * @param postData - The post data including text and attachments
   * @returns Promise with the created post details and postId
   */
  createPost(postData: CreateFeedPostPayload): Promise<{ postResult: FeedPostResponse; postId: string }>;

  /**
   * Updates an existing feed post
   * @param postId - The ID of the post to update
   * @param postData - The updated post data
   * @returns Promise with the updated post details
   */
  updatePost(postId: string, postData: UpdateFeedPostPayload): Promise<FeedPostResponse>;

  /**
   * Deletes a feed post
   * @param postId - The ID of the post to delete
   * @returns Promise that resolves when the post is deleted
   */
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

 