import { CustomAppsListComponent } from '@integrations-components/customAppsListComponent';
import { Locator, Page, test } from '@playwright/test';

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
  MICROSOFT_OUTLOOK = 'Microsoft Outlook Calendar',
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
   * Get connection status text for an integration
   */
  async getConnectionStatus(provider: ExternalAppProvider): Promise<string> {
    return await test.step(`Get connection status for ${provider}`, async () => {
      const integrationItem = this.getIntegrationItem(provider);
      const statusText = integrationItem.locator('p');
      if (await statusText.isVisible()) {
        return (await statusText.textContent()) || '';
      }
      return '';
    });
  }

  /**
   * Disconnect a specific integration
   */
  async disconnectIntegration(provider: ExternalAppProvider): Promise<void> {
    await test.step(`Disconnect ${provider} integration`, async () => {
      const integrationItem = this.getIntegrationItem(provider);
      const disconnectButton = integrationItem.locator('button[aria-label*="Disconnect"]');
      await disconnectButton.click();
      const confirmModal = this.page.locator('div[role="dialog"], .modal, [class*="modal"]');
      if (await confirmModal.isVisible()) {
        const confirmButton = confirmModal.locator(
          'button:has-text("Disconnect"), button:has-text("Confirm"), button[type="submit"]'
        );
        await confirmButton.click();
      }
    });
  }

  /**
   * Connect a specific integration
   */
  async connectIntegration(provider: ExternalAppProvider): Promise<void> {
    await test.step(`Connect ${provider} integration`, async () => {
      const integrationItem = this.getIntegrationItem(provider);
      const connectButton = integrationItem.locator('button[aria-label*="Connect"]');
      await connectButton.click();
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
