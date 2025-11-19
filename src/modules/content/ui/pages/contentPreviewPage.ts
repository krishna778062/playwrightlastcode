import { Page, test } from '@playwright/test';

import {
  CreateQuestionComponent,
  QuestionOptions,
  QuestionResult,
} from '@content/ui/components/createQuestionComponent';
import { PromotePageModal } from '@content/ui/components/promotePageModal';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';
import { ContentDetailsComponent } from '@/src/modules/content/ui/components/contentDetailsComponent';
import { CreateFeedPostComponent } from '@/src/modules/content/ui/components/createFeedPostComponent';
import { ListFeedComponent } from '@/src/modules/content/ui/components/listFeedComponent';
import { MustReadModalComponent } from '@/src/modules/content/ui/components/mustReadModalComponent';
import { OptionMenuComponent } from '@/src/modules/content/ui/components/optionMenuComponent';

export interface IContentPreviewPageActions {
  handlePromotionPageStep: () => Promise<void>;
  clickOnApproveOrRejectButton: (action: string) => Promise<void>;
  enterRejectReason: (reason: string) => Promise<void>;
  verifyCommentOptionIsNotVisible: () => Promise<void>;
  unpublishingTheContent: () => Promise<void>;
  publishingTheContent: () => Promise<void>;
  editPost: (currentText: string, newText: string) => Promise<void>;
  clickShareThoughtsButton: () => Promise<void>;
  clickQuestionButton: () => Promise<void>;
  createAndPostQuestion: (options: QuestionOptions) => Promise<QuestionResult>;
  editQuestion: (questionTitle: string, newTitle: string) => Promise<void>;
  clickOnOptionMenuButton: () => Promise<void>;
  clickOnMustReadButton: () => Promise<void>;
  clickOnMustReadModalCancelButton: () => Promise<void>;
  addReplyToComment: (replyText: string, postId: string, mentionUserName?: string) => Promise<string>;
  makeContentForEveryoneInOrganization: () => Promise<void>;
  clickOnMakeMustReadButton: () => Promise<void>;
}

export interface IContentPreviewPageAssertions {
  verifyContentPublishedSuccessfully: (title: string, successMessage: string) => Promise<void>;
  verifyContentStatus: (status: string) => Promise<void>;
  verifyContentIsInPublishedStatus: () => Promise<void>;
  verifyContentHasSubmitForApprovalButton: () => Promise<void>;
  verifyValidateOptionOnContentPreviewPage: () => Promise<void>;
  verifyingAlbumHeadingOnContentPreviewPage: () => Promise<void>;
  verifyUnpublishedContentToastMessage: (toastMessage: string) => Promise<void>;
  verifyCommentOptionIsNotVisible: () => Promise<void>;
  verifyCommentOptionIsVisible: () => Promise<void>;
  waitForPostToBeVisible: (expectedText: string) => Promise<void>;
  verifyQuestionCreatedSuccessfully: (questionTitle: string) => Promise<void>;
  verifyMustReadModalIsNotVisible: () => Promise<void>;
  verifyMustReadModalIsVisible: () => Promise<void>;
  verifyFeedRestrictionMessageVisible: (expectedText: string) => Promise<void>;
  verifyContentIsMustRead: () => Promise<void>;
  verifyContentIsNotAMustRead: () => Promise<void>;
  verifyFeedPlaceholderText: (expectedPlaceholder: string) => Promise<void>;
}

export class ContentPreviewPage extends BasePage implements IContentPreviewPageActions, IContentPreviewPageAssertions {
  // Additional locators for promotion and verification
  readonly contentTitleHeading = (title: string) => this.page.locator('h1', { hasText: title });
  readonly successMessage = (message: string) => this.page.locator('div[class*="Toast-module"]').getByText(message);
  readonly publishButton = this.page.getByRole('button', { name: 'Publish' });
  // Action locators
  readonly sendFeedbackTab = this.page.getByTestId('send-feedback-tab');
  readonly closeModalButton = this.page.getByTestId('close-modal-button');
  readonly versionHistoryButton = this.page.getByRole('button', { name: 'Version history' });
  readonly optionMenuDropdown = this.page.getByRole('button', { name: 'Category option' });
  readonly unpublishButton = this.page.getByRole('button', { name: 'Unpublish' });
  readonly deleteButton = this.page.getByRole('button', { name: 'Delete' });
  readonly contentStatus = (status: string) =>
    this.page.locator('div.ContentAdminBar-status').filter({ hasText: status });
  readonly approveOrRejectButton = (action: string) => this.page.getByRole('button', { name: action });
  readonly siteContentTab = this.page
    .getByTestId('content-tab')
    .or(
      this.page.getByRole('button', { name: 'Content' }).or(this.page.getByRole('link').filter({ hasText: 'content' }))
    );
  readonly publishStatus = this.page.getByText('Published today');
  readonly rejectButton = this.page.locator('span:has-text("Reject")');
  readonly rejectReasonTextarea = this.page.locator('div.Modal-content div textarea');
  readonly submitForApprovalButton = this.page.getByRole('button', { name: 'Submit for approval' });
  readonly sendHistoryPopup = this.page.getByTestId('send-history-popup');
  readonly versionHistoryPopup = this.page.getByTestId('version-history-popup');
  readonly ellipsisButton = this.page.locator('button[aria-label="Category option"]').first();
  readonly checkValidateOption = this.page.getByRole('button', { name: 'Validate' });
  readonly albumHeading = this.page.getByRole('heading', { name: 'Album', exact: true });
  readonly shareThoughtsButton = this.page.locator('span', { hasText: 'Share your thought' });

  // Page components
  readonly promotePageModal: PromotePageModal;
  readonly mustReadModalComponent: MustReadModalComponent;
  readonly optionMenuComponent: OptionMenuComponent;
  private contentDetailsComponent: ContentDetailsComponent;
  private createFeedPostComponent: CreateFeedPostComponent;
  private listFeedComponent: ListFeedComponent;
  private createQuestionComponent: CreateQuestionComponent;

  constructor(page: Page, siteId?: string, contentId?: string, contentType?: string) {
    super(
      page,
      siteId && contentId && contentType ? PAGE_ENDPOINTS.getContentPreviewPage(siteId, contentId, contentType) : ''
    );
    this.promotePageModal = new PromotePageModal(page);
    this.mustReadModalComponent = new MustReadModalComponent(page);
    this.optionMenuComponent = new OptionMenuComponent(page);
    this.contentDetailsComponent = new ContentDetailsComponent(page);
    this.createFeedPostComponent = new CreateFeedPostComponent(page);
    this.listFeedComponent = new ListFeedComponent(page);
    this.createFeedPostComponent = new CreateFeedPostComponent(page);
    this.createQuestionComponent = new CreateQuestionComponent(page);
  }

  // Actions
  get actions(): IContentPreviewPageActions {
    return this;
  }

  // Assertions
  get assertions(): IContentPreviewPageAssertions {
    return this;
  }

  /**
   * Verifies the preview page is loaded
   */
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
  async publishingTheContent(): Promise<void> {
    await test.step('Publishing the content', async () => {
      await this.clickOnElement(this.publishButton);
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

  /**
   * Clicks the share thoughts button to open post editor
   */
  async clickShareThoughtsButton(): Promise<void> {
    await test.step('Click on Share your thoughts button', async () => {
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

  async verifyFeedRestrictionMessageVisible(expectedText: string): Promise<void> {
    await this.createFeedPostComponent.verifyFeedRestrictionMessageVisible(expectedText);
  }
  async addReplyToComment(replyText: string, postId: string, mentionUserName?: string): Promise<string> {
    return await this.listFeedComponent.addReplyToPost(replyText, postId, mentionUserName);
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
}
