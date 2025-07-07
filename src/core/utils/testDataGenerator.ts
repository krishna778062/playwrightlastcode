import { faker } from '@faker-js/faker';
import { User } from '@core/types/user.type';

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
      email: faker.internet.email({ provider: 'simpplr.com' }),
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
    return `${emailPrefix}.${timestamp}.${randomString}@simpplr.com`;
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
}
