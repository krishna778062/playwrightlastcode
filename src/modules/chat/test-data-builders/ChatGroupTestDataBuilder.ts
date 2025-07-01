import { UserTestDataBuilder } from '@core/test-data-builders/UserTestDataBuilder';
import { CreateChatGroupParams } from '@chat/types/chat.type';
import { Roles } from '@core/constants/roles';
import { User } from '@core/types/user.type';
import { test } from '@playwright/test';
import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';

export class ChatGroupTestDataBuilder {
  private readonly userBuilder: UserTestDataBuilder;
  private readonly apiClient: AppManagerApiClient;

  constructor(apiClient: AppManagerApiClient) {
    this.apiClient = apiClient;
    this.userBuilder = new UserTestDataBuilder(apiClient);
  }

  /**
   * Returns the user builder
   * @returns The user builder
   */
  public getUserBuilder(): UserTestDataBuilder {
    return this.userBuilder;
  }

  /**
   * Creates a new chat group
   * @param groupName - The name of the chat group
   * @param userIds - Array of user IDs to add to the group
   * @param groupParams - Optional parameters for group creation
   * @returns The name of the created group
   */
  async createChatGroup(groupName: string, userIds: string[], groupParams?: CreateChatGroupParams) {
    return await test.step(`Creating chat group: ${groupName}`, async () => {
      if (userIds.length > 0) {
        await this.apiClient.getChatService().createChatGroup(groupName, userIds, groupParams);
      }
      return groupName;
    });
  }

  /**
   * Gets the chat user ID for a user
   * @param firstName - The user's first name
   * @param lastName - The user's last name
   * @returns The chat user ID
   */
  async getChatUserId(firstName: string, lastName: string): Promise<string> {
    return await test.step(`Getting chat user ID for ${firstName} ${lastName}`, async () => {
      return this.apiClient.getUserManagementService().getChatUserId(firstName, lastName);
    });
  }

  /**
   * Gets chat user IDs for multiple users
   * @param users - Array of users
   * @returns Array of chat user IDs
   */
  async getChatUserIds(users: User[]): Promise<string[]> {
    return await test.step('Getting chat user IDs for multiple users', async () => {
      return Promise.all(users.map(user => this.getChatUserId(user.first_name, user.last_name)));
    });
  }
}
