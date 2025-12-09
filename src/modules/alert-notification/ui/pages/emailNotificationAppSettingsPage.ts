import { Locator, Page, test } from '@playwright/test';

import { NotificationCustomizationPage } from './notificationCustomizationPage';

import { BasePage, PAGE_ENDPOINTS } from '@/src/core';

export class EmailNotificationAppSettingsPage extends BasePage {
  readonly notificationCustomizationOption: Locator;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.EMAIL_NOTIFICATION_APP_SETTINGS_PAGE);
    this.notificationCustomizationOption = page.getByRole('tab', { name: 'Notification customization' });
  }

  /**
   * Verifies the email notification app settings page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify email notification app settings page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.notificationCustomizationOption, {
        assertionMessage: 'Email notification app settings page is loaded',
      });
    });
  }

  /**
   * Opens the notification customization tab
   * @returns The notification customization page
   */
  async openNotificationCustomizationTab(): Promise<NotificationCustomizationPage> {
    return await test.step('Open notification customization tab', async () => {
      const notificationCustomizationPage = new NotificationCustomizationPage(this.page);
      await this.clickOnElement(this.notificationCustomizationOption);
      await notificationCustomizationPage.verifyThePageIsLoaded();
      return notificationCustomizationPage;
    });
  }
}
