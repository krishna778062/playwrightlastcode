import {
  NotificationTestDataGenerator,
  STEPPER_STEPS,
  SUBJECT_LINES,
  TemplateType,
  TEST_EMAILS,
} from '@alert-notification-test-data/notification-customization.test-data';
import { Page } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

import { SubjectCustomLinePage } from './subjectCustomLinePage';

// Simple constants for UI text
const SUBJECT_LINE_OPTIONS = {
  DEFAULT: 'Default subject line',
  CUSTOM: 'Custom subject line',
} as const;

/**
 * Workflow component for notification customization tests
 * Handles UI workflow orchestration for notification customization tests
 */
export class NotificationWorkflow extends BaseComponent {
  constructor(
    page: Page,
    private readonly notificationPage: SubjectCustomLinePage
  ) {
    super(page);
  }

  async navigateToNotificationCustomization(): Promise<void> {
    await this.notificationPage.navigateToNotificationCustomization();
  }

  async selectTemplate(templateType: TemplateType): Promise<void> {
    await this.notificationPage.startAddCustomization();
    switch (templateType) {
      case 'mustRead':
        await this.notificationPage.selectMustReadSingle();
        break;
      case 'follow':
        await this.notificationPage.selectFollowSingle();
        break;
      case 'alerts':
        await this.notificationPage.selectAlertsSingle();
        break;
    }
    await this.notificationPage.expectStepperAt(STEPPER_STEPS.OVERRIDE_AND_CONFIRMATION);
  }

  async verifySubjectLineLabels(): Promise<void> {
    await this.notificationPage.verifyText(SUBJECT_LINE_OPTIONS.DEFAULT);
    await this.notificationPage.verifyText(SUBJECT_LINE_OPTIONS.CUSTOM);
  }

  async testCancelAction(): Promise<void> {
    await this.notificationPage.cancel();
    await this.notificationPage.expectAddCustomizationVisible();
  }

  async testValidInput(templateType: TemplateType): Promise<void> {
    await this.selectTemplate(templateType);
    const validSubject = this.getTemplateSubject(templateType);
    await this.notificationPage.chooseCustomSubject();
    await this.notificationPage.typeCustomSubjectOnStep2(validSubject);
    await this.notificationPage.expectStepperAt(STEPPER_STEPS.MANAGE_TRANSLATIONS);
  }

  async testEmptyInputValidation(templateType: TemplateType): Promise<void> {
    await this.notificationPage.cancel();
    await this.selectTemplate(templateType);
    await this.notificationPage.chooseCustomSubject();
    await this.notificationPage.clearCustomSubject();
    await this.notificationPage.expectNextButtonDisabled();
  }

  async createMustReadWithFrenchTranslation(): Promise<string> {
    const englishSubject = NotificationTestDataGenerator.generateTemplateSubject('mustRead');
    await this.notificationPage.startAddCustomization();
    await this.notificationPage.expectStepperAt(STEPPER_STEPS.SELECT_NOTIFICATION);
    await this.notificationPage.selectMustReadSingle();
    await this.notificationPage.expectStepperAt(STEPPER_STEPS.OVERRIDE_AND_CONFIRMATION);
    await this.notificationPage.chooseCustomSubject();
    await this.notificationPage.typeCustomSubjectOnStep2(englishSubject);
    await this.notificationPage.expectStepperAt(STEPPER_STEPS.MANAGE_TRANSLATIONS);
    return englishSubject;
  }

  async saveAndVerifyCreation(subjectToVerify: string): Promise<void> {
    await this.notificationPage.save();
    await this.notificationPage.expectSavedToast();
    await this.notificationPage.expectAddCustomizationVisible();
    await this.notificationPage.expectCellVisible(subjectToVerify);
    await this.notificationPage.expectMoreButtonReady();
  }

  async deleteBySubject(subject: string): Promise<void> {
    await this.notificationPage.deleteBySubject(subject);
  }

  async verifyToastMessage(message: string): Promise<void> {
    await this.notificationPage.verifyToastMessage(message);
  }

  async testTranslationFallback(): Promise<void> {
    const customSubject = NotificationTestDataGenerator.generateUniqueSubject(SUBJECT_LINES.FALLBACK_TEST.ENGLISH);
    await this.notificationPage.chooseCustomSubject();
    await this.notificationPage.typeCustomSubjectOnStep2(customSubject);
    await this.notificationPage.expectStepperAt(STEPPER_STEPS.MANAGE_TRANSLATIONS);
    await this.selectFrenchLanguageWithFallback();
    await this.notificationPage.cancel();
    await this.notificationPage.expectOnListPage();
  }

  /**
   * Tests invalid email input flow
   */
  async testInvalidEmailFlow(): Promise<void> {
    await this.notificationPage.chooseCustomSubject();
    await this.notificationPage.typeCustomSubjectOnStep2(SUBJECT_LINES.MUST_READ.ENGLISH);
    await this.notificationPage.chooseDifferentTestEmail();
    await this.notificationPage.typeTestEmail(TEST_EMAILS.SINGLE_INVALID);
    await this.notificationPage.blurTestEmailInput();
    await this.notificationPage.expectSendTestDisabled();
  }

  /**
   * Tests valid email input flow
   */
  async testValidEmailFlow(): Promise<void> {
    await this.notificationPage.typeTestEmail(TEST_EMAILS.SINGLE_VALID);
    await this.notificationPage.blurTestEmailInput();
    await this.notificationPage.expectSendTestEnabled();
    await this.notificationPage.sendTestEmail();
  }

  /**
   * Creates a custom subject and validates invalid/valid test email send
   */
  async testSendYourselfFlow(): Promise<void> {
    await this.notificationPage.chooseCustomSubject();
    await this.notificationPage.typeCustomSubjectOnStep2(SUBJECT_LINES.MUST_READ.ENGLISH);
    await this.notificationPage.chooseDifferentTestEmail();
    await this.notificationPage.typeTestEmail(TEST_EMAILS.SINGLE_INVALID);
    await this.notificationPage.blurTestEmailInput();
    await this.notificationPage.expectSendTestDisabled();
    await this.notificationPage.typeTestEmail(TEST_EMAILS.SINGLE_VALID);
    await this.notificationPage.blurTestEmailInput();
    await this.notificationPage.expectSendTestEnabled();
    await this.notificationPage.sendTestEmail();
  }

  /**
   * Sends a single test email to multiple recipients separated by commas
   */
  async testSendYourselfMultipleRecipients(emailsCsv: string): Promise<void> {
    await this.notificationPage.chooseCustomSubject();
    await this.notificationPage.typeCustomSubjectOnStep2(SUBJECT_LINES.MUST_READ.ENGLISH);
    await this.notificationPage.chooseDifferentTestEmail();
    await this.notificationPage.typeTestEmail(emailsCsv);
    await this.notificationPage.blurTestEmailInput();
    await this.notificationPage.expectSendTestEnabled();
    await this.notificationPage.sendTestEmail();
  }

  private getTemplateSubject(templateType: TemplateType): string {
    switch (templateType) {
      case 'mustRead':
        return SUBJECT_LINES.VALIDATION.VALID_SUBJECT;
      case 'follow':
        return SUBJECT_LINES.FOLLOW.ENGLISH;
      case 'alerts':
        return SUBJECT_LINES.ALERTS.ENGLISH;
    }
  }

  /**
   * Attempts to select a French language option with fallbacks
   * @returns The language that was actually selected
   */
  private async selectFrenchLanguageWithFallback(): Promise<string> {
    try {
      await this.notificationPage.selectLanguage('Français - French');
      return 'Français - French';
    } catch {
      return 'None (French not available)';
    }
  }

  /**
   * Waits for translation processing to complete after filling translation fields
   * Uses element-based waiting for better reliability
   */
  private async waitForTranslationCompletion(): Promise<void> {
    await this.notificationPage.notificationCustomizationComponent.waitForTranslationCompletion();
  }
}
