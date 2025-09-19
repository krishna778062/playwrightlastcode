import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

export class OktaGroupComponent extends BaseComponent {
  readonly oktaLink: () => Locator;
  readonly saveButton: () => Locator;
  readonly oktaApiToken: () => Locator;
  readonly editButton: () => Locator;
  readonly selectOktaGroup: (text: string) => Locator;
  readonly groupOption: (text: string) => Locator;
  readonly selectOktaGroupButton: (text: string) => Locator;
  readonly errorMessage: (text: string) => Locator;
  readonly doNotUseOktaGroupsRadio: (text: string) => Locator;
  readonly addedGroupsMessage: () => Locator;
  readonly removedGroupsMessage: () => Locator;
  readonly selectedGroupsTab: (text: string) => Locator;
  readonly clearGroupButton: (groupText: string) => Locator;
  readonly confirmButton: () => Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);

    this.oktaLink = () => this.rootLocator.getByRole('textbox', { name: 'Okta link' });
    this.saveButton = () => this.rootLocator.getByRole('button', { name: 'Save' });
    this.oktaApiToken = () => this.rootLocator.getByRole('textbox', { name: 'Okta API token' });
    this.editButton = () => this.rootLocator.getByRole('button', { name: 'Edit' });
    this.selectOktaGroup = (text: string) => this.rootLocator.getByRole('checkbox', { name: text });
    this.selectOktaGroupButton = (text: string) => this.rootLocator.getByRole('button', { name: text });
    this.groupOption = (text: string) => this.rootLocator.getByText(text, { exact: true });
    this.errorMessage = (text: string) => this.rootLocator.getByRole('alert').getByText(text);
    this.doNotUseOktaGroupsRadio = (text: string) => this.rootLocator.getByRole('radio', { name: text });
    this.addedGroupsMessage = () => this.rootLocator.locator('div.InfoBox-inner p');
    this.removedGroupsMessage = () => this.rootLocator.locator('div.InfoBox--warning div.InfoBox-inner p');
    this.selectedGroupsTab = (text: string) => this.rootLocator.getByRole('tab', { name: text });
    this.clearGroupButton = (groupText: string) =>
      this.rootLocator
        .locator('li')
        .filter({ hasText: groupText })
        .getByTestId(/clear-button/);
    this.confirmButton = () => this.rootLocator.getByRole('button', { name: 'Confirm' });
  }

  async clickOnCheckbox(): Promise<void> {
    await test.step('Click on Okta checkbox', async () => {
      const oktaCheckbox = this.rootLocator.locator('#Okta_selected');
      const isChecked = await oktaCheckbox.isChecked();

      if (!isChecked) {
        await oktaCheckbox.check();
        console.log('Okta checkbox has been checked');
      } else {
        console.log('Okta checkbox is already checked');
      }
    });
  }

  async fillOktaCredentials(oktaLink: string, apiToken: string): Promise<void> {
    await test.step('Fill Okta credentials', async () => {
      await this.oktaLink().click();
      await this.oktaLink().fill(oktaLink);
      await this.oktaApiToken().hover();

      try {
        await this.editButton().first().waitFor({ state: 'visible' });
        await this.editButton().first().click();
        await this.oktaApiToken().waitFor({ state: 'visible' });
      } catch {
        console.log('Edit button not found, filling API token directly...');
      }

      await this.oktaApiToken().fill(apiToken);
    });
  }

  async clickOnSaveButton(): Promise<void> {
    await test.step('Click on Save button', async () => {
      await this.saveButton().click();
    });
  }

  async clickOnOktaGroupOption(text: string): Promise<void> {
    await test.step(`Click on Okta group option: ${text}`, async () => {
      await this.groupOption(text).click();
    });
  }

  async visiblityOfSelectOktaGroupButton(text: string): Promise<void> {
    await test.step(`Verify visibility of Select Okta Group button: ${text}`, async () => {
      await expect(this.selectOktaGroupButton(text), 'expecting button to be visible').toBeVisible();
    });
  }

  async clickOnSelectOktaGroupButton(text: string): Promise<void> {
    await test.step(`Click on Select Okta Group button: ${text}`, async () => {
      await this.selectOktaGroupButton(text).click();
    });
  }

  async clickOnSelectOktaGroup(text: string): Promise<void> {
    await test.step(`Select Okta group: ${text}`, async () => {
      await this.selectOktaGroup(text).check();
    });
  }

  async clickOnUnCheckOkta(): Promise<void> {
    await test.step('Uncheck Okta checkbox', async () => {
      const oktaCheckbox = this.rootLocator.locator('#Okta_selected');
      await oktaCheckbox.uncheck();
    });
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await test.step(`Verify error message: ${expectedMessage}`, async () => {
      await expect(this.errorMessage(expectedMessage), 'expecting error message to be visible').toBeVisible();
      await expect(this.errorMessage(expectedMessage), 'expecting error message text to match').toHaveText(
        expectedMessage
      );
    });
  }

  async verifyDoNotUseOktaGroupsRadioIsSelected(text: string): Promise<void> {
    const radioButton = this.doNotUseOktaGroupsRadio(text);
    await test.step(`Verify "Do not use Okta groups" radio button: ${text}`, async () => {
      await expect(radioButton, 'expecting "Do not use Okta groups" radio button to be visible').toBeVisible();
      await expect(radioButton, 'expecting "Do not use Okta groups" radio button to be checked').toBeChecked();
    });
  }

  async verifyAddedGroupsMessage(expectedCount: number): Promise<void> {
    const messageElement = this.addedGroupsMessage();
    await test.step(`Verify added groups message: ${expectedCount}`, async () => {
      await expect(messageElement, 'expecting added groups message to be visible').toBeVisible();
      await expect(messageElement, 'expecting message to contain "Added"').toContainText('Added');
      const countElement = messageElement.locator('strong');
      await expect(countElement, 'expecting count element to be visible').toBeVisible();
      await expect(countElement, `expecting count to be ${expectedCount}`).toHaveText(expectedCount.toString());
    });
  }

  async clickOnSelectedGroupsTab(text: string): Promise<void> {
    await test.step(`Click on Selected Groups tab: ${text}`, async () => {
      const tab = this.selectedGroupsTab(text);
      await tab.click();
    });
  }

  async clickOnClearGroupButton(groupName: string): Promise<void> {
    const clearButton = this.clearGroupButton(groupName);
    await test.step(`Click on Clear Group button: ${groupName}`, async () => {
      await clearButton.click();
    });
  }

  async verifyRemovedGroupsMessage(expectedCount: number): Promise<void> {
    const messageElement = this.removedGroupsMessage();
    await test.step(`Verify removed groups message: ${expectedCount}`, async () => {
      await expect(messageElement, 'expecting removed groups message to be visible').toBeVisible();
      await expect(messageElement, 'expecting message to contain "Removed"').toContainText('Removed');
      const countElement = messageElement.locator('strong');
      await expect(countElement, 'expecting count element to be visible').toBeVisible();
      await expect(countElement, `expecting count to be ${expectedCount}`).toHaveText(expectedCount.toString());
    });
  }

  async clickOnConfirmButton(): Promise<void> {
    await test.step('Click on Confirm button if available', async () => {
      try {
        await this.confirmButton().waitFor({ state: 'visible', timeout: 3000 });
        await this.confirmButton().click();
      } catch {
        console.log('Confirm button not found, continuing...');
      }
    });
  }
}
