import { Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@/src/core/constants/timeouts';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { getNotificationUrlPath, NotificationType } from '@/src/modules/content/constants';

export interface IMySettingsNotificationsActions {
  navigateToCurrentUserNotificationSettings: (notificationType?: NotificationType) => Promise<void>;
  clickOnFeedTab: () => Promise<void>;
  clickOnShareYourPostCheckbox: () => Promise<void>;
  checkShareYourPostCheckbox: () => Promise<void>;
  uncheckShareYourPostCheckbox: () => Promise<void>;
  clickOnSaveButton: () => Promise<void>;
  clickOnOverwriteSettingsButton: () => Promise<void>;
  isShareYourPostCheckboxChecked: () => Promise<boolean>;
  waitForSaveToComplete: () => Promise<void>;
  confirmOverwriteSettings: () => Promise<void>;
  saveAndVerifyUnchecked: () => Promise<void>;
  saveAndVerifyChecked: () => Promise<void>;
  expandBrowserFeedSection: () => Promise<void>;
}

export interface IMySettingsNotificationsAssertions {
  verifyShareYourPostCheckboxIsVisible: () => Promise<void>;
  verifyShareYourPostCheckboxIsChecked: () => Promise<void>;
  verifyShareYourPostCheckboxIsUnchecked: () => Promise<void>;
  verifySaveButtonIsVisible: () => Promise<void>;
  verifyOverwriteSettingsButtonIsVisible: () => Promise<void>;
}

export class MySettingsNotificationsPage
  extends BasePage
  implements IMySettingsNotificationsActions, IMySettingsNotificationsAssertions
{
  readonly browserTab: Locator;
  readonly emailNotificationsTab: Locator;
  readonly feedButton: Locator;
  readonly feedTab: Locator;
  readonly shareYourPostCheckbox: Locator;
  readonly saveButton: Locator;
  readonly overwriteSettingsButton: Locator;
  readonly dialog: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page, userId?: string) {
    const notificationsPath = userId ? `/people/${userId}/edit/notifications/email` : '';
    super(page, notificationsPath);
    this.browserTab = this.page
      .getByRole('link', { name: 'Browser' })
      .or(this.page.getByRole('tab', { name: 'Browser' }));
    this.emailNotificationsTab = this.page.getByRole('tab', { name: 'Email notifications' });
    this.feedButton = this.page.getByRole('button', { name: 'Feed' });
    this.feedTab = this.page.getByRole('tab', { name: 'Feed' });
    this.shareYourPostCheckbox = this.page.getByRole('checkbox', { name: 'Shares your post' });
    this.saveButton = this.page.getByRole('button', { name: 'Save' });
    this.overwriteSettingsButton = this.page.getByRole('button', { name: 'Overwrite notification' });
    this.dialog = this.page.locator('[role="dialog"]').first();
    this.confirmButton = this.dialog.getByRole('button', { name: 'Confirm' });
  }

  get actions(): IMySettingsNotificationsActions {
    return this;
  }

  get assertions(): IMySettingsNotificationsAssertions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify My Settings Notifications page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.browserTab, {
        assertionMessage: 'My Settings Notifications page should be loaded',
      });
    });
  }

  async navigateToCurrentUserNotificationSettings(
    notificationType: NotificationType = NotificationType.EMAIL
  ): Promise<void> {
    await test.step(`Navigate to ${notificationType} notification settings`, async () => {
      const userId = await this.page.evaluate(() => {
        return (window as any).Simpplr?.CurrentUser?.uid;
      });
      const urlPathType = getNotificationUrlPath(notificationType);
      await this.goToUrl(`/people/${userId}/edit/notifications/${urlPathType}`);
      await this.verifyThePageIsLoaded();
    });
  }

  // Actions
  async clickOnFeedTab(): Promise<void> {
    await test.step('Click on Feed tab for Email notifications', async () => {
      const isFeedButtonVisible = await this.verifier.isTheElementVisible(this.feedButton, {
        timeout: TIMEOUTS.VERY_VERY_SHORT,
      });
      if (isFeedButtonVisible) {
        await this.clickOnElement(this.feedButton);
      } else {
        await this.clickOnElement(this.feedTab);
      }
      await this.ensureFeedSectionIsExpanded();
    });
  }

  async expandBrowserFeedSection(): Promise<void> {
    await test.step('Expand Browser notifications Feed section', async () => {
      const isBrowserTabVisible = await this.verifier.isTheElementVisible(this.browserTab, {
        timeout: TIMEOUTS.VERY_SHORT,
      });
      if (isBrowserTabVisible) {
        await this.clickOnElement(this.browserTab);
      }

      const isCheckboxVisible = await this.verifier.isTheElementVisible(this.shareYourPostCheckbox, {
        timeout: TIMEOUTS.VERY_VERY_SHORT,
      });
      const isFeedButtonVisible = await this.verifier.isTheElementVisible(this.feedButton, {
        timeout: TIMEOUTS.VERY_SHORT,
      });

      if (!isCheckboxVisible && isFeedButtonVisible) {
        await this.clickOnElement(this.feedButton);
        await this.verifier.waitUntilElementIsVisible(this.shareYourPostCheckbox, {
          stepInfo: 'Wait for Shares your post checkbox after expanding Feed',
          timeout: TIMEOUTS.SHORT,
        });
      }
    });
  }

  async clickOnShareYourPostCheckbox(): Promise<void> {
    await test.step('Click on Share your post checkbox', async () => {
      await this.clickOnElement(this.shareYourPostCheckbox);
    });
  }

  async checkShareYourPostCheckbox(): Promise<void> {
    await test.step('Check Share your post checkbox', async () => {
      // Ensure Feed section is expanded first
      await this.ensureFeedSectionIsExpanded();
      const isChecked = await this.shareYourPostCheckbox.isChecked();
      if (!isChecked) {
        await this.clickOnShareYourPostCheckbox();
      }
    });
  }

  async uncheckShareYourPostCheckbox(): Promise<void> {
    await test.step('Uncheck Share your post checkbox', async () => {
      // Ensure Feed section is expanded first
      await this.ensureFeedSectionIsExpanded();
      const isChecked = await this.shareYourPostCheckbox.isChecked();
      if (isChecked) {
        await this.clickOnShareYourPostCheckbox();
      }
    });
  }

  async clickOnSaveButton(): Promise<void> {
    await test.step('Click on Save button', async () => {
      await this.clickOnElement(this.saveButton);
    });
  }

  async clickOnOverwriteSettingsButton(): Promise<void> {
    await test.step('Click on Overwrite settings button', async () => {
      await this.clickOnElement(this.overwriteSettingsButton);
    });
  }

  async isShareYourPostCheckboxChecked(): Promise<boolean> {
    return await test.step('Check if Share your post checkbox is checked', async () => {
      // Ensure Feed section is expanded first
      await this.ensureFeedSectionIsExpanded();
      return await this.shareYourPostCheckbox.isChecked();
    });
  }

  async waitForSaveToComplete(): Promise<void> {
    await test.step('Wait for save operation to complete', async () => {
      await this.verifier.waitUntilElementIsVisible(this.shareYourPostCheckbox, {
        stepInfo: 'Wait for Share your post checkbox to be visible after save',
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  async confirmOverwriteSettings(): Promise<void> {
    await test.step('Confirm overwrite settings in dialog', async () => {
      // Wait for confirmation dialog to appear
      await this.verifier.waitUntilElementIsVisible(this.dialog, {
        stepInfo: 'Wait for confirmation dialog to appear',
        timeout: TIMEOUTS.SHORT,
      });

      // Click Confirm button within the dialog (scoped to dialog to ensure correct button)
      await this.verifier.waitUntilElementIsVisible(this.confirmButton, {
        stepInfo: 'Wait for Confirm button to be visible',
        timeout: TIMEOUTS.SHORT,
      });
      await this.clickOnElement(this.confirmButton);

      // Wait for dialog to close and overwrite to complete
      await this.verifier.waitUntilElementIsVisible(this.shareYourPostCheckbox, {
        stepInfo: 'Wait for Share your post checkbox to be visible after overwrite',
        timeout: TIMEOUTS.SHORT,
      });
    });
  }

  async saveAndVerifyUnchecked(): Promise<void> {
    await test.step('Save and verify checkbox is unchecked', async () => {
      await this.assertions.verifySaveButtonIsVisible();
      await this.actions.clickOnSaveButton();
      await this.actions.waitForSaveToComplete();
      await this.assertions.verifyShareYourPostCheckboxIsUnchecked();
    });
  }

  async saveAndVerifyChecked(): Promise<void> {
    await test.step('Save and verify checkbox is checked', async () => {
      await this.assertions.verifySaveButtonIsVisible();
      await this.actions.clickOnSaveButton();
      await this.actions.waitForSaveToComplete();
      await this.assertions.verifyShareYourPostCheckboxIsChecked();
    });
  }

  /**
   * Ensures the Feed section is expanded so the checkbox is visible
   * This is a helper method used before verifying checkbox state
   */
  private async ensureFeedSectionIsExpanded(): Promise<void> {
    // Check if checkbox is already visible
    const isCheckboxVisible = await this.verifier.isTheElementVisible(this.shareYourPostCheckbox, {
      timeout: TIMEOUTS.VERY_VERY_SHORT,
    });

    if (!isCheckboxVisible) {
      // Check if Feed button exists and click it to expand
      const isFeedButtonVisible = await this.verifier.isTheElementVisible(this.feedButton, {
        timeout: TIMEOUTS.VERY_SHORT,
      });

      if (isFeedButtonVisible) {
        await this.clickOnElement(this.feedButton);
        // Wait for checkbox to appear after expanding Feed section
        await this.verifier.waitUntilElementIsVisible(this.shareYourPostCheckbox, {
          stepInfo: 'Wait for Share your post checkbox to be visible after expanding Feed',
          timeout: TIMEOUTS.SHORT,
        });
      } else {
        // Try Feed as tab for user-level settings
        const isFeedTabVisible = await this.verifier.isTheElementVisible(this.feedTab, {
          timeout: TIMEOUTS.VERY_SHORT,
        });
        if (isFeedTabVisible) {
          await this.clickOnElement(this.feedTab);
          await this.verifier.waitUntilElementIsVisible(this.shareYourPostCheckbox, {
            stepInfo: 'Wait for Share your post checkbox to be visible after clicking Feed tab',
            timeout: TIMEOUTS.SHORT,
          });
        }
      }
    }
  }

  // Assertions
  async verifyShareYourPostCheckboxIsVisible(): Promise<void> {
    await test.step('Verify Share your post checkbox is visible', async () => {
      // Ensure Feed section is expanded first
      await this.ensureFeedSectionIsExpanded();
      await this.verifier.verifyTheElementIsVisible(this.shareYourPostCheckbox, {
        assertionMessage: 'Share your post checkbox should be visible',
      });
    });
  }

  async verifyShareYourPostCheckboxIsChecked(): Promise<void> {
    await test.step('Verify Share your post checkbox is checked', async () => {
      // Ensure Feed section is expanded first
      await this.ensureFeedSectionIsExpanded();
      // Then verify it's checked using the verifier method which has proper timeout handling
      await this.verifier.verifyTheElementIsChecked(this.shareYourPostCheckbox, {
        assertionMessage: 'Share your post checkbox should be checked',
      });
    });
  }

  async verifyShareYourPostCheckboxIsUnchecked(): Promise<void> {
    await test.step('Verify Share your post checkbox is unchecked', async () => {
      // Ensure Feed section is expanded first
      await this.ensureFeedSectionIsExpanded();
      // Then verify it's not checked using the verifier method which has proper timeout handling
      await this.verifier.verifyTheElementIsNotChecked(this.shareYourPostCheckbox, {
        assertionMessage: 'Share your post checkbox should be unchecked',
      });
    });
  }

  async verifySaveButtonIsVisible(): Promise<void> {
    await test.step('Verify Save button is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.saveButton, {
        assertionMessage: 'Save button should be visible',
      });
    });
  }

  async verifyOverwriteSettingsButtonIsVisible(): Promise<void> {
    await test.step('Verify Overwrite settings button is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.overwriteSettingsButton, {
        assertionMessage: 'Overwrite settings button should be visible',
      });
    });
  }
}
