import { AddUserResponse } from '@core/types/group.type';
import { Roles } from '@core/constants/roles';
import { SiteCreationPayload } from '../services/SiteManagementService';

export interface ISiteManagementOperations {
  addNewSite(payload?: Partial<SiteCreationPayload>): Promise<any>;
  deactivateSite(siteId: string): Promise<any>;
}
