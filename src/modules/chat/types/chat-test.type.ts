import { User } from '@core/types/user.type';
import { Roles } from '@core/constants/roles';
import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { TestDataBuilderUsingAPI } from '@/src/core/utils/testDataBuilder';
import { ChatGroupTestDataBuilder } from '../builders';

export interface ChatTestUser extends User {
  userId: string;
  chatUserId: string;
}

export interface ChatTestSetupConfig {
  usersByRole: {
    [key in Roles]?: number;
  };
  groupName?: string;
  password?: string;
}

export interface ChatTestSetupResult {
  users: ChatTestUser[];
  groupName: string;
  appManagerApiClient: AppManagerApiClient;
  testDataBuilder: ChatGroupTestDataBuilder;
}
