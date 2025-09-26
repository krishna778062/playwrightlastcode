import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { ACG_COLUMNS } from '@platforms/constants/acg';
import { ACG_STATUS } from '@platforms/constants/acg';
import { EditWarningPopupComponent } from '@platforms/ui/components/editWarningPopupComponent';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { changeDateFormatToYYYYMMDD } from '@/src/core/utils/dateUtil';
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

export class AccessControlGroupsPage extends BasePage {
  private acgDefaultStatus: string = 'Active';

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
  readonly editOption: Locator;
  readonly editManagerButton: Locator;
  readonly addUsersButton: Locator;
  readonly updateButton: Locator;
  readonly searchInput: Locator;
  readonly acgStatusToggle: Locator;
  readonly acgRecordsElement: Locator;
  readonly acgEditButton: Locator;
  readonly acgRecords: Locator;
  readonly clearButtonOnSearchInputBox: Locator;
  readonly acgColumns: Locator;

  createACGModal: AccessControlGroupModalComponent;
  editACGModal: AccessControlGroupModalComponent;

  confirmEditACGModal: ConfirmEditAccessControlGroupModalComponent;

  // Component
  readonly editWarningPopup: EditWarningPopupComponent;

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
    this.acgRecordsElement = page.locator('[data-testid*="dataGridRow"]');
    this.createACGModal = new AccessControlGroupModalComponent(page, 'create');
    this.editACGModal = new AccessControlGroupModalComponent(page, 'edit');
    this.acgRecords = page.locator('[data-testid*="dataGridRow"]');
    this.confirmEditACGModal = new ConfirmEditAccessControlGroupModalComponent(page);
    this.clearButtonOnSearchInputBox = page.locator('[aria-label="Clear"]');
    this.acgColumns = page.locator('[class*="Cell-module__isHeader"]');

    // Initialize component
    this.editWarningPopup = new EditWarningPopupComponent(page);
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
      const userNameElement: Locator = this.acgRecordsElement.filter({ hasText: acgName });
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
      // Fill search term
      await this.searchInput.fill(searchTerm);

      // Wait for dropdown options to appear (state-based wait)
      try {
        await this.page.waitForSelector('[role="option"]', {
          state: 'visible',
          timeout: TIMEOUTS.VERY_SHORT,
        });
      } catch {
        // Fallback: wait for any dropdown/listbox to appear
        await this.page.waitForSelector('[role="listbox"], [class*="dropdown"], [class*="menu"]', {
          state: 'visible',
          timeout: TIMEOUTS.VERY_SHORT,
        });
      }

      // Navigate to first option
      await this.searchInput.press('ArrowDown');

      // Wait for option to be highlighted/active (state-based wait)
      try {
        await this.page.waitForSelector(
          '[role="option"][aria-selected="true"], [role="option"].selected, [role="option"]:focus',
          {
            state: 'visible',
            timeout: TIMEOUTS.VERY_VERY_SHORT,
          }
        );
      } catch {
        // Fallback: short wait for dropdown navigation
        await this.page.waitForTimeout(TIMEOUTS.VERY_VERY_SHORT / 4);
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
      // Wait for the dialog to be fully loaded
      await this.page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });

      // Directly target admin elements in the dialog
      const adminElements = this.page.locator('[role="dialog"]').getByText(/Admin/i);

      // Use base verification method with auto-retry and polling mechanism
      await this.verifier.verifyCountOfElementsIsGreaterThan(adminElements, 0, {
        timeout: 10000,
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
      await this.selectFeatureToAddToControlGroup(ACGFeature.ALERTS);
      await this.clickOnButtonWithName(POPUP_BUTTONS.NEXT);
      await this.clickOnButtonWithName(POPUP_BUTTONS.BROWSE);
      await this.searchForValues(targetAudienceName);
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
      await this.dismissTheToastMessage();
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
    const selector: Locator = this.acgColumns.filter({ hasText: columnName });
    let sortingOrder: string | null = null;

    // Ascending order
    await this.clickOnElement(selector.locator('button'));
    await expect(selector.locator('button').locator('i')).toBeVisible();
    //Using try catch to handle the flakiness of element due to which sometimes sortingOrder is returned as null
    try {
      sortingOrder = await selector.locator('button').locator('i').getAttribute('aria-label');
      expect(sortingOrder).not.toBeNull();
    } catch (_e) {
      await test.step(`Waiting for sorting order to be visible`, async () => {
        await this.page.waitForTimeout(1000);
      });
      sortingOrder = await selector.locator('button').locator('i').getAttribute('aria-label');
    }
    await this.veryfySorting(this.acgColumns, columnName, sortingOrder ?? '');

    // Descending order
    await this.clickOnElement(selector.locator('button'));
    await expect(selector.locator('button').locator('i')).toBeVisible();
    //Using try catch to handle the flakiness of element due to which sometimes sortingOrder is returned as null
    try {
      sortingOrder = await selector.locator('button').locator('i').getAttribute('aria-label');
      expect(sortingOrder).not.toBeNull();
    } catch (_e) {
      await test.step(`Waiting for sorting order to be visible`, async () => {
        await this.page.waitForTimeout(1000);
      });
      sortingOrder = await selector.locator('button').locator('i').getAttribute('aria-label');
    }
    await this.veryfySorting(this.acgColumns, columnName, sortingOrder ?? '');
  }

  /**
   * Verifies that the given column has sorted values or not.
   * @param selector - Common locator of the column to be checked for sorting.
   * @param columnName - Name of the column to be checked for sorting.
   * @param sortingOrder - Sorting order to be used for sorting the array(ascending/descending).
   */
  async veryfySorting(selector: Locator, columnName: string, sortingOrder: string): Promise<void> {
    let columnIndex = -1;
    const allTextContents: string[] = [];
    let sortedTextContents: string[] = [];
    for (let i = 0; i < (await selector.count()); i++) {
      if ((await selector.nth(i).textContent()) == columnName) {
        columnIndex = i;
        console.log(await this.acgRecordsElement.locator('td').nth(i).textContent());
        break;
      }
    }
    for (let j = 0; j < (await this.acgRecordsElement.count()); j++) {
      console.log(`columnIndex is ${columnIndex} outside for loop`);
      const textContent =
        columnName === ACG_COLUMNS.NAME
          ? await this.acgRecordsElement.nth(j).locator('td p').nth(columnIndex).textContent()
          : await this.acgRecordsElement.nth(j).locator('td').nth(columnIndex).textContent();
      if (!textContent?.includes('Syncing...')) {
        if (columnName === 'Modified') {
          allTextContents.push(changeDateFormatToYYYYMMDD(textContent ?? ''));
        } else {
          allTextContents.push(textContent ?? '');
        }
      }
    }
    console.log('<<<<<<<<<<<<<<allTextContents>>>>>>>>>>>\n');
    console.log(allTextContents);
    sortedTextContents = await this.sortOntheBasisOfSortOrder(allTextContents, sortingOrder);
    console.log('<<<<<<<<<<<<<<sortedTextContents>>>>>>>>>>>\n');
    console.log(sortedTextContents);
    expect(sortedTextContents).toEqual(allTextContents);
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
}
