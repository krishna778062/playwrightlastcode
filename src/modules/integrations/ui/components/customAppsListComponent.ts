import { APP_LABELS } from '@integrations/constants/common';
import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export enum AppConnectorOptions {
  Edit = 'Edit',
  Disable = 'Disable',
  Delete = 'Delete',
  Enable = 'Enable',
}

export class CustomAppsListComponent extends BaseComponent {
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
  readonly resultListItems: Locator;

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
    this.resultListItems = page.locator('div[class*="ConnectorListItem_itemContainer"]');
  }

  /**
   * Navigate to the Manage Integrations Custom page
   */
  async navigateToManageIntegrationsCustomPage(): Promise<void> {
    await test.step('Navigate to Manage Integrations Custom page', async () => {
      await this.page.goto('/manage/app/integrations/custom', { waitUntil: 'domcontentloaded' });
    });
  }

  /**
   * Search for an app in the integrations search bar
   */
  async searchForApp(appName: string): Promise<void> {
    await test.step(`Search for app: ${appName}`, async () => {
      await this.typeInElement(this.searchInput, appName, { timeout: 20000 });
      await this.searchInput.press('Enter');
    });
  }

  /**
   * Verify count of apps in list is
   * @param count - The count of apps in the list
   */
  async verifyCountOfAppsInListIs(count: number): Promise<void> {
    await test.step('Verify count of apps in list is', async () => {
      await expect(this.resultListItems, `expecting app list to have ${count} items`).toHaveCount(count);
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
      await this.page.waitForTimeout(2000);
    });
  }

  /**
   * Click on an app connector by name
   */
  async clickOnAppConnector(appName: string): Promise<void> {
    await test.step(`Click on ${appName} connector`, async () => {
      const appConnector = this.page.locator(`text=${appName}`).first();
      await appConnector.click();
    });
  }

  /**
   * Generic method to click any button by text
   */
  async clickButton(buttonText: string, stepName?: string): Promise<void> {
    const step = stepName || `Click ${buttonText} button`;
    await test.step(step, async () => {
      const button = this.page.getByRole('button', { name: buttonText });
      await this.clickOnElement(button, { timeout: 30_000 });
    });
  }

  /**
   * Generic method to click any menu item by text
   */
  async clickMenuItem(itemText: string, stepName?: string): Promise<void> {
    const step = stepName || `Click ${itemText} menu item`;
    await test.step(step, async () => {
      const menuItem = this.page.getByRole('menuitem', { name: itemText });
      await this.clickOnElement(menuItem, { timeout: 30_000 });
    });
  }

  /**
   * Generic method to interact with dialogs - click button in dialog
   */
  async clickDialogButton(buttonText: string, stepName?: string): Promise<void> {
    const step = stepName || `Click ${buttonText} in dialog`;
    await test.step(step, async () => {
      const button = this.page.getByRole('dialog').getByRole('button', { name: buttonText });
      await this.clickOnElement(button, { timeout: 30_000 });
    });
  }

  private getMenuItemByText(text: string): Locator {
    return this.page.getByRole('menuitem', { name: text });
  }

  private getButtonByText(text: string): Locator {
    return this.page.getByRole('button', { name: text });
  }

  /**
   * Open connector options menu and select an option
   */
  async selectConnectorOption(option: AppConnectorOptions): Promise<void> {
    await test.step(`Select connector option: ${option}`, async () => {
      await this.clickOnElement(this.getConnectorOptionsButton(), { timeout: 30_000 });
      await this.clickMenuItem(option);
    });
  }

  /**
   * Delete app using three dots menu
   */
  async deleteAppWithThreeDotsMenu(): Promise<void> {
    await test.step('Delete app using three dots menu', async () => {
      await this.selectConnectorOption(AppConnectorOptions.Delete);
      await this.verifyDeleteDialogVisible(APP_LABELS.DELETE_CUSTOM_APP_LABEL);
      await this.clickDialogButton(APP_LABELS.DELETE_LABEL, 'Confirm delete');
    });
  }

  /**
   * Get connector options button - reusable method
   */
  private getConnectorOptionsButton(): Locator {
    return this.page.locator('button[aria-label="connector options"], button[aria-haspopup="menu"]');
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
   * Generic method to open dropdown and select option
   */
  async openDropdownAndSelect(triggerText: string, optionText: string, stepName?: string): Promise<void> {
    const step = stepName || `${triggerText} → ${optionText}`;
    await test.step(step, async () => {
      const trigger = this.page.getByRole('button', { name: triggerText, exact: true });
      await this.clickOnElement(trigger, { timeout: 30_000 });
      await this.page.waitForTimeout(2000);
      const menu = await this.getMenuForTrigger(trigger);
      if (!(await menu.isVisible())) {
        await trigger.press('ArrowDown');
        await expect(menu).toBeVisible();
      }
      await this.clickMenuItem(optionText);
    });
  }

  /**
   * Open "Add custom app" dropdown and choose an option
   */
  async clickAddCustomAppOption(option: string): Promise<void> {
    await this.openDropdownAndSelect(APP_LABELS.ADD_CUSTOM_APP_LABEL, option, `Add custom app → ${option}`);
  }

  /**
   * Get menu for any trigger - reusable method
   */
  private async getMenuForTrigger(trigger: Locator): Promise<Locator> {
    const triggerId = await trigger.getAttribute('id');
    return this.page.locator(`[role="menu"][aria-labelledby="${triggerId}"]`);
  }

  /**
   * Click on the "Add" button for an app
   */
  async clickAddPrebuilt(appName: string): Promise<void> {
    await test.step(`Add prebuilt app "${appName}"`, async () => {
      await expect(this.prebuiltAppDialog).toBeVisible();
      const addButton = this.getAddButtonForApp(appName);
      await expect(addButton).toBeVisible({ timeout: 15000 });
      await expect(addButton).toBeEnabled();
      await this.clickOnElement(addButton, { timeout: 30_000 });
    });
  }

  /**
   * Get add button for specific app - reusable method
   */
  private getAddButtonForApp(appName: string): Locator {
    return this.prebuiltAppDialog.locator(`div:has(p:text-is("${appName}"))`).getByRole('button', { name: 'Add' });
  }

  /**
   * Open connector options menu and select an option
   */
  async openConnectorOptions(service: string): Promise<void> {
    await test.step(`Open ${service} connector options`, async () => {
      const btn = this.connectorOptionsButton.last();
      await btn.click();
      await this.clickMenuItem(APP_LABELS.ENABLE_LABEL, 'Enable connector');
      const confirm = this.enableConfirmButton;
      if (await confirm.isVisible()) await this.clickButton(APP_LABELS.ENABLE_LABEL, 'Confirm enable');
    });
  }
}
