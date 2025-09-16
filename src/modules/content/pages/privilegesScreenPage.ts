import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { PrivilegesComponent } from '@/src/modules/content/components/privilegesComponent';

export interface IPrivilegesScreenPageActions {
  verifyAndFillProtectedAuthorsAuthors: (value: string) => Promise<void>;
  clickOnSave: () => Promise<void>;
  clickOnCrossUser: () => Promise<void>;
}

export interface IPrivilegesScreenAssertions {
  verifyTheProtectedAuthorsAuthorsIsVisible: () => Promise<void>;
  verifyTheProtectedAuthorsAllowlistIsVisible: () => Promise<void>;
  verifyTheChangesConfirmationIsVisible: () => Promise<void>;
}
export class PrivilegesScreenPage extends BasePage {
  private privilegesComponent: PrivilegesComponent;
  actions: any;
  assertions: IPrivilegesScreenAssertions;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.PRIVILEGES_SCREEN);
    this.privilegesComponent = new PrivilegesComponent(page);
    this.actions = {
      verifyAndFillProtectedAuthorsAuthors: this.verifyAndFillProtectedAuthorsAuthors.bind(this),
      clickOnSave: this.clickOnSave.bind(this),
      clickOnCrossUser: this.clickOnCrossUser.bind(this),
    };
    this.assertions = {
      verifyTheProtectedAuthorsAuthorsIsVisible: this.verifyTheProtectedAuthorsAuthorsIsVisible.bind(this),
      verifyTheProtectedAuthorsAllowlistIsVisible: this.verifyTheProtectedAuthorsAllowlistIsVisible.bind(this),
      verifyTheChangesConfirmationIsVisible: this.verifyTheChangesConfirmationIsVisible.bind(this),
    };
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify governance page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.privilegesComponent.protectedAuthors, {
        assertionMessage: 'Privileges page should be visible',
      });
    });
  }

  async verifyTheProtectedAuthorsAuthorsIsVisible(): Promise<void> {
    await test.step('Verify the protected authors authors is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.privilegesComponent.protectedAuthorsAuthors);
    });
  }

  async verifyTheProtectedAuthorsAllowlistIsVisible(): Promise<void> {
    await test.step('Verify the protected authors allowlist is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.privilegesComponent.protectedAuthorsAllowlist);
    });
  }

  async verifyAndFillProtectedAuthorsAuthors(value: string): Promise<void> {
    await test.step('Verify protected authors authors is visible and fill value', async () => {
      await this.clickOnElement(this.privilegesComponent.authorInputBox);
      await this.fillInElement(this.privilegesComponent.authorInputBox, value);
      await this.sleep(2000);
      await this.privilegesComponent.authorInputBox.focus();
      await this.page.keyboard.press('Enter');
    });
  }

  async clickOnSave(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.privilegesComponent.clickOnSave);
    });
  }

  async verifyTheChangesConfirmationIsVisible(): Promise<void> {
    await test.step('Verify the changes confirmation is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.privilegesComponent.changesConfirmation);
    });
  }

  async clickOnCrossUser(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.privilegesComponent.crossUser);
    });
  }
}
