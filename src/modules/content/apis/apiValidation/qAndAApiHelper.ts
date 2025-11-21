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
}
