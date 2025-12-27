import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { SortOptionLabels } from '@/src/modules/content/constants';
import { ManageContentComponent } from '@/src/modules/content/ui/components/manageContentComponent';
import { OnboardingComponent } from '@/src/modules/content/ui/components/onboardingComponent';

/**
 * ManageContentPage - Simplified page object following Phase 2 cleanup
 *
 * Components are exposed directly for test access:
 * - `manageContent` - ManageContentComponent for content management actions
 * - `onboarding` - OnboardingComponent for onboarding-related actions
 *
 * Usage in tests:
 * ```typescript
 * await manageContentPage.manageContent.writeRandomTextInSearchBar(title);
 * await manageContentPage.manageContent.clickSearchIcon();
 * await manageContentPage.onboarding.selectOnboardingOption(option);
 * ```
 */
export class ManageContentPage extends BasePage {
  /** Component for managing content list, filters, bulk actions, and content operations */
  readonly manageContent: ManageContentComponent;

  /** Component for onboarding-related operations */
  readonly onboarding: OnboardingComponent;

  // Page-level locators (not delegated to components)
  readonly clickingOnCheckbox: Locator = this.page.locator('input[type="checkbox"][aria-label="Select"]').first();
  readonly clickOnBulkOptions: Locator = this.page.locator('input[type="text"]#action');
  readonly validateOption: Locator = this.page.getByText('Validate');

  // Convenience accessors for commonly used component locators
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly unpublishButton: Locator;
  readonly publishButton: Locator;
  readonly moveButton: Locator;

  static actions: any;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_CONTENT);
    this.manageContent = new ManageContentComponent(page);
    this.onboarding = new OnboardingComponent(page);

    // Expose commonly used locators from component for backwards compatibility
    this.editButton = this.manageContent.editButton;
    this.deleteButton = this.manageContent.deleteButton;
    this.unpublishButton = this.manageContent.unpublishButton;
    this.publishButton = this.manageContent.publishButton;
    this.moveButton = this.manageContent.moveButton;
  }

  async load(): Promise<void> {
    await this.page.goto(PAGE_ENDPOINTS.MANAGE_CONTENT);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify manage content page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageContent.sendFeedback, {
        assertionMessage: 'Manage content page should be visible',
      });
    });
  }

  /**
   * Selects sort option and waits for API response
   * @param sortBy - The sort option to select
   */
  async selectSortOption(sortBy: SortOptionLabels): Promise<void> {
    await this.performActionAndWaitForResponse(
      () => this.manageContent.selectSortOption(sortBy),
      response =>
        response.url().includes(API_ENDPOINTS.content.contentListInSite) &&
        response.request().method() === 'POST' &&
        response.status() === 200,
      {
        timeout: 20_000,
      }
    );
  }

  /**
   * Orchestration method: Checks validate option visibility in bulk actions
   */
  async checkValidateOptionInBulkActions(): Promise<void> {
    await this.clickOnElement(this.clickingOnCheckbox);
    await this.clickOnElement(this.clickOnBulkOptions);
    await this.verifier.verifyTheElementIsVisible(this.validateOption, {
      assertionMessage: 'Validate option should be visible in bulk actions',
    });
  }

  /**
   * Orchestration method: Opens content details page via keyboard navigation
   */
  async openContentDetailsPage(): Promise<void> {
    await this.clickOnElement(this.clickingOnCheckbox);
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Enter');
  }

  /**
   * Verifies toast message is visible - uses inherited method from BasePage
   */
  async verifyToastMessageIsVisibleWithText(message: string): Promise<void> {
    await super.verifyToastMessageIsVisibleWithText(message);
  }
}
