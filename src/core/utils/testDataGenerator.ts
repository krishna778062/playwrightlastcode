import { faker } from '@faker-js/faker';
import { User } from '@core/types/user.type';
import { DEFAULT_GROUP_VALUES, Group } from '@core/types/group.type';

export class TestDataGenerator {
  /**
   * Generates a random user with realistic data
   * @param overrides Optional properties to override in the generated user
   * @returns A User object with random realistic data
   */
  static generateUser(overrides?: Partial<User>): User {
    return {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email({ provider: 'example.com' }),
      timezone_id: 17,
      language_id: 1,
      locale_id: 1,
      ...overrides,
    };
  }

  /**
   * Generates multiple random users
   * @param count Number of users to generate
   * @param overrides Optional properties to override in all generated users
   * @returns Array of User objects
   */
  static generateUsers(count: number, overrides?: Partial<User>): User[] {
    return Array.from({ length: count }, () => this.generateUser(overrides));
  }

  /**
   * Generates a unique email that won't conflict with existing users
   * @param prefix Optional prefix for the email
   * @returns A unique email address
   */
  static generateUniqueEmail(prefix?: string): string {
    const timestamp = Date.now();
    const randomString = faker.string.alphanumeric(6);
    const emailPrefix = prefix || faker.internet.username();
    return `${emailPrefix}.${timestamp}.${randomString}@example.com`;
  }

  /**
   * Generates test user data with specific role-based attributes
   * @param role The role to generate data for (e.g., 'admin', 'moderator')
   * @returns A User object with role-specific data
   */
  static generateUserByRole(role: 'admin' | 'moderator' | 'endUser'): User {
    const baseUser = this.generateUser();

    switch (role) {
      case 'admin':
        return {
          ...baseUser,
          email: this.generateUniqueEmail('admin'),
        };
      case 'moderator':
        return {
          ...baseUser,
          email: this.generateUniqueEmail('mod'),
        };
      default:
        return {
          ...baseUser,
          email: this.generateUniqueEmail('user'),
        };
    }
  }

  /**
   * Generates a group with given name and optional overrides
   * @param name Name of the group (if not provided, generates a random name)
   * @param overrides Optional properties to override default values
   * @returns A Group object
   */
  static generateGroup(nameOrOverrides?: string | Partial<Group>): Group {
    // If nameOrOverrides is a string, use it as the name
    // If it's an object, use it as overrides
    const isNameString = typeof nameOrOverrides === 'string';
    const overrides = isNameString ? {} : nameOrOverrides || {};
    const name = isNameString ? nameOrOverrides : this.generateGroupName();

    return {
      ...DEFAULT_GROUP_VALUES,
      name,
      ...overrides,
    };
  }

  /**
   * Generates multiple groups
   * @param count Number of groups to generate
   * @param overrides Optional properties to override in all generated groups
   * @returns Array of Group objects
   */
  static generateGroups(count: number, overrides?: Partial<Group>): Group[] {
    return Array.from({ length: count }, (_, index) =>
      this.generateGroup({
        ...overrides,
        name: overrides?.name || `${this.generateGroupName()}-${index + 1}`,
      })
    );
  }

  /**
   * Generates a random group name with a timestamp to ensure uniqueness
   * @returns A unique group name
   */
  static generateGroupName(): string {
    const prefix = faker.word.sample();
    const timestamp = Date.now();
    return `${prefix}-group-${timestamp}`;
  }

  /**
   * Generates a group with specific characteristics
   * @param type The type of group to generate
   * @returns A Group object with specific characteristics
   */
  static generateGroupByType(type: 'public' | 'private' | 'restricted'): Group {
    const baseGroup = this.generateGroup();

    switch (type) {
      case 'private':
        return {
          ...baseGroup,
          accessType: 'PRIVATE',
          postPermission: 'CLOSED',
        };
      case 'restricted':
        return {
          ...baseGroup,
          accessType: 'PUBLIC',
          postPermission: 'RESTRICTED',
        };
      default:
        return {
          ...baseGroup,
          accessType: 'PUBLIC',
          postPermission: 'OPEN',
        };
    }
  }
}
