import { expect, Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

export class AdGroupComponent extends BaseComponent {
  readonly adGroupsOption: (text: string) => Locator;
  readonly spanContainText: (text: string) => Locator;
  readonly buttonContainText: (text: string) => Locator;
  readonly messageParagraph: (text: string) => Locator;
  readonly selectedCount: (count: string) => Locator;
  readonly groupTypeDropdown: (id: string) => Locator;
  readonly disconnectButton: (ariaLabel: string) => Locator;
  readonly headingText: (text: string) => Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);

    this.adGroupsOption = (text: string) => this.rootLocator.locator(`//div[text()='${text}']`);
    this.spanContainText = (text: string) => this.rootLocator.locator(`//span[contains(text(),'${text}')]`);
    this.buttonContainText = (text: string) => this.rootLocator.locator(`//button[contains(text(),'${text}')]`);
    this.messageParagraph = (text: string) => this.rootLocator.locator(`//p[contains(text(),'${text}')]`);
    this.selectedCount = (count: string) => this.rootLocator.locator(`//strong[text()='${count}']`);
    this.groupTypeDropdown = (id: string) => this.rootLocator.locator(`//select[@id='${id}']`);
    this.disconnectButton = (ariaLabel: string) => this.rootLocator.locator(`//button[@aria-label='${ariaLabel}']`);
    this.headingText = (text: string) => this.rootLocator.locator(`//h2[text()='${text}']`);
  }

  async selectADGroups(text: string): Promise<void> {
    const option = this.adGroupsOption(text);
    await expect(option, 'expecting AD Group option to be visible').toBeVisible();
    await this.clickOnElement(option);
  }

  async clickOnSpanContainButtonText(text: string): Promise<void> {
    const span = this.spanContainText(text);
    await expect(span, 'expecting span text to be visible').toBeVisible();
    await span.click();
  }

  async clickOnButton(text: string): Promise<void> {
    const button = this.buttonContainText(text);
    await expect(button, 'expecting button text to be visible').toBeVisible();
    await button.click();
  }

  async validateMessage(text: string, number: string): Promise<void> {
    await expect(this.messageParagraph(text), 'expecting paragraph to be visible').toBeVisible();
    await expect(this.selectedCount(number), 'expecting count to be visible').toBeVisible();
  }

  async VerifyRadioButtonText(className: string): Promise<void> {
    await expect(this.spanContainText(className), 'expecting span text to be visible').toBeVisible();
  }

  async verifyGroupType(id: string): Promise<void> {
    const dropdown = this.groupTypeDropdown(id);
    await expect(dropdown, 'expecting dropdown to be visible').toBeVisible();
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

  async clickOnDisconnectButton(text: string): Promise<void> {
    const button = this.disconnectButton(text);
    await expect(button, 'expecting disconnect button to be visible').toBeVisible();
    await this.clickOnElement(button);
  }

  async headingIsPresent(linkText: string): Promise<void> {
    await expect(this.headingText(linkText), 'expecting heading to be visible').toBeVisible();
  }
}
