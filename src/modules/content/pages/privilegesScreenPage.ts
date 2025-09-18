import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { PrivilegesComponent } from '@/src/modules/content/components/privilegesComponent';

export interface IPrivilegesScreenPageActions {
  verifyAndFillProtectedAuthorsAuthors: (value: string) => Promise<void>;
  clickOnSave: () => Promise<void>;
  clickOnCrossUser: () => Promise<void>;
}

export interface IPrivilegesScreenPageAssertions {
  verifyTheProtectedAuthorsAuthorsIsVisible: () => Promise<void>;
  verifyTheProtectedAuthorsAllowlistIsVisible: () => Promise<void>;
  verifyTheChangesConfirmationIsVisible: () => Promise<void>;
}
export class PrivilegesScreenPage extends BasePage {
  private privilegesComponent: PrivilegesComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.PRIVILEGES_SCREEN);
    this.privilegesComponent = new PrivilegesComponent(page);
  }

  get actions(): IPrivilegesScreenPageActions {
    return this;
  }

  get assertions(): IPrivilegesScreenPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify governance page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.privilegesComponent.protectedAuthors, {
        assertionMessage: 'Privileges page should be visible',
      });
    });
  }

  async verifyTheProtectedAuthorsAuthorsIsVisible(): Promise<void> {
    await this.privilegesComponent.verifyTheProtectedAuthorsAuthorsIsVisible();
  }

  async verifyTheProtectedAuthorsAllowlistIsVisible(): Promise<void> {
    await this.privilegesComponent.verifyTheProtectedAuthorsAllowlistIsVisible;
  }

  async verifyAndFillProtectedAuthorsAuthors(value: string): Promise<void> {
    await this.privilegesComponent.verifyAndFillProtectedAuthorsAuthors(value);
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
    await this.privilegesComponent.clickOnCrossUser();
  }
}
