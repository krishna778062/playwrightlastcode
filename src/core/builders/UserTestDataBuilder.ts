import { BaseTestDataBuilder } from '@core/builders/BaseTestDataBuilder';
import { Roles } from '@core/constants/roles';
import { User } from '@core/types/user.type';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { test } from '@playwright/test';

export class UserTestDataBuilder extends BaseTestDataBuilder {
  /**
   * Adds and activates multiple users to the system with the specified role and password
   * @param count - The number of users to add
   * @param role - The role to assign to the users
   * @param password - The password to set for all users (default: 'Password123')
   * @returns Array of added users (with userId) and their roles
   *
   * @example
   * // Add 3 regular users with the default password
   * const users = await userBuilder.addUsersToSystem(3, Roles.REGULAR_USER);
   *
   * // Add 2 admin users with a custom password
   * const admins = await userBuilder.addUsersToSystem(2, Roles.ADMIN, 'MySecretPass!');
   */
  async addUsersToSystem(count: number, role: Roles, password: string = 'Password123') {
    let result: {
      user: User & { userId: string };
      role: Roles;
    }[] = [];

    await test.step(`Adding ${count} users with role ${role}`, async () => {
      for (let i = 0; i < count; i++) {
        const user = TestDataGenerator.generateUser();

        const { userId } = await this.addAndActivateUser(user, role, password);
        result.push({
          user: { ...user, userId },
          role,
        });
      }
    });
    return result;
  }

  /**
   * Creates users with different roles
   * @param usersByRole - Object mapping roles to number of users to create
   * @returns Object containing users grouped by role and a flat list of all users
   *
   * @example
   * // Create 2 admins and 3 regular users
   * const { usersByRole, allUsers } = await userBuilder.createUsersWithRoles({
   *   ADMIN: 2,
   *   REGULAR_USER: 3
   * });
   */
  async createUsersWithRoles(usersByRole: { [key in Roles]?: number } = {}) {
    const addedUsers: User[] = [];
    const usersByRoleMap: { [key in Roles]?: User[] } = {};

    await test.step('Creating users with specified roles', async () => {
      // Add users for each role
      for (const [role, count] of Object.entries(usersByRole)) {
        if (!count) continue;

        const usersWithRole = await this.addUsersToSystem(count, role as Roles);
        const users = usersWithRole.map(u => u.user);
        addedUsers.push(...users);
        usersByRoleMap[role as Roles] = users;
      }
    });

    return {
      usersByRole: usersByRoleMap,
      allUsers: addedUsers,
    };
  }

  /**
   * Adds and activates a user
   * @param user - The user to add and activate
   * @param role - The role to assign to the user
   * @param password - The password to set for the user
   * @returns The added and activated user with their userId
   */
  async addAndActivateUser(
    user: User,
    role: Roles,
    password: string
  ): Promise<User & { userId: string }> {
    return await test.step(`Adding and activating user ${user.first_name} ${user.last_name}`, async () => {
      const addUserResponse = await this.apiClient.getUserManagementService().addUser(user, role);
      await this.apiClient
        .getUserManagementService()
        .waitForUserToBeAdded(user.first_name, user.last_name);
      await this.apiClient
        .getUserManagementService()
        .activateUser(user.first_name, user.last_name, password);
      return { ...user, userId: addUserResponse.user_id };
    });
  }
}
