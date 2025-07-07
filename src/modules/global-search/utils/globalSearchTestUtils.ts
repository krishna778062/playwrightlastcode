/**
 * Polls the given API client for a search result matching the searchTerm.
 * Repeatedly calls apiClient.searchForTerm(searchTerm) every pollInterval milliseconds,
 * until a result with a matching title is found or the timeout is reached.
 *
 * @param apiClient - An object with a searchForTerm(term: string) => Promise<{ title: string }[]> method.
 * @param searchTerm - The term to search for in the API.
 * @param timeout - Maximum time to wait in milliseconds (default: 35000).
 * @param pollInterval - Time to wait between polls in milliseconds (default: 2000).
 * @returns Promise<boolean> - Resolves to true if a matching result is found, false if timeout is reached.
 */
export async function waitForSearchResultInApi(
  apiClient: { searchForTerm: (term: string) => Promise<{ title: string }[]> },
  searchTerm: string,
  timeout = 40000,
  pollInterval = 5000
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const results = await apiClient.searchForTerm(searchTerm);
    if (results.some((r: { title: string }) => r.title === searchTerm)) {
      return true;
    }
    await new Promise(res => setTimeout(res, pollInterval));
  }
  return false;
}
