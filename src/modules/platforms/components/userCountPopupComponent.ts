import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class UserCountPopupComponent extends BaseComponent {
  // Locators
  readonly userCountPopupText: Locator;
  readonly foUserCountPopupModal: Locator;
  readonly foUserNamesOnUserCountPopup: Locator;
  readonly foAppManagerTag: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize popup locators
    this.userCountPopupText = page.getByText(/\d+ users/);
    this.foUserCountPopupModal = page.locator("[class*='AccessControlListItem-module-listItemContainer']");
    this.foUserNamesOnUserCountPopup = page.locator("[class*='Spacing-module'] p a");
    this.foAppManagerTag = page.locator("[class*='AccessControlListItem-module-appManagerContainer'] p");
  }

  /**
   * Verifies that the user count popup is opened with correct count
   * @param expectedCount - Expected user count to verify
   */
  async verifyPopupOpenedWithCount(expectedCount: string): Promise<void> {
    await test.step(`Verify the title of the User count popup as "${expectedCount} users"`, async () => {
      // Wait for the popup to appear and verify the count text
      await this.verifier.verifyTheElementIsVisible(this.userCountPopupText, {
        assertionMessage: 'User count popup title should be visible',
      });
      await this.verifier.verifyElementContainsText(this.userCountPopupText, `${expectedCount} users`, {
        assertionMessage: `User count popup title should display "${expectedCount} users"`,
      });
    });
  }

  /**
   * Verifies that the popup is visible and contains user information
   */
  async verifyPopupIsVisible(): Promise<void> {
    await test.step('Verify the User count popup is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.userCountPopupText, {
        assertionMessage: 'User count popup should be visible',
      });
    });
  }

  /**
   * Gets all visible usernames with app manager tag from user count popup
   * @returns Array of usernames that have app manager tags
   */
  async getAllVisibleUsernamesWithAppManagerTag(): Promise<string[]> {
    return await test.step(`Getting all visible usernames with app manager tag from user count popup`, async () => {
      const usernamesWithAppManagerTag: string[] = [];

      for (let i = 0; i < (await this.foUserCountPopupModal.count()); i++) {
        const appManagerElement = this.foUserCountPopupModal
          .nth(i)
          .locator("[class*='AccessControlListItem-module-appManagerContainer'] p");

        if (await appManagerElement.isVisible()) {
          const userNameElement = this.foUserCountPopupModal.nth(i).locator("[class*='Spacing-module'] p a");
          const userName = await userNameElement.textContent();
          if (userName?.trim()) {
            usernamesWithAppManagerTag.push(userName.trim());
          }
        }
      }
      return usernamesWithAppManagerTag;
    });
  }

  /**
   * Gets the count text displayed in the popup
   * @returns The count text (e.g., "5 users")
   */
  async getCountText(): Promise<string> {
    return await test.step('Get user count text from popup', async () => {
      const countText = await this.userCountPopupText.textContent();
      return countText?.trim() || '';
    });
  }

  /**
   * Verifies the popup contains specific users
   * @param expectedUsers - Array of expected usernames
   */
  async verifyContainsUsers(expectedUsers: string[]): Promise<void> {
    await test.step(`Verify the User count popup contains users: ${expectedUsers.join(', ')}`, async () => {
      for (const expectedUser of expectedUsers) {
        const userLocator = this.foUserNamesOnUserCountPopup.filter({ hasText: expectedUser });
        await this.verifier.verifyTheElementIsVisible(userLocator, {
          assertionMessage: `User "${expectedUser}" should be visible in the popup`,
        });
      }
    });
  }
}
