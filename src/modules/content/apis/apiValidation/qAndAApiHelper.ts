import { expect, test } from '@playwright/test';

import { QuestionResponse } from '@core/types/feed.type';

export class QAndAApiHelper {
  /**
   * Validates the basic question response structure (status, message, type)
   * @param questionResponse - The question response to validate
   */
  async validateQuestionResponseBasic(questionResponse: QuestionResponse): Promise<void> {
    await test.step('Validate question response basic fields', async () => {
      expect(questionResponse.status, 'Status should be success').toBe('success');
      expect(questionResponse.message, 'Message should match').toBe('Feed Post has been successfully created');
      expect(questionResponse.result.type, 'Type should be question').toBe('question');
    });
  }

  /**
   * Validates question identification fields (feedId, title)
   * @param questionResponse - The question response to validate
   * @param expectedTitleText - Optional expected text that should be in the title
   */
  async validateQuestionIdentification(questionResponse: QuestionResponse, expectedTitleText?: string): Promise<void> {
    await test.step('Validate question identification fields', async () => {
      expect(questionResponse.result.feedId, 'Feed ID should be present').toBeTruthy();
      expect(typeof questionResponse.result.feedId, 'Feed ID should be a string').toBe('string');
      expect(questionResponse.result.title, 'Title should be present').toBeTruthy();
      expect(typeof questionResponse.result.title, 'Title should be a string').toBe('string');
      if (expectedTitleText) {
        expect(questionResponse.result.title, 'Title should contain expected text').toContain(expectedTitleText);
      }
    });
  }

  /**
   * Validates question metadata (commentCount, site, content)
   * @param questionResponse - The question response to validate
   * @param isHomeFeed - Whether this is a home feed question (site should be null)
   */
  async validateQuestionMetadata(questionResponse: QuestionResponse, isHomeFeed: boolean = true): Promise<void> {
    await test.step('Validate question metadata', async () => {
      expect(questionResponse.result.commentCount, 'Comment count should be 0 for new question').toBe(0);
      if (isHomeFeed) {
        expect(questionResponse.result.site, 'Site should be null for home feed').toBeNull();
        expect(questionResponse.result.content, 'Content should be null').toBeNull();
      }
    });
  }

  /**
   * Validates question with all fields (mentions, topics, links)
   * @param questionResponse - The question response to validate
   */
  async validateQuestionWithAllFields(questionResponse: QuestionResponse): Promise<void> {
    await test.step('Validate question with all fields', async () => {
      expect(Array.isArray(questionResponse.result.listOfMentions), 'listOfMentions should be an array').toBe(true);
      expect(Array.isArray(questionResponse.result.listOfTopics), 'listOfTopics should be an array').toBe(true);
      expect(Array.isArray(questionResponse.result.listOfLinks), 'listOfLinks should be an array').toBe(true);
    });
  }

  /**
   * Validates updated question response
   * @param updateResponse - The update response to validate
   * @param expectedTitleText - Optional expected text that should be in the updated title
   */
  async validateQuestionUpdate(updateResponse: QuestionResponse, expectedTitleText?: string): Promise<void> {
    await test.step('Validate question is updated successfully', async () => {
      expect(updateResponse.status, 'Status should be success').toBe('success');
      expect(updateResponse.result, 'Result should be present').toBeTruthy();
      if (expectedTitleText && updateResponse.result.title) {
        expect(updateResponse.result.title, 'Title should be updated').toContain(expectedTitleText);
      }
    });
  }

  /**
   * Validates question delete response
   * @param deleteResponse - The delete response to validate
   */
  async validateQuestionDelete(deleteResponse: any): Promise<void> {
    await test.step('Validate question is deleted successfully', async () => {
      expect(deleteResponse.status, 'Status should be success').toBe('success');
    });
  }

  /**
   * Validates upvote response
   * @param upvoteResponse - The upvote response to validate
   */
  async validateUpvoteResponse(upvoteResponse: any): Promise<void> {
    await test.step('Validate upvote response', async () => {
      expect(upvoteResponse, 'Upvote response should be present').toBeTruthy();
      expect(upvoteResponse.status, 'Upvote status should be success').toBe('success');
    });
  }

  /**
   * Validates remove upvote response
   * @param removeUpvoteResponse - The remove upvote response to validate
   */
  async validateRemoveUpvoteResponse(removeUpvoteResponse: any): Promise<void> {
    await test.step('Validate remove upvote response', async () => {
      expect(removeUpvoteResponse, 'Remove upvote response should be present').toBeTruthy();
      expect(removeUpvoteResponse.status, 'Remove upvote status should be success').toBe('success');
    });
  }

  /**
   * Validates a complete question creation response for home feed
   * @param questionResponse - The question response to validate
   * @param expectedTitleText - Optional expected text that should be in the title
   */
  async validateQuestionCreation(questionResponse: QuestionResponse, expectedTitleText?: string): Promise<void> {
    await this.validateQuestionResponseBasic(questionResponse);
    await this.validateQuestionIdentification(questionResponse, expectedTitleText);
    await this.validateQuestionMetadata(questionResponse, true);
  }

  /**
   * Validates answer creation response
   * @param answerResponse - The answer response to validate
   */
  async validateAnswerCreation(answerResponse: any): Promise<void> {
    await test.step('Validate answer creation response', async () => {
      expect(answerResponse.status, 'Status should be success').toBe('success');
      expect(answerResponse.message, 'Message should match').toBe(
        'Comment has been successfully created Comment count of the post also updated successfully'
      );
      expect(answerResponse.result, 'Result should be present').toBeTruthy();
      expect(answerResponse.result.commentId, 'Comment ID should be present').toBeTruthy();
      expect(typeof answerResponse.result.commentId, 'Comment ID should be a string').toBe('string');
      expect(answerResponse.result.feedId, 'Feed ID should be present').toBeTruthy();
      expect(answerResponse.result.reactionCount, 'Reaction count should be 0').toBe(0);
      expect(answerResponse.result.isToxic, 'isToxic should be false').toBe(false);
      expect(answerResponse.result.isApproved, 'isApproved should be false').toBe(false);
      expect(answerResponse.result.authoredBy, 'AuthoredBy should be present').toBeDefined();
      expect(answerResponse.result.authoredBy.userId, 'Author userId should be present').toBeTruthy();
      expect(answerResponse.result.authoredBy.name, 'Author name should be present').toBeTruthy();
      expect(answerResponse.result.createdAt, 'CreatedAt should be present').toBeTruthy();
      expect(answerResponse.result.modifiedAt, 'ModifiedAt should be present').toBeTruthy();
    });
  }

  /**
   * Validates answer update response
   * @param answerResponse - The answer update response to validate
   */
  async validateAnswerUpdate(answerResponse: any): Promise<void> {
    await test.step('Validate answer update response', async () => {
      expect(answerResponse.status, 'Status should be success').toBe('success');
      expect(answerResponse.message, 'Message should match').toBe('Comment has been sucessfully updated');
      expect(answerResponse.result, 'Result should be present').toBeTruthy();
      expect(answerResponse.result.commentId, 'Comment ID should be present').toBeTruthy();
      expect(answerResponse.result.feedId, 'Feed ID should be present').toBeTruthy();
      expect(answerResponse.result.reactionCount, 'Reaction count should be 0').toBe(0);
      expect(answerResponse.result.isToxic, 'isToxic should be false').toBe(false);
      expect(answerResponse.result.isApproved, 'isApproved should be false').toBe(false);
      expect(answerResponse.result.authoredBy, 'AuthoredBy should be present').toBeDefined();
      expect(answerResponse.result.createdAt, 'CreatedAt should be present').toBeTruthy();
      expect(answerResponse.result.modifiedAt, 'ModifiedAt should be present').toBeTruthy();
    });
  }

  /**
   * Validates answer delete response
   * @param deleteResponse - The delete response to validate
   */
  async validateAnswerDelete(deleteResponse: any): Promise<void> {
    await test.step('Validate answer delete response', async () => {
      expect(deleteResponse.status, 'Status should be success').toBe('success');
      expect(deleteResponse.message, 'Message should match').toBe(
        'Comment has been sucessfully deleted. Comment count of the post also updated successfully'
      );
      expect(deleteResponse.result, 'Result should be present').toBeTruthy();
      expect(deleteResponse.result.commentId, 'Comment ID should be present').toBeTruthy();
    });
  }

  /**
   * Validates answer upvote response
   * @param upvoteResponse - The upvote response to validate
   */
  async validateAnswerUpvoteResponse(upvoteResponse: any): Promise<void> {
    await test.step('Validate answer upvote response', async () => {
      expect(upvoteResponse, 'Upvote response should be present').toBeTruthy();
      expect(upvoteResponse.status, 'Upvote status should be success').toBe('success');
      expect(upvoteResponse.message, 'Message should match').toBe('Comment reaction has been successfully added');
    });
  }

  /**
   * Validates answer remove upvote response
   * @param removeUpvoteResponse - The remove upvote response to validate
   */
  async validateAnswerRemoveUpvoteResponse(removeUpvoteResponse: any): Promise<void> {
    await test.step('Validate answer remove upvote response', async () => {
      expect(removeUpvoteResponse, 'Remove upvote response should be present').toBeTruthy();
      expect(removeUpvoteResponse.status, 'Remove upvote status should be success').toBe('success');
      expect(removeUpvoteResponse.message, 'Message should match').toBe(
        'Comment reaction has been successfully deleted'
      );
    });
  }

  /**
   * Validates fetch answers response
   * @param fetchResponse - The fetch answers response to validate
   */
  async validateFetchAnswersResponse(fetchResponse: any): Promise<void> {
    await test.step('Validate fetch answers response', async () => {
      expect(fetchResponse.status, 'Status should be success').toBe('success');
      expect(fetchResponse.result, 'Result should be present').toBeTruthy();
      expect(fetchResponse.result.listOfItems, 'listOfItems should be present').toBeDefined();
      expect(Array.isArray(fetchResponse.result.listOfItems), 'listOfItems should be an array').toBe(true);
      if (fetchResponse.result.listOfItems.length > 0) {
        const comment = fetchResponse.result.listOfItems[0];
        expect(comment.commentId, 'Comment ID should be present').toBeTruthy();
        expect(comment.feedId, 'Feed ID should be present').toBeTruthy();
        expect(Array.isArray(comment.listOfFiles), 'listOfFiles should be an array').toBe(true);
        expect(Array.isArray(comment.listOfMentions), 'listOfMentions should be an array').toBe(true);
      }
    });
  }

  /**
   * Validates question with files
   * @param questionResponse - The question response to validate
   */
  async validateQuestionWithFiles(questionResponse: QuestionResponse): Promise<void> {
    await test.step('Validate question with files', async () => {
      expect(questionResponse.result.listOfFiles, 'listOfFiles should be present').toBeDefined();
      expect(Array.isArray(questionResponse.result.listOfFiles), 'listOfFiles should be an array').toBe(true);
      expect(questionResponse.result.listOfFiles.length, 'listOfFiles should not be empty').toBeGreaterThan(0);
    });
  }

  /**
   * Validates question creation on site feed
   * @param questionResponse - The question response to validate
   * @param expectedTitleText - Optional expected text that should be in the title
   * @param expectedSiteId - Optional expected site ID
   */
  async validateQuestionCreationOnSiteFeed(
    questionResponse: QuestionResponse,
    expectedTitleText?: string,
    expectedSiteId?: string
  ): Promise<void> {
    await this.validateQuestionResponseBasic(questionResponse);
    await this.validateQuestionIdentification(questionResponse, expectedTitleText);
    await this.validateQuestionMetadata(questionResponse, false);
    if (expectedSiteId) {
      await test.step('Validate question site information', async () => {
        expect(questionResponse.result.site, 'Site should be present for site feed').toBeTruthy();
        expect(questionResponse.result.site?.siteId, 'Site ID should match').toBe(expectedSiteId);
      });
    }
  }

  /**
   * Validates answer creation with all fields (mentions, topics)
   * @param answerResponse - The answer response to validate
   */
  async validateAnswerCreationWithAllFields(answerResponse: any): Promise<void> {
    await test.step('Validate answer creation with all fields', async () => {
      expect(answerResponse.status, 'Status should be success').toBe('success');
      expect(answerResponse.result, 'Result should be present').toBeTruthy();
      expect(answerResponse.result.commentId, 'Comment ID should be present').toBeTruthy();
      expect(answerResponse.result.feedId, 'Feed ID should be present').toBeTruthy();
      expect(Array.isArray(answerResponse.result.listOfMentions), 'listOfMentions should be an array').toBe(true);
      expect(Array.isArray(answerResponse.result.listOfTopics), 'listOfTopics should be an array').toBe(true);
    });
  }

  /**
   * Validates error response for deleted answer operations
   * @param errorResponse - The error response to validate
   * @param expectedMessage - Expected error message
   * @param expectedStatusCode - Expected HTTP status code
   */
  async validateAnswerErrorResponse(
    errorResponse: any,
    expectedMessage: string,
    expectedStatusCode: number = 404
  ): Promise<void> {
    await test.step('Validate error response for deleted answer', async () => {
      expect(errorResponse.status, 'Status should be error').toBe('error');
      expect(errorResponse.message, 'Error message should match').toBe(expectedMessage);
    });
  }

  /**
   * Validates the updateAppConfig response for Q&A enable/disable
   * @param response - The API response from updateAppConfig
   */
  async validateUpdateAppConfigResponse(response: any): Promise<void> {
    await test.step('Validate updateAppConfig response', async () => {
      expect(response.ok(), 'Update App Config should be successful').toBe(true);
    });
  }

  /**
   * Validates that Q&A is enabled in the app configuration
   * @param configResponse - The app configuration response
   */
  async validateQAndAEnabled(configResponse: any): Promise<void> {
    await test.step('Validate Q&A is enabled', async () => {
      expect(configResponse.result.isQuestionAnswerEnabled, 'isQuestionAnswerEnabled should be true').toBe(true);
    });
  }

  /**
   * Validates that Q&A is disabled in the app configuration
   * @param configResponse - The app configuration response
   */
  async validateQAndADisabled(configResponse: any): Promise<void> {
    await test.step('Validate Q&A is disabled', async () => {
      expect(configResponse.result.isQuestionAnswerEnabled, 'isQuestionAnswerEnabled should be false').toBe(false);
    });
  }

  /**
   * Validates that Q&A is disabled in the app configuration with retry logic
   * @param getConfigFn - Function that returns the app configuration
   * @param maxRetries - Maximum number of retries (default: 2)
   * @param retryDelay - Delay between retries in milliseconds (default: 2000)
   */
  async validateQAndADisabledWithRetry(
    getConfigFn: () => Promise<any>,
    maxRetries: number = 2,
    retryDelay: number = 2000
  ): Promise<void> {
    await test.step(`Validate Q&A is disabled with retry (max ${maxRetries} attempts)`, async () => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const configResponse = await getConfigFn();
          expect(
            configResponse.result.isQuestionAnswerEnabled,
            `isQuestionAnswerEnabled should be false (attempt ${attempt + 1}/${maxRetries + 1})`
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
        `Failed to validate Q&A is disabled after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`
      );
    });
  }

  /**
   * Validates error message for updating deleted answer
   * @param error - The error object
   */
  async validateUpdateDeletedAnswerError(error: any): Promise<void> {
    await test.step('Validate error message for updating deleted answer', async () => {
      expect(error.message, 'Error should indicate failure to update deleted answer').toMatch(/404|Failed to update/i);
    });
  }

  /**
   * Validates that an error was caught when editing deleted answer
   * @param errorCaught - Boolean indicating if error was caught
   */
  async validateErrorCaughtForEditDeletedAnswer(errorCaught: boolean): Promise<void> {
    await test.step('Validate error was caught when editing deleted answer', async () => {
      expect(errorCaught, 'Expected error when editing deleted answer').toBe(true);
    });
  }

  /**
   * Validates error message for deleting already deleted answer
   * @param error - The error object
   */
  async validateDeleteAlreadyDeletedAnswerError(error: any): Promise<void> {
    await test.step('Validate error message for deleting already deleted answer', async () => {
      expect(error.message, 'Error should indicate failure to delete already deleted answer').toMatch(
        /404|Failed to delete|Not Found/i
      );
    });
  }

  /**
   * Validates that an error was caught when deleting already deleted answer
   * @param errorCaught - Boolean indicating if error was caught
   */
  async validateErrorCaughtForDeleteAlreadyDeletedAnswer(errorCaught: boolean): Promise<void> {
    await test.step('Validate error was caught when deleting already deleted answer', async () => {
      expect(errorCaught, 'Expected error when deleting already deleted answer').toBe(true);
    });
  }
}
