import { Page, test } from '@playwright/test';

import { SideNavBarComponent } from '@core/ui/components/sideNavBarComponent';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { ApplicationSettingsComponent } from '@/src/modules/content/ui/components/applicationSettingsComponent';

export interface IApplicationScreenPageActions {
  clickOnApplication: () => Promise<void>;
}

export class ApplicationScreenPage extends BasePage implements IApplicationScreenPageActions {
  private sideNavBarComponent: SideNavBarComponent;
  private applicationSettingsComponent: ApplicationSettingsComponent;
  actions: any;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.APPLICATION_SETTINGS);
    this.sideNavBarComponent = new SideNavBarComponent(page);
    this.applicationSettingsComponent = new ApplicationSettingsComponent(page);
    this.actions = {
      clickOnApplication: this.clickOnApplication.bind(this),
    };
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify application settings page is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.applicationSettingsComponent.pageHeading, {
        assertionMessage: 'Application settings page should be visible',
      });
    });
  }

  async clickOnApplication(): Promise<void> {
    await test.step('Clicking on application', async () => {
      await this.clickOnElement(this.applicationSettingsComponent.clickOnApplication);
    });
  }
}
