import { Page, test, expect } from '@playwright/test';
import { BaseAppTileComponent } from '@integrations/components/baseAppTileComponent';
import { HomeDashboard } from './homeDashboard';

export class AirtableAppTilesPage {
  readonly page: Page;
  readonly homeDashboard: HomeDashboard;
  readonly airtableComponent: BaseAppTileComponent;

  constructor(page: Page) {
    this.page = page;
    this.homeDashboard = new HomeDashboard(page);
    this.airtableComponent = new BaseAppTileComponent(page);
  }

  /**
   * Verify that the Airtable tiles page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Login to Airtable
   * @param email - The email to login with
   * @param password - The password to login with
   * @returns void
   */
  async loginToAirtable(email: string, password: string): Promise<void> {
    const emailInput = this.page.locator('//*[@id="emailLogin"]');
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.pressSequentially(email, { delay: 50 });
    await this.page.waitForTimeout(200);
    await this.page.locator('//button[.//span[text()="Continue"]]').click();
    const pwdInput = this.page.locator('//*[@id="passwordLogin"]');
    await pwdInput.waitFor({ state: 'visible' });
    await pwdInput.pressSequentially(password, { delay: 50 });
    await this.page.waitForTimeout(300);
    await this.page.locator('//button[@type="submit" and .//span[text()="Sign in"]]').click();
  }
}
