import { Page, test } from '@playwright/test';

import { LoginPage } from '@core/pages/loginPage';
import { UserCredentials } from '@core/types/test.types';

import { PAGE_ENDPOINTS } from '../constants/pageEndpoints';
import { NewUxHomePage } from '../pages/homePage/newUxHomePage';
import { OldUxHomePage } from '../pages/homePage/oldUxHomePage';

export class LoginHelper {
  /**
   * Logs in a user through the UI.
   * @param page - The Playwright Page object.
   * @param user - The user to log in.
   * @param options - Optional parameters for the login step.
   * @returns An instance of the HomePage.
   */
  public static async loginWithPassword(page: Page, user: UserCredentials): Promise<OldUxHomePage | NewUxHomePage> {
    const loginPage = new LoginPage(page);
    await loginPage.visitPage({ stepInfo: `Loading login page for user ${user.email}` });
    const homePage = await loginPage.actions.performLogin(user.email, user.password!);
    return homePage;
  }

  /**
   * Logs out a user through the UI.
   * @param page - The page instance which is logged in.
   */
  public static async logoutByNavigatingToLogoutPage(page: Page): Promise<void> {
    await test.step(`Logging out`, async () => {
      await page.goto(PAGE_ENDPOINTS.LOGOUT);
    });
  }
}
