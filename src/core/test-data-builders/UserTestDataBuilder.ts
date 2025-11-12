import { APIRequestContext, test } from '@playwright/test';

import { Roles } from '@core/constants/roles';
import { TestUser } from '@core/types/test.types';
import { User, UserWithLicenseAndDepartment } from '@core/types/user.type';
import { TestDataGenerator } from '@core/utils/testDataGenerator';

import { getEnvConfig } from '../utils/getEnvConfig';

import { UserManagementService } from '@/src/modules/platforms/apis/services/UserManagementService';

export class UserTestDataBuilder {
  readonly userManagementService: UserManagementService;

  constructor(apiRequestContext: APIRequestContext, baseUrl?: string) {
    this.userManagementService = new UserManagementService(
      apiRequestContext,
      baseUrl ? baseUrl : getEnvConfig().apiBaseUrl
    );
  }

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
  async addUsersToSystem(count: number, role: Roles, password: string = 'Password123'): Promise<TestUser[]> {
    const createdUsers: TestUser[] = [];

    await test.step(`Adding ${count} users with role ${role}`, async () => {
      for (let i = 0; i < count; i++) {
        const user = TestDataGenerator.generateUser();

        const { userId } = await this.addAndActivateUser(user, role, password);
        createdUsers.push({
          ...user,
          userId,
          fullName: `${user.first_name} ${user.last_name}`,
          role,
        });
      }
    });
    return createdUsers;
  }

  async addUsersToSystemWithGivenEmail(
    count: number,
    role: Roles,
    password: string = 'Password123',
    email: string
  ): Promise<TestUser[]> {
    const createdUsers: TestUser[] = [];

    await test.step(`Adding ${count} users with role ${role}`, async () => {
      for (let i = 0; i < count; i++) {
        const user = TestDataGenerator.generateUserWithEmpIdAndGivenEmail(email);

        const { userId } = await this.addAndActivateUserWithEmail(user, role, password);
        createdUsers.push({
          ...user,
          userId,
          fullName: `${user.first_name} ${user.last_name}`,
          role,
        });
      }
    });
    return createdUsers;
  }

  async addUsersWithEmpIdAndDepartmentToSystem(role: Roles, password: string = 'Password123'): Promise<TestUser[]> {
    const createdUsers: TestUser[] = [];

    await test.step(`Adding user with emp id and department with role ${role}`, async () => {
      const user = TestDataGenerator.generateUserWithEmp();
      const { userId } = await this.addAndActivateUserWithEmpIdAndDepartment(user, role, password);
      createdUsers.push({
        ...user,
        userId,
        fullName: `${user.first_name} ${user.last_name}`,
        role,
      });
    });
    return createdUsers;
  }

  async addUsersWithEmpIdAndDepartmentToSystemWithoutPassword(role: Roles): Promise<TestUser[]> {
    const createdUsers: TestUser[] = [];

    await test.step(`Adding user with emp id and department with role ${role}`, async () => {
      const user = TestDataGenerator.generateUserWithEmp();
      const { userId } = await this.addAndActivateUserWithEmpIdAndDepartmentWithoutPassword(user, role);
      createdUsers.push({
        ...user,
        userId,
        fullName: `${user.first_name} ${user.last_name}`,
        role,
      });
    });
    return createdUsers;
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
    const addedUsers: TestUser[] = [];
    const usersByRoleMap: { [key in Roles]?: TestUser[] } = {};

    await test.step('Creating users with specified roles', async () => {
      // Add users for each role
      for (const [role, count] of Object.entries(usersByRole)) {
        if (!count) continue;

        const users = await this.addUsersToSystem(count, role as Roles);
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
  async addAndActivateUser(user: User, role: Roles, password: string): Promise<TestUser> {
    return await test.step(`Adding and activating user ${user.first_name} ${user.last_name}`, async () => {
      const addUserResponse = await this.userManagementService.addUser(user, role);
      await this.userManagementService.waitForUserToBeAdded(user.first_name, user.last_name);
      await this.userManagementService.activateUser(user.first_name, user.last_name, password);
      return {
        ...user,
        userId: addUserResponse.user_id,
        fullName: `${user.first_name} ${user.last_name}`,
        role,
      };
    });
  }

  async addAndActivateUserWithEmail(
    user: UserWithLicenseAndDepartment,
    role: Roles,
    password: string
  ): Promise<TestUser> {
    const fullName = `${user.first_name} ${user.last_name}`;

    return await test.step(`Adding and activating user ${fullName} with email`, async () => {
      const addUserResponse = await this.userManagementService.addUserWithEmail(user, role);
      await this.userManagementService.activateUserWithEmpIdAndDepartment(user.first_name, user.last_name, password);
      return {
        ...user,
        userId: addUserResponse.user_id,
        fullName,
        role,
      };
    });
  }

  async addAndActivateUserWithEmpIdAndDepartment(
    user: UserWithLicenseAndDepartment,
    role: Roles,
    password: string
  ): Promise<TestUser> {
    return await test.step(`Adding and activating user ${user.first_name} ${user.last_name}`, async () => {
      const addUserResponse = await this.userManagementService.addUserWithEmpIdAndDepartment(user, role);
      await this.userManagementService.activateUserWithEmpIdAndDepartment(user.first_name, user.last_name, password);
      return {
        ...user,
        userId: addUserResponse.user_id,
        fullName: `${user.first_name} ${user.last_name}`,
        role,
      };
    });
  }

  async addAndActivateUserWithEmpIdAndDepartmentWithoutPassword(
    user: UserWithLicenseAndDepartment,
    role: Roles
  ): Promise<TestUser> {
    return await test.step(`Adding and activating user ${user.first_name} ${user.last_name}`, async () => {
      const addUserResponse = await this.userManagementService.addUserWithEmpIdAndDepartment(user, role);
      return {
        ...user,
        userId: addUserResponse.user_id,
        fullName: `${user.first_name} ${user.last_name}`,
        role,
      };
    });
  }
}
