import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { ManageApplicationComponent } from '@/src/modules/content/ui/components/manageApplicationComponent';

export interface IManageApplicationPageActions {
  clickOnGovernance: () => Promise<void>;
  clickOnPrivileges: () => Promise<void>;
  clickOnDefaults: () => Promise<void>;
  clickOnIntegrations: () => Promise<void>;
  clickOnSave: () => Promise<void>;
  disableQuestionAndAnswerFeature: () => Promise<void>;
  enableQuestionAndAnswerFeature: () => Promise<void>;
}

export interface IManageApplicationPageAssertions {
  verifyToastMessage: (message: string) => Promise<void>;
}
export interface IManageApplicationPageAssertions {}
export class ManageApplicationPage extends BasePage {
  private manageApplicationComponent: ManageApplicationComponent;
  readonly integrationButton: Locator;
  readonly saveButton: Locator;
  readonly disableQuestionAndAnswer: Locator;
  readonly enableQuestionAndAnswer: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.APPLICATION_SETTINGS);
    this.manageApplicationComponent = new ManageApplicationComponent(page);
    this.integrationButton = page.getByRole('tab', { name: 'Integrations' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.disableQuestionAndAnswer = page.locator('#isQuestionAnswerEnabled_false');
    this.enableQuestionAndAnswer = page.locator('#isQuestionAnswerEnabled_true');
  }

  get actions(): IManageApplicationPageActions {
    return this;
  }

  get assertions(): IManageApplicationPageAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify manage application page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.manageApplicationComponent.manageApplicationHeading, {
        assertionMessage: 'Manage application screen is visible',
      });
    });
  }

  async clickOnGovernance(): Promise<void> {
    await test.step('Clicking on governance', async () => {
      await this.clickOnElement(this.manageApplicationComponent.clickingOnGovernance);
    });
  }

  async clickOnPrivileges(): Promise<void> {
    await test.step('Clicking on privileges', async () => {
      await this.clickOnElement(this.manageApplicationComponent.clickingOnPrivileges);
    });
  }

  async clickOnDefaults(): Promise<void> {
    await test.step('Clicking on defaults', async () => {
      await this.clickOnElement(this.manageApplicationComponent.clickingOnDefaults);
    });
  }

  async clickOnIntegrations(): Promise<void> {
    await test.step('Clicking on integrations', async () => {
      await this.clickOnElement(this.integrationButton);
    });
  }

  async clickOnSave(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.saveButton);
    });
  }

  async disableQuestionAndAnswerFeature(): Promise<void> {
    await test.step('Disabling question and answer feature', async () => {
      await this.clickOnElement(this.disableQuestionAndAnswer);
    });
  }

  async enableQuestionAndAnswerFeature(): Promise<void> {
    await test.step('Enabling question and answer feature', async () => {
      await this.clickOnElement(this.enableQuestionAndAnswer);
    });
  }

  async verifyToastMessage(message: string): Promise<void> {
    await test.step('Verifying toast message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.toastMessages.filter({ hasText: message }));
    });
  }
}
