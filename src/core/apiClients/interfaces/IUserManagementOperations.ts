import { User } from '@core/types/user.type';
import { AddUserResponse } from '@core/types/group.type';
import { Roles } from '@core/constants/roles';

export interface IUserManagementOperations {
  addUser(user: User, role: Roles): Promise<AddUserResponse>;
  getChatUserId(firstName: string, lastName: string): Promise<string>;
  waitForUserToBeAdded(firstName: string, lastName: string): Promise<void>;
  activateUser(firstName: string, lastName: string): Promise<void>;
}
