import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

const TIMEOUTS = {
  SHORT: 10000,
  MEDIUM: 15000,
  FILTER_WAIT: 500,
  SEARCH_WAIT: 1000,
} as const;

const MAX_ITEMS_TO_CHECK = 10;

export class CustomApiActionsComponent extends BaseComponent {
  // List and search locators
  readonly resultListApiActionsItemCountLocator: Locator;
  readonly searchInput: Locator;
  readonly apiActionNameLocator: Locator;
  readonly apiActionNameLocators: Locator;
  readonly clearSearchButton: Locator;
  readonly showMoreButton: Locator;

  // Filter locators
  readonly appsFilterButton: Locator;
  readonly customAppsHeading: Locator;
  readonly appsFilterSearchInput: Locator;
  readonly appsFilterSearchInPanel: Locator;
  readonly clearInAppsFilterButton: Locator;
  readonly statusFilterButton: Locator;
  readonly statusDraftOption: Locator;
  readonly statusPublishedOption: Locator;
  readonly showNextItemsButton: Locator;

  // Sort locators
  readonly sortDropdownButton: Locator;
  readonly menuContainer: Locator;
  readonly sortByLastUpdatedMenuItem: Locator;
  readonly sortByDateCreatedMenuItem: Locator;
  readonly sortByNameMenuItem: Locator;
  readonly sortOrderNewestFirstMenuItem: Locator;
  readonly sortOrderOldestFirstMenuItem: Locator;

  // Action and count locators
  readonly createApiActionButton: Locator;
  readonly apiActionCountText: Locator;

  constructor(page: Page) {
    super(page);

    // List and search
    this.resultListApiActionsItemCountLocator = page.locator('div[class*="TasksList_resultCount"]');
    this.searchInput = page.locator('input[name="search"]').first();
    this.apiActionNameLocator = page.locator('div[class*="ApiAction_name"]').first();
    this.apiActionNameLocators = page.locator('div[class*="ApiAction_name"]');
    this.clearSearchButton = page.getByRole('button', { name: 'Clear' });
    this.showMoreButton = page.getByRole('button', { name: /show more/i });

    // Filters
    this.appsFilterButton = page.getByRole('button', { name: /^Apps(\s\d+)?$/ });
    this.customAppsHeading = page.getByRole('heading', { name: 'Custom apps' });
    this.appsFilterSearchInput = page.getByRole('textbox', { name: 'Search…' }).first();
    this.appsFilterSearchInPanel = this.customAppsHeading.locator('xpath=following::input[@aria-label="Search…"][1]');
    this.clearInAppsFilterButton = this.customAppsHeading.locator(
      'xpath=following::button[normalize-space()="Clear"][1]'
    );
    this.statusFilterButton = page.getByRole('button', { name: /^Status(\s\d+)?$/ });
    this.statusDraftOption = page.getByRole('radio', { name: 'Draft' });
    this.statusPublishedOption = page.getByRole('radio', { name: 'Published' });
    this.showNextItemsButton = page.getByRole('button', { name: 'Show next items' });

    // Sort
    this.sortDropdownButton = page.locator('button').filter({ hasText: /^Sort:/ });
    this.menuContainer = page.locator('div[role="menu"]');
    this.sortByLastUpdatedMenuItem = page.getByRole('menuitem', { name: 'Last updated' });
    this.sortByDateCreatedMenuItem = page.getByRole('menuitem', { name: 'Date created' });
    this.sortByNameMenuItem = page.getByRole('menuitem', { name: 'Name' });
    this.sortOrderNewestFirstMenuItem = page.getByRole('menuitem', { name: 'Newest first' });
    this.sortOrderOldestFirstMenuItem = page.getByRole('menuitem', { name: 'Oldest first' });

    // Actions and count
    this.createApiActionButton = page.getByRole('link', { name: 'Create API action' });
    this.apiActionCountText = page.locator('p').filter({ hasText: /API actions$/ });
  }

  /**
   * Get the custom app/provider label that appears immediately below the API action name
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

  /**
   * Search for API actions
   */
  async searchForApp(searchTerm: string): Promise<void> {
    await test.step(`Search for api action: ${searchTerm}`, async () => {
      await this.typeInElement(this.searchInput, searchTerm, { timeout: 20000 });
      await this.searchInput.press('Enter');
    });
  }

  /**
   * Verify that an API action with the given name is displayed in the list
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
      await this.clickOnElement(this.clearSearchButton, { timeout: TIMEOUTS.SHORT });
      await this.searchInput.waitFor({ state: 'visible' });
    });
  }

  /**
   * Verify Show more behavior for API actions list
   */
  async verifyShowMoreBehavior(): Promise<void> {
    await test.step('Verify Show more behavior for API actions list', async () => {
      const initialCount = await this.apiActionNameLocators.count();
      if (initialCount <= MAX_ITEMS_TO_CHECK) {
        await expect(this.showMoreButton, 'Show more should not be visible when <= 10 items').toBeHidden();
        return;
      }
      await expect(this.showMoreButton, 'Show more should be visible when > 10 items').toBeVisible();
      await this.clickOnElement(this.showMoreButton, { timeout: TIMEOUTS.MEDIUM });
      await this.verifier.verifyCountOfElementsIsGreaterThan(this.apiActionNameLocators, MAX_ITEMS_TO_CHECK, {
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

  /**
   * Open filter search and select first app
   */
  private async openFilterSearchAndSelectFirst(appName: string): Promise<void> {
    await this.appsFilterButton.click();
    await this.appsFilterSearchInPanel.fill(appName);
    await this.page.waitForTimeout(TIMEOUTS.FILTER_WAIT);

    const appCheckbox = this.getAppCheckboxByName(appName);
    await appCheckbox.first().waitFor({ state: 'visible' });
    await appCheckbox
      .first()
      .check()
      .catch(async () => {
        await appCheckbox.first().click();
      });
  }

  /**
   * Close filter and verify app visible
   */
  private async closeFilterAndVerifyAppVisible(appName: string): Promise<void> {
    await this.pressEscapeAndWait(TIMEOUTS.FILTER_WAIT);
    await expect(this.page.getByText(appName).first(), `Expected "${appName}" to be visible on the page`).toBeVisible();
  }

  /**
   * Reopen filter and clear and verify deselected
   */
  private async reopenClearAndVerifyDeselected(appName: string): Promise<void> {
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
      await this.pressEscapeAndWait(TIMEOUTS.FILTER_WAIT);

      const count = await this.apiActionNameLocators.count();
      const maxToCheck = Math.min(count, MAX_ITEMS_TO_CHECK);
      for (let i = 0; i < maxToCheck; i++) {
        const nameLocator = this.apiActionNameLocators.nth(i);
        const appLabel = this.getAppLabelBelow(nameLocator);
        await expect(appLabel, `Expected API action row ${i + 1} to show "${appName}" below name`).toContainText(
          appName
        );
      }

      await this.appsFilterButton.click();
      await appCheckbox.first().click();
      await this.pressEscapeAndWait(TIMEOUTS.FILTER_WAIT);
    });
  }

  /**
   * Verify all visible API actions have the expected status
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
        await this.showNextItemsButton.click({ timeout: TIMEOUTS.SEARCH_WAIT });
      } catch {
        // Continue if button is not visible
      }
      await this.statusFilterButton.click();
      const statusOption = status === 'Draft' ? this.statusDraftOption : this.statusPublishedOption;
      await this.clickOnElement(statusOption, { timeout: TIMEOUTS.SHORT });
      await this.pressEscapeAndWait();
    });
  }

  /**
   * Click the sort dropdown button
   */
  async clickSortDropdown(): Promise<void> {
    await test.step('Click sort dropdown', async () => {
      await this.clickOnElement(this.sortDropdownButton, { timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Select a sort by option
   */
  async selectSortBy(sortBy: 'Last updated' | 'Date created' | 'Name'): Promise<void> {
    await test.step(`Select sort by: ${sortBy}`, async () => {
      await this.clickSortDropdown();
      await this.menuContainer.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });

      let menuItem: Locator;
      switch (sortBy) {
        case 'Last updated':
          menuItem = this.sortByLastUpdatedMenuItem;
          break;
        case 'Date created':
          menuItem = this.sortByDateCreatedMenuItem;
          break;
        case 'Name':
          menuItem = this.sortByNameMenuItem;
          break;
      }

      await menuItem.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      await expect(menuItem).toBeEnabled({ timeout: TIMEOUTS.SHORT });
      await this.clickOnElement(menuItem, { timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Select a sort order option
   */
  async selectSortOrder(order: 'Newest first' | 'Oldest first'): Promise<void> {
    await test.step(`Select sort order: ${order}`, async () => {
      await this.clickSortDropdown();
      const menuItem = order === 'Newest first' ? this.sortOrderNewestFirstMenuItem : this.sortOrderOldestFirstMenuItem;
      await this.clickOnElement(menuItem, { timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Verify the sort dropdown label text
   */
  async verifySortDropdownLabel(expectedLabel: string): Promise<void> {
    await test.step(`Verify sort dropdown label is "${expectedLabel}"`, async () => {
      await expect(this.sortDropdownButton).toContainText(expectedLabel);
    });
  }

  /**
   * Get the first API action name in the list
   */
  async getFirstApiActionName(): Promise<string> {
    const firstApiActionName = this.apiActionNameLocators.first();
    return (await firstApiActionName.textContent()) || '';
  }

  /**
   * Get all API action names in the list
   */
  async getAllApiActionNames(): Promise<string[]> {
    const apiActionNames: string[] = [];
    const count = await this.apiActionNameLocators.count();
    for (let i = 0; i < count; i++) {
      const nameElement = this.apiActionNameLocators.nth(i);
      const name = await nameElement.textContent();
      if (name) {
        apiActionNames.push(name.trim());
      }
    }
    return apiActionNames;
  }

  /**
   * Verify API actions are sorted alphabetically A-Z
   */
  async verifyApiActionsSortedAlphabeticallyAZ(): Promise<void> {
    await test.step('Verify API actions are sorted alphabetically A-Z', async () => {
      const names = await this.getAllApiActionNames();
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
      expect(names).toEqual(sortedNames);
    });
  }

  /**
   * Verify API actions are sorted alphabetically Z-A
   */
  async verifyApiActionsSortedAlphabeticallyZA(): Promise<void> {
    await test.step('Verify API actions are sorted alphabetically Z-A', async () => {
      const names = await this.getAllApiActionNames();
      const sortedNames = [...names].sort((a, b) => b.localeCompare(a, undefined, { sensitivity: 'base' }));
      expect(names).toEqual(sortedNames);
    });
  }

  /**
   * Verify API action count text is displayed
   */
  async verifyApiActionCountDisplayed(): Promise<void> {
    await test.step('Verify API action count is displayed', async () => {
      await expect(this.apiActionCountText.first(), 'Expected API action count text to be visible').toBeVisible();
    });
  }

  /**
   * Get API action count from the text
   */
  async getApiActionCount(): Promise<number> {
    const countText = await this.apiActionCountText.first().textContent();
    const match = countText?.match(/(\d+)\s+API actions?/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Verify API action count is greater than zero
   */
  async verifyApiActionCountIsGreaterThanZero(): Promise<void> {
    await test.step('Verify API action count is greater than zero', async () => {
      const count = await this.getApiActionCount();
      expect(count, 'Expected API action count to be greater than zero').toBeGreaterThan(0);
    });
  }

  /**
   * Verify Create API action button navigates to create page
   */
  async verifyCreateApiActionButtonNavigation(): Promise<void> {
    await test.step('Verify Create API action button navigation', async () => {
      await expect(this.createApiActionButton, 'Expected Create API action button to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      const href = await this.createApiActionButton.getAttribute('href');
      expect(href).toContain('/api-actions/create');
    });
  }
}
