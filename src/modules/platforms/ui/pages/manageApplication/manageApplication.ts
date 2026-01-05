import { APIRequestContext, Locator, Page, test } from '@playwright/test';

import { RequestContextFactory } from '@core/api/factories/requestContextFactory';
import { AppConfigurationService } from '@platforms/apis/services/AppConfigurationService';

import { BasePage } from '@/src/core/ui/pages/basePage';

export class ManageApplicationPage extends BasePage {
  readonly clientApplicationHeading: Locator;
  readonly emailNotificationsHeading: Locator;
  readonly browserNotificationsHeading: Locator;
  readonly addClientAppButton: Locator;
  readonly clientApplicationNameInput: Locator;
  readonly clientApplicationIdInput: Locator;
  readonly clientApplicationDescriptionTextarea: Locator;
  readonly clientRedirectUrlInput: Locator;
  readonly saveButton: Locator;
  readonly useRecommendedButton: Locator;
  readonly optionsMenu: Locator;
  readonly addedClientApplicationRows: Locator;

  constructor(page: Page, pageUrl?: string) {
    super(page, pageUrl);
    this.clientApplicationHeading = page.locator('h3:has-text("Client application")');
    this.emailNotificationsHeading = page.locator('h2:has-text("Email notifications")');
    this.browserNotificationsHeading = page.locator('h2:has-text("Browser notifications")');
    this.addClientAppButton = page.locator('span:has-text("Add client app")');
    this.clientApplicationNameInput = page.locator('#app_disp_name');
    this.clientApplicationIdInput = page.locator('#app_id');
    this.clientApplicationDescriptionTextarea = page.locator('textarea[name="app_desc"]');
    this.clientRedirectUrlInput = page.locator('#redirect_uri');
    this.saveButton = page.locator('button:has-text("Save")');
    this.useRecommendedButton = page.locator('button:has(span:has-text("Use recommended"))');
    this.optionsMenu = page.locator('(//*[contains(@class,"OptionsMenu-iconContainer")])[1]');
    this.addedClientApplicationRows = page.locator('li[class*="istingItem--borderLastChild"]');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the manage application page is loaded', async () => {
      await this.verifier.waitUntilElementIsVisible(this.clientApplicationHeading, {
        timeout: 10000,
      });
    });
  }

  async navigateToClientApplicationPage(): Promise<void> {
    await test.step('Navigate to client application page', async () => {
      const zuluUrl = process.env.ZULU_URL;
      const currentUrl = this.page.url();
      const path = 'manage/app/integrations/clientapp';

      if (zuluUrl && currentUrl.includes('zulu')) {
        await this.goToUrl(`${zuluUrl}/${path}`);
      } else {
        await this.goToUrl(path);
      }
      await this.waitForClientApplicationHeading();
    });
  }

  async waitForClientApplicationHeading(): Promise<void> {
    await test.step('Wait for Client application heading', async () => {
      await this.verifier.waitUntilElementIsVisible(this.clientApplicationHeading, {
        timeout: 10000,
      });
    });
  }

  async navigateToEmailNotificationsPage(): Promise<void> {
    await test.step('Navigate to email notifications page', async () => {
      const zuluUrl = process.env.ZULU_URL;
      const currentUrl = this.page.url();
      const path = 'manage/app/defaults/email-notifications';

      if (zuluUrl && currentUrl.includes('zulu')) {
        await this.goToUrl(`${zuluUrl}/${path}`);
      } else {
        await this.goToUrl(path);
      }
      await this.waitForEmailNotificationsHeading();
    });
  }

  async waitForEmailNotificationsHeading(): Promise<void> {
    await test.step('Wait for Email notifications heading', async () => {
      await this.verifier.waitUntilElementIsVisible(this.emailNotificationsHeading, {
        timeout: 10000,
      });
    });
  }

  async navigateToBrowserNotificationsPage(): Promise<void> {
    await test.step('Navigate to browser notifications page', async () => {
      const zuluUrl = process.env.ZULU_URL;
      const currentUrl = this.page.url();
      const path = 'manage/app/defaults/browser-notifications';

      if (zuluUrl && currentUrl.includes('zulu')) {
        await this.goToUrl(`${zuluUrl}/${path}`);
      } else {
        await this.goToUrl(path);
      }
      await this.waitForBrowserNotificationsHeading();
    });
  }

  async waitForBrowserNotificationsHeading(): Promise<void> {
    await test.step('Wait for Browser notifications heading', async () => {
      await this.verifier.waitUntilElementIsVisible(this.browserNotificationsHeading, {
        timeout: 10000,
      });
    });
  }

  async clickOnElementWithTagAndText(tag: string, text: string): Promise<void> {
    await test.step(`Click on ${tag} element with text "${text}"`, async () => {
      const locator = this.page.locator(`${tag}:has-text("${text}")`).first();
      await this.clickOnElement(locator, {
        stepInfo: `Click on ${tag} with text "${text}"`,
      });
    });
  }

  private async waitForPageToLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await this.page
      .locator('progressbar[aria-label*="Loading"]')
      .waitFor({ state: 'hidden', timeout: 10000 })
      .catch(() => {});
  }

  async clickOnAddClientApp(): Promise<void> {
    await test.step('Click on Add client app button', async () => {
      await this.clickOnElement(this.addClientAppButton, {
        stepInfo: 'Click on Add client app button',
      });
    });
  }

  async enterTextInClientApplicationField(text: string, field: string): Promise<void> {
    await test.step(`Enter "${text}" in ${field}`, async () => {
      let locator: Locator;

      switch (field) {
        case 'Client application name':
          locator = this.clientApplicationNameInput;
          break;
        case 'Client application id':
          locator = this.clientApplicationIdInput;
          break;
        case 'Client application description':
          locator = this.clientApplicationDescriptionTextarea;
          break;
        case 'Client redirect URL':
          locator = this.clientRedirectUrlInput;
          break;
        default:
          throw new Error(`Unknown field: ${field}`);
      }

      await this.verifier.waitUntilElementIsVisible(locator, { timeout: 10000 });
      await this.fillInElement(locator, text, {
        stepInfo: `Enter ${text} in ${field}`,
      });
    });
  }

  async clickOnSave(): Promise<void> {
    await test.step('Scroll and click on Save button', async () => {
      await this.saveButton.scrollIntoViewIfNeeded();
      await this.verifier.verifyTheElementIsEnabled(this.saveButton, { timeout: 10000 });
      await this.clickOnElement(this.saveButton, {
        stepInfo: 'Click on Save button',
      });
    });
  }

  async clickOnUseRecommended(): Promise<void> {
    await test.step('Click on Use recommended button', async () => {
      await this.verifier.waitUntilElementIsVisible(this.useRecommendedButton, { timeout: 10000 });
      await this.clickOnElement(this.useRecommendedButton, {
        stepInfo: 'Click on Use recommended button',
      });
    });
  }

  async checkEmailNotificationCheckbox(field: string): Promise<void> {
    await test.step(`Check email notification checkbox for "${field}"`, async () => {
      await this.waitForPageToLoad();

      const checkbox = this.page.locator(`input[type="checkbox"][id*="${field}"]`).first();
      await this.verifier.waitUntilElementIsVisible(checkbox, { timeout: 10000 });
      const isChecked = await checkbox.isChecked();

      // Always ensure a change is made: if already checked, uncheck first then check
      if (isChecked) {
        await checkbox.scrollIntoViewIfNeeded();
        await checkbox.uncheck();
        await this.page.waitForTimeout(300);
        await checkbox.check();
      } else {
        await checkbox.scrollIntoViewIfNeeded();
        await checkbox.check();
      }
      // Wait a bit for UI to update and enable Save button
      await this.page.waitForTimeout(500);
    });
  }

  async uncheckEmailNotificationCheckbox(field: string): Promise<void> {
    await test.step(`Uncheck email notification checkbox for "${field}"`, async () => {
      await this.waitForPageToLoad();

      const checkbox = this.page.locator(`input[type="checkbox"][id*="${field}"]`).first();
      await this.verifier.waitUntilElementIsVisible(checkbox, { timeout: 10000 });
      const isChecked = await checkbox.isChecked();

      // Always ensure a change is made: if already unchecked, check first then uncheck
      if (!isChecked) {
        await checkbox.scrollIntoViewIfNeeded();
        await checkbox.check();
        await this.page.waitForTimeout(300);
        await checkbox.uncheck();
      } else {
        await checkbox.scrollIntoViewIfNeeded();
        await checkbox.uncheck();
      }
      // Wait a bit for UI to update and enable Save button
      await this.page.waitForTimeout(500);
    });
  }

  async uncheckMultipleEmailNotificationCheckboxes(fields: string[]): Promise<void> {
    await test.step(`Uncheck multiple email notification checkboxes: ${fields.join(', ')}`, async () => {
      for (const field of fields) {
        await this.uncheckEmailNotificationCheckbox(field);
      }
    });
  }

  async clickOnEmailNotificationFrequencyLabel(frequency: 'Daily' | 'Immediate'): Promise<void> {
    await test.step(`Click on email notification frequency label: "${frequency}"`, async () => {
      const fieldId = `emailNotificationFrequency_${frequency}`;
      const label = this.page.locator(`label[for*="${fieldId}"]`).first();
      await this.verifier.waitUntilElementIsVisible(label, { timeout: 10000 });
      await label.scrollIntoViewIfNeeded();
      await this.clickOnElement(label, {
        stepInfo: `Click on email notification frequency label: ${frequency}`,
      });
    });
  }

  async saveAndVerifySuccess(): Promise<void> {
    await test.step('Save changes and verify success message', async () => {
      await this.clickOnSave();
      await this.verifyTheDisplayOfMessageWithText('Saved changes successfully');
      // Wait a bit for the page state to update after save
      await this.page.waitForTimeout(1000);
    });
  }

  async mouseHoverOnOptionMenuAndClickOption(option: 'Edit' | 'Delete'): Promise<void> {
    await test.step(`Mouse hover on OptionMenu and click on ${option}`, async () => {
      await this.verifier.waitUntilElementIsVisible(this.optionsMenu, { timeout: 10000 });
      await this.optionsMenu.scrollIntoViewIfNeeded();
      await this.optionsMenu.hover();

      const optionButton = this.page.locator(`button:has-text("${option}")`).first();
      await this.verifier.waitUntilElementIsVisible(optionButton, { timeout: 5000 });
      await this.clickOnElement(optionButton, {
        stepInfo: `Click on ${option} option`,
      });
    });
  }

  async deleteAllAddedClientApps(): Promise<void> {
    await test.step('Delete all added client apps', async () => {
      let count = 0;
      const maxAttempts = 10;
      await this.page.waitForTimeout(1000);
      const rows = this.addedClientApplicationRows;
      const rowCount = await rows.count();

      while (rowCount > 1 && count < maxAttempts) {
        const currentCount = await rows.count();
        if (currentCount <= 1) {
          break;
        }
        await this.mouseHoverOnOptionMenuAndClickOption('Delete');
        await this.verifyTheDisplayOfMessageWithText('Client application deleted successfully');
        await this.page.waitForTimeout(1000);
        count++;
      }
    });
  }

  async verifyThePresenceOfFieldWithHtmlTagAndText(tag: string, text: string): Promise<void> {
    await test.step(`Verify presence of ${tag} element with text "${text}"`, async () => {
      const locator = this.page.locator(`${tag}:has-text("${text}")`).first();
      await this.verifier.verifyTheElementIsVisible(locator);
    });
  }

  async verifyTheDisplayOfMessageWithText(message: string): Promise<void> {
    await test.step(`Verify display of message: "${message}"`, async () => {
      const messageLocator = this.page.locator(`p:has-text("${message}")`).first();
      await this.verifier.verifyTheElementIsVisible(messageLocator, { timeout: 10000 });
    });
  }

  async updateAppNameViaAPI(appName: string): Promise<void> {
    await test.step(`Update appName via API to "${appName}"`, async () => {
      // @ts-ignore - process.env is available at runtime
      const zuluApiUrl = process.env.ZULU_API_URL;
      if (!zuluApiUrl) {
        throw new Error('ZULU_API_URL not configured in environment variables');
      }

      // @ts-ignore - process.env is available at runtime
      const zuluAppManagerEmail = process.env.ZULU_APPLICATION_MANAGER;
      // @ts-ignore - process.env is available at runtime
      const zuluPassword = process.env.ZULU_PASSWORD;
      if (!zuluAppManagerEmail || !zuluPassword) {
        throw new Error('ZULU_APPLICATION_MANAGER or ZULU_PASSWORD not configured in environment variables');
      }

      // Create API context for Zulu
      const apiContext: APIRequestContext = await RequestContextFactory.createAuthenticatedContext(zuluApiUrl, {
        email: zuluAppManagerEmail,
        password: zuluPassword,
      });

      try {
        // Update appName via API
        const appConfigurationService = new AppConfigurationService(apiContext, zuluApiUrl);
        await appConfigurationService.updateAppConfigField(
          { appName },
          `Post Zeus API general with field appName and data ${appName}`
        );
      } finally {
        await apiContext.dispose();
      }

      // Refresh the page to load the updated appName
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      // Note: Don't wait for specific heading here as this method is used from both email and browser notifications pages
      // The calling test should navigate to the appropriate page after API update
    });
  }

  async verifyEmailNotificationsFieldsPresence(): Promise<void> {
    await test.step('Verify presence of all Email Notification fields', async () => {
      // Verify the presence of field with html tag "h2" and text "Email notifications"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('h2', 'Email notifications');

      // Verify the presence of field with html tag "p" and text "The default email notification settings allow you to define which emails new employees will receive from Good & Co Inc.. Employees can then customise their own email preferences in my settings."
      await this.verifyThePresenceOfFieldWithHtmlTagAndText(
        'p',
        'The default email notification settings allow you to define which emails new employees will receive from Good & Co Inc.. Employees can then customise their own email preferences in my settings.'
      );

      // Verify the presence of field with html tag "span" and text "All"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('span', 'All');

      // Verify the presence of field with html tag "label" and text "Org communications"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'Org communications');

      // Verify the presence of field with html tag "label" and text "Profile & expertise"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'Profile & expertise');

      // Verify the presence of field with html tag "label" and text "Feed"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'Feed');

      // Verify the presence of field with html tag "label" and text "Sites"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'Sites');

      // Verify the presence of field with html tag "label" and text "Content"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'Content');

      // Verify the presence of field with html tag "label" and text "Events"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'Events');

      // Verify the presence of field with html tag "label" and text "Site management"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'Site management');

      // Verify the presence of field with html tag "label" and text "App management"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'App management');
    });
  }

  async verifyEmailNotificationFrequencyFieldsPresence(): Promise<void> {
    await test.step('Verify presence of Email Notification Frequency fields', async () => {
      // Verify the presence of field with html tag "h2" and text "Email notification frequency"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('h2', 'Email notification frequency');

      // Verify the presence of field with html tag "p" and text "Receive email notifications immediately or summarized in a single daily email"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText(
        'p',
        'Receive email notifications immediately or summarized in a single daily email'
      );

      // Verify the presence of field with html tag "label" and text "Immediately"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'Immediately');

      // Verify the presence of field with html tag "label" and text "Summarize daily"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'Summarize daily');

      // Verify the presence of field with html tag "p" and text "Email notification settings will be applied to all new users."
      await this.verifyThePresenceOfFieldWithHtmlTagAndText(
        'p',
        'Email notification settings will be applied to all new users.'
      );

      // Verify the presence of field with html tag "button" and text "Overwrite notification settings for all users"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('button', 'Overwrite notification settings for all users');
    });
  }

  async verifyBrowserNotificationsFieldsPresence(): Promise<void> {
    await test.step('Verify presence of all Browser Notification fields', async () => {
      // Verify the presence of field with html tag "h2" and text "Browser notifications"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('h2', 'Browser notifications');

      // Verify the presence of field with html tag "p" and text "The default browser notifications settings allow you to define which browser notifications new users will receive from Good & Co Inc."
      await this.verifyThePresenceOfFieldWithHtmlTagAndText(
        'p',
        'The default browser notifications settings allow you to define which browser notifications new users will receive from Good & Co Inc.'
      );

      // Verify the presence of field with html tag "p" and text "Notifications will only be sent to users whose browser is configured to allow notifications from Good & Co Inc.. A request to allow notifications will be displayed in the notification panel and in their profile & settings page."
      await this.verifyThePresenceOfFieldWithHtmlTagAndText(
        'p',
        'Notifications will only be sent to users whose browser is configured to allow notifications from Good & Co Inc.. A request to allow notifications will be displayed in the notification panel and in their profile & settings page.'
      );

      // Verify the presence of field with html tag "span" and text "Use recommended"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('span', 'Use recommended');

      // Verify the presence of field with html tag "span" and text "All"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('span', 'All');

      // Verify the presence of field with html tag "label" and text "Org communications"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'Org communications');

      // Verify the presence of field with html tag "label" and text "Profile & expertise"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'Profile & expertise');

      // Verify the presence of field with html tag "label" and text "Feed"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'Feed');

      // Verify the presence of field with html tag "label" and text "Sites"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'Sites');

      // Verify the presence of field with html tag "label" and text "Content"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'Content');

      // Verify the presence of field with html tag "label" and text "Events"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'Events');

      // Verify the presence of field with html tag "label" and text "Site management"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('label', 'Site management');

      // Verify the presence of field with html tag "p" and text "Browser notification settings will be applied to all new users."
      await this.verifyThePresenceOfFieldWithHtmlTagAndText(
        'p',
        'Browser notification settings will be applied to all new users.'
      );

      // Verify the presence of field with html tag "button" and text "Overwrite notification settings for all users"
      await this.verifyThePresenceOfFieldWithHtmlTagAndText('button', 'Overwrite notification settings for all users');
    });
  }
}
