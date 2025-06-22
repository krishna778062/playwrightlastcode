import { TestUser } from '@core/types/test.types';
import { Roles } from '@core/constants/roles';
import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { ChatGroupTestDataBuilder } from '@chat/test-data-builders/ChatGroupTestDataBuilder';

export interface ChatTestUser extends TestUser {
  chatUserId: string;
}

export interface ChatTestSetupConfig {
  usersByRole: {
    [key in Roles]?: number;
  };
  groupName?: string;
  password?: string;
  createGroup?: boolean;
  recordVideo?: boolean;
}

export interface ChatTestSetupResult {
  users: ChatTestUser[];
  groupName: string;
  appManagerApiClient: AppManagerApiClient;
  testDataBuilder: ChatGroupTestDataBuilder;
}
