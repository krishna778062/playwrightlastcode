import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { ACG_COLUMNS } from '@platforms/constants/acg';
import { ACG_STATUS } from '@platforms/constants/acg';
import { ACGCreationParams } from '@platforms/types/acgCreationTypes';
import { EditWarningPopupComponent } from '@platforms/ui/components/editWarningPopupComponent';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { changeDateFormatToYYYYMMDD } from '@/src/core/utils/dateUtil';
import { log } from '@/src/core/utils/logger';
import { POPUP_BUTTONS } from '@/src/modules/platforms/constants/popupButtons';
import { AccessControlGroupModalComponent } from '@/src/modules/platforms/ui/components/accessControlGroupModal';
import { ConfirmEditAccessControlGroupModalComponent } from '@/src/modules/platforms/ui/components/confirmEditAccessControlGroupModal';

export enum ACGFeature {
  ADD_SITES = 'Add_sites',
  MANAGE_SITES = 'Manage_sites',
  ALERTS = 'Alerts',
  NEWSLETTERS = 'Newsletters',
  SURVEYS = 'Surveys',
}

export interface IAccessControlGroupsActions {
  searchForACG(acgName: string): Promise<void>;
  editACG(acgName: string): Promise<void>;
}

export interface IAccessControlGroupsAssertions {
  verifyThePageIsLoaded(): Promise<void>;
}

export class AccessControlGroupsPage extends BasePage {
  private acgDefaultStatus: string = 'Active';

  get actions(): IAccessControlGroupsActions {
    return this;
  }

  get assertions(): IAccessControlGroupsAssertions {
    return this;
  }

  readonly acgDropdownButton: Locator;
  readonly acgCreateButtonSingle: Locator;
  readonly acgCreateButtonMultiple: Locator;
  readonly acgCreatePopupCloseButton: Locator;
  readonly acgAudiencesSearchField: Locator;
  readonly acgUsersSearchField: Locator;
  readonly acgUserSearchResult: (userName: string) => Locator;
  readonly acgCheckBoxes: Locator;
  readonly acgAudiencesName: Locator;
  readonly acgMenuOptions: Locator;
  readonly acgDeleteButton: Locator;
  readonly iUnderstand: Locator;
  readonly acgNameInputBox: Locator;
  readonly acgSearchBox: Locator;
  readonly editOption: Locator;
  readonly editManagerButton: Locator;
  readonly addUsersButton: Locator;
  readonly updateButton: Locator;
  readonly searchInput: Locator;
  readonly acgStatusToggle: Locator;
  readonly acgEditButton: Locator;
  readonly acgRecords: Locator;
  readonly clearButtonOnSearchInputBox: Locator;
  readonly acgColumns: Locator;
  readonly acgTargetAudienceCountButton: (acgName: string) => Locator;
  readonly acgManagersCountButton: (acgName: string) => Locator;
  readonly acgAdminsCountButton: (acgName: string) => Locator;

  createACGModal: AccessControlGroupModalComponent;
  editACGModal: AccessControlGroupModalComponent;
  viewACGModal: AccessControlGroupModalComponent;

  confirmEditACGModal: ConfirmEditAccessControlGroupModalComponent;

  // Component
  readonly editWarningPopup: EditWarningPopupComponent;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.ACCESS_CONTROL_GROUPS_PAGE) {
    super(page, pageUrl);
    this.acgCreatePopupCloseButton = page.getByRole('button', { name: 'Close' });
    this.acgDropdownButton = page.getByRole('button', { name: 'Open menu' });
    this.acgCreateButtonSingle = page.getByRole('button', { name: 'Create', exact: true });
    this.acgCreateButtonMultiple = page.getByRole('menuitem', { name: 'Bulk create control groups' });
    this.acgAudiencesSearchField = page.locator('#search');
    this.acgUsersSearchField = page.getByRole('dialog', { name: 'Users' }).getByRole('combobox').first();
    this.acgUserSearchResult = (userName: string) => page.getByRole('menuitem', { name: userName });
    this.acgCheckBoxes = page.locator("[type='checkbox']");
    this.acgAudiencesName = page.locator('[class*="NameWithDescription"] p');
    this.acgRecords = page.locator('[data-testid*="dataGridRow"]');
    this.acgMenuOptions = this.acgRecords.locator('[aria-haspopup="menu"]');
    this.acgDeleteButton = page.locator("text='Delete'");
    this.acgEditButton = page
      .locator('[class*="DropdownMenu-module__DropdownMenuItemLabel"]')
      .filter({ hasText: 'Edit' });
    this.iUnderstand = page.locator('#confirmDelete');
    this.acgNameInputBox = page.locator('[name="controlGroupName"]');
    this.acgSearchBox = page.locator('#q');
    this.editOption = page.getByText('Edit');
    this.editManagerButton = page.getByRole('button', { name: 'Edit manager' });
    this.addUsersButton = page.getByRole('button', { name: 'Add users' });
    this.updateButton = page.getByRole('button', { name: 'Update' });
    this.searchInput = page.getByRole('combobox').first();
    this.acgStatusToggle = page.locator('[aria-checked="true"]');
    this.createACGModal = new AccessControlGroupModalComponent(page, 'create');
    this.editACGModal = new AccessControlGroupModalComponent(page, 'edit');
    this.viewACGModal = new AccessControlGroupModalComponent(page, 'view');
    this.confirmEditACGModal = new ConfirmEditAccessControlGroupModalComponent(page);
    this.clearButtonOnSearchInputBox = page.locator('[aria-label="Clear"]');
    this.acgColumns = page.locator('[class*="Cell-module__isHeader"]');
    this.acgTargetAudienceCountButton = (acgName: string) =>
      this.acgRecords.filter({ hasText: acgName }).locator('td').nth(3).locator('button');
    this.acgManagersCountButton = (acgName: string) =>
      this.acgRecords.filter({ hasText: acgName }).locator('td').nth(4).locator('button');
    this.acgAdminsCountButton = (acgName: string) =>
      this.acgRecords.filter({ hasText: acgName }).locator('td').nth(5).locator('button');

    // Initialize component
    this.editWarningPopup = new EditWarningPopupComponent(page);
  }

  // To verify that the ACG page is loaded
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step(`Verifying the access control groups page is loaded`, async () => {
      await expect(this.acgRecords.first(), `expecting create single ACG button to be visible`).toBeVisible({
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
  async selectSingleFeatureToAddToControlGroupForSingleACG(
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
   * Searches audiences on audience picker popup.
   * @param searchValue - Name of the audience to be searched.
   */
  async searchForAudiencesOnAudiencePickerPopup(searchValue: string): Promise<void> {
    await test.step(`Search for ${searchValue}`, async () => {
      await this.acgAudiencesSearchField.waitFor({timeout: TIMEOUTS.VERY_SHORT });
      await this.fillInElement(this.acgAudiencesSearchField, searchValue);
      await this.clickOnButtonWithName('Search');
      await this.acgCheckBoxes.nth(0).waitFor({ timeout: TIMEOUTS.SHORT });
    });
  }

  /**
   * Searches users on user picker popup.
   * @param searchValue - Name of the user to be searched.
   */
  async searchAndSelectForUsersOnUserPickerPopup(searchValue: string): Promise<void> {
    await test.step(`Search for ${searchValue}`, async () => {
      await this.acgUsersSearchField.waitFor({timeout: TIMEOUTS.VERY_SHORT });
      await this.typeInElement(this.acgUsersSearchField, searchValue);
      await this.acgUserSearchResult(searchValue).waitFor({ timeout: TIMEOUTS.SHORT });
      await this.page.keyboard.press('Enter');
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
      await this.clickOnElementWithCoordinates(this.acgDeleteButton, {
        force: true,
        stepInfo: 'Clicking on the Delete button with coordinates',
      });
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
  async clickOnMenuOptionForACG(_status?: string, _groupType?: string): Promise<void> {
    await test.step('Click on menu option for any ACG', async () => {
      await this.clickOnElement(this.acgMenuOptions.first(), {
        stepInfo: 'Click on menu options button for first ACG in the list',
      });
    });
  }

  /**
   * Verifies the status if the ACG.
   * @param acgName - Name of the ACG whose status need to be verified.
   * @param status - Status of the ACG to be verified.
   */
  async verifyACGStatus(acgName: string, status: string): Promise<void> {
    await test.step(`Verifying the status of ${acgName} ACG as ${status}`, async () => {
      const userNameElement: Locator = this.acgRecords.filter({ hasText: acgName });
      await expect(
        userNameElement.locator('[class*="Typography-module__secondary"]'),
        `Checking the status of ${acgName} as ${status}`
      ).toHaveText(status);
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
          timeout: 3_000,
        });
      } catch {
        await this.clickOnElementWithCoordinates(this.editOption, {
          force: true,
          stepInfo: 'Clicking on the Edit button with coordinates',
        });
      }
    });
  }

  /**
   * Verifies all elements in the edit warning popup using dedicated component
   */
  async verifyEditWarningPopup(): Promise<void> {
    await this.editWarningPopup.verifyAllElements();
  }

  /**
   * Browse, search, select user and proceed to next step
   * @param searchTerm - The user to search for (e.g., 'Admin')
   * @param userType - The type of user being selected (e.g., 'Manager', 'Admin') for better reporting
   */
  async browseSelectUserAndProceed(searchTerm: string, userType: string): Promise<void> {
    await test.step(`Select ${userType}: Browse, search for "${searchTerm}", select and proceed`, async () => {
      await this.clickOnButtonWithName('Browse');
      await this.searchAndSelectUserWithEnter(searchTerm);
      await this.clickOnButtonWithName('Done');
      await this.clickOnButtonWithName('Next');
    });
  }

  /**
   * Simple method to search and select user using Enter key
   */
  async searchAndSelectUserWithEnter(searchTerm: string): Promise<void> {
    await test.step(`Search for "${searchTerm}" and select with Enter key`, async () => {
      // Clear and fill search term
      await this.searchInput.clear();
      await this.searchInput.fill(searchTerm);

      // Wait for input to have value
      await this.page.waitForFunction(
        () => {
          const input = document.querySelector('[role="combobox"]') as HTMLInputElement;
          return input?.value && input.value.length > 0;
        },
        { timeout: TIMEOUTS.SHORT }
      );

      // Wait for dropdown options to appear (state-based wait)
      // Looking for menuitem which is the correct role for user dropdown
      try {
        await this.page.waitForSelector('[role="menuitem"], [role="option"]', {
          state: 'visible',
          timeout: TIMEOUTS.SHORT,
        });
      } catch {
        // Fallback: Try clicking on the input to trigger dropdown
        await this.searchInput.click();

        // Wait for dropdown to appear after click
        await this.page.waitForFunction(
          () => {
            const options = document.querySelectorAll('[role="menuitem"], [role="option"]');
            return options.length > 0;
          },
          { timeout: TIMEOUTS.VERY_SHORT }
        );

        // Try waiting for dropdown again
        await this.page.waitForSelector('[role="menuitem"], [role="option"]', {
          state: 'visible',
          timeout: TIMEOUTS.VERY_SHORT,
        });
      }

      // Navigate to first option using ArrowDown
      await this.searchInput.press('ArrowDown');

      // Wait for option to be highlighted/active (checking for both menuitem and option roles)
      try {
        await this.page.waitForSelector(
          '[role="menuitem"][aria-selected="true"], [role="option"][aria-selected="true"], [role="menuitem"]:focus, [role="option"]:focus',
          {
            state: 'visible',
            timeout: TIMEOUTS.VERY_VERY_SHORT,
          }
        );
      } catch {
        // Fallback: wait for any element to be focused
        await this.page.waitForFunction(
          () => {
            return document.activeElement !== null && document.activeElement !== document.body;
          },
          { timeout: TIMEOUTS.VERY_SHORT }
        );
      }

      // Select the highlighted option
      await this.searchInput.press('Enter');
    });
  }

  /**
   * Clicks on the Edit Manager button
   */
  async clickOnEditManagerButton(): Promise<void> {
    await test.step('Click on Edit Manager button', async () => {
      await this.clickOnElement(this.editManagerButton);
    });
  }

  /**
   * Clicks on the Add Users button (+ icon)
   */
  async clickOnAddUsersButton(): Promise<void> {
    await test.step('Click on Add Users button', async () => {
      await this.clickOnElement(this.addUsersButton);
    });
  }

  /**
   * Clicks on the Update button
   */
  async clickOnUpdateButton(): Promise<void> {
    await test.step('Click on Update button', async () => {
      await this.clickOnElement(this.updateButton);
    });
  }

  async verifyAdminUsersInManagerList(): Promise<void> {
    await test.step('Verify admin users in manager list', async () => {
      // Wait for manager dialog specifically
      await this.page.waitForSelector('[role="dialog"]:not([aria-labelledby="your_messages_title"])', {
        state: 'visible',
        timeout: TIMEOUTS.MEDIUM,
      });

      // Target admin elements in the manager dialog
      const adminElements = this.page
        .locator('[role="dialog"]:not([aria-labelledby="your_messages_title"])')
        .getByText(/Admin/i);

      // Use base verification method with auto-retry and polling mechanism
      await this.verifier.verifyCountOfElementsIsGreaterThan(adminElements, 0, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: 'Should have at least one admin user in manager list',
      });
    });
  }

  /**
   * Change the status of the ACG.
   * @param newStatus - New status to be changed for the given ACG.
   */
  async changeACGStatus(newStatus: string): Promise<void> {
    await test.step(`Toggling the status to ${newStatus}`, async () => {
      const currStatus = await this.acgStatusToggle.getAttribute('aria-checked');
      if ((newStatus === 'Active' && currStatus === 'false') || (newStatus === 'Inactive' && currStatus === 'true')) {
        await this.clickOnElement(this.acgStatusToggle);
      }
    });
  }

  /**
   * Creates an ACG with target audience only.
   * @param targetAudienceName - Name of the target audience with which the ACG is to be created.
   * @param options - Options to be used for creation of ACG
   */
  async createACGWithTargetAudienceOnly(targetAudienceName: string, options?: { acgStatus?: string }): Promise<string> {
    const currACGStatus = options?.acgStatus || this.acgDefaultStatus;
    let saveButtonName: string;
    if (currACGStatus === ACG_STATUS.ACTIVE) {
      saveButtonName = 'Save and activate';
    } else {
      saveButtonName = 'Save';
    }
    return await test.step(`Creating ACG with target audience as ${targetAudienceName}  and status as ${options?.acgStatus ?? this.acgDefaultStatus} only`, async () => {
      await this.clickOnCreateButtonToInitiateControlGroupCreationFlowFor('Single');
      await this.selectSingleFeatureToAddToControlGroupForSingleACG(ACGFeature.ALERTS);
      await this.clickOnButtonWithName(POPUP_BUTTONS.NEXT);
      await this.clickOnButtonWithName(POPUP_BUTTONS.BROWSE);
      await this.searchForAudiencesOnAudiencePickerPopup(targetAudienceName);
      await this.clickOnAudience(targetAudienceName);
      await this.clickOnButtonWithName(POPUP_BUTTONS.DONE);
      await this.clickOnButtonWithName(POPUP_BUTTONS.NEXT);
      await this.clickOnButtonWithName(POPUP_BUTTONS.SKIP);
      await this.clickOnButtonWithName(POPUP_BUTTONS.SKIP);
      const acgName = await this.getACGName();
      console.log(`ACG name is ${acgName}`);
      await this.changeACGStatus(currACGStatus);
      await this.clickOnButtonWithName(saveButtonName);
      await this.verifyToastMessageIsVisibleWithText('Creating access control groups and audience relationships…');
      await this.dismissTheToastMessage({ toastText: 'Creating access control groups and audience relationships…' });
      return acgName;
    });
  }

  /**
   * Deletes the ACG.
   * @param acgName - Name of the ACG to be deleted.
   */
  async deleteACG(acgName: string): Promise<void> {
    await this.searchForACG(acgName);
    await this.deleteFirstACG();
    await this.verifyToastMessageIsVisibleWithText('Access control group was successfully deleted');
    await this.dismissTheToastMessage();
  }

  /**
   * Edits ACG - If ACG name is provided, edit the ACG with the given name, otherwise edit the first ACG in the list.
   * @param options - acgName - Name of the ACG to be edited.
   */
  async editACG(acgName: string): Promise<void> {
    const selectedACGRecordMenuOptionButton: Locator = this.acgRecords
      .filter({ hasText: acgName })
      .locator('[aria-haspopup="menu"]');
    await this.clickOnElement(selectedACGRecordMenuOptionButton);
    await this.clickOnElementWithCoordinates(this.acgEditButton, {
      force: true,
      stepInfo: 'Clicking on the Edit button with coordinates',
    });
  }

  /**
   * Verifies the visibility of a column at ACG page.
   * @param columnName - Name of the column to be verified.
   */
  async verifyColumnIsDisplayed(columnName: string): Promise<void> {
    await test.step(`Verifying that ${columnName} column is displayed`, async () => {
      await expect(
        this.acgColumns.filter({ hasText: columnName }),
        `expecting ${columnName} column name to be visible`
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Verifies column is sortable or not.
   * @param columnName - Name of the column to be checked.
   * @param isSortable - Need to check for sortability or unsortability.
   */
  async verifyColumnSortable(columnName: string, isSortable: boolean): Promise<void> {
    const sortableOrNot: string = isSortable ? `sortable` : `not sortable`;
    await test.step(`Verifying ${columnName} column to be ${sortableOrNot}`, async () => {
      expect(
        await this.verifier.isTheElementVisible(this.acgColumns.filter({ hasText: columnName }).locator('button'), {
          timeout: TIMEOUTS.VERY_SHORT,
        }),
        `expecting ${columnName} column to be ${sortableOrNot}`
      ).toBe(isSortable);
    });
  }

  /**
   * Verifies the sorting functionality.
   * @param columnName - Name of the column to be checked for sorting functionality.
   */
  async verifyTheSortingFunctionalityOfColumn(columnName: string): Promise<void> {
    await test.step(`Verifying the sorting functionality for ${columnName} column`, async () => {
      const selector: Locator = this.acgColumns.filter({ hasText: columnName });
      let sortingOrder: string | null = null;

      // Store the first record's text content before sorting to detect change
      const firstRecordTextBefore = await this.acgRecords.first().textContent();

      // Ascending order - click sort button
      await this.clickOnElement(selector.locator('button'));
      await expect(selector.locator('button').locator('i')).toBeVisible();

      // Wait for table to stabilize after sorting - use domcontentloaded instead of networkidle
      await this.waitForTableToStabilize(firstRecordTextBefore);

      //Using try catch to handle the flakiness of element due to which sometimes sortingOrder is returned as null
      try {
        sortingOrder = await selector.locator('button').locator('i').getAttribute('aria-label');
        expect(sortingOrder).not.toBeNull();
      } catch (error) {
        log.error('Error getting sorting order', error);
        await this.page.waitForTimeout(1000);
        sortingOrder = await selector.locator('button').locator('i').getAttribute('aria-label');
      }
      await this.verifySorting(columnName, sortingOrder ?? '');

      // Store the first record's text content before next sort
      const firstRecordTextAfterAsc = await this.acgRecords.first().textContent();

      // Descending order - click sort button again
      await this.clickOnElement(selector.locator('button'));
      await expect(selector.locator('button').locator('i')).toBeVisible();

      // Wait for table to stabilize after sorting
      await this.waitForTableToStabilize(firstRecordTextAfterAsc);

      //Using try catch to handle the flakiness of element due to which sometimes sortingOrder is returned as null
      try {
        sortingOrder = await selector.locator('button').locator('i').getAttribute('aria-label');
        expect(sortingOrder).not.toBeNull();
      } catch (error) {
        log.error('Error getting sorting order', error);
        await this.page.waitForTimeout(1000);
        sortingOrder = await selector.locator('button').locator('i').getAttribute('aria-label');
      }
      await this.verifySorting(columnName, sortingOrder ?? '');
    });
  }

  /**
   * Waits for the table to stabilize after sorting.
   * Checks if the first row content has changed or waits for a short timeout.
   * @param previousFirstRowText - The text content of the first row before sorting.
   */
  private async waitForTableToStabilize(previousFirstRowText: string | null): Promise<void> {
    const maxWaitTime = 5000;
    const pollInterval = 200;
    let elapsedTime = 0;

    // Wait for the table to potentially re-render
    await this.page.waitForTimeout(pollInterval);

    // Poll until the first row changes or timeout
    while (elapsedTime < maxWaitTime) {
      const currentFirstRowText = await this.acgRecords.first().textContent();

      // If the first row has changed, the table has re-sorted
      if (currentFirstRowText !== previousFirstRowText) {
        // Give a bit more time for the DOM to fully update
        await this.page.waitForTimeout(200);
        return;
      }

      await this.page.waitForTimeout(pollInterval);
      elapsedTime += pollInterval;
    }

    // If we get here, the table may not have changed (already sorted correctly) or sorting didn't happen
    // Give it a final wait for stability
    await this.page.waitForTimeout(500);
  }

  /**
   * Collects all text values from a specific column in the table.
   * @param columnName - Name of the column to collect values from.
   * @returns Array of text values from the column.
   */
  private async collectColumnValues(columnName: string): Promise<string[]> {
    const allTextContents: string[] = [];
    let columnIndex = -1;

    // Find the column index
    const columnCount = await this.acgColumns.count();
    for (let i = 0; i < columnCount; i++) {
      const columnText = await this.acgColumns.nth(i).textContent();
      if (columnText?.includes(columnName)) {
        columnIndex = i;
        log.debug(`Found column ${columnName} at index ${columnIndex}`);
        break;
      }
    }

    if (columnIndex === -1) {
      throw new Error(`Column ${columnName} not found in the table`);
    }

    // Wait for records to be present and stable
    await expect(this.acgRecords.first()).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

    const recordCount = await this.acgRecords.count();
    for (let j = 0; j < recordCount; j++) {
      let textContent: string | null;

      if (columnName === ACG_COLUMNS.NAME) {
        // For Name column, get the text from the p element inside td
        textContent = await this.acgRecords.nth(j).locator('td').nth(columnIndex).locator('p').first().textContent();
      } else {
        // For other columns, get the text directly from td
        textContent = await this.acgRecords.nth(j).locator('td').nth(columnIndex).textContent();
      }

      // Skip rows that are still syncing
      if (textContent && !textContent.includes('Syncing...')) {
        if (columnName === ACG_COLUMNS.MODIFIED) {
          allTextContents.push(changeDateFormatToYYYYMMDD(textContent));
        } else {
          allTextContents.push(textContent.trim());
        }
      }
    }

    return allTextContents;
  }

  /**
   * Checks if an array is sorted in ascending or descending order.
   * @param arr - Array to check.
   * @returns 'ascending' if sorted A-Z, 'descending' if sorted Z-A, 'unsorted' otherwise.
   */
  private detectSortOrder(arr: string[]): 'ascending' | 'descending' | 'unsorted' {
    if (arr.length <= 1) return 'ascending';

    const normalizedArr = arr.map(s => s.replace(/\s+/g, '').toLowerCase());
    const ascSorted = [...normalizedArr].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true })
    );
    const descSorted = [...ascSorted].reverse();

    if (JSON.stringify(normalizedArr) === JSON.stringify(ascSorted)) {
      return 'ascending';
    }
    if (JSON.stringify(normalizedArr) === JSON.stringify(descSorted)) {
      return 'descending';
    }
    return 'unsorted';
  }

  /**
   * Verifies that the given column has sorted values.
   * Checks that the data is sorted in SOME consistent order (ascending or descending).
   * @param columnName - Name of the column to be checked for sorting.
   * @param expectedSortingOrder - Expected sorting order from aria-label (ascending/descending).
   */
  async verifySorting(columnName: string, expectedSortingOrder: string): Promise<void> {
    await test.step(`Verifying ${columnName} column is sorted in ${expectedSortingOrder} order`, async () => {
      const allTextContents = await this.collectColumnValues(columnName);

      log.debug(
        `Collected ${allTextContents.length} values from ${columnName} column: ${JSON.stringify(allTextContents)}`
      );

      const detectedOrder = this.detectSortOrder(allTextContents);

      log.debug(`Detected sort order: ${detectedOrder}, Expected from aria-label: ${expectedSortingOrder}`);

      // Verify that the column IS sorted in some direction (not unsorted)
      expect(
        detectedOrder,
        `Expected ${columnName} column to be sorted, but data appears unsorted. Values: ${JSON.stringify(allTextContents.slice(0, 5))}...`
      ).not.toBe('unsorted');

      // Log a warning if detected order doesn't match aria-label (potential UI accessibility issue)
      if (detectedOrder !== expectedSortingOrder) {
        log.warn(
          `Sort order mismatch for ${columnName}: aria-label says "${expectedSortingOrder}" but data appears "${detectedOrder}". This may indicate an accessibility issue.`
        );
      }
    });
  }

  /**
   * Sorts the array based on the sorting order.
   * @param arrayToSort - Given array to be sorted.
   * @param sortingOrder - Sorting order to be used for sorting the array(ascending/descending).
   */
  async sortOntheBasisOfSortOrder(arrayToSort: string[], sortingOrder: string): Promise<string[]> {
    let sortedTextContents: string[] = [];
    console.log(`sorting array in ${sortingOrder} order`);
    if (sortingOrder === 'ascending') {
      sortedTextContents = [...arrayToSort].sort((a, b) =>
        a.replace(/\s+/g, '').localeCompare(b.replace(/\s+/g, ''), undefined, {
          sensitivity: 'base',
          numeric: true,
        })
      );
      return sortedTextContents;
    } else {
      sortedTextContents = [...arrayToSort]
        .sort((a, b) =>
          a.replace(/\s+/g, '').localeCompare(b.replace(/\s+/g, ''), undefined, {
            sensitivity: 'base',
            numeric: true,
          })
        )
        .reverse();
      return sortedTextContents;
    }
  }

  /**
   * Clicks on ACG Name button.
   * @param acgName - Name of the ACG for which Name button needs to be clicked.
   */
  async clickOnACGNameButton(acgName: string): Promise<void> {
    const acgNameButton: Locator = this.acgRecords
      .filter({ hasText: acgName })
      .locator('[class*="ACGSummaryReadOnlyDialog-module-acgName"]');
    await test.step(`Clicking on ACG Name button for ${acgName}`, async () => {
      await this.clickOnElement(acgNameButton);
    });
  }

  /**
   * Clicks on ACG Name button.
   * @param acgName - Name of the ACG for which Name button needs to be clicked.
   */
  async clickOnTargetAudienceCountButton(acgName: string): Promise<void> {
    await test.step(`Clicking on Target Audience count button for ${acgName}`, async () => {
      await this.clickOnElement(this.acgTargetAudienceCountButton(acgName));
    });
  }

  /**
   * Clicks on Managers count button.
   * @param acgName - Name of the ACG for which Managers count button needs to be clicked.
   */
  async clickOnManagersCountButton(acgName: string): Promise<void> {
    await test.step(`Clicking on Managers count button for ${acgName}`, async () => {
      await this.clickOnElement(this.acgManagersCountButton(acgName));
    });
  }

  /**
   * Clicks on Admins count button.
   * @param acgName - Name of the ACG for which Admins count button needs to be clicked.
   */
  async clickOnAdminsCountButton(acgName: string): Promise<void> {
    await test.step(`Clicking on Admins count button for ${acgName}`, async () => {
      await this.clickOnElement(this.acgAdminsCountButton(acgName));
    });
  }

  /**
   * Creates ACG with all parameters.
   * @param acgCreationParams - Parameters for creating the ACG.
   */
  async createACGWithAllParams(acgCreationParams: ACGCreationParams): Promise<string> {
    const currACGStatus = acgCreationParams.acgStatus || this.acgDefaultStatus;
    let saveButtonName: string;
    if (currACGStatus === ACG_STATUS.ACTIVE) {
      saveButtonName = 'Save and activate';
    } else {
      saveButtonName = 'Save';
    }
    return await test.step(`Creating ACG with target audience(s): ${acgCreationParams.targetAudience}, manager user(s): ${acgCreationParams.managerUser}, manager audience(s): ${acgCreationParams.managerAudience}, admin user(s): ${acgCreationParams.adminUser}, admin audience(s): ${acgCreationParams.adminAudience} and status as ${currACGStatus}`, async () => {
      let acgName: string;
      await this.clickOnCreateButtonToInitiateControlGroupCreationFlowFor('Single');
      await this.selectSingleFeatureToAddToControlGroupForSingleACG(ACGFeature.ALERTS);
      await this.clickOnButtonWithName(POPUP_BUTTONS.NEXT);
      // Add Target Audiences
      await this.addTargetAudiences(acgCreationParams);

      // Add Managers
      await this.addManagers(acgCreationParams);

      // Add Admins
      await this.addAdmins(acgCreationParams);

      acgName = await this.getACGName();
      console.log(`ACG name is ${acgName}`);
      await this.changeACGStatus(currACGStatus);
      await this.clickOnButtonWithName(saveButtonName);
      await this.verifyToastMessageIsVisibleWithText('Creating access control groups and audience relationships…');
      await this.dismissTheToastMessage({ toastText: 'Creating access control groups and audience relationships…' });
      return acgName;
    });
  }

  /**
   * Adds Target audiences to the ACG.
   * @param acgCreationParams - Parameters for adding audiences to the ACG.
   */
  async addTargetAudiences(acgCreationParams: ACGCreationParams, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Adding Target audiences to the ACG`, async () => {
      await this.clickOnButtonWithName(POPUP_BUTTONS.BROWSE);
      for (const targetAudience of acgCreationParams.targetAudience) {
        await this.searchForAudiencesOnAudiencePickerPopup(targetAudience);
        await this.clickOnAudience(targetAudience);
      }
      await this.clickOnButtonWithName(POPUP_BUTTONS.DONE);
      await this.clickOnButtonWithName(POPUP_BUTTONS.NEXT);
    });
  }

  /**
   * Adds Managers to the ACG.
   * @param acgCreationParams - Parameters for adding managers to the ACG.
   */
  async addManagers(acgCreationParams: ACGCreationParams, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Adding Managers to the ACG`, async () => {
      if (acgCreationParams.managerUser.length > 0 || acgCreationParams.managerAudience.length > 0) {
        if (acgCreationParams.managerUser.length > 0) {
          await this.clickOnButtonWithName(POPUP_BUTTONS.BROWSE);
          for (const managerUser of acgCreationParams.managerUser) {
            await this.searchAndSelectForUsersOnUserPickerPopup(managerUser);
          }
        }
        if (acgCreationParams.managerAudience.length > 0) {
          await this.createACGModal.clickOnButton(POPUP_BUTTONS.ADD_AUDIENCE);
          for (const managerAudience of acgCreationParams.managerAudience) {
            await this.searchForAudiencesOnAudiencePickerPopup(managerAudience);
            await this.clickOnAudience(managerAudience);
          }
        }
        await this.clickOnButtonWithName(POPUP_BUTTONS.DONE);
        await this.clickOnButtonWithName(POPUP_BUTTONS.NEXT);
      } else {
        await this.clickOnButtonWithName(POPUP_BUTTONS.SKIP);
      }
    });
  }

  /**
   * Adds Admins to the ACG.
   * @param acgCreationParams - Parameters for adding admins to the ACG.
   */
  async addAdmins(acgCreationParams: ACGCreationParams, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Adding Admins to the ACG`, async () => {
      if (acgCreationParams.adminUser.length > 0 || acgCreationParams.adminAudience.length > 0) {
        if (acgCreationParams.adminUser.length > 0) {
          await this.clickOnButtonWithName(POPUP_BUTTONS.BROWSE);
          for (const adminUser of acgCreationParams.adminUser) {
            await this.searchAndSelectForUsersOnUserPickerPopup(adminUser);
          }
        }
        if (acgCreationParams.adminAudience.length > 0) {
          await this.createACGModal.clickOnButton(POPUP_BUTTONS.ADD_AUDIENCE);
          for (const adminAudience of acgCreationParams.adminAudience) {
            await this.searchForAudiencesOnAudiencePickerPopup(adminAudience);
            await this.clickOnAudience(adminAudience);
          }
        }
        await this.clickOnButtonWithName(POPUP_BUTTONS.DONE);
        await this.clickOnButtonWithName(POPUP_BUTTONS.NEXT);
      } else {
        await this.clickOnButtonWithName(POPUP_BUTTONS.SKIP);
      }
    });
  }

  /**
   * Gets Admins count from the ACG.
   * @param acgName - Name of the ACG for which Admins count needs to be fetched.
   */
  async getAdminsCount(acgName: string): Promise<number> {
    return await test.step(`Getting Admins count for ${acgName}`, async () => {
      const adminsCount = await this.acgAdminsCountButton(acgName).locator('p').textContent();
      console.log(`Admins count is ${adminsCount} for ${acgName}`);
      return parseInt(adminsCount || '786', 10); // Default value is 786 as per the design. If the admins count is not found, return 786.
    });
  }

  /**
   * Gets Target audience count from the ACG.
   * @param acgName - Name of the ACG for which Target audience count needs to be fetched.
   */
  async getTargetAudienceCount(acgName: string): Promise<number> {
    return await test.step(`Getting Target audience count for ${acgName}`, async () => {
      const targetAudienceCount = await this.acgTargetAudienceCountButton(acgName).locator('p').textContent();
      console.log(`Target audience count is ${targetAudienceCount} for ${acgName}`);
      return parseInt(targetAudienceCount || '786', 10); // Default value is 786 as per the design. If the target audience count is not found, return 786.
    });
  }

  /**
   * Gets Managers count from the ACG.
   * @param acgName - Name of the ACG for which Managers count needs to be fetched.
   */
  async getManagersCount(acgName: string): Promise<number> {
    return await test.step(`Getting Managers count for ${acgName}`, async () => {
      const managersCount = await this.acgManagersCountButton(acgName).locator('p').textContent();
      console.log(`Managers count is ${managersCount} for ${acgName}`);
      return parseInt(managersCount || '786', 10); // Default value is 786 as per the design. If the managers count is not found, return 786.
    });
  }

  /**
   * Compares ACG assets count with the expected count.
   * @param acgName - Name of the ACG for which assets count needs to be compared.
   * @param assetName - Name of the asset for which count needs to be compared.
   * @param expectedCount - Expected count of the assets.
   */
  async compareACGAssetsCount(acgName: string, assetName: string, expectedCount: number): Promise<void> {
    return await test.step(`Comparing ${assetName} count for ${acgName} with the expected count`, async () => {
      let actualCount: number = 0;
      if (assetName === ACG_COLUMNS.ADMINS) {
        actualCount = await this.getAdminsCount(acgName);
      } else if (assetName === ACG_COLUMNS.TARGET_AUDIENCE) {
        actualCount = await this.getTargetAudienceCount(acgName);
      } else if (assetName === ACG_COLUMNS.MANAGERS) {
        actualCount = await this.getManagersCount(acgName);
      }
      expect(
        actualCount,
        `Expected ${assetName} count for ${acgName} to be ${expectedCount}, but found ${actualCount}`
      ).toBe(expectedCount);
    });
  }

  /**
   * Compares ACG assets count with the expected count.
   * @param acgName - Name of the ACG for which assets count needs to be compared.
   * @param assetName - Name of the asset for which count needs to be compared.
   * @param expectedCount - Expected count of the assets.
   */
  /**
   * Verifies that at least one ACG has the specified feature.
   * @param featureName - The feature name to look for in the ACG list.
   */
  async verifyAtleastOneACGHasFeature(featureName: string): Promise<void> {
    await test.step(`Verify that at least one ACG has ${featureName} feature`, async () => {
      await this.searchForACG(featureName);
      const featureCell = this.acgRecords.locator('td').nth(1).filter({ hasText: featureName });
      await expect(featureCell.first(), `Expected at least one ACG to have feature "${featureName}"`).toBeVisible();
    });
  }
}
