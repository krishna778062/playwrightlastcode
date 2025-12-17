import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class CustomApiActionsComponent extends BaseComponent {
  readonly searchInput: Locator;
  readonly apiActionNameLocator: Locator;
  readonly clearSearchButton: Locator;
  readonly showMoreButton: Locator;
  readonly apiActionNameLocators: Locator;
  readonly appsFilterButton: Locator;
  readonly customAppsHeading: Locator;
  readonly appsFilterSearchInput: Locator;
  readonly appsFilterSearchInPanel: Locator;
  readonly firstAppCheckboxInPanel: Locator;
  readonly clearInAppsFilterButton: Locator;

  constructor(page: Page) {
    super(page);
    // Search and List locators
    this.searchInput = page.locator('input[name="search"]').first();
    this.apiActionNameLocator = page.locator('div[class*="ApiAction_name"]').first();
    this.apiActionNameLocators = page.locator('div[class*="ApiAction_name"]');
    this.clearSearchButton = page.getByRole('button', { name: 'Clear' });
    this.showMoreButton = page.getByRole('button', { name: /show more/i });
    this.appsFilterButton = page.getByRole('button', { name: /^Apps(\s\d+)?$/ });
    this.customAppsHeading = page.getByRole('heading', { name: 'Custom apps' });
    this.appsFilterSearchInput = page.getByRole('textbox', { name: 'Search…' }).first();
    this.appsFilterSearchInPanel = this.customAppsHeading.locator('xpath=following::input[@aria-label="Search…"][1]');
    this.firstAppCheckboxInPanel = this.customAppsHeading.locator('xpath=following::input[@type="checkbox"][1]');
    this.clearInAppsFilterButton = this.customAppsHeading.locator(
      'xpath=following::button[normalize-space()="Clear"][1]'
    );
  }

  /**
   * Get the API action row container for a given name locator
   */
  getApiActionRowFor(nameLocator: Locator): Locator {
    return nameLocator
      .locator(
        'xpath=ancestor::div[contains(@class,"ConnectorListItem") or contains(@class,"ApiAction") or contains(@class,"ListItem")][1]'
      )
      .first()
      .or(
        nameLocator
          .locator('xpath=ancestor::a[contains(@class,"ConnectorListItem") or contains(@class,"ApiAction")][1]')
          .first()
      )
      .or(nameLocator.locator('xpath=ancestor::li[1]').first())
      .or(nameLocator.locator('xpath=ancestor::div[1]').first());
  }

  /**
   * Get the custom app/provider label that appears immediately below the API action name.
   */
  getAppLabelBelow(nameLocator: Locator): Locator {
    return nameLocator.locator('xpath=following-sibling::*[1]').first();
  }

  /**
   * Get checkbox for an app option by its accessible name
   */
  getAppCheckboxByName(appName: string): Locator {
    return this.page.getByRole('checkbox', { name: appName }).or(this.page.getByLabel(appName, { exact: false }));
  }

  /**
   * Get text locator
   */
  getText(text: string): Locator {
    return this.page.getByText(text);
  }

  async searchForApp(searchTerm: string): Promise<void> {
    await test.step(`Search for api action: ${searchTerm}`, async () => {
      await this.typeInElement(this.searchInput, searchTerm, { timeout: 20000 });
      await this.searchInput.press('Enter');
    });
  }

  /**
   * Verify that an app with the given name is displayed in the list
   */
  async verifyApiActionIsDisplayedInList(apiActionName: string): Promise<void> {
    await test.step(`Verify api action "${apiActionName}" is displayed in list`, async () => {
      await expect(
        this.getText(apiActionName).first(),
        `Expected api action "${apiActionName}" to be visible in the list`
      ).toBeVisible();
    });
  }

  /**
   * Clear the search input field by clicking the clear button
   */
  async clearSearch(): Promise<void> {
    await test.step('Clear search field', async () => {
      await this.clearSearchButton.waitFor({ state: 'visible' });
      await this.clickOnElement(this.clearSearchButton, { timeout: 10000 });
      await this.searchInput.waitFor({ state: 'visible' });
    });
  }

  /**
   * Verify Show more behavior for API actions list (one-call helper)
   */
  async verifyShowMoreBehavior(): Promise<void> {
    await test.step('Verify Show more behavior for API actions list', async () => {
      const initialCount = await this.apiActionNameLocators.count();
      if (initialCount <= 10) {
        await expect(this.showMoreButton, 'Show more should not be visible when <= 10 items').toBeHidden();
        return;
      }
      await expect(this.showMoreButton, 'Show more should be visible when > 10 items').toBeVisible();
      await this.clickOnElement(this.showMoreButton, { timeout: 15000 });
      await this.verifier.verifyCountOfElementsIsGreaterThan(this.apiActionNameLocators, 10, {
        assertionMessage: 'After clicking Show more, more than 10 API actions should be visible',
      });
    });
  }

  /**
   * Click "Apps" dropdown filter and verify "Custom apps" heading is visible inside filter
   */
  async clickAndVerifyAppsFilter(): Promise<void> {
    await test.step('Click Apps filter and verify "Custom apps" heading', async () => {
      await this.appsFilterButton.click();
      await expect(this.customAppsHeading, 'Expected "Custom apps" heading').toBeVisible();
    });
  }

  /**
   * Verify Apps filter search and clear behaviour
   */
  async verifyAppsFilterSearchSelectClear(appName: string): Promise<void> {
    await test.step(`Verify Apps filter search and clear for: ${appName}`, async () => {
      // Open Apps filter and search
      await this.appsFilterButton.click();
      // Scope search to the Apps filter panel via the heading
      await this.appsFilterSearchInPanel.fill(appName);
      await this.page.waitForTimeout(500);
      // Select the first visible app checkbox inside the filter
      await this.firstAppCheckboxInPanel.waitFor({ state: 'visible' });
      await this.firstAppCheckboxInPanel.check().catch(async () => {
        await this.firstAppCheckboxInPanel.click();
      });

      // Close filter and verify first API action corresponds to the app
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(400);
      await expect(
        this.page.getByText(appName).first(),
        `Expected "${appName}" to be visible on the page`
      ).toBeVisible();

      // Reopen filter, click Clear, and verify deselected
      await this.appsFilterButton.click();
      await this.clearInAppsFilterButton.click();
      const checkboxRole = this.getAppCheckboxByName(appName);
      if ((await checkboxRole.count()) > 0) {
        await expect(checkboxRole.first(), `"${appName}" should be deselected`).not.toBeChecked();
      }
      await this.page.keyboard.press('Escape');
    });
  }

  /**
   * Select and then deselect an app in Apps filter and verify filtering behaviour
   */
  async selectDeselectBehaviour(appName: string): Promise<void> {
    await test.step(`Verify select/deselect behaviour for app: ${appName}`, async () => {
      // Try to locate the checkbox/label for the app
      const appCheckbox = this.getAppCheckboxByName(appName);

      // Click the checkbox/label to select
      await appCheckbox.first().click();
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);

      // For each visible API action entry, verify the provider/app label (appName) appears in the same row
      const count = await this.apiActionNameLocators.count();
      const maxToCheck = Math.min(count, 10); // cap for speed
      for (let i = 0; i < maxToCheck; i++) {
        const nameLocator = this.apiActionNameLocators.nth(i);
        const appLabel = this.getAppLabelBelow(nameLocator);
        await expect(appLabel, `Expected API action row ${i + 1} to show "${appName}" below name`).toContainText(
          appName
        );
      }

      // Now deselect the app
      await this.appsFilterButton.click();
      await appCheckbox.first().click();
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
    });
  }
}
