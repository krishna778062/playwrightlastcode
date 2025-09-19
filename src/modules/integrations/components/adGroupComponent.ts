import { expect, Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

export class AdGroupComponent extends BaseComponent {
  readonly adGroupsOption: (text: string) => Locator;
  readonly selectADGroupButton: (text: string) => Locator;
  readonly selectADGroup: (text: string) => Locator;
  readonly addedGroupsMessage: () => Locator;
  readonly selectAudiencesButton: (text: string) => Locator;
  readonly audienceTypeDropdown: () => Locator;
  readonly errorMessage: (text: string) => Locator;
  readonly disconnectAccountButton: (sourceName: string, buttonText: string) => Locator;
  readonly disconnectConfirmationText: (text: string) => Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);

    this.adGroupsOption = (text: string) => this.rootLocator.getByText(text, { exact: true });
    this.selectADGroupButton = (text: string) => this.rootLocator.getByRole('button', { name: text });
    this.selectADGroup = (text: string) => this.rootLocator.getByRole('checkbox', { name: text });
    this.addedGroupsMessage = () => this.rootLocator.locator('div.InfoBox-inner p');
    this.selectAudiencesButton = (text: string) => this.rootLocator.locator('label').filter({ hasText: text }).nth(1);
    this.audienceTypeDropdown = () => this.rootLocator.getByTestId('overlay').getByTestId('SelectInput');
    this.errorMessage = (text: string) => this.rootLocator.getByRole('alert').getByText(text);
    this.disconnectAccountButton = (sourceName: string, buttonText: string) =>
      this.rootLocator
        .locator('li.ConnectedServices-module-item___nJXFQ')
        .filter({ hasText: sourceName })
        .getByRole('button')
        .filter({ hasText: buttonText });
    this.disconnectConfirmationText = (text: string) =>
      this.rootLocator.locator('.Content.Content--small.type--secondary').getByText(text, { exact: true });
  }

  async selectADGroups(text: string): Promise<void> {
    await this.selectADGroup(text).click();
  }

  async clickOnAdGroupsOption(text: string): Promise<void> {
    const span = this.adGroupsOption(text);
    await span.click();
  }

  async clickOnSelectADGroupButton(text: string): Promise<void> {
    const button = this.selectADGroupButton(text);
    await button.click();
  }

  async verifyAddedGroupsMessage(expectedCount: number): Promise<void> {
    const messageElement = this.addedGroupsMessage();
    await expect(messageElement, 'expecting added groups message to be visible').toBeVisible();
    await expect(messageElement, 'expecting message to contain "Added"').toContainText('Added');
    const countElement = messageElement.locator('strong');
    await expect(countElement, 'expecting count element to be visible').toBeVisible();
    await expect(countElement, `expecting count to be ${expectedCount}`).toHaveText(expectedCount.toString());
  }

  async clickOnAudiencesButton(text: string): Promise<void> {
    await this.selectAudiencesButton(text).isVisible;
  }

  async verifyGroupType(): Promise<void> {
    const dropdown = this.audienceTypeDropdown();
    await expect(dropdown, 'expecting audience type dropdown to be visible').toBeVisible();
    const options = await dropdown.locator('option').allTextContents();
    const actualValues = options.map(option => option.trim());
    const expectedValues = [
      'All groups',
      'Distribution groups',
      'Mail Security groups',
      'Microsoft 365 groups',
      'Security groups',
    ];
    expect(actualValues.length).toBe(expectedValues.length);
    expect(actualValues).toEqual(expectedValues);
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await expect(this.errorMessage(expectedMessage), 'expecting error message to be visible').toBeVisible();
    await expect(this.errorMessage(expectedMessage), 'expecting error message text to match').toHaveText(
      expectedMessage
    );
  }

  async clickOnDisconnectAccountButton(sourceName: string, buttonText: string): Promise<void> {
    const disconnectButton = this.disconnectAccountButton(sourceName, buttonText);
    await disconnectButton.click();
  }

  async verifyDisconnectConfirmationText(expectedText: string): Promise<void> {
    const confirmationText = this.disconnectConfirmationText(expectedText);
    await expect(
      confirmationText,
      `expecting disconnect confirmation text "${expectedText}" to be visible`
    ).toBeVisible();
  }
}
