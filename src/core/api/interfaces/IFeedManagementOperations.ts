import { CreateFeedPostPayload } from '@core/types/feed.type';

/**
 * @description Interface for feed management operations
 * @export
 * @interface IFeedManagementOperations
 */
export interface IFeedManagementOperations {
  /**
   * @description Creates a feed
   * @param {Partial<CreateFeedPostPayload>} [overrides] The partial feed data to override the defaults
   * @returns {Promise<any>}
   * @memberof IFeedManagementOperations
   */
  createFeed(overrides?: Partial<CreateFeedPostPayload>): Promise<any>;

  /**
   * @description Deletes a feed
   * @param {string} feedId The ID of the feed to delete
   * @returns {Promise<any>}
   * @memberof IFeedManagementOperations
   */
  deleteFeed(feedId: string): Promise<any>;
}
