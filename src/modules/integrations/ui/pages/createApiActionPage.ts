import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { CreateApiActionComponent } from '@/src/modules/integrations/ui/components/createApiActionComponent';

export class CreateApiActionPage extends BasePage {
  readonly createApiActionComponent: CreateApiActionComponent;

  constructor(page: Page) {
    super(page, `${PAGE_ENDPOINTS.API_ACTIONS_PAGE}/create`);
    this.createApiActionComponent = new CreateApiActionComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      await this.createApiActionComponent.verifyPageIsLoaded();
    });
  }

  async selectCustomApp(appName: string): Promise<void> {
    return this.createApiActionComponent.selectCustomApp(appName);
  }

  async enterApiActionName(actionName: string): Promise<void> {
    return this.createApiActionComponent.enterApiActionName(actionName);
  }

  async verifyButtonsAreDisabled(): Promise<void> {
    return this.createApiActionComponent.verifyButtonsAreDisabled();
  }

  async verifyButtonsAreEnabled(): Promise<void> {
    return this.createApiActionComponent.verifyButtonsAreEnabled();
  }

  async clickCancel(): Promise<void> {
    return this.createApiActionComponent.clickCancel();
  }

  async clickSaveDraft(): Promise<void> {
    return this.createApiActionComponent.clickSaveDraft();
  }

  async clickNext(): Promise<void> {
    return this.createApiActionComponent.clickNext();
  }

  async verifyCancelButtonNavigation(): Promise<void> {
    return this.createApiActionComponent.verifyCancelButtonNavigation();
  }

  async verifyAddCustomAppLinkNavigation(): Promise<void> {
    return this.createApiActionComponent.verifyAddCustomAppLinkNavigation();
  }

  async verifyBackToApiActionsLinkNavigation(): Promise<void> {
    return this.createApiActionComponent.verifyBackToApiActionsLinkNavigation();
  }

  async verifyStepIndicatorsDisabled(): Promise<void> {
    return this.createApiActionComponent.verifyStepIndicatorsDisabled();
  }

  async verifyNavigationToApiActionsList(): Promise<void> {
    return this.createApiActionComponent.verifyNavigationToApiActionsList();
  }

  async verifyApiConfigurationStepIsVisible(): Promise<void> {
    return this.createApiActionComponent.verifyApiConfigurationStepIsVisible();
  }
}
