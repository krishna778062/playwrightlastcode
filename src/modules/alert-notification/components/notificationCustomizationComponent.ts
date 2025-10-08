import { ALERT_NOTIFICATION_MESSAGES } from '@alert-notification-constants/messageRepo';
import { STEPPER_STEPS } from '@alert-notification-test-data/notification-customization.test-data';
import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';
import { POPUP_BUTTONS } from '@core/constants/popupButtons';

/**
 * Contains all locators and UI-specific methods
 */
export class NotificationCustomizationComponent extends BaseComponent {
  readonly applicationSettingsMenuItem: Locator;
  readonly applicationButton: Locator;
  readonly defaultsTab: Locator;
  readonly notificationCustomizationTab: Locator;
  readonly addCustomizationLink: Locator;
  readonly pageHeading: Locator;
  readonly searchInput: Locator;
  readonly mustReadButton: Locator;
  readonly mustReadRadio: Locator;
  readonly followButton: Locator;
  readonly followRadio: Locator;
  readonly alertsButton: Locator;
  readonly alertsRadio: Locator;
  readonly nextButton: Locator;
  readonly cancelButton: Locator;
  readonly customSubjectRadio: Locator;
  readonly customSubjectTextarea: Locator;
  readonly languageButton: Locator;
  readonly manualTranslationsSwitch: Locator;
  readonly loadingSpinner: Locator;
  readonly saveButton: Locator;
  readonly moreButton: Locator;
  readonly deleteButton: Locator;
  readonly differentEmailRadio: Locator;
  readonly testEmailInput: Locator;
  readonly sendTestButton: Locator;
  readonly tableRows: Locator;
  readonly activeStepButton: Locator;
  readonly menuItems: Locator;
  readonly customSubjectTextareaFallback: Locator;
  readonly translationTextarea: Locator;
  readonly menuContainer: Locator;
  readonly bodyContainer: Locator;
  readonly deleteActionButton: Locator;
  readonly alertRegion: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    super(page, rootLocator);

    this.applicationSettingsMenuItem = this.rootLocator.getByRole('menuitem', {
      name: 'Application settings',
      exact: true,
    });
    this.applicationButton = this.rootLocator.getByRole('button', { name: 'Application' });
    this.defaultsTab = this.rootLocator.getByRole('tab', { name: 'Defaults' });
    this.notificationCustomizationTab = this.rootLocator.getByRole('tab', { name: 'Notification customization' });
    this.addCustomizationLink = this.rootLocator
      .getByRole('link', { name: 'Add customization' })
      .or(this.rootLocator.locator('a[href*="notifications-customization"]').filter({ hasText: 'Add customization' }));
    this.pageHeading = this.rootLocator.getByRole('heading', { name: /notification (customization|overrides)/i });
    this.searchInput = this.rootLocator
      .getByPlaceholder('Search')
      .or(this.rootLocator.getByRole('textbox', { name: /search/i }))
      .first();
    this.mustReadButton = this.rootLocator.getByRole('button', { name: 'Must reads Get notified if' });
    this.mustReadRadio = this.rootLocator.getByRole('radio', { name: "A 'must read' requires your" });
    this.followButton = this.rootLocator.getByRole('button', { name: 'Follows Get notified if' });
    this.followRadio = this.rootLocator.getByRole('radio', { name: '{{name}} started following you' });
    this.alertsButton = this.rootLocator.getByRole('button', { name: 'Alerts Get notified if an' });
    this.alertsRadio = this.rootLocator.getByRole('radio', { name: 'New Alert - {{message}}' });
    this.nextButton = this.rootLocator.getByRole('button', { name: 'Next' });
    this.cancelButton = this.rootLocator.getByRole('button', { name: 'Cancel' });
    this.customSubjectRadio = this.rootLocator.getByRole('radio', { name: /Custom subject line/i });
    this.customSubjectTextarea = this.rootLocator.locator('textarea[name="customValue"], #customSubjectTextarea');
    this.loadingSpinner = this.rootLocator.locator('.loading, .spinner, [aria-busy="true"]').first();
    this.saveButton = this.rootLocator.getByRole('button', { name: POPUP_BUTTONS.SAVE });
    this.languageButton = this.rootLocator.getByRole('button', { name: /Language.*Open/i });
    this.manualTranslationsSwitch = this.rootLocator.getByRole('switch', { name: /manual translations/i });
    this.moreButton = this.rootLocator.getByRole('button', { name: /^More$/i });
    this.deleteButton = this.rootLocator.getByRole('button', { name: /^Delete$/i });
    this.differentEmailRadio = this.rootLocator.getByRole('radio', { name: 'Different email address' });
    this.testEmailInput = this.rootLocator.getByRole('textbox', { name: 'Enter your email address here' });
    this.sendTestButton = this.rootLocator.getByRole('button', { name: 'Send test' });
    this.tableRows = this.rootLocator.locator('tr[data-testid*="dataGridRow-"]');
    this.activeStepButton = this.rootLocator.locator('[aria-current="step"]');
    this.menuItems = this.rootLocator.locator('[role="menuitem"]');
    this.customSubjectTextareaFallback = this.rootLocator.locator(
      '#customSubjectTextarea, textarea[name="customValue"]'
    );
    this.translationTextarea = this.rootLocator.locator('textarea[name="translationValue"]');
    this.menuContainer = this.rootLocator.locator('[role="menu"]');
    this.bodyContainer = this.rootLocator.locator('body');
    this.deleteActionButton = this.rootLocator.getByRole('menuitem', { name: 'Delete' });
    this.alertRegion = this.rootLocator.getByRole('alert');
  }

  async navigateToApplicationSettings(): Promise<void> {
    await test.step('Navigate to Application Settings', async () => {
      await this.clickOnElement(this.applicationSettingsMenuItem);
    });
  }

  async navigateToApplicationTab(): Promise<void> {
    await test.step('Navigate to Application tab', async () => {
      await this.clickOnElement(this.applicationButton);
    });
  }

  async navigateToDefaultsTab(): Promise<void> {
    await test.step('Navigate to Defaults tab', async () => {
      await this.clickOnElement(this.defaultsTab);
    });
  }

  async navigateToNotificationCustomizationTab(): Promise<void> {
    await test.step('Navigate to Notification customization tab', async () => {
      await this.clickOnElement(this.notificationCustomizationTab);
    });
  }

  async startAddCustomization(): Promise<void> {
    await test.step('Start add customization flow', async () => {
      await this.clickOnElement(this.addCustomizationLink);
    });
  }

  async expectAddCustomizationVisible(): Promise<void> {
    await test.step('Add customization Button to be visible', async () => {
      await expect(this.addCustomizationLink, 'Add customization Button should be visible').toBeVisible({
        timeout: 30_000,
      });
    });
  }

  async expectOnListPage(): Promise<void> {
    await test.step('Expect to be on list page', async () => {
      await expect(this.addCustomizationLink, 'Should be on list page').toBeVisible({ timeout: 10_000 });
    });
  }

  async selectMustReadSingle(): Promise<void> {
    await test.step('Select Must Read single notification', async () => {
      await this.clickOnElement(this.mustReadButton);
      await this.mustReadRadio.waitFor({ state: 'visible' });
      await this.clickOnElement(this.mustReadRadio);
      await this.clickOnElement(this.nextButton);
    });
  }

  async selectFollowSingle(): Promise<void> {
    await test.step('Select Follow single notification', async () => {
      await this.clickOnElement(this.followButton.first());
      await this.followRadio.first().waitFor({ state: 'visible' });
      await this.clickOnElement(this.followRadio.first());
      await this.clickOnElement(this.nextButton);
    });
  }

  async selectAlertsSingle(): Promise<void> {
    await test.step('Select Alerts single notification', async () => {
      await this.clickOnElement(this.alertsButton);
      await this.alertsRadio.waitFor({ state: 'visible' });
      await this.clickOnElement(this.alertsRadio);
      await this.clickOnElement(this.nextButton);
    });
  }

  async clickNext(): Promise<void> {
    await test.step('Click Next button', async () => {
      await this.clickOnElement(this.nextButton);
    });
  }

  async cancel(): Promise<void> {
    await test.step('Cancel customization', async () => {
      await this.clickOnElement(this.cancelButton);
    });
  }

  async chooseCustomSubject(): Promise<void> {
    await test.step('Choose custom subject line', async () => {
      await this.clickOnElement(this.customSubjectRadio);
    });
  }

  async typeCustomSubjectOnStep2(subject: string): Promise<void> {
    await test.step(`Type custom subject: ${subject}`, async () => {
      await this.customSubjectTextarea.fill(subject);
      await this.clickNext();
    });
  }

  async clearCustomSubject(): Promise<void> {
    await test.step('Clear custom subject', async () => {
      await this.customSubjectTextarea.fill('');
    });
  }

  async expectNextButtonDisabled(): Promise<void> {
    await test.step('Expect Next button to be disabled', async () => {
      await expect(this.nextButton, 'Next button should be disabled').toBeDisabled();
    });
  }

  // Translation methods
  async selectLanguage(language: string): Promise<void> {
    await test.step(`Select language: ${language}`, async () => {
      await this.clickOnElement(this.languageButton);
      await this.clickOnElement(this.rootLocator.getByText(language));
    });
  }

  async save(): Promise<void> {
    await test.step('Save customization', async () => {
      await this.clickOnElement(this.saveButton);
    });
  }

  // Test email methods
  async chooseDifferentTestEmail(): Promise<void> {
    await test.step('Choose different test email', async () => {
      await this.clickOnElement(this.differentEmailRadio);
    });
  }

  async typeTestEmail(email: string): Promise<void> {
    await test.step(`Type test email: ${email}`, async () => {
      await this.testEmailInput.fill(email);
    });
  }

  async blurTestEmailInput(): Promise<void> {
    await test.step('Blur test email input to trigger validation', async () => {
      await this.testEmailInput.press('Tab');
    });
  }

  async sendTestEmail(): Promise<void> {
    await test.step('Send test email', async () => {
      await this.clickOnElement(this.sendTestButton);
    });
  }

  async expectSendTestDisabled(): Promise<void> {
    await test.step('Expect Send test button to be disabled', async () => {
      await expect(this.sendTestButton, 'Send test button should be disabled').toBeDisabled();
    });
  }

  async expectSendTestEnabled(): Promise<void> {
    await test.step('Expect Send test button to be enabled', async () => {
      await expect(this.sendTestButton, 'Send test button should be enabled').toBeEnabled();
    });
  }

  // Toast verification methods
  async expectSavedToast(): Promise<void> {
    await this.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED);
  }

  async expectDeletedToast(): Promise<void> {
    await this.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED);
  }

  async expectTestEmailSuccess(): Promise<void> {
    await this.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOM_EMAIL_SUBJECT_TEST_SENT);
  }

  async expectInvalidEmailError(): Promise<void> {
    await this.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.INVALID_EMAIL_ERROR);
  }

  async verifyToastMessage(message: string): Promise<void> {
    const specificAlert = this.rootLocator.getByRole('alert').filter({ hasText: message }).first();
    await expect(specificAlert, `Toast should contain: ${message}`).toBeVisible({ timeout: 15_000 });
  }

  // Table and row methods
  async expectCellVisible(subject: string): Promise<void> {
    await test.step(`Expect cell with subject "${subject}" to be visible`, async () => {
      const row = this.rowBySubject(subject);
      await expect(row, `Row with subject "${subject}" should be visible`).toBeVisible({ timeout: 10_000 });
    });
  }

  async expectMoreButtonReady(): Promise<void> {
    await test.step('Expect More button to be ready', async () => {
      await expect(this.moreButton.first(), 'More button should be ready').toBeVisible({ timeout: 5_000 });
    });
  }

  async deleteBySubject(subject: string): Promise<void> {
    await test.step(`Delete customization with subject: ${subject}`, async () => {
      const row = this.rowBySubject(subject);
      await expect(row, `Row with subject "${subject}" should be visible`).toBeVisible({ timeout: 10_000 });

      // Click the More button to open the menu
      const moreButton = row.getByRole('button', { name: /^more$/i });
      await expect(moreButton, 'More button should be visible').toBeVisible({ timeout: 10_000 });
      await this.clickOnElement(moreButton);
      await this.clickDeleteFromRowMenuAndConfirm();
      await this.expectDeletedToast();
      await expect(this.rowBySubject(subject), 'Row should be removed').toHaveCount(0);
    });
  }

  // Helper methods
  rowBySubject(subject: string): Locator {
    return this.tableRows.filter({ hasText: subject });
  }
  // delete menu item
  async clickDeleteFromRowMenuAndConfirm(): Promise<void> {
    await test.step('Click delete from row menu and confirm', async () => {
      const menuDelete = this.rootLocator
        .getByRole('menuitem', { name: /^delete$/i })
        .first()
        .or(this.rootLocator.getByRole('button', { name: /^delete$/i }).first());
      await expect(menuDelete, 'Row menu should contain Delete').toBeVisible({ timeout: 10_000 });
      await this.clickOnElement(menuDelete);
      const confirmDeleteButton = this.rootLocator.getByRole('button', { name: /^delete$/i }).last();
      await expect(confirmDeleteButton, 'Delete confirmation button should be visible').toBeVisible({
        timeout: 10_000,
      });
      await this.clickOnElement(confirmDeleteButton);
    });
  }

  async expectStepperAt(step: string): Promise<void> {
    await test.step(`Expect stepper to be at step: ${step}`, async () => {
      // Use specific UI elements that are always present for each step
      switch (step) {
        case STEPPER_STEPS.SELECT_NOTIFICATION:
          await expect(
            this.mustReadButton,
            'Must Read radio should be visible on SELECT_NOTIFICATION step'
          ).toBeVisible();
          break;
        case STEPPER_STEPS.OVERRIDE_AND_CONFIRMATION:
          await expect(
            this.customSubjectRadio,
            'Custom subject radio should be visible on OVERRIDE_AND_CONFIRMATION step'
          ).toBeVisible();
          break;
        case STEPPER_STEPS.MANAGE_TRANSLATIONS:
          await expect(
            this.languageButton,
            'Language button should be visible on MANAGE_TRANSLATIONS step'
          ).toBeVisible();
          break;
        default:
          throw new Error(`Unknown stepper step: ${step}`);
      }
    });
  }

  async verifyText(text: string): Promise<void> {
    await test.step(`Verify text is present: ${text}`, async () => {
      const textLocator = this.rootLocator.getByText(text).first();
      await expect(textLocator, `Text "${text}" should be visible`).toBeVisible({
        timeout: 5_000,
      });
    });
  }

  async clearSearch(): Promise<void> {
    await test.step('Clear search input', async () => {
      await this.searchInput.fill('');
      await this.searchInput.press('Enter');
    });
  }

  async countItems(): Promise<number> {
    return await test.step('Count table items', async () => {
      try {
        const r = this.tableRows;
        await r.first().waitFor({ timeout: 2_000 });
        return await r.count();
      } catch {
        return 0;
      }
    });
  }

  /**
   * Waits for translation processing to complete after filling translation fields
   * Uses element-based waiting for better reliability
   */
  async waitForTranslationCompletion(): Promise<void> {
    await test.step('Wait for translation processing to complete', async () => {
      if (await this.loadingSpinner.isVisible().catch(() => false)) {
        await expect(this.loadingSpinner, 'Loading spinner should disappear before enabling Save').toBeHidden({
          timeout: 10_000,
        });
      }

      await expect(this.saveButton, 'Save button should be enabled after processing completes').toBeEnabled({
        timeout: 5_000,
      });
    });
  }
}
