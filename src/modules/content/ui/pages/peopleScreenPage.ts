import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { IdentityManagementHelper } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';

export class PeopleScreenPage extends BasePage {
  readonly peopleHeading: Locator;
  readonly roleColumn: Locator;
  readonly searchBar: Locator;
  readonly searchIcon: Locator;
  readonly clearSearchButton: Locator;
  readonly openingFilterPanelButton: Locator;
  readonly limitResultToggleOn: Locator;
  readonly viewResultsButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.GOVERNANCE_SCREEN);
    this.searchIcon = this.page.getByTestId('i-searchThick');
    this.viewResultsButton = this.page.getByRole('button', { name: 'View results' });
    this.limitResultToggleOn = this.page.locator('button[role="switch"][type="button"][value="on"]');
    this.clearSearchButton = this.page.getByRole('button', { name: 'Clear' });
    this.openingFilterPanelButton = this.page.getByRole('button', { name: 'Filters' });
    this.searchBar = this.page.getByRole('textbox', { name: 'Search people...' });
    this.roleColumn = this.page.getByText('Role');
    this.peopleHeading = this.page.getByRole('heading', { name: 'People' });
  }
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify governance page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.peopleHeading, {
        assertionMessage: 'Governance page should be visible',
      });
    });
  }

  /**
   * Gets the user name and people ID of a user that exists in the UI
   * @param identityManagementHelper - The identity management helper
   * @returns The user name and people ID of the user
   */
  async gettingUserName(
    identityManagementHelper: IdentityManagementHelper
  ): Promise<{ fullName: string; peopleId: string }> {
    return await test.step('Getting user name - selecting a user that exists in the UI', async () => {
      // First, wait for the page to load and check if Role column is visible (indicates table is loaded)
      await this.verifier.verifyTheElementIsVisible(this.roleColumn, {
        assertionMessage: 'People table should be loaded',
      });

      // Get list of all people from API
      const peopleListResponse = await identityManagementHelper.getPeopleList();
      const users = peopleListResponse.result.listOfItems;

      if (users.length === 0) {
        throw new Error('No users found in the people list');
      }

      // Try to find a user that exists in the UI by searching for them
      let selectedUser = null;
      let foundUser = false;

      for (const user of users) {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        const peopleId = user.peopleId || user.user_id;
        if (!fullName) continue;

        // Search for this user in the UI
        await this.clickOnElement(this.searchBar);
        await this.fillInElement(this.searchBar, fullName);
        await this.clickOnElement(this.searchIcon);

        // Check if Role column is still visible (means results are shown, not "No people found")
        const isRoleVisible = await this.verifier.isTheElementVisible(this.roleColumn);

        if (isRoleVisible) {
          selectedUser = { fullName: fullName, peopleId: peopleId };
          foundUser = true;
          break;
        }

        // Clear search for next iteration
        const isClearButtonVisible = await this.clearSearchButton.isVisible().catch(() => false);
        if (isClearButtonVisible) {
          await this.clickOnElement(this.clearSearchButton);
        } else {
          // If no clear button, clear the search field using fillInElement
          await this.fillInElement(this.searchBar, '');
        }
      }

      if (!foundUser || !selectedUser) {
        throw new Error('No user from API list was found in the UI search results');
      }

      if (!selectedUser.fullName) {
        throw new Error('Failed to retrieve user name from API - user name is empty');
      }

      if (!selectedUser.peopleId) {
        throw new Error('Failed to retrieve peopleId from API - peopleId is empty');
      }
      return selectedUser;
    });
  }

  async searchingAndOpeningUserProfile(fullName: string): Promise<void> {
    await test.step('Searching and opening user profile', async () => {
      await this.clickOnElement(this.searchBar);
      await this.fillInElement(this.searchBar, fullName);
      await this.clickOnElement(this.searchIcon);
    });
  }

  async openingUserProfile(fullName: string): Promise<void> {
    await test.step('Opening user profile', async () => {
      // Click directly on the user's name link in the search results
      // Use .first() to handle strict mode violation (multiple links with same name)
      const userLink = this.page.getByRole('link', { name: fullName }).first();
      await this.verifier.verifyTheElementIsVisible(userLink, {
        assertionMessage: `User "${fullName}" should be visible in search results`,
      });
      await this.clickOnElement(userLink);
    });
  }

  async disableLimitResultToggle(): Promise<void> {
    await test.step('Disabling limit result toggle', async () => {
      await this.clickOnElement(this.openingFilterPanelButton);

      // Check if limitResultToggleOn is checked/enabled
      const isToggleChecked = await this.limitResultToggleOn.isChecked().catch(() => false);

      if (isToggleChecked) {
        // If toggle is on (checked), click it to turn it off, then click view results
        await this.clickOnElement(this.limitResultToggleOn);
        await this.clickOnElement(this.viewResultsButton);
      } else {
        // If toggle is off (not checked), just click view results
        await this.clickOnElement(this.viewResultsButton);
      }
    });
  }
}
