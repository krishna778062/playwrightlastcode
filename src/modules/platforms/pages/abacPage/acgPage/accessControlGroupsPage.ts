import { Locator, Page, test, expect } from '@playwright/test';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

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
  readonly acgAlertFeatureButton: Locator;
  readonly acgAddSitesFeatureButton: Locator;
  readonly acgNewslettersFeatureButton: Locator;
  readonly acgManageSitesFeatureButton: Locator;
  readonly acgSurveysFeatureButton: Locator;
  readonly acgSearchField: Locator;
  readonly acgCheckBoxes: Locator;
  readonly acgAudiencesName: Locator;
  readonly acgMenuOptions: Locator;
  readonly acgDeleteButton: Locator;
  readonly toastMessages: Locator;
  readonly iUnderstand: Locator;

  constructor(page: Page) {
    super(page);
    this.acgAddSitesFeatureButton = page.locator('for*="ADD_SITES"');
    this.acgAlertFeatureButton = page.locator('[for*="ALERTS"]');
    this.acgNewslettersFeatureButton = page.locator('[for*="NEWSLETTERS"]');
    this.acgManageSitesFeatureButton = page.locator('[for*="MANAGE_SITES"]');
    this.acgSurveysFeatureButton = page.locator('[for*="SURVEYS"]');
    this.acgCreatePopupCloseButton = page.getByRole('button', { name: 'Close' });
    this.acgDropdownButton = page.getByRole('button', { name: 'Open menu' });
    this.acgCreateButtonSingle = page.getByRole('button', { name: 'Create' }).nth(1);
    this.acgCreateButtonMultiple = page.getByRole('menuitem', { name: 'Bulk create control groups' });
    this.acgSearchField = page.locator('#search');
    this.acgCheckBoxes = page.locator("[type='checkbox']");
    this.acgAudiencesName = page.locator('[class*="NameWithDescription"] p');
    this.acgMenuOptions = page.locator('[aria-haspopup="menu"]');
    this.acgDeleteButton = page.locator("text='Delete'");
    this.toastMessages = page.locator('[class*="Toast-module"] p');
    this.iUnderstand = page.locator('#confirmDelete');
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
  async clickOnCreateButton(buttonType: string, options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? `Click on dropdown button for ACG button`, async () => {
      await this.clickOnElement(this.acgDropdownButton, {
        timeout: options?.timeout ?? 10_000,
      });
    });
    await test.step(options?.stepInfo ?? `Click on create ${buttonType}ACG button`, async () => {
      buttonType == 'Single'
        ? await this.clickOnElement(this.acgCreateButtonSingle, {
            timeout: options?.timeout ?? 10_000,
          })
        : await this.clickOnElement(this.acgCreateButtonMultiple, {
            timeout: options?.timeout ?? 10_000,
          });
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
  async clickFeatureButton(featureName: ACGFeature, options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? `Click on ${featureName} feature button`, async () => {
      let loc: Locator;
      switch (featureName) {
        case ACGFeature.ADD_SITES:
          loc = this.acgAddSitesFeatureButton;
          break;
        case ACGFeature.MANAGE_SITES:
          loc = this.acgManageSitesFeatureButton;
          break;
        case ACGFeature.ALERTS:
          loc = this.acgAlertFeatureButton;
          break;
        case ACGFeature.NEWSLETTERS:
          loc = this.acgNewslettersFeatureButton;
          break;
        case ACGFeature.SURVEYS:
          loc = this.acgSurveysFeatureButton;
          break;
        default:
          throw new Error(`Invalid feature selected: ${featureName}`);
      }
      await this.checkElement(loc, {
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
      await this.acgCheckBoxes.nth(0).waitFor();
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

  // Deletes first ACG in the list at ACG Page
  async deleteFirstACG(options?: { stepInfo?: string; timeout?: number }): Promise<void> {
    await test.step(options?.stepInfo ?? `Click on menu options button for first ACG in the list`, async () => {
      await this.clickOnElement(this.acgMenuOptions.first(), {
        timeout: options?.timeout ?? 10_000,
      });
    });
    await test.step(options?.stepInfo ?? `Click on Delete option for first ACG in the list`, async () => {
      await this.clickOnElement(this.acgDeleteButton, {
        timeout: options?.timeout ?? 10_000,
      });
    });
    await test.step(options?.stepInfo ?? `Check the I understand checkbox on Delete ACG popup`, async () => {
      await this.clickOnElement(this.iUnderstand, {
        timeout: options?.timeout ?? 10_000,
      });
    });
    await test.step(options?.stepInfo ?? `Click on Delete button on Delete ACG popup`, async () => {
      await this.clickOnElement(this.acgDeleteButton, {
        timeout: options?.timeout ?? 10_000,
      });
    });
  }

  /**
   * Waiting for ACG sync confirmation toast message takes like 10-120 seconds to appear after the ACG creation.
   * @param toastMessage - To verify that whether the contents of the toast message contains.
   * @param numberOfAttempts - To define number of tries incase the toast message is not found in first try
   * @param options - Optional parameters for the toast message verification.
   */
  async verifyAcgToastMessage(
    toastMessage: string,
    numberOfAttempts: number,
    options?: { stepInfo?: string; timeout?: number }
  ): Promise<void> {
    await test.step(options?.stepInfo ?? `Verifying ${toastMessage} toast message`, async () => {
      var i: number;
      let count: number = await this.toastMessages.count();
      let flag: boolean = false;
      for (i = 0; i < count; i++) {
        if ((await this.toastMessages.nth(i).textContent()) == toastMessage.trim()) {
          expect(true, 'Toast message found').toBeTruthy();
          flag = true;
          break;
        }
      }
      if (i == count) {
        await this.page.waitForTimeout(2000);
        if (numberOfAttempts > 0 && !flag) {
          await this.verifyAcgToastMessage(toastMessage, numberOfAttempts--);
        } else {
          expect(false, 'Toast message not found').toBeTruthy();
        }
      }
    });
  }
}
