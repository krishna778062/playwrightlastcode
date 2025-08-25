import { faker } from '@faker-js/faker';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { buildBodyAndBodyHtml } from '@/src/core/api/services/ContentManagementService';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { getTodayDateIsoString, getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';
import { SiteManagementHelper } from '@/src/core/helpers/siteManagementHelper';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

interface Content {
  siteId: string;
  contentId: string;
}

export class ContentManagementHelper {
  private content: Content[] = [];

  constructor(
    private appManagerApiClient: AppManagerApiClient,
    private siteHelper: SiteManagementHelper = new SiteManagementHelper(appManagerApiClient)
  ) {}

  /**
   * Creates a new site (by category name) and an album within that site.
   * Returns site details along with the created album details.
   * @param categoryName - The name of the category for the site
   * @param imageName - The name of the image file to upload
   * @param options - Optional configuration object with albumName, contentDescription, and/or accessType
   */
  async createSiteAndAlbum(
    categoryName: string,
    imageName: string,
    options: { albumName?: string; contentDescription?: string; accessType?: SITE_TYPES } = {}
  ) {
    const categoryObj = await this.appManagerApiClient.getSiteManagementService().getCategoryId(categoryName);
    const { siteId, siteName } = await this.siteHelper.createSite({
      category: categoryObj,
      accessType: options.accessType || SITE_TYPES.PUBLIC,
    });
    const fileId = await this.appManagerApiClient.getImageUploaderService().uploadImageAndGetFileId(imageName);
    const finalAlbumName = options.albumName || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Album`;
    const finalContentDescription = options.contentDescription || 'AutomateAlbumDescription';
    const { body, bodyHtml } = buildBodyAndBodyHtml(finalContentDescription, 'album');
    const albumResult = await this.appManagerApiClient.getContentManagementService().addNewAlbumContent(siteId, {
      title: finalAlbumName,
      body,
      bodyHtml,
      publishAt: getTodayDateIsoString(),
      coverImageMediaId: fileId,
      listOfAlbumMedia: [{ id: fileId, description: '' }],
    });
    await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
      this.appManagerApiClient,
      finalAlbumName,
      finalAlbumName,
      'content'
    );
    const createdContent = {
      siteId,
      contentId: albumResult.albumId,
      albumName: finalAlbumName,
      authorName: albumResult.authorName,
      contentDescription: finalContentDescription,
    };
    this.content.push({ siteId, contentId: albumResult.albumId });
    return { siteName, ...createdContent };
  }

  /**
   * Creates a new site (by category name) and a page within that site.
   * Returns site details along with the created page details.
   * @param categoryName - The name of the category for the site
   * @param contentInfo - The content type information
   * @param options - Optional configuration object with pageName, contentDescription, and/or accessType
   */
  async createSiteAndPage(
    categoryName: string,
    contentInfo: { contentType: string; contentSubType: string },
    options: { pageName?: string; contentDescription?: string; accessType?: SITE_TYPES } = {}
  ) {
    const categoryObj = await this.appManagerApiClient.getSiteManagementService().getCategoryId(categoryName);
    const { siteId, siteName } = await this.siteHelper.createSite({
      category: categoryObj,
      accessType: options.accessType || SITE_TYPES.PUBLIC,
    });
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
    await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
      this.appManagerApiClient,
      finalPageName,
      finalPageName,
      'content'
    );
    const createdContent = {
      siteId,
      contentId: pageResult.pageId,
      pageName: finalPageName,
      authorName: pageResult.authorName,
      contentDescription: finalContentDescription,
    };
    this.content.push({ siteId, contentId: pageResult.pageId });
    return { siteName, ...createdContent };
  }

  /**
   * Creates a new site (by category name) and an event within that site.
   * Returns site details along with the created event details.
   * @param categoryName - The name of the category for the site
   * @param contentInfo - The content type information
   * @param options - Optional configuration object with eventName, contentDescription, and/or accessType
   */
  async createSiteAndEvent(
    categoryName: string,
    contentInfo: { contentType: string },
    options: { eventName?: string; contentDescription?: string; accessType?: SITE_TYPES } = {}
  ) {
    const categoryObj = await this.appManagerApiClient.getSiteManagementService().getCategoryId(categoryName);
    const { siteId, siteName } = await this.siteHelper.createSite({
      category: categoryObj,
      accessType: options.accessType || SITE_TYPES.PUBLIC,
    });
    const finalEventName = options.eventName || `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Event`;
    const finalContentDescription = options.contentDescription || 'AutomateEventDescription';
    const { body, bodyHtml } = buildBodyAndBodyHtml(finalContentDescription, 'event');
    const eventResult = await this.appManagerApiClient.getContentManagementService().addNewEventContent(siteId, {
      title: finalEventName,
      body,
      bodyHtml,
      contentType: contentInfo.contentType,
      startsAt: getTodayDateIsoString(),
      endsAt: getTomorrowDateIsoString(),
      timezoneIso: 'Asia/Kolkata',
      location: 'Gurgaon',
    });
    await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
      this.appManagerApiClient,
      finalEventName,
      finalEventName,
      'content'
    );
    const createdContent = {
      siteId,
      contentId: eventResult.eventId,
      eventName: finalEventName,
      authorName: eventResult.authorName,
      contentDescription: finalContentDescription,
    };
    this.content.push({ siteId, contentId: eventResult.eventId });
    return { siteName, ...createdContent };
  }

  /**
   * Cleans up all content (albums, pages, events) and sites created by this helper instance.
   */
  async cleanup() {
    for (const { siteId, contentId } of this.content) {
      if (contentId) {
        await this.appManagerApiClient.getContentManagementService().deleteContent(siteId, contentId);
      }
    }
    await this.siteHelper.cleanup();
  }
}
