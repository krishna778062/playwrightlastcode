import { User } from '@core/types/user.type';
import { Roles } from '@core/constants/roles';
import { AppManagerApiClient } from '@core/apiClients/appManagerApiClient';
import { TestDataBuilderUsingAPI } from '@/src/core/utils/testDataBuilder';

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
  testDataBuilder: TestDataBuilderUsingAPI;
}
