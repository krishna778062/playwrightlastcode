import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';
import { ProtectedAuthorsComponent } from '@/src/modules/content/ui/components/protectedAuthorComponent';

export interface IPrivilegesScreenPageActions {
  fillProtectedAuthorsAuthorsFieldBarWithLoggedInUser: (value: string) => Promise<void>;
  fillProtectedAuthorsAllowlistFieldBarWithLoggedInUser: (value: string) => Promise<void>;
  clickOnSave: () => Promise<void>;
  clickOnCrossUserFromAuthorList: () => Promise<void>;
  clickOnCrossAllowlistUser: () => Promise<void>;
}

export interface IPrivilegesScreenPageAssertions {
  verifyProtectedAuthorsAuthorsFieldBarIsVisible: () => Promise<void>;
  verifyProtectedAuthorsAllowlistFieldBarIsVisible: () => Promise<void>;
  verifyTheChangesConfirmationToastMessageIsVisible: () => Promise<void>;
  verifyAddedUserGotRemovedFromList: (userName: string) => Promise<void>;
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

  async verifyAddedUserGotRemovedFromList(userName: string): Promise<void> {
    await this.protectedAuthorsComponent.verifyAddedUserGotRemovedFromList(userName);
  }
}
