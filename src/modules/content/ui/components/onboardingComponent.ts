import { Locator, Page, test } from '@playwright/test';

import { OnboardingOption } from '@modules/content/constants';
import { Locator, Page, Response, test } from '@playwright/test';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { TagOption } from '@modules/content/constants';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class OnboardingComponent extends BaseComponent {
  readonly onboardingTab: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly contentOuterDiv: Locator;

  constructor(page: Page) {
    super(page);
    this.onboardingTab = page.getByRole('tab', { name: 'Onboarding' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.contentOuterDiv = page.locator('.ManageContentListItem').first();
  }
  selectOnboardingRadioButton(option: OnboardingOption): Locator {
  selectOnboardingRadioButton(option: TagOption): Locator {
    return this.page.getByRole('radio', { name: option });
  }
  verifyOnboardingTabVisible(tabName: string): Locator {
    return this.page.getByText(tabName).first();
  }
  async selectOnboardingOption(option: OnboardingOption): Promise<void> {
  async selectOnboardingOption(option: TagOption): Promise<void> {
    await test.step(`Select onboarding option: ${option}`, async () => {
      await this.checkElement(this.selectOnboardingRadioButton(option));
    });
  }
  async verifyTagIsVisibleOnContent(option: OnboardingOption): Promise<void> {
  async verifyTagIsVisibleOnContent(option: TagOption): Promise<void> {
    await test.step(`Verify tag is visible on content: ${option}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.verifyOnboardingTabVisible(option));
    });
  }
  async verifyAlreadySelectedOnboardingOptionVisible(option: OnboardingOption): Promise<void> {
  async verifyAlreadySelectedOnboardingOptionVisible(option: TagOption): Promise<void> {
    await test.step(`Verify already selected onboarding option is visible: ${option}`, async () => {
      await this.selectOnboardingRadioButton(option).isChecked();
    });
  }
  async saveButtonShouldBeDisabled(): Promise<void> {
    await test.step('Save button should be disabled', async () => {
      await this.verifier.verifyTheElementIsDisabled(this.saveButton);
    });
  }
  async clickOnSaveButton(): Promise<void> {
    await test.step('Click on save button', async () => {
      await this.clickOnElement(this.saveButton);
    });
  }
  async verifyTagShouldNotBeVisibleOnContent(option: OnboardingOption): Promise<void> {
      await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.saveButton),
        (response: Response) =>
          response.url().includes(API_ENDPOINTS.content.onboarding) &&
          response.request().method() === 'POST' &&
          response.status() === 200,
        {
          timeout: 20_000,
        }
      );
    });
  }
  async verifyTagShouldNotBeVisibleOnContent(option: TagOption): Promise<void> {
    await test.step(`Verify tag should not be visible on content: ${option}`, async () => {
      const textContent = await this.contentOuterDiv.textContent();
      console.log('textContent', textContent);
      if (textContent && textContent.includes(option)) {
        await this.verifier.verifyTheElementIsNotVisible(this.verifyOnboardingTabVisible(option));
      }
    });
  }
  async saveOnboardingSelection(): Promise<void> {
    await test.step('Save onboarding selection', async () => {
      await this.clickOnElement(this.saveButton);
    });
  }

  async cancelOnboardingSelection(): Promise<void> {
    await test.step('Cancel onboarding selection', async () => {
      await this.clickOnElement(this.cancelButton);
    });
  }

  async verifyOnboardingOptionVisible(): Promise<void> {
    await test.step('Verify onboarding option is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.onboardingTab);
    });
  }
}
