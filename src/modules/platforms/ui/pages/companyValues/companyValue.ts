import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';

/**
 * Company Values Page Object Model
 *
 * Handles all interactions with the Company Values management page
 * including creating, editing, enabling/disabling, and verifying company values.
 */
export class CompanyValuePage extends BasePage {
  // Main page elements
  readonly addCompanyValueButton: Locator;
  readonly companyValueList: Locator;

  // Form elements
  readonly valueInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly addButton: Locator;
  readonly updateButton: Locator;
  readonly cancelButton: Locator;

  // Success/Error message elements
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  // Company value item elements
  readonly companyValueItem: (companyValue: string) => Locator;
  readonly threeDotsButton: (companyValue: string) => Locator;
  readonly editOption: Locator;
  readonly disableOption: Locator;
  readonly enableOption: Locator;

  // Modal elements
  readonly disableModal: Locator;
  readonly disableModalHeading: Locator;
  readonly disableModalBodyText: Locator;
  readonly confirmButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.COMPANY_VALUES_PAGE) {
    super(page, pageUrl);

    // Main page elements
    // There are 2 "Add company value" buttons - one in header, one in empty state. Use first() to target the main one.
    this.addCompanyValueButton = page.getByRole('button', { name: 'Add company value' }).first();
    this.companyValueList = page.locator('table, div[class*="CompanyValue"]');

    // Form elements - scoped to dialog
    this.valueInput = page.locator('input[name="name"]');
    this.descriptionTextarea = page.locator('textarea#description');
    // Add button is inside the dialog, scope it properly
    this.addButton = page.locator('[role="dialog"]').getByRole('button', { name: 'Add' });
    this.updateButton = page.locator('[role="dialog"]').getByRole('button', { name: 'Update' });
    this.cancelButton = page.locator('[role="dialog"]').getByRole('button', { name: 'Cancel' });

    // Success/Error message elements
    this.successMessage = page.locator(
      'p:has-text("Company value added successfully"), p:has-text("Company value updated successfully"), p:has-text("Company value disabled successfully"), p:has-text("Company value enabled successfully")'
    );
    this.errorMessage = page.locator(
      'p:has-text("Company value already exists"), p:has-text("Must not exceed 100 characters"), p:has-text("Must not exceed 500 characters"), p:has-text("Value is a required field")'
    );

    // Company value item elements - using dynamic locators
    // Based on: companyValue=//h2[contains(text(),'companyName')]
    this.companyValueItem = (companyValue: string) => page.locator(`h2:has-text("${companyValue}")`);
    // Based on: threeDots=//h2[contains(text(),'companyName')]//parent::td//following-sibling::td/button
    // Using XPath for complex parent/sibling navigation
    this.threeDotsButton = (companyValue: string) =>
      page.locator(`xpath=//h2[contains(text(),'${companyValue}')]//parent::td//following-sibling::td/button`).first();

    // Options menu
    this.editOption = page.locator('div:has-text("Edit")');
    this.disableOption = page.locator('div:has-text("Disable")');
    this.enableOption = page.locator('div:has-text("Enable")');

    // Modal elements
    this.disableModal = page.locator('[role="dialog"]');
    this.disableModalHeading = page.locator('h1:has-text("Disable company value")');
    this.disableModalBodyText = page.locator('p:has-text("Historical usage data")');
    this.confirmButton = page.getByRole('button', { name: 'Confirm' });
    this.closeButton = page.getByRole('button', { name: 'Close' }).or(page.locator('button[aria-label="Dismiss"]'));
  }

  /**
   * Verifies that the Company Values page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the Company Values page is loaded', async () => {
      await expect(this.addCompanyValueButton).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Override loadPage to use ZULU_URL if available (for Zulu tenant tests)
   * This ensures navigation uses the correct base URL after Zulu login
   */
  async loadPage(options?: { stepInfo?: string; timeout?: number }) {
    await test.step(options?.stepInfo || `Loading page ${this.pageUrl}`, async () => {
      if (this.pageUrl !== '') {
        // Check if we're using Zulu tenant (ZULU_URL is set)
        const zuluUrl = process.env.ZULU_URL;
        const currentUrl = this.page.url();

        // If ZULU_URL is set and we're already on Zulu domain, use Zulu URL for navigation
        if (zuluUrl && currentUrl.includes('zulu')) {
          const fullUrl = `${zuluUrl}${this.pageUrl}`;
          await this.goToUrl(fullUrl, {
            waitUntil: 'load',
            timeout: options?.timeout,
          });
        } else {
          // Use default behavior (baseURL from config)
          await this.goToUrl(this.pageUrl, {
            waitUntil: 'load',
            timeout: options?.timeout,
          });
        }
      } else {
        throw new Error('Page URL is not set for this page');
      }
      await this.verifyThePageIsLoaded();
    });
  }

  /**
   * Clicks on the "Add company value" button
   */
  async clickAddCompanyValueButton(): Promise<void> {
    await test.step('Click on Add company value button', async () => {
      await this.clickOnElement(this.addCompanyValueButton, {
        stepInfo: 'Click on Add company value button',
      });
    });
  }

  /**
   * Enters company value in the value field
   * @param value - The company value to enter
   */
  async enterCompanyValue(value: string): Promise<void> {
    await test.step(`Enter company value: ${value}`, async () => {
      // Clear the field first, then fill it (fill() should clear, but being explicit)
      await this.valueInput.click();
      await this.valueInput.selectText();
      await this.fillInElement(this.valueInput, value, {
        stepInfo: `Enter company value: ${value}`,
      });
    });
  }

  /**
   * Enters company value description in the description field
   * @param description - The description to enter
   */
  async enterCompanyValueDescription(description: string): Promise<void> {
    await test.step(`Enter company value description: ${description}`, async () => {
      await this.fillInElement(this.descriptionTextarea, description, {
        stepInfo: `Enter company value description`,
      });
    });
  }

  /**
   * Clicks on the Add button to submit the form
   */
  async clickAddButton(): Promise<void> {
    await test.step('Click on Add button', async () => {
      await this.clickOnElement(this.addButton, {
        stepInfo: 'Click on Add button',
      });
      // Wait for dialog to close instead of networkidle (more reliable)
      await this.page
        .locator('[role="dialog"]')
        .waitFor({ state: 'hidden', timeout: TIMEOUTS.MEDIUM })
        .catch(() => {
          // Dialog might already be closed, continue
        });
    });
  }

  /**
   * Clicks on the Update button to submit the form
   */
  async clickUpdateButton(): Promise<void> {
    await test.step('Click on Update button', async () => {
      await this.clickOnElement(this.updateButton, {
        stepInfo: 'Click on Update button',
      });
      // Wait for dialog to close instead of networkidle (more reliable)
      await this.page
        .locator('[role="dialog"]')
        .waitFor({ state: 'hidden', timeout: TIMEOUTS.MEDIUM })
        .catch(() => {
          // Dialog might already be closed, continue
        });
    });
  }

  /**
   * Verifies that a success message with the given text is displayed
   * @param messageText - The expected message text
   */
  async verifySuccessMessage(messageText: string): Promise<void> {
    await test.step(`Verify success message: ${messageText}`, async () => {
      const messageLocator = this.page.locator(`p:has-text("${messageText}")`);
      await this.verifier.verifyTheElementIsVisible(messageLocator);
    });
  }

  /**
   * Verifies that an error message with the given text is displayed
   * @param errorText - The expected error text
   */
  async verifyErrorMessage(errorText: string): Promise<void> {
    await test.step(`Verify error message: ${errorText}`, async () => {
      // Error messages can appear in:
      // 1. Dialog form validation (inline field errors, p tags, or role="alert")
      // 2. Toast notifications (after form submission)

      // Check if dialog is open
      const dialog = this.page.locator('[role="dialog"]');
      const dialogCount = await dialog.count();

      if (dialogCount > 0) {
        // Click on the heading first to ensure form is visible (matches Java implementation)
        const dialogHeading = dialog.locator('h1:has-text("company value")');
        const headingCount = await dialogHeading.count();
        if (headingCount > 0) {
          await dialogHeading.click();
        }

        // Wait a moment for validation errors to appear after field interaction
        await this.page.waitForTimeout(500);

        // Try to trigger validation by attempting to click the submit button (if enabled)
        // This helps trigger validation in some forms
        const addButton = dialog.getByRole('button', { name: 'Add' });
        const updateButton = dialog.getByRole('button', { name: 'Update' });
        const addButtonCount = await addButton.count();
        const updateButtonCount = await updateButton.count();

        if (addButtonCount > 0) {
          const isDisabled = await addButton.isDisabled().catch(() => true);
          if (!isDisabled) {
            // Try clicking to trigger validation, but don't wait for it to complete
            await addButton.click({ force: true, timeout: 1000 }).catch(() => {});
            await this.page.waitForTimeout(300);
          }
        } else if (updateButtonCount > 0) {
          const isDisabled = await updateButton.isDisabled().catch(() => true);
          if (!isDisabled) {
            // Try clicking to trigger validation, but don't wait for it to complete
            await updateButton.click({ force: true, timeout: 1000 }).catch(() => {});
            await this.page.waitForTimeout(300);
          }
        }

        // Look for error in dialog - errors can be in:
        // - Field error containers (div[class*="Field-module__error"] p)
        // - Paragraph tags with the error text (matches Java XPath: //p[contains(text(),"value")])
        // - Elements with role="alert"
        // - Any text element containing the error
        const fieldErrorLocator = dialog
          .locator('div[class*="Field-module__error"]')
          .getByText(errorText, { exact: false });
        const paragraphErrorLocator = dialog.locator(`p:has-text("${errorText}")`);
        const alertErrorLocator = dialog.locator(`[role="alert"]:has-text("${errorText}")`);
        const anyTextErrorLocator = dialog.getByText(errorText, { exact: false });

        // Try paragraph error first (matches Java implementation: //p[contains(text(),"value")])
        const paragraphErrorCount = await paragraphErrorLocator.count();
        if (paragraphErrorCount > 0) {
          await this.verifier.verifyTheElementIsVisible(paragraphErrorLocator.first(), { timeout: TIMEOUTS.MEDIUM });
          return;
        }

        // Try field error (most common for form validation)
        const fieldErrorCount = await fieldErrorLocator.count();
        if (fieldErrorCount > 0) {
          await this.verifier.verifyTheElementIsVisible(fieldErrorLocator.first(), { timeout: TIMEOUTS.MEDIUM });
          return;
        }

        // Try alert role
        const alertErrorCount = await alertErrorLocator.count();
        if (alertErrorCount > 0) {
          await this.verifier.verifyTheElementIsVisible(alertErrorLocator.first(), { timeout: TIMEOUTS.MEDIUM });
          return;
        }

        // Try any text element in dialog
        const anyTextErrorCount = await anyTextErrorLocator.count();
        if (anyTextErrorCount > 0) {
          await this.verifier.verifyTheElementIsVisible(anyTextErrorLocator.first(), { timeout: TIMEOUTS.MEDIUM });
          return;
        }
      }

      // If not in dialog, check toast notifications
      // Wait a moment for toast to appear (especially if dialog just closed)
      await this.page.waitForTimeout(500);
      const toastErrorLocator = this.page.getByText(errorText, { exact: false }).first();
      await this.verifier.verifyTheElementIsVisible(toastErrorLocator, { timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Verifies the presence of a company value field with the given name
   * @param companyValue - The company value name to verify
   */
  async verifyPresenceOfCompanyValueField(companyValue: string): Promise<void> {
    await test.step(`Verify presence of company value: ${companyValue}`, async () => {
      await this.scrollToCompanyValue(companyValue);
      const companyValueLocator = this.companyValueItem(companyValue);
      await this.verifier.verifyTheElementIsVisible(companyValueLocator);
    });
  }

  /**
   * Verifies the presence of a company value description
   * @param description - The description text to verify
   * @param companyValue - The company value name to scope the search
   */
  async verifyPresenceOfCompanyValueDescription(description: string, companyValue: string): Promise<void> {
    await test.step(`Verify presence of company value description`, async () => {
      // Scope description search to the company value item for faster, more accurate lookup
      const companyValueItem = this.companyValueItem(companyValue);
      const descriptionLocator = companyValueItem.locator('..').locator(`:has-text("${description}")`).first();
      await this.verifier.verifyTheElementIsVisible(descriptionLocator, { timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Verifies the presence of a company value field with description
   * @param companyValue - The company value name
   * @param description - The description text
   */
  async verifyPresenceOfCompanyValueWithDescription(companyValue: string, description: string): Promise<void> {
    await test.step(`Verify presence of company value ${companyValue} with description`, async () => {
      // Scroll first, then verify both in one pass for efficiency
      await this.scrollToCompanyValue(companyValue);
      const companyValueLocator = this.companyValueItem(companyValue);
      await this.verifier.verifyTheElementIsVisible(companyValueLocator, { timeout: TIMEOUTS.MEDIUM });

      // Scope description to company value item for faster lookup
      const descriptionLocator = companyValueLocator.locator('..').locator(`:has-text("${description}")`).first();
      await this.verifier.verifyTheElementIsVisible(descriptionLocator, { timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Scrolls to a specific company value in the list
   * @param companyValue - The company value name to scroll to
   */
  async scrollToCompanyValue(companyValue: string): Promise<void> {
    await test.step(`Scroll to company value: ${companyValue}`, async () => {
      const companyValueLocator = this.companyValueItem(companyValue);

      // First, try to wait for the element to be visible with a reasonable timeout
      // This ensures the element exists before we start scrolling
      try {
        await companyValueLocator.waitFor({ state: 'visible', timeout: TIMEOUTS.SHORT });
        // If found, scroll to it and return
        await companyValueLocator.scrollIntoViewIfNeeded();
        return;
      } catch {
        // If not immediately visible, proceed with scrolling and pagination logic
      }

      let found = false;
      let attempts = 0;
      const maxAttempts = 15; // Increased from 10 to 15 for more robustness

      while (!found && attempts < maxAttempts) {
        // Check if element is visible first
        const count = await companyValueLocator.count();
        if (count > 0) {
          // Wait for it to be visible before scrolling
          try {
            await companyValueLocator.waitFor({ state: 'visible', timeout: TIMEOUTS.SHORT });
            found = true;
            await companyValueLocator.scrollIntoViewIfNeeded();
            break;
          } catch {
            // Element exists but not visible yet, continue
          }
        }

        // Scroll down and check for "Show more" pagination button
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        // Use waitForTimeout with shorter delay or wait for specific element instead
        await this.page.waitForTimeout(300); // Reduced from 1000ms to 300ms

        // Look for pagination "Show more" button - exclude three-dots menu buttons (they have "options for" in aria-label)
        // The three-dots buttons have aria-label like "Show more options for [CompanyValue] value"
        // The pagination button should have just "Show more" or no aria-label, or be outside the data grid
        let paginationButtonClicked = false;
        try {
          // Try to find a pagination button that's not a three-dots menu
          // Look for buttons with "Show more" text but exclude those with "options for" in aria-label
          const allShowMoreButtons = this.page.locator('button').filter({ hasText: 'Show more' });
          const buttonCount = await allShowMoreButtons.count();

          if (buttonCount > 0) {
            // Find the pagination button (not a three-dots menu button)
            for (let i = 0; i < buttonCount; i++) {
              const button = allShowMoreButtons.nth(i);
              const ariaLabel = await button.getAttribute('aria-label');
              // If no aria-label or doesn't contain "options for", it's likely the pagination button
              if (!ariaLabel?.includes('options for')) {
                await button.click();
                paginationButtonClicked = true;
                // Wait for content to load instead of networkidle (faster)
                await companyValueLocator.waitFor({ state: 'visible', timeout: TIMEOUTS.SHORT }).catch(() => {
                  // Continue if not found yet
                });
                break;
              }
            }
            // If we didn't find a pagination button, it means all "Show more" buttons are three-dots menus
            // In this case, the company value might not be on the page, or we need to scroll more
          }
        } catch {
          // If there's an error finding/clicking the button, continue with the loop
          // This handles cases where the button structure is different
        }

        // If no pagination button was clicked, check again if company value is visible after scrolling
        if (!paginationButtonClicked) {
          const countAfterScroll = await companyValueLocator.count();
          if (countAfterScroll > 0) {
            found = true;
            await companyValueLocator.scrollIntoViewIfNeeded();
            break;
          }
        }

        attempts++;
      }

      if (!found) {
        throw new Error(`Company value "${companyValue}" not found after ${maxAttempts} attempts`);
      }

      // At this point, found is true, so we can safely scroll
      await companyValueLocator.scrollIntoViewIfNeeded();
    });
  }

  /**
   * Hovers over the three dots menu for a company value and clicks on an option
   * @param option - The option to click (Edit, Disable, Enable)
   * @param companyValue - The company value name
   */
  async hoverAndClickThreeDotsOption(option: string, companyValue: string): Promise<void> {
    await test.step(`Hover and click ${option} option for company value: ${companyValue}`, async () => {
      await this.scrollToCompanyValue(companyValue);
      const threeDots = this.threeDotsButton(companyValue);
      await this.clickOnElement(threeDots, {
        stepInfo: `Click on three dots for ${companyValue}`,
      });

      // Wait for the menu to appear
      await this.page.waitForTimeout(500);

      // Use getByRole('menuitem') for better reliability - it targets the actual menu item
      const optionLocator = this.page.getByRole('menuitem', { name: option, exact: true });
      await this.clickOnElement(optionLocator, {
        stepInfo: `Click on ${option} option`,
      });
    });
  }

  /**
   * Verifies that a pop-up appears with the given heading
   * @param heading - The expected heading text
   */
  async verifyPopUpWithHeading(heading: string): Promise<void> {
    await test.step(`Verify pop-up with heading: ${heading}`, async () => {
      const headingLocator = this.page.locator(`[role="dialog"] h1:has-text("${heading}")`);
      await this.verifier.verifyTheElementIsVisible(headingLocator, { timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Verifies the disable modal with heading and body text
   * @param heading - The expected heading text
   * @param bodyTexts - Array of expected body text strings
   */
  async verifyDisableModal(heading: string, bodyTexts: string[]): Promise<void> {
    await test.step(`Verify disable modal with heading: ${heading}`, async () => {
      await this.verifyPopUpWithHeading(heading);
      const dialog = this.page.locator('[role="dialog"]');
      for (const bodyText of bodyTexts) {
        // Use getByText with exact: false for partial matching, and scope to dialog
        const bodyLocator = dialog.getByText(bodyText, { exact: false }).first();
        await this.verifier.verifyTheElementIsVisible(bodyLocator, { timeout: TIMEOUTS.MEDIUM });
      }
    });
  }

  /**
   * Verifies presence of buttons in the modal
   * @param buttonNames - Array of button names to verify
   */
  async verifyModalButtons(buttonNames: string[]): Promise<void> {
    await test.step(`Verify presence of modal buttons: ${buttonNames.join(', ')}`, async () => {
      const dialog = this.page.locator('[role="dialog"]');
      for (const buttonName of buttonNames) {
        if (buttonName === 'Close') {
          // Close button can be either "Close" or "Dismiss" aria-label
          const closeButton = dialog
            .getByRole('button', { name: 'Close' })
            .or(dialog.locator('button[aria-label="Dismiss"]'))
            .first();
          await this.verifier.verifyTheElementIsVisible(closeButton, { timeout: TIMEOUTS.MEDIUM });
        } else {
          const buttonLocator = dialog.getByRole('button', { name: buttonName });
          await this.verifier.verifyTheElementIsVisible(buttonLocator, { timeout: TIMEOUTS.MEDIUM });
        }
      }
    });
  }

  /**
   * Clicks on the Confirm button in the modal
   */
  async clickConfirmButton(): Promise<void> {
    await test.step('Click on Confirm button', async () => {
      await this.clickOnElement(this.confirmButton, {
        stepInfo: 'Click on Confirm button',
      });
      // Wait for modal to close
      await this.page
        .locator('[role="dialog"]')
        .waitFor({ state: 'hidden', timeout: TIMEOUTS.MEDIUM })
        .catch(() => {
          // Modal might already be closed
        });
    });
  }

  /**
   * Updates an existing company value
   * @param companyValue - The company value name to update
   * @param newValue - The new company value name
   * @param newDescription - The new description
   */
  async updateCompanyValue(companyValue: string, newValue: string, newDescription: string): Promise<void> {
    await test.step(`Update company value: ${companyValue}`, async () => {
      await this.hoverAndClickThreeDotsOption('Edit', companyValue);
      // Clear the field first, then enter new value to ensure the form recognizes the change
      await this.valueInput.clear();
      await this.enterCompanyValue(newValue);
      await this.descriptionTextarea.clear();
      await this.enterCompanyValueDescription(newDescription);
      // Wait a moment for the form to validate and enable the Update button
      await this.page.waitForTimeout(500);
      await this.clickUpdateButton();
    });
  }

  /**
   * Verifies the presence of text on the page
   * @param text - The text to verify
   */
  async verifyPresenceOfText(text: string): Promise<void> {
    await test.step(`Verify presence of text: ${text}`, async () => {
      const textLocator = this.page.locator(`p:has-text("${text}")`);
      await this.verifier.verifyTheElementIsVisible(textLocator);
    });
  }

  /**
   * Verifies the presence of buttons with given names
   * @param buttonNames - Array of button names to verify
   */
  async verifyPresenceOfButtons(buttonNames: string[]): Promise<void> {
    await test.step(`Verify presence of buttons: ${buttonNames.join(', ')}`, async () => {
      for (const buttonName of buttonNames) {
        const buttonLocator = this.page.getByRole('button', { name: buttonName });
        await this.verifier.verifyTheElementIsVisible(buttonLocator);
      }
    });
  }

  /**
   * Verifies that an option is not present in the three dots menu
   * @param option - The option to verify absence of
   * @param companyValue - The company value name
   */
  async verifyOptionNotPresent(option: string, companyValue: string): Promise<void> {
    await test.step(`Verify ${option} option is not present for ${companyValue}`, async () => {
      await this.scrollToCompanyValue(companyValue);
      const threeDots = this.threeDotsButton(companyValue);
      await this.clickOnElement(threeDots, {
        stepInfo: `Click on three dots for ${companyValue}`,
      });

      await this.page.waitForTimeout(500);

      // Use getByRole('menuitem') to check if option is present in the menu
      const optionLocator = this.page.getByRole('menuitem', { name: option, exact: true });
      await this.verifier.verifyTheElementIsNotVisible(optionLocator);
    });
  }

  /**
   * Clicks on the value field (used for validation testing)
   */
  async clickValueField(): Promise<void> {
    await test.step('Click on value field', async () => {
      await this.clickOnElement(this.valueInput, {
        stepInfo: 'Click on value field',
      });
    });
  }

  /**
   * Clicks on the description field (used for validation testing)
   */
  async clickDescriptionField(): Promise<void> {
    await test.step('Click on description field', async () => {
      await this.clickOnElement(this.descriptionTextarea, {
        stepInfo: 'Click on description field',
      });
    });
  }

  /**
   * Creates a company value with the given name and description
   * @param value - The company value name
   * @param description - The company value description
   */
  async createCompanyValue(value: string, description: string): Promise<void> {
    await test.step(`Create company value: ${value}`, async () => {
      await this.clickAddCompanyValueButton();
      await this.enterCompanyValue(value);
      await this.enterCompanyValueDescription(description);
      await this.clickAddButton();
    });
  }
}
