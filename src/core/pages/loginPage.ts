import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@/src/core/pages/basePage';
import { Locator, Page, expect, test } from '@playwright/test';
import { OldUxHomePage } from '@/src/core/pages/homePage/oldUxHomePage';
import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { getEnvConfig } from '@/src/core/utils/getEnvConfig';

export interface ILoginPageActions {
  performLogin: (username: string, password: string, options?: { timeout?: number }) => Promise<NewUxHomePage | OldUxHomePage>;
  performLoginWithPassword: (username: string, password: string, options?: { timeout?: number }) => Promise<void>;
}

export class LoginPage extends BasePage implements ILoginPageActions {
  readonly usernameInput: Locator;
  readonly continueButton: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  get actions(): ILoginPageActions {
    return this;
  }



  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.LOGIN_PAGE);
    this.usernameInput = this.page.locator("input[name='inputOption']");
    this.continueButton = this.page.getByRole('button', { name: 'Continue' });
    this.passwordInput = this.page.locator("input[name='inputPassword']");
    this.signInButton = this.page.getByRole('button', { name: 'Sign in' });
  }

  /**
   * Verifies the login page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step(`Verifying the login page is loaded`, async () => {
      await expect(this.usernameInput, `expecting username input to be visible`).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

    /**
   * Logs in to the application
   * @param username - The username to log in with
   * @param password - The password to log in with
   */
    async performLogin(username: string, password: string, options?: { timeout?: number }): Promise<NewUxHomePage | OldUxHomePage> {
      await this.performLoginWithPassword(username, password);
      await this.page.waitForURL('/home', { timeout: options?.timeout || TIMEOUTS.MEDIUM });
      return getEnvConfig().newUxEnabled ? new NewUxHomePage(this.page) : new OldUxHomePage(this.page);
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
        await this.usernameInput.fill(username);
        await this.continueButton.click();
        await this.page.waitForURL(/authenticate/, {
          timeout: options?.timeout || TIMEOUTS.MEDIUM,
        });
        await this.passwordInput.fill(password);
        await this.signInButton.click();
      });
    }
}
