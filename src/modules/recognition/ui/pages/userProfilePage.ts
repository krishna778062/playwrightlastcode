import { expect, Locator, Page, test } from '@playwright/test';
import { getRecognitionTenantConfigFromCache } from '@recognition/config/recognitionConfig';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

export class UserProfilePage extends BasePage {
  readonly recognitionAwardsHeader: Locator;
  readonly awardTitleCards: Locator;
  readonly viewRecognitionLink: Locator;
  readonly viewProfileLink: Locator;
  readonly profileAvatarButton: Locator;
  readonly recognizeButton: Locator;
  readonly viewAllRecognitionButton: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.HOME_PAGE) {
    super(page, pageUrl);
    this.profileAvatarButton = page.locator('#site-header [class*="avatar"] button');
    this.viewProfileLink = page.getByRole('link', { name: /View profile/i }).first();
    this.recognitionAwardsHeader = page.getByRole('heading', { name: 'Recognition & awards' });
    this.awardTitleCards = page.locator('[class*="Utils_contentWrapper"] a h4');
    this.viewRecognitionLink = page.getByRole('link', { name: /View recognition/i }).first();
    this.recognizeButton = page.getByRole('button', { name: 'Recognize' }).first();
    this.viewAllRecognitionButton = page.getByText(/view all recognition/i);
  }

  /**
   * Verify that the user profile page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying user profile page is loaded', async () => {
      await expect(this.recognitionAwardsHeader, 'expecting Recognition & awards header to be visible').toBeVisible({
        timeout: TIMEOUTS.LONG,
      });
    });
  }

  /**
   * Navigate to received award from user profile
   */
  async navigateToReceivedAwardFromUserProfile(awardName: string, awardType?: string): Promise<void> {
    await test.step(`Open received award "${awardName}" of type "${awardType}" from user profile`, async () => {
      await this.verifyThePageIsLoaded();
      if ((await this.viewAllRecognitionButton.count()) > 0) {
        await this.viewAllRecognitionButton.scrollIntoViewIfNeeded();
        await this.clickOnElement(this.viewAllRecognitionButton, {
          stepInfo: 'Clicking on View all recognition button',
        });
      }
      await expect
        .poll(async () => this.awardTitleCards.count(), {
          message: 'Award cards should be visible on user profile',
          timeout: TIMEOUTS.MEDIUM,
        })
        .toBeGreaterThan(0);

      const cardCount = await this.awardTitleCards.count();
      for (let i = 0; i < cardCount; i += 1) {
        const title = (await this.awardTitleCards.nth(i).innerText()).trim();
        if (title === awardName) {
          // h4 sits inside anchor; click the anchor to open the award
          await this.awardTitleCards.nth(i).locator('..').click();
          return;
        }
      }
      expect.soft(false, `Award "${awardName}" of type "${awardType}" was not found on user profile`).toBeTruthy();
    });
  }

  /**
   * Navigate to recognition post from user profile
   */
  async navigateToRecognitionPostFromUserProfile(): Promise<void> {
    await test.step('Navigate to recognition link from user profile', async () => {
      await this.viewRecognitionLink.waitFor({ state: 'visible' });
      await expect(this.viewRecognitionLink, 'View recognition link should be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.clickOnElement(this.viewRecognitionLink.first(), {
        timeout: TIMEOUTS.VERY_SHORT,
        stepInfo: 'Clicking on View recognition link',
      });
    });
  }

  /**
   * Navigate to single user profile from Hub feed
   */
  async navigateToCurrentUserProfile(): Promise<void> {
    await test.step('Navigate to current user profile', async () => {
      await expect(this.profileAvatarButton.first(), 'Profile avatar should be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.clickOnElement(this.profileAvatarButton.first(), {
        timeout: TIMEOUTS.VERY_SHORT,
        stepInfo: 'Clicking on profile avatar button',
      });
      await expect(this.viewProfileLink.first(), 'View profile link should be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.clickOnElement(this.viewProfileLink.first(), {
        timeout: TIMEOUTS.VERY_SHORT,
        stepInfo: 'Clicking on view profile link',
      });
      await this.verifyThePageIsLoaded();
    });
  }

  async navigateToAnotherUserProfileViaUrl(userId: string, userName?: string): Promise<void> {
    await test.step(`Navigate to another user profile "${userName}"`, async () => {
      const url = getRecognitionTenantConfigFromCache().frontendBaseUrl + '/people/' + userId;
      await this.page.goto(url);
      await this.verifyThePageIsLoaded();
      await this.recognizeButton.waitFor({ state: 'visible', timeout: TIMEOUTS.VERY_LONG });
      await expect(this.recognizeButton, 'Recognize button in user profile should be visible').toBeVisible({
        timeout: TIMEOUTS.VERY_LONG,
      });
    });
  }
}
