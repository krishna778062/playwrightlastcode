export enum IntegrationsSuiteTags {
  INTEGRATIONS = '@integrations',
  AIRTABLE = '@airtableAppTiles',
  FRESHSERVICE = '@freshserviceAppTiles',
  EXPENSIFY = '@expensifyAppTiles',
  GITHUB = '@gitHubAppTiles',
  BAMBOOHR = '@bambooHRAppTiles',
  SAP_SUCCESSFACTORS = '@sapSuccessFactorsAppTiles',
  ABSOLUTE = '@absolute',
  GAMMA = '@gamma',
  UKG_WFM = '@ukgWFMAppTiles',
  UKG_PRO = '@ukgProAppTiles',
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
  BAMBOOHR: IntegrationsSuiteTags.BAMBOOHR,
  SAP_SUCCESSFACTORS: IntegrationsSuiteTags.SAP_SUCCESSFACTORS,
  ABSOLUTE: IntegrationsSuiteTags.ABSOLUTE,
  TILE_MANAGEMENT: IntegrationsFeatureTags.TILE_MANAGEMENT,
  MULTI_USER: IntegrationsFeatureTags.MULTI_USER,
  UKG_WFM: IntegrationsSuiteTags.UKG_WFM,
  UKG_PRO: IntegrationsSuiteTags.UKG_PRO,
} as const;

export enum GammaIntegrationsFeatureTags {
  OKTA_GROUP = '@okta-group',
}
