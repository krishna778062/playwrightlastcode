import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

import { ManageAutomatedAwardPage } from './manageAutomatedAwardPage';

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

  /**
   * Verify automated award page elements (table headers and first row)
   */
  async verifyAutomatedAwardPageElements(): Promise<void> {
    await test.step('Validate UI elements in automated award page', async () => {
      const tabOptions = ['Award', 'Times awarded', 'Last awarded', 'Status', 'Created', 'Edited'];
      for (const tabOption of tabOptions) {
        await expect(this.tableGridHeaderByText(tabOption)).toBeVisible({
          timeout: TIMEOUTS.MEDIUM,
        });
      }
      await expect(this.tableGridFirstRow.nth(0)).toHaveText(/Work anniversary/);
      // Note: getThreeDotsButton is accessed via manageRecognitionPage.automatedAwards
    });
  }

  /**
   * Verify and deactivate automated award
   * @param manageRecognitionPage - ManageAutomatedAwardPage instance
   * @param automatedAwardMsgs - Messages object for assertions
   */
  async verifyAndDeactivateAward(
    manageRecognitionPage: ManageAutomatedAwardPage,
    automatedAwardMsgs: {
      deactivateAwardTitle: string;
      deactivateAwardConfirmationMsg: string;
      deactivateAwardWarningMsg: string;
    }
  ): Promise<void> {
    await test.step('Validate user is able to deactivate automated award', async () => {
      // Activating the award if inactive, first
      const statusText = await this.tableGridFirstRow.nth(3).textContent();
      if (statusText?.trim() === 'Inactive') {
        await manageRecognitionPage.automatedAwards.getThreeDotsButton(0).click();
        await this.pause(500);
        await manageRecognitionPage.automatedAwards.activeMenuItem.click();
        await this.pause(500);
        await expect(this.tableGridFirstRow.nth(3)).toHaveText(/Active/);
      }

      await manageRecognitionPage.automatedAwards.getThreeDotsButton(0).click();
      await expect(manageRecognitionPage.automatedAwards.deactivateMenuItem).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await manageRecognitionPage.automatedAwards.deactivateMenuItem.click();

      // Check texts on deactivate modal
      const dialog = await this.deactivateAwardContainer.textContent();
      expect(dialog).toContain(automatedAwardMsgs.deactivateAwardTitle);
      expect(dialog).toContain(automatedAwardMsgs.deactivateAwardConfirmationMsg);
      expect(dialog).toContain(automatedAwardMsgs.deactivateAwardWarningMsg);

      await expect(this.automatedAwardCancelButton).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(this.automatedAwardDeactivateButton).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await this.automatedAwardDeactivateButton.click();
      await expect(this.tableGridFirstRow.nth(3)).toHaveText(/Inactive/);
    });
  }

  /**
   * Verify menu items for the Work Anniversary default award
   * @param manageRecognitionPage - ManageAutomatedAwardPage instance
   */
  async verifyMenuItemsForWorkAnniversaryAward(manageRecognitionPage: ManageAutomatedAwardPage): Promise<void> {
    await test.step('Verify menu items for the Work Anniversary default award', async () => {
      await manageRecognitionPage.automatedAwards.getThreeDotsButton(0).click();
      await expect(manageRecognitionPage.automatedAwards.editMenuItem).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await expect(manageRecognitionPage.automatedAwards.activeMenuItem).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
      await manageRecognitionPage.automatedAwards.editMenuItem.click();
      await expect(this.editMilestoneTitle).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Activate award from listing page
   * @param manageRecognitionPage - ManageAutomatedAwardPage instance
   */
  async activateAwardFromListingPage(manageRecognitionPage: ManageAutomatedAwardPage): Promise<void> {
    await test.step('Validate user is able to activate automated award from award listing page', async () => {
      await manageRecognitionPage.automatedAwards.getThreeDotsButton(0).click();
      await this.pause(5000);
      await manageRecognitionPage.automatedAwards.activeMenuItem.click();
      await this.pause(500);
      await expect(this.tableGridFirstRow.nth(3)).toHaveText(/Active/);
    });
  }

  /**
   * Inactivate the award if active (for test setup)
   * @param manageRecognitionPage - ManageAutomatedAwardPage instance
   */
  async inactivateAwardIfActive(manageRecognitionPage: ManageAutomatedAwardPage): Promise<void> {
    await test.step('Inactivate the award if active', async () => {
      const statusText = await this.tableGridFirstRow.nth(3).textContent();
      if (statusText?.trim() === 'Active') {
        await manageRecognitionPage.automatedAwards.getThreeDotsButton(0).click();
        await this.pause(500);
        await manageRecognitionPage.automatedAwards.deactivateMenuItem.click();
        await this.pause(500);
        await this.automatedAwardDeactivateButton.click();
        await expect(this.tableGridFirstRow.nth(3)).toHaveText(/Inactive/);
      }
    });
  }
}
