import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { AdGroupComponent } from '@/src/modules/integrations/ui/components/adGroupComponent';

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

  async clickOnSubmitButton(text: string): Promise<void> {
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

  async verifyGroupType(): Promise<void> {
    return this.adGroupComponent.verifyGroupType();
  }

  async clickOnDoNotUseADGroupsButton(text: string): Promise<void> {
    return this.adGroupComponent.clickOnDoNotUseADGroupsRadioButton(text);
  }

  async verifyMicrosoftEntraButtonCount(expectedCount: number): Promise<void> {
    return this.adGroupComponent.verifyMicrosoftEntraButtonCount(expectedCount);
  }

  async clickOnClearGroupButton(groupName: string): Promise<void> {
    return this.adGroupComponent.clickOnClearGroupButton(groupName);
  }

  async clickOnSelectedGroupsTab(text: string): Promise<void> {
    return this.adGroupComponent.clickOnSelectedGroupsTab(text);
  }

  async removeIfGroupsAreSelected(useGroupsRadioText: string, selectGroupsButtonText: string): Promise<void> {
    return this.adGroupComponent.removeIfGroupsAreSelected(useGroupsRadioText, selectGroupsButtonText);
  }
}
