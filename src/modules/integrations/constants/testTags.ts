export enum IntegrationsSuiteTags {
  INTEGRATIONS = '@integrations',
  AIRTABLE = '@airtable',
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
  ABSOLUTE: IntegrationsSuiteTags.ABSOLUTE,
  TILE_MANAGEMENT: IntegrationsFeatureTags.TILE_MANAGEMENT,
  PERSONALIZATION: IntegrationsFeatureTags.PERSONALIZATION,
  MULTI_USER: IntegrationsFeatureTags.MULTI_USER,
} as const;

export const IntegrationsTestTags = [
  ...Object.values(IntegrationsSuiteTags),
  ...Object.values(IntegrationsFeatureTags),
] as const;

export default IntegrationsTestTags;
