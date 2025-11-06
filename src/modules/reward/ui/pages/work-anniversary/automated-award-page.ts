import { Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';

export class AutomatedAwardPage extends BasePage {
  readonly tableGridFirstRow: Locator;
  readonly deactivateAwardContainer: Locator;
  readonly editMilestoneTitle: Locator;
  readonly automatedAwardCancelButton: Locator;
  readonly automatedAwardDeactivateButton: Locator;
  readonly automatedAwardSaveButton: Locator;
  automatedAwardAddButton: Locator;
  altTextIcon: Locator;
  addButton: Locator;
  addAltTextBox: Locator;
  updateButton: Locator;

  /**
   * This class represents automated award page in manage Recognition
   * @param page - The Playwright page object
   */
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);

    this.tableGridFirstRow = page.locator('[data-testid*="dataGridRow"] td p');
    this.deactivateAwardContainer = page.getByRole('dialog');
    this.editMilestoneTitle = page.getByRole('heading', { name: 'Edit milestone' });
    this.automatedAwardCancelButton = page.getByRole('button', { name: 'Cancel' });
    this.automatedAwardAddButton = page.getByRole('button', { name: 'Add' });
    this.automatedAwardDeactivateButton = page.getByRole('button', { name: 'Deactivate' });
    this.automatedAwardSaveButton = page.getByRole('button', { name: 'Save changes' });

    // Locators for the alt image section
    this.altTextIcon = this.page.getByRole('button', { name: 'Add image alt text' });
    this.addButton = this.page.getByRole('button', { name: 'Add' });
    this.addAltTextBox = this.page.locator('input#altText');
    this.updateButton = this.page.getByRole('button', { name: 'Update' });
  }

  /**
   * This method returns a locator for a table header button based on the given header text.
   * @param headerText - The exact text of the table header button to locate.
   * @returns - A Locator for the specified table header button element.
   */
  tableGridHeaderByText(headerText: string): Locator {
    return this.page.locator(`button[aria-label="${headerText}"]`);
  }

  /**
   * Pauses execution for a specified duration.
   * Useful for introducing intentional delays before actions like clicks or assertions.
   * @param delay - Duration to wait in milliseconds.
   */
  async pause(delay: number): Promise<void> {
    await this.page.waitForTimeout(delay);
  }

  /**
   * This method returns a locator for a button based on the given button text.
   * @param buttonText - The exact text of the button to locate.
   * @returns - A Locator for the specified button element.
   */
  getElementByText(buttonText: string) {
    return this.page.getByText(buttonText);
  }

  verifyThePageIsLoaded(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
