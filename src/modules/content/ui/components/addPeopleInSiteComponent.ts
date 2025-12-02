import { Locator, Page, test } from '@playwright/test';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class AddPeopleInSiteComponent extends BaseComponent {
  readonly addPeopleInput: Locator;
  readonly comboboxContainer: Locator;
  readonly addButton: Locator;
  readonly alreadyAMember: Locator;
  readonly memberList: Locator;
  readonly crossButton: Locator;
  constructor(readonly page: Page) {
    super(page);
    const dialog = page.getByRole('dialog', { name: 'Add person to site' });
    // Target the combobox container to click first, then the input
    this.comboboxContainer = dialog.getByRole('combobox');
    this.addPeopleInput = dialog.locator('input.ReactSelectInput-inputField');
    this.addButton = page.getByLabel('Add person to site').getByRole('button', { name: 'Add person' });
    this.alreadyAMember = page.locator('span').filter({ hasText: 'Already a member' });
    this.memberList = page.locator('[role="listbox"]').first();
    this.crossButton = page.locator('[aria-label="Close"]').first();
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
  async clickOnCrossButton(): Promise<void> {
    await test.step('Clicking on cross button', async () => {
      await this.clickOnElement(this.crossButton);
    });
  }

  async verifyUserIsMemBerOfSite(): Promise<void> {
    await test.step('Verifying user is mem ber of site', async () => {
      await this.verifier.verifyTheElementIsVisible(this.alreadyAMember, {
        assertionMessage: 'User should be mem ber of site',
      });
    });
  }

  getAlreadyMemberOrFollowerTag(userName: string): Locator {
    const dialog = this.page.getByRole('dialog', { name: 'Add person to site' });
    // Find the list item containing the user name and get the "Already a member" or "Already a follower" text
    // The tag appears next to the user's name in the dropdown list
    // Find the container that has both the user name and the status text
    return dialog
      .locator(`a:has-text("${userName}")`)
      .locator('xpath=ancestor::*[1]')
      .getByText(/Already a (member|follower)/i);
  }

  async verifyAlreadyMemberOrFollowerTagShouldBeVisible(userName: string): Promise<void> {
    await test.step(`Verify already member or follower tag should be visible for ${userName}`, async () => {
      await this.clickOnElement(this.comboboxContainer);

      // Wait for the input to be visible and ready, then click it to focus
      await this.addPeopleInput.click();

      // Clear any existing value and type the username
      await this.addPeopleInput.clear();
      await this.typeInElement(this.addPeopleInput, userName);
      await this.page.waitForTimeout(5000); // Wait to ensure the tag appears

      const tagLocator = this.getAlreadyMemberOrFollowerTag(userName);
      await this.verifier.verifyTheElementIsVisible(tagLocator, {
        assertionMessage: `"Already a member" or "Already a follower" tag should be visible for ${userName}`,
      });
    });
  }

  async clickOnAddButton(siteId: string): Promise<void> {
    await test.step('Clicking on add button', async () => {
      const publishResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.addButton),
        response =>
          response.url().includes(API_ENDPOINTS.site.manageMembers(siteId)) &&
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
