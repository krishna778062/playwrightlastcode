import { Locator, Page, test } from '@playwright/test';

import { UkgSyncComponents } from '../components/ukgSyncComponent';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

export class UkgSyncPage extends BasePage {
  readonly ukgSyncComponents: UkgSyncComponents;
  readonly scheduledSources: Locator;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.PEOPLE_DATA_PAGE);
    this.scheduledSources = page.getByRole('heading', { name: 'Scheduled sources' });
    this.ukgSyncComponents = new UkgSyncComponents(page);
  }

  /**
   * Navigate to user syncing and provisioning page for a specific user
   */
  async navigateToUserSyncingProvisioningPage(): Promise<void> {
    await test.step('Navigate to external apps page', async () => {
      const url = PAGE_ENDPOINTS.USER_SYNCING;
      await this.page.goto(url, { timeout: 30_000 });
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.scheduledSources, {
        timeout: 30_000,
        assertionMessage: 'Verifying the page is loaded',
      });
    });
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

  async selectDropdown(): Promise<void> {
    await this.ukgSyncComponents.selectDropdown();
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

  async selectDetailsSyncCheckBox(source: string, sync: string, name: string): Promise<void> {
    await this.ukgSyncComponents.selectDetailsSyncCheckBox(source, sync, name);
  }

  async uncheckScheduledSourcesCheckBox(name: string): Promise<void> {
    await this.ukgSyncComponents.uncheckScheduledSourcesCheckBox(name);
  }

  // Method to check sync checkbox
  async checkSyncCheckBox(name: string): Promise<void> {
    await this.ukgSyncComponents.checkSyncCheckBox(name);
  }
}
