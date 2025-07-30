import { Roles } from '@core/constants/roles';
import { AddUserResponse } from '@core/types/group.type';
import { User } from '@core/types/user.type';

export interface IUserManagementOperations {
  /**
   * Add user
   * @param user - The user
   * @param role - The role
   * @returns AddUserResponse
   */
  addUser(user: User, role: Roles): Promise<AddUserResponse>;

  /**
   * Wait for user to be added
   * @param firstName - The first name of the user
   * @param lastName - The last name of the user
   * @returns Promise<void>
   */
  waitForUserToBeAdded(firstName: string, lastName: string): Promise<void>;

  /**
   * Activate user
   * @param firstName - The first name of the user
   * @param lastName - The last name of the user
   * @returns Promise<void>
   */
  activateUser(firstName: string, lastName: string): Promise<void>;
}
