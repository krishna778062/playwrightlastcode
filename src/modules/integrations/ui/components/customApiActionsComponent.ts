import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class CustomApiActionsComponent extends BaseComponent {
  readonly resultListApiActionsItemCountLocator: Locator;
  readonly searchInput: Locator;
  readonly apiActionNameLocator: Locator;
  readonly apiActionNameLocators: Locator;
  readonly clearSearchButton: Locator;
  readonly showMoreButton: Locator;
  readonly appsFilterButton: Locator;
  readonly customAppsHeading: Locator;
  readonly appsFilterSearchInput: Locator;
  readonly appsFilterSearchInPanel: Locator;
  readonly firstAppCheckboxInPanel: Locator;
  readonly clearInAppsFilterButton: Locator;
  readonly statusFilterButton: Locator;
  readonly statusDraftOption: Locator;
  readonly statusPublishedOption: Locator;
  readonly showNextItemsButton: Locator;

  constructor(page: Page) {
    super(page);
    // Search and List locators
    this.resultListApiActionsItemCountLocator = page.locator('div[class*="TasksList_resultCount"]');
    this.searchInput = page.locator('input[name="search"]').first();
    this.apiActionNameLocator = page.locator('div[class*="ApiAction_name"]').first();
    this.apiActionNameLocators = page.locator('div[class*="ApiAction_name"]');
    this.clearSearchButton = page.getByRole('button', { name: 'Clear' });
    this.showMoreButton = page.getByRole('button', { name: /show more/i });
    this.appsFilterButton = page.getByRole('button', { name: /^Apps(\s\d+)?$/ });
    this.customAppsHeading = page.getByRole('heading', { name: 'Custom apps' });
    this.appsFilterSearchInput = page.getByRole('textbox', { name: 'Search…' }).first();
    this.appsFilterSearchInPanel = this.customAppsHeading.locator('xpath=following::input[@aria-label="Search…"][1]');
    this.firstAppCheckboxInPanel = page.getByRole('checkbox', { name: 'Zendesk' });
    this.clearInAppsFilterButton = this.customAppsHeading.locator(
      'xpath=following::button[normalize-space()="Clear"][1]'
    );
    this.statusFilterButton = page.getByRole('button', { name: /^Status(\s\d+)?$/ });
    this.statusDraftOption = page.getByRole('radio', { name: 'Draft' });
    this.statusPublishedOption = page.getByRole('radio', { name: 'Published' });
    this.showNextItemsButton = page.getByRole('button', { name: 'Show next items' });
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
      await this.openFilterSearchAndSelectFirst(appName);
      await this.closeFilterAndVerifyAppVisible(appName);
      await this.reopenClearAndVerifyDeselected(appName);
    });
  }

  // Open filter search and select first app
  async openFilterSearchAndSelectFirst(appName: string): Promise<void> {
    await this.appsFilterButton.click();
    await this.appsFilterSearchInPanel.fill(appName);
    await this.page.waitForTimeout(500);
    await this.firstAppCheckboxInPanel.waitFor({ state: 'visible' });
    await this.firstAppCheckboxInPanel.check().catch(async () => {
      await this.firstAppCheckboxInPanel.click();
    });
  }

  // Close filter and verify app visible
  async closeFilterAndVerifyAppVisible(appName: string): Promise<void> {
    await this.pressEscapeAndWait(400);
    await expect(this.page.getByText(appName).first(), `Expected "${appName}" to be visible on the page`).toBeVisible();
  }

  // Reopen filter and clear and verify deselected
  async reopenClearAndVerifyDeselected(appName: string): Promise<void> {
    await this.appsFilterButton.click();
    await this.clearInAppsFilterButton.click();
    const checkboxRole = this.getAppCheckboxByName(appName);
    if ((await checkboxRole.count()) > 0) {
      await expect(checkboxRole.first(), `"${appName}" should be deselected`).not.toBeChecked();
    }
    await this.pressEscapeAndWait();
  }

  /**
   * Press Escape with optional wait
   */
  async pressEscapeAndWait(waitMs?: number): Promise<void> {
    await this.page.keyboard.press('Escape');
    if (waitMs && waitMs > 0) {
      await this.page.waitForTimeout(waitMs);
    }
  }

  /**
   * Select and then deselect an app in Apps filter and verify filtering behaviour
   */
  async selectDeselectBehaviour(appName: string): Promise<void> {
    await test.step(`Verify select/deselect behaviour for app: ${appName}`, async () => {
      const appCheckbox = this.getAppCheckboxByName(appName);
      await appCheckbox.first().click();
      await this.pressEscapeAndWait(500);

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
      await this.pressEscapeAndWait(300);
    });
  }

  /**
   * Verify all visible apps have the expected status
   */
  async verifyAllApiActionsHaveStatus(expectedStatus: 'Draft' | 'Published'): Promise<void> {
    await test.step(`Verify all api actions have status "${expectedStatus}"`, async () => {
      const count = await this.apiActionNameLocators.count();
      for (let i = 0; i < count; i++) {
        const statusText = this.apiActionNameLocators.nth(i).getByText(expectedStatus);
        await expect(statusText, `Expected api action at index ${i} to have status "${expectedStatus}"`).toBeVisible();
      }
    });
  }

  /**
   * Select a status filter option
   */
  async selectStatusFilter(status: 'Draft' | 'Published'): Promise<void> {
    await test.step(`Select status filter: ${status}`, async () => {
      try {
        await this.showNextItemsButton.click({ timeout: 1000 });
      } catch {
        //continue
      }
      await this.statusFilterButton.click();
      const statusOption = status === 'Draft' ? this.statusDraftOption : this.statusPublishedOption;
      await this.clickOnElement(statusOption, { timeout: 10000 });
      await this.pressEscapeAndWait();
    });
  }
}
