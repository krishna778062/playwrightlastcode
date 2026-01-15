import { Page, request } from '@playwright/test';
import { getRecognitionTenantConfigFromCache } from '@recognition/config/recognitionConfig';

export class CommonApiHelper {
  readonly recognitionConfig = getRecognitionTenantConfigFromCache();
  readonly baseUrl = this.recognitionConfig.apiBaseUrl.replace(/\/$/, '');
  readonly frontendBaseUrl = this.recognitionConfig.frontendBaseUrl.replace(/\/$/, '');
  readonly frontendOrigin = new URL(this.frontendBaseUrl).origin;

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

  async createApiContext(page: Page, extraHeaders: Record<string, string> = {}) {
    const csrfToken = await this.getCsrfToken(page);
    const storageState = await page.context().storageState();

    const headers: Record<string, string> = {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'cache-control': 'no-cache',
      origin: this.frontendOrigin,
      pragma: 'no-cache',
      referer: this.frontendBaseUrl.endsWith('/') ? this.frontendBaseUrl : `${this.frontendBaseUrl}/`,
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'x-smtip-csrfid': csrfToken,
      ...extraHeaders,
    };

    const apiContext = await request.newContext({
      extraHTTPHeaders: headers,
      storageState,
    });

    return { apiContext, headers };
  }
}
