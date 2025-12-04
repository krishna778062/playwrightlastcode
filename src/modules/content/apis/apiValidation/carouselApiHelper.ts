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
   * Validates that home carousel is enabled in the app configuration with retry logic
   * @param getConfigFn - Function that returns the app configuration
   * @param maxRetries - Maximum number of retries (default: 2)
   * @param retryDelay - Delay between retries in milliseconds (default: 2000)
   */
  async validateHomeCarouselEnabled(
    getConfigFn: () => Promise<any>,
    maxRetries: number = 2,
    retryDelay: number = 2000
  ): Promise<void> {
    await test.step(`Validate home carousel is enabled with retry (max ${maxRetries} attempts)`, async () => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const configResponse = await getConfigFn();
          expect(
            configResponse.result.isHomeCarouselEnabled,
            `isHomeCarouselEnabled should be true (attempt ${attempt + 1}/${maxRetries + 1})`
          ).toBe(true);
          return; // Success, exit the retry loop
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxRetries) {
            console.log(`Attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }

      // If we get here, all retries failed
      throw new Error(
        `Failed to validate home carousel is enabled after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`
      );
    });
  }

  /**
   * Validates that home carousel is disabled in the app configuration with retry logic
   * @param getConfigFn - Function that returns the app configuration
   * @param maxRetries - Maximum number of retries (default: 2)
   * @param retryDelay - Delay between retries in milliseconds (default: 2000)
   */
  async validateHomeCarouselDisabled(
    getConfigFn: () => Promise<any>,
    maxRetries: number = 2,
    retryDelay: number = 2000
  ): Promise<void> {
    await test.step(`Validate home carousel is disabled with retry (max ${maxRetries} attempts)`, async () => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const configResponse = await getConfigFn();
          expect(
            configResponse.result.isHomeCarouselEnabled,
            `isHomeCarouselEnabled should be false (attempt ${attempt + 1}/${maxRetries + 1})`
          ).toBe(false);
          return; // Success, exit the retry loop
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxRetries) {
            console.log(`Attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }

      // If we get here, all retries failed
      throw new Error(
        `Failed to validate home carousel is disabled after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`
      );
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
   * Validates that site carousel is enabled in the app configuration with retry logic
   * @param getConfigFn - Function that returns the app configuration
   * @param maxRetries - Maximum number of retries (default: 2)
   * @param retryDelay - Delay between retries in milliseconds (default: 2000)
   */
  async validateSiteCarouselEnabled(
    getConfigFn: () => Promise<any>,
    maxRetries: number = 2,
    retryDelay: number = 2000
  ): Promise<void> {
    await test.step(`Validate site carousel is enabled with retry (max ${maxRetries} attempts)`, async () => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const configResponse = await getConfigFn();
          expect(
            configResponse.result.isSiteCarouselEnabled,
            `isSiteCarouselEnabled should be true (attempt ${attempt + 1}/${maxRetries + 1})`
          ).toBe(true);
          return; // Success, exit the retry loop
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxRetries) {
            console.log(`Attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }

      // If we get here, all retries failed
      throw new Error(
        `Failed to validate site carousel is enabled after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`
      );
    });
  }

  /**
   * Validates that site carousel is disabled in the app configuration with retry logic
   * @param getConfigFn - Function that returns the app configuration
   * @param maxRetries - Maximum number of retries (default: 2)
   * @param retryDelay - Delay between retries in milliseconds (default: 2000)
   */
  async validateSiteCarouselDisabled(
    getConfigFn: () => Promise<any>,
    maxRetries: number = 2,
    retryDelay: number = 2000
  ): Promise<void> {
    await test.step(`Validate site carousel is disabled with retry (max ${maxRetries} attempts)`, async () => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const configResponse = await getConfigFn();
          expect(
            configResponse.result.isSiteCarouselEnabled,
            `isSiteCarouselEnabled should be false (attempt ${attempt + 1}/${maxRetries + 1})`
          ).toBe(false);
          return; // Success, exit the retry loop
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxRetries) {
            console.log(`Attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }

      // If we get here, all retries failed
      throw new Error(
        `Failed to validate site carousel is disabled after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`
      );
    });
  }
}
