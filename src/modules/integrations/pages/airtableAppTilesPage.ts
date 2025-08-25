import { Page, test, expect } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { AirtableAppTilesComponent, AirtableConfig } from '../components/airtableAppTilesComponent';
import { BaseAppTileComponent } from '../components/baseAppTileComponent';
import { AppTilesBasePage } from './appTilesBasePage';
import { verifyAscendingOrderThroughAPI } from '../api/helpers/airtableTileApi';
import { AIRTABLE_AUTH_DATA } from '../test-data/app-tiles.test-data';

/**
 * Airtable App Tiles Page following content/chat module patterns
 * Composition over inheritance approach
 */
export class AirtableAppTilesPage extends AppTilesBasePage {
  readonly airtableComponent: AirtableAppTilesComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.airtableComponent = new AirtableAppTilesComponent(page);
  }

  /**
   * Get the app tile component (required by base class)
   */
  getAppTileComponent(): BaseAppTileComponent {
    return this.airtableComponent;
  }

  /**
   * Verify that the Airtable tiles page is loaded (required by BasePage)
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.page.locator('main'), {
      assertionMessage: 'Home page main content should be visible',
      timeout: 30000,
    });
  }

  // Airtable-specific methods
  async addAirtableTile(tileTitle: string, config: AirtableConfig, destination: string = 'Add to home'): Promise<void> {
    return this.airtableComponent.addAirtableTile(tileTitle, config, destination);
  }

  async personalizeTileSorting(tileName: string, sortBy: string, sortOrder: string): Promise<void> {
    return this.airtableComponent.personalizeTileSorting(tileName, sortBy, sortOrder);
  }

  async verifyTileAscending(tileTitle: string): Promise<void> {
    await this.airtableComponent.verifyTilesAscending(tileTitle);
  }

  async verifyAscendingOrderThroughAPI(): Promise<void> {
    return verifyAscendingOrderThroughAPI(this.page);
  }

  /**
   * Configure Airtable authentication details
   */
  async configureAirtableAuth(): Promise<void> {
    await test.step('Configure Airtable authentication details', async () => {
      const clientIdInput = this.page.locator('#authDetails_clientId');
      await clientIdInput.fill(AIRTABLE_AUTH_DATA.CLIENT_ID);

      const clientSecretInput = this.page.locator('#authDetails_clientSecret');
      await clientSecretInput.fill(AIRTABLE_AUTH_DATA.CLIENT_SECRET);

      const authUrlInput = this.page.locator('#authDetails_authUrl');
      await authUrlInput.clear();
      await authUrlInput.fill(AIRTABLE_AUTH_DATA.AUTH_URL);

      const tokenUrlInput = this.page.locator('#authDetails_tokenUrl');
      await tokenUrlInput.clear();
      await tokenUrlInput.fill(AIRTABLE_AUTH_DATA.TOKEN_URL);

      const tokenRequestHeadersInput = this.page.locator('#authDetails_tokenRequestHeaders');
      await tokenRequestHeadersInput.clear();
      await tokenRequestHeadersInput.fill(AIRTABLE_AUTH_DATA.TOKEN_HEADERS);

      const baseUrlInput = this.page.locator('#authDetails_baseUrl');
      await baseUrlInput.clear();
      await baseUrlInput.fill(AIRTABLE_AUTH_DATA.BASE_URL);

      // Click the "Save" button to submit the authentication details
      const saveButton = this.page.locator('button:has-text("Save")');
      await expect(saveButton).toBeVisible({ timeout: 10000 });
      await saveButton.click();
    });
  }

  /**
   * Logs in to Airtable with the provided email and password
   * @param email - The user's email address for Airtable
   * @param password - The user's password for Airtable
   */
  async loginToAirtable(email: string, password: string): Promise<void> {
    await test.step(`Login to Airtable with: ${email}`, async () => {
      const emailInput = this.page.locator('//*[@id="emailLogin"]');
      const continueBtn = this.page.locator('//button[.//span[text()="Continue"]]');
      await emailInput.waitFor({ state: 'visible' });
      await emailInput.fill('');
      await emailInput.pressSequentially(email, { delay: 50 });
      await this.page.keyboard.press('Tab');
      await expect(emailInput).toHaveValue(email);
      await expect(continueBtn).toBeEnabled({ timeout: 5000 });
      await continueBtn.click();
      const pwd = this.page.locator('//*[@id="passwordLogin"]');
      const signInBtn = this.page.locator('//button[@type="submit" and .//span[text()="Sign in"]]');
      await pwd.waitFor({ state: 'visible' });
      await pwd.fill('');
      await pwd.pressSequentially(password, { delay: 50 });
      await this.page.keyboard.press('Tab');
      await expect(pwd).toHaveValue(password);
      await expect(signInBtn).toBeEnabled({ timeout: 5000 });
      await signInBtn.click();
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      // Add base
      const addBase = this.page.locator('//span[text()="Add a base"]');
      await expect(addBase).toBeVisible({ timeout: 5000 });
      await addBase.click();
      // Select "Content Calendar"
      const contentCalendar = this.page.locator('//div[@title="Content Calendar"]');
      await contentCalendar.waitFor({ state: 'visible' });
      await contentCalendar.click();
      //  Grant access
      const grantAccessBtn = this.page.locator('//button[.//span[text()="Grant access"]]');
      await expect(grantAccessBtn).toBeEnabled({ timeout: 5000 });
      await grantAccessBtn.click();
      // Final wait to ensure redirect
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    });
  }
}
