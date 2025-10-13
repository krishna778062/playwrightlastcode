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
    this.addCustomizationButton = page.getByText('Add customization');
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
   * Clicks on the next button
   */
  async clickOnNextButton(): Promise<void> {
    await test.step('Click on next button', async () => {
      await this.clickOnElement(this.nextButton, { stepInfo: 'Click on next button' });
    });
  }

  /**
   * Clicks on the save button
   */
  async clickOnSaveButton(): Promise<void> {
    await test.step('Click on save button', async () => {
      await this.clickOnElement(this.saveButton, { stepInfo: 'Click on save button' });
    });
  }
}
