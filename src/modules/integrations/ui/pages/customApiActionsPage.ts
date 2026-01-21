import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { CustomApiActionsComponent } from '@/src/modules/integrations/ui/components/customApiActionsComponent';

export class CustomApiActionsPage extends BasePage {
  readonly customApiActionsComponent: CustomApiActionsComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.API_ACTIONS_PAGE);
    this.customApiActionsComponent = new CustomApiActionsComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      // Check if page is still open before proceeding
      if (this.page.isClosed()) {
        throw new Error('Page was closed before verification could complete');
      }

      // Wait for network to be idle to ensure page is fully loaded
      await this.page.waitForLoadState('networkidle', { timeout: TIMEOUTS.MEDIUM }).catch(() => {});

      // Verify page is still open after network idle
      if (this.page.isClosed()) {
        throw new Error('Page was closed during network idle wait');
      }

      // Use the paragraph with API actions count as it's more reliable
      await this.verifier.verifyTheElementIsVisible(this.customApiActionsComponent.apiActionCountText, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage:
          'Verifying that the custom api actions page is loaded by asserting API action count text presence',
      });

      // Verify page is still open before checking button
      if (this.page.isClosed()) {
        throw new Error('Page was closed after API action count text verification');
      }

      // Also verify the Create API action button is visible to ensure page is fully loaded
      await this.verifier.verifyTheElementIsVisible(this.customApiActionsComponent.createApiActionButton, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: 'Verifying that the Create API action button is visible',
      });
    });
  }

  /**
   * Search for apps by entering text in the search field and pressing Enter
   * @param searchTerm - The search term to enter
   */
  async searchForApiActions(searchTerm: string): Promise<void> {
    return this.customApiActionsComponent.searchForApp(searchTerm);
  }

  /**
   * Verify that an api action with the given name is displayed in the list
   * @param apiActionName - The name of the api action to verify
   */
  async verifyApiActionIsDisplayedInList(apiActionName: string): Promise<void> {
    return this.customApiActionsComponent.verifyApiActionIsDisplayedInList(apiActionName);
  }

  /**
   * Clear the search input field by clicking the clear/cross button
   */
  async clearSearch(): Promise<void> {
    return this.customApiActionsComponent.clearSearch();
  }

  /**
   * Verify Show more behavior for API actions list (one-call helper)
   */
  async verifyShowMoreVisibilityBehaviour(): Promise<void> {
    return this.customApiActionsComponent.verifyShowMoreBehavior();
  }

  /**
   * Click "Apps" dropdown filter and verify "Custom apps" heading is visible inside filter
   */
  async clickAndVerifyAppsFilter(): Promise<void> {
    return this.customApiActionsComponent.clickAndVerifyAppsFilter();
  }

  /**
   * Select and deselect app filter by name and verify list behaviour
   */
  async selectDeselectBehaviour(appName: string): Promise<void> {
    return this.customApiActionsComponent.selectDeselectBehaviour(appName);
  }

  /**
   * Verify Apps filter search flow
   */
  async verifyAppsFilterSearchSelectClear(appName: string): Promise<void> {
    return this.customApiActionsComponent.verifyAppsFilterSearchSelectClear(appName);
  }

  /**
   * Verify all visible apps have the expected status
   * @param expectedStatus - Expected status ('Draft' or 'Published')
   */
  async verifyAllApiActionsHaveStatus(expectedStatus: 'Draft' | 'Published'): Promise<void> {
    return this.customApiActionsComponent.verifyAllApiActionsHaveStatus(expectedStatus);
  }

  /**
   * Select a status filter option
   * @param status - The status to filter by ('Draft' or 'Published')
   */
  async selectStatusFilter(status: 'Draft' | 'Published'): Promise<void> {
    return this.customApiActionsComponent.selectStatusFilter(status);
  }

  async selectSortBy(sortBy: 'Last updated' | 'Date created' | 'Name'): Promise<void> {
    return this.customApiActionsComponent.selectSortBy(sortBy);
  }

  async selectSortOrder(order: 'Newest first' | 'Oldest first'): Promise<void> {
    return this.customApiActionsComponent.selectSortOrder(order);
  }

  async verifySortDropdownLabel(expectedLabel: string): Promise<void> {
    return this.customApiActionsComponent.verifySortDropdownLabel(expectedLabel);
  }

  async verifyApiActionsSortedAlphabeticallyAZ(): Promise<void> {
    return this.customApiActionsComponent.verifyApiActionsSortedAlphabeticallyAZ();
  }

  async verifyApiActionsSortedAlphabeticallyZA(): Promise<void> {
    return this.customApiActionsComponent.verifyApiActionsSortedAlphabeticallyZA();
  }

  async verifyApiActionCountDisplayed(): Promise<void> {
    return this.customApiActionsComponent.verifyApiActionCountDisplayed();
  }

  async getApiActionCount(): Promise<number> {
    return this.customApiActionsComponent.getApiActionCount();
  }

  async verifyApiActionCountIsGreaterThanZero(): Promise<void> {
    return this.customApiActionsComponent.verifyApiActionCountIsGreaterThanZero();
  }

  async verifyCreateApiActionButtonNavigation(): Promise<void> {
    return this.customApiActionsComponent.verifyCreateApiActionButtonNavigation();
  }
}
