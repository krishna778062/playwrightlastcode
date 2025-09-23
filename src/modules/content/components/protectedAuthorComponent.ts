import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

import { BaseActionUtil } from '@/src/core/utils/baseActionUtil';

export class ProtectedAuthorsComponent extends BaseComponent {
  readonly protectedAuthorsAuthors: Locator;
  readonly protectedAuthorsAllowlist: Locator;
  readonly protectedAuthors: Locator;
  readonly authorInputBox: Locator;
  readonly crossUser: Locator;
  readonly selectingAuthor: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.protectedAuthorsAuthors = page.getByText('Protected authors - authors:');
    this.protectedAuthorsAllowlist = page.getByText('Protected authors - allowlist:');
    this.protectedAuthors = page.getByRole('heading', { name: 'Protected authors' });
    this.authorInputBox = page.locator('#react-select-3-input');
    this.crossUser = page.locator('button.Tag-remove').first();
    this.selectingAuthor = page.locator(`[role="listbox"]`);
  }

  async verifyProtectedAuthorsAuthorsFieldBarIsVisible(): Promise<void> {
    await test.step('Verify the protected authors authors is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.protectedAuthorsAuthors);
    });
  }

  async verifyProtectedAuthorsAllowlistFieldBarIsVisible(): Promise<void> {
    await test.step('Verify the protected authors allowlist is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.protectedAuthorsAllowlist);
    });
  }

  async fillProtectedAuthorsAuthorsFieldBarWithLoggedInUser(value: string): Promise<void> {
    await test.step('Verify protected authors authors is visible and fill value', async () => {
      await this.clickOnElement(this.authorInputBox);
      await this.fillInElement(this.authorInputBox, value);
      await this.authorInputBox.focus();
      const newWorkspaceOption = this.selectingAuthor.filter({ hasText: value });
      await this.clickOnElement(newWorkspaceOption);
    });
  }

  async fillProtectedAuthorsAllowlistFieldBarWithLoggedInUser(value: string): Promise<void> {
    await test.step('Verify protected authors authors is visible and fill value', async () => {
      await this.clickOnElement(this.authorInputBox);
      await this.fillInElement(this.authorInputBox, value);
      await this.authorInputBox.focus();
      const newWorkspaceOption = this.selectingAuthor.filter({ hasText: value });
      await this.clickOnElement(newWorkspaceOption);
    });
  }

  async clickOnCrossUser(): Promise<void> {
    await test.step('Clicking on cross user', async () => {
      await this.clickOnElement(this.crossUser);
    });
  }
}
