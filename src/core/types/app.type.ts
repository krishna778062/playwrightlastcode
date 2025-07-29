export interface App {
  name: string;
  url: string;
  img: string;
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
  externalLinks: Array<{
    url: string;
    name: string;
    onOff: boolean;
    itemOrder: number;
    faviconUrl: string | null;
  }>;
  myLinksEnabled: boolean;
}

export interface AppsSettingsResponse {
  status: string;
  result: AppsSettingsPayload;
}
