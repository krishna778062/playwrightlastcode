import {
  NotificationTestDataGenerator,
  STEPPER_STEPS,
  SUBJECT_LINES,
  TemplateType,
  TEST_EMAILS,
} from '@alert-notification/tests/test-data/notification-customization.test-data';
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
    await this.notificationPage.notificationCustomizationComponent.startAddCustomization();
    switch (templateType) {
      case 'mustRead':
        await this.notificationPage.notificationCustomizationComponent.selectMustReadSingle();
        break;
      case 'follow':
        await this.notificationPage.notificationCustomizationComponent.selectFollowSingle();
        break;
      case 'alerts':
        await this.notificationPage.notificationCustomizationComponent.selectAlertsSingle();
        break;
    }
    await this.notificationPage.notificationCustomizationComponent.expectStepperAt(
      STEPPER_STEPS.OVERRIDE_AND_CONFIRMATION
    );
  }

  async verifySubjectLineLabels(): Promise<void> {
    await this.notificationPage.notificationCustomizationComponent.verifyText(SUBJECT_LINE_OPTIONS.DEFAULT);
    await this.notificationPage.notificationCustomizationComponent.verifyText(SUBJECT_LINE_OPTIONS.CUSTOM);
  }

  async testCancelAction(): Promise<void> {
    await this.notificationPage.notificationCustomizationComponent.cancel();
    await this.notificationPage.notificationCustomizationComponent.expectAddCustomizationVisible();
  }

  async testValidInput(templateType: TemplateType): Promise<void> {
    await this.selectTemplate(templateType);
    const validSubject = this.getTemplateSubject(templateType);
    await this.notificationPage.notificationCustomizationComponent.chooseCustomSubject();
    await this.notificationPage.notificationCustomizationComponent.typeCustomSubjectOnStep2(validSubject);
    await this.notificationPage.notificationCustomizationComponent.expectStepperAt(STEPPER_STEPS.MANAGE_TRANSLATIONS);
  }

  async testEmptyInputValidation(templateType: TemplateType): Promise<void> {
    await this.notificationPage.notificationCustomizationComponent.cancel();
    await this.selectTemplate(templateType);
    await this.notificationPage.notificationCustomizationComponent.chooseCustomSubject();
    await this.notificationPage.notificationCustomizationComponent.clearCustomSubject();
    await this.notificationPage.notificationCustomizationComponent.expectNextButtonDisabled();
  }

  async createMustReadWithFrenchTranslation(): Promise<string> {
    const englishSubject = NotificationTestDataGenerator.generateTemplateSubject('mustRead');
    await this.notificationPage.notificationCustomizationComponent.startAddCustomization();
    await this.notificationPage.notificationCustomizationComponent.expectStepperAt(STEPPER_STEPS.SELECT_NOTIFICATION);
    await this.notificationPage.notificationCustomizationComponent.selectMustReadSingle();
    await this.notificationPage.notificationCustomizationComponent.expectStepperAt(
      STEPPER_STEPS.OVERRIDE_AND_CONFIRMATION
    );
    await this.notificationPage.notificationCustomizationComponent.chooseCustomSubject();
    await this.notificationPage.notificationCustomizationComponent.typeCustomSubjectOnStep2(englishSubject);
    await this.notificationPage.notificationCustomizationComponent.expectStepperAt(STEPPER_STEPS.MANAGE_TRANSLATIONS);
    return englishSubject;
  }

  async saveAndVerifyCreation(subjectToVerify: string): Promise<void> {
    await this.notificationPage.notificationCustomizationComponent.save();
    await this.notificationPage.notificationCustomizationComponent.expectSavedToast();
    await this.notificationPage.notificationCustomizationComponent.expectAddCustomizationVisible();
    await this.notificationPage.notificationCustomizationComponent.expectCellVisible(subjectToVerify);
    await this.notificationPage.notificationCustomizationComponent.expectMoreButtonReady();
  }

  async deleteBySubject(subject: string): Promise<void> {
    await this.notificationPage.notificationCustomizationComponent.deleteBySubject(subject);
  }

  async verifyToastMessage(message: string): Promise<void> {
    await this.notificationPage.notificationCustomizationComponent.verifyToastMessage(message);
  }

  async testTranslationFallback(): Promise<void> {
    const customSubject = NotificationTestDataGenerator.generateUniqueSubject(SUBJECT_LINES.FALLBACK_TEST.ENGLISH);
    await this.notificationPage.notificationCustomizationComponent.chooseCustomSubject();
    await this.notificationPage.notificationCustomizationComponent.typeCustomSubjectOnStep2(customSubject);
    await this.notificationPage.notificationCustomizationComponent.expectStepperAt(STEPPER_STEPS.MANAGE_TRANSLATIONS);
    await this.selectFrenchLanguageWithFallback();
    await this.notificationPage.notificationCustomizationComponent.cancel();
    await this.notificationPage.notificationCustomizationComponent.expectOnListPage();
  }

  /**
   * Tests invalid email input flow
   */
  async testInvalidEmailFlow(): Promise<void> {
    await this.notificationPage.notificationCustomizationComponent.chooseCustomSubject();
    await this.notificationPage.notificationCustomizationComponent.typeCustomSubjectOnStep2(
      SUBJECT_LINES.MUST_READ.ENGLISH
    );
    await this.notificationPage.notificationCustomizationComponent.chooseDifferentTestEmail();
    await this.notificationPage.notificationCustomizationComponent.typeTestEmail(TEST_EMAILS.SINGLE_INVALID);
    await this.notificationPage.notificationCustomizationComponent.blurTestEmailInput();
    await this.notificationPage.notificationCustomizationComponent.expectSendTestDisabled();
  }

  /**
   * Tests valid email input flow
   */
  async testValidEmailFlow(): Promise<void> {
    await this.notificationPage.notificationCustomizationComponent.typeTestEmail(TEST_EMAILS.SINGLE_VALID);
    await this.notificationPage.notificationCustomizationComponent.blurTestEmailInput();
    await this.notificationPage.notificationCustomizationComponent.expectSendTestEnabled();
    await this.notificationPage.notificationCustomizationComponent.sendTestEmail();
  }

  /**
   * Sends a single test email to multiple recipients separated by commas
   */
  async testSendYourselfMultipleRecipients(emailsCsv: string): Promise<void> {
    await this.notificationPage.notificationCustomizationComponent.chooseCustomSubject();
    await this.notificationPage.notificationCustomizationComponent.typeCustomSubjectOnStep2(
      SUBJECT_LINES.MUST_READ.ENGLISH
    );
    await this.notificationPage.notificationCustomizationComponent.chooseDifferentTestEmail();
    await this.notificationPage.notificationCustomizationComponent.typeTestEmail(emailsCsv);
    await this.notificationPage.notificationCustomizationComponent.blurTestEmailInput();
    await this.notificationPage.notificationCustomizationComponent.expectSendTestEnabled();
    await this.notificationPage.notificationCustomizationComponent.sendTestEmail();
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
      await this.notificationPage.notificationCustomizationComponent.selectLanguage('Français - French');
      return 'Français - French';
    } catch {
      return 'None (French not available)';
    }
  }
}
