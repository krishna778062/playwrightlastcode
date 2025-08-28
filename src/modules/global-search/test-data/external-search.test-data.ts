import { ExternalSearch } from '@/src/core/types/externalSearch.type';

// Search term for external search testing
export const EXTERNAL_SEARCH_TERM = 'test automation';

/**
 * Pre-configured External Search Providers Test Data - Matches exact API payload structure
 */
export const EXTERNAL_SEARCH_PROVIDERS: ExternalSearch[] = [
  {
    id: 'enterprise_search_1',
    provider: 'Google',
    url: 'https://google.com?q={{term}}&q={{term}}',
    isEnabled: true,
  },
  {
    id: 'enterprise_search_2',
    provider: 'Yahoo',
    url: 'https://Yahoo.com?q={{term}}&q={{term}}',
    isEnabled: true,
  },
  {
    id: 'enterprise_search_3',
    provider: 'Duck',
    url: 'https://DuckDuck.com?q={{term}}',
    isEnabled: true,
  },
  {
    id: 'enterprise_search_4',
    provider: 'Amazon',
    url: 'https://www.amazon.com/s?k={{term}}',
    isEnabled: true,
  },
  {
    id: 'enterprise_search_5',
    provider: 'Flipkart',
    url: 'https://www.flipkart.com/search?q={{term}}',
    isEnabled: true,
  },
];

/**
 * Expected provider names in the order they should appear - derived from EXTERNAL_SEARCH_PROVIDERS
 */
export const EXPECTED_PROVIDER_ORDER: string[] = EXTERNAL_SEARCH_PROVIDERS.map(provider => provider.provider);

/**
 * Generates unique external search test data for parallel test execution
 * @returns Complete test data with providers array and expected order
 */
export function generateUniqueExternalSearchTestData(): {
  providers: ExternalSearch[];
  expectedProviderOrder: string[];
  searchTerm: string;
} {
  // Generate unique suffix using crypto UUID (first 6 characters for readability)
  const randomNum = Math.floor(Math.random() * 1000000 + 1);

  const uniqueProviders: ExternalSearch[] = EXTERNAL_SEARCH_PROVIDERS.map((provider, index) => ({
    id: provider.id,
    provider: `${provider.provider}_${randomNum}`,
    url: provider.url,
    isEnabled: provider.isEnabled,
  }));

  const expectedProviderOrder = uniqueProviders.map(provider => provider.provider);

  return { providers: uniqueProviders, expectedProviderOrder, searchTerm: EXTERNAL_SEARCH_TERM };
}
