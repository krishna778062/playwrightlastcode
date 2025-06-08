import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from './basePage';
import { Locator, Page, expect, test } from '@playwright/test';
import { HomePage } from './homePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly continueButton: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

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
  async login(
    username: string,
    password: string,
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<HomePage> {
    await this.performLoginWithPassword(username, password, options);
    await this.page.waitForURL('/home', { timeout: options?.timeout || TIMEOUTS.MEDIUM });
    return new HomePage(this.page);
  }

  async performLoginWithPassword(
    username: string,
    password: string,
    options?: { stepInfo?: string; timeout?: number }
  ) {
    await test.step(
      options?.stepInfo || `Logging in with username ${username} and password ${password}`,
      async () => {
        await this.usernameInput.fill(username);
        await this.continueButton.click();
        await this.page.waitForURL(/authenticate/, {
          timeout: options?.timeout || TIMEOUTS.MEDIUM,
        });
        await this.passwordInput.fill(password);
        await this.signInButton.click();
        await test.step('check page rendering', async step => {
          const screenshot = await this.page.screenshot();
          /**
           * I have added this for e.g purpose, we can use this extensively for APIs though
           */
          // await step.attach('screenshot', { body: screenshot, contentType: 'image/png' });
          // await step.attach('userInput', { body: username, contentType: 'text/plain' });
        });
      }
    );
  }
}
