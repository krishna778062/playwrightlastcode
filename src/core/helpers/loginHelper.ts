import { expect, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { UserCredentials } from '@core/types/test.types';

import { PAGE_ENDPOINTS } from '../constants/pageEndpoints';
import { NewHomePage } from '../ui/pages/newHomePage';

// import { NewUxHomePage } from '../ui/pages/homePage/newUxHomePage';
// import { OldUxHomePage } from '../ui/pages/homePage/oldUxHomePage';
import { LoginPage } from '@/src/core/ui/pages/loginPage';

export class LoginHelper {
  /**
   * Logs in a user through the UI.
   * @param page - The Playwright Page object.
   * @param user - The user to log in.
   * @param options - Optional parameters for the login step.
   * @returns An instance of the HomePage.
   */
  public static async loginWithPassword(page: Page, user: UserCredentials): Promise<NewHomePage> {
    const loginPage = new LoginPage(page);
    await loginPage.loadPage({ stepInfo: `Loading login page for user ${user.email}` });
    const homePage = await loginPage.actions.performLogin(user.email, user.password!);
    return homePage;
  }

  public static async setPasswordForFirstTimeLogin(page: Page, user: UserCredentials): Promise<void> {
    const loginPage = new LoginPage(page);
    await loginPage.loadPage({ stepInfo: `Loading login page for user ${user.email}` });
    await loginPage.actions.performFirstTimeLoginBySettingPassword(user.email, user.password!);
  }
  // step to set user profile security questions
  public static async setUserProfileSecurityQuestions(page: Page): Promise<void> {
    const loginPage = new LoginPage(page);
    await loginPage.actions.setUserProfileSecurityQuestions();
  }

  /**
   * Logs out a user through the UI.
   * @param page - The page instance which is logged in.
   */
  public static async logoutByNavigatingToLogoutPage(page: Page): Promise<void> {
    const loginPage = new LoginPage(page);
    await test.step(`Logging out`, async () => {
      await page.goto(PAGE_ENDPOINTS.LOGOUT);
      await expect(loginPage.continueButton, `expecting continue button to be visible`).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }
}
