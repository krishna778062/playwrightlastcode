import { ListAudiencesResponse } from '@core/types/audience.type';
import { Roles } from '@core/constants/roles';

export interface IIdentityAdminOperations {
  getListOfAudiences(): Promise<ListAudiencesResponse>;
  getAudienceId(audienceName: string): Promise<string>;
  fetchRoleId(role: Roles): Promise<number>;
  getIdentityUserId(firstName: string, lastName: string): Promise<string>;
}
