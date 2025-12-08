import { APIRequestContext, test } from '@playwright/test';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { log } from '@core/utils/logger';

import { HttpClient } from '../../../../core/api/clients/httpClient';

import { ICarouselOperations } from '@/src/modules/content/apis/interfaces/ICarouselOperations';

export class CarouselService implements ICarouselOperations {
  public httpClient: HttpClient;
  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  /**
   * Gets the home carousel items list
   * @returns Promise containing the home carousel items response
   */
  async getHomeCarouselItems(): Promise<any> {
    return await test.step('Getting home carousel items', async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.content.homeCarouselItems, {
        data: {
          siteId: null,
        },
      });

      const responseBody = await response.json();
      log.debug('Home carousel items response', { response: JSON.stringify(responseBody, null, 2) });

      if (!response.ok()) {
        throw new Error(`Failed to get home carousel items. Status: ${response.status()}`);
      }

      return responseBody;
    });
  }

  /**
   * Gets the carousel items list for a specific site
   * @param siteId - The site ID to retrieve carousel items for
   * @returns Promise containing the carousel items response
   */
  async getSiteCarouselItems(siteId: string): Promise<any> {
    return await test.step(`Getting carousel items for site ID: ${siteId}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.site.carouselItems(siteId), {
        data: {
          siteId: siteId,
        },
      });

      const responseBody = await response.json();
      log.debug('Carousel items response', { response: JSON.stringify(responseBody, null, 2) });

      if (!response.ok()) {
        throw new Error(`Failed to get carousel items for ${siteId}. Status: ${response.status()}`);
      }

      return responseBody;
    });
  }

  /**
   * Adds a carousel item to the home dashboard
   * @param contentId - The content ID to add to carousel
   * @param itemType - The type of item (default: 'content')
   * @returns Promise containing the add response
   */
  async addHomeCarouselItem(contentId: string, itemType: string = 'content'): Promise<any> {
    return await test.step(`Adding home carousel item ${contentId}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.content.addHomeCarouselItem, {
        data: {
          siteId: null,
          itemType: itemType,
          item: {
            id: contentId,
          },
        },
      });

      const responseBody = await response.json();
      log.debug('Add home carousel item response', { response: JSON.stringify(responseBody, null, 2) });

      // Check for errors in response (even if status is 200)
      if (responseBody.errors && responseBody.errors.length > 0) {
        const errorMessage = responseBody.errors.map((e: any) => e.message || e.sub_message).join(', ');
        throw new Error(`Failed to add home carousel item ${contentId}. ${errorMessage}`);
      }

      if (!response.ok()) {
        throw new Error(`Failed to add home carousel item ${contentId}. Status: ${response.status()}`);
      }

      if (responseBody.status !== 'success') {
        throw new Error(`Add home carousel item failed. Response: ${JSON.stringify(responseBody)}`);
      }

      return responseBody;
    });
  }

  /**
   * Adds a carousel item to a site dashboard
   * @param siteId - The site ID
   * @param contentId - The content ID to add to carousel
   * @param itemType - The type of item (default: 'content')
   * @returns Promise containing the add response
   */
  async addSiteCarouselItem(siteId: string, contentId: string, itemType: string = 'content'): Promise<any> {
    return await test.step(`Adding site carousel item ${contentId} to site ${siteId}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.site.addSiteCarouselItem(siteId), {
        data: {
          siteId: siteId,
          itemType: itemType,
          item: {
            id: contentId,
          },
        },
      });

      const responseBody = await response.json();
      log.debug('Add site carousel item response', { response: JSON.stringify(responseBody, null, 2) });

      // Check for errors in response (even if status is 200)
      if (responseBody.errors && responseBody.errors.length > 0) {
        const errorMessage = responseBody.errors.map((e: any) => e.message || e.sub_message).join(', ');
        throw new Error(`Failed to add site carousel item ${contentId} to site ${siteId}. ${errorMessage}`);
      }

      if (!response.ok()) {
        throw new Error(
          `Failed to add site carousel item ${contentId} to site ${siteId}. Status: ${response.status()}`
        );
      }

      if (responseBody.status !== 'success' || (responseBody.errors && responseBody.errors.length > 0)) {
        const errorMessage =
          responseBody.errors && responseBody.errors.length > 0
            ? responseBody.errors.map((e: any) => e.message || e.sub_message).join(', ')
            : `Response: ${JSON.stringify(responseBody)}`;
        throw new Error(`Add site carousel item failed. ${errorMessage}`);
      }

      return responseBody;
    });
  }

  /**
   * Deletes a carousel item from a specific site
   * @param siteId - The site ID containing the carousel item
   * @param carouselItemId - The carousel item ID to delete
   * @returns Promise containing the delete response
   */
  async deleteSiteCarouselItem(siteId: string, carouselItemId: string): Promise<any> {
    return await test.step(`Deleting carousel item ${carouselItemId} from site ${siteId}`, async () => {
      const response = await this.httpClient.delete(API_ENDPOINTS.site.deleteCarouselItem(siteId, carouselItemId));

      const responseBody = await response.json();
      log.debug('Delete carousel item response', { response: JSON.stringify(responseBody, null, 2) });

      if (!response.ok()) {
        throw new Error(
          `Failed to delete carousel item ${carouselItemId} from site ${siteId}. Status: ${response.status()}`
        );
      }

      if (responseBody.status !== 'success') {
        throw new Error(`Delete carousel item failed. Response: ${JSON.stringify(responseBody)}`);
      }

      return responseBody;
    });
  }

  /**
   * Deletes a carousel item from the home dashboard
   * @param carouselItemId - The carousel item ID to delete
   * @returns Promise containing the delete response
   */
  async deleteHomeCarouselItem(carouselItemId: string): Promise<any> {
    return await test.step(`Deleting home carousel item ${carouselItemId}`, async () => {
      const response = await this.httpClient.delete(API_ENDPOINTS.content.deleteHomeCarouselItem(carouselItemId));

      const responseBody = await response.json();
      log.debug('Delete home carousel item response', { response: JSON.stringify(responseBody, null, 2) });

      if (!response.ok()) {
        throw new Error(`Failed to delete home carousel item ${carouselItemId}. Status: ${response.status()}`);
      }

      if (responseBody.status !== 'success') {
        throw new Error(`Delete home carousel item failed. Response: ${JSON.stringify(responseBody)}`);
      }

      return responseBody;
    });
  }
}
