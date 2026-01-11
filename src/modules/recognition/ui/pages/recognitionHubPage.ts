import { expect, Locator, Page, test } from '@playwright/test';
import { GiveRecognitionDialogBox } from '@recognition-components/give-recognition-dialog-box';
import { ManageRecognitionPage } from '@recognition-pages/manage/manageRecognitionPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';
export class RecognitionHubPage extends BasePage {
  readonly recognitionHeader: Locator;
  readonly giveRecognitionButton: Locator;
  readonly recognizeButton: Locator;
  readonly shareModal: Locator;
  readonly shareToFeedCheckbox: Locator;
  readonly shareToSlackCheckbox: Locator;
  readonly homeFeedOption: Locator;
  readonly siteFeedOption: Locator;
  readonly siteInputField: Locator;
  readonly siteSuggestionOption: Locator;
  readonly slackChannelInput: Locator;
  readonly shareButton: Locator;
  readonly skipButton: Locator;
  readonly feedPost: Locator;
  readonly feedPostMoreButton: Locator;
  readonly copyLinkMenuItem: Locator;
  readonly badgeIcon: Locator;
  readonly manageRecognitionPage: ManageRecognitionPage;
  readonly commentIcon: Locator;
  readonly commentInput: Locator;
  readonly commentSubmitButton: Locator;
  readonly commentCountIndicator: Locator;
  readonly commentItems: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION) {
    super(page, pageUrl);
    this.manageRecognitionPage = new ManageRecognitionPage(page);
    this.recognitionHeader = page.getByRole('heading', { name: 'Recognition', exact: true });
    this.giveRecognitionButton = page.locator('header').filter({ hasText: 'Give recognition' }).getByRole('button');
    this.recognizeButton = page.getByRole('button', { name: /recognize/i }).first();
    this.shareModal = page.locator('[data-testid="share-recognition-modal"], [role="dialog"]').first();
    this.shareToFeedCheckbox = page.locator('#shareToFeedAndSlack_shareToFeed');
    this.shareToSlackCheckbox = page.locator('#shareToFeedAndSlack_shareToSlack');
    this.homeFeedOption = page.locator('#feedNamehome');
    this.siteFeedOption = page.locator('#feedNamesite');
    this.siteInputField = page.locator('[data-testid="site-input"], input[name="siteName"], input[id*="siteInput"]');
    this.siteSuggestionOption = page.locator('[data-testid="site-suggestion"], [role="option"]');
    this.slackChannelInput = page.locator('[data-testid="slack-channel-input"], input[name="slackChannel"]');
    this.shareButton = page.getByRole('button', { name: /share/i }).first();
    this.skipButton = page.getByRole('button', { name: /skip/i }).first();

    this.feedPost = page.locator('[class^=Recognition_panelInner]');
    this.feedPostMoreButton = page.getByTestId('recognition_popover_launcher');
    this.copyLinkMenuItem = page.getByRole('menuitem', { name: /copy link/i }).first();
    this.badgeIcon = page.locator('[data-testid="award-icon"]');

    // Commenting locators
    this.commentIcon = page.getByRole('button', { name: /comment on this recognition/i }).first();
    this.commentInput = page.locator('[data-testid="tiptap-content"]');
    this.commentSubmitButton = page.getByRole('button', { name: /(post)/i }).first();
    this.commentCountIndicator = page.getByRole('button', { name: /(comment|comments)/i }).first();
    this.commentItems = page.locator('[data-testid="comment-item"], [class*="comment"]');
  }

  /**
   * Verify that the Recognition Hub page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the Recognition Hub is loaded', async () => {
      await expect(this.giveRecognitionButton, 'expecting give recognition button to be visible').toBeVisible({
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

  /**
   * Click on the Give recognition Button
   */
  async clickOnGiveRecognition(): Promise<void> {
    await this.clickOnElement(this.giveRecognitionButton, {
      timeout: TIMEOUTS.VERY_SHORT,
      stepInfo: 'Clicking on Give Recognition button',
    });
  }

  /**
   * Give peer recognition to a user
   */
  async givePeerRecognition(
    recognitionReceiver: string | number,
    awardName: string | number,
    options: {
      message?: string;
    } = {}
  ): Promise<string> {
    await this.clickOnGiveRecognition();
    const giveRecognitionModal = new GiveRecognitionDialogBox(this.page);
    await giveRecognitionModal.selectTheUserForRecognition(recognitionReceiver);
    await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition(awardName);
    const recognitionPostMessage = options.message ?? `Automated Test Message ${Math.floor(Math.random() * 1000000)}`;
    await giveRecognitionModal.enterTheRecognitionMessage(recognitionPostMessage);
    await test.step('Click Recognize button in modal', async () => {
      await expect(giveRecognitionModal.recognizeButton).toBeEnabled();
      await giveRecognitionModal.recognizeButton.click();
      await expect(giveRecognitionModal.recognizeButton).not.toBeVisible();
    });

    return recognitionPostMessage;
  }

  /**
   * Click Recognize and handle the share modal based on target.
   */
  async postRecognitionAward(options: {
    shareToHub?: boolean;
    shareToSite?: boolean;
    shareToSlack?: boolean;
    nonUnifiedPost?: boolean;
    siteName?: string;
    slackChannel?: string;
  }): Promise<void> {
    const { shareToHub, shareToSite, shareToSlack, siteName, slackChannel } = options;
    if (shareToHub) {
      await this.handleShareRecognitionModal('Hub');
    } else if (shareToSlack) {
      await this.handleShareRecognitionModal('Slack', { slackChannel });
    } else if (shareToSite) {
      await this.handleShareRecognitionModal('Site', { siteName });
    } else {
      await this.handleShareRecognitionModal('Skip');
    }
  }

  /**
   * Handle the share recognition modal flows.
   */
  private async handleShareRecognitionModal(
    placeToShare: 'Hub' | 'Site' | 'Slack' | 'Skip',
    options: { siteName?: string; slackChannel?: string } = {}
  ): Promise<void> {
    const { siteName, slackChannel } = options;

    await test.step(`Handle share modal for ${placeToShare}`, async () => {
      await this.shareModal.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });

      if (placeToShare === 'Hub') {
        await this.ensureChecked(this.shareToFeedCheckbox);
        await this.homeFeedOption.click({ timeout: TIMEOUTS.MEDIUM });
        await this.shareButton.click();
      } else if (placeToShare === 'Site') {
        await this.ensureChecked(this.shareToFeedCheckbox);
        await this.siteFeedOption.click({ timeout: TIMEOUTS.MEDIUM });
        if (siteName) {
          await this.siteInputField.fill(siteName);
          const option = this.siteSuggestionOption.first();
          await option.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
          await option.click();
        }
        await this.shareButton.click();
      } else if (placeToShare === 'Slack') {
        await expect(this.shareToSlackCheckbox, 'Slack share checkbox should be visible').toBeVisible({
          timeout: TIMEOUTS.MEDIUM,
        });
        await this.shareToSlackCheckbox.click();
        if (slackChannel) {
          await this.slackChannelInput.fill(slackChannel);
        }
        await this.shareButton.click();
      } else {
        await this.skipButton.click();
      }
    });
  }

  /**
   * Ensure the checkbox is checked
   */
  private async ensureChecked(locator: Locator): Promise<void> {
    const checked = await locator.isChecked().catch(() => false);
    if (!checked) {
      await locator.click({ force: true });
    }
  }

  /**
   * Copy link from post
   */
  async copyLinkFromPost(postIndex: number): Promise<{ postUrl: string; awardId: string }> {
    return await test.step(`Copy link from feed post at index ${postIndex}`, async () => {
      const post = this.feedPost.nth(postIndex);
      await post.scrollIntoViewIfNeeded();
      await post.hover();
      const moreButton = this.feedPostMoreButton.nth(postIndex);
      await expect(moreButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await moreButton.click({ force: true });
      await expect(this.copyLinkMenuItem).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

      const origin = new URL(this.page.url()).origin;
      await this.page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
      await this.copyLinkMenuItem.click({ force: true });

      const postUrl = await expect
        .poll(
          async () => {
            const txt = (await this.page.evaluate(() => navigator.clipboard.readText())).trim();
            if (!txt) await this.copyLinkMenuItem.click({ force: true });
            return txt;
          },
          { timeout: 10000, intervals: [300], message: 'Clipboard should contain copied post URL' }
        )
        .toBeTruthy()
        .then(() => this.page.evaluate(() => navigator.clipboard.readText())); // or cache inside poll

      const urlStr = postUrl.trim();
      const awardId = urlStr.split('/').pop() ?? '';
      return { postUrl: urlStr, awardId };
    });
  }

  async navigateToAwardPostViaUrl(postUrl: string): Promise<void> {
    await test.step(`Navigate to award post: ${postUrl}`, async () => {
      console.log('postUrl------>>>>', postUrl);
      await this.page.goto(postUrl, { waitUntil: 'domcontentloaded' });
      await this.page.waitForURL(/\/recognition\/recognition\//, {
        timeout: TIMEOUTS.LONG,
      });

      await expect(this.badgeIcon, 'Award badge icon should be visible on award post').toBeVisible({
        timeout: TIMEOUTS.LONG,
      });
    });
  }

  async verifyCommentingAllowedForPost(allowed: boolean): Promise<void> {
    await test.step('Verify commenting allowed for post', async () => {
      if (allowed) {
        await expect(this.commentIcon, 'Comment icon should be visible on award post').toBeVisible({
          timeout: TIMEOUTS.MEDIUM,
        });
      } else {
        await expect(this.commentIcon, 'Comment icon should not be visible on award post').toBeHidden({
          timeout: TIMEOUTS.MEDIUM,
        });
      }
    });
  }

  /**
   * Add a comment on the recognition post.
   */
  async commentOnPost(commentText: string): Promise<void> {
    await test.step('Add comment on recognition post', async () => {
      await expect(this.commentIcon).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await this.commentIcon.click({ force: true });
      await this.commentInput.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      await expect(this.commentInput).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await this.commentInput.click({ force: true });
      await this.page.keyboard.insertText(commentText);
      await expect(this.commentSubmitButton).toBeEnabled({ timeout: TIMEOUTS.MEDIUM });
      await this.commentSubmitButton.click();
      await expect(this.commentInput).toBeHidden({ timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Count the comments on the recognition post
   */
  async countTheComments(): Promise<number> {
    return await test.step('Count comments on recognition post', async () => {
      if (await this.commentCountIndicator.isVisible()) {
        const text = (await this.commentCountIndicator.innerText()) ?? '';
        const count = Number(text.match(/\d+/)?.[0] ?? 0);
        return Number.isFinite(count) ? count : 0;
      } else {
        return 0;
        throw new Error('Comment count indicator is not visible');
      }
    });
  }
}
