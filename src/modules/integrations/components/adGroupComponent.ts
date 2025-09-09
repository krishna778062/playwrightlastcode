import { BaseComponent } from '@/src/core/components/baseComponent';
import { Locator, Page, expect } from '@playwright/test';

export class AdGroupComponent extends BaseComponent {
  readonly microsoftEntraButton: Locator;
  readonly adGroupsModal: (className: string) => Locator;
  readonly adGroupsOption: (text: string) => Locator;
  readonly spanContainText: (text: string) => Locator;
  readonly buttonContainText: (text: string) => Locator;
  readonly messageParagraph: (text: string) => Locator;
  readonly selectedCount: (count: string) => Locator;
  readonly divText: (className: string) => Locator;
  readonly groupTypeDropdown: (id: string) => Locator;
  readonly disconnectButton: (ariaLabel: string) => Locator;
  readonly headingText: (text: string) => Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);

    this.microsoftEntraButton = this.rootLocator.locator(`//button[contains(text(),'Microsoft Entra ID')]`);
    this.adGroupsModal = (className: string) => this.rootLocator.locator(`//div[contains(@class,'${className}')]`);
    this.adGroupsOption = (text: string) =>
      this.rootLocator.locator(`//ul[contains(@class,'results')]//li//div[text()='${text}']`);
    this.spanContainText = (text: string) => this.rootLocator.locator(`//span[contains(text(),'${text}')]`);
    this.buttonContainText = (text: string) => this.rootLocator.locator(`//button[contains(text(),'${text}')]`);
    this.messageParagraph = (text: string) => this.rootLocator.locator(`//p[contains(text(),'${text}')]`);
    this.selectedCount = (count: string) => this.rootLocator.locator(`//strong[text()='${count}']`);
    this.divText = (className: string) => this.rootLocator.locator(`//div[contains(@class,'${className}')]`);
    this.groupTypeDropdown = (id: string) => this.rootLocator.locator(`//select[@id='${id}']`);
    this.disconnectButton = (ariaLabel: string) =>
      this.rootLocator.locator(`//button[@aria-label='${ariaLabel}']`);
    this.headingText = (text: string) => this.rootLocator.locator(`//h2[text()='${text}']`);
  }

  async verifyMicrosoftEntraIDGroupsVisibility(text: string): Promise<void> {
    await expect(this.buttonContainText(text), 'expecting this button to be visible').toBeVisible();
  }

  async adGroupsModalIsDisplayed(className: string): Promise<void> {
    await expect(this.adGroupsModal(className), 'expecting modal to be visible').toBeVisible();
  }

  async selectADGroups(text: string): Promise<void> {
    const option = this.adGroupsOption(text);
    await expect(option, 'expecting AD Group option to be visible').toBeVisible({ timeout: 30000 });
    await this.clickOnElement(option);
  }

  async clickOnSpanContainButtonText(text: string): Promise<void> {
    const span = this.spanContainText(text);
    await expect(span, 'expecting span text to be visible').toBeVisible({ timeout: 30000 });
    await this.clickOnElement(span);
  }

  async clickOnButtonContainText(text: string): Promise<void> {
    const button = this.buttonContainText(text);
    await expect(button, 'expecting button text to be visible').toBeVisible({ timeout: 30000 });
    await this.clickOnElement(button);
  }

  async validateMessage(text: string, number: string): Promise<void> {
    await expect(this.messageParagraph(text), 'expecting paragraph to be visible').toBeVisible();
    await expect(this.selectedCount(number), 'expecting count to be visible').toBeVisible();
  }

  async divTextDisplayed(className: string): Promise<void> {
    await expect(this.divText(className), 'expecting span text to be visible').toBeVisible();
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

  async verifyParagraphText(text: string): Promise<void> {
    await expect(this.messageParagraph(text), 'expecting paragraph to be visible').toBeVisible();
  }

  async clickOnDisconnectButton(text: string): Promise<void> {
    const button = this.disconnectButton(text);
    await expect(button, 'expecting disconnect button to be visible').toBeVisible({ timeout: 30000 });
    await this.clickOnElement(button);
  }

  async headingIsPresent(linkText: string): Promise<void> {
    await expect(this.headingText(linkText), 'expecting heading to be visible').toBeVisible();
  }

}


