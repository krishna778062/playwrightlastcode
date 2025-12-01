import { faker } from '@faker-js/faker';
import { APIRequestContext, test } from '@playwright/test';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { log } from '@core/utils/logger';

import { EventSyncPayload, RsvpPayload } from '@/src/core/types/contentManagement.types';
import { getTodayDateIsoString, getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';
import {
  buildBodyAndBodyHtml,
  ContentManagementService,
} from '@/src/modules/content/apis/services/ContentManagementService';
import { ImageUploaderService } from '@/src/modules/content/apis/services/ImageUploaderService';
import { SiteManagementService } from '@/src/modules/content/apis/services/SiteManagementService';
import { ContentSortBy, DateField } from '@/src/modules/content/constants';
import { MustReadAudienceType, MustReadDuration } from '@/src/modules/content/constants/enums/mustRead';
import { MANAGE_CONTENT_TEST_DATA } from '@/src/modules/content/test-data/manage-content.test-data';
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
   * @param options.accessType - Filter content by site access type ('public', 'private', 'unlisted'). Defaults to 'public'.
   * @returns Promise with siteId and contentId
   */
  async getContentId(options?: {
    size?: number;
    status?: string;
    sortBy?: string;
    accessType?: SITE_TYPES;
  }): Promise<{ siteId: string; contentId: string; contentType: string }> {
    // Default to 'public' if not specified
    const accessType = options?.accessType || SITE_TYPES.PUBLIC;
    const response = await this.contentManagementService.getContentList(options);

    if (response.result?.listOfItems && response.result.listOfItems.length > 0) {
      // Filter content by site access type
      const filteredContent = response.result.listOfItems.filter((content: any) => {
        const site = content.site;
        const siteAccess = site.access?.toLowerCase() || '';

        if (accessType === SITE_TYPES.PUBLIC) {
          return site.isPublic || siteAccess === SITE_TYPES.PUBLIC;
        } else if (accessType === SITE_TYPES.PRIVATE) {
          return site.isPrivate || siteAccess === SITE_TYPES.PRIVATE;
        } else if (accessType === SITE_TYPES.UNLISTED) {
          return !site.isListed || siteAccess === SITE_TYPES.UNLISTED;
        }
        return true; // If accessType doesn't match, return all content
      });

      if (filteredContent.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredContent.length);
        const randomContent = filteredContent[randomIndex];
        return {
          siteId: randomContent.site.siteId,
          contentId: randomContent.contentId || randomContent.id,
          contentType: randomContent.type,
        };
      }
    }

    // No content found, get a site from site service and create a page

    // Get sites filtered by access type
    const sitesResponse = await this.siteManagementService.getListOfSites({
      filter: accessType.toLowerCase(),
    });

    if (!sitesResponse.result?.listOfItems || sitesResponse.result.listOfItems.length === 0) {
      throw new Error(`No ${accessType} sites found in site service`);
    }

    // Filter for active sites only
    const activeSites = sitesResponse.result.listOfItems.filter((site: any) => site.isActive);

    if (activeSites.length === 0) {
      throw new Error(`No active ${accessType} sites found in site service`);
    }

    // Get a random active site
    const randomSiteIndex = Math.floor(Math.random() * activeSites.length);
    const randomSite = activeSites[randomSiteIndex];
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

  async makeContentMustRead(
    contentId: string,
    options: {
      audienceType?: MustReadAudienceType | string;
      duration?: MustReadDuration | string;
    } = {
      audienceType: MustReadAudienceType.SITE_MEMBERS_AND_FOLLOWERS,
      duration: MustReadDuration.NINETY_DAYS,
    }
  ): Promise<any> {
    const mustReadResponse = await this.contentManagementService.makeContentMustRead(contentId, options);
    return mustReadResponse;
  }

  async getContentCreatedAtDetails(
    sortBy: ContentSortBy,
    options?: { size?: number; filter?: string; status?: string; contribution?: string }
  ): Promise<string[] | null> {
    const size = options?.size || 1000;
    const filter = options?.filter || 'owned';
    const status = options?.status || 'published';
    const contribution = options?.contribution || 'all';

    const siteListResponse = await this.contentManagementService.getContentList({
      sortBy: sortBy,
      size: size,
      filter: filter, // Match curl command parameter
      status: status, // Match curl command parameter
      contribution: contribution,
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
        // Extract date directly from ISO string (YYYY-MM-DD) to avoid timezone conversion
        // API returns: "2025-11-30T23:59:00.000Z" -> extract "2025-11-30"
        const dateUTCString = targetDate.split('T')[0];

        // Validate the date string format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateUTCString)) {
          console.warn(`Invalid date string format: ${targetDate}`);
          continue;
        }

        // Get today and yesterday dates using local timezone to match UI behavior
        // The UI uses the browser's local timezone to determine "Today" vs "Yesterday"
        const now = new Date();
        // Convert API UTC date to local date for comparison
        const apiDate = new Date(targetDate);
        const apiLocalDateString = `${apiDate.getFullYear()}-${String(apiDate.getMonth() + 1).padStart(2, '0')}-${String(apiDate.getDate()).padStart(2, '0')}`;

        // Get today's local date string
        const todayLocalDateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // Get yesterday's local date string
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayLocalDateString = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

        // Debug: Log comparison for debugging
        console.log(
          `Item ${i}: Comparing apiLocalDateString="${apiLocalDateString}" with todayLocalDateString="${todayLocalDateString}" and yesterdayLocalDateString="${yesterdayLocalDateString}" (UTC: dateUTCString="${dateUTCString}")`
        );

        // Check if the date is today using local date string comparison
        // This matches the UI behavior which uses local timezone
        if (apiLocalDateString === todayLocalDateString) {
          dates.push('Today');
        }
        // Check if the date is yesterday using local date string comparison
        else if (apiLocalDateString === yesterdayLocalDateString) {
          dates.push('Yesterday');
        }
        // For other dates, return formatted date using UTC components
        else {
          const monthNames = MANAGE_CONTENT_TEST_DATA.MONTH_NAMES;
          // Parse the UTC date string (YYYY-MM-DD) to get exact date components
          const [year, month, day] = dateUTCString.split('-').map(Number);
          const formattedDate = `${monthNames[month - 1]} ${day}, ${year}`;
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
    options?: {
      albumName?: string;
      contentDescription?: string;
      accessType?: SITE_TYPES;
      listOfTopics?: string[];
      waitForSearchIndex?: boolean;
    };
  }) {
    const { options = {} } = params;
    const fileId = await this.imageUploaderService.uploadImageAndGetFileId(params.imageName);
    const finalAlbumName =
      params.options?.albumName || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Album`;
    const finalContentDescription = params.options?.contentDescription || 'AutomateAlbumDescription';
    const { body, bodyHtml } = buildBodyAndBodyHtml(finalContentDescription, 'album');

    // Get topic IDs for the topics if provided
    let topicObjects: { id: string; name: string }[] = [];
    if (params.options?.listOfTopics && params.options.listOfTopics.length > 0) {
      const topicList = await this.contentManagementService.getTopicList();
      topicObjects = params.options.listOfTopics.map(topicName => {
        const topic = topicList.result?.listOfItems?.find(t => t.name === topicName);
        return {
          id: topic?.topic_id || '',
          name: topicName,
        };
      });
    }

    const albumResult = await this.contentManagementService.addNewAlbumContent(params.siteId, {
      title: finalAlbumName,
      body,
      bodyHtml,
      publishAt: getTodayDateIsoString(),
      coverImageMediaId: fileId,
      listOfAlbumMedia: [{ id: fileId, description: '' }],
      ...(topicObjects.length > 0 && { listOfTopics: topicObjects }),
    });
    if (options.waitForSearchIndex) {
      await EnterpriseSearchHelper.waitForResultToAppearInApiResponse({
        apiClient: this.contentManagementService.httpClient,
        searchTerm: finalAlbumName,
        objectType: 'content',
      });
    }
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
      listOfTopics?: string[];
    };
  }) {
    const { siteId, contentInfo, options = {} } = params;
    const pageCategory = await this.contentManagementService.getPageCategoryID(siteId);
    const finalPageName = options.pageName || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Page`;
    const finalContentDescription = options.contentDescription || 'AutomatePageDescription';
    const { body, bodyHtml } = buildBodyAndBodyHtml(finalContentDescription, 'page');

    // Get topic IDs for the topics if provided
    let topicObjects: { id: string; name: string }[] = [];
    if (options.listOfTopics && options.listOfTopics.length > 0) {
      const topicList = await this.contentManagementService.getTopicList();
      topicObjects = options.listOfTopics.map(topicName => {
        const topic = topicList.result?.listOfItems?.find(t => t.name === topicName);
        return {
          id: topic?.topic_id || '',
          name: topicName,
        };
      });
    }

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
      ...(topicObjects.length > 0 && { listOfTopics: topicObjects }),
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
    this.content.push({ siteId, contentId: pageResult.pageId });
    return { ...createdContent };
  }

  async createDraftPage(params: {
    siteId: string;
    contentInfo: { contentType: string; contentSubType: string };
    options?: {
      pageName?: string;
      contentDescription?: string;
      waitForSearchIndex?: boolean;
      publishAt?: string;
      publishTo?: string;
      listOfTopics?: string[];
    };
  }) {
    const { siteId, contentInfo, options = {} } = params;
    const pageCategory = await this.contentManagementService.getPageCategoryID(siteId);
    const finalPageName = options.pageName || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Page`;
    const finalContentDescription = options.contentDescription || 'AutomatePageDescription';
    const { body, bodyHtml } = buildBodyAndBodyHtml(finalContentDescription, 'page');

    // Get topic IDs for the topics if provided
    let topicObjects: { id: string; name: string }[] = [];
    if (options.listOfTopics && options.listOfTopics.length > 0) {
      const topicList = await this.contentManagementService.getTopicList();
      topicObjects = options.listOfTopics.map(topicName => {
        const topic = topicList.result?.listOfItems?.find(t => t.name === topicName);
        return {
          id: topic?.topic_id || '',
          name: topicName,
        };
      });
    }

    const pageResult = await this.contentManagementService.saveDraftPageContent(siteId, {
      title: finalPageName,
      body,
      bodyHtml,
      category: {
        id: pageCategory.categoryId,
        name: pageCategory.name,
      },
      contentType: contentInfo.contentType,
      contentSubType: contentInfo.contentSubType,
      ...(topicObjects.length > 0 && { listOfTopics: topicObjects }),
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
    this.content.push({ siteId, contentId: pageResult.pageId });
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
      listOfTopics?: string[];
      waitForSearchIndex?: boolean;
    };
  }) {
    const { siteId, contentInfo, options = {} } = params;
    const finalEventName = options.eventName || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Event`;
    const finalContentDescription = options.contentDescription || 'AutomateEventDescription';
    const finalLocation = options.location || 'Gurgaon';
    const { body, bodyHtml } = buildBodyAndBodyHtml(finalContentDescription, 'event');

    // Get topic IDs for the topics if provided
    let topicObjects: { id: string; name: string }[] = [];
    if (options.listOfTopics && options.listOfTopics.length > 0) {
      const topicList = await this.contentManagementService.getTopicList();
      topicObjects = options.listOfTopics.map(topicName => {
        const topic = topicList.result?.listOfItems?.find(t => t.name === topicName);
        return {
          id: topic?.topic_id || '',
          name: topicName,
        };
      });
    }

    const eventResult = await this.contentManagementService.addNewEventContent(siteId, {
      title: finalEventName,
      body,
      bodyHtml,
      contentType: contentInfo.contentType,
      startsAt: getTodayDateIsoString(),
      endsAt: getTomorrowDateIsoString(),
      timezoneIso: 'Asia/Kolkata',
      location: finalLocation,
      ...(topicObjects.length > 0 && { listOfTopics: topicObjects }),
      ...(options.eventSync && { eventSync: options.eventSync }),
      ...(options.rsvp && { rsvp: options.rsvp }),
    });
    if (options.waitForSearchIndex) {
      await EnterpriseSearchHelper.waitForResultToAppearInApiResponse({
        apiClient: this.contentManagementService.httpClient,
        searchTerm: finalEventName,
        objectType: 'content',
      });
    }
    const createdContent = {
      siteId,
      contentId: eventResult.eventId,
      eventName: finalEventName,
      authorName: eventResult.authorName,
      startsAt: eventResult.startsAt,
      endsAt: eventResult.endsAt,
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
      } catch (error) {
        log.error(`Failed to delete content ${contentId} from site ${siteId}`, error);
        throw error;
      }
    }
  }

  /**
   * Creates a new topic
   * @param topicName - The name of the topic to create
   * @returns The created topic information
   */
  async createTopic(topicName: string): Promise<{ topicId: string; name: string }> {
    return await this.contentManagementService.createTopic(topicName);
  }

  /**
   * Deletes one or more topics by their IDs
   * @param topicIds - Array of topic IDs to delete
   * @returns Promise that resolves when topics are deleted
   */
  async deleteTopic(topicIds: string[]): Promise<void> {
    return await this.contentManagementService.deleteTopic(topicIds);
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

  /**
   * Gets the must read content list
   * @param peopleId - The people ID of the user
   * @param options - Optional parameters for must read content filtering
   * @returns Promise with the content list response
   */
  async getMustReadContentList(
    peopleId: string,
    options?: {
      size?: number;
      sortBy?: string;
      isMustRead?: boolean;
    }
  ) {
    return await this.contentManagementService.getMustReadContentList({
      peopleId,
      size: options?.size || 16,
      isMustRead: options?.isMustRead !== undefined ? options.isMustRead : true,
    });
  }

  /**
   * Gets the first must read content item details for navigation
   * @param peopleId - The people ID of the user
   * @param options - Optional parameters for must read content filtering
   * @returns Promise with siteId, contentId, and contentType of the first must read content
   */
  async getFirstMustReadContentDetails(
    peopleId: string,
    options?: {
      size?: number;
      sortBy?: string;
      isMustRead?: boolean;
    }
  ): Promise<{ siteId: string; contentId: string; contentType: string }> {
    const mustReadContentList = await this.getMustReadContentList(peopleId, options);

    // Verify that we have at least one must read content
    if (!mustReadContentList.result?.listOfItems || mustReadContentList.result.listOfItems.length === 0) {
      throw new Error(
        'No must read content found. Please ensure there is at least one must read content in the system.'
      );
    }

    // Get the first content item from the list
    const firstContent = mustReadContentList.result.listOfItems[0];
    const siteId = firstContent.site.siteId;
    const contentId = firstContent.contentId || firstContent.id;
    const contentType = firstContent.type.toLowerCase();

    return { siteId, contentId, contentType };
  }

  /**
   * Creates a new page in a site and returns the full API response
   * @param siteId - The ID of the site
   * @param contentInfo - The content type information
   * @param options - Optional configuration object
   * @returns The full page creation response
   */
  async createPageWithCompleteResponse(params: {
    siteId: string;
    contentInfo: { contentType: string; contentSubType: string };
    options?: {
      pageName?: string;
      contentDescription?: string;
      listOfTopics?: string[];
    };
  }): Promise<any> {
    return await test.step('Creating page and getting complete response', async () => {
      const { siteId, contentInfo, options = {} } = params;
      const pageCategory = await this.contentManagementService.getPageCategoryID(siteId);
      const finalPageName = options.pageName || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Page`;
      const finalContentDescription = options.contentDescription || 'AutomatePageDescription';
      const contentText = finalContentDescription;

      // Get topic IDs for the topics if provided
      let topicObjects: { id: string; name: string }[] = [];
      if (options.listOfTopics && options.listOfTopics.length > 0) {
        const topicList = await this.contentManagementService.getTopicList();
        topicObjects = options.listOfTopics.map(topicName => {
          const topic = topicList.result?.listOfItems?.find(t => t.name === topicName);
          return {
            id: topic?.topic_id || '',
            name: topicName,
          };
        });
      }

      // Build payload matching the service method structure exactly
      const payload = {
        contentSubType: contentInfo.contentSubType,
        listOfFiles: [],
        publishAt: new Date().toISOString(),
        body: `{"type":"doc","content":[{"type":"paragraph","attrs":{"indentation":0,"textAlign":"left","className":"","data-sw-sid":null},"content":[{"type":"text","text":"${contentText}"}]}]}`,
        imgCaption: '',
        publishingStatus: 'immediate',
        bodyHtml: `<p indentation="0" textAlign="left" class="">${contentText}</p>`,
        imgLayout: 'small',
        title: finalPageName,
        language: 'en-US',
        isFeedEnabled: true,
        listOfTopics: topicObjects,
        category: {
          id: pageCategory.categoryId,
          name: pageCategory.name,
        },
        contentType: contentInfo.contentType,
        isNewTiptap: false,
      };

      const response = await this.contentManagementService.httpClient.post(
        API_ENDPOINTS.site.url + '/' + siteId + API_ENDPOINTS.content.publish,
        {
          data: {
            contentSubType: payload.contentSubType,
            listOfFiles: payload.listOfFiles,
            publishAt: payload.publishAt,
            body: payload.body,
            imgCaption: payload.imgCaption,
            publishingStatus: payload.publishingStatus,
            bodyHtml: payload.bodyHtml,
            imgLayout: payload.imgLayout,
            title: payload.title,
            language: payload.language,
            isFeedEnabled: payload.isFeedEnabled,
            listOfTopics: payload.listOfTopics,
            category: {
              id: payload.category.id,
              name: payload.category.name,
            },
            contentType: payload.contentType,
            isNewTiptap: payload.isNewTiptap,
          },
        }
      );

      const json = await response.json();
      if (json.status !== 'success' || !json.result?.id) {
        throw new Error(`Page creation failed. Response: ${JSON.stringify(json)}`);
      }

      // Track content for cleanup
      this.content.push({ siteId, contentId: json.result.id });

      return json;
    });
  }

  /**
   * Creates a new event in a site and returns the full API response
   * @param siteId - The ID of the site
   * @param contentInfo - The content type information
   * @param options - Optional configuration object
   * @returns The full event creation response
   */
  async createEventWithCompleteResponse(params: {
    siteId: string;
    contentInfo: { contentType: string };
    options?: {
      eventName?: string;
      contentDescription?: string;
      location?: string;
      listOfTopics?: string[];
    };
  }): Promise<any> {
    return await test.step('Creating event and getting complete response', async () => {
      const { siteId, contentInfo, options = {} } = params;
      const finalEventName = options.eventName || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Event`;
      const finalContentDescription = options.contentDescription || 'AutomateEventDescription';
      const finalLocation = options.location || 'Gurgaon';
      const contentText = finalContentDescription;

      // Get topic IDs for the topics if provided
      let topicObjects: { id: string; name: string }[] = [];
      if (options.listOfTopics && options.listOfTopics.length > 0) {
        const topicList = await this.contentManagementService.getTopicList();
        topicObjects = options.listOfTopics.map(topicName => {
          const topic = topicList.result?.listOfItems?.find(t => t.name === topicName);
          return {
            id: topic?.topic_id || '',
            name: topicName,
          };
        });
      }

      const response = await this.contentManagementService.httpClient.post(
        API_ENDPOINTS.site.url + '/' + siteId + API_ENDPOINTS.content.publish,
        {
          data: {
            listOfFiles: [],
            publishAt: new Date().toISOString(),
            body: `{"type":"doc","content":[{"type":"paragraph","attrs":{"indentation":0,"textAlign":"left","className":"","data-sw-sid":null},"content":[{"type":"text","text":"${contentText}"}]}]}`,
            imgCaption: '',
            startsAt: getTodayDateIsoString(),
            isAllDay: false,
            publishingStatus: 'immediate',
            endsAt: getTomorrowDateIsoString(),
            timezoneIso: 'Asia/Kolkata',
            bodyHtml: `<p indentation="0" textAlign="left" class="">${contentText}</p>`,
            imgLayout: 'small',
            directions: [],
            location: finalLocation,
            title: finalEventName,
            language: 'en-US',
            isFeedEnabled: true,
            listOfTopics: topicObjects,
            contentType: contentInfo.contentType,
            isNewTiptap: false,
          },
        }
      );

      const json = await response.json();
      if (json.status !== 'success' || !json.result?.id) {
        throw new Error(`Event creation failed. Response: ${JSON.stringify(json)}`);
      }

      // Track content for cleanup
      this.content.push({ siteId, contentId: json.result.id });

      return json;
    });
  }

  /**
   * Creates a new album in a site and returns the full API response
   * @param siteId - The ID of the site
   * @param imageName - The name of the image file to upload
   * @param options - Optional configuration object
   * @returns The full album creation response
   */
  async createAlbumWithCompleteResponse(params: {
    siteId: string;
    imageName: string;
    options?: {
      albumName?: string;
      contentDescription?: string;
      listOfTopics?: string[];
    };
  }): Promise<any> {
    return await test.step('Creating album and getting complete response', async () => {
      const { siteId, imageName, options = {} } = params;
      const fileId = await this.imageUploaderService.uploadImageAndGetFileId(imageName);
      const finalAlbumName = options.albumName || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Album`;
      const finalContentDescription = options.contentDescription || 'AutomateAlbumDescription';
      const contentText = finalContentDescription;

      // Get topic IDs for the topics if provided
      let topicObjects: { id: string; name: string }[] = [];
      if (options.listOfTopics && options.listOfTopics.length > 0) {
        const topicList = await this.contentManagementService.getTopicList();
        topicObjects = options.listOfTopics.map(topicName => {
          const topic = topicList.result?.listOfItems?.find(t => t.name === topicName);
          return {
            id: topic?.topic_id || '',
            name: topicName,
          };
        });
      }

      const response = await this.contentManagementService.httpClient.post(
        API_ENDPOINTS.site.url + '/' + siteId + API_ENDPOINTS.content.publish,
        {
          data: {
            listOfFiles: [],
            publishAt: new Date().toISOString(),
            body: `{"type":"doc","content":[{"type":"paragraph","attrs":{"Paragraphclass":"","textAlign":"left","indent":null},"content":[{"type":"text","text":"${contentText}"}]}],"hasInlineImages":true}`,
            imgCaption: '',
            publishingStatus: 'immediate',
            bodyHtml: `<p>${contentText}</p>`,
            imgLayout: 'small',
            title: finalAlbumName,
            language: 'en-US',
            isFeedEnabled: true,
            listOfTopics: topicObjects,
            contentType: 'album',
            isNewTiptap: false,
            coverImageMediaId: fileId,
            listOfAlbumMedia: [{ id: fileId, description: '' }],
          },
        }
      );

      const json = await response.json();
      if (json.status !== 'success' || !json.result?.id) {
        throw new Error(`Album creation failed. Response: ${JSON.stringify(json)}`);
      }

      // Track content for cleanup
      this.content.push({ siteId, contentId: json.result.id });

      return json;
    });
  }
}
