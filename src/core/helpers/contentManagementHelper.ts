import { faker } from '@faker-js/faker';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { buildBodyAndBodyHtml } from '@/src/core/api/services/ContentManagementService';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { getTodayDateIsoString, getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';
import { SiteManagementHelper } from '@/src/core/helpers/siteManagementHelper';

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
   */
  async createSiteAndAlbum(categoryName: string, imageName: string) {
    const categoryObj = await this.appManagerApiClient.getSiteManagementService().getCategoryId(categoryName);
    const { siteId, siteName } = await this.siteHelper.createPublicSite(undefined, categoryObj);
    const fileId = await this.appManagerApiClient.getImageUploaderService().uploadImageAndGetFileId(imageName);
    const albumName = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Album`;
    const contentDescription = 'AutomateAlbumDescription';
    const { body, bodyHtml } = buildBodyAndBodyHtml(contentDescription, 'album');
    const albumResult = await this.appManagerApiClient.getContentManagementService().addNewAlbumContent(siteId, {
      title: albumName,
      body,
      bodyHtml,
      publishAt: getTodayDateIsoString(),
      coverImageMediaId: fileId,
      listOfAlbumMedia: [{ id: fileId, description: '' }],
    });
    await EnterpriseSearchHelper.waitForResultToAppearInApiResponse(
      this.appManagerApiClient,
      albumName,
      albumName,
      'content'
    );
    const createdContent = {
      siteId,
      contentId: albumResult.albumId,
      albumName,
      authorName: albumResult.authorName,
      contentDescription,
    };
    this.content.push({ siteId, contentId: albumResult.albumId });
    return { siteName, ...createdContent };
  }

  /**
   * Creates a new site (by category name) and a page within that site.
   * Returns site details along with the created page details.
   */
  async createSiteAndPage(categoryName: string, contentInfo: { contentType: string; contentSubType: string }) {
    const categoryObj = await this.appManagerApiClient.getSiteManagementService().getCategoryId(categoryName);
    const { siteId, siteName } = await this.siteHelper.createPublicSite(undefined, categoryObj);
    const pageCategory = await this.appManagerApiClient.getContentManagementService().getPageCategoryID(siteId);
    const pageName = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Page`;
    const contentDescription = 'AutomatePageDescription';
    const { body, bodyHtml } = buildBodyAndBodyHtml(contentDescription, 'page');
    const pageResult = await this.appManagerApiClient.getContentManagementService().addNewPageContent(siteId, {
      title: pageName,
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
      pageName,
      pageName,
      'content'
    );
    const createdContent = {
      siteId,
      contentId: pageResult.pageId,
      pageName,
      authorName: pageResult.authorName,
      contentDescription,
    };
    this.content.push({ siteId, contentId: pageResult.pageId });
    return { siteName, ...createdContent };
  }

  /**
   * Creates a new site (by category name) and an event within that site.
   * Returns site details along with the created event details.
   */
  async createSiteAndEvent(categoryName: string, contentInfo: { contentType: string }) {
    const categoryObj = await this.appManagerApiClient.getSiteManagementService().getCategoryId(categoryName);
    const { siteId, siteName } = await this.siteHelper.createPublicSite(undefined, categoryObj);
    const eventName = `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}Event`;
    const contentDescription = 'AutomateEventDescription';
    const { body, bodyHtml } = buildBodyAndBodyHtml(contentDescription, 'event');
    const eventResult = await this.appManagerApiClient.getContentManagementService().addNewEventContent(siteId, {
      title: eventName,
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
      eventName,
      eventName,
      'content'
    );
    const createdContent = {
      siteId,
      contentId: eventResult.eventId,
      eventName,
      authorName: eventResult.authorName,
      contentDescription,
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
