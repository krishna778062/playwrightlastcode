import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

import { getEnvConfig } from '@/src/core/utils/getEnvConfig';

export class FeedPage extends BasePage {
  readonly shareThoughtsButton: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.HOME_PAGE) {
    super(page, pageUrl);
    this.shareThoughtsButton = page.getByText('Share your thoughts', { exact: false });
  }

  /**
   * Verify that the feed page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the feed page is loaded', async () => {
      await expect(this.shareThoughtsButton, 'expecting share thoughts button to be visible').toBeVisible({
        timeout: TIMEOUTS.LONG,
      });
    });
  }

  /**
   * Navigate to feed page via endpoint
   */
  async navigateFeedPageViaEndpoint(endpoint: string, feedType: string): Promise<void> {
    await test.step(`Navigating to ${endpoint} via endpoint`, async () => {
      if (feedType === 'site') {
        await this.page.goto(getEnvConfig().frontendBaseUrl + `/site/` + getEnvConfig().siteId);
      } else if (feedType === 'home') {
        await this.page.goto(getEnvConfig().frontendBaseUrl + getEnvConfig().apiBaseUrl);
      }
      await this.verifyThePageIsLoaded();
    });
  }
}
