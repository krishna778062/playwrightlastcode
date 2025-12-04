import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';

import { NewHomePage } from './newHomePage';

import { BasePage } from '@/src/core/ui/pages/basePage';

export interface ILoginPageActions {
  performLogin: (username: string, password: string, options?: { timeout?: number }) => Promise<NewHomePage>;
  performLoginWithPassword: (username: string, password: string, options?: { timeout?: number }) => Promise<void>;
  performFirstTimeLoginBySettingPassword: (
    username: string,
    password: string,
    options?: { timeout?: number }
  ) => Promise<void>;
  setUserProfileSecurityQuestions: () => Promise<void>;
}

export class LoginPage extends BasePage implements ILoginPageActions {
  readonly usernameInput: Locator;
  readonly continueButton: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly selectDepartment: Locator;
  readonly firstQuestion: Locator;
  readonly firstAnswer: Locator;
  readonly secondQuestion: Locator;
  readonly secondAnswer: Locator;
  readonly thirdQuestion: Locator;
  readonly thirdAnswer: Locator;
  readonly loginIdentifierLabel: Locator;

  get actions(): ILoginPageActions {
    return this;
  }

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.LOGIN_PAGE);
    this.usernameInput = this.page.locator("input[name='inputOption']");
    this.continueButton = this.page.getByRole('button', { name: 'Continue' });
    this.passwordInput = this.page.locator("input[name='inputPassword']");
    this.signInButton = this.page.getByRole('button', { name: 'Sign in' });
    this.newPasswordInput = this.page.locator("input[name='initialPassword']");
    this.confirmPasswordInput = this.page.locator("input[name='confirmPasswordField']");
    this.selectDepartment = this.page.getByTestId('SelectInput');
    this.firstQuestion = this.page.locator('#firstQuestion');
    this.firstAnswer = this.page.locator('#firstAnswer');
    this.secondQuestion = this.page.locator('#secondQuestion');
    this.secondAnswer = this.page.locator('#secondAnswer');
    this.thirdQuestion = this.page.locator('#thirdQuestion');
    this.thirdAnswer = this.page.locator('#thirdAnswer');
    this.loginIdentifierLabel = this.page.locator("label[for='inputOption']");
  }

  /**
   * Detects the login identifier type from the label
   * @returns The login identifier type: 'email', 'employee', 'mobile', or 'phone'
   */
  async getLoginIdentifierType(): Promise<'email' | 'employee' | 'mobile' | 'phone'> {
    return await test.step('Detecting login identifier type', async () => {
      const labelText = (await this.loginIdentifierLabel.textContent())?.toLowerCase().trim() || '';
      const identifierMap: Record<string, 'email' | 'employee' | 'mobile' | 'phone'> = {
        email: 'email',
        mobile: 'mobile',
        'employee number': 'employee',
        phone: 'phone',
      };
      const detectedType = Object.entries(identifierMap).find(([keyword]) => labelText.includes(keyword))?.[1];
      return detectedType ?? 'email';
    });
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
  async performLogin(username: string, password: string, options?: { timeout?: number }): Promise<NewHomePage> {
    await this.performLoginWithPassword(username, password);
    await this.page.waitForURL('/home', {
      timeout: options?.timeout || TIMEOUTS.MEDIUM,
      waitUntil: 'domcontentloaded',
    });
    return new NewHomePage(this.page);
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

  async performFirstTimeLoginBySettingPassword(
    username: string,
    password: string,
    _options?: {
      timeout?: number;
    }
  ) {
    await test.step(`Logging in with username ${username} and password ${password}`, async () => {
      await this.fillInElement(this.usernameInput, username);
      await this.clickOnElement(this.continueButton);
      await this.selectDepartment.selectOption('QA');
      await this.clickOnElement(this.continueButton);
      await this.fillInElement(this.newPasswordInput, password);
      await this.fillInElement(this.confirmPasswordInput, password);
      await this.clickOnElement(this.signInButton);
    });
  }

  async setUserProfileSecurityQuestions(options?: { timeout?: number }): Promise<void> {
    await test.step('Setting user profile security questions for user', async () => {
      await this.page.waitForURL(/login\/profile-update/, {
        timeout: options?.timeout || TIMEOUTS.MEDIUM,
      });
      await this.firstQuestion.selectOption('What is your favorite time of the day?');
      await this.fillInElement(this.firstAnswer, 'automation');
      await this.secondQuestion.selectOption('What is the maiden name of your mother?');
      await this.fillInElement(this.secondAnswer, 'automation');
      await this.thirdQuestion.selectOption('Which is your favorite animal?');
      await this.fillInElement(this.thirdAnswer, 'automation');
      await this.clickOnElement(this.continueButton);
    });
  }
}
