import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { POPUP_BUTTONS } from '@/src/modules/platforms/constants/popupButtons';

export class FeatureOwnerModalComponent extends BaseComponent {
  private featureOwnerModalDialog: Locator;
  private featureOwnerModalTitle: (featureName: string) => Locator;
  private featureOwnerModalTab: (tabName: string) => Locator;
  private searchInputBox: Locator;
  private userPickerRecordsForUsersTab: Locator;
  private appManagerTagForUsersTab: (userName: string) => Locator;
  private selectedUserCheckBoxForUsersTab: (userName: string) => Locator;
  private userPickerRecordsForAssignedTab: Locator;
  private noUserFoundScreen: Locator;

  constructor(page: Page) {
    super(page);
    this.featureOwnerModalDialog = page
      .locator('[class*="athena"]')
      .filter({ has: page.locator('span').filter({ hasText: 'Feature owners' }) });
    this.featureOwnerModalTitle = (featureName: string) =>
      this.featureOwnerModalDialog.locator('h2 span').filter({ hasText: featureName });
    this.featureOwnerModalTab = (tabName: string) =>
      this.featureOwnerModalDialog.locator('[role="tablist"] button').filter({ hasText: tabName });
    this.searchInputBox = this.featureOwnerModalDialog.locator('[class*="SearchField-module-searchField"] input');
    this.userPickerRecordsForUsersTab = this.featureOwnerModalDialog.locator(
      '[class*="UserSelection-module-checkboxContainer"]'
    );
    this.userPickerRecordsForAssignedTab = this.featureOwnerModalDialog.locator('[class*="Spacing-module__row"]');
    this.selectedUserCheckBoxForUsersTab = (userName: string) =>
      this.userPickerRecordsForUsersTab
        .filter({ hasText: userName })
        .locator('[class*="CheckboxInput-module__wrapper"]');
    this.appManagerTagForUsersTab = (userName: string) =>
      this.userPickerRecordsForUsersTab
        .filter({ hasText: userName })
        .locator("[class*='AppManagerLabel-module-itemContainer'] p");
    this.noUserFoundScreen = this.featureOwnerModalDialog
      .locator('[class*="NoResults-module__wrapper"] h3')
      .filter({ hasText: 'No users found' });
  }

  /**
   * Verifies that the feature owner modal is visible.
   * @param featureName - Feature name for which the feature owner modal need to be verified.
   */
  async verifyTheFeatureOwnerModalIsVisible(featureName: string): Promise<boolean> {
    return await this.verifier.verifyTheElementIsVisible(this.featureOwnerModalTitle(featureName));
  }

  /**
   * Clicks on the tab on the feature owner modal.
   * @param tabName - Tab name which need to be clicked on the feature owner modal.
   */
  async ClickOnTab(tabName: string): Promise<void> {
    await this.clickOnElement(this.featureOwnerModalTab(tabName));
  }

  /**
   * Clicks on the close button on the feature owner modal.
   */
  async clickOnCloseButton(): Promise<void> {
    await this.clickOnElement(this.featureOwnerModalDialog.getByRole('button', { name: 'Close' }));
  }

  /**
   * Searches for user under Users/Assigned tab.
   * @param userName - User name which need to be searched for in the feature owner modal.
   */
  async searchForUser(userName: string, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Searching for ${userName}`, async () => {
      const crossButtonForSearchInputBox = this.searchInputBox.locator('[aria-label="Clear"]');
      if (await this.verifier.isTheElementVisible(crossButtonForSearchInputBox, { timeout: 1_000 })) {
        await this.clickOnElement(crossButtonForSearchInputBox);
      }
      await this.fillInElement(this.searchInputBox, userName);
      await this.page.keyboard.press('Enter');
      // To do: Have to optimize and remove the sleep
      await this.sleep(1000);
    });
  }

  /**
   * Checks the check box for the user under Users tab.
   * @param userName - User name which need to be searched for in the feature owner modal.
   */
  async checkTheCheckBoxForUsername(userName: string): Promise<void> {
    await test.step(`Checking the check box for ${userName}`, async () => {
      await this.checkElement(this.selectedUserCheckBoxForUsersTab(userName));
    });
  }

  /**
   * Verifies that the check box for the user under Users tab is checked.
   * @param userName - User name of the user which need to be verified for the checked check box.
   */
  async verifyTheCheckBoxIsCheckedForUsername(userName: string): Promise<boolean> {
    return await test.step(`Verify that the checkbox for ${userName} is checked`, async () => {
      return await this.verifier.verifyCheckboxIsChecked(this.selectedUserCheckBoxForUsersTab(userName));
    });
  }

  /**
   * Finds user and remove the user from feature owners list.
   * @param userName - User who need find in visible list of feature owners.
   * @return true if user is found and removed in list of feature owners, otherwise false.
   */
  async removeUserFromFeatureOwnersList(
    userNames: string[],
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<void> {
    await test.step(options?.stepInfo ?? `Removing ${userNames} from feature owners list`, async () => {
      for (const userName of userNames) {
        await this.searchForUser(userName);
        const RemoveButton = this.userPickerRecordsForAssignedTab
          .filter({ hasText: userName })
          .locator('[class*="SelectedUsers-module-removeUserButton"] button');
        await this.clickOnElement(RemoveButton);
      }
      await this.clickOnButtonWithName(POPUP_BUTTONS.DONE);
    });
  }

  /**
   * Adds different users as feature owner for the feature which has it's edit popup opened.
   * @param userNames - Users who need to be added as feature onwers.
   */
  async addUserAsFeatureOnwer(userNames: string[], options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? `Add users: ${userNames} as feature owners`, async () => {
      for (const userName of userNames) {
        await this.searchForUser(userName);
        await this.checkTheCheckBoxForUsername(userName);
      }
      await this.clickOnButtonWithName(POPUP_BUTTONS.DONE);
    });
  }

  /**
   * Verifies given user is not displayed as feature owner.
   * @param userName - Username of user who need to be checked for feature owner.
   */
  async verifyUserIsNotDisplayedAsFeatureOwner(userName: string): Promise<void> {
    await test.step(`Verifying ${userName} is not displayed in the feature owners list`, async () => {
      await this.searchForUser(userName);
      expect(await this.verifyTheCheckBoxIsCheckedForUsername(userName)).toBe(false);
    });
  }

  /**
   * Verifies whether the given feature onwers are displayed with app manager tag.
   * @param userName - Username of user who need to be checked for app manager tag.
   */
  async verifyFeatureOwnerIsDisplayedWithAppManagerTag(userName: string): Promise<void> {
    await test.step(`Verifying ${userName} is displayed with app manager tag`, async () => {
      await this.searchForUser(userName);
      //verify this record has app manager tag
      await expect(this.appManagerTagForUsersTab(userName)).toBeVisible();
    });
  }

  /**
   * Verifies whether the given no user found screen is displayed.
   * @param userName - Username of user who searching for which the result should be shown as no user found.
   */
  async verifyNoUserFoundScreen(userName: string): Promise<void> {
    await test.step(`Verifying no user found screen when searched for ${userName}`, async () => {
      await this.searchForUser(userName);
      await expect(this.noUserFoundScreen).toBeVisible();
    });
  }
}
