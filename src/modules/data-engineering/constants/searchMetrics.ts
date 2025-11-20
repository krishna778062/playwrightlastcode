export const SEARCH_METRICS = {
  TOTAL_SEARCH_VOLUME: {
    title: 'Total search volume',
    subtitle: 'Number of search queries performed over time',
  },
  SEARCH_CLICK_THROUGH_RATE: {
    title: 'Search click through rate',
    subtitle: 'Number of search queries that lead to a click on a search result',
  },
  NO_RESULTS_SEARCH: {
    title: 'No results search',
    subtitle: 'Number of search queries that returned zero results',
  },
  AVERAGE_SEARCHES_PER_LOGGED_IN_USER: {
    title: 'Average searches per logged-in user',
    subtitle: 'Average searches per logged-in user',
  },
  SEARCH_USAGE_VOLUME_AND_CLICK_THROUGH_RATE: {
    title: 'Search usage volume and click through rate ',
    subtitle: 'Total search queries volume and click through count trend over the selected time period',
  },
  TOP_SEARCH_QUERIES: {
    title: 'Top search queries',
    subtitle: 'Search queries (up to 5) that are searched most often across the organization',
  },
  MOST_SEARCHES_PERFORMED_BY_DEPARTMENT: {
    title: 'Most searches performed by Department',
    subtitle: 'Shows the top searches (up to 5) performed based on the Department',
  },
  NO_RESULT_SEARCH_QUERIES: {
    title: 'No result search queries',
    subtitle: 'The most searched queries (up to 5) with no results being returned.',
  },
  TOP_SEARCH_QUERIES_WITH_NO_CLICKTHROUGH: {
    title: 'Top search queries with no clickthrough',
    subtitle: 'Search queries (up to 5) that did not lead to any content clicks',
  },
  TOP_CLICKTHROUGH_TYPES: {
    title: 'Top clickthrough types',
    subtitle: 'The top content type (upto 5) accessed by users after performing a search',
  },
} as const;
