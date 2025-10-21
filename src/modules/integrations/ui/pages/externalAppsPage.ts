import { CustomAppsListComponent } from '@integrations-components/customAppsListComponent';
import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';

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

export class ExternalAppsPage extends BasePage {
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
  readonly customAppsListComponent: CustomAppsListComponent;

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
    this.customAppsListComponent = new CustomAppsListComponent(page);
  }

  /**
   * Get external integration item locator by provider
   */
  getExternalIntegrationItem(provider: ExternalAppProvider): Locator {
    return this.page.locator(`xpath=//*[text()="${provider}"]`);
  }

  /**
   * Navigate to external apps page for a specific user
   */
  async navigateToExternalAppsPage(userId?: string): Promise<void> {
    await test.step('Navigate to external apps page', async () => {
      if (!userId) {
        userId = await this.page.evaluate(() => {
          return (window as any).Simpplr?.CurrentUser?.uid;
        });
        if (!userId) {
          throw new Error('Could not get current user ID from Simpplr.CurrentUser.uid');
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
    return this.customAppsListComponent.verifyToastMessageIsVisibleWithText(message);
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
      const statusIndicator = integrationItem.locator('ConnectedServices-module');
      return await statusIndicator.isVisible();
    });
  }
}
