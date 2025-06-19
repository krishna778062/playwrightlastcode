import { Browser, BrowserContext, Page, Locator } from '@playwright/test';
import { GlobalSearchPage } from '@global-search/pages/globalSearchPage';
import { LoginPage } from '@/src/modules/chat/pages/loginPage';
import { HomePage } from '@/src/modules/chat/pages/homePage';
import { loadEnvVariables } from '@core/utils/envLoader';
import { Environments } from '@core/constants/environments';
import { BaseActionUtil } from '../../../core/utils/baseActionUtil';
import { PageActions, ElementState } from '../../../core/utils/pageActions';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

export class GlobalSearchTestHelper {
  private browser: Browser | undefined;
  private context: BrowserContext | undefined;
  private page: Page | undefined;
  private globalSearchPage: GlobalSearchPage | undefined;
  private loginPage: LoginPage | undefined;
  private homePage: HomePage | undefined;
  private baseActionUtil: BaseActionUtil | undefined;
  private pageActions: PageActions | undefined;

  async setup(browser: Browser, config?: any) {
    this.browser = browser;
    this.context = await browser.newContext();
    this.page = await this.context.newPage();
    this.globalSearchPage = new GlobalSearchPage(this.page);
    this.loginPage = new LoginPage(this.page);
    this.baseActionUtil = new BaseActionUtil(this.page);
    this.pageActions = new PageActions(this.page);
  }

  async loginAsWorkplaceAdmin(options?: { stepInfo?: string; timeout?: number }) {
    if (!this.page || !this.loginPage) {
      throw new Error('Page or LoginPage not initialized. Call setup() first.');
    }

    // Ensure environment variables are loaded
    const currentEnv = (process.env.TEST_ENV as Environments) || Environments.TEST;
    console.log('=== Environment:', currentEnv, '===');

    // Load environment variables if not already loaded
    loadEnvVariables(currentEnv);

    // Get environment variables from env file
    const baseUrl = process.env.FRONTEND_BASE_URL;
    const adminEmail = process.env.APP_MANAGER_USERNAME;
    const adminPassword = process.env.APP_MANAGER_PASSWORD;

    console.log('Environment variables loaded:');
    console.log('FRONTEND_BASE_URL:', baseUrl);
    console.log('APP_MANAGER_USERNAME:', adminEmail);
    console.log('APP_MANAGER_PASSWORD:', adminPassword ? '***' : 'NOT SET');
    console.log('=====================================');

    if (!baseUrl || !adminEmail || !adminPassword) {
      throw new Error('Required environment variables are not set. Please check your env file.');
    }

    // Navigate directly to the login page first
    const loginUrl = `${baseUrl}${PAGE_ENDPOINTS.LOGIN_PAGE}`;
    await this.page.goto(loginUrl);

    // Then proceed with the login process
    this.homePage = await this.loginPage.login(adminEmail, adminPassword, {
      stepInfo: options?.stepInfo || `Logging in as workplace admin`,
      timeout: options?.timeout,
    });
  }

  getGlobalSearchPage(): GlobalSearchPage {
    if (!this.globalSearchPage) {
      throw new Error('GlobalSearchPage not initialized. Call setup() first.');
    }
    return this.globalSearchPage;
  }

  getHomePage(): HomePage {
    if (!this.homePage) {
      throw new Error('HomePage not initialized. Login first.');
    }
    return this.homePage;
  }

  async cleanup() {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}
