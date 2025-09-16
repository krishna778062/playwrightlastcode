import { Locator, Page, test } from '@playwright/test';

import { AdGroupComponent } from '../components/adGroupComponent';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';

export class adGroupPage extends BasePage {
  readonly adGroupLocator: Locator;
  readonly adGroupComponent: AdGroupComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.INTEGRATIONS_PEOPLE_PAGE);
    this.adGroupLocator = page.getByRole('button', { name: 'Add integration' });
    this.adGroupComponent = new AdGroupComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.adGroupLocator, {
        timeout: 30_000,
        assertionMessage:
          'Verifying that the custom page is loaded by assertion for app tiles list item count presence',
      });
    });
  }

  async clickOnButton(text: string): Promise<void> {
    return this.adGroupComponent.clickOnSpanContainButtonText(text);
  }

  /**
   * Click on radio button - better for radio button interactions
   * Use this for "Use Microsoft Entra ID groups", "Do not use Microsoft Entra ID groups", etc.
   */
  async clickOnRadioButton(text: string): Promise<void> {
    return this.adGroupComponent.clickOnSpanContainButtonText(text);
  }

  async verifyMicrosoftEntraIDGroupsVisibility(text: string): Promise<void> {
    return this.adGroupComponent.verifyMicrosoftEntraIDGroupsVisibility(text);
  }

  async clickOnButtonContainText(text: string): Promise<void> {
    return this.adGroupComponent.clickOnButtonContainText(text);
  }

  async adGroupsModalIsDisplayed(text: string): Promise<void> {
    return this.adGroupComponent.adGroupsModalIsDisplayed(text);
  }

  async selectADGroups(text: string): Promise<void> {
    return this.adGroupComponent.selectADGroups(text);
  }

  async validateMessage(text: string, number: string): Promise<void> {
    return this.adGroupComponent.validateMessage(text, number);
  }

  async divTextDisplayed(text: string): Promise<void> {
    return this.adGroupComponent.divTextDisplayed(text);
  }

  async verifyGroupType(text: string): Promise<void> {
    return this.adGroupComponent.verifyGroupType(text);
  }

  async verifyParagraphText(text: string): Promise<void> {
    return this.adGroupComponent.verifyParagraphText(text);
  }

  async clickOnDisconnectButton(text: string): Promise<void> {
    return this.adGroupComponent.clickOnDisconnectButton(text);
  }

  async headingIsPresent(text: string): Promise<void> {
    return this.adGroupComponent.headingIsPresent(text);
  }
}
