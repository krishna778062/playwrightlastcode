import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { AD_GROUP } from '@/src/modules/integrations/test-data/gamma-data-file';

export class AdGroupComponent extends BaseComponent {
  readonly adGroupsOption: (text: string) => Locator;
  readonly selectADGroupButton: (text: string) => Locator;
  readonly selectADGroup: (text: string) => Locator;
  readonly addedGroupsMessage: () => Locator;
  readonly selectAudiencesButton: (text: string) => Locator;
  readonly audienceTypeDropdown: () => Locator;
  readonly errorMessage: (text: string) => Locator;
  readonly doNotUseADGroupsRadio: (text: string) => Locator;
  readonly clearGroupButton: (groupText: string) => Locator;
  readonly selectedGroupsTab: (text: string) => Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);

    this.adGroupsOption = (text: string) => this.rootLocator.getByText(text, { exact: true });
    this.selectADGroupButton = (text: string) => this.rootLocator.getByRole('button', { name: text });
    this.selectADGroup = (text: string) => this.rootLocator.getByRole('checkbox', { name: text });
    this.addedGroupsMessage = () => this.rootLocator.locator('div.InfoBox-inner p');
    this.selectAudiencesButton = (text: string) => this.rootLocator.locator('label').filter({ hasText: text }).nth(1);
    this.audienceTypeDropdown = () => this.rootLocator.getByTestId('overlay').getByTestId('SelectInput');
    this.errorMessage = (text: string) => this.rootLocator.getByRole('alert').getByText(text);
    this.doNotUseADGroupsRadio = (text: string) => this.rootLocator.getByRole('radio', { name: text });
    this.clearGroupButton = (groupText: string) =>
      this.rootLocator
        .locator('li')
        .filter({ hasText: groupText })
        .getByTestId(/clear-button/);
    this.selectedGroupsTab = (text: string) => this.rootLocator.getByRole('tab', { name: text });
  }

  async selectADGroups(text: string): Promise<void> {
    await test.step(`Select AD Group: ${text}`, async () => {
      await this.selectADGroup(text).click();
    });
  }

  async clickOnAdGroupsOption(text: string): Promise<void> {
    await test.step(`Click on AD Groups option: ${text}`, async () => {
      const span = this.adGroupsOption(text);
      await span.click();
    });
  }

  async clickOnSelectADGroupButton(text: string): Promise<void> {
    await test.step(`Click on Select AD Group button: ${text}`, async () => {
      const button = this.selectADGroupButton(text);
      await button.click();
    });
  }

  async verifyAddedGroupsMessage(expectedCount: number): Promise<void> {
    await test.step(`Verify added groups message: ${expectedCount}`, async () => {
      const messageElement = this.addedGroupsMessage();
      await expect(messageElement, 'expecting added groups message to be visible').toBeVisible();
      await expect(messageElement, 'expecting message to contain "Added"').toContainText('Added');
      const countElement = messageElement.locator('strong');
      await expect(countElement, 'expecting count element to be visible').toBeVisible();
      await expect(countElement, `expecting count to be ${expectedCount}`).toHaveText(expectedCount.toString());
    });
  }

  async createAudiencesButtonVisibilty(text: string): Promise<void> {
    await test.step(`Click on Audiences button: ${text}`, async () => {
      await this.selectAudiencesButton(text).isVisible();
    });
  }

  async verifyGroupType(): Promise<void> {
    await test.step('Verify group types in dropdown', async () => {
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
      expect(actualValues, 'expecting all the group types match with expected values').toEqual(expectedValues);
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

  async clickOnDoNotUseADGroupsRadioButton(text: string): Promise<void> {
    const radioButton = this.doNotUseADGroupsRadio(text);
    await test.step(`Click on Do not use AD groups radio button: ${text}`, async () => {
      await radioButton.click();
    });
  }

  async verifyMicrosoftEntraButtonCount(expectedCount: number): Promise<void> {
    await test.step(`Verify Microsoft Entra ID button shows count: ${expectedCount}`, async () => {
      const buttonText = `Select Microsoft Entra ID groups (${expectedCount})`;
      const button = this.selectADGroupButton(buttonText);
      await expect(button, 'expecting Microsoft Entra ID button to be visible').toBeVisible();
      await expect(button, `expecting button text to contain count ${expectedCount}`).toHaveText(buttonText);
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

  async removeIfGroupsAreSelected(useGroupsRadioText: string, selectGroupsButtonText: string): Promise<void> {
    await test.step(`Check if ${useGroupsRadioText} is selected and click ${selectGroupsButtonText} if enabled`, async () => {
      const useGroupsOption = this.adGroupsOption(useGroupsRadioText);

      const isSelected = await useGroupsOption.isChecked();

      if (isSelected) {
        const selectButton = this.selectADGroupButton(selectGroupsButtonText);
        await selectButton.click();
        await this.clickOnSelectedGroupsTab(AD_GROUP.SELECTED_GROUPS_TAB);
        await this.removeGroups();
        await this.clickOnSelectADGroupButton('Done');
        await this.clickOnDoNotUseADGroupsRadioButton(AD_GROUP.DO_NOT_USE_AD_GROUPS);
        await this.clickOnSelectADGroupButton('Save');
      } else {
        console.log(
          `${useGroupsRadioText} radio button is not selected, skipping ${selectGroupsButtonText} button click`
        );
      }
    });
  }

  async removeGroups(): Promise<void> {
    await test.step('Clear all selected AD groups', async () => {
      const groupItems = this.rootLocator.locator('li.SelectActiveDirectoryGroup-module-itemList___Fton6');
      const count = await groupItems.count();

      if (count === 0) {
        console.log('No selected groups to clear');
        return;
      }
      console.log(`Clearing ${count} selected groups`);

      for (let i = count - 1; i >= 0; i--) {
        const clearButton = groupItems.nth(i).locator('button[data-testid*="clear-button"]');
        if (await clearButton.isVisible()) {
          const currentCount = await groupItems.count();
          await clearButton.click();
          await expect(groupItems).toHaveCount(currentCount - 1);
        }
      }
      console.log('All groups cleared');
    });
  }
}
