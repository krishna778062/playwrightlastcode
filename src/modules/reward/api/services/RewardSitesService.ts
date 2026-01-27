import { Page, request, test } from '@playwright/test';
import { getRewardTenantConfigFromCache } from '@rewards/config/rewardConfig';

import { HttpClient } from '@core/api';
import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { Site, SiteCreationResponse, SiteListResponse } from '@core/types/siteManagement.types';

type CategoryListResponse = {
  status: string;
  result?: {
    listOfItems?: Array<{ categoryId: string; name: string }>;
  };
};

/**
 * Reward-module helper for Content "Sites" APIs (list/create/activate) using the current logged-in browser session.
 * NOTE: This does not depend on the Content module code.
 */
export class RewardSitesService {
  private readonly baseUrl = getRewardTenantConfigFromCache().apiBaseUrl;
  private readonly frontendBaseUrl = getRewardTenantConfigFromCache().frontendBaseUrl;

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
        'content-type': 'application/json',
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

  async getActiveSites(page: Page, options?: { size?: number; sortBy?: string }): Promise<Site[]> {
    return await test.step('Get active sites list via API', async () => {
      const size = options?.size ?? 1000;
      const sortBy = options?.sortBy ?? 'alphabetical';
      return await this.withHttpClient(page, async httpClient => {
        const resp = await httpClient.post(API_ENDPOINTS.site.listOfSites, {
          data: {
            size,
            canManage: true,
            filter: 'active',
            sortBy,
          },
        });
        const json = (await resp.json()) as SiteListResponse;
        return json?.result?.listOfItems ?? [];
      });
    });
  }

  private async getAllSites(page: Page, options?: { size?: number; sortBy?: string }): Promise<Site[]> {
    const size = options?.size ?? 1000;
    const sortBy = options?.sortBy ?? 'alphabetical';
    return await this.withHttpClient(page, async httpClient => {
      const resp = await httpClient.post(API_ENDPOINTS.site.listOfSites, {
        data: {
          size,
          canManage: true,
          filter: 'all',
          sortBy,
        },
      });
      const json = (await resp.json()) as SiteListResponse;
      return json?.result?.listOfItems ?? [];
    });
  }

  private async activateSite(page: Page, siteId: string): Promise<void> {
    await test.step(`Activate site via API: ${siteId}`, async () => {
      await this.withHttpClient(page, async httpClient => {
        const resp = await httpClient.put(API_ENDPOINTS.site.activate, {
          data: {
            ids: [siteId],
            newStatus: 'activated',
          },
        });
        const json = await resp.json();
        if (json?.status !== 'success') {
          throw new Error(`Failed to activate site ${siteId}. Response: ${JSON.stringify(json)}`);
        }
      });
    });
  }

  private async getCategoryForCreation(
    page: Page,
    term = 'uncategorized'
  ): Promise<{ categoryId: string; name: string }> {
    return await test.step(`Get site category via API (term="${term}")`, async () => {
      return await this.withHttpClient(page, async httpClient => {
        const resp = await httpClient.post(API_ENDPOINTS.site.category, {
          data: {
            size: 16,
            sortBy: 'alphabetical',
            term,
          },
        });
        const json = (await resp.json()) as CategoryListResponse;
        const first = json?.result?.listOfItems?.[0];
        if (!first?.categoryId) {
          throw new Error(`Could not resolve category for term "${term}". Response: ${JSON.stringify(json)}`);
        }
        return { categoryId: first.categoryId, name: first.name };
      });
    });
  }

  async createSiteIfNeeded(page: Page, siteName: string): Promise<{ siteId: string; siteName: string }> {
    return await test.step(`Create site via API (name="${siteName}")`, async () => {
      const category = await this.getCategoryForCreation(page, 'uncategorized');
      return await this.withHttpClient(page, async httpClient => {
        const resp = await httpClient.post(API_ENDPOINTS.site.url, {
          data: {
            data: {
              access: 'public',
              hasPages: true,
              hasEvents: true,
              hasAlbums: true,
              hasDashboard: true,
              landingPage: 'dashboard',
              isContentFeedEnabled: true,
              isContentSubmissionsEnabled: true,
              isOwner: true,
              isMembershipAutoApproved: false,
              isBroadcast: false,
              isQuestionAnswerEnabled: true,
              name: siteName,
              category,
            },
          },
        });

        const json = (await resp.json()) as SiteCreationResponse;
        if (json?.status !== 'success' || !json?.result?.siteId) {
          throw new Error(`Site creation failed. Response: ${JSON.stringify(json)}`);
        }
        return { siteId: json.result.siteId, siteName };
      });
    });
  }

  /**
   * Returns the first active site; if there are no active sites:
   * - activates an existing site named `fallbackSiteName` if present, otherwise
   * - creates a new site named `fallbackSiteName`.
   */
  async getOrCreateFirstActiveSite(
    page: Page,
    fallbackSiteName: string
  ): Promise<{ siteId: string; siteName: string }> {
    return await test.step('Resolve a site to use (active or created)', async () => {
      const active = await this.getActiveSites(page);
      if (active.length > 0) {
        return { siteId: active[0].siteId, siteName: active[0].name };
      }

      const all = await this.getAllSites(page);
      const existing = all.find(s => (s.name || '').toLowerCase() === fallbackSiteName.toLowerCase());
      if (existing?.siteId) {
        if (!existing.isActive) {
          await this.activateSite(page, existing.siteId);
        }
        return { siteId: existing.siteId, siteName: existing.name };
      }

      return await this.createSiteIfNeeded(page, fallbackSiteName);
    });
  }
}
