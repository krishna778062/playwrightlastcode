import { expect, Locator, Page, test } from '@playwright/test';
import { MANAGE_APP_SETTING_MESSAGES } from '@recognition-constants/messages';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

export class ManageAppRecognitionSettingPage extends BasePage {
  readonly enableDisableHeader: Locator;
  readonly commentsRecognitionPostsHeader: Locator;
  readonly commentEnableDisableToggle: Locator;
  readonly saveButton: Locator;
  readonly disableCommentsModal: Locator;
  readonly disableCommentsConfirmButton: Locator;
  disableCommentsModalHeading: Locator;
  disableCommentsCancelButton: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.MANAGE_APP_RECOGNITION_SETTING) {
    super(page, pageUrl);
    this.enableDisableHeader = page.getByRole('heading', { name: /enable\/disable recognition/i }).first();
    this.commentsRecognitionPostsHeader = page.getByRole('heading', { name: /comments on recognition posts/i }).first();
    this.commentEnableDisableToggle = page.getByRole('checkbox', { name: 'commentsEnabled' });
    this.saveButton = page.getByRole('button', { name: /save/i }).first();
    this.disableCommentsModal = page.locator('[role="dialog"]').first();
    this.disableCommentsModalHeading = this.disableCommentsModal
      .getByRole('heading', { name: /disable comments/i })
      .first();
    this.disableCommentsCancelButton = this.disableCommentsModal.getByRole('button', { name: /cancel/i }).first();
    this.disableCommentsConfirmButton = this.disableCommentsModal
      .getByRole('button', { name: /disable comments/i })
      .first();
  }

  /**
   * Navigate to Manage Recognition Application Setting page via endpoint
   */
  async navigateManageAppRecognitionSettingPageViaEndpoint(): Promise<void> {
    await test.step(`Navigating to ${this.pageUrl} via endpoint`, async () => {
      const response = await this.page.goto(this.pageUrl, { waitUntil: 'domcontentloaded' });
      expect(
        response?.ok(),
        `Failed to load manage recognition settings page. Status: ${response?.status()}`
      ).toBeTruthy();
      await this.verifyThePageIsLoaded();
    });
  }

  /**
   * Verify that the manage recognition application setting page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the manage recognition application setting page is loaded', async () => {
      await expect(
        this.enableDisableHeader,
        'expecting enable/disable recognition header element to be visible'
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Verify all Comments setting related UI elements are present and actionable.
   */
  async verifyRecognitionCommentsSettingsUIElements(): Promise<void> {
    await test.step('Verifying comments settings UI elements', async () => {
      await expect(
        this.commentsRecognitionPostsHeader,
        'Comments & recognition posts header should be visible'
      ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await expect(
        this.page.getByText(MANAGE_APP_SETTING_MESSAGES.COMMENTS_HELPER_MESSAGE),
        'Comments helper message should be visible'
      ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await expect(
        this.page.getByText(MANAGE_APP_SETTING_MESSAGES.COMMENTS_ENABLED_MESSAGE),
        'Comments enabled message should be visible'
      ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await expect(
        this.page.getByText(MANAGE_APP_SETTING_MESSAGES.COMMENTS_DISABLED_MESSAGE),
        'Comments disabled message should be visible'
      ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Enable or disable comments on recognition posts.
   * @param mode 'enable' | 'disable'
   */
  async verifyEnableDisableCommentsSetting(mode: 'enable' | 'disable'): Promise<void> {
    await test.step(`Setting comments on recognition posts to ${mode}`, async () => {
      // Radio inputs are keyed by name=value. Use DISABLED for disable, ENABLED for enable.
      const targetValue = mode === 'disable' ? 'DISABLED' : 'ENABLED';
      const radio = this.page.locator(`input[type="radio"][name="commentsEnabled"][value="${targetValue}"]`).first();
      await radio.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      await expect(radio, 'Comments enable/disable radio should be visible').toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      const isChecked = await radio.isChecked().catch(() => false);
      if (!isChecked) {
        // Use click to avoid "did not change state" errors when it is already selected
        await radio.click({ force: true });
        await this.saveTheChanges();
      }
      await expect(radio, 'Comments setting radio should be checked after toggle').toBeChecked();
    });
  }

  /**
   * Save the changes on the manage recognition app settings page
   */
  async saveTheChanges(): Promise<void> {
    await test.step('Saving manage recognition app settings', async () => {
      await this.saveButton.waitFor({ state: 'visible', timeout: TIMEOUTS.MEDIUM });
      await expect(this.saveButton, 'Save button should be enabled before saving').toBeEnabled();
      await this.saveButton.click();
    });
  }

  /**
   * Verify disable comments confirmation modal elements are visible
   */
  async verifyDisableCommentsModalElements(): Promise<void> {
    await test.step('Verifying disable comments confirmation modal', async () => {
      await expect(this.disableCommentsModal, 'Disable comments modal should be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(this.disableCommentsModalHeading, 'Disable comments modal heading should be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(
        this.disableCommentsModal.getByText(MANAGE_APP_SETTING_MESSAGES.DISABLE_COMMENTS_CONFIRMATION)
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(
        this.disableCommentsModal.getByText(MANAGE_APP_SETTING_MESSAGES.DISABLE_COMMENTS_WARNING)
      ).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(this.disableCommentsCancelButton, 'Cancel button should be visible on disable modal').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Click disable comments button in the disable comments confirmation modal
   */
  async clickDisableCommentsButton(): Promise<void> {
    await test.step('Confirming disable comments action', async () => {
      await expect(
        this.disableCommentsConfirmButton,
        'Disable comments confirmation button should be visible'
      ).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await expect(
        this.disableCommentsConfirmButton,
        'Disable comments confirmation button should be enabled'
      ).toBeEnabled({ timeout: TIMEOUTS.MEDIUM });
      await this.disableCommentsConfirmButton.click();
      await expect(this.disableCommentsModal, 'Disable comments modal should close after confirmation').toBeHidden({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }
}
