import { APIRequestContext, test } from '@playwright/test';

import { Roles } from '@core/constants/roles';
import { TestUser } from '@core/types/test.types';
import { User, UserWithLicenseAndDepartment } from '@core/types/user.type';
import { TestDataGenerator } from '@core/utils/testDataGenerator';

import { getEnvConfig } from '../utils/getEnvConfig';

// Optional import for content module config
let contentConfigModule: any;
try {
  contentConfigModule = require('@/src/modules/content/config/contentConfig');
} catch {
  // Content module not available - this is expected for non-content modules
  contentConfigModule = null;
}

import { UserManagementService } from '@/src/modules/platforms/apis/services/UserManagementService';

/**
 * Custom error class that includes partial results when user creation fails midway
 * This allows callers to cleanup partially created users
 */
export class PartialUserCreationError extends Error {
  public partiallyCreatedUsers: TestUser[];
  public originalError: Error;

  constructor(message: string, partiallyCreatedUsers: TestUser[], originalError: Error) {
    super(message);
    this.name = 'PartialUserCreationError';
    this.partiallyCreatedUsers = partiallyCreatedUsers;
    this.originalError = originalError;
  }
}

export class UserTestDataBuilder {
  readonly userManagementService: UserManagementService;

  constructor(apiRequestContext: APIRequestContext, baseUrl?: string) {
    // If baseUrl is provided, use it; otherwise check for content config, then fall back to env
    let apiBaseUrl: string;
    if (baseUrl) {
      apiBaseUrl = baseUrl;
    } else if (contentConfigModule?.isContentConfigInitialized?.()) {
      const contentConfig = contentConfigModule.getContentTenantConfigFromCache();
      apiBaseUrl = contentConfig.apiBaseUrl;
    } else {
      apiBaseUrl = getEnvConfig().apiBaseUrl;
    }

    this.userManagementService = new UserManagementService(apiRequestContext, apiBaseUrl);
  }

  /**
   * Adds and activates multiple users to the system with the specified role and password
   * @param count - The number of users to add
   * @param role - The role to assign to the users
   * @param password - The password to set for all users (default: 'Password123')
   * @returns Array of added users (with userId) and their roles
   * @throws PartialUserCreationError if some users were created but the process failed midway
   *         (contains partiallyCreatedUsers array for cleanup)
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

        try {
          const createdUser = await this.addAndActivateUser(user, role, password);
          createdUsers.push(createdUser);
        } catch (error) {
          // Check if addAndActivateUser threw PartialUserCreationError
          // (user was created but activation failed)
          if (error instanceof PartialUserCreationError) {
            // Add the partially created users from this error
            createdUsers.push(...error.partiallyCreatedUsers);
            console.log(`⚠️ User was created but activation failed. Total created: ${createdUsers.length}`);
          }

          // If we have any partially created users (from previous iterations or current), throw with all of them
          if (createdUsers.length > 0) {
            console.log(`⚠️ Partial user creation: ${createdUsers.length} users created before/during failure`);
            console.log(`Created users: ${createdUsers.map(u => u.email).join(', ')}`);
            throw new PartialUserCreationError(
              `Failed at user ${i + 1}/${count}. ${createdUsers.length} users were created and need cleanup.`,
              createdUsers,
              error instanceof PartialUserCreationError ? error.originalError : (error as Error)
            );
          }

          // No partial users at all, just rethrow original error
          throw error;
        }
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
   * @throws PartialUserCreationError if user was created but activation failed
   */
  async addAndActivateUser(user: User, role: Roles, password: string): Promise<TestUser> {
    return await test.step(`Adding and activating user ${user.first_name} ${user.last_name}`, async () => {
      // Step 1: Add user to system
      const addUserResponse = await this.userManagementService.addUser(user, role);
      const userId = addUserResponse.user_id;

      // At this point, user is CREATED in the system
      const createdUser: TestUser = {
        ...user,
        userId,
        fullName: `${user.first_name} ${user.last_name}`,
        role,
      };

      try {
        // Step 2: Wait for user to be added
        await this.userManagementService.waitForUserToBeAdded(user.first_name, user.last_name);

        // Step 3: Activate user
        await this.userManagementService.activateUser(user.first_name, user.last_name, password);

        return createdUser;
      } catch (error) {
        // User was created but activation/wait failed
        // Throw special error so caller can cleanup
        console.log(`⚠️ User ${user.email} was created (userId: ${userId}) but activation failed!`);
        throw new PartialUserCreationError(
          `User ${user.email} was created but activation failed: ${(error as Error).message}`,
          [createdUser], // Include the created user for cleanup
          error as Error
        );
      }
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
