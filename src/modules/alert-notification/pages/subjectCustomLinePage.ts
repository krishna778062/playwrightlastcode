import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { POPUP_BUTTONS } from '@core/constants/popupButtons';
import { BasePage } from '@core/pages/basePage';

/**
 * Page Object for Subject Custom Line notification customization
 * Handles navigation, CRUD operations, and validation flows
 * Following integrations team pattern - no BasePage extension
 */
export class SubjectCustomLinePage extends BasePage {
  readonly page: Page;
  private readonly applicationSettingsMenuItem: Locator;
  private readonly applicationButton: Locator;
  private readonly defaultsTab: Locator;
  private readonly notificationCustomizationTab: Locator;
  private readonly addCustomizationLink: Locator;
  private readonly pageHeading: Locator;
  private readonly searchInput: Locator;
  private readonly mustReadButton: Locator;
  private readonly mustReadRadio: Locator;
  private readonly followButton: Locator;
  private readonly followRadio: Locator;
  private readonly alertsButton: Locator;
  private readonly alertsRadio: Locator;
  private readonly nextButton: Locator;
  private readonly cancelButton: Locator;
  private readonly customSubjectRadio: Locator;
  private readonly customSubjectTextarea: Locator;
  private readonly languageButton: Locator;
  private readonly manualTranslationsSwitch: Locator;
  private readonly saveButton: Locator;
  private readonly moreButton: Locator;
  private readonly deleteButton: Locator;
  private readonly differentEmailRadio: Locator;
  private readonly testEmailInput: Locator;
  private readonly sendTestButton: Locator;
  private readonly tableRows: Locator;
  private readonly activeStepButton: Locator;
  private readonly menuItems: Locator;
  private readonly customSubjectTextareaFallback: Locator;
  private readonly translationTextarea: Locator;
  private readonly menuContainer: Locator;
  private readonly bodyContainer: Locator;
  private readonly deleteActionButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.NOTIFICATION_CUSTOMIZATION_PAGE);
    this.page = page;

    // Navigation locators
    this.applicationSettingsMenuItem = page.getByRole('menuitem', { name: 'Application settings', exact: true });
    this.applicationButton = page.getByRole('button', { name: 'Application' });
    this.defaultsTab = page.getByRole('tab', { name: 'Defaults' });
    this.notificationCustomizationTab = page.getByRole('tab', { name: 'Notification customization' });

    // List page locators
    this.addCustomizationLink = page.getByRole('link', { name: 'Add customization' });
    this.pageHeading = page.getByRole('heading', { name: /notification (customization|overrides)/i });
    this.searchInput = page
      .getByPlaceholder('Search')
      .or(page.getByRole('textbox', { name: /search/i }))
      .first();

    // Template selection locators
    this.mustReadButton = page.getByRole('button', { name: 'Must reads Get notified if' });
    this.mustReadRadio = page.getByRole('radio', { name: "A 'must read' requires your" });
    this.followButton = page.getByRole('button', { name: 'Follows Get notified if' });
    this.followRadio = page.getByRole('radio', { name: '{{name}} started following you' });
    this.alertsButton = page.getByRole('button', { name: 'Alerts Get notified if an' });
    this.alertsRadio = page.getByRole('radio', { name: 'New Alert - {{message}}' });
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });

    // Subject line locators
    this.customSubjectRadio = page.getByRole('radio', { name: 'Custom subject line Enter the' });
    this.customSubjectTextarea = page.locator('textarea[name="customValue"], #customSubjectTextarea');

    // Translation locators
    this.languageButton = page.getByRole('button', { name: /Language.*Open/i });
    this.manualTranslationsSwitch = page.getByRole('switch', { name: /manual translations/i });
    this.saveButton = page.getByRole('button', { name: 'Save' });

    // Action locators
    this.moreButton = page.getByRole('button', { name: /^More$/i });
    this.deleteButton = page.getByRole('button', { name: /^Delete$/i });

    // Send yourself a test locators
    this.differentEmailRadio = page.getByRole('radio', { name: 'Different email address' });
    this.testEmailInput = page.getByRole('textbox', { name: 'Enter your email address here' });
    this.sendTestButton = page.getByRole('button', { name: 'Send test' });

    // Converted former getters to fields
    this.tableRows = page.locator('tr[data-testid*="dataGridRow-"]');
    this.activeStepButton = page.locator('[aria-current="step"]');
    this.menuItems = page.locator('[role="menuitem"]');
    this.customSubjectTextareaFallback = page.locator('#customSubjectTextarea, textarea[name="customValue"]');
    this.translationTextarea = page.locator('textarea[name="customValue"], #customSubjectTextarea').first();
    this.menuContainer = page
      .locator('[role="listbox"], [role="menu"]')
      .filter({ hasText: /Français|English|Español/ })
      .first();
    this.bodyContainer = page.locator('body');
    this.deleteActionButton = page
      .getByRole('menuitem', { name: /^Delete$/i })
      .or(page.getByRole('button', { name: /^delete$/i }).first());
  }

  /**
   * Verify that the page is loaded and ready
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify notification customization page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      // Rely on a stable, actionable control that always exists on the list page
      await this.verifier.verifyTheElementIsVisible(this.addCustomizationLink, { timeout: 15_000 });
    });
  }

  /**
   * Navigate to notification customization page from any context
   */
  async navigateToNotificationCustomization(): Promise<void> {
    await test.step('Navigate to notification customization page', async () => {
      try {
        await this.goToApplicationDefaults();
        await this.openNotificationCustomization();
      } catch {
        // Fallback to direct route if UI nav fails
        await this.goToUrl(PAGE_ENDPOINTS.NOTIFICATION_CUSTOMIZATION_PAGE);
      }
      await this.verifyThePageIsLoaded();
    });
  }

  /**
   * Load method to ensure page is ready
   */
  async load(): Promise<void> {
    await this.loadPage({ stepInfo: 'Loading Notification Customization page' });
  }

  /**
   * High-level flow: Create a Must Read customization with custom subject
   * @param subject - The custom subject line text
   */
  async createMustRead(subject: string): Promise<void> {
    await this.startAddCustomization();
    await this.selectMustReadSingle();
    await this.chooseCustomSubject();
    await this.nextIfPresent();
    await this.fillManageTranslationsSubject(subject);
    await this.save();
    await this.expectSavedToast();
  }

  /**
   * Navigates to the application from any context
   */
  async openFromAnyContext(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page.locator('body')).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Navigates to Application Defaults section
   */
  async goToApplicationDefaults(): Promise<void> {
    await test.step('Navigate to Application Defaults', async () => {
      await this.applicationSettingsMenuItem.click();
      await this.applicationButton.click();
      await this.defaultsTab.click();
    });
  }

  /**
   * Opens the Notification Customization tab
   */
  async openNotificationCustomization(): Promise<void> {
    await test.step('Open Notification Customization tab', async () => {
      await this.notificationCustomizationTab.click();
    });
  }

  /**
   * Verifies user is on the notification customization list page
   */
  async expectOnListPage(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.addCustomizationLink, { timeout: 15_000 });
  }

  /**
   * Gets the table rows locator
   * @returns Locator for table rows
   */
  rows(): Locator {
    return this.tableRows;
  }

  /**
   * Counts the number of items in the list
   * @returns Promise<number> - The count of items
   */
  async countItems(): Promise<number> {
    const r = this.rows();
    await r
      .first()
      .waitFor({ state: 'visible', timeout: 5_000 })
      .catch(() => {});
    return r.count();
  }

  /**
   * Gets a row by subject text
   * @param subject - The subject text to find
   * @returns Locator for the specific row
   */
  rowBySubject(subject: string): Locator {
    return this.tableRows.filter({ hasText: subject }).first();
  }

  /**
   * Verifies a row with specific subject is visible
   * @param subject - The subject text to verify
   */
  async expectRowVisible(subject: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.rowBySubject(subject));
  }

  /**
   * Verifies a row with specific subject is not present
   * @param subject - The subject text to verify absence
   */
  async expectRowAbsent(subject: string): Promise<void> {
    await this.verifier.verifyCountOfElementsIsEqualTo(this.rowBySubject(subject), 0);
  }

  /**
   * Searches for items in the list
   * @param term - The search term
   */
  async search(term: string): Promise<void> {
    await this.fillInElement(this.searchInput, term);
  }

  /**
   * Clears the search input
   */
  async clearSearch(): Promise<void> {
    if (await this.searchInput.isVisible().catch(() => false)) {
      await this.fillInElement(this.searchInput, '');
      await this.page.keyboard.press('Enter').catch(() => {});
    }
  }

  /**
   * Starts the add customization flow
   */
  async startAddCustomization(): Promise<void> {
    await test.step('Start add customization flow', async () => {
      await this.clickOnElement(this.addCustomizationLink);
    });
  }

  /**
   * Validates current stepper position - deterministic UI element validation
   * @param stepName - The expected step name
   */
  async expectStepperAt(stepName: string): Promise<void> {
    await test.step(`Verify stepper at: ${stepName}`, async () => {
      // Use specific UI elements that are always present for each step
      switch (stepName) {
        case 'SELECT_NOTIFICATION':
          await expect(
            this.mustReadButton,
            'Must Read button should be visible on SELECT_NOTIFICATION step'
          ).toBeVisible();
          break;
        case 'OVERRIDE_AND_CONFIRMATION':
          await expect(
            this.customSubjectRadio,
            'Custom subject radio should be visible on OVERRIDE_AND_CONFIRMATION step'
          ).toBeVisible();
          break;
        case 'MANAGE_TRANSLATIONS':
          await expect(
            this.languageButton,
            'Language button should be visible on MANAGE_TRANSLATIONS step'
          ).toBeVisible();
          break;
        default:
          throw new Error(`Unknown stepper step: ${stepName}`);
      }
    });
  }

  /**
   * Selects Must Read template option
   */
  async selectMustReadSingle(): Promise<void> {
    await test.step('Select Must Read template', async () => {
      await this.clickOnElement(this.mustReadButton);
      await this.mustReadRadio.waitFor({ state: 'visible' });
      await this.clickOnElement(this.mustReadRadio);
      await this.clickOnElement(this.nextButton);
    });
  }

  /**
   * Selects Follow template option
   */
  async selectFollowSingle(): Promise<void> {
    await test.step('Select Follow template', async () => {
      await this.clickOnElement(this.followButton.first());
      await this.followRadio.first().waitFor({ state: 'visible' });
      await this.clickOnElement(this.followRadio.first());
      await this.clickOnElement(this.nextButton);
    });
  }

  /**
   * Selects Alerts template option
   */
  async selectAlertsSingle(): Promise<void> {
    await test.step('Select Alerts template', async () => {
      await this.clickOnElement(this.alertsButton);
      await this.alertsRadio.waitFor({ state: 'visible' });
      await this.clickOnElement(this.alertsRadio);
      await this.clickOnElement(this.nextButton);
    });
  }

  /**
   * Chooses custom subject line option
   * @param subject - Optional subject text to fill immediately
   */
  async chooseCustomSubject(subject?: string): Promise<void> {
    await test.step('Choose custom subject line option', async () => {
      await this.clickOnElement(this.customSubjectRadio);

      if (subject) {
        const textarea = this.customSubjectTextareaFallback;
        await this.fillInElement(textarea.first(), subject);
      }
    });
  }

  /**
   * Types custom subject text and proceeds to next step
   * @param subject - The subject text to type
   */
  async typeCustomSubjectOnStep2(subject: string): Promise<void> {
    await test.step('Type custom subject and proceed', async () => {
      await this.clickOnElement(this.customSubjectTextarea);
      await this.fillInElement(this.customSubjectTextarea, subject);
      await this.nextIfPresent();
    });
  }

  /**
   * Clicks Next button if it's present and visible
   */
  async nextIfPresent(): Promise<void> {
    if (await this.nextButton.isVisible().catch(() => false)) {
      await this.clickOnButtonWithName(POPUP_BUTTONS.NEXT);
    }
  }

  /**
   * Cancels the current flow
   */
  async cancel(): Promise<void> {
    await test.step('Cancel current flow', async () => {
      await this.clickCancelButton(this.cancelButton);
    });
  }

  /**
   * Opens the language selection menu
   */
  async openLanguageMenu(): Promise<void> {
    await test.step('Open language selection menu', async () => {
      await this.clickOnElement(this.languageButton.first());

      const menuItems = this.page.locator('[role="menuitem"], [role="option"]');
      await expect(menuItems.first(), 'Language menu should be visible').toBeVisible({ timeout: 10_000 });
    });
  }

  /**
   * Selects a specific language from the dropdown
   * @param label - The language label to select
   */
  async selectLanguage(label: string): Promise<void> {
    await test.step(`Select language: ${label}`, async () => {
      const languageButton = this.page.getByRole('button', { name: /Language.*Open/i });

      await this.clickOnElement(languageButton);

      const menuItems = this.page.locator('[role="menuitem"]');
      await expect(menuItems.first(), 'Language menu should open').toBeVisible({ timeout: 10_000 });

      const allMenuItems = await this.page.locator('[role="menuitem"]').allTextContents();

      let target = this.page.getByRole('menuitem', { name: label });

      const count = await target.count();
      if (count === 0 && label.includes('Français')) {
        const frenchPatterns = ['Français - French', 'Français', 'French', 'FR'];

        for (const pattern of frenchPatterns) {
          target = this.page.getByRole('menuitem', { name: pattern });
          const patternCount = await target.count();

          if (patternCount > 0) {
            break;
          }
        }
      }

      if ((await target.count()) === 0) {
        throw new Error(`Language "${label}" not found in dropdown. Available: ${allMenuItems.join(', ')}`);
      }

      await this.clickOnElement(target);
      await expect(menuItems.first(), 'Language menu should close').toBeHidden({ timeout: 5_000 });
    });
  }

  /**
   * Selects the option to send test to a different email address
   */
  async chooseDifferentTestEmail(): Promise<void> {
    await test.step('Choose different email address for test send', async () => {
      await this.clickOnElement(this.differentEmailRadio);
    });
  }

  /**
   * Types an email in the test email input
   */
  async typeTestEmail(email: string): Promise<void> {
    await test.step('Type test email address', async () => {
      await this.fillInElement(this.testEmailInput, email);
    });
  }

  /**
   * Clicks the Send test button
   */
  async sendTestEmail(): Promise<void> {
    await test.step('Click Send test', async () => {
      await this.verifier.verifyTheElementIsEnabled(this.sendTestButton);
      await this.clickOnElement(this.sendTestButton);
    });
  }

  /**
   * Expects inline validation error for invalid email input
   */
  async expectInvalidEmailError(): Promise<void> {
    await this.verifyText('Please enter a valid email address');
  }

  /**
   * Expects success toast after sending a valid test email
   */
  async expectTestEmailSuccess(): Promise<void> {
    await this.verifyToastMessageIsVisibleWithText('Custom Email subject: Test email sent successfully');
  }

  /**
   * Blurs the test email input to trigger validation
   */
  async blurTestEmailInput(): Promise<void> {
    await test.step('Blur test email input to trigger validation', async () => {
      await this.page.keyboard.press('Tab');
    });
  }

  async expectSendTestDisabled(): Promise<void> {
    await expect(this.sendTestButton, 'Send test button should be disabled').toBeDisabled();
  }

  async expectSendTestEnabled(): Promise<void> {
    await expect(this.sendTestButton, 'Send test button should be enabled').toBeEnabled();
  }

  /**
   * Sets the manual translations toggle
   * @param on - Whether to turn manual translations on or off
   */
  async setManualTranslations(on: boolean): Promise<void> {
    //  multiple locator strategies for the manual translations switch
    const switchLocators = [
      this.manualTranslationsSwitch,
      this.page.getByRole('switch', { name: /manual/i }),
      this.page.locator('[role="switch"]').filter({ hasText: /manual/i }),
      this.page.locator('input[type="checkbox"]').filter({ hasText: /manual/i }),
    ];

    let switchElement = null;
    for (const locator of switchLocators) {
      try {
        await expect(locator, 'Manual translations switch should be visible').toBeVisible({ timeout: 5_000 });
        switchElement = locator;
        break;
      } catch {
        // Try next locator
      }
    }

    if (!switchElement) {
      // Manual translations switch not available, skip this step
      return;
    }

    const current = await switchElement.getAttribute('aria-checked');
    const isOn = current === 'true';
    if (isOn !== on) {
      await this.clickOnElement(switchElement);
    }
  }

  /**
   * Fills custom subject with multiple fallback strategies
   * @param subject - The subject text to fill
   */
  async fillManageTranslationsSubject(subject: string): Promise<void> {
    await this.fillInElement(this.translationTextarea, subject);
  }

  /**
   * Saves the current customization
   */
  async save(): Promise<void> {
    await test.step('Save customization', async () => {
      await this.clickOnButtonWithName(POPUP_BUTTONS.SAVE);
    });
  }

  /**
   * Expects the saved toast message to appear
   */
  async expectSavedToast(): Promise<void> {
    await this.verifyToastMessageIsVisibleWithText('Customization saved');
  }

  /**
   * Expects the deleted toast message to appear
   */
  async expectDeletedToast(): Promise<void> {
    await this.verifyToastMessageIsVisibleWithText('Customization deleted');
  }

  /**
   * Expects a specific toast message to appear
   * @param re - Regular expression to match the toast message
   */
  async expectToast(re: RegExp): Promise<void> {
    await expect(this.page.getByText(re), 'Expected toast text should appear').toBeVisible({ timeout: 15_000 });
  }

  /**
   * Verifies specific text is present on the page
   * @param text - Text to verify (string or regex)
   * @param timeout - Optional timeout override
   */
  async verifyText(text: string | RegExp, timeout = 10_000): Promise<void> {
    if (typeof text === 'string') {
      await this.verifier.verifyElementContainsText(this.bodyContainer, text, { timeout });
    } else {
      await expect(this.bodyContainer, 'Page body should contain expected text').toContainText(text, { timeout });
    }
  }

  /**
   * Verifies that Add customization link is visible
   */
  async expectAddCustomizationVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.addCustomizationLink);
  }

  /**
   * Verifies that a cell with specific text is visible
   * @param text - The cell text to verify
   */
  async expectCellVisible(text: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.page.getByRole('cell', { name: text }));
  }

  /**
   * Verifies that More button is visible and enabled
   */
  async expectMoreButtonReady(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.moreButton.first());
    await this.verifier.verifyTheElementIsEnabled(this.moreButton.first());
  }

  /**
   * Clears the custom subject textarea
   */
  async clearCustomSubject(): Promise<void> {
    await this.fillInElement(this.customSubjectTextarea, '');
  }

  /**
   * Verifies that the Next button is disabled
   */
  async expectNextButtonDisabled(): Promise<void> {
    await this.verifier.verifyTheElementIsDisabled(this.nextButton);
  }

  /**
   * Deletes a customization by its subject line text
   * @param subject - The subject line to identify the row to delete
   */
  async deleteBySubject(subject: string): Promise<void> {
    await test.step(`Delete customization with subject: ${subject}`, async () => {
      const row = this.rowBySubject(subject);
      await expect(row, `Row with subject \"${subject}\" should be visible`).toBeVisible({ timeout: 10_000 });
      await this.clickOnElement(row.getByRole('button', { name: /^more$/i }));
      await this.clickDeleteFromRowMenuAndConfirm();
      await this.expectDeletedToast();
      await expect(this.rowBySubject(subject), 'Deleted row should no longer be present').toHaveCount(0);
    });
  }

  /**
   * Clicks delete from row menu and confirms the deletion
   */
  async clickDeleteFromRowMenuAndConfirm(): Promise<void> {
    await test.step('Click delete from menu and confirm', async () => {
      const menuDelete = this.page
        .getByRole('menuitem', { name: /^delete$/i })
        .first()
        .or(this.page.getByRole('button', { name: /^delete$/i }).first());
      await expect(menuDelete, 'Row action menu should contain Delete').toBeVisible({ timeout: 10_000 });
      await this.clickOnElement(menuDelete);

      const confirm = this.page.getByRole('button', { name: /^delete$/i }).last();
      await expect(confirm, 'Delete confirmation button should be visible').toBeVisible({ timeout: 10_000 });
      await this.clickOnElement(confirm);
    });
  }

  /**
   * Helper method to get stepper text from step name
   * @param stepName - The step name key
   * @returns The display text for the step
   */
  private getStepperText(stepName: string): string {
    switch (stepName) {
      case 'SELECT_NOTIFICATION':
        return 'Select notification';
      case 'OVERRIDE_AND_CONFIRMATION':
        return 'Override and confirmation';
      case 'MANAGE_TRANSLATIONS':
        return 'Manage translations';
      default:
        throw new Error(`Unknown stepper step: ${stepName}`);
    }
  }

  /**
   * Selects French language from the dropdown
   */
  async selectFrenchLanguage(): Promise<void> {
    await this.selectLanguage('Français - French');
  }
}
