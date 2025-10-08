import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class PrivilegesComponent extends BaseComponent {
  readonly protectedAuthorsAuthors: Locator;
  readonly protectedAuthorsAllowlist: Locator;
  readonly protectedAuthors: Locator;
  readonly authorInputBox: Locator;
  readonly clickOnSave: Locator;
  readonly crossUser: Locator;
  readonly changesConfirmation: Locator;
  readonly allowlistInputBox: Locator;
  readonly crossAllowlistUser: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.protectedAuthorsAuthors = page.getByText('Protected authors - authors:');
    this.protectedAuthorsAllowlist = page.getByText('Protected authors - allowlist:');
    this.protectedAuthors = page.getByRole('heading', { name: 'Protected authors' });
    this.authorInputBox = page.locator('#react-select-3-input');
    this.allowlistInputBox = page.locator('#react-select-4-input');
    this.clickOnSave = page.getByRole('button', { name: 'Save' });
    this.crossUser = page.locator('.Tag-remove').first();
    this.crossAllowlistUser = page.locator('.Tag-remove').nth(1);
    this.changesConfirmation = page.getByText('Saved changes successfully');
  }
}
