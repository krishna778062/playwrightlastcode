import { ChatGroupTestDataBuilder } from '@chat/test-data-builders/ChatGroupTestDataBuilder';
import { Roles } from '@core/constants/roles';
import { TestUser } from '@core/types/test.types';

import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';

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
