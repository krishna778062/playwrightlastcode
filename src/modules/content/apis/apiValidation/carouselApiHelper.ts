import { expect, test } from '@playwright/test';

export class CarouselApiHelper {
  /**
   * Validates app governance configuration response for carousel operations
   * @param response - The API response from configureAppGovernance
   */
  async validateAppGovernanceResponse(response: any): Promise<void> {
    await test.step('Validate app governance configuration response', async () => {
      expect(response.status, 'Status should be 200').toBe(200);
      expect(response.message, 'Message should be SUCCESS').toBe('SUCCESS');
      expect(response.result, 'Result should be present').toBeTruthy();
    });
  }

  /**
   * Validates that home carousel is enabled with retry
   * @param getConfigFn - Function that returns the app configuration
   * @param timeout - Maximum timeout in milliseconds (default: 10000)
   */
  async validateHomeCarouselEnabled(getConfigFn: () => Promise<any>, timeout: number = 10000): Promise<void> {
    await test.step('Validate home carousel is enabled', async () => {
      await expect
        .poll(
          async () => {
            const config = await getConfigFn();
            return config.result.isHomeCarouselEnabled;
          },
          { timeout, intervals: [500, 1000, 2000] }
        )
        .toBe(true);
    });
  }

  /**
   * Validates that home carousel is disabled with retry
   * @param getConfigFn - Function that returns the app configuration
   * @param timeout - Maximum timeout in milliseconds (default: 10000)
   */
  async validateHomeCarouselDisabled(getConfigFn: () => Promise<any>, timeout: number = 10000): Promise<void> {
    await test.step('Validate home carousel is disabled', async () => {
      await expect
        .poll(
          async () => {
            const config = await getConfigFn();
            return config.result.isHomeCarouselEnabled;
          },
          { timeout, intervals: [500, 1000, 2000] }
        )
        .toBe(false);
    });
  }

  /**
   * Validates carousel item add response
   * @param addResponse - The carousel item add response
   */
  async validateCarouselItemAddResponse(addResponse: any): Promise<void> {
    await test.step('Validate carousel item add response', async () => {
      expect(addResponse.status, 'Status should be success').toBe('success');
      expect(addResponse.result, 'Result should be present').toBeTruthy();
      expect(addResponse.result.carouselItemId, 'Carousel item ID should be present').toBeTruthy();
    });
  }

  /**
   * Validates that a carousel item is present in the carousel items list
   * @param carouselItemsResponse - The carousel items list response
   * @param contentId - The content ID to verify
   */
  async validateCarouselItemInList(carouselItemsResponse: any, contentId: string): Promise<void> {
    await test.step('Validate carousel item is in list', async () => {
      expect(carouselItemsResponse.status, 'Status should be success').toBe('success');
      expect(carouselItemsResponse.result, 'Result should be present').toBeTruthy();
      expect(carouselItemsResponse.result.listOfItems, 'listOfItems should be an array').toBeTruthy();
      expect(Array.isArray(carouselItemsResponse.result.listOfItems), 'listOfItems should be an array').toBe(true);

      const itemFound = carouselItemsResponse.result.listOfItems.some(
        (item: any) => item.item?.id === contentId || item.contentId === contentId
      );
      expect(itemFound, `Carousel item with content ID ${contentId} should be present in the list`).toBe(true);
    });
  }

  /**
   * Validates that a carousel item is not present in the carousel items list
   * @param carouselItemsResponse - The carousel items list response
   * @param contentId - The content ID to verify
   */
  async validateCarouselItemNotInList(carouselItemsResponse: any, contentId: string): Promise<void> {
    await test.step('Validate carousel item is not in list', async () => {
      expect(carouselItemsResponse.status, 'Status should be success').toBe('success');
      expect(carouselItemsResponse.result, 'Result should be present').toBeTruthy();
      expect(carouselItemsResponse.result.listOfItems, 'listOfItems should be an array').toBeTruthy();

      const itemFound = carouselItemsResponse.result.listOfItems.some(
        (item: any) => item.item?.id === contentId || item.contentId === contentId
      );
      expect(itemFound, `Carousel item with content ID ${contentId} should not be present in the list`).toBe(false);
    });
  }

  /**
   * Validates carousel item deletion response
   * @param deleteResponse - The delete response
   */
  async validateCarouselItemDeletionResponse(deleteResponse: any): Promise<void> {
    await test.step('Validate carousel item deletion response', async () => {
      expect(deleteResponse.status, 'Status should be success').toBe('success');
    });
  }

  /**
   * Validates site carousel is enabled with retry
   * @param getConfigFn - Function that returns the app configuration
   * @param timeout - Maximum timeout in milliseconds (default: 10000)
   */
  async validateSiteCarouselEnabled(getConfigFn: () => Promise<any>, timeout: number = 10000): Promise<void> {
    await test.step('Validate site carousel is enabled', async () => {
      await expect
        .poll(
          async () => {
            const config = await getConfigFn();
            return config.result.isSiteCarouselEnabled;
          },
          { timeout, intervals: [500, 1000, 2000] }
        )
        .toBe(true);
    });
  }

  /**
   * Validates site carousel is disabled with retry
   * @param getConfigFn - Function that returns the app configuration
   * @param timeout - Maximum timeout in milliseconds (default: 10000)
   */
  async validateSiteCarouselDisabled(getConfigFn: () => Promise<any>, timeout: number = 10000): Promise<void> {
    await test.step('Validate site carousel is disabled', async () => {
      await expect
        .poll(
          async () => {
            const config = await getConfigFn();
            return config.result.isSiteCarouselEnabled;
          },
          { timeout, intervals: [500, 1000, 2000] }
        )
        .toBe(false);
    });
  }
}
