import { APIRequestContext, test } from '@playwright/test';

import { IChatAdminOperations } from '@chat/api/interfaces/IChatAdminOperations';
import { CreateChatGroupParams } from '@chat/types/chat.type';
import { HttpClient } from '@core/api/clients/httpClient';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { ChatGroup, CreateGroupResponse } from '@core/types/group.type';

export class ChatService implements IChatAdminOperations {
  readonly httpClient: HttpClient;
  constructor(context: APIRequestContext, baseUrl: string) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  async createChatGroup(name: string, userIds: string[], params?: CreateChatGroupParams): Promise<CreateGroupResponse> {
    if (userIds.length === 0) {
      throw new Error('User ids are required to create a chat group');
    }

    let result: CreateGroupResponse;
    await test.step(`Creating a chat group with name ${name}`, async () => {
      const response = await this.httpClient.post(API_ENDPOINTS.appManagement.groups.create, {
        data: {
          name,
          description: params?.description || `Adding automation group ${name}`,
          accessType: params?.accessType || 'PUBLIC',
          postPermission: params?.postPermission || 'OPEN',
          users: userIds,
          conversationType: params?.conversationType || 'GROUP',
        },
      });
      result = await this.httpClient.parseResponse<CreateGroupResponse>(response);
    });
    return result!;
  }

  async addUsersToExistingChatGroup(groupId: string, userIds: string[]): Promise<void> {
    await test.step(`Adding ${userIds.length} users to group ${groupId}`, async () => {
      await this.httpClient.post(API_ENDPOINTS.appManagement.groups.addMembers, {
        data: {
          users: userIds,
          conversation_id: groupId,
        },
      });
    });
  }

  async getListOfChatGroups({ page = 1, perPage = 100 }): Promise<ChatGroup[]> {
    const listOfGroups: ChatGroup[] = [];

    await test.step(`Getting list of chat groups from page ${page}`, async () => {
      while (true) {
        const response = await this.httpClient.get(API_ENDPOINTS.appManagement.groups.listOfGroups(page, perPage));
        const responseJson = await this.httpClient.parseResponse<{ result: { records: ChatGroup[] } }>(response);
        if (responseJson.result.records.length === 0) {
          break;
        }
        listOfGroups.push(...responseJson.result.records);
        page++;
      }
    });
    return listOfGroups;
  }

  async searchChatGroupByName(groupName: string): Promise<ChatGroup> {
    const response = await this.httpClient.get(API_ENDPOINTS.appManagement.groups.search(groupName));
    const responseJson = await this.httpClient.parseResponse<{ result: { records: ChatGroup[] } }>(response);

    const groupToFind = responseJson.result.records.find(group => group.name === groupName);
    if (!groupToFind) {
      throw new Error(`Group ${groupName} not found in fetched list of groups`);
    }
    return groupToFind;
  }
}
