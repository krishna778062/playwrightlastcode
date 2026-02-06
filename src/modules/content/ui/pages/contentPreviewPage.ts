import { Locator, Page, test } from '@playwright/test';

import {
  CreateQuestionComponent,
  QuestionOptions,
  QuestionResult,
} from '@content/ui/components/createQuestionComponent';
import { PromotePageModal } from '@content/ui/components/promotePageModal';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { TIMEOUTS } from '@/src/core/constants';
import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { SitePermission } from '@/src/core/types/siteManagement.types';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { ContentDetailsComponent } from '@/src/modules/content/ui/components/contentDetailsComponent';
import { CreateFeedPostComponent } from '@/src/modules/content/ui/components/createFeedPostComponent';
import { ListFeedComponent } from '@/src/modules/content/ui/components/listFeedComponent';
import { MustReadModalComponent } from '@/src/modules/content/ui/components/mustReadModalComponent';
import { OptionMenuComponent } from '@/src/modules/content/ui/components/optionMenuComponent';

export class ContentPreviewPage extends BasePage {
  // Additional locators for promotion and verification
  readonly contentTitleHeading: (title: string) => Locator;
  readonly successMessage: (message: string) => Locator;
  readonly publishButton: Locator;
  // Action locators
  readonly editPageButton: Locator;
  readonly sendFeedbackTab: Locator;
  readonly closeModalButton: Locator;
  readonly closeShareContentModalButton: Locator;
  readonly versionHistoryButton: Locator;
  readonly optionMenuDropdown: Locator;
  readonly unpublishButton: Locator;
  readonly deleteButton: Locator;
  readonly confirmDeleteButton: Locator;
  readonly contentStatus: (status: string) => Locator;
  readonly approveOrRejectButton: (action: string) => Locator;
  readonly siteContentTab: Locator;
  readonly publishStatus: Locator;
  readonly rejectButton: Locator;
  readonly rejectReasonTextarea: Locator;
  readonly submitForApprovalButton: Locator;
  readonly sendHistoryPopup: Locator;
  readonly versionHistoryPopup: Locator;
  readonly ellipsisButton: Locator;
  readonly checkValidateOption: Locator;
  readonly albumHeading: Locator;
  readonly shareThoughtsButton: Locator;
  readonly mustReadButton: Locator;
  readonly mustReadModal: Locator;
  readonly mustReadModalCancelButton: Locator;
  readonly favouriteContentButton: Locator;
  readonly sharePostButton: Locator;
  readonly contentSharePostButton: Locator;
  readonly shareContentButton: Locator;
  readonly replyEditorForPost: (postText: string) => Locator;
  readonly replyEditor: Locator;
  readonly submitReplyButton: Locator;
  readonly promotionEventDialog: (contentType: string) => Locator;
  readonly skipPromotionEventDialogButton: (contentType: string) => Locator;

  // Locators for Page restricted viewers
  readonly restrictedViewersToggle: Locator;
  readonly publishChangesButton: Locator;
  readonly audiencePickerButton: Locator;
  readonly siteDropdown: Locator;
  readonly siteSecondDropdown: Locator;
  readonly memberDropdown: Locator;
  readonly ownerAndManagerDropdown: Locator;
  readonly managerCheckbox: Locator;
  readonly ownerCheckbox: Locator;
  readonly memberCheckbox: Locator;
  readonly contentManagerCheckbox: Locator;
  readonly audienceDoneButton: Locator;

  // Page components
  readonly promotePageModal: PromotePageModal;
  readonly mustReadModalComponent: MustReadModalComponent;
  readonly optionMenuComponent: OptionMenuComponent;
  readonly createFeedPostComponent: CreateFeedPostComponent;
  readonly listFeedComponent: ListFeedComponent;
  readonly createQuestionComponent: CreateQuestionComponent;
  private contentDetailsComponent: ContentDetailsComponent;

  constructor(page: Page, siteId?: string, contentId?: string, contentType?: string) {
    super(
      page,
      siteId && contentId && contentType
        ? PAGE_ENDPOINTS.getContentPreviewPage(siteId, contentId, contentType.toLowerCase())
        : ''
    );
    this.promotePageModal = new PromotePageModal(page);
    this.mustReadModalComponent = new MustReadModalComponent(page);
    this.optionMenuComponent = new OptionMenuComponent(page);
    this.contentDetailsComponent = new ContentDetailsComponent(page);
    this.createFeedPostComponent = new CreateFeedPostComponent(page);
    this.listFeedComponent = new ListFeedComponent(page);
    this.createQuestionComponent = new CreateQuestionComponent(page);

    // Additional locators for promotion and verification
    this.contentTitleHeading = (title: string) => this.page.locator('h1', { hasText: title });
    this.successMessage = (message: string) => this.page.locator('div[class*="Toast-module"]').getByText(message);
    this.publishButton = this.page.getByRole('button', { name: 'Publish' });
    // Action locators
    this.editPageButton = this.page.getByRole('button', { name: 'Edit' });
    this.sendFeedbackTab = this.page.getByTestId('send-feedback-tab');
    this.closeModalButton = this.page.getByTestId('close-modal-button');
    this.closeShareContentModalButton = this.page.getByRole('button', { name: 'Close', exact: true });
    this.versionHistoryButton = this.page.getByRole('button', { name: 'Version history' });
    this.optionMenuDropdown = this.page.getByRole('button', { name: 'Category option' });
    this.unpublishButton = this.page.getByRole('button', { name: 'Unpublish' });
    this.deleteButton = this.page.getByRole('button', { name: 'Delete' });
    this.confirmDeleteButton = this.page.getByRole('button', { name: 'Delete' }).last();
    this.contentStatus = (status: string) =>
      this.page.locator('div.ContentAdminBar-status').filter({ hasText: status });
    this.approveOrRejectButton = (action: string) => this.page.getByRole('button', { name: action });
    this.siteContentTab = this.page
      .getByTestId('content-tab')
      .or(
        this.page
          .getByRole('button', { name: 'Content' })
          .or(this.page.getByRole('link').filter({ hasText: 'content' }))
      );
    this.publishStatus = this.page.getByText('Published today');
    this.rejectButton = this.page.locator('span:has-text("Reject")');
    this.rejectReasonTextarea = this.page.locator('div.Modal-content div textarea');
    this.submitForApprovalButton = this.page.getByRole('button', { name: 'Submit for approval' });
    this.sendHistoryPopup = this.page.getByTestId('send-history-popup');
    this.versionHistoryPopup = this.page.getByTestId('version-history-popup');
    this.ellipsisButton = this.page.locator('button[aria-label="Category option"]').first();
    this.checkValidateOption = this.page.getByRole('button', { name: 'Validate' });
    this.albumHeading = this.page.getByRole('heading', { name: 'Album', exact: true });
    this.shareThoughtsButton = this.page.locator('span', { hasText: 'Share your thought' });
    this.mustReadButton = this.page.getByRole('button', { name: "Make 'must read'" });
    this.mustReadModal = this.page.getByRole('dialog', { name: "Make 'Must Read'" }).getByRole('banner');
    this.mustReadModalCancelButton = this.page.getByRole('button', { name: 'Cancel' });
    this.favouriteContentButton = this.page.getByRole('button', { name: 'Add content to favorites' });
    this.sharePostButton = this.page.getByRole('button', { name: 'Share this post' });
    this.contentSharePostButton = this.page.getByRole('button', { name: 'Share this content' });
    this.shareContentButton = this.page.getByRole('button', { name: 'Share this content' });
    this.replyEditorForPost = (postText: string): Locator => {
      return this.page.locator('._post_eonic_1').first().getByRole('button', { name: 'Leave a reply…' }).first();
    };
    this.replyEditor = this.page.locator('div[class*="ProseMirror"] p[data-placeholder*="Leave a reply"]').first();
    this.submitReplyButton = this.page.getByRole('button', { name: 'Reply', exact: true }).first();
    this.promotionEventDialog = (contentType: string) =>
      this.page.getByRole('dialog', { name: `Promote ${contentType}` });
    this.skipPromotionEventDialogButton = (contentType: string) =>
      this.promotionEventDialog(contentType).getByRole('button', { name: 'Skip this step' });

    // Initialize locators for Page restricted viewers
    this.restrictedViewersToggle = this.page.getByRole('switch').first();
    this.publishChangesButton = this.page.getByRole('button', { name: 'Publish changes' });
    this.audiencePickerButton = this.page.getByRole('button', { name: 'Browse', exact: true });
    this.siteDropdown = this.page.getByLabel('Site', { exact: true }).getByRole('button');
    this.siteSecondDropdown = this.page.locator('[data-testid="i-arrowRight"]').first();
    this.memberDropdown = this.page.getByLabel('Members').getByRole('button').first();
    this.ownerAndManagerDropdown = this.page.getByLabel('Owners & managers').getByRole('button').first();
    this.memberCheckbox = this.page.getByLabel('Non-managing members').getByRole('checkbox');
    this.ownerCheckbox = this.page.getByLabel('Owner', { exact: true }).getByText('Owner', { exact: true });
    this.managerCheckbox = this.page.getByText('Managers', { exact: true });
    this.contentManagerCheckbox = this.page.getByLabel('Content managers').getByRole('checkbox');
    this.audienceDoneButton = this.page.getByRole('button', { name: 'Done' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify preview page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  /**
   * Handles the promotion page step by calling the promote page modal
   */
  async handlePromotionPageStep(): Promise<void> {
    await test.step('Handling promotion page step', async () => {
      await this.promotePageModal.handlePromotion();
    });
  }

  /**
   * Verifies that the content was published successfully
   * @param title - The title of the content to verify
   * @param successMessage - The expected success message to verify
   */
  async verifyContentPublishedSuccessfully(title: string, successMessage: string): Promise<void> {
    await test.step(`Verifying content was published successfully`, async () => {
      // Verify success message is visible
      await this.verifier.verifyTheElementIsVisible(this.successMessage(successMessage), {
        assertionMessage: `Success message "${successMessage}" should be visible after publishing`,
      });

      await this.verifier.verifyTheElementIsVisible(this.contentTitleHeading(title), {
        assertionMessage: `Content title "${title}" should be visible in heading`,
      });
    });
  }

  /**
   * Clicks on the Approve and Publish button
   */
  async clickOnApproveOrRejectButton(action: string) {
    await this.page.waitForLoadState('domcontentloaded');
    await test.step(`Clicking on the Approve and Publish button`, async () => {
      await this.clickOnElement(this.approveOrRejectButton(action));
    });
  }

  /**
   * Verifies that the content is in pending status
   */
  async verifyContentStatus(status: string) {
    await test.step(`Verifying that the content is in pending status`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.contentStatus(status), {
        assertionMessage: `Content should be in pending status`,
      });
    });
  }

  async clickReplyEditorForPost(commentText: string): Promise<void> {
    await test.step('Click on reply editor for post', async () => {
      const replyEditor = this.replyEditorForPost(commentText);
      await this.verifier.verifyTheElementIsVisible(replyEditor, {
        assertionMessage: 'Reply editor should be visible for the post',
      });
      await this.clickOnElement(replyEditor);
    });
  }

  async addReplyToContentComment(replyText: string): Promise<void> {
    await test.step('Add reply to content comment', async () => {
      await this.fillInElement(this.replyEditor, replyText);
      await this.clickOnElement(this.submitReplyButton);
    });
  }

  async clickLoadMoreRepliesButton(): Promise<void> {
    await this.listFeedComponent.clickLoadMoreRepliesButton();
  }

  /**
   * Verifies that the content is not visible
   * @param title - The title of the content to verify is not visible
   */
  async verifyContentIsInPublishedStatus(): Promise<void> {
    await test.step(`Verifying content is in published status`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.publishStatus, {
        assertionMessage: `Content should be in published status`,
      });
    });
  }

  /**
   * Enters the reject reason
   * @param reason - The reason to enter
   */
  async enterRejectReason(reason: string) {
    await test.step(`Entering reject reason: ${reason}`, async () => {
      await this.fillInElement(this.rejectReasonTextarea, reason);
      await this.clickOnElement(this.rejectButton);
    });
  }

  /**
   * Verifies that the content has submit for approval button
   */
  async verifyContentHasSubmitForApprovalButton() {
    await test.step(`Verifying that the content has submit for approval button`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.submitForApprovalButton, {
        assertionMessage: `Content should have submit for approval button`,
      });
    });
  }
  async verifyCommentOptionIsNotVisible(): Promise<void> {
    await test.step('Checking comment option', async () => {
      await this.contentDetailsComponent.checkCommentOption.isHidden();
    });
  }

  async verifyValidateOptionOnContentPreviewPage(): Promise<void> {
    await test.step('Verifying validate option on content preview page', async () => {
      await this.hoverOverElementInJavaScript(this.ellipsisButton);
      await this.verifier.verifyTheElementIsVisible(this.checkValidateOption, {
        assertionMessage: 'Validate option should be visible on content preview page',
      });
    });
  }
  async verifyingAlbumHeadingOnContentPreviewPage(): Promise<void> {
    await test.step('Verifying album heading on content preview page', async () => {
      await this.verifier.verifyTheElementIsVisible(this.albumHeading, {
        assertionMessage: 'Album heading should be visible on content preview page',
      });
    });
  }
  async unpublishingTheContent(): Promise<void> {
    await test.step('Unpublishing the content', async () => {
      await this.hoverOverElementInJavaScript(this.ellipsisButton);
      await this.clickOnElement(this.unpublishButton);
    });
  }
  async verifyUnpublishedContentToastMessage(toastMessage: string): Promise<void> {
    await test.step('Verifying unpublished content toast message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.successMessage(toastMessage), {
        assertionMessage: `Unpublished content toast message "${toastMessage}" should be visible`,
      });
    });
  }
  async verifyPublishedContentToasteMessage(toastMessage: string): Promise<void> {
    await test.step('Verifying published content toast message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.successMessage(toastMessage), {
        assertionMessage: `Published content toast message "${toastMessage}" should be visible`,
      });
    });
  }
  async publishingTheContent(): Promise<void> {
    await test.step('Publishing the content', async () => {
      await this.clickOnElement(this.publishButton);
    });
  }

  async deleteTheContent(): Promise<void> {
    await test.step('Delete the content', async () => {
      await this.clickOnOptionMenuButton();
      await this.hoverOverElementInJavaScript(this.ellipsisButton);
      await this.clickOnElement(this.deleteButton);
      await this.clickOnElement(this.confirmDeleteButton);
    });
  }

  async skipPromotionDialogIfVisible(contentType: string): Promise<void> {
    await test.step('Skipping promotion dialog if visible', async () => {
      const isPromotionDialogVisible = await this.verifier.isTheElementVisible(this.promotionEventDialog(contentType), {
        timeout: TIMEOUTS.SHORT,
      });
      if (isPromotionDialogVisible) {
        console.log('Promotion dialog is visible, skipping it');
        await this.clickOnElement(this.skipPromotionEventDialogButton(contentType));
      }
    });
  }
  async verifyCommentOptionIsVisible(): Promise<void> {
    await test.step('Checking comment option', async () => {
      await this.contentDetailsComponent.checkCommentOption.isVisible();
    });
  }

  async editPost(currentText: string, newText: string): Promise<void> {
    await this.createFeedPostComponent.editPost(currentText, newText);
  }

  async waitForPostToBeVisible(expectedText: string): Promise<void> {
    await this.listFeedComponent.waitForPostToBeVisible(expectedText);
  }
  async verifyPostIsNotVisible(text: string): Promise<void> {
    await this.listFeedComponent.verifyPostIsNotVisible(text);
  }

  /**
   * Clicks the share thoughts button to open post editor
   */
  async clickShareThoughtsButton(): Promise<void> {
    await test.step('Click on Share your thoughts button', async () => {
      await this.verifier.verifyTheElementIsVisible(this.shareThoughtsButton, {
        assertionMessage: 'Share your thoughts button should be visible',
      });
      await this.clickOnElement(this.shareThoughtsButton);
    });
  }

  async clickQuestionButton(): Promise<void> {
    await this.createFeedPostComponent.clickQuestionButton();
  }

  async createAndPostQuestion(options: QuestionOptions): Promise<QuestionResult> {
    return this.createQuestionComponent.createAndPostQuestion(options);
  }

  async editQuestion(questionTitle: string, newTitle: string): Promise<void> {
    await this.createQuestionComponent.editQuestion(questionTitle, newTitle);
  }

  async verifyQuestionCreatedSuccessfully(questionTitle: string): Promise<void> {
    await this.createQuestionComponent.verifyQuestionCreatedSuccessfully(questionTitle);
  }

  async getPostTitle(siteName: string): Promise<string> {
    return await test.step('Get post title', async () => {
      try {
        const postTitleContainer = this.page.locator('header').filter({ hasText: siteName });
        const postTitle = await postTitleContainer.getByRole('heading').first().textContent();
        console.log(`Post title: ${postTitle}`);
        if (!postTitle) {
          throw new Error('Post title not found');
        }
        return postTitle.trim();
      } catch (error) {
        console.error('Error getting post title:', error);
        throw error;
      }
    });
  }

  /**
   * Clicks on the Must Read button to open the Must Read modal
   */
  async clickOnMustReadButton(): Promise<void> {
    await test.step('Click on Must Read button', async () => {
      await this.clickOnElement(this.optionMenuComponent.mustReadButton);
    });
  }

  /**
   * Clicks on the Cancel button in the Must Read modal
   */
  async clickOnMustReadModalCancelButton(): Promise<void> {
    await this.mustReadModalComponent.clickOnMustReadModalCancelButton();
  }
  async clickOnFavouriteContentButton(): Promise<void> {
    await test.step('Click on favourite content button', async () => {
      const publishResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.favouriteContentButton),
        response =>
          response.url().includes(API_ENDPOINTS.content.favourites) &&
          response.request().method() === 'POST' &&
          response.status() === 200,
        {
          timeout: 20_000,
        }
      );
      await publishResponse.finished();
    });
  }

  async verifyUserCanMarkAsFavoriteContent(): Promise<void> {
    await test.step('Verify user can mark content as favorite', async () => {
      await this.verifier.verifyTheElementIsVisible(this.favouriteContentButton, {
        assertionMessage: 'Favorite button should be visible, indicating content can be marked as favorite',
      });
    });
  }

  /**
   * Verifies that the Must Read modal is not visible
   */
  async verifyMustReadModalIsNotVisible(): Promise<void> {
    await this.mustReadModalComponent.verifyMustReadModalIsNotVisible();
  }

  async likeFeedPost(postText: string): Promise<void> {
    await this.listFeedComponent.likeFeedPost(postText);
  }

  async unlikeFeedPost(postText: string): Promise<void> {
    await this.listFeedComponent.likeFeedPost(postText);
  }

  async likeFeedReply(replyText: string): Promise<void> {
    await this.listFeedComponent.likeFeedReply(replyText);
  }

  async unlikeFeedReply(replyText: string): Promise<void> {
    await this.listFeedComponent.likeFeedReply(replyText);
  }

  async verifyLikeCountOnPost(postText: string): Promise<void> {
    await this.listFeedComponent.verifyLikeCountOnPost(postText);
  }

  async verifyLikeCountOnReply(replyText: string): Promise<void> {
    await this.listFeedComponent.verifyLikeCountOnReply(replyText);
  }

  async clickOnOptionMenuButton(): Promise<void> {
    await this.optionMenuComponent.clickOnOptionMenuButton();
  }

  async clickOnRemoveFromHomeCarouselButton(carouselItemId: string): Promise<void> {
    await this.optionMenuComponent.clickOnRemoveFromHomeCarouselButton(carouselItemId);
  }

  async clickOnRemoveFromSiteCarouselButton(siteId: string, carouselItemId: string): Promise<void> {
    await this.optionMenuComponent.clickOnRemoveFromSiteCarouselButton(siteId, carouselItemId);
  }

  /**
   * Gets the count of visible comments on content detail page
   * @returns Promise<number> - Count of visible comments
   */
  async getVisibleCommentCount(): Promise<number> {
    return await test.step('Get visible comment count', async () => {
      // Find reply containers using the new classes - this is the primary method
      // Count only visible comment containers
      const count = await this.page.locator('div[class*="_postBody_eonic_8"]').count();

      return count;
    });
  }

  /**
   * Verifies the count of visible comments on content detail page
   * @param expectedCount - Expected number of visible comments
   */
  async verifyCommentCount(expectedCount: number): Promise<void> {
    await test.step(`Verify comment count is ${expectedCount}`, async () => {
      const actualCount = await this.getVisibleCommentCount();
      if (actualCount !== expectedCount) {
        throw new Error(`Expected ${expectedCount} visible comments, but found ${actualCount}`);
      }
    });
  }

  /**
   * Clicks the "Show more" button for comments
   */
  async clickShowMoreCommentsButton(): Promise<void> {
    await test.step('Click "Show more" button for comments', async () => {
      const showMoreButton = this.page.getByText('Show more');

      await this.verifier.verifyTheElementIsVisible(showMoreButton, {
        assertionMessage: 'Show more button should be visible',
      });

      await this.clickOnElement(showMoreButton);
      const endOfComments = this.page.getByText('End of results');

      await this.verifier.verifyTheElementIsVisible(endOfComments, {
        assertionMessage: 'End of results should be visible',
      });
    });
  }

  /**
   * Clicks the "All Comments" link to navigate to content detail page
   */
  async clickAllCommentsLink(): Promise<void> {
    await test.step('Click "All Comments" link', async () => {
      // The link text is "All comments" (lowercase 'c'), not "All Comments"
      const allCommentsLink = this.page.getByRole('link', { name: 'All comments' }).first();
      await this.clickOnElement(allCommentsLink);
    });
  }

  async verifyFeedRestrictionMessageVisible(expectedText: string): Promise<void> {
    await this.createFeedPostComponent.verifyFeedRestrictionMessageVisible(expectedText);
  }

  async addReplyToComment(replyText: string, postId: string, mentionUserName?: string): Promise<string> {
    return await this.listFeedComponent.addReplyToPost(replyText, postId, mentionUserName);
  }

  /**
   * Adds a reply to a comment with file attachment
   * @param replyText - The text content for the reply
   * @param postId - The ID of the comment to reply to
   * @param filePath - The path to the file to upload
   * @param mentionUserName - Optional user name to mention
   * @returns Promise<string> - The reply text
   */
  async addReplyToCommentWithFile(
    replyText: string,
    postId: string,
    filePath: string,
    mentionUserName?: string
  ): Promise<string> {
    return await this.listFeedComponent.addReplyToPostWithFile(replyText, postId, filePath, mentionUserName);
  }

  async openReplyEditorForPost(postText: string): Promise<void> {
    await this.listFeedComponent.openReplyEditorForPost(postText);
  }

  async verifyCancelButtonVisible(postText: string): Promise<void> {
    await this.listFeedComponent.verifyCancelButtonVisible(postText);
  }

  async clickCancelButton(postText: string): Promise<void> {
    await this.listFeedComponent.clickCancelButton(postText);
  }

  async verifyReplyEditorVisible(postText: string): Promise<void> {
    await this.listFeedComponent.verifyReplyEditorVisible(postText);
  }

  async verifyReplyEditorClosed(postText: string): Promise<void> {
    await this.listFeedComponent.verifyReplyEditorClosed(postText);
  }

  async verifyThePageIsLoadedWithTimelineModeOnContentPage(): Promise<void> {
    await this.listFeedComponent.verifyThePageIsLoadedWithTimelineModeOnContentPage();
  }

  /**
   * Verifies that the share button is not visible on content detail page
   */
  async verifyShareButtonIsNotVisible(): Promise<void> {
    await test.step('Verify share button is not visible on Feed post on content page', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.sharePostButton, {
        assertionMessage: 'Share button should not be visible on content detail page',
      });
    });
  }

  async verifyShareIconIsVisible(postText: string): Promise<void> {
    await this.listFeedComponent.verifyShareIconIsVisible(postText);
  }

  /**
   * Verifies that the share button is not visible on comments
   */
  async verifyContentShareButtonIsVisible(): Promise<void> {
    await test.step('Verify share button is visible for Content Page', async () => {
      await this.verifier.verifyTheElementIsVisible(this.contentSharePostButton, {
        assertionMessage: 'Share button should be visible on Content Page when timeline mode is enabled',
        timeout: 10000,
      });
    });
  }

  /**
   * Verifies that the reaction button is visible on feed posts/comments
   */
  async verifyReactionButtonIsVisible(): Promise<void> {
    await this.listFeedComponent.verifyReactionButtonIsVisible();
  }

  /**
   * Verifies that the reaction button is visible on feed replies/comment replies
   */
  async verifyReactionButtonIsVisibleForReply(): Promise<void> {
    await this.listFeedComponent.verifyReactionButtonIsVisibleForReply();
  }

  async verifyAllReactionEmojisVisible(postText: string): Promise<void> {
    await this.listFeedComponent.verifyAllReactionEmojisVisible(postText);
  }

  async hoverOnReactionButton(postText: string): Promise<void> {
    await this.listFeedComponent.hoverOnReactionButton(postText);
  }

  /**
   * Verifies that a reply is visible
   */
  async verifyReplyIsVisible(replyText: string): Promise<void> {
    await this.listFeedComponent.verifyReplyIsVisible(replyText);
  }

  async verifyFeedPlaceholderText(expectedPlaceholder: string): Promise<void> {
    await this.createFeedPostComponent.verifyFeedPlaceholderText(expectedPlaceholder);
  }

  async makeContentForEveryoneInOrganization(): Promise<void> {
    await this.mustReadModalComponent.selectAllOrganizationToggle();
  }

  async clickOnMakeMustReadButton(): Promise<void> {
    await this.mustReadModalComponent.clickOnMakeMustReadButton();
  }

  async verifyContentIsMustRead(): Promise<void> {
    await this.mustReadModalComponent.verifyMustReadModalIsVisible();
  }

  async verifyMustReadModalIsVisible(): Promise<void> {
    await this.mustReadModalComponent.verifyMustReadModalIsVisible();
  }

  async verifyContentIsNotAMustRead(): Promise<void> {
    await this.mustReadModalComponent.verifyContentIsNotAMustRead();
  }

  async verifyMustReadButtonIsNotVisible(): Promise<void> {
    await this.optionMenuComponent.verifyMustReadButtonIsNotVisible();
  }

  async verifyCommentTimestampFormat(contentCommentText: string): Promise<void> {
    await this.listFeedComponent.verifyTimestampFormat(contentCommentText);
  }

  async verifyPostCreationCancelButtonVisible(): Promise<void> {
    await this.createFeedPostComponent.verifyPostCreationCancelButtonVisible();
  }

  async clickPostCreationCancelButton(): Promise<void> {
    await this.createFeedPostComponent.clickPostCreationCancelButton();
  }

  async verifyPostCreationEditorClosed(): Promise<void> {
    await this.createFeedPostComponent.verifyPostCreationEditorClosed();
  }

  async clickShareContentButton(): Promise<void> {
    await test.step('Click Share content button', async () => {
      await this.clickOnElement(this.shareContentButton);
    });
  }

  async clickCloseButtonForShareContent(): Promise<void> {
    await test.step('Click Close button for share content', async () => {
      await this.clickOnElement(this.closeShareContentModalButton);
    });
  }

  /**
   * Enables restricted viewers on a Page and selects the specified site roles
   * @param targetUsers - Array of site permissions to restrict the Page to (e.g., OWNER, MANAGER)
   */
  async enablePageRestrictedViewers(targetUsers: SitePermission[]): Promise<void> {
    await test.step(`Enable Page restricted viewers: ${targetUsers.join(', ')}`, async () => {
      // Click on option menu (ellipsis)
      await this.clickOnElement(this.editPageButton);

      // Enable restricted viewers toggle
      await this.clickOnElement(this.restrictedViewersToggle);

      await this.selectTargetUsers(targetUsers);

      // Click on Publish Changes button to apply the restriction
      await this.clickOnElement(this.publishChangesButton);
    });
  }
  async selectTargetUsers(targetUsers: SitePermission[]): Promise<void> {
    await this.clickOnElement(this.audiencePickerButton);

    await this.clickOnElement(this.siteDropdown.first());

    await this.clickOnElement(this.siteSecondDropdown);

    await this.clickOnElement(this.memberDropdown);

    await this.clickOnElement(this.ownerAndManagerDropdown);

    if (targetUsers.includes(SitePermission.MANAGER)) {
      await this.clickOnElement(this.managerCheckbox);
    }

    if (targetUsers.includes(SitePermission.OWNER)) {
      await this.clickOnElement(this.ownerCheckbox);
    }

    if (targetUsers.includes(SitePermission.MEMBER)) {
      await this.clickOnElement(this.memberCheckbox);
    }

    if (targetUsers.includes(SitePermission.CONTENT_MANAGER)) {
      await this.clickOnElement(this.contentManagerCheckbox);
    }

    await this.clickOnElement(this.audienceDoneButton);
  }
}
