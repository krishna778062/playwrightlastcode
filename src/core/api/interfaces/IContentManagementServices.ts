import { PageCreationPayload } from '@/src/core/types/pageManagement.types';

export interface IContentManagementServices {
  getPageCategoryID(siteId: string): Promise<any>;
  addNewPageContent(siteId: string, payload?: Partial<PageCreationPayload>): Promise<any>;
}
