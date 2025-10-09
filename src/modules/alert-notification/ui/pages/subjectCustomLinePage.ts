import { NotificationCustomizationComponent } from '@alert-notification/ui/components/notificationCustomizationComponent';
import { expect, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';

/**
 * Page Object for Subject Custom Line notification customization
 * Handles navigation and exposes component for UI interactions
 */
export class SubjectCustomLinePage extends BasePage {
  readonly notificationCustomizationComponent: NotificationCustomizationComponent;
  private static hasNavigatedBefore = false;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.NOTIFICATION_CUSTOMIZATION_PAGE);
    this.notificationCustomizationComponent = new NotificationCustomizationComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      await this.notificationCustomizationComponent.expectAddCustomizationVisible();
      await this.notificationCustomizationComponent.verifyText('Notification customization');
      await this.verifyCorrectPageUrl();
    });
  }

  private async verifyCorrectPageUrl(): Promise<void> {
    await test.step('Verify correct page URL', async () => {
      await expect(this.page, 'Should be on notification customization page').toHaveURL(
        /.*notification-customization.*/
      );
    });
  }

  async navigateToNotificationCustomization(): Promise<void> {
    await test.step('Navigate to notification customization', async () => {
      if (!SubjectCustomLinePage.hasNavigatedBefore) {
        // First time - use menu navigation to test navigation functionality
        await this.page.waitForLoadState('domcontentloaded');
        await this.notificationCustomizationComponent.navigateToApplicationSettings();
        await this.notificationCustomizationComponent.navigateToApplicationTab();
        await this.notificationCustomizationComponent.navigateToDefaultsTab();
        await this.notificationCustomizationComponent.navigateToNotificationCustomizationTab();
        await this.verifyThePageIsLoaded();
        SubjectCustomLinePage.hasNavigatedBefore = true;
      } else {
        // use direct endpoint for efficiency from 2nd test case onwards
        await this.loadPage();
        await this.verifyThePageIsLoaded();
      }
    });
  }
}
