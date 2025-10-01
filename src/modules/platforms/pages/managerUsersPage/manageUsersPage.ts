import { expect, Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';
import { ManageUsersFilter } from '@platforms/components/manageUsersFilter';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export enum MUOptions {
  EDIT_USER = 'Edit user',
  VIEW_PROFILE = 'View profile',
  UPDATE_PRIMARY_ROLE = 'Update primary role',
  UPDATE_STATUS = 'Update status',
  GRANT_SUPPORT_ACCESS = 'Grant support access',
  RESET_PASSWORD = 'Reset password',
  LOGIN_AS = 'Login as',
}

export class ManageUsersPage extends BasePage {
  readonly manageUsersPageElements: Locator;
  readonly searchInputBox: Locator;
  readonly appManagerValue: Locator;
  readonly standardUserValue: Locator;
  readonly manageUsersTiles: Locator;
  readonly manageUsersMenuOptions: Locator;
  readonly firstNameInputBox: Locator;
  readonly primaryRoleInputBox: Locator;
  readonly filterButton: Locator;

  manageUsersFilter: ManageUsersFilter;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.MANAGE_USERS_PAGE) {
    super(page, pageUrl);
    this.manageUsersPageElements = page.locator('[data-testid*="dataGridRow"]');
    this.searchInputBox = page.locator('#searchTerm');
    this.appManagerValue = page.locator('text="App manager"');
    this.standardUserValue = page.locator('text="Standard user"');
    this.manageUsersTiles = page.locator('[data-testid*="dataGridRow"]');
    this.manageUsersMenuOptions = page.locator('[class*="DropdownMenu-module__DropdownMenu"] button');
    this.firstNameInputBox = page.locator('#firstName');
    this.primaryRoleInputBox = page.locator('select#role');
    this.manageUsersFilter = new ManageUsersFilter(page);
    this.filterButton = page.getByRole('button', { name: 'Filters' });
  }

  // To verify that the manage users page is loaded
  async verifyThePageIsLoaded(): Promise<void> {
    await expect(this.manageUsersPageElements.nth(0), 'manage users page to load').toBeVisible({ timeout: 15000 });
  }

  /**
   * Searches for the give user.
   * @param searchValue - The value that needs to be searched.
   */
  async searchForUser(searchValue: string): Promise<void> {
    await test.step(`Search for ${searchValue}`, async () => {
      await this.fillInElement(this.searchInputBox, searchValue);
      await this.searchInputBox.press('Enter');
      await this.sleep(1500);
      await expect(this.manageUsersPageElements.nth(0)).toBeVisible();
    });
  }

  /**
   * Searches for the give user.
   * @param userName - User name of the user for which primary role need to verified
   * @param value - The value that needs to be searched.
   */
  async verifyValueForStatusColumn(userName: string, value: string): Promise<void> {
    await test.step(`Verify the value of status column`, async () => {
      for (let i = 0; i < (await this.manageUsersPageElements.count()); i++) {
        if (
          (await this.manageUsersPageElements.locator("[class*='Spacing-module__row'] p").nth(i).textContent()) ==
          userName
        ) {
          if (value == 'App manager') {
            await expect(this.appManagerValue).toBeVisible();
          } else {
            await expect(this.standardUserValue).toBeVisible();
          }
        }
      }
    });
  }

  /**
   * Searches for the given user.
   * @param userName - User name of the user for which primary role need to verified
   */
  async clickOnButtonForUser(
    userName: string,
    optionName: string,
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<void> {
    await test.step(`Click on the ${optionName} button for ${userName} user`, async () => {
      for (let i = 0; i < (await this.manageUsersTiles.count()); i++) {
        if ((await this.manageUsersTiles.locator("[class*='Cell-module__primary']").nth(i).textContent()) == userName) {
          await this.clickOnElement(this.manageUsersTiles.locator('td button').nth(i));
          if (optionName == 'Edit user') {
            try {
              await this.clickOnElement(this.manageUsersMenuOptions.filter({ hasText: optionName }));
              await expect(this.firstNameInputBox).toBeVisible();
            } catch (e) {
              console.log(`Couldn't click on ${optionName} button`);
              await this.clickOnElement(this.manageUsersMenuOptions.filter({ hasText: optionName }), {
                timeout: options?.timeout ?? 10_000,
                force: true,
                // stepInfo: 'Clicking on the Edit button with force',
              });
            }
            await expect(this.firstNameInputBox).toBeVisible();
          } else if (optionName == 'Update primary role') {
            try {
              await this.clickOnElement(this.manageUsersMenuOptions.filter({ hasText: optionName }));
              await expect(this.primaryRoleInputBox).toBeVisible();
            } catch (e) {
              console.log(`Couldn't click on ${optionName} button`);
              await this.clickOnElement(this.manageUsersMenuOptions.filter({ hasText: optionName }), {
                timeout: options?.timeout ?? 10_000,
                force: true,
                // stepInfo: 'Clicking on the Edit button with force',
              });
            }
          }
        }
      }
    });
  }

  /**
   * Updates primary role for the given user.
   * @param userName - User name of the user whose primary role need to udpate.
   * @param newRoleName - Primary role need to be assigned.
   */
  async updatePrimaryRole(userName: string, newRoleName: string): Promise<void> {
    await test.step(`Updating role of ${userName} to ${newRoleName} role`, async () => {
      await this.clickOnButtonForUser(userName, MUOptions.UPDATE_PRIMARY_ROLE);
      await this.primaryRoleInputBox.selectOption(newRoleName);
      await this.clickOnButtonWithName('Update');
      await this.verifyToastMessageIsVisibleWithText('Role updated');
    });
  }

  /**
   * Clicks on the filter button.
   */
  async clickOnFilterButton(): Promise<void> {
    await test.step(`Clicking on the filter button`, async () => {
      await this.clickOnElement(this.filterButton);
    });
  }

  /**
   * Verifies the values of primary roles columns.
   * @param value - The value that needs to be verified.
   */
  async verifyPrimaryRoleValues(value: string): Promise<void> {
    await test.step(`Verifying primary role values`, async () => {
      const primaryRoleValues: string[] = [];
      await this.verifyThePageIsLoaded();
      const count = await this.manageUsersPageElements.count();
      for (let i = 0; i < count; i++) {
        primaryRoleValues.push((await this.manageUsersPageElements.nth(i).locator('p').nth(1).textContent()) ?? '');
      }
      expect(primaryRoleValues.every(val => val === value)).toBeTruthy();
    });
  }
}
