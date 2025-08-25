import { test, Locator, Page, expect } from '@playwright/test';
import { BaseComponent } from '@core/components/baseComponent';
import { AIRTABLE_AUTH_DATA } from '../test-data/app-tiles.test-data';
import { ACTION_LABELS, APP_LABELS } from '../constants/common';

export class IntegrationManagementComponent extends BaseComponent {
  // Locators defined as readonly properties
  readonly searchInput: Locator;
  readonly prebuiltAppDialog: Locator;
  readonly prebuiltAppSearchInput: Locator;
  readonly addCustomAppDropdownButton: Locator;
  readonly addPrebuiltAppMenuItem: Locator;
  readonly connectorOptionsButton: Locator;
  readonly connectorOptionsMenu: Locator;
  readonly enableMenuItem: Locator;
  readonly enableConfirmButton: Locator;
  readonly disconnectModal: Locator;
  readonly disconnectConfirmButton: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators in constructor
    this.searchInput = page.locator('input[name="search"]').first();
    this.prebuiltAppDialog = page.getByRole('dialog', { name: APP_LABELS.PREBUILT_APP_LABEL });
    this.prebuiltAppSearchInput = page.getByRole('textbox', { name: 'Search…', exact: true });
    this.addCustomAppDropdownButton = page.locator('button[aria-label="Add custom app dropdown"]');
    this.addPrebuiltAppMenuItem = page.locator('[role="menuitem"]:has-text("Add prebuilt app")');
    this.connectorOptionsButton = page.getByRole('button', { name: 'connector options', exact: true });
    this.connectorOptionsMenu = page.getByRole('menu');
    this.enableMenuItem = page.getByRole('menuitem', { name: APP_LABELS.ENABLE_LABEL, exact: true });
    this.enableConfirmButton = page.getByRole('button', { name: APP_LABELS.ENABLE_LABEL, exact: true });
    this.disconnectModal = page.locator('form:has(p:has-text("Are you sure you want to disconnect"))');
    this.disconnectConfirmButton = page.locator('span:has-text("Disconnect")').locator('..').locator('button');
  }

  /**
   * Navigate to the Manage Integrations Custom page
   */
  async navigateToManageIntegrationsCustom(): Promise<void> {
    await test.step('Navigate to Manage Integrations Custom page', async () => {
      await this.page.goto('/manage/app/integrations/custom', { waitUntil: 'domcontentloaded' });
    });
  }

  /**
   * Search for an app in the integrations search bar
   */
  async searchForApp(appName: string): Promise<void> {
    await test.step(`Search for app: ${appName}`, async () => {
      await this.page.waitForLoadState('domcontentloaded');
      await this.searchInput.waitFor({ state: 'visible', timeout: 20000 });
      await this.typeInElement(this.searchInput, appName, { timeout: 20000 });
      await this.searchInput.press('Enter');
      await this.page.waitForTimeout(1000);
    });
  }

  /**
   * Search for an app in the prebuilt apps dialog
   */
  async searchForPrebuiltApp(appName: string): Promise<void> {
    await test.step(`Search for prebuilt app: ${appName}`, async () => {
      await this.prebuiltAppDialog.waitFor({ state: 'visible', timeout: 20000 });
      const input = this.prebuiltAppDialog.locator(this.prebuiltAppSearchInput);
      await input.fill(appName);
    });
  }

  /**
   * Click on an app connector by name
   */
  async clickAppConnector(appName: string): Promise<void> {
    await test.step(`Click on ${appName} connector`, async () => {
      const appConnector = this.page.locator(`text=${appName}`).first();
      await appConnector.click();
    });
  }

  /**
   * Open connector options menu and select an option
   */
  async selectConnectorOption(option: string): Promise<void> {
    await test.step(`Select connector option: ${option}`, async () => {
      const threeDotsButton = this.page.locator('button[aria-label="connector options"], button[aria-haspopup="menu"]');
      await threeDotsButton.click();
      const optionElement = this.page.locator(`text=${option}`);
      await optionElement.click();
    });
  }

  /**
   * Verify delete custom dialog box is shown
   */
  async verifyDeleteDialogVisible(option: string): Promise<void> {
    await test.step('Verify delete custom dialog box is shown', async () => {
      const deleteDialog = this.page.locator(`[role="dialog"] h2:has-text("${option}")`);
      await expect(deleteDialog).toBeVisible();
    });
  }

  /**
   * Click on delete in the confirmation dialog
   */
  async confirmDelete(option: string): Promise<void> {
    await test.step(`Click on ${option} in the confirmation dialog`, async () => {
      const confirmDeleteButton = this.page.locator(`button:has-text("${option}")`);
      await confirmDeleteButton.click();
    });
  }

  /**
   * Click on "Add custom app" Dropdown
   */
  async clickAddCustomAppDropdown(option: string): Promise<void> {
    await test.step('Click Add custom app dropdown', async () => {
      const addCustomAppDropdown = this.page.locator(`button:has-text("${option}")`);
      await addCustomAppDropdown.click();
    });
  }

  /**
   * Click on "Add prebuilt app" option
   */
  async clickAddPrebuiltApp(option: string): Promise<void> {
    await test.step('Click Add prebuilt app option', async () => {
      await this.addCustomAppDropdownButton.click();
      const addPrebuiltAppOption = this.page.locator(`[role="menuitem"]:has-text("${option}")`);
      let retries = 3;
      while (retries > 0) {
        try {
          await addPrebuiltAppOption.waitFor({ state: 'visible', timeout: 5000 });
          await addPrebuiltAppOption.click();
          break;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          await this.page.waitForTimeout(1000);
          await this.addCustomAppDropdownButton.click();
        }
      }
    });
  }

  /**
   * Click on the "Add" button for an app
   */
  async clickAddPrebuilt(appName: string): Promise<void> {
    await test.step(`Add prebuilt app "${appName}"`, async () => {
      await expect(this.prebuiltAppDialog).toBeVisible();
      const addButton = this.prebuiltAppDialog
        .locator(`div:has(p:text-is("${appName}"))`)
        .locator('button:has-text("Add")')
        .first();
      await expect(addButton).toBeVisible({ timeout: 15000 });
      await expect(addButton).toBeEnabled();
      await addButton.click();
    });
  }

  /**
   * Click on integration button for a specific service
   * @param service - The service name (e.g., "Airtable")
   * @param buttonName - The button text (e.g., "Connect account", "Disconnect account")
   */
  async clickOnIntegrationButton(service: string, buttonName: string): Promise<void> {
    await test.step(`Click ${service} ${buttonName}`, async () => {
      const card = this.page.locator(
        `//h3[text()=${this.xp(service)}]/ancestor::li[contains(@class,'ConnectedServices-module-item')]`
      );
      await expect(card).toBeVisible({ timeout: 15000 });

      const connect = card.locator(`xpath=.//button[@aria-label=${this.xp(`Connect your ${service} account`)}]`);
      const disconnect = card.locator(`xpath=.//button[@aria-label=${this.xp(`Disconnect your ${service} account`)}]`);
      const wantDisconnect = /disconnect/i.test(buttonName);
      const target = wantDisconnect ? disconnect : connect;

      const confirmIfModal = async () => {
        await this.disconnectModal
          .waitFor({ state: 'visible', timeout: 3000 })
          .then(async () => {
            await this.disconnectConfirmButton.click();
            await this.disconnectModal.waitFor({ state: 'detached', timeout: 10000 });
          })
          .catch(() => {});
      };

      if (!wantDisconnect && (await disconnect.isVisible())) {
        await disconnect.click();
        await confirmIfModal();
        await expect(connect)
          .toBeVisible({ timeout: 20000 })
          .catch(() => {});
      }
      if (wantDisconnect && (await connect.isVisible())) return;

      await target.click();
      if (wantDisconnect) {
        await confirmIfModal();
        await expect(connect)
          .toBeVisible({ timeout: 20000 })
          .catch(() => {});
      }
    });
  }

  /**
   * Open connector options menu and select an option
   */
  async openConnectorOptions(service: string): Promise<void> {
    await test.step(`Open ${service} connector options`, async () => {
      const btn = this.connectorOptionsButton.last();
      await btn.click();
      const menu = this.connectorOptionsMenu.last();
      const enableMenuItem = menu.locator(this.enableMenuItem);
      await expect(enableMenuItem).toBeVisible();
      await enableMenuItem.click();
      const confirm = this.enableConfirmButton;
      if (await confirm.isVisible()) await confirm.click();
    });
  }

  /**
   * Scroll the page by specified amount
   */
  async scrollBy(amount: number): Promise<void> {
    await test.step(`Scroll page by ${amount} pixels`, async () => {
      await this.page.evaluate(scrollAmount => window.scrollBy(0, scrollAmount), amount);
    });
  }

  /**
   * Verify integration button state for a specific service
   */
  private xp = (s: string) =>
    s.includes("'") && s.includes('"')
      ? `concat('${s.split("'").join(`',"'",'`)}')`
      : s.includes("'")
        ? `"${s}"`
        : `'${s}'`;

  async verifyIntegrationButton(service: string, buttonName: string): Promise<void> {
    await test.step(`Verify ${service} ${buttonName} button is visible`, async () => {
      const card = this.page.locator(
        `//h3[text()=${this.xp(service)}]/ancestor::li[contains(@class,'ConnectedServices')]`
      );
      await expect(card).toBeVisible({ timeout: 15000 });

      const aria = `${/disconnect/i.test(buttonName) ? APP_LABELS.DISCONNECT_ACCOUNT_LABEL : APP_LABELS.CONNECT_ACCOUNT_LABEL} your ${service} account`;
      const btn = card.locator(`xpath=.//button[@aria-label=${this.xp(aria)}]`);
      await expect(btn).toBeVisible({ timeout: 10000 });
    });
  }

  /**
   * Navigate to external apps page via API for the current user
   */
  async navigateToExternalAppsViaApi(): Promise<void> {
    await test.step('Navigate to external apps via API', async () => {
      throw new Error('Use IntegrationApi.navigateToExternalAppsViaApi() instead');
    });
  }
}
