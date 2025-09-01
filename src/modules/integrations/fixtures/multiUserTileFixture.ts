import { Page, test } from '@playwright/test';

import { AppManagerApiClient } from '@core/api/clients/appManagerApiClient';
import { ApiClientFactory } from '@core/api/factories/apiClientFactory';
import { getEnvConfig } from '@core/utils/getEnvConfig';

/**
 * Multi-user fixture for tile management tests
 * Following the chat module pattern for separate browser sessions
 * - Admin user: Creates and manages tiles
 * - End user: Verifies tile visibility
 */
export const multiUserTileFixture = test.extend<
  {
    adminPage: Page;
    endUserPage: Page;
  },
  {
    appManagerApiClient: AppManagerApiClient;
  }
>({
  appManagerApiClient: [
    async ({}, use, workerInfo) => {
      console.log(`INFO: Setting up app manager API client for worker => `, workerInfo.workerIndex);
      const appManagerApiClient = await ApiClientFactory.createClient(AppManagerApiClient, {
        type: 'credentials',
        credentials: {
          username: getEnvConfig().appManagerEmail,
          password: getEnvConfig().appManagerPassword,
        },
        baseUrl: getEnvConfig().apiBaseUrl,
      });
      await use(appManagerApiClient);
    },
    { scope: 'worker' },
  ],

  adminPage: [
    async ({ browser }, use) => {
      // Create admin context and page
      const adminContext = await browser.newContext({ recordVideo: { dir: 'test-results/videos/' } });
      const adminPage = await adminContext.newPage();

      // Login admin user
      await test.step(`Logging in Admin User`, async () => {
        const baseUrl = getEnvConfig().frontendBaseUrl;
        await adminPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });

        const usernameInput = adminPage.locator('#inputOption');
        await usernameInput.waitFor({ state: 'visible' });
        await usernameInput.fill(getEnvConfig().appManagerEmail);

        const continueButton = adminPage.getByRole('button', { name: /continue/i });
        await continueButton.click();

        const passwordInput = adminPage.locator('#inputPassword');
        await passwordInput.waitFor({ state: 'visible' });
        await passwordInput.fill(getEnvConfig().appManagerPassword);

        const signInButton = adminPage.getByRole('button', { name: /sign in/i });
        await signInButton.click();

        await adminPage.waitForURL(/\/(home|dashboard)($|\/|\?)/, { timeout: 30000 });
        const homeUrl = new URL('/home', baseUrl).toString();
        await adminPage.goto(homeUrl, { waitUntil: 'domcontentloaded' });
      });

      await use(adminPage);
      await adminContext.close();
    },
    { scope: 'test' },
  ],

  endUserPage: [
    async ({ browser }, use) => {
      // Create end user context and page
      const endUserContext = await browser.newContext({ recordVideo: { dir: 'test-results/videos/' } });
      const endUserPage = await endUserContext.newPage();
      // Login end user
      await test.step(`Logging in End User`, async () => {
        const baseUrl = getEnvConfig().frontendBaseUrl;
        await endUserPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });

        const usernameInput = endUserPage.locator('#inputOption');
        await usernameInput.waitFor({ state: 'visible' });

        const endUserEmail = getEnvConfig().endUserEmail;
        if (!endUserEmail) {
          throw new Error(
            'endUserEmail is not defined in environment configuration. Check your .env file or CI environment variables.'
          );
        }
        await usernameInput.fill(endUserEmail);

        const continueButton = endUserPage.getByRole('button', { name: /continue/i });
        await continueButton.click();

        const passwordInput = endUserPage.locator('#inputPassword');
        await passwordInput.waitFor({ state: 'visible' });

        const endUserPassword = getEnvConfig().endUserPassword;
        if (!endUserPassword) {
          throw new Error(
            'endUserPassword is not defined in environment configuration. Check your .env file or CI environment variables.'
          );
        }
        await passwordInput.fill(endUserPassword);

        const signInButton = endUserPage.getByRole('button', { name: /sign in/i });
        await signInButton.click();

        await endUserPage.waitForURL(/\/(home|dashboard)($|\/|\?)/, { timeout: 30000 });
        const homeUrl = new URL('/home', baseUrl).toString();
        await endUserPage.goto(homeUrl, { waitUntil: 'domcontentloaded' });
      });

      await use(endUserPage);
      await endUserContext.close();
    },
    { scope: 'test' },
  ],
});
