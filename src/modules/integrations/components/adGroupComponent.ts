import { expect, Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

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

    this.microsoftEntraButton = this.rootLocator.getByRole('button', { name: /Microsoft Entra ID/ });
    this.adGroupsModal = (className: string) => this.rootLocator.locator(`.${className}`);
    this.adGroupsOption = (text: string) => this.rootLocator.locator('ul.results li').getByText(text, { exact: true });
    this.spanContainText = (text: string) => this.rootLocator.locator('span').filter({ hasText: text });
    this.buttonContainText = (text: string) => this.rootLocator.getByRole('button', { name: new RegExp(text) });
    this.messageParagraph = (text: string) => this.rootLocator.locator('p').filter({ hasText: text });
    this.selectedCount = (count: string) => this.rootLocator.locator('strong').filter({ hasText: count });
    this.divText = (className: string) => this.rootLocator.locator(`.${className}`);
    this.groupTypeDropdown = (id: string) => this.rootLocator.locator(`#${id}`);
    this.disconnectButton = (ariaLabel: string) => this.rootLocator.getByRole('button', { name: ariaLabel });
    this.headingText = (text: string) => this.rootLocator.getByRole('heading', { name: text, level: 2 });
  }

  async verifyMicrosoftEntraIDGroupsVisibility(text: string): Promise<void> {
    await expect(this.buttonContainText(text)).toBeVisible();
  }

  async adGroupsModalIsDisplayed(className: string): Promise<void> {
    await expect(this.adGroupsModal(className)).toBeVisible();
  }

  async selectADGroups(text: string): Promise<void> {
    const option = this.adGroupsOption(text);
    await expect(option).toBeVisible({ timeout: 30000 });
    await option.click();
  }

  async clickOnSpanContainButtonText(text: string): Promise<void> {
    const span = this.spanContainText(text);
    await expect(span).toBeVisible({ timeout: 30000 });
    await span.click();
  }

  async clickOnRadioButtonLabel(text: string): Promise<void> {
    const radioButton = this.rootLocator.getByRole('radio', { name: text });
    await expect(radioButton, `expecting radio button with text "${text}" to be visible`).toBeVisible({
      timeout: 30000,
    });
    await radioButton.click();
  }

  async clickOnButtonContainText(text: string): Promise<void> {
    const button = this.buttonContainText(text);
    await expect(button).toBeVisible({ timeout: 30000 });
    await button.click();
  }

  async validateMessage(text: string, number: string): Promise<void> {
    await expect(this.messageParagraph(text)).toBeVisible();
    await expect(this.selectedCount(number)).toBeVisible();
  }

  async divTextDisplayed(className: string): Promise<void> {
    await expect(this.divText(className)).toBeVisible();
  }

  async verifyGroupType(id: string): Promise<void> {
    const dropdown = this.groupTypeDropdown(id);
    await expect(dropdown).toBeVisible();

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
