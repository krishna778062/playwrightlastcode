import { Page, test } from '@playwright/test';

import { ApplicationNotificationSettingsComponent } from '../components/applicationNotificationSettingsComponent';
import { CommonActionsComponent } from '../components/commonActionsComponent';
import { DefaultNotificationSettingsComponent } from '../components/notificationSettingsComponent';

import { BasePage, PAGE_ENDPOINTS } from '@/src/core';

export class ApplicationNotificationSettingsPage extends BasePage {
  readonly applicationNotificationSettingsComponent: ApplicationNotificationSettingsComponent;
  readonly commonActionsComponent: CommonActionsComponent;
  readonly defaultNotificationSettingsComponent: DefaultNotificationSettingsComponent;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.APPLICATION_GENERAL_SETTINGS_PAGE);
    this.applicationNotificationSettingsComponent = new ApplicationNotificationSettingsComponent(page);
    this.commonActionsComponent = new CommonActionsComponent(page);
    this.defaultNotificationSettingsComponent = new DefaultNotificationSettingsComponent(page);
  }

  /**
   * Verifies the application general settings page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify application general settings page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(
        this.applicationNotificationSettingsComponent.manageApplicationText,
        {
          assertionMessage: 'Application general settings page should be visible',
          timeout: 30000,
        }
      );
    });
  }
}
