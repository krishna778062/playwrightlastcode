import { Locator, Page, test } from '@playwright/test';

import { SelectNotificationStep } from '../components/selectNotificationStep';
import { SubjectLineCustomizationComponent } from '../components/subjectLineCustomizationComponent';

import { BasePage, PAGE_ENDPOINTS } from '@/src/core';

export enum CustomizationNotificationSteps {
  SELECT_NOTIFICATION = 'SELECT_NOTIFICATION',
  SELECT_SUBJECT_LINE = 'SELECT_SUBJECT_LINE',
  MANAGE_TRANSLATIONS = 'MANAGE_TRANSLATIONS',
}

export class NotificationCustomizationPage extends BasePage {
  readonly addCustomizationButton: Locator;
  readonly selectNotificationStep: SelectNotificationStep;
  readonly subjectLineCustomizationComponent: SubjectLineCustomizationComponent;
  readonly nextButton: Locator;
  readonly saveButton: Locator;
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.NOTIFICATION_CUSTOMIZATION_PAGE);
    // "Add customization" is a link in QA, not a button
    this.addCustomizationButton = page.locator('a[href*="notifications-customization/add-override"]');
    this.selectNotificationStep = new SelectNotificationStep(page);
    this.subjectLineCustomizationComponent = new SubjectLineCustomizationComponent(page);
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  /**
   * Verifies the notification customization page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify the page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addCustomizationButton, {
        assertionMessage: 'Add customization button is visible',
        timeout: 30000,
      });
    });
  }

  /**
   * Clicks on the add customization button
   */
  async clickOnAddCustomizationButton(): Promise<void> {
    await test.step('Click on add customization button', async () => {
      await this.clickOnElement(this.addCustomizationButton);
    });
  }

  /**
   * Verifies the user is on the step
   * @param customizationStep - The customization step
   */
  async verifyUserIsOnStep(customizationStep: CustomizationNotificationSteps): Promise<void> {
    await test.step(`Verify user is on step: ${customizationStep} - > to add notification customization`, async () => {
      if (customizationStep === CustomizationNotificationSteps.SELECT_NOTIFICATION) {
        await this.selectNotificationStep.verifySelectNotificationStepIsLoaded();
      } else if (customizationStep === CustomizationNotificationSteps.SELECT_SUBJECT_LINE) {
        await this.subjectLineCustomizationComponent.verifySubjectLineCustomizationComponentIsLoaded();
      }
    });
  }

  /**
   * Verifies the next button is disabled
   */
  async verifyNextButtonIsDisabled(): Promise<void> {
    await test.step('Verify next button is disabled', async () => {
      await this.verifier.verifyTheElementIsDisabled(this.nextButton, {
        assertionMessage: 'Next button should be disabled',
      });
    });
  }

  async clickButton(buttonName: string, step?: string, timeout = 30_000): Promise<void> {
    const stepName = step || `Click ${buttonName}`;
    await test.step(stepName, async () => {
      const button = this.page.getByRole('button', { name: buttonName });
      await this.clickOnElement(button, { timeout });
    });
  }

  /**
   * Verifies that a toast message with the specified text is visible
   * @param message - The expected toast message text
   */
  async verifyToastMessage(message: string): Promise<void> {
    await test.step(`Verify toast message: ${message}`, async () => {
      const specificAlert = this.page.getByRole('alert').filter({ hasText: message }).first();
      await this.verifier.verifyTheElementIsVisible(specificAlert, {
        timeout: 15_000,
        assertionMessage: `Toast should contain: ${message}`,
      });
    });
  }

  /**
   * Deletes a customization from the menu
   * @param customizationText - Optional text to identify the specific customization row
   */
  async deleteCustomizationFromMenu(customizationText?: string): Promise<void> {
    await test.step('Delete customization from menu', async () => {
      // Click the 'More' menu button (first one if no specific text provided)
      const menuButton = customizationText
        ? this.page.locator(`tr:has-text("${customizationText}")`).getByRole('button', { name: 'More' }).first()
        : this.page.getByRole('button', { name: 'More' }).first();

      await this.clickOnElement(menuButton, { timeout: 10_000 });

      // Click delete option from menu
      const deleteOption = this.page.getByRole('button', { name: 'Delete' });
      await this.clickOnElement(deleteOption);

      // Wait for dialog and confirm deletion
      const dialog = this.page.getByRole('dialog');
      await dialog.waitFor({ state: 'visible', timeout: 5_000 });
      const confirmDeleteButton = dialog.getByRole('button', { name: 'Delete' });
      await this.clickOnElement(confirmDeleteButton);
    });
  }
}
