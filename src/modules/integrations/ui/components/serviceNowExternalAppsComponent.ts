import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export interface ServiceNowExternalConfig {
  instanceUrl?: string;
  username?: string;
  password?: string;
}

export class ServiceNowExternalAppsComponent extends BaseComponent {
  readonly avatar: Locator;
  readonly profileMenu: Locator;
  readonly externalAppsTab: Locator;
  readonly serviceNowConnectButton: Locator;
  readonly serviceNowDisconnectButton: Locator;
  readonly mySettingsOption: Locator;

  constructor(page: Page) {
    super(page);
    this.avatar = page.locator('//div[contains(@class,"avatar")]/button');
    this.profileMenu = page.locator('//div[contains(@class,"profile-menu")]');
    this.externalAppsTab = page.locator('//a[text()="External apps"]');
    this.serviceNowConnectButton = page.locator(
      '//*[contains(text(),"ServiceNow")]//parent::div//following-sibling::div//button[text()="Connect account"]'
    );
    this.serviceNowDisconnectButton = page.locator(
      '//*[contains(text(),"ServiceNow")]//parent::div//following-sibling::div//button[text()="Disconnect account"]'
    );
    this.mySettingsOption = page.locator('//div[text()="My settings"]');
  }

  async clickOnAvatar(): Promise<void> {
    await test.step('Click on user avatar', async () => {
      await this.avatar.waitFor({ state: 'visible' });
      await this.avatar.click();
    });
  }

  async selectFromProfileMenu(menuOption: string): Promise<void> {
    await test.step(`Select "${menuOption}" from profile menu`, async () => {
      const menuItem = this.page.locator(`//*[text()="${menuOption}"]`);
      await menuItem.waitFor({ state: 'visible' });
      await menuItem.click();
    });
  }

  async clickOnExternalAppsTab(): Promise<void> {
    await test.step('Click on External apps tab', async () => {
      await this.externalAppsTab.waitFor({ state: 'visible' });
      await this.externalAppsTab.click();
    });
  }

  async clickServiceNowConnectButton(): Promise<void> {
    await test.step('Click ServiceNow Connect account button', async () => {
      await this.serviceNowConnectButton.waitFor({ state: 'visible' });
      await this.serviceNowConnectButton.click();
    });
  }

  async disconnectServiceNow(): Promise<void> {
    await test.step('Disconnect ServiceNow account', async () => {
      await this.serviceNowDisconnectButton.waitFor({ state: 'visible' });
      await this.serviceNowDisconnectButton.click();
    });
  }

  async verifyServiceNowConnectButton(): Promise<boolean> {
    return await test.step('Verify ServiceNow Connect account button is visible', async () => {
      await this.serviceNowConnectButton.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      return await this.serviceNowConnectButton.isVisible();
    });
  }

  async verifyServiceNowDisconnectButton(): Promise<boolean> {
    return await test.step('Verify ServiceNow Disconnect account button is visible', async () => {
      await this.serviceNowDisconnectButton.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      return await this.serviceNowDisconnectButton.isVisible();
    });
  }

  async verifyConnectionStatus(expectedStatus: 'connected' | 'disconnected'): Promise<void> {
    await test.step(`Verify ServiceNow connection status is ${expectedStatus}`, async () => {
      if (expectedStatus === 'connected') {
        const isDisconnectVisible = await this.verifyServiceNowDisconnectButton();
        expect(isDisconnectVisible).toBeTruthy();
      } else {
        const isConnectVisible = await this.verifyServiceNowConnectButton();
        expect(isConnectVisible).toBeTruthy();
      }
    });
  }

  async connectServiceNowAccount(config: ServiceNowExternalConfig): Promise<void> {
    await test.step('Connect ServiceNow account with configuration', async () => {
      await this.clickServiceNowConnectButton();

      if (config.instanceUrl) {
        const instanceUrlField = this.page.locator('input[placeholder*="instance"]');
        await instanceUrlField.fill(config.instanceUrl);
      }

      if (config.username) {
        const usernameField = this.page.locator('input[type="text"]').first();
        await usernameField.fill(config.username);
      }

      if (config.password) {
        const passwordField = this.page.locator('input[type="password"]');
        await passwordField.fill(config.password);
      }

      const saveButton = this.page.locator('button:has-text("Save")');
      await saveButton.click();
    });
  }

  async navigateToMySettings(): Promise<void> {
    await test.step('Navigate to My Settings', async () => {
      await this.clickOnAvatar();
      await this.selectFromProfileMenu('My settings');
    });
  }
}
