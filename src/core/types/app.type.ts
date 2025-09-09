export interface App {
  name: string;
  url: string;
  img: string;
}

export interface ExternalLink {
  url: string;
  name: string;
  onOff: boolean;
  itemOrder: number;
  faviconUrl?: string | null;
}

export interface AppsSettingsPayload {
  externalApps: {
    appsIntegrationProvider: string;
    json: App[];
    oktaDetails: {
      oktaApiToken: string | null;
    };
    oneLoginDetails: {
      oneLoginEmbeddingCode: string | null;
      oneLoginClientId: string | null;
      oneLoginClientSecret: string | null;
    };
  };
  externalLinks: ExternalLink[];
  myLinksEnabled: boolean;
}

export interface AppsSettingsResponse {
  status: string;
  result: AppsSettingsPayload;
}
