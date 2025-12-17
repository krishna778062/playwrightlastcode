import { Locator, Page, test } from 'playwright/test';

import { BaseComponent } from '@/src/core';

export class NotificationCustomizationItem extends BaseComponent {
  readonly itemHeading: Locator;
  readonly itemDescription: Locator;
  readonly customizationTemplateOptions: Locator;
  readonly expandOrCollapseButton: Locator;
  readonly accordionTriggerButton: Locator;

  constructor(
    readonly page: Page,
    readonly rootLocator: Locator
  ) {
    super(page, rootLocator);
    this.itemHeading = this.rootLocator.getByRole('heading', { name: 'Item heading' });
    this.itemDescription = this.rootLocator.getByRole('paragraph', { name: 'Item description' });
    this.customizationTemplateOptions = this.rootLocator.locator("[class*='NotificationSelectRadioList-module-label']");
    this.expandOrCollapseButton = this.rootLocator.getByTestId('i-arrowDown');
    this.accordionTriggerButton = this.rootLocator.locator("button[class*='Accordion-module__AccordionTrigger']");
  }

  /**
   * Expands the menu item
   */
  async expandTheMenuItem(): Promise<void> {
    await test.step('Expand the menu item', async () => {
      //if the menu item is collapsed, expand it
      const isExpanded = await this.accordionTriggerButton.getAttribute('aria-expanded');
      if (isExpanded === 'false') {
        await this.clickOnElement(this.expandOrCollapseButton, { stepInfo: 'Expand the menu item' });

        // Wait for template options to be visible after expansion
        await this.verifier.verifyTheElementIsVisible(this.customizationTemplateOptions.first(), {
          assertionMessage: 'Template options should be visible after expansion',
          timeout: 10_000,
        });
      }
    });
  }

  /**
   * Collapses the menu item
   */
  async collapseTheMenuItem(): Promise<void> {
    await test.step('Collapse the menu item', async () => {
      //if the menu item is expanded, collapse it
      const isExpanded = await this.accordionTriggerButton.getAttribute('aria-expanded');
      if (isExpanded === 'true') {
        await this.clickOnElement(this.expandOrCollapseButton, { stepInfo: 'Collapse the menu item' });
      }
    });
  }

  /**
   * Selects the template option
   * @param templateOption - The template option to select
   */
  async selectTemplateOption(templateOption: string): Promise<void> {
    await test.step('Select template option', async () => {
      const customizationTemplateToSelect = this.customizationTemplateOptions.filter({ hasText: templateOption });

      // Wait for the template option to be visible
      await this.verifier.verifyTheElementIsVisible(customizationTemplateToSelect, {
        assertionMessage: `Customization template ${templateOption} should be visible`,
        timeout: 10_000,
      });

      // Wait for the template option to be enabled before clicking
      await this.verifier.verifyTheElementIsEnabled(customizationTemplateToSelect, {
        assertionMessage: `Customization template ${templateOption} should be enabled`,
        timeout: 10_000,
      });

      await this.clickOnElement(customizationTemplateToSelect, {
        stepInfo: `Select template option ${templateOption}`,
      });
    });
  }
}
