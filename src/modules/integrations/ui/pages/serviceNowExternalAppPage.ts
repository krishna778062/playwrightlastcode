import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { ServiceNowExternalAppsComponent } from '@/src/modules/integrations/ui/components/serviceNowExternalAppsComponent';

/**
 * ServiceNowExternalAppsPage handles user-level ServiceNow external app connections
 * This page is accessed via Profile Menu -> My Settings -> External Apps
 */
export class ServiceNowExternalAppsPage extends BasePage {
  readonly serviceNowExternalAppsComponent: ServiceNowExternalAppsComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.serviceNowExternalAppsComponent = new ServiceNowExternalAppsComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify support and ticketing integrations page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.serviceNowExternalAppsComponent.avatar, {
        timeout: 30_000,
        assertionMessage: 'Verifying support and ticketing integrations page is loaded',
      });
    });
  }

  // Profile Navigation Methods
  async clickOnAvatar(): Promise<void> {
    return this.serviceNowExternalAppsComponent.clickOnAvatar();
  }

  async selectFromProfileMenu(menuOption: string): Promise<void> {
    return this.serviceNowExternalAppsComponent.selectFromProfileMenu(menuOption);
  }

  async clickOnExternalAppsTab(): Promise<void> {
    return this.serviceNowExternalAppsComponent.clickOnExternalAppsTab();
  }

  // ServiceNow Connection Methods
  async clickServiceNowConnectButton(): Promise<void> {
    return this.serviceNowExternalAppsComponent.clickServiceNowConnectButton();
  }

  async disconnectServiceNow(): Promise<void> {
    return this.serviceNowExternalAppsComponent.disconnectServiceNow();
  }

  // Connection Status Verification Methods
  async verifyServiceNowConnectButton(): Promise<boolean> {
    return this.serviceNowExternalAppsComponent.verifyServiceNowConnectButton();
  }

  async verifyServiceNowDisconnectButton(): Promise<boolean> {
    return this.serviceNowExternalAppsComponent.verifyServiceNowDisconnectButton();
  }

  async verifyConnectionStatus(expectedStatus: 'connected' | 'disconnected'): Promise<void> {
    return this.serviceNowExternalAppsComponent.verifyConnectionStatus(expectedStatus);
  }
}
