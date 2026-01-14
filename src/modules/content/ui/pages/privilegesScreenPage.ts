import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';
import { ProtectedAuthorsComponent } from '@/src/modules/content/ui/components/protectedAuthorComponent';

export class PrivilegesScreenPage extends BasePage {
  private protectedAuthorsComponent: ProtectedAuthorsComponent;
  readonly clickOnSaveButton: Locator;
  readonly changesConfirmation: Locator;
  readonly mustReadChangesConfirmation: (text: string) => Locator;
  readonly alertChangesConfirmation: (text: string) => Locator;
  readonly alertInputBox: Locator;
  readonly alertInputBoxList: (text: string) => Locator;
  readonly mustReadInputBox: Locator;
  readonly mustReadInputBoxList: (text: string) => Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.PRIVILEGES_SCREEN);
    this.protectedAuthorsComponent = new ProtectedAuthorsComponent(page);

    // Initialize locators
    this.clickOnSaveButton = this.page.getByRole('button', { name: 'Save' });
    this.changesConfirmation = this.page.getByText('Saved changes successfully');
    this.mustReadChangesConfirmation = (text: string) => this.page.getByText(text).first();
    this.alertChangesConfirmation = (text: string) => this.page.getByText(text).nth(1);
    this.alertInputBox = this.page
      .locator('label[for="alertsControlSite"]')
      .locator('..')
      .locator('input.ReactSelectInput-inputField');
    this.alertInputBoxList = (text: string) => this.page.locator('a').filter({ hasText: text });
    this.mustReadInputBox = this.page
      .locator('label[for="mustReadsControlSite"]')
      .locator('..')
      .locator('input.ReactSelectInput-inputField');
    this.mustReadInputBoxList = (text: string) => this.page.locator('a').filter({ hasText: text });
  }
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify governance page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.protectedAuthorsComponent.protectedAuthors, {
        assertionMessage: 'Privileges page should be visible',
      });
    });
  }

  async verifyProtectedAuthorsAuthorsFieldBarIsVisible(): Promise<void> {
    await this.protectedAuthorsComponent.verifyProtectedAuthorsAuthorsFieldBarIsVisible();
  }

  async verifyProtectedAuthorsAllowlistFieldBarIsVisible(): Promise<void> {
    await this.protectedAuthorsComponent.verifyProtectedAuthorsAllowlistFieldBarIsVisible();
  }

  async fillProtectedAuthorsAuthorsFieldBarWithLoggedInUser(value: string): Promise<void> {
    await this.protectedAuthorsComponent.fillProtectedAuthorsAuthorsFieldBarWithLoggedInUser(value);
  }

  async fillProtectedAuthorsAllowlistFieldBarWithLoggedInUser(value: string): Promise<void> {
    await this.protectedAuthorsComponent.fillProtectedAuthorsAllowlistFieldBarWithLoggedInUser(value);
  }

  async clickOnSave(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.clickOnSaveButton);
    });
  }

  async verifyTheChangesConfirmationToastMessageIsVisible(): Promise<void> {
    const baseActionUtil = new BaseActionUtil(this.page);
    await baseActionUtil.verifyToastMessageIsVisibleWithText('Saved changes successfully', {
      stepInfo: 'Verify the changes confirmation toast message is visible',
    });
  }

  async clickOnCrossUserFromAuthorList(): Promise<void> {
    await this.protectedAuthorsComponent.clickOnCrossUser();
  }

  async clickOnCrossAllowlistUser(): Promise<void> {
    await this.protectedAuthorsComponent.clickOnCrossUser();
  }

  async reloadScreen(): Promise<void> {
    await test.step('Reload the privileges screen', async () => {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.page.waitForLoadState('domcontentloaded');
    });
  }
  async alertInputBoxFillWithText(text: string): Promise<void> {
    await test.step(`Fill alert input box with text: ${text}`, async () => {
      await this.clickOnElement(this.alertInputBox);
      await this.fillInElement(this.alertInputBox, text);
      // Wait for dropdown options to appear
      await this.page.waitForTimeout(500);
    });
  }

  async alertInputBoxSelectOption(option: string): Promise<void> {
    await test.step(`Select option from alert input box: ${option}`, async () => {
      const optionLocator = this.alertInputBoxList(option);
      await this.verifier.verifyTheElementIsVisible(optionLocator, {
        assertionMessage: `Option "${option}" should be visible in dropdown`,
      });
      await this.clickOnElement(optionLocator);
    });
  }

  async mustReadInputBoxFillWithText(text: string): Promise<void> {
    await test.step(`Fill must read input box with text: ${text}`, async () => {
      await this.clickOnElement(this.mustReadInputBox);
      await this.fillInElement(this.mustReadInputBox, text);
    });
  }

  async mustReadInputBoxSelectOption(option: string): Promise<void> {
    await test.step(`Select option from must read input box: ${option}`, async () => {
      const optionLocator = this.mustReadInputBoxList(option);
      await this.verifier.verifyTheElementIsVisible(optionLocator, {
        assertionMessage: `Option "${option}" should be visible in dropdown`,
      });
      await this.clickOnElement(optionLocator);
    });
  }

  async verifyMustReadChangesAreSaved(text: string): Promise<void> {
    await test.step('Verify must read changes are saved', async () => {
      await this.verifier.verifyTheElementIsVisible(this.mustReadChangesConfirmation(text), {
        assertionMessage: 'Must read changes confirmation should be visible',
      });
    });
  }
  async verifyAlertChangesAreSaved(text: string): Promise<void> {
    await test.step('Verify alert changes are saved', async () => {
      await this.verifier.verifyTheElementIsVisible(this.alertChangesConfirmation(text), {
        assertionMessage: 'Alert changes confirmation should be visible',
      });
    });
  }
  async verifyAddedUserGotRemovedFromList(userName: string): Promise<void> {
    await this.protectedAuthorsComponent.verifyAddedUserGotRemovedFromList(userName);
  }
}
