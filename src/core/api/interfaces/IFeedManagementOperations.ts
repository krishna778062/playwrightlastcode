import { APIResponse } from '@playwright/test';

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

  /**
   * @description Configures app governance settings
   * @param {object} settings The governance settings to configure (optional, uses defaults from curl)
   * @returns {Promise<APIResponse>}
   * @memberof IFeedManagementOperations
   */
  configureAppGovernance(
    settings?: Partial<{
      isExpertiseAppManagerControlled: boolean;
      isHomeAppManagerControlled: boolean;
      isSiteAppManagerControlled: boolean;
      isExpertiseCreateAppManagerControlled: boolean;
      feedMode: string;
      autoGovValidationPeriod: number;
      autoGovernanceEnabled: boolean;
      contentSubmissionsEnabled: boolean;
      feedOnContentEnabled: boolean;
      isExpertiseEnabled: boolean;
      isHomeCarouselEnabled: boolean;
      isSiteCarouselEnabled: boolean;
      allowFileUpload: string;
      siteFilePermission: string;
      htmlTileEnabled: boolean;
      isNativeVideoAutoPlayEnabled: boolean;
      allowFileShareWithPublicLink: boolean;
      enablePersonalizedContentEmails: boolean;
      feedPlaceholder: string;
      isFeedPlaceholderDefault: boolean;
      sitesToUploadFiles: string[];
      privacyPolicy: {
        isPPEnabled: boolean;
        isPPLinkCustom: boolean;
        ppLink: string;
        isPPLabelCustom: boolean;
        ppLabel: string;
      };
      termsOfService: {
        isTOSEnabled: boolean;
        isTOSLinkCustom: boolean;
        tosLink: string;
        isTOSLabelCustom: boolean;
        tosLabel: string;
      };
      takeLegalAcknowledgement: boolean;
    }>
  ): Promise<APIResponse>;
}
