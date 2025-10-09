export enum IntegrationsSuiteTags {
  INTEGRATIONS = '@integrations',
  AIRTABLE = '@airtableAppTiles',
  FRESHSERVICE = '@freshserviceAppTiles',
  EXPENSIFY = '@expensifyAppTiles',
  GITHUB = '@gitHubAppTiles',
  ABSOLUTE = '@absolute',
  GAMMA = '@gamma',
  PHOENIX = '@phoenix',
  BAMBOOHR = '@bambooHRAppTiles',
  SAP_SUCCESSFACTORS = '@sapSuccessFactorsAppTiles',
  UKG_WFM = '@ukgWFMAppTiles',
  UKG_PRO = '@ukgProAppTiles',
  GOOGLE_CALENDAR_APPTILES = '@googleCalendarAppTiles',
  DOCUSIGN = '@docuSignAppTiles',
  DOCEBO = '@doceboAppTiles',
  MONDAY_DOT_COM = '@mondayDotComAppTiles',
  OUTLOOK_CALENDAR_APPTILES = '@outlookCalendarAppTiles',
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
  BAMBOOHR: IntegrationsSuiteTags.BAMBOOHR,
  SAP_SUCCESSFACTORS: IntegrationsSuiteTags.SAP_SUCCESSFACTORS,
  UKG_WFM: IntegrationsSuiteTags.UKG_WFM,
  UKG_PRO: IntegrationsSuiteTags.UKG_PRO,
  GOOGLE_CALENDAR_APPTILES: IntegrationsSuiteTags.GOOGLE_CALENDAR_APPTILES,
  OUTLOOK_CALENDAR_APPTILES: IntegrationsSuiteTags.OUTLOOK_CALENDAR_APPTILES,
  DOCUSIGN: IntegrationsSuiteTags.DOCUSIGN,
  MONDAY_DOT_COM: IntegrationsSuiteTags.MONDAY_DOT_COM,
} as const;

export enum GammaIntegrationsFeatureTags {
  OKTA_GROUP = '@okta-group',
  AD_GROUP = '@ad-group',
}
