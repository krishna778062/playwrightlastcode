import { faker } from '@faker-js/faker';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { buildBodyAndBodyHtml } from '@/src/core/api/services/ContentManagementService';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { getTodayDateIsoString, getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

interface Content {
  siteId: string;
  contentId: string;
}

export class ContentManagementHelper {
  private content: Content[] = [];

  constructor(private appManagerApiClient: AppManagerApiClient) {}

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
    const fileId = await this.appManagerApiClient.getImageUploaderService().uploadImageAndGetFileId(params.imageName);
    const finalAlbumName =
      params.options?.albumName || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Album`;
    const finalContentDescription = params.options?.contentDescription || 'AutomateAlbumDescription';
    const { body, bodyHtml } = buildBodyAndBodyHtml(finalContentDescription, 'album');
    const albumResult = await this.appManagerApiClient.getContentManagementService().addNewAlbumContent(params.siteId, {
      title: finalAlbumName,
      body,
      bodyHtml,
      publishAt: getTodayDateIsoString(),
      coverImageMediaId: fileId,
      listOfAlbumMedia: [{ id: fileId, description: '' }],
    });
    await EnterpriseSearchHelper.waitForResultToAppearInApiResponse({
      apiClient: this.appManagerApiClient,
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
   * @param options - Optional configuration object with pageName and contentDescription
   */
  async createPage(params: {
    siteId: string;
    contentInfo: { contentType: string; contentSubType: string };
    options?: { pageName?: string; contentDescription?: string; waitForSearchIndex?: boolean };
  }) {
    const { siteId, contentInfo, options = {} } = params;
    const pageCategory = await this.appManagerApiClient.getContentManagementService().getPageCategoryID(siteId);
    const finalPageName = options.pageName || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Page`;
    const finalContentDescription = options.contentDescription || 'AutomatePageDescription';
    const { body, bodyHtml } = buildBodyAndBodyHtml(finalContentDescription, 'page');
    const pageResult = await this.appManagerApiClient.getContentManagementService().addNewPageContent(siteId, {
      title: finalPageName,
      body,
      bodyHtml,
      category: {
        id: pageCategory.categoryId,
        name: pageCategory.name,
      },
      contentType: contentInfo.contentType,
      contentSubType: contentInfo.contentSubType,
    });

    if (options.waitForSearchIndex) {
      await EnterpriseSearchHelper.waitForResultToAppearInApiResponse({
        apiClient: this.appManagerApiClient,
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
    };
    this.content.push({ siteId, contentId: pageResult.pageId });
    return { ...createdContent };
  }

  /**
   * Creates a new event in an existing site
   * @param siteId - The ID of the existing site
   * @param contentInfo - The content type information
   * @param options - Optional configuration object with eventName, contentDescription, and location
   */
  async createEvent(params: {
    siteId: string;
    contentInfo: { contentType: string };
    options?: { eventName?: string; contentDescription?: string; location?: string };
  }) {
    const { siteId, contentInfo, options = {} } = params;
    const finalEventName = options.eventName || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Event`;
    const finalContentDescription = options.contentDescription || 'AutomateEventDescription';
    const finalLocation = options.location || 'Gurgaon';
    const { body, bodyHtml } = buildBodyAndBodyHtml(finalContentDescription, 'event');
    const eventResult = await this.appManagerApiClient.getContentManagementService().addNewEventContent(siteId, {
      title: finalEventName,
      body,
      bodyHtml,
      contentType: contentInfo.contentType,
      startsAt: getTodayDateIsoString(),
      endsAt: getTomorrowDateIsoString(),
      timezoneIso: 'Asia/Kolkata',
      location: finalLocation,
    });
    await EnterpriseSearchHelper.waitForResultToAppearInApiResponse({
      apiClient: this.appManagerApiClient,
      searchTerm: finalEventName,
      objectType: 'content',
    });
    const createdContent = {
      siteId,
      contentId: eventResult.eventId,
      eventName: finalEventName,
      authorName: eventResult.authorName,
      contentDescription: finalContentDescription,
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
        await this.appManagerApiClient.getContentManagementService().deleteContent(siteId, contentId);
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
    return await this.appManagerApiClient.getContentManagementService().getTopicList();
  }

  /**
   * Cleans up all content (albums, pages, events) created by this helper instance.
   * Note: Site cleanup is handled by the siteManagementHelper fixture at worker level.
   */
  async cleanup() {
    for (const { siteId, contentId } of this.content) {
      if (contentId) {
        await this.appManagerApiClient.getContentManagementService().deleteContent(siteId, contentId);
      }
    }
  }
}
