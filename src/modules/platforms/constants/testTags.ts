export enum PlatformSuiteTags {
  LANDING_PAGE = '@landing-page',
  HOMEPAGE = '@homepage',
  FOOTER = '@footer',
  HEADER = '@header',
  NAVIGATION = '@navigation',
  PRIVACY_POLICY = '@privacy-policy',
  ACG = '@acg',
  FEATURE_OWNERS = '@feature-owners',
}

export enum PlatformFeatureTags {
  RESPONSIVE_DESIGN = '@responsive-design',
  ACCESSIBILITY = '@accessibility',
  CROSS_BROWSER = '@cross-browser',
  PERFORMANCE = '@performance',
  SEO = '@seo',
}

export const PlatformTestTags = [...Object.values(PlatformSuiteTags), ...Object.values(PlatformFeatureTags)] as const;

export default PlatformTestTags;
