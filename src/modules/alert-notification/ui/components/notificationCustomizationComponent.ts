import { POPUP_BUTTONS } from '@alert-notification/constants/popupButtons';
import { STEPPER_STEPS } from '@alert-notification/tests/test-data/notification-customization.test-data';
import { ALERT_NOTIFICATION_MESSAGES } from '@alert-notification-constants/messageRepo';
import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

/**
 * Contains all locators and UI-specific methods
 */
export class NotificationCustomizationComponent extends BaseComponent {
  readonly applicationSettingsMenuItem: Locator;
  readonly applicationButton: Locator;
  readonly defaultsTab: Locator;
  readonly notificationCustomizationTab: Locator;
  readonly addCustomizationLink: Locator;
  readonly searchInput: Locator;
  readonly mustReadButton: Locator;
  readonly mustReadRadio: Locator;
  readonly followButton: Locator;
  readonly followRadio: Locator;
  readonly alertsButton: Locator;
  readonly alertsRadio: Locator;
  readonly nextButton: Locator;
  readonly customSubjectRadio: Locator;
  readonly customSubjectTextarea: Locator;
  readonly languageButton: Locator;
  readonly loadingSpinner: Locator;
  readonly saveButton: Locator;
  readonly moreButton: Locator;
  readonly differentEmailRadio: Locator;
  readonly testEmailInput: Locator;
  readonly sendTestButton: Locator;
  readonly tableRows: Locator;

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
    this.customSubjectRadio = this.rootLocator.getByRole('radio', { name: /Custom subject line/i });
    this.customSubjectTextarea = this.rootLocator.locator('textarea[name="customValue"], #customSubjectTextarea');
    this.loadingSpinner = this.rootLocator.locator('.loading, .spinner, [aria-busy="true"]').first();
    this.saveButton = this.rootLocator.getByRole('button', { name: POPUP_BUTTONS.SAVE });
    this.languageButton = this.rootLocator.getByRole('button', { name: /Language.*Open/i });
    this.moreButton = this.rootLocator.getByRole('button', { name: /^More$/i });
    this.differentEmailRadio = this.rootLocator.getByRole('radio', { name: 'Different email address' });
    this.testEmailInput = this.rootLocator.getByRole('textbox', { name: 'Enter your email address here' });
    this.sendTestButton = this.rootLocator.getByRole('button', { name: 'Send test' });
    this.tableRows = this.rootLocator.locator('tr[data-testid*="dataGridRow-"]');
  }

  async clickButton(buttonName: string, step?: string, timeout = 30_000): Promise<void> {
    const stepName = step || `Click ${buttonName}`;
    await test.step(stepName, async () => {
      const button = this.page.getByRole('button', { name: buttonName });
      await this.clickOnElement(button, { timeout });
    });
  }

  async navigateToApplicationSettings(): Promise<void> {
    await this.clickOnElement(this.applicationSettingsMenuItem);
  }

  async navigateToApplicationTab(): Promise<void> {
    await this.clickButton('Application');
  }

  async navigateToDefaultsTab(): Promise<void> {
    await this.clickOnElement(this.defaultsTab);
  }

  async navigateToNotificationCustomizationTab(): Promise<void> {
    await this.clickOnElement(this.notificationCustomizationTab);
  }

  async startAddCustomization(): Promise<void> {
    await this.clickOnElement(this.addCustomizationLink);
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
      await this.clickButton('Next');
    });
  }

  async selectFollowSingle(): Promise<void> {
    await test.step('Select Follow single notification', async () => {
      await this.clickOnElement(this.followButton.first());
      await this.followRadio.first().waitFor({ state: 'visible' });
      await this.clickOnElement(this.followRadio.first());
      await this.clickButton('Next');
    });
  }

  async selectAlertsSingle(): Promise<void> {
    await test.step('Select Alerts single notification', async () => {
      await this.clickOnElement(this.alertsButton);
      await this.alertsRadio.waitFor({ state: 'visible' });
      await this.clickOnElement(this.alertsRadio);
      await this.clickButton('Next');
    });
  }

  async clickNext(): Promise<void> {
    await this.clickButton('Next');
  }

  async cancel(): Promise<void> {
    await this.clickButton('Cancel');
  }

  async chooseCustomSubject(): Promise<void> {
    await this.clickOnElement(this.customSubjectRadio);
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
    await this.clickButton('Save');
  }

  // Test email methods
  async chooseDifferentTestEmail(): Promise<void> {
    await this.clickOnElement(this.differentEmailRadio);
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
    await this.clickButton('Send test');
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
    await test.step('Expect saved toast message', async () => {
      await this.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_SAVED);
    });
  }

  async expectDeletedToast(): Promise<void> {
    await test.step('Expect deleted toast message', async () => {
      await this.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOMIZATION_DELETED);
    });
  }

  async expectTestEmailSuccess(): Promise<void> {
    await test.step('Expect test email success ', async () => {
      await this.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.CUSTOM_EMAIL_SUBJECT_TEST_SENT);
    });
  }

  async expectInvalidEmailError(): Promise<void> {
    await test.step('Expect invalid email', async () => {
      await this.verifyToastMessage(ALERT_NOTIFICATION_MESSAGES.INVALID_EMAIL_ERROR);
    });
  }

  async verifyToastMessage(message: string): Promise<void> {
    await test.step(`Verify toast message: ${message}`, async () => {
      const specificAlert = this.rootLocator.getByRole('alert').filter({ hasText: message }).first();
      await expect(specificAlert, `Toast should contain: ${message}`).toBeVisible({ timeout: 15_000 });
    });
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
    //before count => await this.locator.count()
    //delete item
    //verify count  is count - 1
    // await expect(this.locator).tohavecount(previouscount - 1)
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
