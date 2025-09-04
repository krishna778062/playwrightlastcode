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
  readonly acgStatusToggle: Locator;
  readonly acgRecordsElement: Locator;

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
    this.acgStatusToggle = page.locator('[aria-checked="true"]');
    this.acgRecordsElement = page.locator('[data-testid*="dataGridRow"]');
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
}
