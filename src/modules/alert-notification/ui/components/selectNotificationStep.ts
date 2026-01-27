import { Locator, Page, test } from 'playwright/test';

import { NotificationCustomizationItem } from './notifcationCustomizationItem';

import { BaseComponent } from '@/src/core';

export enum NotificationFeatures {
  MUST_READS = 'Must reads',
  ALERTS = 'Alerts',
  FOLLOWS = 'Follows',
  DAILY_SUMMARY = 'Daily summary',
  DIGEST_EMAIL = 'Digest email',
}

export class SelectNotificationStep extends BaseComponent {
  readonly notificationFeatureItems: Locator;
  readonly accordionTitle: Locator;
  readonly accordionHeading: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.notificationFeatureItems = page.locator('[class*="Accordion-module__AccordionItem"]');
    this.accordionTitle = page.locator("[class*='Accordion-module__AccordionTitle']");
    this.accordionHeading = this.accordionTitle.locator('h3');
  }

  /**
   * Verifies the select notification step is loaded
   */
  async verifySelectNotificationStepIsLoaded(): Promise<void> {
    await test.step('Verify select notification step is loaded', async () => {
      // Use >= 1 (at least one item) and allow extra time for slower environments
      await this.verifier.verifyCountOfElementsIsGreaterThanOrEqualTo(this.notificationFeatureItems, 1, {
        assertionMessage:
          'Verify select notification step is loaded by asserting the presence of at least one notification feature item',
        timeout: 30_000,
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
        has: this.accordionHeading.filter({ hasText: feature }),
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

  /**
   * Expands a notification feature without selecting a template
   * @param feature - The feature to expand
   */
  async expandFeature(feature: NotificationFeatures): Promise<void> {
    await test.step(`Expand feature: ${feature}`, async () => {
      const notificationFeatureItem = await this.getNotificationFeatureItem(feature);
      await notificationFeatureItem.expandTheMenuItem();
    });
  }

  /**
   * Verifies that a template option is disabled for a feature
   * @param feature - The feature to check
   * @param template - The template that should be disabled
   */
  async verifyTemplateIsDisabled(feature: NotificationFeatures, template: string): Promise<void> {
    await test.step(`Verify template ${template} is disabled for feature: ${feature}`, async () => {
      const notificationFeatureItem = await this.getNotificationFeatureItem(feature);
      await notificationFeatureItem.expandTheMenuItem();
      await notificationFeatureItem.verifyTemplateOptionIsDisabled(template);
    });
  }

  /**
   * Verifies that a template is selected for a feature
   * @param feature - The feature to check
   * @param template - The template that should be selected
   */
  async verifyTemplateIsSelected(feature: NotificationFeatures, template: string): Promise<void> {
    await test.step(`Verify template ${template} is selected for feature: ${feature}`, async () => {
      const notificationFeatureItem = await this.getNotificationFeatureItem(feature);
      await notificationFeatureItem.expandTheMenuItem();
      await notificationFeatureItem.verifyTemplateOptionIsSelected(template);
    });
  }

  /**
   * Verifies that a template is NOT selected for a feature
   * @param feature - The feature to check
   * @param template - The template that should not be selected
   */
  async verifyTemplateIsNotSelected(feature: NotificationFeatures, template: string): Promise<void> {
    await test.step(`Verify template ${template} is NOT selected for feature: ${feature}`, async () => {
      const notificationFeatureItem = await this.getNotificationFeatureItem(feature);
      await notificationFeatureItem.expandTheMenuItem();
      await notificationFeatureItem.verifyTemplateOptionIsNotSelected(template);
    });
  }

  /**
   * Gets a notification feature item by its heading text
   * @param headingText - The heading text of the notification category
   * @returns The notification feature item
   */
  async getNotificationFeatureItemByHeading(headingText: string): Promise<NotificationCustomizationItem> {
    return await test.step(`Get notification feature item by heading: ${headingText}`, async () => {
      // Try exact match first
      let notificationFeatureItem = this.notificationFeatureItems
        .filter({
          has: this.accordionHeading.filter({ hasText: headingText }),
        })
        .first();

      // If exact match doesn't find anything, try case-insensitive partial match
      const count = await notificationFeatureItem.count();
      if (count === 0) {
        // Escape special regex characters and create a case-insensitive regex
        const escapedText = headingText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        notificationFeatureItem = this.notificationFeatureItems
          .filter({
            has: this.accordionHeading.filter({ hasText: new RegExp(escapedText, 'i') }),
          })
          .first();
      }

      await this.verifier.verifyTheElementIsVisible(notificationFeatureItem, {
        assertionMessage: `Notification feature item "${headingText}" should be visible`,
        timeout: 10_000,
      });
      return new NotificationCustomizationItem(this.page, notificationFeatureItem);
    });
  }

  /**
   * Expands all notification category panels and verifies each one is expanded
   * Note: If the accordion allows one panel open at a time, each panel will be expanded
   * and verified individually, then the next panel will be expanded (which may collapse the previous one)
   * @param categoryNames - Array of category names to expand
   */
  async expandAllPanels(categoryNames: readonly string[]): Promise<void> {
    await test.step('Expand all notification category panels', async () => {
      for (const categoryName of categoryNames) {
        const featureItem = await this.getNotificationFeatureItemByHeading(categoryName);
        await featureItem.expandTheMenuItem();
        // Wait for the panel to actually be expanded before moving to the next one
        await this.verifier.verifyElementHasAttribute(featureItem.accordionTriggerButton, 'aria-expanded', 'true', {
          assertionMessage: `Panel "${categoryName}" should be expanded`,
          timeout: 10_000,
        });
        // Add a small delay to ensure the expansion animation completes
        await this.page.waitForTimeout(100);
      }
    });
  }

  /**
   * Verifies that all notification category panels are expanded
   * @param categoryNames - Array of category names to verify
   */
  async verifyAllPanelsAreExpanded(categoryNames: readonly string[]): Promise<void> {
    await test.step('Verify all notification category panels are expanded', async () => {
      for (const categoryName of categoryNames) {
        const featureItem = await this.getNotificationFeatureItemByHeading(categoryName);
        // Use verifier to wait for the attribute to be set correctly
        await this.verifier.verifyElementHasAttribute(featureItem.accordionTriggerButton, 'aria-expanded', 'true', {
          assertionMessage: `Panel "${categoryName}" should be expanded`,
          timeout: 10_000,
        });
      }
    });
  }

  /**
   * Verifies that all notification category panels are visible
   * @param categoryNames - Array of category names to verify
   */
  async verifyAllPanelsAreVisible(categoryNames: readonly string[]): Promise<void> {
    await test.step('Verify all notification category panels are visible', async () => {
      const notFoundCategories: string[] = [];
      for (const categoryName of categoryNames) {
        try {
          await this.getNotificationFeatureItemByHeading(categoryName);
        } catch {
          // If category is not found, collect it for reporting
          notFoundCategories.push(categoryName);
        }
      }
      // If any categories were not found, throw an error with details
      if (notFoundCategories.length > 0) {
        throw new Error(
          `The following notification categories were not found on the page: ${notFoundCategories.join(', ')}`
        );
      }
    });
  }

  /**
   * Verifies that all notification categories display correct headers and subheaders
   * @param headersAndSubheaders - Array of objects containing header and subheader text
   */
  async verifyAllCategoryHeadersAndSubheaders(
    headersAndSubheaders: readonly { header: string; subheader: string }[]
  ): Promise<void> {
    await test.step('Verify all notification categories display correct headers and subheaders', async () => {
      for (const { header, subheader } of headersAndSubheaders) {
        await test.step(`Verify category "${header}" displays correct header and subheader`, async () => {
          const featureItem = await this.getNotificationFeatureItemByHeading(header);

          // Scroll the accordion item into view to ensure it's visible
          await featureItem.rootLocator.scrollIntoViewIfNeeded();

          // Verify header text - use h3 locator directly since we already found it by heading text
          const headerLocator = featureItem.rootLocator
            .locator("[class*='Accordion-module__AccordionTitle']")
            .locator('h3')
            .filter({ hasText: header });
          await this.verifier.verifyElementHasText(headerLocator, header, {
            assertionMessage: `Header "${header}" should match expected text`,
            timeout: 10_000,
          });

          // Verify subheader text - use getByText to find the description text anywhere within the accordion item
          const descriptionLocator = featureItem.rootLocator.getByText(subheader, { exact: false });
          await this.verifier.verifyTheElementIsVisible(descriptionLocator, {
            assertionMessage: `Subheader for "${header}" should be visible`,
            timeout: 10_000,
          });
          // Verify the text content matches
          await this.verifier.verifyElementHasText(descriptionLocator, subheader, {
            assertionMessage: `Subheader for "${header}" should match expected text`,
            timeout: 10_000,
          });
        });
      }
    });
  }

  /**
   * Verifies templates for a notification category after expanding it
   * @param header - The header text of the notification category (used to locate the category)
   * @param templates - Array of template texts that should be displayed
   */
  async verifySelectTemplateText(header: string, templates: readonly string[]): Promise<void> {
    await test.step(`Verify templates for category "${header}"`, async () => {
      const featureItem = await this.getNotificationFeatureItemByHeading(header);

      // Expand the category if not already expanded
      await featureItem.expandTheMenuItem();

      // Verify each template is displayed
      for (const template of templates) {
        await test.step(`Verify template "${template}" is displayed`, async () => {
          const templateLocator = featureItem.customizationTemplateOptions.filter({ hasText: template });
          await this.verifier.verifyTheElementIsVisible(templateLocator, {
            assertionMessage: `Template "${template}" should be visible for "${header}"`,
            timeout: 10_000,
          });
        });
      }
    });
  }

  /**
   * Verifies that a category has templates with radio buttons after expanding
   * @param categoryName - The name of the category to verify
   */
  async verifyCategoryHasTemplatesWithRadioButtons(categoryName: string): Promise<void> {
    await test.step(`Verify category "${categoryName}" has templates with radio buttons`, async () => {
      const featureItem = await this.getNotificationFeatureItemByHeading(categoryName);

      // Scroll the accordion item into view
      await featureItem.rootLocator.scrollIntoViewIfNeeded();

      // Expand the category if not already expanded
      await featureItem.expandTheMenuItem();

      // Verify that at least one template option is displayed
      const templateCount = await featureItem.customizationTemplateOptions.count();
      if (templateCount === 0) {
        throw new Error(`Category "${categoryName}" should have at least one template option but found none`);
      }

      // Verify that each template has a radio button
      for (let i = 0; i < templateCount; i++) {
        const templateOption = featureItem.customizationTemplateOptions.nth(i);
        const radioInput = templateOption.locator('input[type="radio"]');

        await this.verifier.verifyTheElementIsVisible(radioInput, {
          assertionMessage: `Template option ${i + 1} in category "${categoryName}" should have a visible radio button`,
          timeout: 10_000,
        });
      }
    });
  }

  /**
   * Verifies that all categories have templates with radio buttons after expanding
   * @param categoryNames - Array of category names to verify
   */
  async verifyAllCategoriesHaveTemplatesWithRadioButtons(categoryNames: readonly string[]): Promise<void> {
    await test.step('Verify all categories have templates with radio buttons', async () => {
      for (const categoryName of categoryNames) {
        await this.verifyCategoryHasTemplatesWithRadioButtons(categoryName);
      }
    });
  }
}
