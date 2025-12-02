export enum GlobalSearchSuiteTags {
  GLOBAL_SEARCH = '@global-search',
  ENTERPRISE_SEARCH = '@enterprise-search',
  EXTERNAL_SEARCH = '@external-search',
  SITE_SEARCH = '@site-search',
  CONTENT_SEARCH = '@content-search',
  LINK_TILE_SEARCH = '@tile-search',
  LINK_SEARCH = '@link-search',
  APPS_SEARCH = '@apps-search',
  FEED_SEARCH = '@feed-search',
  FILE_SEARCH = '@file-search',
  VIDEO_FILE_SEARCH = '@video-file-search',
  PEOPLE_SEARCH = '@people-search',
  FEDERATED_SEARCH = '@federated-search',
  SITE_SEARCH_API = '@site-search-api',
  GLOBAL_SEARCH_API = '@global-search-api',
}

export enum GlobalSearchFeatureTags {
  SEARCH_FILTERS = '@search-filters',
  SEARCH_SUGGESTIONS = '@search-suggestions',
  SEARCH_RESULTS = '@search-results',
  SEARCH_PAGINATION = '@search-pagination',
  SEARCH_SORTING = '@search-sorting',
  ADVANCED_SEARCH = '@advanced-search',
}

export const GlobalSearchTestTags = [
  ...Object.values(GlobalSearchSuiteTags),
  ...Object.values(GlobalSearchFeatureTags),
] as const;

export default GlobalSearchTestTags;
