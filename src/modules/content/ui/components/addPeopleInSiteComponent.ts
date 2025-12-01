import { Locator, Page, test } from '@playwright/test';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class AddPeopleInSiteComponent extends BaseComponent {
  readonly addPeopleInput: Locator;
  readonly comboboxContainer: Locator;
  readonly addButton: Locator;

  constructor(page: Page) {
    super(page);
    const dialog = page.getByRole('dialog', { name: 'Add person to site' });
    // Target the combobox container to click first, then the input
    this.comboboxContainer = dialog.getByRole('combobox');
    this.addPeopleInput = dialog.locator('input.ReactSelectInput-inputField');
    this.addButton = page.getByLabel('Add person to site').getByRole('button', { name: 'Add person' });
  }

  getListOfPeople(userName: string): Locator {
    return this.page.locator('a').filter({ hasText: userName });
  }

  async fillAddPeopleInput(userName: string): Promise<void> {
    await test.step(`Filling add people input with ${userName}`, async () => {
      // Click on the combobox container first to activate it
      await this.clickOnElement(this.comboboxContainer);

      // Wait for the input to be visible and ready, then click it to focus
      await this.addPeopleInput.click();

      // Clear any existing value and type the username
      await this.addPeopleInput.clear();
      await this.typeInElement(this.addPeopleInput, userName);

      // Wait for dropdown option to appear
      const option = this.getListOfPeople(userName);
      await this.clickOnElement(option, {
        force: true,
      });
    });
  }
  async clickOnAddButton(memberID: string): Promise<void> {
    await test.step('Clicking on add button', async () => {
      const publishResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.addButton),
        response =>
          response.url().includes(API_ENDPOINTS.site.manageMembers(memberID)) &&
          response.request().method() === 'POST' &&
          response.status() === 200,
        {
          timeout: 20_000,
        }
      );
      await publishResponse.finished();
    });
  }
}
