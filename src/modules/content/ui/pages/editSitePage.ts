import { expect, Locator, Page, test } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

export interface IEditSitePageActions {
  clickOnEditOption: () => Promise<void>;
  editSiteNameInput: (siteName: string) => Promise<void>;
  clickOnUpdateButton: () => Promise<void>;
}

export interface IEditSitePageAssertions {
  verifySiteNameIsUpdated: (siteName: string) => Promise<void>;
}

export class EditSitePage extends BasePage implements IEditSitePageActions, IEditSitePageAssertions {
  readonly editOption: Locator;
  private readonly editSiteNameInputLocator: Locator;
  readonly updateButton: Locator;

  constructor(page: Page) {
    super(page);
    this.editOption = page.getByRole('link', { name: 'Edit', exact: true });
    this.editSiteNameInputLocator = page.getByRole('textbox', { name: 'Site name' });
    this.updateButton = page.locator('[type="submit"]:has-text("Update")');
  }

  get actions(): IEditSitePageActions {
    return this;
  }

  get assertions(): IEditSitePageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    // TODO: Add specific locator verification when edit site page structure is finalized
    await test.step('Verify edit site page is loaded', async () => {
      // Placeholder implementation - update with actual page verification locator
    });
  }
  async editSiteName(siteName: string): Promise<void> {
    await test.step('Editing site name', async () => {
      await this.clickOnElement(this.editOption);
      await this.editOption.type(siteName);
    });
  }
  async clickOnEditOption(): Promise<void> {
    await test.step('Clicking on edit option', async () => {
      await this.clickOnElement(this.editOption);
    });
  }
  async editSiteNameInput(siteName: string): Promise<void> {
    await test.step('Editing site name input', async () => {
      await this.fillInElement(this.editSiteNameInputLocator, siteName);
    });
  }
  async getUpdatedSiteName(): Promise<string> {
    return await test.step('Getting updated site name', async () => {
      return (await this.editSiteNameInputLocator.textContent()) || '';
    });
  }
  async clickOnUpdateButton(): Promise<void> {
    await test.step('Clicking on update button', async () => {
      await this.clickOnElement(this.updateButton);
    });
  }

  async verifySiteNameIsUpdated(siteName: string): Promise<void> {
    await test.step(`Verify site name is updated to: ${siteName}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.editSiteNameInputLocator);
      await expect(this.editSiteNameInputLocator).toHaveValue(siteName);
    });
  }
}
