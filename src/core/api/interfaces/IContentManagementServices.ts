import {
  AlbumCreationPayload,
  EventCreationPayload,
  PageCreationPayload,
} from '@/src/core/types/contentManagement.types';

export interface IContentManagementServices {
  getPageCategoryID(siteId: string): Promise<any>;
  addNewPageContent(siteId: string, payload?: Partial<PageCreationPayload>): Promise<any>;
  addNewEventContent(siteId: string, payload?: Partial<EventCreationPayload>): Promise<any>;
  addNewAlbumContent(siteId: string, overrides?: Partial<AlbumCreationPayload>): Promise<any>;
}
