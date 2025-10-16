import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { PeopleTabComponent } from '@/src/modules/integrations/ui/components/peopleTabComponent';

export class PeopleTabPage extends BasePage {
  readonly userProvisioningHeading: Locator;
  readonly peopleTabComponent: PeopleTabComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.USER_SYNCING_PAGE);
    this.userProvisioningHeading = page.getByRole('heading', { name: 'User provisioning' });
    this.peopleTabComponent = new PeopleTabComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.userProvisioningHeading, {
        timeout: 30_000,
        assertionMessage: 'Verifying User provisioning heading is visible',
      });
    });
  }

  async clickOnTab(text: string): Promise<void> {
    await this.peopleTabComponent.clickOnTab(text);
  }

  async verifyNavigatedToPeoplePage(): Promise<void> {
    await this.peopleTabComponent.verifyNavigatedToPeoplePage();
  }

  async selectProvisioningSource(option: string): Promise<void> {
    await this.peopleTabComponent.selectProvisioningSource(option);
  }

  async verifyAllUserFieldsAreDisplayed(): Promise<void> {
    await this.peopleTabComponent.verifyAllUserFieldsAreDisplayed();
  }

  async selectSyncingSource(option: string): Promise<void> {
    await this.peopleTabComponent.selectSyncingSource(option);
  }

  async checkIntegrationIfNotChecked(): Promise<void> {
    await this.peopleTabComponent.checkIntegrationIfNotChecked();
  }

  async getEditableSettingForAllMergeFields(): Promise<Record<string, string>> {
    return await this.peopleTabComponent.getEditableSettingForAllMergeFields();
  }

  async getEditableSettingForAllNonMergeFields(): Promise<Record<string, string>> {
    return await this.peopleTabComponent.getEditableSettingForAllNonMergeFields();
  }

  async verifyBothValuesForEditableSetting(): Promise<void> {
    await this.peopleTabComponent.verifyBothValuesForEditableSetting();
  }

  async getDisplaySettingForAllMergeFields(): Promise<Record<string, string>> {
    return await this.peopleTabComponent.getDisplaySettingForAllMergeFields();
  }

  async isFieldDisplayed(fieldName: string): Promise<string> {
    return await this.peopleTabComponent.isFieldDisplayed(fieldName);
  }

  async getDisplaySettingForNonMergeFields(): Promise<Record<string, string>> {
    return await this.peopleTabComponent.getDisplaySettingForNonMergeFields();
  }

  async verifyBothValuesForDisplaySetting(): Promise<void> {
    await this.peopleTabComponent.verifyBothValuesForDisplaySetting();
  }

  async verifyDisableFieldsForSyncing(): Promise<void> {
    await this.peopleTabComponent.verifyDisableFieldsForSyncing();
  }
}
