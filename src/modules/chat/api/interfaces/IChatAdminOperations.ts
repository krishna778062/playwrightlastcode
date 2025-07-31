import { ChatGroup, CreateGroupResponse } from '@core/types/group.type';

import { CreateChatGroupParams } from '@/src/modules/chat/types/chat.type';

export interface IChatAdminOperations {
  /**
   * Creates a new chat group with specified users
   * @param name - The name of the chat group
   * @param userIds - Array of user IDs to add to the group
   * @param params - Optional parameters for group creation
   * @returns Promise with the created group response
   */
  createChatGroup(name: string, userIds: string[], params?: CreateChatGroupParams): Promise<CreateGroupResponse>;

  /**
   * Adds users to an existing chat group
   * @param groupId - The ID of the target chat group
   * @param userIds - Array of user IDs to add to the group
   * @returns Promise<void>
   */
  addUsersToExistingChatGroup(groupId: string, userIds: string[]): Promise<void>;

  /**
   * Retrieves a list of chat groups with pagination
   * @param params - Pagination parameters
   * @returns Promise with array of chat groups
   */
  getListOfChatGroups(params: { page?: number; perPage?: number }): Promise<ChatGroup[]>;

  /**
   * Searches for a chat group by its name
   * @param groupName - The name of the group to search for
   * @returns Promise with the matching chat group
   */
  searchChatGroupByName(groupName: string): Promise<ChatGroup>;
}
