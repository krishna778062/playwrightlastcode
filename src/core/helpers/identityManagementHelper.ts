import { AppManagerApiClient } from '@/src/core/api/clients/appManagerApiClient';
import { IdentityService } from '@/src/core/api/services/IdentityService';
import { PeopleListOptions, PeopleListResponse, Person } from '@/src/core/types/people.type';

export class IdentityManagementHelper {
  private identityService: IdentityService;

  constructor(private appManagerApiClient: AppManagerApiClient) {
    this.identityService = new IdentityService(appManagerApiClient.context);
  }

  /**
   * Gets list of people and finds peopleId by email address
   * @param email - The email address to search for
   * @param options - Optional parameters for the people list request
   * @returns Promise<string | null> - The peopleId if found, null otherwise
   */
  async getListOfPeople(email?: string, options?: PeopleListOptions): Promise<PeopleListResponse> {
    // Get people ID directly from API
    const peopleListResponse = await this.identityService.getListOfPeople(email);
    console.log(`Found person with email ${email} (ID: ${peopleListResponse.result.listOfItems[0].peopleId})`);
    return peopleListResponse;
  }
}
