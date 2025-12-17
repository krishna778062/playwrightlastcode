import { Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { CustomApiActionsComponent } from '@/src/modules/integrations/ui/components/customApiActionsComponent';

export class CustomApiActionsPage extends BasePage {
  readonly resultListApiActionsItemCountLocator: Locator;
  readonly customApiActionsComponent: CustomApiActionsComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.API_ACTIONS_PAGE);
    this.resultListApiActionsItemCountLocator = page.locator('div[class*="ConnectorsList_resultCount"]');
    this.customApiActionsComponent = new CustomApiActionsComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.customApiActionsComponent.searchInput, {
      timeout: TIMEOUTS.MEDIUM,
      assertionMessage: 'Verifying that the custom api actions page is loaded by asserting search input presence',
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
}
