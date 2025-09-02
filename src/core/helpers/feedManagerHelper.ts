import { faker } from '@faker-js/faker';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { FeedManagementService } from '@/src/core/api/services/FeedManagementService';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { Feed } from '@/src/core/types/feed.type';

interface FeedPost {
  feedId: string;
  text: string;
  siteId?: string;
}

export class FeedManagerHelper {
  private feedPosts: FeedPost[] = [];
  private feedManagementService: FeedManagementService;

  constructor(private appManagerApiClient: AppManagerApiClient) {
    this.feedManagementService = new FeedManagementService(appManagerApiClient.context);
  }

  /**
   * Creates a simple feed post with text content
   * @param text - The text content for the post
   * @param options - Optional configuration for the post
   * @returns The created feed response
   */
  async createSimplePost(
    text?: string,
    options?: {
      siteId?: string;
      scope?: 'public' | 'private';
      waitForSearchIndex?: boolean;
    }
  ): Promise<any> {
    const finalText = text || `Automated Test Post ${faker.company.name()} - ${faker.commerce.productName()}`;
    const { siteId, scope = 'public', waitForSearchIndex = true } = options || {};

    const overrides: Partial<Feed> = {
      scope,
      ...(siteId && { siteId }),
    };

    const response = await this.feedManagementService.createFeed(overrides);

    // Store for cleanup
    this.feedPosts.push({
      feedId: response.result.feedId,
      text: finalText,
      siteId,
    });

    // Wait for enterprise search indexing if requested
    if (waitForSearchIndex) {
      await EnterpriseSearchHelper.waitForResultToAppearInApiResponse({
        apiClient: this.appManagerApiClient,
        searchTerm: finalText,
        objectType: 'feed',
      });
    }

    return response;
  }

  /**
   * Creates a feed post with attachments
   * @param text - The text content for the post
   * @param attachments - Array of file attachments
   * @param options - Optional configuration for the post
   * @returns The created feed response
   */
  async createPostWithAttachments(
    text?: string,
    attachments: any[] = [],
    options?: {
      siteId?: string;
      scope?: 'public' | 'private';
      waitForSearchIndex?: boolean;
    }
  ): Promise<any> {
    const finalText = text || `Automated Test Post with Attachments ${faker.company.name()}`;
    const { siteId, scope = 'public', waitForSearchIndex = true } = options || {};

    const overrides: Partial<Feed> = {
      scope,
      listOfAttachedFiles: attachments,
      ...(siteId && { siteId }),
    };

    const response = await this.feedManagementService.createFeed(overrides);

    // Store for cleanup
    this.feedPosts.push({
      feedId: response.result.feedId,
      text: finalText,
      siteId,
    });

    // Wait for enterprise search indexing if requested
    if (waitForSearchIndex) {
      await EnterpriseSearchHelper.waitForResultToAppearInApiResponse({
        apiClient: this.appManagerApiClient,
        searchTerm: finalText,
        objectType: 'feed',
      });
    }

    return response;
  }

  /**
   * Creates a feed post in a specific site
   * @param siteId - The ID of the site to post in
   * @param text - The text content for the post
   * @param options - Optional configuration for the post
   * @returns The created feed response
   */
  async createSitePost(
    siteId: string,
    text?: string,
    options?: {
      scope?: 'public' | 'private';
      attachments?: any[];
      waitForSearchIndex?: boolean;
    }
  ): Promise<any> {
    const finalText = text || `Site Post ${faker.company.name()} - ${faker.commerce.productName()}`;
    const { scope = 'public', attachments = [], waitForSearchIndex = true } = options || {};

    if (attachments.length > 0) {
      return await this.createPostWithAttachments(finalText, attachments, {
        siteId,
        scope,
        waitForSearchIndex,
      });
    } else {
      return await this.createSimplePost(finalText, {
        siteId,
        scope,
        waitForSearchIndex,
      });
    }
  }

  /**
   * Creates multiple feed posts for testing
   * @param count - Number of posts to create
   * @param options - Optional configuration for the posts
   * @returns Array of created feed responses
   */
  async createMultiplePosts(
    count: number = 3,
    options?: {
      siteId?: string;
      scope?: 'public' | 'private';
      withAttachments?: boolean;
      waitForSearchIndex?: boolean;
    }
  ): Promise<any[]> {
    const { siteId, scope = 'public', withAttachments = false, waitForSearchIndex = true } = options || {};
    const posts: any[] = [];

    for (let i = 0; i < count; i++) {
      const text = `Bulk Test Post ${i + 1} - ${faker.company.name()}`;

      let response: any;
      if (withAttachments) {
        // Create mock attachments for testing
        const mockAttachments = [
          { fileName: 'test-image.jpg', fileType: 'image' },
          { fileName: 'test-doc.pdf', fileType: 'document' },
        ];
        response = await this.createPostWithAttachments(text, mockAttachments, {
          siteId,
          scope,
          waitForSearchIndex,
        });
      } else {
        response = await this.createSimplePost(text, {
          siteId,
          scope,
          waitForSearchIndex,
        });
      }

      posts.push(response);
    }

    return posts;
  }

  /**
   * Deletes a specific feed post
   * @param feedId - The ID of the feed to delete
   */
  async deletePost(feedId: string): Promise<void> {
    await this.feedManagementService.deleteFeed(feedId);

    // Remove from tracking
    this.feedPosts = this.feedPosts.filter(post => post.feedId !== feedId);
  }

  /**
   * Updates a feed post
   * @param feedId - The ID of the feed to update
   * @param updates - The updates to apply
   * @returns The updated feed response
   */
  async updatePost(feedId: string, updates: Partial<Feed>): Promise<any> {
    // Note: Update method not available in current FeedManagementService
    throw new Error('Update functionality not implemented in FeedManagementService');
  }

  /**
   * Gets feed posts with optional filtering
   * @param options - Query options for fetching feeds
   * @returns Feed posts response
   */
  async getFeeds(options?: { siteId?: string; limit?: number; offset?: number }): Promise<any> {
    // Note: Get feeds method not available in current FeedManagementService
    throw new Error('Get feeds functionality not implemented in FeedManagementService');
  }

  /**
   * Gets a random feed post from the created posts
   * @returns A random feed post from the posts created by this helper, or null if no posts exist
   */
  getRandomPost(): FeedPost | null {
    if (this.feedPosts.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * this.feedPosts.length);
    return this.feedPosts[randomIndex];
  }

  /**
   * Gets all created feed posts
   * @returns Array of all feed posts created by this helper
   */
  getAllPosts(): FeedPost[] {
    return [...this.feedPosts];
  }

  /**
   * Gets feed posts by site ID
   * @param siteId - The site ID to filter by
   * @returns Array of feed posts for the specified site
   */
  getPostsBySite(siteId: string): FeedPost[] {
    return this.feedPosts.filter(post => post.siteId === siteId);
  }

  /**
   * Cleanup method to delete all created feed posts
   * Should be called in test cleanup (afterEach/afterAll)
   */
  async cleanup(): Promise<void> {
    console.log(`Cleaning up ${this.feedPosts.length} feed posts...`);

    const deletePromises = this.feedPosts.map(async post => {
      try {
        await this.feedManagementService.deleteFeed(post.feedId);
        console.log(`Deleted feed post: ${post.feedId}`);
      } catch (error) {
        console.warn(`Failed to delete feed post ${post.feedId}:`, error);
      }
    });

    await Promise.allSettled(deletePromises);
    this.feedPosts = [];
    console.log('Feed cleanup completed');
  }

  /**
   * Helper method to build text content with JSON and HTML format
   * @param text - The plain text content
   * @returns Object with textJson and textHtml
   */
  static buildTextContent(text: string): { textJson: string; textHtml: string } {
    return {
      textJson: `{"type":"doc","content":[{"type":"paragraph","attrs":{"class":null,"style":null},"content":[{"type":"text","text":"${text}"}]}]}`,
      textHtml: `<p>${text}</p>`,
    };
  }

  /**
   * Helper method to generate realistic test feed content
   * @param type - The type of content to generate
   * @returns Generated text content
   */
  static generateTestContent(type: 'announcement' | 'update' | 'question' | 'general' = 'general'): string {
    switch (type) {
      case 'announcement':
        return `📢 Important Announcement: ${faker.company.buzzPhrase()} - ${faker.lorem.sentence()}`;
      case 'update':
        return `🔄 Update: ${faker.company.name()} has ${faker.company.buzzVerb()} ${faker.company.buzzNoun()}. ${faker.lorem.sentence()}`;
      case 'question':
        return `❓ Question: What are your thoughts on ${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}? ${faker.lorem.sentence()}`;
      default:
        return `${faker.lorem.paragraph()} #${faker.company.buzzNoun().toLowerCase()}`;
    }
  }
}
