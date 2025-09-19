export enum IntegrationsSuiteTags {
  INTEGRATIONS = '@integrations',
  AIRTABLE = '@airtableAppTiles',
  FRESHSERVICE = '@freshserviceAppTiles',
  EXPENSIFY = '@expensifyAppTiles',
  GITHUB = '@gitHubAppTiles',
  ABSOLUTE = '@absolute',
}

export enum IntegrationsFeatureTags {
  TILE_MANAGEMENT = '@tile-management',
  PERSONALIZATION = '@personalization',
  MULTI_USER = '@multi-user',
}

export const TEST_TAGS = {
  INTEGRATIONS: IntegrationsSuiteTags.INTEGRATIONS,
  AIRTABLE: IntegrationsSuiteTags.AIRTABLE,
  FRESHSERVICE: IntegrationsSuiteTags.FRESHSERVICE,
  EXPENSIFY: IntegrationsSuiteTags.EXPENSIFY,
  GITHUB: IntegrationsSuiteTags.GITHUB,
  ABSOLUTE: IntegrationsSuiteTags.ABSOLUTE,
  TILE_MANAGEMENT: IntegrationsFeatureTags.TILE_MANAGEMENT,
  MULTI_USER: IntegrationsFeatureTags.MULTI_USER,
} as const;
