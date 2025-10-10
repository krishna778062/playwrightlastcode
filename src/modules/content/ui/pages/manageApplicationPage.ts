import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { ManageApplicationComponent } from '@/src/modules/content/ui/components/manageApplicationComponent';

export interface IManageApplicationPageActions {
  clickOnGovernance: () => Promise<void>;
  clickOnPrivileges: () => Promise<void>;
  clickOnDefaults: () => Promise<void>;
}

export interface IManageApplicationPageAssertions {}
export class ManageApplicationPage extends BasePage {
  private manageApplicationComponent: ManageApplicationComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.APPLICATION_SETTINGS);
    this.manageApplicationComponent = new ManageApplicationComponent(page);
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
}
