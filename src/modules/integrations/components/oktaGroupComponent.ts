import { expect, Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

export class oktaGroupComponent extends BaseComponent {
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
  }

  async clickOnCheckbox(): Promise<void> {
    const oktaCheckbox = this.rootLocator.locator('#Okta_selected');
    const isChecked = await oktaCheckbox.isChecked();

    if (!isChecked) {
      await oktaCheckbox.check();
      console.log('Okta checkbox has been checked');
    } else {
      console.log('Okta checkbox is already checked');
    }
  }

  async fillOktaCredentials(oktaLink: string, apiToken: string): Promise<void> {
    await this.oktaLink().click();
    await this.oktaLink().fill(oktaLink);
    await this.oktaApiToken().hover();
    await this.editButton().first().click();
    await this.oktaApiToken().fill(apiToken);
  }

  async clickOnSaveButton(): Promise<void> {
    await this.saveButton().click();
  }

  async clickOnOktaGroupOption(text: string): Promise<void> {
    await this.groupOption(text).click();
  }

  async visiblityOfSelectOktaGroupButton(text: string): Promise<void> {
    await expect(this.selectOktaGroupButton(text)).toBeVisible();
  }

  async clickOnSelectOktaGroupButton(text: string): Promise<void> {
    await this.selectOktaGroupButton(text).click();
  }

  async clickOnSelectOktaGroup(text: string): Promise<void> {
    await this.selectOktaGroup(text).check();
  }

  async clickOnDoneButton(text: string): Promise<void> {
    await this.selectOktaGroupButton(text).click();
  }

  async clickOnUnCheckOkta(): Promise<void> {
    const oktaCheckbox = this.rootLocator.locator('#Okta_selected');
    await oktaCheckbox.uncheck();
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await expect(this.errorMessage(expectedMessage), 'expecting error message to be visible').toBeVisible();
    await expect(this.errorMessage(expectedMessage), 'expecting error message text to match').toHaveText(
      expectedMessage
    );
  }

  async verifyDoNotUseOktaGroupsRadioIsSelected(text: string): Promise<void> {
    const radioButton = this.doNotUseOktaGroupsRadio(text);
    await expect(radioButton, 'expecting "Do not use Okta groups" radio button to be visible').toBeVisible();
    await expect(radioButton, 'expecting "Do not use Okta groups" radio button to be checked').toBeChecked();
  }

  async verifyAddedGroupsMessage(expectedCount: number): Promise<void> {
    const messageElement = this.addedGroupsMessage();
    await expect(messageElement, 'expecting added groups message to be visible').toBeVisible();
    await expect(messageElement, 'expecting message to contain "Added"').toContainText('Added');
    const countElement = messageElement.locator('strong');
    await expect(countElement, 'expecting count element to be visible').toBeVisible();
    await expect(countElement, `expecting count to be ${expectedCount}`).toHaveText(expectedCount.toString());
  }

  async clickOnSelectedGroupsTab(text: string): Promise<void> {
    const tab = this.selectedGroupsTab(text);
    await tab.click();
  }

  async clickOnClearGroupButton(groupName: string): Promise<void> {
    const clearButton = this.clearGroupButton(groupName);
    await clearButton.click();
  }

  async verifyRemovedGroupsMessage(expectedCount: number): Promise<void> {
    const messageElement = this.removedGroupsMessage();
    await expect(messageElement, 'expecting removed groups message to be visible').toBeVisible();
    await expect(messageElement, 'expecting message to contain "Removed"').toContainText('Removed');
    const countElement = messageElement.locator('strong');
    await expect(countElement, 'expecting count element to be visible').toBeVisible();
    await expect(countElement, `expecting count to be ${expectedCount}`).toHaveText(expectedCount.toString());
  }
}
