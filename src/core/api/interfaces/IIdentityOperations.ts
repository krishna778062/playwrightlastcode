import { Roles } from '@core/constants/roles';
import { ListAudiencesResponse } from '@core/types/audience.type';

export interface IIdentityAdminOperations {
  /**
   * Get list of audiences
   * @returns ListAudiencesResponse
   */
  getListOfAudiences(): Promise<ListAudiencesResponse>;

  /**
   * Get audience id
   * @param audienceName - The name of the audience
   * @returns Audience id
   */
  getAudienceId(audienceName: string): Promise<string>;

  /**
   * Fetch role id
   * @param role - The role
   * @returns Role id
   */
  fetchRoleId(role: Roles): Promise<number>;

  /**
   * Get identity user id
   * @param firstName - The first name of the user
   */
  getIdentityUserId(firstName: string, lastName: string): Promise<string>;
}
