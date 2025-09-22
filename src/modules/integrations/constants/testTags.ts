export enum IntegrationsSuiteTags {
  INTEGRATIONS = '@integrations',
  AIRTABLE = '@airtableAppTiles',
  FRESHSERVICE = '@freshserviceAppTiles',
  EXPENSIFY = '@expensifyAppTiles',
  GITHUB = '@gitHubAppTiles',
  ABSOLUTE = '@absolute',
  GAMMA = '@gamma',
  PHOENIX = '@phoenix',
}

export enum IntegrationsFeatureTags {
  TILE_MANAGEMENT = '@tile-management',
  PERSONALIZATION = '@personalization',
  MULTI_USER = '@multi-user',
  EVENT_SYNC = '@EventSync',
  GOOGLE_CALENDAR = '@google-calendar',
  OUTLOOK_CALENDAR = '@outlook-calendar',
}

export const TEST_TAGS = {
  INTEGRATIONS: IntegrationsSuiteTags.INTEGRATIONS,
  AIRTABLE: IntegrationsSuiteTags.AIRTABLE,
  FRESHSERVICE: IntegrationsSuiteTags.FRESHSERVICE,
  EXPENSIFY: IntegrationsSuiteTags.EXPENSIFY,
  GITHUB: IntegrationsSuiteTags.GITHUB,
  ABSOLUTE: IntegrationsSuiteTags.ABSOLUTE,
  GAMMA: IntegrationsSuiteTags.GAMMA,
  PHOENIX: IntegrationsSuiteTags.PHOENIX,
  TILE_MANAGEMENT: IntegrationsFeatureTags.TILE_MANAGEMENT,
  MULTI_USER: IntegrationsFeatureTags.MULTI_USER,
  EVENT_SYNC: IntegrationsFeatureTags.EVENT_SYNC,
  GOOGLE_CALENDAR: IntegrationsFeatureTags.GOOGLE_CALENDAR,
} as const;

export enum GammaIntegrationsFeatureTags {
  OKTA_GROUP = '@okta-group',
}
