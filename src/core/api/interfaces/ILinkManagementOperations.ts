import { AppsSettingsPayload } from '@/src/core/types/app.type';

export interface ILinkManagementOperations {
  addExternalLink(link: {
    url: string;
    name: string;
    onOff: boolean;
    itemOrder: number;
    faviconUrl?: string | null;
  }): Promise<any>;
  removeExternalLink(linkName: string): Promise<any>;
}
