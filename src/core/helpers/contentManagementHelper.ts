import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { EnterpriseSearchHelper } from '@/src/core/helpers/enterpriseSearchHelper';
import { buildBodyAndBodyHtml } from '@/src/core/api/services/ContentManagementService';
import { faker } from '@faker-js/faker';
import { getTodayDateIsoString, getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';

interface Content {
  siteId: string;
  contentId: string;
}

export class ContentManagementHelper {
  private content: Content[] = [];

  constructor(private appManagerApiClient: AppManagerApiClient) {}

  /**
   * Creates a new site and a new album within that site.
   * @param siteName - The name for the new site.
   * @param category - The site category object, containing name and categoryId.
   * @param imageName - The name of the image file to be uploaded as the album's cover.
   * @returns An object containing details of the created album and site.
   */
  async createAlbum(siteName: string, category: { name: string, categoryId: string }, imageName: string) {
    const siteResult = await this.appManagerApiClient.getSiteManagementService().addNewSite({
      access: 'public',
      name: siteName,
      category: {
        categoryId: category.categoryId,
        name: category.name,
      },
    });
    const siteId = siteResult.siteId;

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
    
    const createdContent = { siteId, contentId: albumResult.albumId, albumName, authorName: albumResult.authorName, contentDescription };
    this.content.push({ siteId, contentId: albumResult.albumId });

    return createdContent;
  }

  /**
   * Creates a new site and a new page within that site.
   * @param siteName - The name for the new site.
   * @param category - The site category object, containing name and categoryId.
   * @param contentInfo - An object containing contentType and contentSubType for the page.
   * @returns An object containing details of the created page and site.
   */
  async createPage(siteName: string, category: { name: string, categoryId: string }, contentInfo: { contentType: string, contentSubType: string }) {
    const siteResult = await this.appManagerApiClient.getSiteManagementService().addNewSite({
      access: 'public',
      name: siteName,
      category: {
        categoryId: category.categoryId,
        name: category.name,
      },
    });
    const siteId = siteResult.siteId;
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
        name: pageCategory.name
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
    
    const createdContent = { siteId, contentId: pageResult.pageId, pageName, authorName: pageResult.authorName, contentDescription };
    this.content.push({ siteId, contentId: pageResult.pageId });

    return createdContent;
  }

  /**
   * Creates a new site and a new event within that site.
   * @param siteName - The name for the new site.
   * @param category - The site category object, containing name and categoryId.
   * @param contentInfo - An object containing the contentType for the event.
   * @returns An object containing details of the created event and site.
   */
  async createEvent(siteName: string, category: { name: string, categoryId: string }, contentInfo: { contentType: string }) {
    const siteResult = await this.appManagerApiClient.getSiteManagementService().addNewSite({
      access: 'public',
      name: siteName,
      category: {
        categoryId: category.categoryId,
        name: category.name,
      },
    });
    const siteId = siteResult.siteId;

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
    
    const createdContent = { siteId, contentId: eventResult.eventId, eventName, authorName: eventResult.authorName, contentDescription };
    this.content.push({ siteId, contentId: eventResult.eventId });

    return createdContent;
  }

  /**
   * Cleans up all content (albums, pages, events) and sites created by this helper instance.
   */
  async cleanup() {
    for (const { siteId, contentId } of this.content) {
      if (contentId) {
        await this.appManagerApiClient.getContentManagementService().deleteContent(siteId, contentId);
      }
      if (siteId) {
        await this.appManagerApiClient.getSiteManagementService().deactivateSite(siteId);
      }
    }
  }
} 