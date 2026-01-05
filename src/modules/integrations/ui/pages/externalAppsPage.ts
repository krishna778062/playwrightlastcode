import { CustomAppsComponent } from '@integrations-components/customAppsComponent';
import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';
import { ConfluenceHelper } from '@/src/modules/integrations/apis/helpers/confluenceHelper';
import { SERVICE_NOW_VALUES } from '@/src/modules/integrations/test-data/app-tiles.test-data';

export interface IExternalAppsActions {
  navigateToExternalAppsPage: (userId?: string) => Promise<void>;
  disconnectIntegration: (provider: ExternalAppProvider) => Promise<void>;
  connectGoogleAccountIntegration: (provider: ExternalAppProvider, email?: string, password?: string) => Promise<void>;
  connectConfluenceServiceAccount: (incorrectCredentials?: boolean) => Promise<void>;
}

export interface IExternalAppsAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyIntegrationNotConnected: (provider: ExternalAppProvider) => Promise<void>;
  verifyIntegrationIsConnected: (provider: ExternalAppProvider, expectedStatus: boolean) => Promise<void>;
  verifyToastMessageIsVisibleWithText: (message: string) => Promise<void>;
  verifyGoogleCalendarDisconnectModalTexts: (confirmModal: Locator) => Promise<void>;
  getConnectionStatus: (provider: ExternalAppProvider) => Promise<boolean>;
  isIntegrationConnected: (provider: ExternalAppProvider) => Promise<boolean>;
  getConnectedIntegrationsCount: () => Promise<number>;
  getAllIntegrationsCount: () => Promise<number>;
}

export enum ExternalAppCategory {
  CALENDAR = 'Calendar',
  FILE_STORAGE = 'File storage',
  SUPPORT_TICKETING = 'Support & ticketing',
  TASK_MANAGEMENT = 'Task management',
  LEARNING_MANAGEMENT = 'Learning management',
  OTHERS = 'Others',
}

export enum ExternalAppProvider {
  GOOGLE_CALENDAR = 'Google Calendar',
  OUTLOOK_CALENDAR = 'Outlook Calendar',
  BOX = 'Box',
  DROPBOX = 'Dropbox',
  GOOGLE_DRIVE = 'Google Drive',
  ONEDRIVE = 'OneDrive',
  SHAREPOINT = 'SharePoint',
  ATLASSIAN_CONFLUENCE = 'Atlassian Confluence',
  SERVICENOW = 'ServiceNow',
  ZENDESK = 'Zendesk',
  ASANA = 'Asana',
  MONDAY_COM = 'Monday.com',
  DOCEBO = 'Docebo',
  AIRTABLE = 'Airtable',
  BOX_AUTOMATION = 'Box_Automation',
  DOCUSIGN = 'Docusign',
  GITHUB = 'GitHub',
  POWER_BI = 'Power BI',
  FRESHSERVICE = 'Freshservice',
}

export enum ExternalAppStatus {
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
}

export class ExternalAppsPage extends BasePage implements IExternalAppsActions, IExternalAppsAssertions {
  readonly externalAppsTabPanel: Locator;
  readonly calendarSection: Locator;
  readonly fileStorageSection: Locator;
  readonly supportTicketingSection: Locator;
  readonly taskManagementSection: Locator;
  readonly learningManagementSection: Locator;
  readonly othersSection: Locator;
  readonly allIntegrationItems: Locator;
  readonly connectedStatusIndicators: Locator;
  readonly disconnectButtons: Locator;
  readonly connectButtons: Locator;
  readonly acceptButton: Locator;
  readonly customAppsComponent: CustomAppsComponent;
  readonly connectConfluenceButton: Locator;
  readonly serviceNowUserName: Locator;
  readonly serviceNowPassword: Locator;
  readonly serviceNowLoginButton: Locator;
  readonly allowAccessButton: Locator;
  readonly auth0UsernameInput: Locator;
  readonly auth0PasswordInput: Locator;
  readonly auth0ContinueButton: Locator;
  // Multi-connection selection dialog elements
  readonly connectionSelectionDialog: Locator;
  readonly connectionSelectionTitle: Locator;
  readonly connectionSelectionCancelButton: Locator;
  readonly connectionSelectionConnectButton: Locator;
  readonly connectionSelectionCloseButton: Locator;
  private cachedUserId?: string;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.EXTERNAL_APPS_PAGE);
    this.externalAppsTabPanel = page.locator('div[aria-label="External apps"]');
    this.calendarSection = page.locator('h2:has-text("Calendar")').locator('..');
    this.fileStorageSection = page.locator('h2:has-text("File storage")').locator('..');
    this.supportTicketingSection = page.locator('h2:has-text("Support & ticketing")').locator('..');
    this.taskManagementSection = page.locator('h2:has-text("Task management")').locator('..');
    this.learningManagementSection = page.locator('h2:has-text("Learning management")').locator('..');
    this.othersSection = page.locator('h2:has-text("Others")').locator('..');
    this.allIntegrationItems = page.locator('ConnectedServices-module-item');
    this.connectedStatusIndicators = page.locator('ConnectedServices-module');
    this.disconnectButtons = page.locator('button[aria-label*="Disconnect"]');
    this.connectButtons = page.locator('button[aria-label*="Connect"]');
    this.customAppsComponent = new CustomAppsComponent(page);
    this.acceptButton = page.locator('button[type="submit"]');
    this.connectConfluenceButton = page.locator('button[aria-label="Connect your Atlassian Confluence account"]');
    this.serviceNowUserName = page.locator('#user_name');
    this.serviceNowPassword = page.locator('#user_password');
    this.serviceNowLoginButton = page.locator('[id="sysverb_login"]');
    this.allowAccessButton = page.locator('[name="oauth_auth_check_action"]').nth(1);
    this.auth0UsernameInput = page.locator('input[name="username"], input[type="email"]').first();
    this.auth0PasswordInput = page.locator('input[name="password"], input[type="password"]').first();
    this.auth0ContinueButton = page.locator('button[type="submit"], button:has-text("Continue")').first();

    // Multi-connection selection dialog
    this.connectionSelectionDialog = page.locator('div[role="dialog"][class*="MultiConnectionDialog"]');
    this.connectionSelectionTitle = page.locator('h2:has-text("Select")');
    this.connectionSelectionCancelButton = this.connectionSelectionDialog.getByRole('button', { name: 'Cancel' });
    this.connectionSelectionConnectButton = this.connectionSelectionDialog.getByRole('button', { name: 'Connect' });
    this.connectionSelectionCloseButton = this.connectionSelectionDialog.getByRole('button', { name: 'Close' });
  }

  get actions(): IExternalAppsActions {
    return this;
  }

  get assertions(): IExternalAppsAssertions {
    return this;
  }

  /**
   * Get external integration item locator by provider
   */
  getExternalIntegrationItem(provider: ExternalAppProvider): Locator {
    return this.page.locator(`xpath=//*[text()="${provider}"]`);
  }

  /**
   * Get custom app element locator by app name
   */
  getCustomAppElement(appName: string): Locator {
    return this.page.locator(`xpath=//*[text()="${appName}"]`);
  }

  /**
   * Get custom app button locator (Connect/Disconnect account)
   */
  getCustomAppButton(appName: string, buttonText: string): Locator {
    return this.page.locator(`li:has(h3:has-text("${appName}")) button:has-text("${buttonText}")`);
  }

  /**
   * Get connection card by connection name from the multi-connection selection dialog
   * @param connectionName - The name of the connection to select
   */
  getConnectionCard(connectionName: string): Locator {
    return this.connectionSelectionDialog.locator(
      `button[class*="connectionCard"]:has(p:text-is("${connectionName}"))`
    );
  }

  /**
   * Navigate to external apps page for a specific user
   */
  async navigateToExternalAppsPage(userId?: string): Promise<void> {
    await test.step('Navigate to external apps page', async () => {
      if (!userId) {
        if (this.cachedUserId) {
          userId = this.cachedUserId;
        } else {
          userId = await this.page.evaluate(() => {
            return (window as any).Simpplr?.CurrentUser?.uid;
          });
          if (!userId) {
            throw new Error('Could not get current user ID from Simpplr.CurrentUser.uid');
          }
          this.cachedUserId = userId;
        }
      }
      const url = PAGE_ENDPOINTS.EXTERNAL_APPS_PAGE.replace(':userId', userId);
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    });
  }

  /**
   * Verify the external apps page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the external apps page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.externalAppsTabPanel, {
        timeout: 30_000,
        assertionMessage: 'Verifying that the external apps page is loaded by checking the main tab panel',
      });
      await this.verifier.verifyTheElementIsVisible(this.calendarSection, {
        timeout: 10_000,
        assertionMessage: 'Verifying that the calendar section is visible',
      });
    });
  }

  async verifyToastMessageIsVisibleWithText(message: string): Promise<void> {
    return this.customAppsComponent.verifyToastMessageIsVisibleWithText(message);
  }

  /**
   * Get integration item by provider name
   */
  getIntegrationItem(provider: ExternalAppProvider): Locator {
    return this.page.locator(`li:has(h3:has-text("${provider}"))`);
  }

  /**
   * Get disconnect button for a specific integration
   */
  getDisconnectButton(provider: ExternalAppProvider): Locator {
    const integrationItem = this.getIntegrationItem(provider);
    return integrationItem.locator('button[aria-label*="Disconnect"]');
  }

  /**
   * Get connect button for a specific integration
   */
  getConnectButton(provider: ExternalAppProvider): Locator {
    const integrationItem = this.getIntegrationItem(provider);
    return integrationItem.locator('button[aria-label*="Connect"]');
  }

  /**
   * Verify a specific integration is not connected
   */
  async verifyIntegrationNotConnected(provider: ExternalAppProvider): Promise<void> {
    await test.step(`Verify ${provider} integration is not connected`, async () => {
      const integrationItem = this.getIntegrationItem(provider);
      await this.verifier.verifyTheElementIsVisible(integrationItem, {
        timeout: 10_000,
        assertionMessage: `Verifying that ${provider} integration is visible`,
      });
      const statusIndicator = integrationItem.locator('ConnectedServices-module');
      await this.verifier.verifyTheElementIsNotVisible(statusIndicator, {
        timeout: 5_000,
        assertionMessage: `Verifying that ${provider} does not show connected status indicator`,
      });
      const connectButton = integrationItem.locator('button[aria-label*="Connect"]');
      await this.verifier.verifyTheElementIsVisible(connectButton, {
        timeout: 5_000,
        assertionMessage: `Verifying that ${provider} has connect button`,
      });
    });
  }

  /**
   * Verify a custom app is visible in External Apps page
   * @param appName - The name of the custom app
   */
  async verifyCustomAppIsVisible(appName: string): Promise<void> {
    await test.step(`Verify custom app "${appName}" is visible in External Apps`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.getCustomAppElement(appName), {
        timeout: 10_000,
        assertionMessage: `Verifying that custom app "${appName}" is visible in External Apps page`,
      });
    });
  }

  /**
   * Verify a custom app is NOT visible in External Apps page
   * @param appName - The name of the custom app
   */
  async verifyCustomAppIsNotVisible(appName: string): Promise<void> {
    await test.step(`Verify custom app "${appName}" is NOT visible in External Apps`, async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.getCustomAppElement(appName), {
        timeout: 10_000,
        assertionMessage: `Verifying that custom app "${appName}" is NOT visible in External Apps page after disabling`,
      });
    });
  }

  /**
   * Verify text is displayed on the page
   * @param text - The text to verify
   */
  async verifyTextIsDisplayed(text: string): Promise<void> {
    await test.step(`Verify text "${text}" is displayed`, async () => {
      const textElement = this.page.locator(`text=${text}`).first();
      await this.verifier.verifyTheElementIsVisible(textElement, {
        timeout: 10_000,
        assertionMessage: `Verifying that text "${text}" is visible on the page`,
      });
    });
  }

  /**
   * Click Connect account button for a custom app
   * @param appName - The name of the custom app
   */
  async clickConnectAccountForCustomApp(appName: string): Promise<void> {
    await test.step(`Click Connect account for custom app "${appName}"`, async () => {
      const connectButton = this.getCustomAppButton(appName, 'Connect account');
      await connectButton.waitFor({ state: 'visible', timeout: 10_000 });
      await connectButton.click();
    });
  }

  /**
   * Click Disconnect account button for a custom app
   * @param appName - The name of the custom app
   */
  async clickDisconnectAccountForCustomApp(appName: string): Promise<void> {
    await test.step(`Click Disconnect account for custom app "${appName}"`, async () => {
      const disconnectButton = this.getCustomAppButton(appName, 'Disconnect account');
      await disconnectButton.waitFor({ state: 'visible', timeout: 10_000 });
      await disconnectButton.click();
    });
  }

  /**
   * Connect Auth0 account with credentials
   * @param username - The Auth0 username/email
   * @param password - The Auth0 password
   */
  async connectAuth0Account(username: string, password: string): Promise<void> {
    await test.step('Connect Auth0 account with credentials', async () => {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15_000 });

      await this.auth0UsernameInput.waitFor({ state: 'visible', timeout: 10_000 });
      await this.auth0UsernameInput.fill(username);

      await this.auth0PasswordInput.waitFor({ state: 'visible', timeout: 10_000 });
      await this.auth0PasswordInput.fill(password);

      await this.auth0ContinueButton.waitFor({ state: 'visible', timeout: 5_000 });
      await this.auth0ContinueButton.click();

      await this.page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
    });
  }

  /**
   * Verify custom app button state (Connect account or Disconnect account)
   * @param appName - The name of the custom app
   * @param expectedButtonText - Expected button text ('Connect account' or 'Disconnect account')
   */
  async verifyCustomAppButtonState(appName: string, expectedButtonText: string): Promise<void> {
    await test.step(`Verify "${appName}" has "${expectedButtonText}" button`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.getCustomAppButton(appName, expectedButtonText), {
        timeout: 10_000,
        assertionMessage: `Verifying that "${appName}" has "${expectedButtonText}" button`,
      });
    });
  }

  /**
   * Get connection status for an integration
   * Returns true if next <p> tag contains "Connected as" text, false otherwise
   */
  async getConnectionStatus(provider: ExternalAppProvider): Promise<boolean> {
    return await test.step(`Get connection status for ${provider}`, async () => {
      const integrationItem = this.getExternalIntegrationItem(provider);
      const nextParagraph = integrationItem.locator('xpath=following-sibling::p[contains(text(), "Connected as")]');
      const isVisible = await nextParagraph.isVisible({ timeout: 3000 }).catch(() => false);
      return isVisible;
    });
  }

  /**
   * Verify disconnect modal texts for Google Calendar
   */
  async verifyGoogleCalendarDisconnectModalTexts(confirmModal: Locator): Promise<void> {
    await test.step('Verify Google Calendar disconnect modal texts', async () => {
      const text1 = confirmModal.locator(
        'text=Disable event syncing with the Google Calendars of your site members and followers.'
      );
      await expect(text1).toBeVisible();
      const text2 = confirmModal.locator(
        'text=Delete all events in Google that you have created in Integrations QA Tenant from the calendars of all members, Events created directly in Google will stay.'
      );
      await expect(text2).toBeVisible();
      const text3 = confirmModal.locator(
        'text=We strongly recommend keeping your Google Calendar connected to ensure event syncing and to prevent loss of events.'
      );
      await expect(text3).toBeVisible();
    });
  }

  /**
   * Disconnect a specific integration
   */
  async disconnectIntegration(provider: ExternalAppProvider): Promise<void> {
    await test.step(`Disconnect ${provider} integration`, async () => {
      const disconnectButton = this.page.locator(`button[aria-label="Disconnect your ${provider} account"]`);
      await disconnectButton.click();
      const confirmModal = this.page.locator('div[role="dialog"]');
      if (ExternalAppProvider.GOOGLE_CALENDAR === provider) {
        await this.verifyGoogleCalendarDisconnectModalTexts(confirmModal);
      }
      await confirmModal.waitFor({ state: 'visible', timeout: 5000 });
      const confirmButton = confirmModal.getByRole('button', { name: 'Disconnect' });
      await confirmButton.click();
      await confirmModal.waitFor({ state: 'hidden', timeout: 5000 });
    });
  }

  /**
   * Connect a specific integration with robust Google OAuth flow
   * Timeout: 6 minutes for Google OAuth flow
   */
  async connectGoogleAccountIntegration(
    provider: ExternalAppProvider,
    email?: string,
    password?: string
  ): Promise<void> {
    await test.step(`Connect ${provider} integration`, async () => {
      // Step 1: Click "Sign in with Google" button
      const connectButton = this.page.locator(`button[aria-label="Sign in with Google"]`);
      await connectButton.waitFor({ state: 'visible', timeout: 10000 });
      await connectButton.click();
      // Wait for Google login page to load
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      // Step 2: Enter email and click Next
      const emailInput = this.page.locator('input[type="email"]');
      await emailInput.waitFor({ state: 'visible', timeout: 10000 });
      await emailInput.fill(email!);
      const nextButton1 = this.page.getByRole('button', { name: 'Next' });
      await nextButton1.waitFor({ state: 'visible', timeout: 5000 });
      await nextButton1.click();
      // Wait for the next screen to load
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await this.page.waitForTimeout(2000); // Small delay for page transition
      // Step 3: Click "Try another way"
      const tryAnotherWayButton = this.page.getByRole('button', { name: 'Try another way' });
      await tryAnotherWayButton.waitFor({ state: 'visible', timeout: 10000 });
      await tryAnotherWayButton.click();
      // Wait for authentication options screen
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await this.page.waitForTimeout(1500);
      // Step 4: Click "Enter your password"
      const enterPasswordOption = this.page.getByText('Enter your password');
      await enterPasswordOption.waitFor({ state: 'visible', timeout: 10000 });
      await enterPasswordOption.click();
      // Wait for password screen to load
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await this.page.waitForTimeout(1500);
      // Step 5: Enter password and click Next
      const passwordInput = this.page.locator('input[type="password"]');
      await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
      await passwordInput.fill(password!);
      const nextButton2 = this.page.getByRole('button', { name: 'Next' });
      await nextButton2.waitFor({ state: 'visible', timeout: 5000 });
      await nextButton2.click();
      // Wait for consent/permissions screen
      await this.page.waitForLoadState('domcontentloaded', { timeout: 20000 });
      await this.page.waitForTimeout(2000);
      // Step 6: Click first "Continue" button (permissions screen)
      const continueButton1 = this.page.getByRole('button', { name: 'Continue' });
      await continueButton1.waitFor({ state: 'visible', timeout: 10000 });
      await continueButton1.click();
      // Wait for next permissions screen
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
      await this.page.waitForTimeout(2000);
      // Step 7: Click second "Continue" button (final permissions confirmation)
      const continueButton2 = this.page.getByRole('button', { name: 'Continue' });
      await continueButton2.waitFor({ state: 'visible', timeout: 10000 });
      await continueButton2.click();
    });
  }

  /**
   * Get count of connected integrations
   */
  async getConnectedIntegrationsCount(): Promise<number> {
    return await test.step('Get count of connected integrations', async () => {
      return await this.connectedStatusIndicators.count();
    });
  }

  /**
   * Get count of all integrations (connected and disconnected)
   */
  async getAllIntegrationsCount(): Promise<number> {
    return await test.step('Get count of all integrations', async () => {
      return await this.allIntegrationItems.count();
    });
  }

  /**
   * Check if an integration is connected
   */
  async isIntegrationConnected(provider: ExternalAppProvider): Promise<boolean> {
    return await test.step(`Check if ${provider} integration is connected`, async () => {
      const integrationItem = this.getIntegrationItem(provider);
      const statusIndicator = integrationItem.locator('button:has-text("Disconnect account")');
      return await statusIndicator.isVisible();
    });
  }

  // verify integration is connected
  async verifyIntegrationIsConnected(provider: ExternalAppProvider, expectedStatus: boolean): Promise<void> {
    await test.step(`Verify ${provider} integration is ${expectedStatus ? 'connected' : 'disconnected'}`, async () => {
      await this.page.waitForLoadState('domcontentloaded');
      let isConnected = await this.isIntegrationConnected(provider);
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          await this.navigateToExternalAppsPage();
          await this.verifyThePageIsLoaded();
          isConnected = await this.isIntegrationConnected(provider);
          if (isConnected === expectedStatus) {
            break;
          }
          await this.page.waitForTimeout(5000);
        } catch (error) {
          if (attempt === 3) throw error;
        }
      }
      expect(isConnected).toBe(expectedStatus);
    });
  }

  async connectConfluenceServiceAccount(incorrectCredentials: boolean = false): Promise<void> {
    await test.step('Connect Confluence service account', async () => {
      await this.connectConfluenceButton.click();

      await this.page.waitForLoadState('domcontentloaded');
      await this.verifyThePageIsLoaded();
      await this.acceptButton.waitFor({ state: 'visible', timeout: 10000 });
      const currentUrl = this.page.url();
      const isConsentPage = currentUrl.includes('/oauth2/authorize/server/consent');

      if (isConsentPage) {
        await this.acceptButton.click();
      } else {
        const confluenceHelper = new ConfluenceHelper(this.page);
        await confluenceHelper.handleConfluenceLogin(incorrectCredentials);
      }
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(10000);
      if (incorrectCredentials) {
        await this.navigateToExternalAppsPage();
      }
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  /**
   * Select a connection from the multi-connection selection dialog
   * @param connectionName - The name of the connection to select
   */
  async selectConnectionFromDialog(connectionName: string): Promise<void> {
    await test.step(`Select connection "${connectionName}" from dialog`, async () => {
      // Wait for the dialog to appear
      await this.connectionSelectionDialog.waitFor({ state: 'visible', timeout: 10_000 });

      // Verify the dialog title is visible
      await expect(this.connectionSelectionTitle).toBeVisible({ timeout: 5_000 });

      // Click on the connection card with the specified name
      const connectionCard = this.getConnectionCard(connectionName);
      await connectionCard.waitFor({ state: 'visible', timeout: 10_000 });
      await connectionCard.click();

      // Click the Connect button
      await this.connectionSelectionConnectButton.waitFor({ state: 'visible', timeout: 5_000 });
      await expect(this.connectionSelectionConnectButton).toBeEnabled({ timeout: 5_000 });
      await this.connectionSelectionConnectButton.click();

      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  /**
   * Verify the connection selection dialog is visible
   */
  async verifyConnectionSelectionDialogIsVisible(): Promise<void> {
    await test.step('Verify connection selection dialog is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.connectionSelectionDialog, {
        timeout: 10_000,
        assertionMessage: 'Connection selection dialog should be visible',
      });
    });
  }

  /**
   * Connect ServiceNow account
   * @param connectionName - Optional: The name of the connection to select if multiple connections exist
   */
  async connectServiceNowAccount(connectionName?: string): Promise<void> {
    await test.step('Connect ServiceNow account', async () => {
      await this.getConnectButton(ExternalAppProvider.SERVICENOW).click();
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(3000);

      // Check if the multi-connection selection dialog appears
      const isDialogVisible = await this.connectionSelectionDialog.isVisible().catch(() => false);

      if (isDialogVisible && connectionName) {
        await test.step(`Select connection: ${connectionName}`, async () => {
          await this.selectConnectionFromDialog(connectionName);
        });
        await this.page.waitForTimeout(5000);
      }

      // Check if user is already logged in (allowAccessButton is visible)
      const isAllowAccessVisible = await this.allowAccessButton.isVisible().catch(() => false);

      if (isAllowAccessVisible) {
        await test.step('User already logged in - clicking Allow Access', async () => {
          await this.allowAccessButton.click();
          await this.page.waitForLoadState('domcontentloaded');
        });
      } else {
        // Check if ServiceNow login page is visible
        const isLoginVisible = await this.serviceNowUserName.isVisible({ timeout: 5000 }).catch(() => false);

        if (isLoginVisible) {
          await test.step('Logging in to ServiceNow', async () => {
            await this.serviceNowUserName.waitFor({ state: 'visible', timeout: 15_000 });
            await this.serviceNowUserName.fill(SERVICE_NOW_VALUES.USER_NAME);
            await this.serviceNowPassword.waitFor({ state: 'visible', timeout: 15_000 });
            await this.serviceNowPassword.fill(SERVICE_NOW_VALUES.PASSWORD);
            await this.serviceNowLoginButton.waitFor({ state: 'visible', timeout: 15_000 });
            await this.serviceNowLoginButton.click();
            await this.page.waitForLoadState('domcontentloaded');
            await this.allowAccessButton.waitFor({ state: 'visible', timeout: 15_000 });
            await this.allowAccessButton.click();
            await this.page.waitForLoadState('domcontentloaded');
          });
        }
      }
      await expect(this.getDisconnectButton(ExternalAppProvider.SERVICENOW)).toBeVisible({ timeout: 10_000 });
    });
  }
}
