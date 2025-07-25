import { APIRequestContext, test } from '@playwright/test';
import { BaseApiClient } from '@core/api/clients/baseApiClient';
import { IFeedManagementOperations, CreateFeedPostPayload, UpdateFeedPostPayload, FeedPostResponse } from '@core/api/interfaces/IFeedManagementOperations';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';

export class FeedManagerService extends BaseApiClient implements IFeedManagementOperations {
  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
  }

  /**
   * Creates a new feed post
   * @param siteId - The site ID where the post will be created
   * @param postData - The post data including text and attachments
   * @returns Promise with the created post details
   */
  async createPost(postData: CreateFeedPostPayload): Promise<{ postResult: FeedPostResponse; postId: string }> {
    return await test.step(`Creating feed post`, async () => {
      console.log(`Creating feed post with data: ${JSON.stringify(postData)}`);
      const response = await this.post(API_ENDPOINTS.feed.create(), {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        data: postData,
      });
      
      const responseBody = await response.json();
      console.log(`Create response:`, responseBody);
      
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(`Failed to create feed post. Status: ${response.status()}, Message: ${responseBody.message || 'Unknown error'}`);
      }
      
      const postResult = responseBody.result;
      const postId = postResult.feedId || postResult.postId;
      
      console.log(`Feed post created successfully. PostId: ${postId}, Message: ${responseBody.message}`);
      return { postResult, postId };
    });
  }

  /**
   * Updates an existing feed post
   * @param siteId - The site ID where the post exists
   * @param postId - The ID of the post to update
   * @param postData - The updated post data
   * @returns Promise with the updated post details
   */
  async updatePost(postId: string, postData: UpdateFeedPostPayload): Promise<FeedPostResponse> {
    return await test.step(`Updating feed post ${postId}`, async () => {
      console.log(`Updating feed post ${postId} with data: ${JSON.stringify(postData)}`);
      const response = await this.put(API_ENDPOINTS.feed.update(postId), {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        data: postData,
      });
      
      const responseBody = await response.json();
      console.log(`Update response:`, responseBody);
      
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(`Failed to update feed post ${postId}. Status: ${response.status()}, Message: ${responseBody.message || 'Unknown error'}`);
      }
      
      console.log(`Feed post ${postId} updated successfully. Message: ${responseBody.message}`);
      return responseBody.result;
    });
  }

  /**
   * Deletes a feed post
   * @param siteId - The site ID where the post exists
   * @param postId - The ID of the post to delete
   * @returns Promise that resolves when the post is deleted
   */
  async deletePost(postId: string): Promise<void> {
    return await test.step(`Deleting feed post ${postId}`, async () => {
      console.log(`Deleting feed post ${postId}`);
      const response = await this.delete(API_ENDPOINTS.feed.delete(postId), {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      const responseBody = await response.json();
      console.log(`Delete response:`, responseBody);
      
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(`Failed to delete feed post ${postId}. Status: ${response.status()}, Message: ${responseBody.message || 'Unknown error'}`);
      }
      
      console.log(`Feed post ${postId} deleted successfully. Message: ${responseBody.message}`);
    });
  }


  /**
   * Helper method: Deletes a post by searching for it by text content (used for test cleanup)
   * @param postText - The text content to search for
   * @returns Promise that resolves when the post is deleted
   */
  async deletePostByText(postText: string): Promise<void> {
    return await test.step(`Deleting post containing "${postText}"`, async () => {
      console.log(`Searching and deleting post containing "${postText}"`);
      
      // Get all posts and find the matching one
      const response = await this.get(API_ENDPOINTS.feed.list(), {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      const responseBody = await response.json();
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(`Failed to get feed posts for search. Status: ${response.status()}`);
      }
      
      const posts = responseBody.result?.feeds || [];
      const matchingPost = posts.find((post: any) => 
        post.text?.toLowerCase().includes(postText.toLowerCase())
      );
      
      if (!matchingPost) {
        console.log(`No posts found containing "${postText}"`);
        return;
      }
      
      // Delete the matching post
      const postId = matchingPost.postId || matchingPost.feedId;
      await this.deletePost(postId);
      console.log(`Successfully deleted post containing "${postText}"`);
    });
  }

  /**
   * Helper method: Gets the default site ID for global feed operations
   * @returns Promise with the default site ID
   */
  async getDefaultSiteId(): Promise<string> {
    return await test.step('Getting default site ID for feed operations', async () => {
      const defaultSiteId = process.env.DEFAULT_SITE_ID || 'global-feed-site';
      console.log(`Using default site ID: ${defaultSiteId}`);
      return defaultSiteId;
    });
  }
} 