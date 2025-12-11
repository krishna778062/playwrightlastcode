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
    this.addCompanyValueButton = page.getByRole('button', { name: 'Add company value' }).first();
    this.companyValueList = page.locator('table, div[class*="CompanyValue"]');

    // Form elements
    this.valueInput = page.locator('input[name="name"]');
    this.descriptionTextarea = page.locator('textarea#description');
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

    // Company value item elements
    this.companyValueItem = (companyValue: string) => page.locator(`h2:has-text("${companyValue}")`);
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
        const zuluUrl = process.env.ZULU_URL;
        const currentUrl = this.page.url();

        if (zuluUrl && currentUrl.includes('zulu')) {
          const fullUrl = `${zuluUrl}${this.pageUrl}`;
          await this.goToUrl(fullUrl, {
            waitUntil: 'load',
            timeout: options?.timeout,
          });
        } else {
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
      await this.page
        .locator('[role="dialog"]')
        .waitFor({ state: 'hidden', timeout: TIMEOUTS.MEDIUM })
        .catch(() => {});
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
      await this.page
        .locator('[role="dialog"]')
        .waitFor({ state: 'hidden', timeout: TIMEOUTS.MEDIUM })
        .catch(() => {});
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
      const dialog = this.page.locator('[role="dialog"]');
      const dialogCount = await dialog.count();

      if (dialogCount > 0) {
        const dialogHeading = dialog.locator('h1:has-text("company value")');
        const headingCount = await dialogHeading.count();
        if (headingCount > 0) {
          await dialogHeading.click();
        }

        await this.page.waitForTimeout(500);

        const addButton = dialog.getByRole('button', { name: 'Add' });
        const updateButton = dialog.getByRole('button', { name: 'Update' });
        const addButtonCount = await addButton.count();
        const updateButtonCount = await updateButton.count();

        if (addButtonCount > 0) {
          const isDisabled = await addButton.isDisabled().catch(() => true);
          if (!isDisabled) {
            await addButton.click({ force: true, timeout: 1000 }).catch(() => {});
            await this.page.waitForTimeout(300);
          }
        } else if (updateButtonCount > 0) {
          const isDisabled = await updateButton.isDisabled().catch(() => true);
          if (!isDisabled) {
            await updateButton.click({ force: true, timeout: 1000 }).catch(() => {});
            await this.page.waitForTimeout(300);
          }
        }

        const fieldErrorLocator = dialog
          .locator('div[class*="Field-module__error"]')
          .getByText(errorText, { exact: false });
        const paragraphErrorLocator = dialog.locator(`p:has-text("${errorText}")`);
        const alertErrorLocator = dialog.locator(`[role="alert"]:has-text("${errorText}")`);
        const anyTextErrorLocator = dialog.getByText(errorText, { exact: false });

        const paragraphErrorCount = await paragraphErrorLocator.count();
        if (paragraphErrorCount > 0) {
          await this.verifier.verifyTheElementIsVisible(paragraphErrorLocator.first(), { timeout: TIMEOUTS.MEDIUM });
          return;
        }

        const fieldErrorCount = await fieldErrorLocator.count();
        if (fieldErrorCount > 0) {
          await this.verifier.verifyTheElementIsVisible(fieldErrorLocator.first(), { timeout: TIMEOUTS.MEDIUM });
          return;
        }

        const alertErrorCount = await alertErrorLocator.count();
        if (alertErrorCount > 0) {
          await this.verifier.verifyTheElementIsVisible(alertErrorLocator.first(), { timeout: TIMEOUTS.MEDIUM });
          return;
        }

        const anyTextErrorCount = await anyTextErrorLocator.count();
        if (anyTextErrorCount > 0) {
          await this.verifier.verifyTheElementIsVisible(anyTextErrorLocator.first(), { timeout: TIMEOUTS.MEDIUM });
          return;
        }
      }

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
      await this.scrollToCompanyValue(companyValue);
      const companyValueLocator = this.companyValueItem(companyValue);
      await this.verifier.verifyTheElementIsVisible(companyValueLocator, { timeout: TIMEOUTS.MEDIUM });

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

      try {
        await companyValueLocator.waitFor({ state: 'visible', timeout: TIMEOUTS.SHORT });
        await companyValueLocator.scrollIntoViewIfNeeded();
        return;
      } catch {
        // Continue with scrolling logic
      }

      let found = false;
      let attempts = 0;
      const maxAttempts = 15;

      while (!found && attempts < maxAttempts) {
        const count = await companyValueLocator.count();
        if (count > 0) {
          try {
            await companyValueLocator.waitFor({ state: 'visible', timeout: TIMEOUTS.SHORT });
            found = true;
            await companyValueLocator.scrollIntoViewIfNeeded();
            break;
          } catch {
            // Continue
          }
        }

        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await this.page.waitForTimeout(300);

        let paginationButtonClicked = false;
        try {
          const allShowMoreButtons = this.page.locator('button').filter({ hasText: 'Show more' });
          const buttonCount = await allShowMoreButtons.count();

          if (buttonCount > 0) {
            for (let i = 0; i < buttonCount; i++) {
              const button = allShowMoreButtons.nth(i);
              const ariaLabel = await button.getAttribute('aria-label');
              if (!ariaLabel?.includes('options for')) {
                await button.click();
                paginationButtonClicked = true;
                await companyValueLocator.waitFor({ state: 'visible', timeout: TIMEOUTS.SHORT }).catch(() => {});
                break;
              }
            }
          }
        } catch {
          // Continue
        }

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

      await this.page.waitForTimeout(500);

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
      await this.page
        .locator('[role="dialog"]')
        .waitFor({ state: 'hidden', timeout: TIMEOUTS.MEDIUM })
        .catch(() => {});
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
      await this.valueInput.clear();
      await this.enterCompanyValue(newValue);
      await this.descriptionTextarea.clear();
      await this.enterCompanyValueDescription(newDescription);
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
