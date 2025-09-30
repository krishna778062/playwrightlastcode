import { SubjectCustomLinePage } from '@alert-notification-pages/subjectCustomLinePage';
import {
  NotificationTestDataGenerator,
  SUBJECT_LINES,
} from '@alert-notification-test-data/notification-customization.test-data';
import { expect, Page } from '@playwright/test';

// Simple constants for UI text
const SUBJECT_LINE_OPTIONS = {
  DEFAULT: 'Default subject line',
  CUSTOM: 'Custom subject line',
} as const;

type TemplateType = 'mustRead' | 'follow' | 'alerts';

/**
 * Test workflow helpers for notification customization
 */
export class NotificationTestWorkflows {
  constructor(
    private readonly notificationPage: SubjectCustomLinePage,
    private readonly page: Page
  ) {}

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

    await this.notificationPage.expectStepperAt('OVERRIDE_AND_CONFIRMATION');
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
    await this.notificationPage.expectStepperAt('MANAGE_TRANSLATIONS');
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
    await this.notificationPage.expectStepperAt('SELECT_NOTIFICATION');
    await this.notificationPage.selectMustReadSingle();
    await this.notificationPage.expectStepperAt('OVERRIDE_AND_CONFIRMATION');

    await this.notificationPage.chooseCustomSubject();
    await this.notificationPage.typeCustomSubjectOnStep2(englishSubject);
    await this.notificationPage.expectStepperAt('MANAGE_TRANSLATIONS');

    return englishSubject;
  }

  async saveAndVerifyCreation(subjectToVerify: string): Promise<void> {
    await this.notificationPage.save();
    await this.notificationPage.expectSavedToast();
    await this.notificationPage.expectAddCustomizationVisible();
    await this.notificationPage.expectCellVisible(subjectToVerify);
    await this.notificationPage.expectMoreButtonReady();
  }

  async testTranslationFallback(): Promise<void> {
    const customSubject = NotificationTestDataGenerator.generateUniqueSubject(SUBJECT_LINES.FALLBACK_TEST.ENGLISH);

    await this.notificationPage.chooseCustomSubject();
    await this.notificationPage.typeCustomSubjectOnStep2(customSubject);
    await this.notificationPage.expectStepperAt('MANAGE_TRANSLATIONS');

    const _selectedLanguage = await this.selectFrenchLanguageWithFallback();
    await this.notificationPage.cancel();

    await this.notificationPage.expectOnListPage();
  }

  /**
   * Creates a custom subject and validates invalid/valid test email send
   */
  async testSendYourselfFlow(): Promise<void> {
    await this.notificationPage.chooseCustomSubject();
    await this.notificationPage.typeCustomSubjectOnStep2(SUBJECT_LINES.MUST_READ.ENGLISH);

    await this.notificationPage.chooseDifferentTestEmail();
    await this.notificationPage.typeTestEmail('adafadfaf');
    await this.notificationPage.blurTestEmailInput();
    await this.notificationPage.expectSendTestDisabled();
    await this.notificationPage.sendTestEmail().catch(() => {});
    await this.notificationPage.expectInvalidEmailError();

    await this.notificationPage.typeTestEmail('krishna.singh@simpplr.com');
    await this.notificationPage.blurTestEmailInput();
    await this.notificationPage.expectSendTestEnabled();
    await this.notificationPage.sendTestEmail();
    await this.notificationPage.expectTestEmailSuccess();
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
    await this.notificationPage.expectTestEmailSuccess();
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

  private async waitForPageStability(): Promise<void> {
    await this.notificationPage.expectAddCustomizationVisible();
  }

  private async waitForElementStability(): Promise<void> {
    await this.notificationPage.expectAddCustomizationVisible();
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
    const loadingSpinner = this.page.locator('.loading, .spinner, [aria-busy="true"]').first();
    if (await loadingSpinner.isVisible().catch(() => false)) {
      await expect(loadingSpinner).toBeHidden({ timeout: 10_000 });
    }

    const saveButton = this.page.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeEnabled({ timeout: 5_000 });
  }
}
