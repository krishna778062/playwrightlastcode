import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { IdentityManagementHelper } from '@/src/modules/platforms/apis/helpers/identityManagementHelper';

export interface IPeopleScreenPageActions {
  gettingUserName: (identityManagementHelper: IdentityManagementHelper) => Promise<void>;
  searchingAndOpeningUserProfile: (fullName: string) => Promise<void>;
  openingUserProfile: () => Promise<void>;
  disableLimitResultToggle: () => Promise<void>;
}

export class PeopleScreenPage extends BasePage implements IPeopleScreenPageActions {
  readonly peopleHeading: Locator = this.page.getByRole('heading', { name: 'People' });
  readonly roleColumn: Locator = this.page.getByText('Role');
  readonly searchBar: Locator = this.page.getByRole('textbox', { name: 'Search people...' });
  readonly searchIcon: Locator = this.page.locator('button[aria-label="Search"]').nth(1);
  readonly openingFilterPanelButton: Locator = this.page.getByRole('button', { name: 'Filters' });
  readonly limitResultToggleOn: Locator = this.page.locator('button[role="switch"][type="button"][value="on"]');
  readonly viewResultsButton: Locator = this.page.getByRole('button', { name: 'View results' });

  fullName: string = '';
  peopleId: string = '';

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.GOVERNANCE_SCREEN);
  }

  get actions(): IPeopleScreenPageActions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify governance page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.peopleHeading, {
        assertionMessage: 'Governance page should be visible',
      });
    });
  }

  async gettingUserName(identityManagementHelper: IdentityManagementHelper): Promise<void> {
    await test.step('Getting user name - selecting a user that exists in the UI', async () => {
      // First, wait for the page to load and check if Role column is visible (indicates table is loaded)
      await this.verifier.verifyTheElementIsVisible(this.roleColumn, {
        assertionMessage: 'People table should be loaded',
        timeout: 10000,
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
        if (!fullName) continue;

        // Search for this user in the UI
        await this.clickOnElement(this.searchBar);
        await this.fillInElement(this.searchBar, fullName);
        await this.clickOnElement(this.searchIcon);

        // Wait a bit for search results
        await this.page.waitForTimeout(1000);

        // Check if Role column is still visible (means results are shown, not "No people found")
        const isRoleVisible = await this.verifier.isTheElementVisible(this.roleColumn, { timeout: 2000 });

        if (isRoleVisible) {
          selectedUser = user;
          this.fullName = fullName;
          this.peopleId = user.peopleId || user.user_id;
          foundUser = true;
          break;
        }

        // Clear search for next iteration
        const clearButton = this.page.locator('button[aria-label="Clear"]');
        if (await clearButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await clearButton.click();
        } else {
          // If no clear button, manually clear the search
          await this.clickOnElement(this.searchBar);
          await this.page.keyboard.press('Control+A');
          await this.page.keyboard.press('Delete');
        }
      }

      if (!foundUser || !selectedUser) {
        throw new Error('No user from API list was found in the UI search results');
      }

      if (!this.fullName) {
        throw new Error('Failed to retrieve user name from API - user name is empty');
      }

      if (!this.peopleId) {
        throw new Error('Failed to retrieve peopleId from API - peopleId is empty');
      }
    });
  }

  async searchingAndOpeningUserProfile(fullName: string): Promise<void> {
    await test.step('Searching and opening user profile', async () => {
      await this.clickOnElement(this.searchBar);
      await this.fillInElement(this.searchBar, fullName);
      await this.clickOnElement(this.searchIcon);
    });
  }
  async openingUserProfile(): Promise<void> {
    await test.step('Opening user profile', async () => {
      await this.clickOnElement(this.roleColumn);
      await this.page.keyboard.press('Tab');
      await this.page.keyboard.press('Tab');
      await this.page.keyboard.press('Enter');
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
