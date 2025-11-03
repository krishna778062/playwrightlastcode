import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export class RecognitionHubPage extends BasePage {
  readonly recognitionHeader: Locator;
  readonly giveRecognition: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION) {
    super(page, pageUrl);
    this.recognitionHeader = page.getByRole('heading', { name: 'Recognition', exact: true });
    this.giveRecognition = page.locator('header').filter({ hasText: 'Give recognition' }).getByRole('button');
  }

  /**
   * Verify that the Recognition Hub page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the Recognition Hub is loaded', async () => {
      await expect(this.giveRecognition, 'expecting give recognition button to be visible').toBeVisible({
        timeout: TIMEOUTS.LONG,
      });
    });
  }

  /**
   * Navigate to Recognition Hub via endpoint
   */
  async navigateRecognitionHubViaEndpoint(endpoint: string): Promise<void> {
    await test.step(`Navigating to ${endpoint} via endpoint`, async () => {
      await this.page.goto(endpoint);
      await this.verifyThePageIsLoaded();
    });
  }
}
