import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

export interface IManageUsersPageActions {
  navigateToManageUsersFilterPage: (firstName: string, lastName: string) => Promise<void>;
}

export interface IManageUsersPageAssertions {
  verifyThePageIsLoaded: () => Promise<void>;
  verifyRoleFilterIsVisible: (role: string) => Promise<void>;
}

export class ManageUsersPage extends BasePage implements IManageUsersPageActions, IManageUsersPageAssertions {
  readonly pageHeader: Locator;
  readonly roleFilter: (role: string) => Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_USERS_PAGE);
    this.pageHeader = page.getByRole('heading', { name: 'Manage users' });
    this.roleFilter = (role: string) => page.getByText(role);
  }

  get actions(): IManageUsersPageActions {
    return this;
  }

  get assertions(): IManageUsersPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying manage users page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageHeader, {
        assertionMessage: 'expecting manage users page header to be visible',
      });
    });
  }

  async navigateToManageUsersFilterPage(firstName: string, lastName: string): Promise<void> {
    await test.step('Navigating to manage users filter page', async () => {
      await this.page.goto(PAGE_ENDPOINTS.MANAGE_USERS_FILTER_PAGE(firstName, lastName));
    });
  }

  async verifyRoleFilterIsVisible(role: string): Promise<void> {
    await test.step('Verifying role filter is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.roleFilter(role), {
        assertionMessage: 'expecting role filter to be visible',
      });
    });
  }
}
