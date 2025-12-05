import { test } from '@playwright/test';

import { ALERT_NOTIFICATION_MESSAGES } from '../../constants/messageRepo';
import {
  MANAGE_TRANSLATIONS_TEXT,
  NotificationTestDataGenerator,
  PAGE_TEXT,
} from '../../tests/test-data/notification-customization.test-data';
import { NotificationFeatures } from '../components/selectNotificationStep';
import { NotificationCustomizationPage } from '../pages/notificationCustomizationPage';

export class NotificationCustomizationHelper {
  /**
   * Creates a notification customization with the specified feature and template
   * @param page - The notification customization page object
   * @param feature - The notification feature (e.g., MUST_READS, ALERTS)
   * @param template - The template name to use for this feature
   */
  static async createNotificationCustomization(
    page: NotificationCustomizationPage,
    feature: NotificationFeatures,
    template: string
  ): Promise<void> {
    await test.step(`Create notification customization for ${feature} with template ${template}`, async () => {
      // Wait for the listing page to be ready before clicking Add customization
      await page.verifyThePageIsLoaded();

      await page.clickOnAddCustomizationButton();

      // Wait for the Add customization page to fully load
      await page.verifier.verifyTheElementIsVisible(page.addCustomizationTitle, {
        timeout: 15_000,
      });

      // Wait for template items to be visible and loaded before selecting
      const templateCount = await page.countTemplateItems();
      if (templateCount > 0) {
        await page.verifier.verifyTheElementIsVisible(page.templateItems.first(), {
          timeout: 15_000,
        });
      }

      // Select template
      await page.selectNotificationStep.selectTemplateForFeature(feature, template);
      await page.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

      // Subject line step - select custom subject line
      await page.subjectLineCustomizationComponent.clickOnCustomSubjectLineOption();
      const customSubject = NotificationTestDataGenerator.generateRandomSubject();
      await page.subjectLineCustomizationComponent.fillCustomSubjectLine(customSubject);
      await page.clickButton(PAGE_TEXT.ADD_CUSTOMIZATION.BUTTONS.NEXT);

      // Manage translations step - just save
      await page.clickButton(MANAGE_TRANSLATIONS_TEXT.SAVE_BUTTON);

      // Verify success toast
      await page.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED);

      // Return to listing page
      await page.verifyThePageIsLoaded();

      // Wait for the newly created customization to appear in the listing
      const finalCount = await page.countNotificationItems();
      if (finalCount > 0) {
        await page.verifier.verifyTheElementIsVisible(page.notificationItems.first());
      }
    });
  }
}
