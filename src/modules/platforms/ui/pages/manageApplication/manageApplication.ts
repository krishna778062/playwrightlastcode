import { APIRequestContext, Locator, Page, test } from '@playwright/test';

import { RequestContextFactory } from '@core/api/factories/requestContextFactory';
import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { AppConfigurationService } from '@platforms/apis/services/AppConfigurationService';

import { BasePage } from '@/src/core/ui/pages/basePage';
import { FeedManagementService } from '@/src/modules/content/apis/services/FeedManagementService';

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
    // Wait for loading progressbar to disappear - this is critical, so we wait with a reasonable timeout
    // Note: We don't wait for 'networkidle' as it's unreliable in modern web apps with continuous network activity
    const loadingProgressbar = this.page.locator('progressbar[aria-label*="Loading"]');
    try {
      await loadingProgressbar.waitFor({ state: 'hidden', timeout: 15000 });
    } catch {
      // If progressbar doesn't exist, that's also fine (page might not show it)
      const isVisible = await loadingProgressbar.isVisible().catch(() => false);
      if (isVisible) {
        throw new Error('Page loading progressbar did not disappear within timeout');
      }
    }
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
      // Wait for page to finish loading first (progressbar to disappear)
      await this.waitForPageToLoad();
      let locator;
      // Use getByRole for headings (h1, h2, h3, etc.) as suggested by codegen
      if (tag.toLowerCase().startsWith('h') && tag.length === 2) {
        const level = parseInt(tag.charAt(1));
        if (level >= 1 && level <= 6) {
          locator = this.page.getByRole('heading', { name: text, level });
        } else {
          // Fallback: use locator with hasText for non-standard headings
          // Exclude the main app container (#app) which is always hidden
          locator = this.page.locator(`${tag}:not(#app)`).filter({ hasText: text }).first();
        }
      } else if (tag.toLowerCase() === 'button') {
        // For buttons, use getByRole which is more reliable
        locator = this.page.getByRole('button', { name: text, exact: false });
      } else {
        // For other tags, use locator with hasText which handles nested text better
        // hasText checks the element and all its descendants for the text
        // Exclude the main app container (#app) which is always hidden
        locator = this.page.locator(`${tag}:not(#app)`).filter({ hasText: text }).first();
      }
      // Wait for element to be visible (for buttons and headings) or attached (for other elements)
      if (tag.toLowerCase() === 'button' || (tag.toLowerCase().startsWith('h') && tag.length === 2)) {
        await this.verifier.waitUntilElementIsVisible(locator, { timeout: 15000 });
      } else {
        await locator.waitFor({ state: 'attached', timeout: 15000 });
        // Verify the text content exists (more reliable than visibility check for descriptive text)
        const textContent = await locator.textContent({ timeout: 5000 }).catch(() => '');
        if (!textContent?.includes(text)) {
          throw new Error(`Expected text "${text}" not found in ${tag} element`);
        }
      }
    });
  }

  async verifyTheDisplayOfMessageWithText(message: string): Promise<void> {
    await test.step(`Verify display of message: "${message}"`, async () => {
      // Use getByText which is more reliable for finding text, then filter to exclude app container
      // The message could be in p, div, span, or other elements
      const messageLocator = this.page
        .getByText(message, { exact: false })
        .filter({ hasNot: this.page.locator('#app') })
        .first();
      // Wait for element to be visible and stable (not just attached)
      // This ensures the element is actually rendered and won't be detached during scroll
      await this.verifier.waitUntilElementIsVisible(messageLocator, { timeout: 10000 });
    });
  }

  async scrollToElementWithHtmlTagAndText(tag: string, text: string): Promise<void> {
    await test.step(`Scroll to element with html tag "${tag}" and text "${text}"`, async () => {
      // Wait for page to finish loading first (progressbar to disappear)
      await this.waitForPageToLoad();
      let locator;
      // Use getByRole for headings (h1, h2, h3, etc.) as suggested by codegen
      if (tag.toLowerCase().startsWith('h') && tag.length === 2) {
        const level = parseInt(tag.charAt(1));
        if (level >= 1 && level <= 6) {
          locator = this.page.getByRole('heading', { name: text, level });
        } else {
          // Fallback: use locator with hasText for non-standard headings
          // Exclude the main app container (#app) which is always hidden
          locator = this.page.locator(`${tag}:not(#app)`).filter({ hasText: text }).first();
        }
      } else {
        // For other tags, use locator with hasText which handles nested text better
        // hasText checks the element and all its descendants for the text
        // Exclude the main app container (#app) which is always hidden
        locator = this.page.locator(`${tag}:not(#app)`).filter({ hasText: text }).first();
      }
      // Wait for element to be attached first, then scroll into view, then check visibility
      await locator.waitFor({ state: 'attached', timeout: 15000 });
      await locator.scrollIntoViewIfNeeded();
      await this.verifier.waitUntilElementIsVisible(locator, { timeout: 15000 });
    });
  }

  async checkLanguageCheckbox(fieldId: string): Promise<void> {
    await test.step(`Check language checkbox with field id "${fieldId}"`, async () => {
      const checkbox = this.page.locator(`input[id*="${fieldId}"]`).first();
      await this.verifier.waitUntilElementIsVisible(checkbox, { timeout: 10000 });
      await checkbox.scrollIntoViewIfNeeded();
      if (!(await checkbox.isChecked())) {
        await checkbox.check();
      }
    });
  }

  async checkAutomatedTranslationsCheckbox(option: 'Enabled' | 'Disabled'): Promise<void> {
    await test.step(`Check automated translations checkbox with option "${option}"`, async () => {
      // Find the checkbox associated with the option text
      const optionSpan = this.page.locator(`span:has-text("${option}")`).first();
      await this.verifier.waitUntilElementIsVisible(optionSpan, { timeout: 10000 });
      await optionSpan.scrollIntoViewIfNeeded();

      // Find the associated checkbox (usually a sibling or parent element)
      const checkbox = optionSpan.locator('..').locator('input[type="checkbox"]').first();
      if ((await checkbox.count()) === 0) {
        // If checkbox not found as sibling, try clicking the label/span itself
        await this.clickOnElement(optionSpan, { stepInfo: `Click on ${option} option` });
      } else {
        if (!(await checkbox.isChecked())) {
          await checkbox.check();
        }
      }
    });
  }

  async verifyAutomatedTranslationEnabledInAppConfig(
    apiContext: APIRequestContext,
    baseUrl: string,
    expectedValue: boolean
  ): Promise<void> {
    await test.step(`Verify that automatedTranslationEnabled in response of API appConfig is "${expectedValue}"`, async () => {
      const appConfig = await this.getAppConfigViaAPI(apiContext, baseUrl);
      const actualValue = appConfig.result.automatedTranslationEnabled;
      if (actualValue !== expectedValue) {
        throw new Error(`Expected automatedTranslationEnabled to be ${expectedValue} but got ${actualValue}`);
      }
    });
  }

  async verifyTranslateOptionIsNotPresent(): Promise<void> {
    await test.step('Verify that Translate option is not present', async () => {
      const translateOption = this.page.locator('span:has-text("Translate"), button:has-text("Translate")').first();
      await this.verifier.verifyTheElementIsNotVisible(translateOption, { timeout: 5000 });
    });
  }

  async navigateToGeneralSetupPage(): Promise<void> {
    await test.step('Navigate to General setup page', async () => {
      const zuluUrl = process.env.ZULU_URL;
      const currentUrl = this.page.url();
      const path = PAGE_ENDPOINTS.APPLICATION_SETTINGS;

      if (zuluUrl && currentUrl.includes('zulu')) {
        await this.goToUrl(`${zuluUrl}/${path}`);
      } else {
        await this.goToUrl(path);
      }
      await this.waitForPresenceOfTextWithTag('Languages', 'h2');
    });
  }

  async waitForPresenceOfTextWithTag(text: string, tag: string): Promise<void> {
    await test.step(`Wait for presence of text "${text}" with tag "${tag}"`, async () => {
      // Wait for page to finish loading first (progressbar to disappear)
      await this.waitForPageToLoad();
      let locator;
      // Use getByRole for headings (h1, h2, h3, etc.) as suggested by codegen
      if (tag.toLowerCase().startsWith('h') && tag.length === 2) {
        const level = parseInt(tag.charAt(1));
        if (level >= 1 && level <= 6) {
          locator = this.page.getByRole('heading', { name: text, level });
        } else {
          locator = this.page
            .getByText(text, { exact: false })
            .filter({ has: this.page.locator(tag) })
            .first();
        }
      } else {
        // For other tags, use getByText() and filter by tag
        locator = this.page
          .getByText(text, { exact: false })
          .filter({ has: this.page.locator(tag) })
          .first();
      }
      await this.verifier.waitUntilElementIsVisible(locator, { timeout: 10000 });
    });
  }

  async scrollAndClickOnSave(): Promise<void> {
    await test.step('Scroll and click on Save button', async () => {
      // Wait for page to finish loading first (progressbar to disappear)
      await this.waitForPageToLoad();
      // Then wait for Save button to be visible
      await this.saveButton.waitFor({ state: 'visible', timeout: 15000 });
      // Then scroll it into view
      await this.saveButton.scrollIntoViewIfNeeded();
      // Wait for Save button to become enabled (form recognizes changes)
      await this.verifier.verifyTheElementIsEnabled(this.saveButton, { timeout: 15000 });
      await this.clickOnElement(this.saveButton, {
        stepInfo: 'Click on Save button',
      });
    });
  }

  async getAppConfigViaAPI(apiContext: APIRequestContext, baseUrl: string): Promise<any> {
    return await test.step('Call AppConfig API', async () => {
      const feedManagementService = new FeedManagementService(apiContext, baseUrl);
      const appConfig = await feedManagementService.getAppConfig();
      return appConfig;
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

  async verifyTheAbsenceOfFieldWithHtmlTagAndText(tag: string, text: string): Promise<void> {
    await test.step(`Verify absence of ${tag} element with text "${text}"`, async () => {
      // Wait for page to finish loading first (progressbar to disappear)
      await this.waitForPageToLoad();
      let locator;
      // Use getByRole for headings (h1, h2, h3, etc.) as suggested by codegen
      if (tag.toLowerCase().startsWith('h') && tag.length === 2) {
        const level = parseInt(tag.charAt(1));
        if (level >= 1 && level <= 6) {
          locator = this.page.getByRole('heading', { name: text, level });
        } else {
          // Fallback: use locator with hasText for non-standard headings
          locator = this.page.locator(`${tag}:not(#app)`).filter({ hasText: text }).first();
        }
      } else {
        // For other tags, use locator with hasText which handles nested text better
        locator = this.page.locator(`${tag}:not(#app)`).filter({ hasText: text }).first();
      }
      // Verify the element is not visible
      await this.verifier.verifyTheElementIsNotVisible(locator, { timeout: 10000 });
    });
  }

  private async findHelpAndFeedbackInputField(): Promise<Locator> {
    return this.page.locator('#react-select-2-input');
  }

  async clearAllEmailIdsFromHelpAndFeedbackField(): Promise<boolean> {
    return await test.step('Clear all email id from Help & Feedback field', async () => {
      await this.waitForPageToLoad();
      // Find all Tag-remove buttons (these are the X buttons on email tags in React Select)
      const removeButtons = this.page.locator('.Tag-remove');
      let removeButtonCount = await removeButtons.count();
      let emailsWereCleared = removeButtonCount > 0;

      // Keep removing tags until all are gone (in case count changes dynamically)
      while (removeButtonCount > 0) {
        // Click the first remove button
        const removeButton = removeButtons.first();
        await this.verifier.waitUntilElementIsVisible(removeButton, { timeout: 5000 });
        await this.clickOnElement(removeButton, {
          stepInfo: `Remove email tag`,
        });
        // Wait for the tag to be removed and UI to update
        await this.page.waitForTimeout(500);
        // Re-check the count
        removeButtonCount = await removeButtons.count();
      }

      // Also clear the input field itself to ensure it's empty
      const inputField = await this.findHelpAndFeedbackInputField();
      const inputValue = await inputField.inputValue();
      if (inputValue) {
        emailsWereCleared = true;
      }
      await inputField.clear();
      await inputField.blur();

      // Wait for form to recognize the change
      await this.page.waitForTimeout(500);

      return emailsWereCleared;
    });
  }

  async enterTextInHelpAndFeedbackField(email: string): Promise<void> {
    await test.step(`Enter "${email}" in Help & Feedback input field`, async () => {
      await this.waitForPageToLoad();
      const inputField = this.page.locator('#react-select-2-input');
      await this.verifier.waitUntilElementIsVisible(inputField, { timeout: 10000 });
      // Click to focus and open the React Select
      await inputField.click();
      await this.page.waitForTimeout(300);
      // Fill the input field with the email
      await inputField.fill(email);
      await this.page.waitForTimeout(300);
      // Press Enter to confirm/add the email
      await inputField.press('Enter');
      await this.page.waitForTimeout(500);
      // Click on the email text that appears (the tag)
      const emailText = this.page.getByText(email).first();
      await this.verifier.waitUntilElementIsVisible(emailText, { timeout: 5000 });
      await this.clickOnElement(emailText, {
        stepInfo: `Click on email tag ${email}`,
      });
      // Wait for form to recognize the change
      await this.page.waitForTimeout(500);
    });
  }

  async verifyFeedbackRecipientsInAppConfig(
    apiContext: APIRequestContext,
    baseUrl: string,
    expectedEmail: string
  ): Promise<void> {
    await test.step(`Verify that feedbackRecipients in response of API appConfig is "${expectedEmail}"`, async () => {
      // Poll the API with retries to account for backend processing delay
      const maxRetries = 15;
      let lastError: Error | null = null;
      let actualFeedbackRecipients: string[] | null = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const appConfig = await this.getAppConfigViaAPI(apiContext, baseUrl);

          // Validate response structure
          if (!appConfig?.result) {
            throw new Error('API response missing result field');
          }

          const feedbackRecipients = appConfig.result.feedbackRecipients;

          // Validate feedbackRecipients is an array
          if (!Array.isArray(feedbackRecipients)) {
            throw new Error(`feedbackRecipients is not an array: ${typeof feedbackRecipients}`);
          }

          actualFeedbackRecipients = feedbackRecipients;

          // If expectedEmail is empty string, verify array is empty
          if (expectedEmail === '' && feedbackRecipients.length === 0) {
            return; // Success
          }

          // If expectedEmail is provided, verify it's in the array
          if (expectedEmail !== '' && feedbackRecipients.includes(expectedEmail)) {
            return; // Success
          }

          // If not found, prepare error message but continue retrying
          lastError = new Error(
            `Expected feedbackRecipients to ${expectedEmail === '' ? 'be empty' : `contain "${expectedEmail}"`} but got ${JSON.stringify(feedbackRecipients)}`
          );
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
        }

        // Exponential backoff: start with 500ms, increase gradually up to 2 seconds
        if (attempt < maxRetries - 1) {
          const delay = Math.min(500 + attempt * 200, 2000);
          await this.page.waitForTimeout(delay);
        }
      }

      // If we get here, all retries failed - provide detailed error message
      const errorMsg = lastError ? lastError.message : 'Unknown error';
      const recipientsMsg = actualFeedbackRecipients
        ? ` Last seen feedbackRecipients: ${JSON.stringify(actualFeedbackRecipients)}`
        : ' Could not retrieve feedbackRecipients from API.';

      throw new Error(
        `Failed to verify feedbackRecipients ${expectedEmail === '' ? 'is empty' : `contains "${expectedEmail}"`} after ${maxRetries} attempts. ` +
          `${errorMsg}${recipientsMsg} ` +
          `This may indicate the backend has not processed the change yet, or the API call failed.`
      );
    });
  }

  async verifyHelpAndFeedbackEmailsWorking(): Promise<void> {
    await test.step('Verify working of Help and Feedback emails under General in Setup in Manage Application', async () => {
      // Navigate to General setup page
      await this.navigateToGeneralSetupPage();

      // Wait for the presence of text "Intranet name" with tag "h2"
      await this.waitForPresenceOfTextWithTag('Intranet name', 'h2');

      // Scroll to element with html tag "h2" and text "Help & Feedback"
      await this.scrollToElementWithHtmlTagAndText('h2', 'Help & Feedback');

      // Clear all "email id" from "Help & Feedback" field
      const emailsWereCleared = await this.clearAllEmailIdsFromHelpAndFeedbackField();

      // Scroll and Click on "Save" field only if emails were cleared (form change detected)
      if (emailsWereCleared) {
        await this.scrollAndClickOnSave();
      }

      // Enter "zuluqa.automation@simpplr.com" in Help & Feedback input field
      await this.enterTextInHelpAndFeedbackField('zuluqa.automation@simpplr.com');

      // Scroll and Click on "Save" field
      await this.scrollAndClickOnSave();

      // Verify the display of message with text "Saved changes successfully"
      await this.verifyTheDisplayOfMessageWithText('Saved changes successfully');

      // Refresh the page
      await this.page.reload({ waitUntil: 'domcontentloaded' });

      // Wait for the presence of text "Intranet name" with tag "h2"
      await this.waitForPresenceOfTextWithTag('Intranet name', 'h2');

      // Scroll to element with html tag "h2" and text "Social campaigns"
      await this.scrollToElementWithHtmlTagAndText('h2', 'Social campaigns');

      // Wait a bit for the page to fully render after refresh
      await this.page.waitForTimeout(1000);

      // Verify the presence of field with html tag "button" and text "Help & feedback"
      // Use getByRole directly for buttons as it's more reliable
      const helpFeedbackButton = this.page.getByRole('button', { name: 'Help & feedback' });
      await this.verifier.waitUntilElementIsVisible(helpFeedbackButton, { timeout: 15000 });

      // API Login with any login identifiers for "ZuluApplicationManager" with URL "zulu_api_baseURI"
      const zuluApiUrl = process.env.ZULU_API_URL;
      if (!zuluApiUrl) {
        throw new Error('ZULU_API_URL not configured in environment variables');
      }

      const zuluAppManagerEmail = process.env.ZULU_APPLICATION_MANAGER;
      const zuluPassword = process.env.ZULU_PASSWORD;
      if (!zuluAppManagerEmail || !zuluPassword) {
        throw new Error('ZULU_APPLICATION_MANAGER or ZULU_PASSWORD not configured in environment variables');
      }

      const apiContext: APIRequestContext = await RequestContextFactory.createAuthenticatedContext(zuluApiUrl, {
        email: zuluAppManagerEmail,
        password: zuluPassword,
      });

      try {
        // Call Zeus AppConfig API
        await this.getAppConfigViaAPI(apiContext, zuluApiUrl);

        // Verify that in Zeus "feedbackRecipients" in response of API "appConfig" is "zuluqa.automation@simpplr.com"
        await this.verifyFeedbackRecipientsInAppConfig(apiContext, zuluApiUrl, 'zuluqa.automation@simpplr.com');

        // Clear all "email id" from "Help & Feedback" field
        const emailsWereClearedSecond = await this.clearAllEmailIdsFromHelpAndFeedbackField();

        // Scroll and Click on "Save" field only if emails were cleared (form change detected)
        if (emailsWereClearedSecond) {
          await this.scrollAndClickOnSave();
        }

        // Verify the display of message with text "Saved changes successfully"
        await this.verifyTheDisplayOfMessageWithText('Saved changes successfully');

        // Call Zeus AppConfig API first to ensure backend has processed the change
        await this.getAppConfigViaAPI(apiContext, zuluApiUrl);

        // Verify that in Zeus "feedbackRecipients" in response of API "appConfig" is ""
        // This ensures the backend has processed the change before checking UI
        await this.verifyFeedbackRecipientsInAppConfig(apiContext, zuluApiUrl, '');

        // Hard refresh the page to ensure UI reflects the backend changes
        await this.page.reload({ waitUntil: 'load' });

        // Wait for the presence of text "Intranet name" with tag "h2"
        await this.waitForPresenceOfTextWithTag('Intranet name', 'h2');

        // Scroll to element with html tag "h2" and text "Social campaigns"
        await this.scrollToElementWithHtmlTagAndText('h2', 'Social campaigns');

        // Wait a bit for the page to fully render after refresh
        await this.page.waitForTimeout(1000);

        // Verify the absence of field with html tag "button" and text "Help & feedback"
        // Use getByRole directly for buttons as it's more reliable
        const helpFeedbackButton = this.page.getByRole('button', { name: 'Help & feedback' });
        await this.verifier.verifyTheElementIsNotVisible(helpFeedbackButton, { timeout: 10000 });
      } finally {
        await apiContext.dispose();
      }
    });
  }

  async clickOnHelpAndFeedbackSectionInFooter(): Promise<void> {
    await test.step('Click on "Help & feedback" section in footer', async () => {
      await this.waitForPageToLoad();
      const helpFeedbackButton = this.page.getByRole('button', { name: 'Help & feedback' });
      await this.verifier.waitUntilElementIsVisible(helpFeedbackButton, { timeout: 15000 });
      await this.clickOnElement(helpFeedbackButton, {
        stepInfo: 'Click on Help & feedback button in footer',
      });
      // Wait for the modal/form to appear
      await this.page.waitForTimeout(1000);
    });
  }

  async clickOnDropdownForHelpTopicsAndSelectOption(option: string): Promise<void> {
    await test.step(`Click on dropdown for "helpTopics" and select "${option}" option`, async () => {
      await this.waitForPageToLoad();
      const selectInput = this.page.getByTestId('SelectInput');
      await this.verifier.waitUntilElementIsVisible(selectInput, { timeout: 10000 });
      await selectInput.selectOption(option);
      await this.page.waitForTimeout(500);
    });
  }

  async enterDescriptionLessThan(characterCount: number): Promise<void> {
    await test.step(`Enter description less than "${characterCount}" char`, async () => {
      await this.waitForPageToLoad();
      // Find the description textarea using getByRole
      const descriptionTextarea = this.page.getByRole('textbox', { name: 'Tell us more*' });
      await this.verifier.waitUntilElementIsVisible(descriptionTextarea, { timeout: 10000 });

      // Enter text less than the specified character count
      const shortText = 'a'.repeat(characterCount - 1);
      await descriptionTextarea.click();
      await descriptionTextarea.fill(shortText);
      await descriptionTextarea.blur();
      await this.page.waitForTimeout(500);
    });
  }

  async enterDescriptionOfHelpAndFeedback(description: string): Promise<void> {
    await test.step(`Enter description of help and feedback as "${description}"`, async () => {
      await this.waitForPageToLoad();
      // Find the description textarea using getByRole
      const descriptionTextarea = this.page.getByRole('textbox', { name: 'Tell us more*' });
      await this.verifier.waitUntilElementIsVisible(descriptionTextarea, { timeout: 10000 });

      await descriptionTextarea.click();
      await descriptionTextarea.fill(description);
      await descriptionTextarea.blur();
      await this.page.waitForTimeout(500);
    });
  }

  async checkImproveIntranetFieldCheckbox(): Promise<void> {
    await test.step('Check "improveIntranet" Field Checkbox', async () => {
      await this.waitForPageToLoad();
      // Use getByRole for the checkbox with the exact name
      const checkbox = this.page.getByRole('checkbox', { name: 'I want to help improve my' });
      await this.verifier.waitUntilElementIsVisible(checkbox, { timeout: 10000 });

      // Check if already checked
      const isChecked = await checkbox.isChecked();
      if (!isChecked) {
        await checkbox.check();
        await this.page.waitForTimeout(500);
      }
    });
  }

  async clickOnSendButton(): Promise<void> {
    await test.step('Click on element with tag "button" and text "Send"', async () => {
      await this.waitForPageToLoad();
      const sendButton = this.page.getByRole('button', { name: 'Send' });
      await this.verifier.waitUntilElementIsVisible(sendButton, { timeout: 10000 });
      await this.clickOnElement(sendButton, {
        stepInfo: 'Click on Send button',
      });
      await this.page.waitForTimeout(1000);
    });
  }

  async verifyThanksMessageDisplayed(): Promise<void> {
    await test.step('Verify the display of message with text "Thanks! Your message has been received and will be reviewed shortly."', async () => {
      await this.waitForPageToLoad();
      const thanksMessage = this.page.getByText('Thanks! Your message has been', { exact: false });
      await this.verifier.waitUntilElementIsVisible(thanksMessage, { timeout: 15000 });
    });
  }

  async verifyAdditionalCheckboxInHelpAndFeedbackWorking(): Promise<void> {
    await test.step('Verify the working of additional checkbox in Help and Feedback', async () => {
      // Navigate to General setup page
      await this.navigateToGeneralSetupPage();

      // Wait for the presence of text "Intranet name" with tag "h2"
      await this.waitForPresenceOfTextWithTag('Intranet name', 'h2');

      // Scroll to element with html tag "h2" and text "Help & Feedback"
      await this.scrollToElementWithHtmlTagAndText('h2', 'Help & Feedback');

      // Clear all "email id" from "Help & Feedback" field
      const emailsWereCleared = await this.clearAllEmailIdsFromHelpAndFeedbackField();

      // Scroll and Click on "Save" field only if emails were cleared (form change detected)
      if (emailsWereCleared) {
        await this.scrollAndClickOnSave();
      }

      // Enter "zuluqa.automation@simpplr.com" in Help & Feedback input field
      await this.enterTextInHelpAndFeedbackField('zuluqa.automation@simpplr.com');

      // Scroll and Click on "Save" field
      await this.scrollAndClickOnSave();

      // Wait for 5 second
      await this.page.waitForTimeout(5000);

      // Verify the display of message with text "Saved changes successfully"
      await this.verifyTheDisplayOfMessageWithText('Saved changes successfully');

      // Click on "Help & feedback" section in footer
      await this.clickOnHelpAndFeedbackSectionInFooter();

      // Click on dropdown for "helpTopics" and select "I want to give a suggestion" option
      await this.clickOnDropdownForHelpTopicsAndSelectOption('give_suggestion');

      // Enter description less than "10 char"
      await this.enterDescriptionLessThan(10);

      // Enter description of help and feedback as "suggest improvements for help and feedback"
      await this.enterDescriptionOfHelpAndFeedback('suggest improvements for help and feedback');

      // "Check" "improveIntranet" Field Checkbox
      await this.checkImproveIntranetFieldCheckbox();

      // Click on element with tag "button" and text "Send"
      await this.clickOnSendButton();

      // Verify the display of message with text "Thanks! Your message has been received and will be reviewed shortly."
      await this.verifyThanksMessageDisplayed();

      // API Login with any login identifiers for "ZuluApplicationManager" with URL "zulu_api_baseURI"
      const zuluApiUrl = process.env.ZULU_API_URL;
      if (!zuluApiUrl) {
        throw new Error('ZULU_API_URL not configured in environment variables');
      }

      const zuluAppManagerEmail = process.env.ZULU_APPLICATION_MANAGER;
      const zuluPassword = process.env.ZULU_PASSWORD;
      if (!zuluAppManagerEmail || !zuluPassword) {
        throw new Error('ZULU_APPLICATION_MANAGER or ZULU_PASSWORD not configured in environment variables');
      }

      const apiContext: APIRequestContext = await RequestContextFactory.createAuthenticatedContext(zuluApiUrl, {
        email: zuluAppManagerEmail,
        password: zuluPassword,
      });

      try {
        // Call Zeus AppConfig API
        await this.getAppConfigViaAPI(apiContext, zuluApiUrl);

        // Verify that in Zeus "feedbackRecipients" in response of API "appConfig" is "zuluqa.automation@simpplr.com"
        await this.verifyFeedbackRecipientsInAppConfig(apiContext, zuluApiUrl, 'zuluqa.automation@simpplr.com');

        // Clear all "email id" from "Help & Feedback" field
        const emailsWereClearedSecond = await this.clearAllEmailIdsFromHelpAndFeedbackField();

        // Scroll and Click on "Save" field only if emails were cleared (form change detected)
        if (emailsWereClearedSecond) {
          await this.scrollAndClickOnSave();
        }

        // Verify the display of message with text "Saved changes successfully"
        await this.verifyTheDisplayOfMessageWithText('Saved changes successfully');
      } finally {
        await apiContext.dispose();
      }
    });
  }
}
