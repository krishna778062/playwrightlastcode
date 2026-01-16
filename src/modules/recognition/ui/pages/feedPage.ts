import { expect, Locator, Page, test } from '@playwright/test';
import { getRecognitionTenantConfigFromCache } from '@recognition/config/recognitionConfig';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

export class FeedPage extends BasePage {
  readonly shareThoughtsButton: Locator;
  readonly viewRecognitionLink: Locator;
  feedPostCards: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.HOME_PAGE) {
    super(page, pageUrl);
    this.shareThoughtsButton = page.getByText('Share your thoughts', { exact: false });
    this.feedPostCards = page.locator('[class^=Recognition_panelInner]');
    this.viewRecognitionLink = page.getByRole('link', { name: /View recognition/i }).first();
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
  async navigateFeedPageViaEndpoint(
    endpoint: string,
    feedType?: 'home feed' | 'site feed',
    siteName?: string
  ): Promise<void> {
    await test.step(`Navigating to ${endpoint} via endpoint`, async () => {
      const url = getRecognitionTenantConfigFromCache().frontendBaseUrl + endpoint;
      await this.page.goto(url);
      if (feedType === 'site feed') {
        const targetSite = siteName ?? (getRecognitionTenantConfigFromCache() as any).siteName ?? '';
        const siteLink = this.page.getByRole('link', { name: new RegExp(targetSite, 'i') }).first();
        await expect(siteLink, 'Target site link should be visible').toBeVisible({ timeout: TIMEOUTS.LONG });
        await siteLink.click({ timeout: TIMEOUTS.MEDIUM });
        await this.page.waitForURL(/\/site\/[^/]+\/dashboard/, { timeout: TIMEOUTS.LONG });
      }
      await this.verifyThePageIsLoaded();
    });
  }

  async clickViewRecognitionLinkOnFeedPage(
    postIndex: number,
    _feedType: 'home feed' | 'site feed',
    _siteName?: string
  ): Promise<void> {
    await test.step('Click on View Recognition link on feed page', async () => {
      const feedPostCard = this.feedPostCards.nth(postIndex);
      await feedPostCard.scrollIntoViewIfNeeded();
      const viewRecognitionLink = feedPostCard.getByRole('link', { name: /View recognition/i });
      await expect(
        viewRecognitionLink,
        'View recognition link should be visible for the specific shared recognition post'
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(
        viewRecognitionLink,
        'View recognition link should be visible for the specific shared recognition post'
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.clickOnElement(viewRecognitionLink, {
        timeout: TIMEOUTS.MEDIUM,
        stepInfo: 'Clicking on View recognition link for the specific shared recognition post',
      });
    });
  }
}
