import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/pages/basePage';
import { AdGroupComponent } from '@/src/modules/integrations/components/adGroupComponent';

export class AdGroupPage extends BasePage {
  readonly adGroupComponent: AdGroupComponent;
  readonly scheduledSources: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.PEOPLE_DATA_PAGE);
    this.scheduledSources = page.getByRole('heading', { name: 'Scheduled sources' });
    this.adGroupComponent = new AdGroupComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.scheduledSources, {
        timeout: 30_000,
        assertionMessage: 'Verifying the page is loaded',
      });
    });
  }

  async clickOnSelectADGroupButton(text: string): Promise<void> {
    return this.adGroupComponent.clickOnSelectADGroupButton(text);
  }

  async clickOnAdGroupsOption(text: string): Promise<void> {
    return this.adGroupComponent.clickOnAdGroupsOption(text);
  }

  async clickOnDoneButton(text: string): Promise<void> {
    return this.adGroupComponent.clickOnSelectADGroupButton(text);
  }

  async selectGroup(text: string): Promise<void> {
    return this.adGroupComponent.selectADGroups(text);
  }

  async verifyAddedGroupsMessage(expectedCount: number): Promise<void> {
    return this.adGroupComponent.verifyAddedGroupsMessage(expectedCount);
  }

  async createAudiencesButtonVisibilty(text: string): Promise<void> {
    return this.adGroupComponent.createAudiencesButtonVisibilty(text);
  }

  async doNotCreateAudiencesButtonVisibilty(text: string): Promise<void> {
    return this.adGroupComponent.createAudiencesButtonVisibilty(text);
  }

  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    return this.adGroupComponent.verifyErrorMessage(expectedMessage);
  }

  async clickOnDisconnectAccountButton(sourceName: string, buttonText: string): Promise<void> {
    return this.adGroupComponent.clickOnDisconnectAccountButton(sourceName, buttonText);
  }

  async verifyDisconnectConfirmationText(expectedText: string): Promise<void> {
    return this.adGroupComponent.verifyDisconnectConfirmationText(expectedText);
  }

  async verifyGroupType(): Promise<void> {
    return this.adGroupComponent.verifyGroupType();
  }
}
