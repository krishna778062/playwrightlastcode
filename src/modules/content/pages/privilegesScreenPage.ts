import { Locator, Page, Response, test } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { ProtectedAuthorsComponent } from '@/src/modules/content/components/protectedAuthorComponent';

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
  private protectedAuthorsComponent: ProtectedAuthorsComponent;
  readonly clickOnSaveButton = this.page.getByRole('button', { name: 'Save' });
  readonly changesConfirmation = this.page.getByText('Saved changes successfully');

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.PRIVILEGES_SCREEN);
    this.protectedAuthorsComponent = new ProtectedAuthorsComponent(page);
  }

  get actions(): IPrivilegesScreenPageActions {
    return this;
  }

  get assertions(): IPrivilegesScreenPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify governance page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.protectedAuthorsComponent.protectedAuthors, {
        assertionMessage: 'Privileges page should be visible',
      });
    });
  }

  async verifyTheProtectedAuthorsAuthorsIsVisible(): Promise<void> {
    await this.protectedAuthorsComponent.verifyTheProtectedAuthorsAuthorsIsVisible();
  }

  async verifyTheProtectedAuthorsAllowlistIsVisible(): Promise<void> {
    await this.protectedAuthorsComponent.verifyTheProtectedAuthorsAllowlistIsVisible;
  }

  async verifyAndFillProtectedAuthorsAuthors(value: string): Promise<void> {
    await this.protectedAuthorsComponent.verifyAndFillProtectedAuthorsAuthors(value);
  }

  async clickOnSave(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.clickOnSaveButton);
    });
  }

  async verifyTheChangesConfirmationIsVisible(): Promise<void> {
    await test.step('Verify the changes confirmation is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.changesConfirmation);
    });
  }

  async clickOnCrossUser(): Promise<void> {
    await this.protectedAuthorsComponent.clickOnCrossUser();
  }
}
