// import { BrowserContext, Browser } from '@playwright/test';
// import { LoginPage } from '../../../core/pages/loginPage';
// import { Page } from '@playwright/test';
// import { GlobalSearchPage } from '../pages/globalSearchPage';
// import { HomePage } from '../../../core/pages/homePage';
// import { getEnvConfig } from '../../../core/utils/getEnvConfig';
// import { LoginHelper } from '../../../core/helpers/loginHelper';

// export class GlobalSearchTestHelper {
//   private browser: Browser | undefined;
//   private context: BrowserContext | undefined;
//   private page: Page | undefined;
//   private globalSearchPage: GlobalSearchPage | undefined;
//   private loginPage: LoginPage | undefined;
//   private homePage: HomePage | undefined;

//   async setup(browser: Browser, config?: any) {
//     this.browser = browser;
//     this.context = await browser.newContext();
//     this.page = await this.context.newPage();
//     this.globalSearchPage = new GlobalSearchPage(this.page);
//     this.loginPage = new LoginPage(this.page);
//   }

//   async loginAsWorkplaceAdmin(options?: { stepInfo?: string; timeout?: number }) {
//     if (!this.page || !this.loginPage) {
//       throw new Error('Page or LoginPage not initialized. Call setup() first.');
//     }
//     this.homePage = await LoginHelper.loginWithPassword(this.page, {
//       email: getEnvConfig().appManagerEmail,
//       password: getEnvConfig().appManagerPassword,
//     });
//   }

//   getGlobalSearchPage(): GlobalSearchPage {
//     if (!this.globalSearchPage) {
//       throw new Error('GlobalSearchPage not initialized. Call setup() first.');
//     }
//     return this.globalSearchPage;
//   }

//   getHomePage(): HomePage {
//     if (!this.homePage) {
//       throw new Error('HomePage not initialized. Login first.');
//     }
//     return this.homePage;
//   }

//   async cleanup() {
//     if (this.context) {
//       await this.context.close();
//     }
//     if (this.browser) {
//       await this.browser.close();
//     }
//   }
// }
