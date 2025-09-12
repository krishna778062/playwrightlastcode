import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { IdentityService } from '@/src/core/api/services/IdentityService';
import { PeopleListOptions, PeopleListResponse, Person } from '@/src/core/types/people.type';

export class IdentityManagementHelper {
  private identityService: IdentityService;

  constructor(private appManagerApiClient: AppManagerApiClient) {
    this.identityService = new IdentityService(appManagerApiClient.context);
  }

  /**
   * Gets a specific user by email address
   * @param email - The email address to search for
   * @returns Promise<Person | null> - The user object if found, null otherwise
   */
  async getUserIdByEmail(email: string): Promise<string> {
    const peopleListResponse = await this.identityService.getListOfPeople(email);
    console.log(`People list response: ${JSON.stringify(peopleListResponse)}`);
    const user = peopleListResponse.result.listOfItems.find(item => item.email === email);
    console.log(`User: ${JSON.stringify(user)}`);
    if (!user) {
      throw new Error('Failed to get user ID');
    }
    return user.user_id;
  }

  /**
   * Gets a specific user by email address
   * @param email - The email address to search for
   * @returns Promise<Person | null> - The user object if found, null otherwise
   */
  async getUserNameByEmail(email: string): Promise<string> {
    const peopleListResponse = await this.identityService.getListOfPeople(email);
    console.log(`People list response: ${JSON.stringify(peopleListResponse)}`);
    const user = peopleListResponse.result.listOfItems.find(item => item.email === email);
    console.log(`User: ${JSON.stringify(user)}`);
    if (!user) {
      throw new Error('Failed to get user ID');
    }
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    console.log('fullName', fullName);
    return fullName;
  }

  /**
   * Gets complete user information by email address (optimized single API call)
   * @param email - The email address to search for
   * @returns Promise<{userId: string, fullName: string, user: Person}> - Complete user info
   */
  async getUserInfoByEmail(email: string): Promise<{ userId: string; fullName: string; user: Person }> {
    const peopleListResponse = await this.identityService.getListOfPeople(email);
    console.log(`People list response: ${JSON.stringify(peopleListResponse)}`);
    const user = peopleListResponse.result.listOfItems.find(item => item.email === email);
    console.log(`User: ${JSON.stringify(user)}`);
    if (!user) {
      throw new Error(`Failed to get user info for email: ${email}`);
    }
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    console.log('fullName', fullName);
    return {
      userId: user.user_id,
      fullName,
      user,
    };
  }
}
