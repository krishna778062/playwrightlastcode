import { CreateGroupResponse, ChatGroup } from '@core/types/group.type';

export interface CreateChatGroupParams {
  description?: string;
  accessType?: string;
  postPermission?: string;
  conversationType?: string;
}

export interface IChatAdminOperations {
  createChatGroup(
    name: string,
    userIds: string[],
    params?: CreateChatGroupParams
  ): Promise<CreateGroupResponse>;
  addUsersToExistingChatGroup(groupId: string, userIds: string[]): Promise<void>;
  getListOfChatGroups(params: { page?: number; perPage?: number }): Promise<ChatGroup[]>;
  searchChatGroupByName(groupName: string): Promise<ChatGroup>;
}
