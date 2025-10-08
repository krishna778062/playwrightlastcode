import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

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
  readonly selectAudiencesButton: (text: string) => Locator;
  readonly audiencesTable: () => Locator;
  readonly audienceName: (name: string) => Locator;
  readonly audienceCreatedBy: (createdBy: string) => Locator;
  readonly audiencesMenuItem: () => Locator;
  readonly applicationSettingsButton: () => Locator;
  readonly audienceTypeDropdown: () => Locator;

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
    this.selectAudiencesButton = (text: string) =>
      this.rootLocator
        .locator('label')
        .filter({ hasText: text })
        .locator('span')
        .getByText(text, { exact: true })
        .first();
    this.audiencesTable = () => this.rootLocator.locator('table.Table');
    this.audienceName = (name: string) =>
      this.audiencesTable()
        .locator('tr[data-testid="dataGridRow"]')
        .filter({ hasText: name })
        .locator('div.type--fs15');
    this.audienceCreatedBy = (createdBy: string) =>
      this.audiencesTable()
        .locator('tr[data-testid="dataGridRow"]')
        .filter({ hasText: createdBy })
        .locator('td')
        .nth(3);
    this.audiencesMenuItem = () => this.rootLocator.getByTestId('main-nav-item').filter({ hasText: 'Audiences' });
    this.applicationSettingsButton = () =>
      this.rootLocator.getByRole('menuitem', { name: 'Application settings' }).first();
    this.audienceTypeDropdown = () => this.rootLocator.getByTestId('overlay').getByTestId('SelectInput');
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

  async clickOnAudiencesButton(text: string): Promise<void> {
    await test.step(`Click on Create Audiences button: ${text}`, async () => {
      await this.page.waitForTimeout(10000);
      await this.selectAudiencesButton(text).click();
    });
  }

  async clickOnAudiencesMenuItem(): Promise<void> {
    await test.step('Click on Audiences menu item and wait for page load', async () => {
      await expect(this.applicationSettingsButton(), 'expecting Audiences setting button to be visible').toBeVisible();
      const button = this.applicationSettingsButton();
      await button.hover();
      await this.audiencesMenuItem().click();
    });
  }

  async navigateBack(): Promise<void> {
    await test.step('Navigate back to previous page', async () => {
      await this.page.goBack();
    });
  }

  async verifyAudienceNameIsVisible(audienceName: string): Promise<void> {
    await test.step(`Verify audience name '${audienceName}' is visible`, async () => {
      try {
        await expect(
          this.audienceName(audienceName),
          `expecting audience name '${audienceName}' to be visible`
        ).toBeVisible({ timeout: 5000 });
      } catch {
        console.log(`Audience name '${audienceName}' not visible, reloading page once...`);
        await this.page.reload();
        await expect(
          this.audienceName(audienceName),
          `expecting audience name '${audienceName}' to be visible after reload`
        ).toBeVisible();
      }
    });
  }

  async verifyAudienceCreatedByIsVisible(createdBy: string): Promise<void> {
    await test.step(`Verify audience created by '${createdBy}' is visible`, async () => {
      await expect(
        this.audienceCreatedBy(createdBy),
        `expecting audience created by '${createdBy}' to be visible`
      ).toBeVisible();
    });
  }

  async verifyAudienceNameIsNotVisible(audienceName: string): Promise<void> {
    await test.step(`Verify audience name '${audienceName}' is visible`, async () => {
      await expect(
        this.audienceName(audienceName),
        `expecting audience name '${audienceName}' to be not visible`
      ).not.toBeVisible();
    });
  }

  async verifyGroupType(): Promise<void> {
    await test.step('Verify group types in dropdown', async () => {
      const dropdown = this.audienceTypeDropdown();
      await expect(dropdown, 'expecting audience type dropdown to be visible').toBeVisible();
      const options = await dropdown.locator('option').allTextContents();
      const actualValues = options.map(option => option.trim());
      const expectedValues = ['All groups', 'App groups', 'Built-in groups', 'Okta groups'];
      expect(actualValues.length).toBe(expectedValues.length);
      expect(actualValues, 'expecting groups types to be displayed correctly').toEqual(expectedValues);
    });
  }
}
