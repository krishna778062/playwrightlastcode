import { APIRequestContext, test } from '@playwright/test';

import { log } from '@core/utils/logger';

import { CarouselService } from '@/src/modules/content/apis/services/CarouselService';

export class CarouselHelper {
  readonly carouselService: CarouselService;

  constructor(
    readonly apiRequestContext: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.carouselService = new CarouselService(apiRequestContext, baseUrl);
  }

  /**
   * Gets the list of carousel items for a site
   * @param siteId - The site ID to get carousel items from
   * @returns Promise containing the carousel items list
   */
  async getSiteCarouselItems(siteId: string): Promise<any> {
    return await test.step(`Getting carousel items for site: ${siteId}`, async () => {
      return await this.carouselService.getSiteCarouselItems(siteId);
    });
  }

  /**
   * Gets the list of home carousel items
   * @returns Promise containing the carousel items list
   */
  async getHomeCarouselItems(): Promise<any> {
    return await test.step('Getting home carousel items', async () => {
      return await this.carouselService.getHomeCarouselItems();
    });
  }

  /**
   * Adds a content item to the home carousel
   * @param contentId - The content ID to add to carousel
   * @param itemType - The type of item (default: 'content')
   * @returns Promise containing the add response
   */
  async addHomeCarouselItem(contentId: string, itemType: string = 'content'): Promise<any> {
    return await test.step(`Adding content ${contentId} to home carousel`, async () => {
      return await this.carouselService.addHomeCarouselItem(contentId, itemType);
    });
  }

  /**
   * Adds a content item to a site carousel
   * @param siteId - The site ID
   * @param contentId - The content ID to add to carousel
   * @param itemType - The type of item (default: 'content')
   * @returns Promise containing the add response
   */
  async addSiteCarouselItem(siteId: string, contentId: string, itemType: string = 'content'): Promise<any> {
    return await test.step(`Adding content ${contentId} to site ${siteId} carousel`, async () => {
      return await this.carouselService.addSiteCarouselItem(siteId, contentId, itemType);
    });
  }

  /**
   * Removes a specific carousel item from a site
   * @param siteId - The site ID containing the carousel item
   * @param carouselItemId - The carousel item ID to remove
   * @returns Promise containing the delete response
   */
  async removeSiteCarouselItem(siteId: string, carouselItemId: string): Promise<any> {
    return await test.step(`Removing carousel item ${carouselItemId} from site ${siteId}`, async () => {
      return await this.carouselService.deleteSiteCarouselItem(siteId, carouselItemId);
    });
  }

  /**
   * Removes a specific carousel item from home dashboard
   * @param carouselItemId - The carousel item ID to remove
   * @returns Promise containing the delete response
   */
  async removeHomeCarouselItem(carouselItemId: string): Promise<any> {
    return await test.step(`Removing home carousel item ${carouselItemId}`, async () => {
      return await this.carouselService.deleteHomeCarouselItem(carouselItemId);
    });
  }

  /**
   * Gets the list of carousel items for a site and removes them all
   * @param siteId - The site ID to get carousel items from
   * @returns Promise containing the number of items removed
   */
  async getAndRemoveAllCarouselItems(siteId: string): Promise<number> {
    return await test.step(`Getting and removing all carousel items for site: ${siteId}`, async () => {
      // Get the list of carousel items
      const carouselResponse = await this.carouselService.getSiteCarouselItems(siteId);

      if (!carouselResponse.result?.listOfItems?.length) {
        log.debug('No carousel items found');
        return 0;
      }

      const carouselItems = carouselResponse.result.listOfItems;
      log.debug(`Found ${carouselItems.length} carousel items to remove`);

      let removedCount = 0;

      // Remove each carousel item
      for (const item of carouselItems) {
        try {
          await this.carouselService.deleteSiteCarouselItem(siteId, item.carouselItemId);
          log.debug(`Successfully removed carousel item: ${item.carouselItemId}`);
          removedCount++;
        } catch (error) {
          log.error(`Failed to remove carousel item ${item.carouselItemId}`, error);
          // Continue with other items even if one fails
        }
      }

      log.debug(`Successfully removed ${removedCount} out of ${carouselItems.length} carousel items`);
      return removedCount;
    });
  }

  /**
   * Gets the list of home carousel items and removes them all
   * @returns Promise containing the number of items removed
   */
  async getAndRemoveAllHomeCarouselItems(): Promise<number> {
    return await test.step('Getting and removing all home carousel items', async () => {
      // Get the list of home carousel items
      const carouselResponse = await this.carouselService.getHomeCarouselItems();

      if (!carouselResponse.result?.listOfItems?.length) {
        log.debug('No home carousel items found');
        return 0;
      }

      const carouselItems = carouselResponse.result.listOfItems;
      log.debug(`Found ${carouselItems.length} home carousel items to remove`);

      let removedCount = 0;

      // Remove each carousel item
      for (const item of carouselItems) {
        try {
          await this.carouselService.deleteHomeCarouselItem(item.carouselItemId);
          log.debug(`Successfully removed home carousel item: ${item.carouselItemId}`);
          removedCount++;
        } catch (error) {
          log.error(`Failed to remove home carousel item ${item.carouselItemId}`, error);
          // Continue with other items even if one fails
        }
      }

      log.debug(`Successfully removed ${removedCount} out of ${carouselItems.length} home carousel items`);
      return removedCount;
    });
  }
}
