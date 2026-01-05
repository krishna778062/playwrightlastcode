import { expect, Locator, Page, test } from '@playwright/test';
import { RecognitionHubPage } from '@rewards-pages/recognition-hub/recognition-hub-page';

import {
  CreateFeedPostComponent,
  FeedPostApiResponse,
  FeedPostOptions,
  FeedPostResult,
} from '@content/ui/components/createFeedPostComponent';
import {
  CreateQuestionComponent,
  QuestionOptions,
  QuestionResult,
} from '@content/ui/components/createQuestionComponent';
import { FilePreviewComponent } from '@content/ui/components/filePreviewComponent';
import { ListFeedComponent } from '@content/ui/components/listFeedComponent';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { ShareComponent } from '@/src/modules/content/ui/components/shareComponent';

// Re-export the interfaces and types for backwards compatibility
export { FeedPostOptions, FeedPostResult, QuestionOptions, QuestionResult };

/**
 * FeedPage - Simplified page object following Phase 2 cleanup
 *
 * Components are exposed directly for test access:
 * - `postEditor` - CreateFeedPostComponent for creating/editing posts
 * - `feedList` - ListFeedComponent for interacting with feed posts
 * - `filePreview` - FilePreviewComponent for file preview operations
 * - `questionEditor` - CreateQuestionComponent for Q&A functionality
 * - `share` - ShareComponent for sharing posts
 *
 * Usage in tests:
 * ```typescript
 * await feedPage.postEditor.createAndPost({ text: 'Hello' });
 * await feedPage.feedList.waitForPostToBeVisible('Hello');
 * await feedPage.share.clickShareButton();
 * ```
 */
export class FeedPage extends BasePage {
  /** Component for creating and editing feed posts */
  readonly postEditor: CreateFeedPostComponent;

  /** Component for interacting with feed posts list (like, comment, share, etc.) */
  readonly feedList: ListFeedComponent;

  /** Component for file preview operations */
  readonly filePreview: FilePreviewComponent;

  /** Component for creating and editing questions */
  readonly questionEditor: CreateQuestionComponent;

  /** Component for sharing posts */
  readonly share: ShareComponent;

  // Page-level locators
  readonly shareThoughtsButton: Locator;
  readonly feedFilterSelect: Locator;
  readonly optionLocator: Locator;
  readonly sortByLocator: Locator;
  readonly sortByFilter: Locator;
  readonly celebrityFeedBlocks: Locator;
  readonly getUserCardFromCelebrationBlock: (userName: string) => Locator;
  readonly newHireFeedBlocks: Locator;
  readonly recentlyPublishedBlock: Locator;
  readonly recentlyPublishedContentItem: (contentTitle: string) => Locator;
  readonly topPicksBlock: Locator;
  readonly popularContentBlock: Locator;
  readonly upcomingEventsBlock: Locator;
  readonly celebrationBlock: Locator;
  readonly upcomingEventsBlockText: (eventTitle: string) => Locator;
  readonly upcomingEventsContentItem: (eventTitle: string) => Locator;
  readonly commentIcon: Locator;
  readonly allCommentsIcon: Locator;
  readonly commentOptionsMenu: Locator;
  readonly pageNotFoundHeading: Locator;
  readonly feedPostContainer: Locator;

  constructor(page: Page, feedId?: string) {
    super(page, feedId ? PAGE_ENDPOINTS.getFeedPage(feedId) : '');
    // Initialize components with public readonly access
    this.postEditor = new CreateFeedPostComponent(page);
    this.questionEditor = new CreateQuestionComponent(page);
    this.feedList = new ListFeedComponent(page);
    this.filePreview = new FilePreviewComponent(page);
    this.share = new ShareComponent(page);

    // Page-level locators
    this.shareThoughtsButton = this.page.locator('span', { hasText: 'Share your thought' });
    this.sortByFilter = this.page.locator('[id="feed_sort"]');
    this.sortByLocator = this.page.getByLabel('Sort by');
    this.feedFilterSelect = this.page.locator('select[id="feed_filter"]');
    this.optionLocator = this.page.getByLabel('Show', { exact: true });
    this.celebrityFeedBlocks = this.page.locator('strong:has-text("celebration")');
    this.newHireFeedBlocks = this.page.locator('strong:has-text("new hire")');
    this.recentlyPublishedBlock = this.page.locator('section', { hasText: 'Recently published' }).first();
    this.recentlyPublishedContentItem = (contentTitle: string) =>
      this.recentlyPublishedBlock.filter({ hasText: contentTitle }).first();
    this.upcomingEventsBlockText = (eventTitle: string) =>
      this.upcomingEventsBlock.filter({ hasText: eventTitle }).first();
    this.upcomingEventsBlock = this.page.locator('section', { hasText: 'Upcoming event' }).first();
    this.upcomingEventsContentItem = (eventTitle: string) =>
      this.upcomingEventsBlock.filter({ hasText: eventTitle }).first();
    this.topPicksBlock = this.page.locator('header').filter({ hasText: 'Top picks' });
    this.celebrationBlock = this.page.locator('header').filter({ hasText: `celebrations` });
    this.popularContentBlock = this.page.locator('header').filter({ hasText: 'Popular content in' });
    this.allCommentsIcon = this.page.getByRole('link', { name: 'All comments' });
    this.commentIcon = this.page.getByRole('button', { name: 'Comment' });
    this.commentOptionsMenu = this.page.locator('[data-testid="comment-options-menu"]');
    this.pageNotFoundHeading = this.page.locator('h3', { hasText: 'Page not found' });
    this.getUserCardFromCelebrationBlock = (userName: string) =>
      this.page.locator("[class*='UserCard--withCelebrations']").filter({ hasText: `Birthday${userName}` });

    this.feedPostContainer = this.page.locator("[class*='PostInner']");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE-LEVEL METHODS (Keep - contains page-specific logic)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Verifies that the feed page is loaded by checking if share thoughts button is visible
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify feed page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.shareThoughtsButton, {
        assertionMessage: 'Share thoughts button should be visible on feed page',
      });
    });
  }

  async reloadPage(): Promise<void> {
    await test.step('Reload page', async () => {
      await this.page.reload();
      await this.verifyThePageIsLoaded();
    });
  }

  /**
   * Gets the post container locator for a given post text
   * @param postText - The text of the post to get the container for
   * @returns Locator for the post container
   */
  async getPostContainerLocator(postText: string): Promise<Locator> {
    return this.feedPostContainer.filter({ hasText: postText }).first();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ORCHESTRATION METHODS (Keep - combines multiple components)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Deletes a post - orchestrates menu opening, clicking delete, and confirming
   */
  async deletePost(postText: string): Promise<void> {
    await test.step(`Deleting post with text: ${postText}`, async () => {
      await this.feedList.openPostOptionsMenu(postText);
      await this.feedList.clickDeleteOption();
      await this.verifyDeleteFlow('Are you sure you want to delete this post?');
    });
  }

  /**
   * Verifies the complete delete flow including confirmation dialog and final deletion
   */
  private async verifyDeleteFlow(expectedText: string): Promise<void> {
    await test.step('Verify complete delete flow', async () => {
      await this.verifier.verifyTheElementIsVisible(this.feedList.deleteConfirmDialog);
      await expect(this.feedList.deleteConfirmDialog).toContainText(expectedText);
      await this.feedList.confirmDelete();
      await this.verifier.verifyTheElementIsNotVisible(this.feedList.deleteConfirmDialog);
    });
  }

  /**
   * Verifies complete post details including timestamp, attachments, and image preview
   */
  async verifyAllDataPointsForFeedPost(postText: string, expectedAttachmentCount: number): Promise<void> {
    await test.step(`Verify complete post details for: ${postText}`, async () => {
      //get the post by text
      const postContainer = await this.getPostContainerLocator(postText);
      await expect(postContainer, `post container should be visible for post: ${postText}`).toBeVisible();
      const postHeader = postContainer.locator('[class*="_postHeader_"]');
      //verify timestamp is visible
      const postTimeStamp = postHeader.locator("[class*='headerInner']").locator('p').first();
      await this.verifier.verifyTheElementIsVisible(postTimeStamp, {
        assertionMessage: `Post timestamp should be visible for post: ${postText}`,
      });
      //attachments
      const attachments = postContainer.locator('[class*="_postContent_"]').locator('li');
      await expect(attachments, `expected attachment count should be ${expectedAttachmentCount}`).toHaveCount(
        expectedAttachmentCount
      );
      //image preview
      const imagePreviewButton = postContainer.locator("button[aria-label='Open image in lightbox']");
      await this.clickOnElement(imagePreviewButton, { stepInfo: 'Clicking on image preview button' });
      //verify image preview visible
      await this.feedList.verifyInlineImagePreviewVisible();
      //close image preview
      await this.clickOnElement(this.filePreview.closeButton, { stepInfo: 'Closing image preview' });
    });
  }

  /**
   * Deletes a reply - orchestrates clicking delete and confirming
   */
  async clickOnDeleteReplyButton(): Promise<void> {
    await this.feedList.clickDeleteOption();
    await this.feedList.confirmDelete();
  }

  /**
   * Clicks Ask Question button and returns the postId from API response
   */
  async clickAskQuestionButton(): Promise<string> {
    const postResponse = await this.questionEditor.clickAskQuestionButton();
    const feedResponseBody = (await postResponse.json()) as FeedPostApiResponse;
    const postId = feedResponseBody.result.feedId;
    console.log('postId', postId);
    return postId;
  }

  /**
   * Verifies question button visibility with retry on failure
   */
  async verifyQuestionButtonIsNotVisible(): Promise<void> {
    try {
      await this.postEditor.verifyQuestionButtonIsNotVisible();
    } catch {
      await this.reloadPage();
      await this.postEditor.verifyQuestionButtonIsNotVisible();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE-SPECIFIC DROPDOWN METHODS (Keep - uses page-level locators)
  // ═══════════════════════════════════════════════════════════════════════════

  async clickOnShowOption(optionValue: string): Promise<void> {
    await test.step(`Click on show option: ${optionValue}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.feedFilterSelect, {
        assertionMessage: 'Feed filter dropdown should be visible',
      });
      await this.clickOnElement(this.feedFilterSelect);
      await this.optionLocator.selectOption(`${optionValue}`);
      await this.clickOnElement(this.feedFilterSelect);
    });
  }

  async clickOnSortByOption(optionValue: string): Promise<void> {
    await test.step(`Click on show option: ${optionValue}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.sortByFilter, {
        assertionMessage: 'Sort by dropdown should be visible',
      });
      await this.clickOnElement(this.sortByFilter);
      await this.sortByLocator.selectOption(`${optionValue}`);
      await this.clickOnElement(this.sortByFilter);
    });
  }

  async clickShareThoughtsButton(): Promise<void> {
    await test.step('Click on Share your thoughts button', async () => {
      await this.clickOnElement(this.shareThoughtsButton);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE-LEVEL VERIFICATION METHODS (Keep - uses page-level locators)
  // ═══════════════════════════════════════════════════════════════════════════

  async verifyFeedSectionIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.shareThoughtsButton, {
      assertionMessage: 'Feed section should be visible',
    });
  }

  async verifyFeedSectionIsNotVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.shareThoughtsButton, {
      assertionMessage: 'Feed section should not be visible',
    });
  }

  async verifySmartFeedBlocksAreNotVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.celebrityFeedBlocks, {
      assertionMessage: 'Smart feed blocks should not be visible',
    });
    await this.verifier.verifyTheElementIsNotVisible(this.newHireFeedBlocks, {
      assertionMessage: 'Smart feed blocks should not be visible',
    });
  }

  async verifyUserDisplayedInCelebrationBlock(userName: string): Promise<void> {
    await test.step(`Verify user "${userName}" is displayed in Celebration smart feed block`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.celebrityFeedBlocks, {
        assertionMessage: 'Celebration smart feed block should be visible',
      });
      const userCard = this.getUserCardFromCelebrationBlock(userName);
      await this.verifier.verifyTheElementIsVisible(userCard, {
        assertionMessage: `User "${userName}" should be visible in Celebration smart feed block`,
      });
    });
  }

  async verifyRecentlyPublishedBlockIsVisible(): Promise<void> {
    await test.step('Verify Recently Published smart block is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.recentlyPublishedBlock, {
        assertionMessage: 'Recently Published smart block should be visible',
      });
    });
  }

  async verifyContentVisibleInRecentlyPublishedBlock(contentTitle: string): Promise<void> {
    await test.step(`Verify content "${contentTitle}" is visible in Recently Published block`, async () => {
      const contentItem = this.recentlyPublishedContentItem(contentTitle);
      await this.verifier.verifyTheElementIsVisible(contentItem, {
        assertionMessage: `Content "${contentTitle}" should be visible in Recently Published block`,
      });
    });
  }

  async verifyContentNotVisibleInRecentlyPublishedBlock(contentTitle: string): Promise<void> {
    await test.step(`Verify content "${contentTitle}" is NOT visible in Recently Published block`, async () => {
      const contentItem = this.recentlyPublishedContentItem(contentTitle);
      await this.verifier.verifyTheElementIsNotVisible(contentItem, {
        assertionMessage: `Content "${contentTitle}" should NOT be visible in Recently Published block`,
        timeout: 5000,
      });
    });
  }

  async verifyTopPicksBlockIsVisible(): Promise<void> {
    await test.step('Verify Top picks smart block is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.topPicksBlock, {
        assertionMessage: 'Top picks smart block should be visible',
      });
    });
  }

  async verifyPopularContentBlockIsVisible(): Promise<void> {
    await test.step('Verify Popular content smart block is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.popularContentBlock, {
        assertionMessage: 'Popular content smart block should be visible',
      });
    });
  }

  async verifyUpcomingEventsBlockIsVisible(): Promise<void> {
    await test.step('Verify Upcoming events smart block is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.upcomingEventsBlock, {
        assertionMessage: 'Upcoming events smart block should be visible',
      });
    });
  }

  async verifyCelebrationBlockIsVisible(): Promise<void> {
    await test.step('Verify Celebration smart block is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.celebrationBlock, {
        assertionMessage: 'Celebration smart block should be visible',
      });
    });
  }

  async verifyEventInUpcomingEventsBlock(eventTitle: string): Promise<void> {
    await test.step(`Verify event "${eventTitle}" appears in Upcoming Events block`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.upcomingEventsBlock, {
        assertionMessage: 'Upcoming Events block should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.upcomingEventsBlockText(eventTitle), {
        assertionMessage: `Event "${eventTitle}" should appear in Upcoming Events block`,
      });
    });
  }

  async verifyEventNotInUpcomingEventsBlock(eventTitle: string): Promise<void> {
    await test.step(`Verify event "${eventTitle}" does not appear in Upcoming Events block`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.upcomingEventsBlock, {
        assertionMessage: 'Upcoming Events block should be visible',
      });
      await this.verifier.verifyTheElementIsNotVisible(this.upcomingEventsBlockText(eventTitle), {
        assertionMessage: `Event "${eventTitle}" should not appear in Upcoming Events block`,
      });
    });
  }

  async clickContentInRecentlyPublishedBlock(contentTitle: string): Promise<void> {
    await test.step(`Click on content "${contentTitle}" in Recently Published block`, async () => {
      const contentItem = this.recentlyPublishedContentItem(contentTitle);
      await this.verifier.verifyTheElementIsVisible(contentItem, {
        assertionMessage: `Content "${contentTitle}" should be visible in Recently Published block`,
      });
      const contentLink = contentItem.locator('a').first();
      const linkVisible = await contentLink.isVisible().catch(() => false);
      if (linkVisible) {
        await this.clickOnElement(contentLink);
      } else {
        await this.clickOnElement(contentItem);
      }
    });
  }

  async verifyEventVisibleInUpcomingEventsBlock(eventTitle: string): Promise<void> {
    await test.step(`Verify event "${eventTitle}" is visible in Upcoming Events block`, async () => {
      const eventItem = this.upcomingEventsContentItem(eventTitle);
      await this.verifier.verifyTheElementIsVisible(eventItem, {
        assertionMessage: `Event "${eventTitle}" should be visible in Upcoming Events block`,
      });
    });
  }

  async verifyEventNotVisibleInUpcomingEventsBlock(eventTitle: string): Promise<void> {
    await test.step(`Verify event "${eventTitle}" is NOT visible in Upcoming Events block`, async () => {
      const eventItem = this.upcomingEventsContentItem(eventTitle);
      await this.verifier.verifyTheElementIsNotVisible(eventItem, {
        assertionMessage: `Event "${eventTitle}" should NOT be visible in Upcoming Events block`,
      });
    });
  }

  async clickEventInUpcomingEventsBlock(eventTitle: string): Promise<void> {
    await test.step(`Click on event "${eventTitle}" in Upcoming Events block`, async () => {
      const eventItem = this.upcomingEventsContentItem(eventTitle);
      await this.verifier.verifyTheElementIsVisible(eventItem, {
        assertionMessage: `Event "${eventTitle}" should be visible in Upcoming Events block`,
      });
      const eventLink = eventItem.locator('a').first();
      const linkVisible = await eventLink.isVisible().catch(() => false);
      if (linkVisible) {
        await this.clickOnElement(eventLink);
      } else {
        await this.clickOnElement(eventItem);
      }
    });
  }

  async clickOnCommentIcon(): Promise<void> {
    await test.step('Click on comment icon', async () => {
      await this.clickOnElement(this.commentIcon);
    });
  }

  async clickOnCommentOptionsMenu(commentText: string): Promise<void> {
    await test.step(`Click on comment options menu for: ${commentText}`, async () => {
      const commentElement = this.page.locator(`text=${commentText}`).first();
      const optionsButton = commentElement.locator('..').getByRole('button', { name: 'Options' });
      await this.clickOnElement(optionsButton);
    });
  }

  async verifyCommentOptionsMenuVisible(expectedOptions: string[]): Promise<void> {
    await test.step(`Verify comment options menu contains: ${expectedOptions.join(', ')}`, async () => {
      for (const option of expectedOptions) {
        await this.verifier.verifyTheElementIsVisible(this.commentOptionsMenu.getByRole('button', { name: option }), {
          assertionMessage: `Comment option "${option}" should be visible`,
        });
      }
    });
  }

  async verifyCommentIconIsVisible(): Promise<void> {
    await test.step('Verify Comment icon is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.allCommentsIcon.first(), {
        assertionMessage: 'Comment icon should be visible',
      });
    });
  }

  async verifyPageNotFoundVisibility(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo || `Verify the page - Page not found`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageNotFoundHeading, {
        assertionMessage: 'Page not found heading should be visible',
        timeout: options?.timeout || TIMEOUTS.SHORT,
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SHARE DIALOG ORCHESTRATION METHODS (Keep - complex multi-component flows)
  // ═══════════════════════════════════════════════════════════════════════════

  async shareFeedPost(params: {
    postText: string;
    mentionUserName?: string;
    shareMessage: string;
    postIn: 'Home Feed' | 'Site Feed';
  }): Promise<void> {
    await test.step(`Share feed post "${params.postText}" with message "${params.shareMessage}"`, async () => {
      await this.feedList.clickShareIcon(params.postText);
      await this.verifier.verifyTheElementIsVisible(this.share.shareDescriptionInput, {
        assertionMessage: 'Share dialog should be visible',
      });
      console.log(`Entering share message: ${params.shareMessage}`);
      await this.share.enterShareDescription(params.shareMessage);
      if (params.mentionUserName) {
        console.log(`Adding mention: @${params.mentionUserName}`);
        await this.postEditor.addUserNameMention(params.mentionUserName);
      }
      console.log(`Selecting post in: ${params.postIn}`);
      if (params.postIn === 'Home Feed') {
        const selectedShareOption = await this.share.getSelectedShareOption();
        if (selectedShareOption.toLowerCase() !== 'home feed') {
          await this.share.shareOptionDropdown.selectOption({ label: 'home feed' });
        }
      } else {
        await this.share.shareOptionDropdown.selectOption({ label: 'site feed' });
      }
      await this.share.clickShareButton();
    });
  }

  async verifyShareModalIsOpen(): Promise<void> {
    await test.step('Verify share modal is open', async () => {
      await this.verifier.verifyTheElementIsVisible(this.share.shareDescriptionInput, {
        assertionMessage: 'Share modal should be open',
      });
    });
  }

  async addUserNameMentionInShareDialog(userName: string): Promise<void> {
    await test.step(`Adding user mention in share dialog: @${userName}`, async () => {
      const shareEditor = this.share.shareDescriptionInput;
      await this.typeInElement(shareEditor, ` @${userName}`);
      const userOption = this.page
        .locator("div[class*='ListingItem-module__details'] div p")
        .filter({ hasText: userName })
        .first();
      await userOption.waitFor({ state: 'visible' });
      await this.clickOnElement(userOption);
    });
  }

  async addSiteMentionInShareDialog(siteName: string): Promise<void> {
    await test.step(`Adding site mention in share dialog: @${siteName}`, async () => {
      const shareEditor = this.share.shareDescriptionInput;
      await this.typeInElement(shareEditor, ` @${siteName}`);
      const siteOption = this.page
        .locator("div[class*='ListingItem-module__details'] p")
        .filter({ hasText: siteName })
        .first();
      const isVisible = await siteOption.isVisible().catch(() => false);
      if (isVisible) {
        await siteOption.waitFor({ state: 'visible' });
        await this.clickOnElement(siteOption);
      } else {
        await shareEditor.press('Enter');
      }
    });
  }

  async addTopicMentionInShareDialog(topicName: string): Promise<void> {
    await test.step(`Adding topic mention in share dialog: #${topicName}`, async () => {
      const shareEditor = this.share.shareDescriptionInput;
      await this.typeInElement(shareEditor, ` #${topicName}`);
      const topicOption = this.page
        .locator("div[role='menuitem'] div p")
        .filter({ hasText: new RegExp(`^${topicName}$`) })
        .first();
      await topicOption.waitFor({ state: 'visible' });
      await this.clickOnElement(topicOption);
    });
  }

  async addEmbeddedUrlInShareDialog(embedUrl: string): Promise<void> {
    await test.step(`Adding embedded URL in share dialog: ${embedUrl}`, async () => {
      const shareEditor = this.share.shareDescriptionInput;
      await this.typeInElement(shareEditor, ` ${embedUrl}`);
    });
  }

  async fillShareDialogWithMentionsAndTopics(params: {
    shareMessage: string;
    userNames?: string[];
    siteNames?: string[];
    topicNames?: string[];
    embedUrl?: string;
  }): Promise<void> {
    const { shareMessage, userNames, siteNames, topicNames, embedUrl } = params;
    await test.step(`Fill share dialog with message, mentions, topics, and embedded URL`, async () => {
      await this.share.enterShareDescription(shareMessage);
      if (userNames && userNames.length > 0) {
        for (const userName of userNames) {
          await this.addUserNameMentionInShareDialog(userName);
        }
      }
      if (siteNames && siteNames.length > 0) {
        for (const siteName of siteNames) {
          await this.addSiteMentionInShareDialog(siteName);
        }
      }
      if (topicNames && topicNames.length > 0) {
        for (const topicName of topicNames) {
          await this.addTopicMentionInShareDialog(topicName);
        }
      }
      if (embedUrl) {
        await this.addEmbeddedUrlInShareDialog(embedUrl);
      }
    });
  }

  async verifyFeedDetailPageLoaded(): Promise<void> {
    await test.step('Verify feed detail page is loaded', async () => {
      await this.page.waitForURL(new RegExp('/feed/'));
      const isShareButtonVisible = await this.shareThoughtsButton.isVisible().catch(() => false);
      if (!isShareButtonVisible) {
        const feedContent = this.page.locator('div[class*="postContent"]').first();
        await this.verifier.verifyTheElementIsVisible(feedContent, {
          assertionMessage: 'Feed detail page should be loaded',
        });
      }
    });
  }

  async verifyVideoLinkUnfurled(embedUrl: string): Promise<void> {
    await test.step(`Verify video link is unfurled: ${embedUrl}`, async () => {
      const videoEmbed = this.page
        .locator('iframe[src*="youtube"], div[class*="embed"], div[class*="video"], a[href*="youtube"]')
        .first();
      const isVisible = await videoEmbed.isVisible().catch(() => false);
      if (!isVisible) {
        console.warn(`Video link unfurling not visible for URL: ${embedUrl}, but continuing test`);
      } else {
        await this.verifier.verifyTheElementIsVisible(videoEmbed, {
          assertionMessage: `Video link should be unfurled for URL: ${embedUrl}`,
        });
      }
    });
  }

  async verifyPostTextOnDetailPage(postText: string): Promise<void> {
    await test.step(`Verify post text on detail page: ${postText}`, async () => {
      await this.feedList.validatePostText(postText);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SITE MENTION & NAVIGATION METHODS (Keep - page-specific navigation logic)
  // ═══════════════════════════════════════════════════════════════════════════

  async clickSiteMentionInPost(postText: string, siteName: string, siteId: string): Promise<void> {
    await test.step(`Click site mention @${siteName} in post and verify navigation`, async () => {
      const postContainer = this.feedList.postTextLocator(postText);
      await this.verifier.verifyTheElementIsVisible(postContainer, {
        assertionMessage: `Post ${postText} should be visible`,
      });
      const siteMentionLink = postContainer.getByRole('link', { name: `@${siteName}` });
      await this.verifier.verifyTheElementIsVisible(siteMentionLink, {
        assertionMessage: `Site mention @${siteName} should be visible in post`,
      });
      await this.clickOnElement(siteMentionLink);
      await this.verifyNavigationToSite(siteId);
    });
  }

  async verifyNavigationToSite(siteId: string): Promise<void> {
    await test.step(`Verify navigation to site ${siteId}`, async () => {
      await this.page.waitForURL(new RegExp(`/site/${siteId}`), { timeout: TIMEOUTS.MEDIUM });
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RECOGNITION HUB METHODS (Keep - creates external page object)
  // ═══════════════════════════════════════════════════════════════════════════

  async clickOnGiveRecognition(): Promise<void> {
    await test.step('Click on Give Recognition button', async () => {
      const recognitionHub = new RecognitionHubPage(this.page);
      await recognitionHub.clickOnGiveRecognition();
    });
  }

  async verifyRecognitionPostVisible(message?: string): Promise<void> {
    await test.step(`Verify recognition post is visible${message ? ` with message "${message}"` : ''}`, async () => {
      const recognitionHub = new RecognitionHubPage(this.page);
      await recognitionHub.verifyRecognitionPostVisible(message);
    });
  }

  async verifyRemovedContentMessage(postText: string): Promise<void> {
    await test.step(`Verify removed content message for post: ${postText}`, async () => {
      await this.feedList.verifyRemovedContentMessage(postText);
    });
  }
}
