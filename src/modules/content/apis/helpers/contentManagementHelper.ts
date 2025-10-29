import { faker } from '@faker-js/faker';
import { APIRequestContext } from '@playwright/test';

import { MANAGE_CONTENT_TEST_DATA } from '../../test-data/manage-content.test-data';
import { SiteManagementService } from '../services/SiteManagementService';

import { EventSyncPayload, RsvpPayload } from '@/src/core/types/contentManagement.types';
import { getTodayDateIsoString, getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';
import {
  buildBodyAndBodyHtml,
  ContentManagementService,
} from '@/src/modules/content/apis/services/ContentManagementService';
import { ImageUploaderService } from '@/src/modules/content/apis/services/ImageUploaderService';
import { ContentSortBy, DateField } from '@/src/modules/content/constants';
import { EnterpriseSearchHelper } from '@/src/modules/global-search/apis/helpers/enterpriseSearchHelper';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

interface Content {
  siteId: string;
  contentId: string;
}

export class ContentManagementHelper {
  private content: Content[] = [];
  public contentManagementService: ContentManagementService;
  public siteManagementService: SiteManagementService;
  public imageUploaderService: ImageUploaderService;

  constructor(
    readonly apiRequestContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.contentManagementService = new ContentManagementService(apiRequestContext, baseUrl);
    this.siteManagementService = new SiteManagementService(apiRequestContext, baseUrl);
    this.imageUploaderService = new ImageUploaderService(apiRequestContext, baseUrl);
  }

  /**
   * Gets content ID from content list response
   * If no content is found, gets a site from site service and creates a page
   * @param options - Optional parameters for content filtering
   * @returns Promise with siteId and contentId
   */
  async getContentId(options?: {
    size?: number;
    status?: string;
    sortBy?: string;
  }): Promise<{ siteId: string; contentId: string; contentType: string }> {
    const response = await this.contentManagementService.getContentList(options);

    if (response.result?.listOfItems && response.result.listOfItems.length > 0) {
      const randomIndex = Math.floor(Math.random() * response.result.listOfItems.length);
      const randomContent = response.result.listOfItems[randomIndex];
      return {
        siteId: randomContent.site.siteId,
        contentId: randomContent.contentId || randomContent.id,
        contentType: randomContent.type,
      };
    }

    // No content found, get a site from site service and create a page
    console.log('No content found, getting site from site service and creating a page...');

    // Get a site from the site list using the site service directly
    const sitesResponse = await this.siteManagementService.getListOfSites();

    if (!sitesResponse.result?.listOfItems || sitesResponse.result.listOfItems.length === 0) {
      throw new Error('No sites found in site service');
    }

    // Get a random site
    const randomSiteIndex = Math.floor(Math.random() * sitesResponse.result.listOfItems.length);
    const randomSite = sitesResponse.result.listOfItems[randomSiteIndex];
    const siteId = randomSite.siteId;

    // Create a page in the selected site
    const pageResult = await this.createPage({
      siteId,
      contentInfo: {
        contentType: 'page',
        contentSubType: 'general',
      },
      options: {
        waitForSearchIndex: false,
      },
    });

    return {
      siteId: pageResult.siteId,
      contentId: pageResult.contentId,
      contentType: 'page',
    };
  }

  async getContentCreatedAtDetails(
    sortBy: ContentSortBy,
    options?: { size?: number; filter?: string; status?: string }
  ): Promise<string[] | null> {
    const size = options?.size || 1000;
    const filter = options?.filter || 'owned';
    const status = options?.status || 'published';

    const siteListResponse = await this.contentManagementService.getContentList({
      sortBy: sortBy,
      size: size,
      contribution: 'all',
      filter: filter, // Match curl command parameter
      status: status, // Match curl command parameter
    });

    // Determine which date field to use based on sort type
    let dateField: DateField;
    if (sortBy === ContentSortBy.PUBLISHED_NEWEST || sortBy === ContentSortBy.PUBLISHED_OLDEST) {
      dateField = DateField.PUBLISH_AT; // API returns publishAt field
    } else if (sortBy === ContentSortBy.MODIFIED_NEWEST || sortBy === ContentSortBy.MODIFIED_OLDEST) {
      dateField = DateField.MODIFIED_AT; // Use 'modifiedAt' for modified sorts
    } else {
      dateField = DateField.CREATED_AT;
    }

    // Get all items from the API response
    const items = siteListResponse.result.listOfItems;

    // Extract dates from items (limit to last 16-17 items)
    const dates: string[] = [];
    const maxItems = Math.min(items.length, 17); // Get up to 17 items

    for (let i = 0; i < maxItems; i++) {
      const item = items[i];
      let targetDate: string;

      if (dateField === DateField.CREATED_AT) {
        targetDate = item.createdAt;
      } else if (dateField === DateField.PUBLISH_AT) {
        targetDate = item.publishAt;
      } else if (dateField === DateField.MODIFIED_AT) {
        targetDate = item.modifiedAt;
      } else {
        continue;
      }

      if (targetDate) {
        const date = new Date(targetDate);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Check if the date is today using UTC comparison
        if (date.toISOString().split('T')[0] === today.toISOString().split('T')[0] && date <= today) {
          dates.push('Today');
        }
        // Check if the date is yesterday using UTC comparison
        else if (date.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0] && date <= today) {
          dates.push('Yesterday');
        }
        // For other dates, return formatted date
        else {
          const monthNames = MANAGE_CONTENT_TEST_DATA.MONTH_NAMES;
          const formattedDate = `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
          dates.push(formattedDate);
        }
      } else {
      }
    }

    return dates.length > 0 ? dates : null;
  }

  /**
   * Creates a new site (by category name) and an album within that site.
   * Returns site details along with the created album details.
   * @param categoryName - The name of the category for the site
   * @param imageName - The name of the image file to upload
   * @param options - Optional configuration object with albumName, contentDescription, and/or accessType
   */
  async createAlbum(params: {
    siteId: string;
    imageName: string;
    options?: { albumName?: string; contentDescription?: string; accessType?: SITE_TYPES };
  }) {
    const fileId = await this.imageUploaderService.uploadImageAndGetFileId(params.imageName);
    const finalAlbumName =
      params.options?.albumName || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Album`;
    const finalContentDescription = params.options?.contentDescription || 'AutomateAlbumDescription';
    const { body, bodyHtml } = buildBodyAndBodyHtml(finalContentDescription, 'album');
    const albumResult = await this.contentManagementService.addNewAlbumContent(params.siteId, {
      title: finalAlbumName,
      body,
      bodyHtml,
      publishAt: getTodayDateIsoString(),
      coverImageMediaId: fileId,
      listOfAlbumMedia: [{ id: fileId, description: '' }],
    });
    await EnterpriseSearchHelper.waitForResultToAppearInApiResponse({
      apiClient: this.contentManagementService.httpClient,
      searchTerm: finalAlbumName,
      objectType: 'content',
    });
    const createdContent = {
      siteId: params.siteId,
      contentId: albumResult.albumId,
      albumName: finalAlbumName,
      authorName: albumResult.authorName,
      contentDescription: finalContentDescription,
    };
    this.content.push({ siteId: params.siteId, contentId: albumResult.albumId });
    return { ...createdContent };
  }

  /**
   * Creates a new page in an existing site
   * @param siteId - The ID of the existing site
   * @param contentInfo - The content type information
   * @param options - Optional configuration object with pageName, contentDescription, publishAt, and publishTo
   */
  async createPage(params: {
    siteId: string;
    contentInfo: { contentType: string; contentSubType: string };
    options?: {
      pageName?: string;
      contentDescription?: string;
      waitForSearchIndex?: boolean;
      publishAt?: string;
      publishTo?: string;
    };
  }) {
    const { siteId, contentInfo, options = {} } = params;
    const pageCategory = await this.contentManagementService.getPageCategoryID(siteId);
    const finalPageName = options.pageName || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Page`;
    const finalContentDescription = options.contentDescription || 'AutomatePageDescription';
    const { body, bodyHtml } = buildBodyAndBodyHtml(finalContentDescription, 'page');
    const pageResult = await this.contentManagementService.addNewPageContent(siteId, {
      title: finalPageName,
      body,
      bodyHtml,
      category: {
        id: pageCategory.categoryId,
        name: pageCategory.name,
      },
      contentType: contentInfo.contentType,
      contentSubType: contentInfo.contentSubType,
      ...(options.publishAt && { publishAt: options.publishAt }),
      ...(options.publishTo && { publishTo: options.publishTo }),
    });

    if (options.waitForSearchIndex) {
      await EnterpriseSearchHelper.waitForResultToAppearInApiResponse({
        apiClient: this.contentManagementService.httpClient,
        searchTerm: finalPageName,
        objectType: 'content',
      });
    }
    const createdContent = {
      siteId,
      contentId: pageResult.pageId,
      pageName: finalPageName,
      authorName: pageResult.authorName,
      contentDescription: finalContentDescription,
      publishAt: pageResult.publishAt,
      publishTo: pageResult.publishTo,
      isScheduled: pageResult.isScheduled,
    };
    // this.content.push({ siteId, contentId: pageResult.pageId });
    return { ...createdContent };
  }

  /**
   * Creates a new scheduled page in an existing site
   * @param siteId - The ID of the existing site
   * @param contentInfo - The content type information
   * @param options - Optional configuration object with pageName, contentDescription, publishAt, and publishTo
   */

  /**
   * Creates a new event in an existing site
   * @param siteId - The ID of the existing site
   * @param contentInfo - The content type information
   * @param options - Optional configuration object with eventName, contentDescription, and location
   */
  async createEvent(params: {
    siteId: string;
    contentInfo: { contentType: string };
    options?: {
      eventName?: string;
      contentDescription?: string;
      location?: string;
      eventSync?: EventSyncPayload;
      rsvp?: RsvpPayload;
    };
  }) {
    const { siteId, contentInfo, options = {} } = params;
    const finalEventName = options.eventName || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Event`;
    const finalContentDescription = options.contentDescription || 'AutomateEventDescription';
    const finalLocation = options.location || 'Gurgaon';
    const { body, bodyHtml } = buildBodyAndBodyHtml(finalContentDescription, 'event');
    const eventResult = await this.contentManagementService.addNewEventContent(siteId, {
      title: finalEventName,
      body,
      bodyHtml,
      contentType: contentInfo.contentType,
      startsAt: getTodayDateIsoString(),
      endsAt: getTomorrowDateIsoString(),
      timezoneIso: 'Asia/Kolkata',
      location: finalLocation,
      ...(options.eventSync && { eventSync: options.eventSync }),
      ...(options.rsvp && { rsvp: options.rsvp }),
    });
    await EnterpriseSearchHelper.waitForResultToAppearInApiResponse({
      apiClient: this.contentManagementService.httpClient,
      searchTerm: finalEventName,
      objectType: 'content',
    });
    const createdContent = {
      siteId,
      contentId: eventResult.eventId,
      eventName: finalEventName,
      authorName: eventResult.authorName,
      contentDescription: finalContentDescription,
      ...(eventResult.eventSyncDetails && { eventSyncDetails: eventResult.eventSyncDetails }),
      ...(eventResult.hasRsvp !== undefined && { hasRsvp: eventResult.hasRsvp }),
      ...(eventResult.rsvpDetails && { rsvpDetails: eventResult.rsvpDetails }),
    };
    this.content.push({ siteId, contentId: eventResult.eventId });
    return { ...createdContent };
  }

  /**
   * Deletes a specific content item
   * @param siteId - The site ID where the content is located
   * @param contentId - The content ID to delete
   */
  async deleteContent(siteId: string, contentId: string): Promise<void> {
    if (contentId && siteId) {
      try {
        await this.contentManagementService.deleteContent(siteId, contentId);
        console.log(`Content successfully deleted: ${contentId} from site: ${siteId}`);
      } catch (error) {
        console.error(`Failed to delete content ${contentId} from site ${siteId}:`, error);
        throw error;
      }
    } else {
      console.log('No content ID or site ID provided for deletion');
    }
  }

  /**
   * Gets the list of topics
   * @param size - Number of topics to return (default: 16)
   * @param term - Search term to filter topics (default: empty string)
   * @param nextPageToken - Token for pagination (default: 0)
   * @returns The topic list response
   */
  async getTopicList(size: number = 16, term: string = '', nextPageToken: number = 0) {
    return await this.contentManagementService.getTopicList();
  }

  /**
   * Cleans up all content (albums, pages, events) created by this helper instance.
   * Note: Site cleanup is handled by the siteManagementHelper fixture at worker level.
   */
  async cleanup() {
    for (const { siteId, contentId } of this.content) {
      if (contentId) {
        await this.contentManagementService.deleteContent(siteId, contentId);
      }
    }
  }
}
