import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';
import { OktaGroupComponent } from '@/src/modules/integrations/components/oktaGroupComponent';

export class OktaGroupPage extends BasePage {
  readonly oktaGroupComponent: OktaGroupComponent;
  readonly scheduledSources: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.PEOPLE_DATA_PAGE);
    this.scheduledSources = page.getByRole('heading', { name: 'Scheduled sources' });
    this.oktaGroupComponent = new OktaGroupComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.scheduledSources, {
        timeout: 30_000,
        assertionMessage: 'Verifying the page is loaded',
      });
    });
  }

  async clickOnCheckbox(): Promise<void> {
    return this.oktaGroupComponent.clickOnCheckbox();
  }

  async fillOktaCredentials(oktaLink: string, apiToken: string): Promise<void> {
    return this.oktaGroupComponent.fillOktaCredentials(oktaLink, apiToken);
  }

  async clickOnSaveButton(): Promise<void> {
    return this.oktaGroupComponent.clickOnSaveButton();
  }

  async clickOnOktaGroupOption(text: string): Promise<void> {
    return this.oktaGroupComponent.clickOnOktaGroupOption(text);
  }

  async clickOnSelectOktaGroupButton(text: string): Promise<void> {
    return this.oktaGroupComponent.clickOnSelectOktaGroupButton(text);
  }

  async clickOnSelectOktaGroup(text: string): Promise<void> {
    return this.oktaGroupComponent.clickOnSelectOktaGroup(text);
  }

  async clickOnDoneButton(text: string): Promise<void> {
    return this.oktaGroupComponent.clickOnSelectOktaGroupButton(text);
  }

  async visiblityOfSelectOktaGroupButton(text: string): Promise<void> {
    return this.oktaGroupComponent.visiblityOfSelectOktaGroupButton(text);
  }

  async clickOnUnCheckOkta(): Promise<void> {
    return this.oktaGroupComponent.clickOnUnCheckOkta();
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    return this.oktaGroupComponent.verifyErrorMessage(expectedMessage);
  }

  async verifyDoNotUseOktaGroupsIsSelected(text: string): Promise<void> {
    return this.oktaGroupComponent.verifyDoNotUseOktaGroupsRadioIsSelected(text);
  }

  async verifyAddedGroupsMessage(expectedCount: number): Promise<void> {
    return this.oktaGroupComponent.verifyAddedGroupsMessage(expectedCount);
  }

  async clickOnSelectedGroupsTab(text: string): Promise<void> {
    return this.oktaGroupComponent.clickOnSelectedGroupsTab(text);
  }

  async clickOnClearGroupButton(groupText: string): Promise<void> {
    return this.oktaGroupComponent.clickOnClearGroupButton(groupText);
  }

  async verifyRemovedGroupsMessage(expectedCount: number): Promise<void> {
    return this.oktaGroupComponent.verifyRemovedGroupsMessage(expectedCount);
  }

  async clickOnConfirmButton(): Promise<void> {
    return this.oktaGroupComponent.clickOnConfirmButton();
  }
}
