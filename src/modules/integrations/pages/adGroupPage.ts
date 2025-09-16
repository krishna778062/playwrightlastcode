import { Locator, Page, test } from '@playwright/test';

import { AdGroupComponent } from '../components/adGroupComponent';
import { BaseAppTileComponent } from '../components/baseAppTileComponent';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';

export class adGroupPage extends BasePage {
  readonly adGroupComponent: AdGroupComponent;
  readonly appTileComponent: BaseAppTileComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.PEOPLE_DATA_PAGE);
    this.adGroupComponent = new AdGroupComponent(page);
    this.appTileComponent = new BaseAppTileComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      // await this.verifier.verifyTheElementIsVisible(this.adGroupLocator, {
      //   timeout: 30_000,
      //   assertionMessage: 'Verifying the page is loaded',
      // });
    });
  }

  async clickOnButton(text: string): Promise<void> {
    return this.adGroupComponent.clickOnButton(text);
  }

  async clickOnRadioButton(text: string): Promise<void> {
    return this.adGroupComponent.clickOnSpanContainButtonText(text);
  }

  async selectGroup(text: string): Promise<void> {
    return this.adGroupComponent.selectADGroups(text);
  }

  async validateMessage(text: string, number: string): Promise<void> {
    return this.adGroupComponent.validateMessage(text, number);
  }

  async AudienceOptionDisplayed(text: string): Promise<void> {
    return this.adGroupComponent.VerifyRadioButtonText(text);
  }

  async verifyGroupType(text: string): Promise<void> {
    return this.adGroupComponent.verifyGroupType(text);
  }

  async clickOnDisconnectButton(text: string): Promise<void> {
    return this.adGroupComponent.clickOnDisconnectButton(text);
  }

  async confirmDisconnect(text: string): Promise<void> {
    return this.adGroupComponent.headingIsPresent(text);
  }

  async verifyMessage(message: string): Promise<void> {
    return this.appTileComponent.verifyToastMessage(message);
  }
}
