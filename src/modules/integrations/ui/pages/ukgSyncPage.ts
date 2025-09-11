import { Page } from '@playwright/test';

import { UkgSyncComponents } from '../components/ukgSyncComponent';

import { BasePage } from '@/src/core/pages/basePage';

export class UkgSyncPage extends BasePage {
  async verifyThePageIsLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  readonly ukgSyncComponents: UkgSyncComponents;
  constructor(page: Page) {
    super(page);
    this.ukgSyncComponents = new UkgSyncComponents(page);
  }

  async verifyCheckBox(name: string, status: string): Promise<void> {
    await this.ukgSyncComponents.verifyCheckBox(name, status);
  }

  async clearInputField(name: string, field: string): Promise<void> {
    await this.ukgSyncComponents.clearInputField(name, status);
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

  async verifyVisibility(name: string, status: string): Promise<void> {
    await this.ukgSyncComponents.verifyVisibility(name);
  }

  async addConnectionDetails(username: string, password: string, url: string, key: string): Promise<void> {
    await this.ukgSyncComponents.addConnectionDetails(username, password, url, key);
  }
}
