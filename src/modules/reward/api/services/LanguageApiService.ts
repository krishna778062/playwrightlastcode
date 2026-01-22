import { Page, request, test } from '@playwright/test';
import { getRewardTenantConfigFromCache } from '@rewards/config/rewardConfig';

import { HttpClient } from '@core/api';

export type Language = {
  id: number;
  name: string;
  locale: string;
};

export type LanguagesResponse = {
  languages: Language[];
};

/**
 * Service for "Renaming" tenant APIs related to languages.
 * Uses the currently logged-in browser session (cookies + CSRF token).
 */
export class LanguageApiService {
  private readonly baseUrl = getRewardTenantConfigFromCache().apiBaseUrl;
  private readonly frontendBaseUrl = getRewardTenantConfigFromCache().frontendBaseUrl;

  private languagesCache?: Language[];

  private async getCsrfToken(page: Page): Promise<string> {
    const cookies = await page.context().cookies();
    const csrfid = cookies.find(c => c.name === 'csrfid')?.value;
    let csrfToken: string | null | undefined = csrfid;
    if (!csrfToken) {
      csrfToken = await page.evaluate(() => {
        return sessionStorage.getItem('csrfid') || sessionStorage.getItem('x-smtip-csrfid') || null;
      });
    }
    if (!csrfToken) {
      throw new Error('CSRF token not found in cookies or sessionStorage');
    }
    return csrfToken;
  }

  private async withHttpClient<T>(page: Page, fn: (httpClient: HttpClient) => Promise<T>): Promise<T> {
    const csrfToken = await this.getCsrfToken(page);
    const storageState = await page.context().storageState();

    const normalizedOrigin = this.frontendBaseUrl.replace(/\/$/, '');
    const normalizedReferer = this.frontendBaseUrl.endsWith('/') ? this.frontendBaseUrl : `${this.frontendBaseUrl}/`;

    const apiContext = await request.newContext({
      extraHTTPHeaders: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'cache-control': 'no-cache',
        origin: normalizedOrigin,
        pragma: 'no-cache',
        referer: normalizedReferer,
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'x-smtip-csrfid': csrfToken,
      },
      storageState,
    });

    try {
      const httpClient = new HttpClient(apiContext, this.baseUrl);
      return await fn(httpClient);
    } finally {
      await apiContext.dispose();
    }
  }

  /**
   * Fetch the full languages list.
   * @param options.forceRefresh - if true, bypasses in-memory cache and calls API again
   */
  async getLanguages(page: Page, options?: { forceRefresh?: boolean }): Promise<Language[]> {
    return await test.step('Get languages list via API', async () => {
      if (!options?.forceRefresh && this.languagesCache) {
        return this.languagesCache;
      }

      return await this.withHttpClient(page, async httpClient => {
        const resp = await httpClient.get('/v1/account/data/languages');
        const json = await httpClient.parseResponse<LanguagesResponse>(resp);
        const languages = Array.isArray(json.languages) ? json.languages : [];
        this.languagesCache = languages;
        return languages;
      });
    });
  }

  /**
   * Convenience helper to get language name by language id (e.g. 1, 2, 3...).
   * @param options.throwIfNotFound - if true, throws when id is not present in response
   */
  async getLanguageNameById(
    page: Page,
    languageId: number,
    options?: { forceRefresh?: boolean; throwIfNotFound?: boolean }
  ): Promise<string | undefined> {
    return await test.step(`Resolve language name by id via API (id=${languageId})`, async () => {
      const languages = await this.getLanguages(page, { forceRefresh: options?.forceRefresh });
      const name = languages.find(l => l.id === languageId)?.name;
      if (!name && options?.throwIfNotFound) {
        throw new Error(
          `Language not found for id=${languageId}. Available ids: ${languages.map(l => l.id).join(', ')}`
        );
      }
      return name;
    });
  }

  /**
   * Convenience helper to get language id by language name (e.g. "English (US)").
   * Match is case-insensitive and trims surrounding whitespace.
   * @param options.throwIfNotFound - if true, throws when name is not present in response
   */
  async getLanguageIdByName(
    page: Page,
    languageName: string,
    options?: { forceRefresh?: boolean; throwIfNotFound?: boolean }
  ): Promise<number | undefined> {
    return await test.step(`Resolve language id by name via API (name="${languageName}")`, async () => {
      const normalizedTarget = languageName.trim().toLowerCase();
      const languages = await this.getLanguages(page, { forceRefresh: options?.forceRefresh });

      const id = languages.find(l => l.name.trim().toLowerCase() === normalizedTarget)?.id;
      if (id === undefined && options?.throwIfNotFound) {
        throw new Error(
          `Language not found for name="${languageName}". Available names: ${languages.map(l => l.name).join(', ')}`
        );
      }
      return id;
    });
  }
}
