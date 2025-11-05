import { Locator, Page, test } from '@playwright/test';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { getContentTenantConfigFromCache } from '@/src/modules/content/config/contentConfig';

export interface IPeopleScreenPageActions {
  gettingUserName: () => Promise<void>;
  searchingAndOpeningUserProfile: (fullName: string) => Promise<void>;
  openingUserProfile: () => Promise<void>;
}

interface PeopleListItem {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface PeopleListResponse {
  result: {
    listOfItems: PeopleListItem[];
  };
}

export class PeopleScreenPage extends BasePage implements IPeopleScreenPageActions {
  readonly peopleHeading: Locator = this.page.getByRole('heading', { name: 'People' });
  readonly roleColumn: Locator = this.page.getByText('Role');
  readonly searchBar: Locator = this.page.getByRole('textbox', { name: 'Search people...' });
  readonly searchIcon: Locator = this.page.locator('button[aria-label="Search"]').nth(1);

  fullName: string = '';

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
  async gettingUserName(): Promise<void> {
    await test.step('Opening user profile', async () => {
      // Get current logged-in user ID and email
      const loggedInUserInfo = await this.page.evaluate(() => {
        const user = (window as any).Simpplr?.CurrentUser;
        return {
          uid: user?.uid,
          email: user?.email,
          userId: user?.userId,
        };
      });

      if (!loggedInUserInfo.uid && !loggedInUserInfo.email) {
        throw new Error('Could not get current user information from Simpplr.CurrentUser');
      }

      // Fetch people data from API
      const apiBaseUrl = getContentTenantConfigFromCache().apiBaseUrl;

      // Get cookies from page context for authentication
      const cookies = await this.page.context().cookies();
      const token = cookies.find(c => c.name === 'token')?.value;
      const csrfid = cookies.find(c => c.name === 'csrfid')?.value;
      const ftoken = token?.replace(/%2B/g, '+');

      if (!token || !csrfid) {
        throw new Error('Missing authentication cookies (token or csrfid)');
      }

      const response = await this.page.request.post(`${apiBaseUrl}${API_ENDPOINTS.identity.people}`, {
        headers: {
          Cookie: `token=${token}; csrfid=${csrfid}; ftoken=${ftoken}`,
          'x-smtip-csrfid': csrfid,
        },
        data: {
          sortBy: ['user_name', 'asc'],
          size: 16,
          includePendingActivation: true,
          includeTotal: true,
          q: '',
          limitToSegment: true,
        },
      });

      if (!response.ok()) {
        throw new Error(`API request failed with status ${response.status()}: ${await response.text()}`);
      }

      const peopleData = (await response.json()) as unknown;

      // Validate response structure
      if (
        !peopleData ||
        typeof peopleData !== 'object' ||
        !('result' in peopleData) ||
        !peopleData.result ||
        typeof peopleData.result !== 'object' ||
        !('listOfItems' in peopleData.result) ||
        !Array.isArray(peopleData.result.listOfItems)
      ) {
        throw new Error(
          `Invalid API response structure. Expected result.listOfItems, got: ${JSON.stringify(peopleData)}`
        );
      }

      const validatedData = peopleData as PeopleListResponse;

      // Debug: Log first user to see structure
      if (validatedData.result.listOfItems.length > 0) {
        console.log('Sample user from API:', JSON.stringify(validatedData.result.listOfItems[0], null, 2));
        console.log('Logged in user info:', JSON.stringify(loggedInUserInfo, null, 2));
      }

      // Filter out logged-in user by comparing user_id, userId, and email
      const otherUsers = validatedData.result.listOfItems.filter(user => {
        const userAny = user as any;

        // Get all possible identifier values from API user object
        const apiUserId = user.user_id || userAny.userId || userAny.user_id || userAny.id || userAny.peopleId || '';
        const apiEmail = (user.email || userAny.email || '').toLowerCase().trim();
        const loggedInEmail = (loggedInUserInfo.email || '').toLowerCase().trim();
        const loggedInUid = (loggedInUserInfo.uid || '').toLowerCase().trim();
        const loggedInUserId = (loggedInUserInfo.userId || '').toLowerCase().trim();

        // Only compare if we have values to compare
        let isLoggedInUser = false;

        if (apiUserId && (loggedInUid || loggedInUserId)) {
          const apiUserIdLower = apiUserId.toLowerCase().trim();
          isLoggedInUser = apiUserIdLower === loggedInUid || apiUserIdLower === loggedInUserId;
        }

        if (!isLoggedInUser && apiEmail && loggedInEmail) {
          isLoggedInUser = apiEmail === loggedInEmail;
        }

        if (isLoggedInUser) {
          console.log(`Filtered out logged-in user: ID=${apiUserId}, Email=${apiEmail}`);
        }

        return !isLoggedInUser;
      });

      if (otherUsers.length === 0) {
        // Log all users for debugging
        console.error('All users from API:', JSON.stringify(validatedData.result.listOfItems, null, 2));
        throw new Error(
          `No other users found in the people list. Logged in user: ${JSON.stringify(loggedInUserInfo)}, Total users: ${validatedData.result.listOfItems.length}`
        );
      }

      // Store first user's first name and last name in a single variable
      const selectedUser = otherUsers[0];

      // Handle different possible property names (first_name/firstName, last_name/lastName)
      const firstName = (selectedUser as any).first_name || (selectedUser as any).firstName || '';
      const lastName = (selectedUser as any).last_name || (selectedUser as any).lastName || '';

      if (!firstName && !lastName) {
        // Log the actual user object structure for debugging
        console.error('User object structure:', JSON.stringify(selectedUser, null, 2));
        throw new Error(`User object missing name properties. Available keys: ${Object.keys(selectedUser).join(', ')}`);
      }

      this.fullName = `${firstName} ${lastName}`.trim();
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
}
