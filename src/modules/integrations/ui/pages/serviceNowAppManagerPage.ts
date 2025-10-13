import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import {
  ServiceNowExternalAppsComponent,
  ServiceNowExternalConfig,
} from '@/src/modules/integrations/ui/components/serviceNowExternalAppsComponent';

export class ServiceNowPage extends BasePage {
  readonly serviceNowExternalAppsComponent: ServiceNowExternalAppsComponent;
  readonly serviceNowButton: Locator;
  readonly serviceNowConsumerKey: Locator;
  readonly serviceNowSecretKey: Locator;
  readonly serviceNowUrl: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.SUPPORT_TICKETING_PAGE);
    this.serviceNowButton = page.locator('[id="servicenow"]');
    this.serviceNowConsumerKey = page.locator('[data-testid="field-ServiceNow consumer key"]');
    this.serviceNowSecretKey = page.locator('[data-testid="field-ServiceNow secret key"]');
    this.serviceNowUrl = page.locator('[data-testid="field-ServiceNow URL"]');
    this.serviceNowExternalAppsComponent = new ServiceNowExternalAppsComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify support and ticketing integrations page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.serviceNowButton, {
        timeout: 30_000,
        assertionMessage: 'Verifying Home page is loaded',
      });
    });
  }

  async verifyServiceNowFieldsVisible(): Promise<void> {
    await test.step('Verify ServiceNow configuration fields are visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.serviceNowConsumerKey, {
        timeout: 15_000,
        assertionMessage: 'Verifying ServiceNow consumer key field is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.serviceNowSecretKey, {
        timeout: 15_000,
        assertionMessage: 'Verifying ServiceNow secret key field is visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.serviceNowUrl, {
        timeout: 15_000,
        assertionMessage: 'Verifying ServiceNow URL field is visible',
      });
    });
  }

  // External Apps - User Level Connection Methods
  async navigateToMySettings(): Promise<void> {
    return this.serviceNowExternalAppsComponent.navigateToMySettings();
  }

  async clickOnAvatar(): Promise<void> {
    return this.serviceNowExternalAppsComponent.clickOnAvatar();
  }

  async selectFromProfileMenu(menuOption: string): Promise<void> {
    return this.serviceNowExternalAppsComponent.selectFromProfileMenu(menuOption);
  }

  async clickOnExternalAppsTab(): Promise<void> {
    return this.serviceNowExternalAppsComponent.clickOnExternalAppsTab();
  }

  async clickServiceNowConnectButton(): Promise<void> {
    return this.serviceNowExternalAppsComponent.clickServiceNowConnectButton();
  }

  async verifyServiceNowDisconnectButton(): Promise<boolean> {
    return this.serviceNowExternalAppsComponent.verifyServiceNowDisconnectButton();
  }

  async verifyServiceNowConnectButton(): Promise<boolean> {
    return this.serviceNowExternalAppsComponent.verifyServiceNowConnectButton();
  }

  async disconnectServiceNow(): Promise<void> {
    return this.serviceNowExternalAppsComponent.disconnectServiceNow();
  }

  async connectServiceNowAccount(config: ServiceNowExternalConfig): Promise<void> {
    return this.serviceNowExternalAppsComponent.connectServiceNowAccount(config);
  }

  async verifyConnectionStatus(expectedStatus: 'connected' | 'disconnected'): Promise<void> {
    return this.serviceNowExternalAppsComponent.verifyConnectionStatus(expectedStatus);
  }
}
