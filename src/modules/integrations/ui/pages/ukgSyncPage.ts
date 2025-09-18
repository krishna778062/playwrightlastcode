import { Page, test } from '@playwright/test';

import { UkgSyncComponents } from '../components/ukgSyncComponent';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';

export class UkgSyncPage extends BasePage {
  /**
   * Navigate to people data page for a specific user
   */
  async navigateToPeopleDataPage(): Promise<void> {
    await test.step('Navigate to external apps page', async () => {
      const url = PAGE_ENDPOINTS.PEOPLE_DATA_PAGE;
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    });
  }

  /**
   * Navigate to user syncing and provisioning page for a specific user
   */
  async navigateToUserSyncingProvisioningPage(): Promise<void> {
    await test.step('Navigate to external apps page', async () => {
      const url = PAGE_ENDPOINTS.USER_SYNCING;
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  readonly ukgSyncComponents: UkgSyncComponents;
  constructor(page: Page) {
    super(page);
    this.ukgSyncComponents = new UkgSyncComponents(page);
  }

  async verifyScheduledSourcesCheckBox(name: string): Promise<void> {
    await this.ukgSyncComponents.verifyScheduledSourcesCheckBox(name);
  }

  async clearInputField(source: string, username: string, password: string, url: string, key: string): Promise<void> {
    await this.ukgSyncComponents.clearInputField(source, username, password, url, key);
  }

  async clickOnButton(name: string): Promise<void> {
    await this.ukgSyncComponents.clickOnButton(name);
  }

  async verifyErrorMessage(message: string): Promise<void> {
    await this.ukgSyncComponents.verifyErrorMessage(message);
  }

  async addInputField(source: string, field: string, value: string): Promise<void> {
    await this.ukgSyncComponents.addInputField(source, field, value);
  }

  async selectDropdown(option: string): Promise<void> {
    await this.ukgSyncComponents.selectDropdown(option);
  }

  async verifyVisibility(name: string): Promise<void> {
    await this.ukgSyncComponents.verifyVisibility(name);
  }

  async addUkgConnectionDetails(
    source: string,
    username: string,
    password: string,
    url: string,
    key: string
  ): Promise<void> {
    await this.ukgSyncComponents.addUkgConnectionDetails(source, username, password, url, key);
  }

  async selectSyncOptions(name: string): Promise<void> {
    await this.ukgSyncComponents.selectSyncOptions(name);
  }

  async verifyDetailsCheckBoxVisibility(name: string): Promise<void> {
    await this.ukgSyncComponents.verifyDetailsCheckBoxVisibility(name);
  }

  async selectDetailsSyncCheckBox(source: string, name: string): Promise<void> {
    await this.ukgSyncComponents.selectDetailsSyncCheckBox(source, name);
  }

  async uncheckScheduledSourcesCheckBox(name: string): Promise<void> {
    await this.ukgSyncComponents.uncheckScheduledSourcesCheckBox(name);
  }
}
