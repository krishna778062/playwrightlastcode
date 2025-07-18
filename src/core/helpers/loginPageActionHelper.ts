import { Page, test } from '@playwright/test';
import { HomePage } from '../pages/oldUx/homePage';
import { LoginPage } from '../pages/loginPage';
import { TIMEOUTS } from '../constants/timeouts';

export class LoginPageActionHelper {
  readonly page: Page;
  constructor(readonly loginPage: LoginPage) {
    this.loginPage = loginPage;
    this.page = this.loginPage.page;
  }

  /**
   * Logs in to the application
   * @param username - The username to log in with
   * @param password - The password to log in with
   */
  async performLogin(username: string, password: string, options?: { timeout?: number }): Promise<HomePage> {
    await this.performLoginWithPassword(username, password);
    await this.page.waitForURL('/home', { timeout: options?.timeout || TIMEOUTS.MEDIUM });
    return new HomePage(this.page);
  }

  /**
   * Logs in to the application with password
   * @param username - The username to log in with
   * @param password - The password to log in with
   * @param options - The options to pass to the method
   * @param options.timeout - The timeout to pass to the method
   */
  async performLoginWithPassword(
    username: string,
    password: string,
    options?: {
      timeout?: number;
    }
  ) {
    await test.step(`Logging in with username ${username} and password ${password}`, async () => {
      await this.loginPage.usernameInput.fill(username);
      await this.loginPage.continueButton.click();
      await this.page.waitForURL(/authenticate/, {
        timeout: options?.timeout || TIMEOUTS.MEDIUM,
      });
      await this.loginPage.passwordInput.fill(password);
      await this.loginPage.signInButton.click();
    });
  }
}
