import { APIRequestContext, test } from '@playwright/test';
import { BaseApiClient } from '@core/api/clients/baseApiClient';
import { IFeedManagementOperations, CreateFeedPostPayload, UpdateFeedPostPayload, FeedPostResponse } from '@core/api/interfaces/IFeedManagementOperations';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';

export class FeedManagerService extends BaseApiClient implements IFeedManagementOperations {
  constructor(context: APIRequestContext, baseUrl?: string) {
    super(context, baseUrl);
  }

  async createPost(postData: CreateFeedPostPayload): Promise<{ postResult: FeedPostResponse; postId: string }> {
    return await test.step(`Creating feed post`, async () => {
      const response = await this.post(API_ENDPOINTS.feed.create(), {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        data: postData,
      });
      const responseBody = await response.json();
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(`Failed to create feed post. Status: ${response.status()}`);
      }
      const postResult = responseBody.result;
      const postId = postResult.feedId || postResult.postId;
      return { postResult, postId };
    });
  }

  async updatePost(postId: string, postData: UpdateFeedPostPayload): Promise<FeedPostResponse> {
    return await test.step(`Updating feed post ${postId}`, async () => {
      const response = await this.put(API_ENDPOINTS.feed.update(postId), {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        data: postData,
      });
      const responseBody = await response.json();
      if (!response.ok() || responseBody.status !== 'success') {
        throw new Error(`Failed to update feed post ${postId}. Status: ${response.status()}`);
      }
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


} 