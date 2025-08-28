import { ac } from '@faker-js/faker/dist/airline-BUL6NtOJ';
import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export enum ACGFeature {
  ADD_SITES = 'Add_sites',
  MANAGE_SITES = 'Manage_sites',
  ALERTS = 'Alerts',
  NEWSLETTERS = 'Newsletters',
  SURVEYS = 'Surveys',
}

export class AccessControlGroupsPage extends BasePage {
  readonly acgDropdownButton: Locator;
  readonly acgCreateButtonSingle: Locator;
  readonly acgCreateButtonMultiple: Locator;
  readonly acgCreatePopupCloseButton: Locator;
  readonly acgSearchField: Locator;
  readonly acgCheckBoxes: Locator;
  readonly acgAudiencesName: Locator;
  readonly acgMenuOptions: Locator;
  readonly acgDeleteButton: Locator;
  readonly iUnderstand: Locator;
  readonly acgNameInputBox: Locator;
  readonly acgSearchBox: Locator;
  readonly editPopupTitle: Locator;
  readonly editWarningMessage: Locator;
  readonly managersLoseAccessMessage: Locator;
  readonly adminsLoseAccessMessage: Locator;
  readonly contentMoveMessage: Locator;
  readonly analyticsDiscrepanciesMessage: Locator;
  readonly editPopupCrossButton: Locator;
  readonly editPopupCancelButton: Locator;
  readonly editPopupContinueButton: Locator;
  readonly editOption: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.ACCESS_CONTROL_GROUPS_PAGE) {
    super(page, pageUrl);
    this.acgCreatePopupCloseButton = page.getByRole('button', { name: 'Close' });
    this.acgDropdownButton = page.getByRole('button', { name: 'Open menu' });
    this.acgCreateButtonSingle = page.getByRole('button', { name: 'Create' }).nth(1);
    this.acgCreateButtonMultiple = page.getByRole('menuitem', { name: 'Bulk create control groups' });
    this.acgSearchField = page.locator('#search');
    this.acgCheckBoxes = page.locator("[type='checkbox']");
    this.acgAudiencesName = page.locator('[class*="NameWithDescription"] p');
    this.acgMenuOptions = page.locator('[aria-haspopup="menu"]');
    this.acgDeleteButton = page.locator("text='Delete'");
    this.iUnderstand = page.locator('#confirmDelete');
    this.acgNameInputBox = page.locator('[name="controlGroupName"]');
    this.acgSearchBox = page.locator('#q');
    this.editPopupTitle = page.locator('[class*="Typography-module__heading1"]:has-text("Edit access control group")');
    this.editWarningMessage = page.locator(
      '[class*="Typography-module__paragraph"][class*="Typography-module__boldWeight"]:has-text("Editing this access control group may result in the following:")'
    );
    this.managersLoseAccessMessage = page.locator(
      'li:has-text("Managers might lose access to this group or entire feature")'
    );
    this.adminsLoseAccessMessage = page.locator(
      'li:has-text("Admins might lose access to this group or entire feature")'
    );
    this.contentMoveMessage = page.locator('li:has-text("Feature that loses its association")');
    this.analyticsDiscrepanciesMessage = page.locator(
      'li:has-text("There may be discrepancies on any analytics pages")'
    );
    this.editPopupCrossButton = page.locator('[aria-label="Close"]');
    this.editPopupCancelButton = page.getByRole('button', { name: 'Cancel' });
    this.editPopupContinueButton = page.getByRole('button', { name: 'Continue' });
    this.editOption = page.locator("text='Edit'");
  }

  // To verify that the ACG page is loaded
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step(`Verifying the access control groups page is loaded`, async () => {
      await expect(this.acgCreateButtonSingle, `expecting create single ACG button to be visible`).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * To click on Create button for ACG.
   * @param buttonType - (Single/Multiple) To decide the create of single or multiplt ACG.
   * @param options - Optional parameters for clicking on the element.
   */
  async clickOnCreateButtonToInitiateControlGroupCreationFlowFor(createType: 'Single' | 'Multiple'): Promise<void> {
    createType == 'Single'
      ? await this.clickOnElement(this.acgCreateButtonSingle, {
          timeout: 10_000,
          stepInfo: `Click on create single ACG button`,
        })
      : await this.clickOnElement(this.acgCreateButtonMultiple, {
          timeout: 10_000,
          stepInfo: `Click on create multiple ACG button`,
        });
  }

  /**
   * To click on Cross button at the top right corner of ACG creation popup.
   */
  async clickOnCloseButtonForACGCreatePopup(options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? `Click on close button for ACG create popup`, async () => {
      await this.clickOnElement(this.acgCreatePopupCloseButton, {
        timeout: options?.timeout ?? 10_000,
      });
    });
  }

  /**
   * To click on feature button for ACG.
   * @param featureName - The ACG feature to click (e.g., ACGFeature.ALERTS).
   * @param options - Optional parameters for clicking on the element.
   */
  async selectFeatureToAddToControlGroup(
    featureName: ACGFeature,
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<void> {
    await test.step(options?.stepInfo ?? `Click on ${featureName} feature button`, async () => {
      await this.checkElement(this.page.getByLabel(featureName, { exact: true }), {
        timeout: options?.timeout ?? 10_000,
      });
    });
  }

  /**
   * Searches values on audience picker popup.
   * @param searchValue - The value that needs to be searched.
   */
  async searchForValues(searchValue: string): Promise<void> {
    await test.step(`Search for ${searchValue}`, async () => {
      await this.fillInElement(this.acgSearchField, searchValue);
      await this.clickOnButtonWithName('Search');
      await this.acgCheckBoxes.nth(0).waitFor({ timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Clicks on the searched value on audience picker popup.
   * @param audienceValue - The value that needs to be clicked.
   */
  async clickOnAudience(audienceValue: string, options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? `Check ${audienceValue} audience`, async () => {
      await this.clickOnElement(this.acgAudiencesName.filter({ hasText: audienceValue }), {
        timeout: options?.timeout ?? 10_000,
      });
    });
  }

  /**
   * Deletes first ACG in the list at ACG Page
   * @param options - Optional parameters for clicking on the element.
   */
  async deleteFirstACG(options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? `Click on Delete option for first ACG in the list`, async () => {
      await this.clickOnElement(this.acgMenuOptions.first(), {
        stepInfo: 'Click on menu options button for first ACG in the list',
      });
      try {
        await this.clickOnElement(this.acgDeleteButton, {
          stepInfo: 'Click on Delete option for first ACG in the list',
        });
        await this.verifier.verifyTheElementIsVisible(this.iUnderstand, {
          assertionMessage: 'Verify the I understand checkbox is visible',
        });
      } catch (e) {
        console.log("couldn't click the delete button on first try");
        await this.clickOnElementWithCoordinates(this.acgDeleteButton, {
          force: true,
          stepInfo: 'Clicking on the Delete button with coordinates',
        });
      }
    });
    await this.clickOnElement(this.iUnderstand, {
      stepInfo: 'Click on the I understand checkbox',
    });
    await this.clickOnElement(this.acgDeleteButton, {
      stepInfo: 'Click on Delete button on Delete ACG popup',
    });
  }

  /**
   * Gets ACG Name for input box while editing/creating an ACG.
   * @return - ACG Name.
   */
  async getACGName(): Promise<string> {
    return await test.step(`Getting ACG Name`, async () => {
      await expect(this.acgNameInputBox, `expecting ACG name input box to not have value`).not.toHaveValue('');
      return await this.acgNameInputBox.inputValue();
    });
  }

  /**
   * Searches for an ACG by name.
   * This will also wait for the url to contain the acg name as query param
   * @param acgName - Name of the ACG to be searched.
   */
  async searchForACG(acgName: string): Promise<void> {
    await test.step(`Searching for ACG: ${acgName}`, async () => {
      await this.fillInElement(this.acgSearchBox, acgName);
      await this.acgSearchBox.press('Enter');
      //encoded url with acg name as query param
      const expectedEncoded = new URLSearchParams({ q: acgName }).toString();
      const fullUrl = this.pageUrl + '?' + expectedEncoded;
      await expect(this.page).toHaveURL(fullUrl);
    });
  }

  /**
   * Clicks on menu option for any ACG with specific status and group type
   */
  async clickOnMenuOptionForACG(status?: string, groupType?: string): Promise<void> {
    await test.step('Click on menu option for any ACG', async () => {
      await this.clickOnElement(this.acgMenuOptions.first(), {
        stepInfo: 'Click on menu options button for first ACG in the list',
      });
    });
  }

  /**
   * Clicks on Edit option from the dropdown menu
   */
  async clickOnEditOption(): Promise<void> {
    await test.step('Click on Edit option from dropdown menu', async () => {
      try {
        await this.clickOnElement(this.editOption, {
          stepInfo: 'Click on Edit option for ACG',
        });
      } catch (e) {
        await this.clickOnElementWithCoordinates(this.editOption, {
          force: true,
          stepInfo: 'Clicking on the Edit button with coordinates',
        });
      }
    });
  }

  /**
   * Verifies all elements in the edit warning popup
   */
  async verifyEditWarningPopup(): Promise<void> {
    await test.step('Verify all elements in edit warning popup', async () => {
      // Verify popup title
      await expect(this.editPopupTitle).toBeVisible();

      // Verify warning message
      await expect(this.editWarningMessage).toBeVisible();
      await expect(this.managersLoseAccessMessage).toBeVisible();
      await expect(this.adminsLoseAccessMessage).toBeVisible();
      await expect(this.contentMoveMessage).toBeVisible();
      await expect(this.analyticsDiscrepanciesMessage).toBeVisible();

      await expect(this.editPopupCrossButton).toBeVisible();
      await expect(this.editPopupCancelButton).toBeVisible();
      await expect(this.editPopupContinueButton).toBeVisible();
    });
  }

  /**
   * Simple method to search and select user using Enter key
   */
  async searchAndSelectUserWithEnter(searchTerm: string): Promise<void> {
    await test.step(`Search for "${searchTerm}" and select with Enter key`, async () => {
      const searchInput = this.page.locator('[role="combobox"]').first();
      await searchInput.fill(searchTerm);
      await this.page.waitForTimeout(2000);
      await searchInput.press('ArrowDown');
      await this.page.waitForTimeout(500);
      await searchInput.press('Enter');
    });
  }

  /**
   * Clicks on the Edit Manager button
   */
  async clickOnEditManagerButton(): Promise<void> {
    await test.step('Click on Edit Manager button', async () => {
      const editManagerButton = this.page.getByRole('button', { name: 'Edit manager' });
      await this.clickOnElement(editManagerButton);
    });
  }

  /**
   * Clicks on the Add Users button (+ icon)
   */
  async clickOnAddUsersButton(): Promise<void> {
    await test.step('Click on Add Users button', async () => {
      const addUsersButton = this.page.getByRole('button', { name: 'Add users' });
      await this.clickOnElement(addUsersButton);
    });
  }

  /**
   * Clicks on the Update button
   */
  async clickOnUpdateButton(): Promise<void> {
    await test.step('Click on Update button', async () => {
      const updateButton = this.page.getByRole('button', { name: 'Update' });
      await this.clickOnElement(updateButton);
    });
  }

  async verifyAdminUsersInManagerList(): Promise<void> {
    await test.step('Verify admin users in manager list', async () => {
      await this.page.waitForTimeout(2000);

      const selectors = ['[role="dialog"] p:has-text("Admin")', 'text=/Admin.*User/i'];

      let adminElements = this.page.locator(selectors[0]);
      for (const selector of selectors) {
        adminElements = this.page.locator(selector);
        if ((await adminElements.count()) > 0) break;
      }
      const adminCount = await adminElements.count();
      expect(adminCount).toBeGreaterThan(0);
    });
  }
}
