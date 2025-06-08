import { AppManagerApiClient } from '@core/apiClients/appManagerApiClient';
import { CreateChatGroupParams } from '@core/apiClients/interfaces/IChatOperations';
import { Roles } from '@core/constants/roles';
import { TestDataGenerator } from './testDataGenerator';
import { test } from '@playwright/test';
import { User } from '@core/types/user.type';

export class TestDataBuilderUsingAPI {
  private readonly apiClient: AppManagerApiClient;

  constructor(apiClient: AppManagerApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * This function is used to add users to the system.
   * @param noOfUsersToAdd - The number of users to add.
   * @param userRole - The role of the users to add.
   * @returns The users added to the system.
   */
  async addUserToSystem(noOfUsersToAdd: number, userRole: Roles) {
    let result: {
      user: User;
      role: Roles;
    }[] = [];
    await test.step(`Adding ${noOfUsersToAdd} users to the system`, async () => {
      for (let i = 0; i < noOfUsersToAdd; i++) {
        const user = TestDataGenerator.generateUser();
        result.push({
          user: user,
          role: userRole,
        });
        await this.apiClient.getUserManagementService().addUser(user, userRole);
      }
    });
    return result;
  }

  /**
   * This function is used to create users with roles.
   * @param usersByRole - The number of users to add for each role.
   * @returns The users created with roles.
   */
  private async createUsersWithRoles(usersByRole: { [key in Roles]?: number } = {}) {
    const addedUsers: User[] = [];
    const usersByRoleMap: { [key in Roles]?: User[] } = {};

    // Add users for each role
    for (const [role, count] of Object.entries(usersByRole)) {
      const usersWithRole = await this.addUserToSystem(count, role as Roles);
      const users = usersWithRole.map(u => u.user);
      addedUsers.push(...users);
      usersByRoleMap[role as Roles] = users;
    }

    return {
      usersByRole: usersByRoleMap,
      allUsers: addedUsers,
    };
  }

  /**
   * This function is used to create a new chat group.
   * @param groupName - The name of the group to create.
   * @param userIds - The IDs of the users to add to the group.
   * @param groupParams - The parameters for the group.
   * @returns The name of the created group.
   */
  private async createNewChatGroup(
    groupName: string,
    userIds: string[],
    groupParams?: CreateChatGroupParams
  ) {
    if (userIds.length > 0) {
      await this.apiClient.getChatService().createChatGroup(groupName, userIds, groupParams);
    }
    return groupName;
  }

  async buildTestDataForChat(
    groupNameOrId: string,
    users?: {
      createNew?: { [key in Roles]?: number };
      existingUserIds?: string[];
    },
    options?: {
      createNewGroup?: boolean;
      groupParams?: CreateChatGroupParams;
    }
  ) {
    let usersByRoleMap: { [key in Roles]?: User[] } = {};
    let allUsers: User[] = [];
    let allUserIds: string[] = [];

    // Handle new users if specified
    if (users?.createNew && Object.keys(users.createNew).length > 0) {
      const createdUsers = await this.createUsersWithRoles(users.createNew);
      usersByRoleMap = createdUsers.usersByRole;
      allUsers = createdUsers.allUsers;
      allUserIds = await Promise.all(
        allUsers.map(user =>
          this.apiClient.getUserManagementService().getChatUserId(user.first_name, user.last_name)
        )
      );
    }

    // Add existing user IDs if provided
    if (users?.existingUserIds) {
      allUserIds = [...allUserIds, ...users.existingUserIds];
    }

    const shouldCreateNewGroup = options?.createNewGroup ?? true;

    // Validate that we have users when creating a new group
    if (shouldCreateNewGroup && allUserIds.length === 0) {
      throw new Error(
        'Cannot create a new group without any users. Please provide either new users to create or existing user IDs.'
      );
    }

    let groupInfo: { id?: string; name?: string };

    if (shouldCreateNewGroup) {
      // Create new group with all user IDs
      const createdGroupName = await this.createNewChatGroup(
        groupNameOrId,
        allUserIds,
        options?.groupParams
      );
      groupInfo = { name: createdGroupName };
    } else {
      // Use existing group
      if (allUserIds.length > 0) {
        await this.apiClient
          .getChatService()
          .addUsersToExistingChatGroup(groupNameOrId, allUserIds);
      }
      groupInfo = { id: groupNameOrId };
    }

    return {
      group: groupInfo,
      usersByRole: usersByRoleMap,
      allUsers,
      userIds: allUserIds,
    };
  }

  /**
   * This function is used to activate a user.
   * @param user - The user to activate.
   * @param password - The password of the user.
   */
  async activateUser(user: User, password: string): Promise<void> {
    await test.step(`Activating user ${user.first_name} ${user.last_name}`, async () => {
      await this.apiClient
        .getUserManagementService()
        .activateUser(user.first_name, user.last_name, password);
    });
  }

  /**
   * This function is used to add and activate a user.
   * @param user - The user to add and activate.
   * @param role - The role of the user.
   * @param password - The password of the user.
   * @returns The user added and activated.
   */
  async addAndActivateUser(
    user: User,
    role: Roles,
    password: string
  ): Promise<User & { userId: string }> {
    return await test.step(`Adding and activating user ${user.first_name} ${user.last_name}`, async () => {
      const addUserResponse = await this.apiClient.getUserManagementService().addUser(user, role);
      await this.activateUser(user, password);
      return { ...user, userId: addUserResponse.user_id };
    });
  }
}
