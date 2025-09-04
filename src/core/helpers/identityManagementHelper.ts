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
  async getPeopleIdByEmail(email: string, options?: PeopleListOptions): Promise<string | null> {
    try {
      // Get people ID directly from API
      const peopleId = await this.identityService.getPeopleIdWithEmailId(email);
      console.log(`Found person with email ${email} (ID: ${peopleId})`);
      return peopleId;
    } catch (error) {
      console.error(`Error searching for person with email ${email}:`, error);
      return null;
    }
  }
}
