import { Locator, Page, test } from 'playwright/test';

import { NotificationCustomizationItem } from './notifcationCustomizationItem';

import { BaseComponent } from '@/src/core';

export enum NotificationFeatures {
  MUST_READS = 'Must reads',
  ALERTS = 'Alerts',
  FOLLOWS = 'Follows',
}

export class SelectNotificationStep extends BaseComponent {
  readonly notificationFeatureItems: Locator;
  constructor(readonly page: Page) {
    super(page);
    this.notificationFeatureItems = page.locator('[class*="Accordion-module__AccordionItem"]');
  }

  /**
   * Verifies the select notification step is loaded
   */
  async verifySelectNotificationStepIsLoaded(): Promise<void> {
    await test.step('Verify select notification step is loaded', async () => {
      await this.verifier.verifyCountOfElementsIsGreaterThan(this.notificationFeatureItems, 1, {
        assertionMessage:
          'Verify select notification step is loaded by asserting the presence of at least one notification feature item',
      });
    });
  }

  /**
   * Gets the notification feature item
   * @param feature - The feature to get
   * @returns The notification feature item
   */
  async getNotificationFeatureItem(feature: NotificationFeatures): Promise<NotificationCustomizationItem> {
    return await test.step('Get notification feature item', async () => {
      const notificationFeatureItem = this.notificationFeatureItems.filter({
        has: this.page
          .locator("[class*='Accordion-module__AccordionTitle']")
          .locator('h3')
          .filter({ hasText: feature }),
      });
      await this.verifier.verifyTheElementIsVisible(notificationFeatureItem, {
        assertionMessage: `Notification feature item ${feature} should be visible`,
      });
      return new NotificationCustomizationItem(this.page, notificationFeatureItem);
    });
  }

  async selectTemplateForFeature(feature: NotificationFeatures, template: string): Promise<void> {
    await test.step(`Select template ${template} for feature: ${feature} - > to add notification customization`, async () => {
      const notificationFeatureItem = await this.getNotificationFeatureItem(feature);
      await notificationFeatureItem.expandTheMenuItem();
      await notificationFeatureItem.selectTemplateOption(template);
    });
  }
}
