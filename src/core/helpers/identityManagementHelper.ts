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
  async getUserByEmail(email: string): Promise<Person | null> {
    const peopleListResponse = await this.identityService.getListOfPeople(email);
    console.log(`People list response: ${JSON.stringify(peopleListResponse)}`);
    const user = peopleListResponse.result.listOfItems.find(item => item.email === email);
    console.log(`User: ${JSON.stringify(user)}`);
    return user || null;
  }
}
