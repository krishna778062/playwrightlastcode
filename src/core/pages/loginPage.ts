import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@/src/core/pages/basePage';
import { Locator, Page, expect, test } from '@playwright/test';
import { LoginPageActionHelper } from '@core/helpers/loginPageActionHelper';
import { LoginPageAssertionHelper } from '@core/helpers/loginPageAssertionHelper';

export class LoginPage extends BasePage<LoginPageActionHelper, LoginPageAssertionHelper> {
  readonly usernameInput: Locator;
  readonly continueButton: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  //actions
  readonly loginActionHelper: LoginPageActionHelper;

  //assertions
  readonly loginAssertionHelper: LoginPageAssertionHelper;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.LOGIN_PAGE);
    this.usernameInput = this.page.locator("input[name='inputOption']");
    this.continueButton = this.page.getByRole('button', { name: 'Continue' });
    this.passwordInput = this.page.locator("input[name='inputPassword']");
    this.signInButton = this.page.getByRole('button', { name: 'Sign in' });
    this.loginActionHelper = new LoginPageActionHelper(this);
    this.loginAssertionHelper = new LoginPageAssertionHelper(this);
  }

  get actions(): LoginPageActionHelper {
    return this.loginActionHelper;
  }

  get assertions(): LoginPageAssertionHelper {
    return this.loginAssertionHelper;
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
}
